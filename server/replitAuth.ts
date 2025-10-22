import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  const pgStore = connectPg(session);
  // Allow controlling whether the sessions table is auto-created. Default: true
  const createTableIfMissing = process.env.CREATE_SESSIONS_TABLE !== 'false';
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  try {
    console.log(`🔁 Session store initialized (createTableIfMissing=${createTableIfMissing})`);
  } catch (err) {
    console.error('❌ Failed to initialize session store:', err);
  }
  
  return session({
    secret: process.env.SESSION_SECRET || 'temporary-secret-key-change-me',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // By default set secure cookies in production, but allow override for
      // environments behind a proxy/terminating TLS where the app receives
      // plain HTTP. Set SESSION_COOKIE_SECURE=false to disable secure flag.
      secure: process.env.SESSION_COOKIE_SECURE
        ? process.env.SESSION_COOKIE_SECURE === 'true'
        : process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy for username/password authentication
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      console.log(`🔐 Login attempt for identifier: ${username}`);

      // Try username first
      let user = await storage.getUserByUsername(username);

      // If not found, also try as email (common mistake)
      if (!user) {
        console.log(`ℹ️ User not found by username, trying email lookup for: ${username}`);
        user = await storage.getUserByEmail(username);
      }

      if (!user) {
        console.log(`❌ No user found matching identifier: ${username}`);
        return done(null, false, { message: "Invalid username or password" });
      }

      // Ensure password field exists
      if (!user.password) {
        console.log(`❌ User ${user.id} has no password set`);
        return done(null, false, { message: "Invalid username or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log(`❌ Invalid password for user ${user.id}`);
        return done(null, false, { message: "Invalid username or password" });
      }

      console.log(`✅ Authentication successful for user ${user.id}`);
      return done(null, user);
    } catch (error) {
      console.error('Authentication error:', error);
      return done(error);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Login route
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        // Debug: log session id and user for troubleshooting
        try { console.log(`🔐 User logged in: ${user.id}, sessionID=${(req.session as any)?.id || 'none'}`); } catch (e) {}
        return res.json({ user: { id: user.id, username: user.username, email: user.email, role: user.role } });
      });
    })(req, res, next);
  });

  // Register route
  app.post("/api/register", async (req, res) => {
    try {
      const { username, email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const newUser = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });

      // Auto-login after registration
      req.logIn(newUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        try { console.log(`🆕 User registered and logged in: ${newUser.id}, sessionID=${(req.session as any)?.id || 'none'}`); } catch (e) {}
        return res.status(201).json({ 
          user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role } 
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};