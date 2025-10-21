--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (165f042)
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid NOT NULL,
    vehicle_id uuid NOT NULL,
    scheduled_date timestamp without time zone NOT NULL,
    duration integer DEFAULT 60,
    service_type character varying(100) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'scheduled'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.appointments OWNER TO neondb_owner;

--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying,
    operation character varying(100) NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id character varying(255),
    old_values jsonb,
    new_values jsonb,
    ip_address character varying(45),
    user_agent text,
    status character varying(20) DEFAULT 'success'::character varying,
    error_message text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.audit_log OWNER TO neondb_owner;

--
-- Name: billing_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.billing_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    plan_name character varying(100),
    plan_price character varying(20),
    billing_cycle character varying(20),
    payment_method character varying(50),
    card_last4 character varying(4),
    card_expiry character varying(10),
    next_billing_date timestamp without time zone,
    auto_renew boolean DEFAULT true NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.billing_settings OWNER TO neondb_owner;

--
-- Name: business_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.business_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_name character varying(200),
    phone character varying(50),
    email character varying(100),
    website character varying(200),
    address text,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.business_settings OWNER TO neondb_owner;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid,
    customer_name character varying(200) NOT NULL,
    phone_number character varying(20) NOT NULL,
    last_message text,
    last_message_at timestamp without time zone,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    unread_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.conversations OWNER TO neondb_owner;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255),
    phone character varying(20),
    address text,
    city character varying(100),
    state character varying(50),
    zip_code character varying(10),
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.customers OWNER TO neondb_owner;

--
-- Name: inspections; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.inspections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid NOT NULL,
    vehicle_id uuid NOT NULL,
    vehicle_info text NOT NULL,
    customer_name character varying(200) NOT NULL,
    service_type character varying(100) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    checklist_items integer DEFAULT 12,
    completed_items integer DEFAULT 0,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    repair_order_id uuid
);


ALTER TABLE public.inspections OWNER TO neondb_owner;

--
-- Name: integration_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.integration_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    google_reviews_enabled boolean DEFAULT false NOT NULL,
    google_reviews_api_key text,
    stripe_enabled boolean DEFAULT false NOT NULL,
    stripe_api_key text,
    stripe_publishable_key text,
    twilio_enabled boolean DEFAULT false NOT NULL,
    twilio_account_sid text,
    twilio_auth_token text,
    twilio_phone_number character varying(20),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.integration_settings OWNER TO neondb_owner;

--
-- Name: inventory; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.inventory (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    part_number character varying(100) NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    category character varying(100) NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    min_stock integer DEFAULT 0 NOT NULL,
    unit_cost numeric(10,2) NOT NULL,
    selling_price numeric(10,2),
    supplier character varying(200),
    supplier_part_number character varying(100),
    location character varying(100),
    last_ordered timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.inventory OWNER TO neondb_owner;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_number character varying(50) NOT NULL,
    customer_id uuid NOT NULL,
    repair_order_id uuid,
    subtotal numeric(10,2) NOT NULL,
    tax numeric(10,2) DEFAULT '0'::numeric,
    total numeric(10,2) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    due_date timestamp without time zone,
    paid_at timestamp without time zone,
    payment_method character varying(50),
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.invoices OWNER TO neondb_owner;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    direction character varying(20) NOT NULL,
    content text NOT NULL,
    phone_from character varying(20) NOT NULL,
    phone_to character varying(20) NOT NULL,
    status character varying(20) DEFAULT 'sent'::character varying NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    twilio_sid character varying(100),
    sent_by character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.messages OWNER TO neondb_owner;

--
-- Name: notification_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notification_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email_notifications boolean DEFAULT true NOT NULL,
    sms_notifications boolean DEFAULT false NOT NULL,
    appointment_reminders boolean DEFAULT true NOT NULL,
    payment_notifications boolean DEFAULT true NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notification_settings OWNER TO neondb_owner;

--
-- Name: operating_hours; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.operating_hours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    day_of_week integer NOT NULL,
    is_open boolean DEFAULT true NOT NULL,
    open_time character varying(10),
    close_time character varying(10),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.operating_hours OWNER TO neondb_owner;

--
-- Name: repair_orders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.repair_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_number character varying(50) NOT NULL,
    customer_id uuid NOT NULL,
    vehicle_id uuid NOT NULL,
    appointment_id uuid,
    technician_id character varying,
    status character varying(20) DEFAULT 'created'::character varying,
    priority character varying(10) DEFAULT 'normal'::character varying,
    description text NOT NULL,
    diagnosis text,
    estimated_cost numeric(10,2),
    actual_cost numeric(10,2),
    labor_hours numeric(5,2),
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.repair_orders OWNER TO neondb_owner;

--
-- Name: review_campaigns; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.review_campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    trigger character varying(50) NOT NULL,
    delay_days integer DEFAULT 1 NOT NULL,
    email_template text,
    sms_template text,
    sent_count integer DEFAULT 0 NOT NULL,
    response_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.review_campaigns OWNER TO neondb_owner;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid,
    campaign_id uuid,
    rating integer NOT NULL,
    comment text,
    platform character varying(50),
    is_public boolean DEFAULT true NOT NULL,
    response_text text,
    responded_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.reviews OWNER TO neondb_owner;

--
-- Name: security_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.security_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    two_factor_enabled boolean DEFAULT false NOT NULL,
    session_timeout integer DEFAULT 30 NOT NULL,
    password_min_length integer DEFAULT 8 NOT NULL,
    require_special_char boolean DEFAULT true NOT NULL,
    require_numbers boolean DEFAULT true NOT NULL,
    require_uppercase boolean DEFAULT true NOT NULL,
    ip_whitelist text[],
    login_attempts_limit integer DEFAULT 5 NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.security_settings OWNER TO neondb_owner;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- Name: system_health; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.system_health (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    component character varying(50) NOT NULL,
    status character varying(20) NOT NULL,
    response_time integer,
    details jsonb,
    checked_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.system_health OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying NOT NULL,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    role character varying DEFAULT 'client'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    username character varying(50),
    password character varying(255)
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vehicles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid NOT NULL,
    year integer NOT NULL,
    make character varying(50) NOT NULL,
    model character varying(50) NOT NULL,
    vin character varying(17),
    license_plate character varying(20),
    color character varying(30),
    mileage integer,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.vehicles OWNER TO neondb_owner;

--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.appointments (id, customer_id, vehicle_id, scheduled_date, duration, service_type, description, status, notes, created_at, updated_at) FROM stdin;
8b8ce98b-cebc-41cc-a1cf-5d675cb92750	7f41f745-9bd5-45cc-a19c-0720bcfa89fa	82b5e029-39de-4455-834c-fe9e34fe8870	2025-08-31 18:47:45.477948	90	Brake Service	Brake inspection and possible replacement	confirmed	\N	2025-08-31 14:47:45.477948	2025-08-31 14:47:45.477948
7c848cff-40fe-4825-a3fb-44076f2605ed	7f41f745-9bd5-45cc-a19c-0720bcfa89fa	82b5e029-39de-4455-834c-fe9e34fe8870	2025-09-18 09:20:00	60	tire_service	aaaaaaaaa	scheduled		2025-09-12 13:17:21.706332	2025-09-12 13:17:21.706332
d540ad05-9ff6-4420-a774-8284d6bb8bde	3698824c-4d43-4b48-8e5c-bdf3d8c85724	e5da953e-24c0-43b7-a121-dbc5ff929bb9	2025-09-12 07:20:00	60	oil_change	aaaa	scheduled	aa	2025-09-12 13:19:07.938256	2025-09-12 13:55:54.17
5f0bdb79-f7f7-4ced-b5a8-33e8824da817	3698824c-4d43-4b48-8e5c-bdf3d8c85724	e5da953e-24c0-43b7-a121-dbc5ff929bb9	2025-09-13 10:45:45.86	60	brake_service	fgfasdfsd	scheduled		2025-09-13 10:45:56.105186	2025-09-13 10:45:56.105186
86618f5d-25b2-4a6c-a556-ea87eb67f624	3698824c-4d43-4b48-8e5c-bdf3d8c85724	e5da953e-24c0-43b7-a121-dbc5ff929bb9	2025-08-31 16:47:44.299	99	tire_service	Regular maintenance oil change aaa	scheduled	aa	2025-08-31 14:47:44.299615	2025-10-21 12:36:56.705
\.


--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.audit_log (id, user_id, operation, entity_type, entity_id, old_values, new_values, ip_address, user_agent, status, error_message, created_at) FROM stdin;
4c086fa3-7b77-4981-aec9-d1be93a99865	ebe0a23f-ef99-4513-86d0-b0d45a65444f	CREATE_CUSTOMER	customer	215fc71b-a99d-49ba-82d5-8eb09b838d4c	\N	{"id": "215fc71b-a99d-49ba-82d5-8eb09b838d4c", "city": "Mymensingh", "email": "anisuzzaman650@gmai.com", "notes": "", "phone": "1812345678", "state": "Bangladesh", "address": "Dhaka, Bangladesh", "zipCode": "2216", "lastName": "Hasan", "createdAt": "2025-09-06T11:21:03.485Z", "firstName": "Abir", "updatedAt": "2025-09-06T11:21:03.485Z"}	\N	\N	success	\N	2025-09-06 11:21:03.539081
e6d6a382-f5ba-4700-8bbd-8cbb4347a0b4	ebe0a23f-ef99-4513-86d0-b0d45a65444f	CREATE_APPOINTMENT	appointment	7c848cff-40fe-4825-a3fb-44076f2605ed	\N	{"id": "7c848cff-40fe-4825-a3fb-44076f2605ed", "notes": "", "status": "scheduled", "duration": 60, "createdAt": "2025-09-12T13:17:21.706Z", "updatedAt": "2025-09-12T13:17:21.706Z", "vehicleId": "82b5e029-39de-4455-834c-fe9e34fe8870", "customerId": "7f41f745-9bd5-45cc-a19c-0720bcfa89fa", "description": "aaaaaaaaa", "serviceType": "tire_service", "scheduledDate": "2025-09-18T09:20:00.000Z"}	\N	\N	success	\N	2025-09-12 13:17:21.765041
b223a15a-e0c8-4f79-99c5-6fe577060a2b	ebe0a23f-ef99-4513-86d0-b0d45a65444f	CREATE_APPOINTMENT	appointment	d540ad05-9ff6-4420-a774-8284d6bb8bde	\N	{"id": "d540ad05-9ff6-4420-a774-8284d6bb8bde", "notes": "", "status": "scheduled", "duration": 60, "createdAt": "2025-09-12T13:19:07.938Z", "updatedAt": "2025-09-12T13:19:07.938Z", "vehicleId": "e5da953e-24c0-43b7-a121-dbc5ff929bb9", "customerId": "3698824c-4d43-4b48-8e5c-bdf3d8c85724", "description": "fadfadsfasdfasdf", "serviceType": "oil_change", "scheduledDate": "2025-09-12T07:20:00.000Z"}	\N	\N	success	\N	2025-09-12 13:19:07.993456
b6889350-e4ea-402d-8383-00b4cc9c5eba	ebe0a23f-ef99-4513-86d0-b0d45a65444f	UPDATE_APPOINTMENT	appointment	d540ad05-9ff6-4420-a774-8284d6bb8bde	\N	{"id": "d540ad05-9ff6-4420-a774-8284d6bb8bde", "notes": "aa", "status": "scheduled", "duration": 60, "createdAt": "2025-09-12T13:19:07.938Z", "updatedAt": "2025-09-12T13:55:54.170Z", "vehicleId": "e5da953e-24c0-43b7-a121-dbc5ff929bb9", "customerId": "3698824c-4d43-4b48-8e5c-bdf3d8c85724", "description": "aaaa", "serviceType": "oil_change", "scheduledDate": "2025-09-12T07:20:00.000Z"}	\N	\N	success	\N	2025-09-12 13:55:54.246055
17554cce-2566-4943-addd-1acb773ad5fa	ebe0a23f-ef99-4513-86d0-b0d45a65444f	CREATE_INSPECTION	inspection	72ad25af-ded2-4417-855b-d5450bf4020d	\N	{"id": "72ad25af-ded2-4417-855b-d5450bf4020d", "notes": null, "status": "pending", "createdAt": "2025-09-12T14:18:53.571Z", "updatedAt": "2025-09-12T14:18:53.571Z", "vehicleId": "e5da953e-24c0-43b7-a121-dbc5ff929bb9", "customerId": "3698824c-4d43-4b48-8e5c-bdf3d8c85724", "serviceType": "tire-rotation", "vehicleInfo": "2020 Honda Civic - ABC123", "customerName": "John Smith", "checklistItems": 12, "completedItems": 0}	\N	\N	success	\N	2025-09-12 14:18:53.626457
20edbfff-6e7a-457f-8e52-6e4e47593957	ebe0a23f-ef99-4513-86d0-b0d45a65444f	CREATE_INSPECTION	inspection	5ccabe05-3c68-4a6b-811f-924956cfd5b0	\N	{"id": "5ccabe05-3c68-4a6b-811f-924956cfd5b0", "notes": null, "status": "pending", "createdAt": "2025-09-12T14:19:31.303Z", "updatedAt": "2025-09-12T14:19:31.303Z", "vehicleId": "82b5e029-39de-4455-834c-fe9e34fe8870", "customerId": "7f41f745-9bd5-45cc-a19c-0720bcfa89fa", "serviceType": "brake-inspection", "vehicleInfo": "2018 Toyota Camry - XYZ789", "customerName": "Sarah Johnson", "checklistItems": 12, "completedItems": 0}	\N	\N	success	\N	2025-09-12 14:19:31.356128
d031995c-03b6-4c8d-bb83-0bce945cc496	ebe0a23f-ef99-4513-86d0-b0d45a65444f	CREATE_REPAIR_ORDER	repair_order	407df44e-6791-4d29-b76c-e43b90a71aad	\N	{"id": "407df44e-6791-4d29-b76c-e43b90a71aad", "status": "created", "priority": "urgent", "createdAt": "2025-09-12T14:33:47.091Z", "diagnosis": "diagnosis", "startedAt": null, "updatedAt": "2025-09-12T14:33:47.091Z", "vehicleId": "e5da953e-24c0-43b7-a121-dbc5ff929bb9", "actualCost": null, "customerId": "3698824c-4d43-4b48-8e5c-bdf3d8c85724", "laborHours": null, "completedAt": null, "description": "desc", "orderNumber": "RO-1757687607805", "technicianId": null, "appointmentId": null, "estimatedCost": "12.00"}	\N	\N	success	\N	2025-09-12 14:33:47.151102
1b7c16bb-e1a5-4acd-a0db-8a94e0eff066	ebe0a23f-ef99-4513-86d0-b0d45a65444f	UPDATE_REPAIR_ORDER	repair_order	407df44e-6791-4d29-b76c-e43b90a71aad	\N	{"id": "407df44e-6791-4d29-b76c-e43b90a71aad", "status": "created", "priority": "urgent", "createdAt": "2025-09-12T14:33:47.091Z", "diagnosis": "diagnosis", "startedAt": null, "updatedAt": "2025-09-12T14:47:34.046Z", "vehicleId": "e5da953e-24c0-43b7-a121-dbc5ff929bb9", "actualCost": null, "customerId": "3698824c-4d43-4b48-8e5c-bdf3d8c85724", "laborHours": null, "completedAt": null, "description": "descccc", "orderNumber": "RO-1757687607805", "technicianId": null, "appointmentId": null, "estimatedCost": "20.00"}	\N	\N	success	\N	2025-09-12 14:47:34.127381
581df6ee-5c88-4608-aade-9cdfbce5d7b0	ebe0a23f-ef99-4513-86d0-b0d45a65444f	UPDATE_REPAIR_ORDER	repair_order	407df44e-6791-4d29-b76c-e43b90a71aad	\N	{"id": "407df44e-6791-4d29-b76c-e43b90a71aad", "status": "completed", "priority": "urgent", "createdAt": "2025-09-12T14:33:47.091Z", "diagnosis": "diagnosis", "startedAt": null, "updatedAt": "2025-09-12T14:47:46.031Z", "vehicleId": "e5da953e-24c0-43b7-a121-dbc5ff929bb9", "actualCost": null, "customerId": "3698824c-4d43-4b48-8e5c-bdf3d8c85724", "laborHours": null, "completedAt": null, "description": "descccc", "orderNumber": "RO-1757687607805", "technicianId": null, "appointmentId": null, "estimatedCost": "20.00"}	\N	\N	success	\N	2025-09-12 14:47:46.094071
ecc6ccee-7bc6-4d1e-b0af-d563cf08b7aa	ebe0a23f-ef99-4513-86d0-b0d45a65444f	UPDATE_APPOINTMENT	appointment	86618f5d-25b2-4a6c-a556-ea87eb67f624	\N	{"id": "86618f5d-25b2-4a6c-a556-ea87eb67f624", "notes": "aa", "status": "scheduled", "duration": 100, "createdAt": "2025-08-31T14:47:44.299Z", "updatedAt": "2025-09-12T14:48:30.438Z", "vehicleId": "e5da953e-24c0-43b7-a121-dbc5ff929bb9", "customerId": "3698824c-4d43-4b48-8e5c-bdf3d8c85724", "description": "Regular maintenance oil change aaa", "serviceType": "tire_service", "scheduledDate": "2025-08-31T16:47:44.299Z"}	\N	\N	success	\N	2025-09-12 14:48:30.505238
e760f0cc-23d3-401a-a5be-62a87340b49c	ebe0a23f-ef99-4513-86d0-b0d45a65444f	UPDATE_USER_ROLE	user	83bea52d-046d-4103-81a7-e349a4d5685b	{"role": "previous_role"}	{"role": "client"}	\N	\N	success	\N	2025-09-12 17:20:59.479415
db6ec2b1-7009-4403-baf1-564efaa0f553	ebe0a23f-ef99-4513-86d0-b0d45a65444f	CREATE_CUSTOMER	customer	11490a60-3e4b-4c75-aa13-38926657b155	\N	{"id": "11490a60-3e4b-4c75-aa13-38926657b155", "city": "aaa", "email": "john@mail.com", "notes": "", "phone": "1812345678", "state": "CA", "address": "North richmond", "zipCode": "2216", "lastName": "Doe", "createdAt": "2025-09-12T17:57:47.689Z", "firstName": "John ", "updatedAt": "2025-09-12T17:57:47.689Z"}	\N	\N	success	\N	2025-09-12 17:57:47.745686
022eddcb-af84-4655-b506-d11308db3e4f	ebe0a23f-ef99-4513-86d0-b0d45a65444f	UPDATE_USER_ROLE	user	83bea52d-046d-4103-81a7-e349a4d5685b	{"role": "previous_role"}	{"role": "user"}	\N	\N	success	\N	2025-09-12 18:02:55.389428
40639fcf-4f75-4f0b-b54f-9a5385b90bce	ebe0a23f-ef99-4513-86d0-b0d45a65444f	CREATE_APPOINTMENT	appointment	5f0bdb79-f7f7-4ced-b5a8-33e8824da817	\N	{"id": "5f0bdb79-f7f7-4ced-b5a8-33e8824da817", "notes": "", "status": "scheduled", "duration": 60, "createdAt": "2025-09-13T10:45:56.105Z", "updatedAt": "2025-09-13T10:45:56.105Z", "vehicleId": "e5da953e-24c0-43b7-a121-dbc5ff929bb9", "customerId": "3698824c-4d43-4b48-8e5c-bdf3d8c85724", "description": "fgfasdfsd", "serviceType": "brake_service", "scheduledDate": "2025-09-13T10:45:45.860Z"}	\N	\N	success	\N	2025-09-13 10:45:56.159488
a13b0270-4be0-4ca7-8749-fdb82c8aee34	10e4295d-4aaf-46c0-9952-8067446cc98f	UPDATE_USER_ROLE	user	10e4295d-4aaf-46c0-9952-8067446cc98f	{"role": "previous_role"}	{"role": "admin"}	\N	\N	success	\N	2025-10-20 15:51:47.112544
c93252d9-aeb0-464d-87f5-be83998f4436	10e4295d-4aaf-46c0-9952-8067446cc98f	CREATE_CUSTOMER	customer	2bba12c0-a0e4-4aa0-af51-11493051d3d4	\N	{"id": "2bba12c0-a0e4-4aa0-af51-11493051d3d4", "city": "Springfield", "email": "johnrBiz@email.com", "notes": "", "phone": "555-1234", "state": "IL", "address": "123 Main St", "zipCode": "62701", "lastName": "DoeW3J", "createdAt": "2025-10-20T15:53:24.976Z", "firstName": "John", "updatedAt": "2025-10-20T15:53:24.976Z"}	\N	\N	success	\N	2025-10-20 15:53:25.037018
510b8086-dd3e-4b15-aa98-53090dbe70e9	3421391f-e2fd-4a45-956d-bfccfd036dc5	CREATE_CUSTOMER	customer	c2e64a5a-7bdb-4f45-8d55-a0c21cbc6544	\N	{"id": "c2e64a5a-7bdb-4f45-8d55-a0c21cbc6544", "city": "Austin", "email": "testEhs6@example.com", "notes": null, "phone": "555-1234", "state": "TX", "address": null, "zipCode": "78701", "lastName": "User", "createdAt": "2025-10-21T01:54:33.707Z", "firstName": "Test", "updatedAt": "2025-10-21T01:54:33.707Z"}	\N	\N	success	\N	2025-10-21 01:54:33.760699
12b616e1-a62d-4cab-8dac-b9d5300396be	6fb6342f-0dc4-4720-99ff-3590d07b5d69	UPDATE_REPAIR_ORDER	repair_order	407df44e-6791-4d29-b76c-e43b90a71aad	\N	{"id": "407df44e-6791-4d29-b76c-e43b90a71aad", "status": "completed", "priority": "high", "createdAt": "2025-09-12T14:33:47.091Z", "diagnosis": "", "startedAt": null, "updatedAt": "2025-10-21T02:06:39.219Z", "vehicleId": "e5da953e-24c0-43b7-a121-dbc5ff929bb9", "actualCost": null, "customerId": "3698824c-4d43-4b48-8e5c-bdf3d8c85724", "laborHours": "1.00", "completedAt": null, "description": "descccc", "orderNumber": "RO-1757687607805", "technicianId": "d208dd69-4a4c-4716-8193-59eac18e900b", "appointmentId": null, "estimatedCost": "20.00"}	\N	\N	success	\N	2025-10-21 02:06:39.296121
3b661a7f-3ce6-46a9-82cf-5cff21e4c834	6fb6342f-0dc4-4720-99ff-3590d07b5d69	UPDATE_REPAIR_ORDER	repair_order	407df44e-6791-4d29-b76c-e43b90a71aad	\N	{"id": "407df44e-6791-4d29-b76c-e43b90a71aad", "status": "completed", "priority": "high", "createdAt": "2025-09-12T14:33:47.091Z", "diagnosis": "", "startedAt": null, "updatedAt": "2025-10-21T02:14:57.006Z", "vehicleId": "e5da953e-24c0-43b7-a121-dbc5ff929bb9", "actualCost": null, "customerId": "3698824c-4d43-4b48-8e5c-bdf3d8c85724", "laborHours": "2.00", "completedAt": null, "description": "descccc", "orderNumber": "RO-1757687607805", "technicianId": "d208dd69-4a4c-4716-8193-59eac18e900b", "appointmentId": null, "estimatedCost": "20.00"}	\N	\N	success	\N	2025-10-21 02:14:57.073687
d90e4e14-f9dc-47db-9fd4-6d7abf64226b	6fb6342f-0dc4-4720-99ff-3590d07b5d69	CREATE_INSPECTION	inspection	0251eed6-9fc9-446b-b041-86cb3bc935d7	\N	{"id": "0251eed6-9fc9-446b-b041-86cb3bc935d7", "notes": null, "status": "pending", "createdAt": "2025-10-21T02:18:25.548Z", "updatedAt": "2025-10-21T02:18:25.548Z", "vehicleId": "e5da953e-24c0-43b7-a121-dbc5ff929bb9", "customerId": "3698824c-4d43-4b48-8e5c-bdf3d8c85724", "serviceType": "brake-inspection", "vehicleInfo": "2020 Honda Civic - ABC123", "customerName": "John Smith", "repairOrderId": null, "checklistItems": 12, "completedItems": 0}	\N	\N	success	\N	2025-10-21 02:18:25.62905
e97ac72e-9f1f-4291-9b7b-7a4efb66ebeb	6fb6342f-0dc4-4720-99ff-3590d07b5d69	UPDATE_APPOINTMENT	appointment	86618f5d-25b2-4a6c-a556-ea87eb67f624	\N	{"id": "86618f5d-25b2-4a6c-a556-ea87eb67f624", "notes": "aa", "status": "scheduled", "duration": 99, "createdAt": "2025-08-31T14:47:44.299Z", "updatedAt": "2025-10-21T12:36:56.705Z", "vehicleId": "e5da953e-24c0-43b7-a121-dbc5ff929bb9", "customerId": "3698824c-4d43-4b48-8e5c-bdf3d8c85724", "description": "Regular maintenance oil change aaa", "serviceType": "tire_service", "scheduledDate": "2025-08-31T16:47:44.299Z"}	\N	\N	success	\N	2025-10-21 12:36:56.77204
05f49010-fce3-43be-94ff-590ce8fc6098	6fb6342f-0dc4-4720-99ff-3590d07b5d69	UPDATE_REPAIR_ORDER	repair_order	407df44e-6791-4d29-b76c-e43b90a71aad	\N	{"id": "407df44e-6791-4d29-b76c-e43b90a71aad", "status": "completed", "priority": "high", "createdAt": "2025-09-12T14:33:47.091Z", "diagnosis": "", "startedAt": null, "updatedAt": "2025-10-21T12:41:40.128Z", "vehicleId": "e5da953e-24c0-43b7-a121-dbc5ff929bb9", "actualCost": null, "customerId": "3698824c-4d43-4b48-8e5c-bdf3d8c85724", "laborHours": "84.00", "completedAt": null, "description": "descccc", "orderNumber": "RO-1757687607805", "technicianId": "d208dd69-4a4c-4716-8193-59eac18e900b", "appointmentId": null, "estimatedCost": "20.00"}	\N	\N	success	\N	2025-10-21 12:41:40.200562
02cdb066-afe3-4f4f-94ae-904163d29600	6fb6342f-0dc4-4720-99ff-3590d07b5d69	UPDATE_USER_ROLE	user	d208dd69-4a4c-4716-8193-59eac18e900b	{"role": "previous_role"}	{"role": "client"}	\N	\N	success	\N	2025-10-21 12:48:37.262016
b1a3672e-26ce-43c1-9f06-17aa340d35bf	6fb6342f-0dc4-4720-99ff-3590d07b5d69	CREATE_CUSTOMER	customer	ec31c5bc-012e-43e8-802f-67450ab0c536	\N	{"id": "ec31c5bc-012e-43e8-802f-67450ab0c536", "city": "skdfjajh", "email": "rayhan@mail.com", "notes": "", "phone": "3534534534`", "state": "jkasdhfk", "address": "asdkfjasjhf", "zipCode": "asjdfh", "lastName": "ferdous", "createdAt": "2025-10-21T12:59:31.390Z", "firstName": "rayhan", "updatedAt": "2025-10-21T12:59:31.390Z"}	\N	\N	success	\N	2025-10-21 12:59:31.493261
fbaa1c4d-6cf7-4317-b496-7f76e3fabad9	6fb6342f-0dc4-4720-99ff-3590d07b5d69	CREATE_INVENTORY_ITEM	inventory	2f76c822-19a6-406b-89eb-e833ab98e753	\N	{"id": "2f76c822-19a6-406b-89eb-e833ab98e753", "name": "awejhf", "notes": "", "category": "asdjkfhaj", "location": "", "minStock": 17, "quantity": 16, "supplier": "", "unitCost": "1.52", "createdAt": "2025-10-21T14:00:10.953Z", "updatedAt": "2025-10-21T14:00:10.953Z", "partNumber": "141", "description": "awjehfqj", "lastOrdered": null, "sellingPrice": "1.27", "supplierPartNumber": ""}	\N	\N	success	\N	2025-10-21 14:00:11.004481
a26f3f89-42bc-436c-adcf-4c45235bffb6	6fb6342f-0dc4-4720-99ff-3590d07b5d69	UPDATE_INVENTORY_ITEM	inventory	2f76c822-19a6-406b-89eb-e833ab98e753	\N	{"name": "awejhf", "notes": "", "category": "asdjkfhaj", "location": "", "minStock": 17, "quantity": 16, "supplier": "", "unitCost": 1.52, "partNumber": "141", "description": "awjehfqj", "sellingPrice": 1.29, "supplierPartNumber": ""}	\N	\N	success	\N	2025-10-21 14:00:20.724978
4b36d81a-eb8a-4230-8a19-9d20fd8fc2fc	6fb6342f-0dc4-4720-99ff-3590d07b5d69	UPDATE_INSPECTION	inspection	0251eed6-9fc9-446b-b041-86cb3bc935d7	\N	{"id": "0251eed6-9fc9-446b-b041-86cb3bc935d7", "notes": null, "status": "in-progress", "createdAt": "2025-10-21T02:18:25.548Z", "updatedAt": "2025-10-21T14:38:04.211Z", "vehicleId": "e5da953e-24c0-43b7-a121-dbc5ff929bb9", "customerId": "3698824c-4d43-4b48-8e5c-bdf3d8c85724", "serviceType": "brake-inspection", "vehicleInfo": "2020 Honda Civic - ABC123", "customerName": "John Smith", "repairOrderId": null, "checklistItems": 12, "completedItems": 0}	\N	\N	success	\N	2025-10-21 14:38:04.280686
3b3d6b27-94f9-4619-b39d-98d9aa1ca767	6fb6342f-0dc4-4720-99ff-3590d07b5d69	UPDATE_INSPECTION	inspection	0251eed6-9fc9-446b-b041-86cb3bc935d7	\N	{"id": "0251eed6-9fc9-446b-b041-86cb3bc935d7", "notes": null, "status": "pending", "createdAt": "2025-10-21T02:18:25.548Z", "updatedAt": "2025-10-21T14:38:18.804Z", "vehicleId": "e5da953e-24c0-43b7-a121-dbc5ff929bb9", "customerId": "3698824c-4d43-4b48-8e5c-bdf3d8c85724", "serviceType": "brake-inspection", "vehicleInfo": "2020 Honda Civic - ABC123", "customerName": "John Smith", "repairOrderId": null, "checklistItems": 12, "completedItems": 0}	\N	\N	success	\N	2025-10-21 14:38:18.869559
d2b211e7-633f-41bd-b1ac-bf265a381867	6fb6342f-0dc4-4720-99ff-3590d07b5d69	CREATE_REPAIR_ORDER	repair_order	c58d7ffe-7a60-4fde-82d7-6f7d7f8e0552	\N	{"id": "c58d7ffe-7a60-4fde-82d7-6f7d7f8e0552", "status": "created", "priority": "normal", "createdAt": "2025-10-21T16:20:31.925Z", "diagnosis": "", "startedAt": null, "updatedAt": "2025-10-21T16:20:31.925Z", "vehicleId": "82b5e029-39de-4455-834c-fe9e34fe8870", "actualCost": null, "customerId": "7f41f745-9bd5-45cc-a19c-0720bcfa89fa", "laborHours": null, "completedAt": null, "description": "", "orderNumber": "RO-1761063596132", "technicianId": null, "appointmentId": null, "estimatedCost": null}	\N	\N	success	\N	2025-10-21 16:20:31.97445
4dc1f834-b6e4-4bef-9a01-88c9246e547c	6fb6342f-0dc4-4720-99ff-3590d07b5d69	UPDATE_REPAIR_ORDER	repair_order	c58d7ffe-7a60-4fde-82d7-6f7d7f8e0552	\N	{"id": "c58d7ffe-7a60-4fde-82d7-6f7d7f8e0552", "status": "created", "priority": "urgent", "createdAt": "2025-10-21T16:20:31.925Z", "diagnosis": "", "startedAt": null, "updatedAt": "2025-10-21T16:20:52.134Z", "vehicleId": "82b5e029-39de-4455-834c-fe9e34fe8870", "actualCost": null, "customerId": "7f41f745-9bd5-45cc-a19c-0720bcfa89fa", "laborHours": null, "completedAt": null, "description": "", "orderNumber": "RO-1761063596132", "technicianId": null, "appointmentId": null, "estimatedCost": null}	\N	\N	success	\N	2025-10-21 16:20:52.205699
1b939f8a-c5b6-4478-ae2b-93cce791852a	system	UPDATE	operating_hours	all	\N	\N	\N	\N	success	\N	2025-10-21 16:29:00.898056
dcddb4c4-84ff-4e50-81cd-28c45aae5fc1	system	UPDATE	notification_settings	81fef942-062b-4a85-b316-f8863fb8962e	\N	\N	\N	\N	success	\N	2025-10-21 16:29:06.38738
29812eea-6058-4771-91cb-bb60d306f60c	system	UPDATE	billing_settings	dce8a224-0682-4b9f-a9a3-ef92257c68dd	\N	\N	\N	\N	success	\N	2025-10-21 16:29:11.019955
3f58b12a-a5c5-4445-ba6d-3fec68c1af7d	system	UPDATE	integration_settings	e672723d-eaae-4f67-a8bd-86f23dae3a6e	\N	\N	\N	\N	success	\N	2025-10-21 16:29:16.278511
a04fac67-61c4-4275-95c4-f0e0acdd5be6	system	UPDATE	security_settings	c8abf334-7aca-46a4-847a-533a79307dda	\N	\N	\N	\N	success	\N	2025-10-21 16:29:21.842245
87c48376-9149-4c3b-96b0-46a0f24f0596	system	UPDATE	operating_hours	all	\N	\N	\N	\N	success	\N	2025-10-21 16:31:08.383562
d1644593-fee9-41cc-9028-f18962c5d8b9	system	UPDATE	review_campaigns	1953c26e-51f2-4ed0-b4a4-22f83b13946a	\N	\N	\N	\N	success	\N	2025-10-21 16:31:35.762508
865612bc-371c-4ce7-9b3d-6df2941c6c00	6fb6342f-0dc4-4720-99ff-3590d07b5d69	UPDATE_CAMPAIGN_STATUS	review_campaigns	1953c26e-51f2-4ed0-b4a4-22f83b13946a	\N	\N	\N	\N	success	\N	2025-10-21 16:31:35.8111
367d523a-4975-465f-bc9f-7e2af6c88e68	system	UPDATE	review_campaigns	1953c26e-51f2-4ed0-b4a4-22f83b13946a	\N	\N	\N	\N	success	\N	2025-10-21 16:31:38.648655
881508b9-859c-4dde-a692-61e5f6574981	6fb6342f-0dc4-4720-99ff-3590d07b5d69	UPDATE_CAMPAIGN_STATUS	review_campaigns	1953c26e-51f2-4ed0-b4a4-22f83b13946a	\N	\N	\N	\N	success	\N	2025-10-21 16:31:38.69551
6c3fb797-c942-45ed-be37-58a5659d6216	system	UPDATE	review_campaigns	1495c765-c0ee-4b90-aa0c-6a3f81601611	\N	\N	\N	\N	success	\N	2025-10-21 16:31:42.871216
7b5cb6a9-2bcf-432a-a2f6-5c2ffa9a0bfe	6fb6342f-0dc4-4720-99ff-3590d07b5d69	UPDATE_CAMPAIGN_STATUS	review_campaigns	1495c765-c0ee-4b90-aa0c-6a3f81601611	\N	\N	\N	\N	success	\N	2025-10-21 16:31:42.918603
4095a73e-4f10-4736-9cac-576b60e6856a	system	UPDATE	review_campaigns	1495c765-c0ee-4b90-aa0c-6a3f81601611	\N	\N	\N	\N	success	\N	2025-10-21 16:31:44.998074
26485237-5402-4b3b-967d-ea30432352e0	6fb6342f-0dc4-4720-99ff-3590d07b5d69	UPDATE_CAMPAIGN_STATUS	review_campaigns	1495c765-c0ee-4b90-aa0c-6a3f81601611	\N	\N	\N	\N	success	\N	2025-10-21 16:31:45.045598
1480f212-8687-4695-b8fb-9beb880a12f2	system	CREATE	review_campaigns	4f6b11d6-e12c-4e3c-8278-4b2f36d7a4f4	\N	\N	\N	\N	success	\N	2025-10-21 16:34:16.188582
b94ab48c-6328-4276-8e19-dffb98c2af5c	6fb6342f-0dc4-4720-99ff-3590d07b5d69	CREATE_CAMPAIGN	review_campaigns	4f6b11d6-e12c-4e3c-8278-4b2f36d7a4f4	\N	\N	\N	\N	success	\N	2025-10-21 16:34:16.235715
a1838366-3ee7-46b1-bea4-6feaec03fba8	system	UPDATE	review_campaigns	4f6b11d6-e12c-4e3c-8278-4b2f36d7a4f4	\N	\N	\N	\N	success	\N	2025-10-21 16:34:34.490473
5d1a5a03-1fe0-403a-8345-df9f0424bafb	6fb6342f-0dc4-4720-99ff-3590d07b5d69	UPDATE_CAMPAIGN_STATUS	review_campaigns	4f6b11d6-e12c-4e3c-8278-4b2f36d7a4f4	\N	\N	\N	\N	success	\N	2025-10-21 16:34:34.537228
c621b1f1-64e7-4f8a-a5ce-675ac49a6f58	system	UPDATE	review_campaigns	4f6b11d6-e12c-4e3c-8278-4b2f36d7a4f4	\N	\N	\N	\N	success	\N	2025-10-21 16:34:35.3504
589760cf-bfef-46e6-ba93-f1b5df1d7684	6fb6342f-0dc4-4720-99ff-3590d07b5d69	UPDATE_CAMPAIGN_STATUS	review_campaigns	4f6b11d6-e12c-4e3c-8278-4b2f36d7a4f4	\N	\N	\N	\N	success	\N	2025-10-21 16:34:35.396931
a593bd87-adc5-4645-b122-a7e392b9f802	system	CREATE	conversations	20a7de53-d19a-46ef-8f4d-52eac413ade3	\N	\N	\N	\N	success	\N	2025-10-21 16:52:25.836383
f5a364d8-b05c-43a1-8e1f-e9221fbd5921	6fb6342f-0dc4-4720-99ff-3590d07b5d69	CREATE_CONVERSATION	conversations	20a7de53-d19a-46ef-8f4d-52eac413ade3	\N	\N	\N	\N	success	\N	2025-10-21 16:52:25.932242
103ab03f-7ad9-4d73-b7a8-24b22ea61d2d	system	CREATE	conversations	ae7a7d32-0144-4ac2-9576-97a9f928fce8	\N	\N	\N	\N	success	\N	2025-10-21 16:54:44.814472
9dcc2322-c214-4c16-8ea9-e6dacee16d3b	6fb6342f-0dc4-4720-99ff-3590d07b5d69	CREATE_CONVERSATION	conversations	ae7a7d32-0144-4ac2-9576-97a9f928fce8	\N	\N	\N	\N	success	\N	2025-10-21 16:54:44.857247
3d90aa8c-e239-49d6-89d6-d8fc84081a27	system	CREATE	conversations	19258cc8-4ae3-459a-9ca1-fa53cc446f87	\N	\N	\N	\N	success	\N	2025-10-21 16:54:57.118322
6b7c056c-c072-442a-a5d6-7431c2197778	6fb6342f-0dc4-4720-99ff-3590d07b5d69	CREATE_CONVERSATION	conversations	19258cc8-4ae3-459a-9ca1-fa53cc446f87	\N	\N	\N	\N	success	\N	2025-10-21 16:54:57.165959
638e7916-d01f-4407-9de1-4651b6e75849	system	CREATE	conversations	f3de3f15-cf87-4b42-bac1-e0256ea70b99	\N	\N	\N	\N	success	\N	2025-10-21 16:55:08.252121
b0604a64-4de3-4af5-b7ae-0cca5c281536	6fb6342f-0dc4-4720-99ff-3590d07b5d69	CREATE_CONVERSATION	conversations	f3de3f15-cf87-4b42-bac1-e0256ea70b99	\N	\N	\N	\N	success	\N	2025-10-21 16:55:08.295813
9f574912-00c9-49a1-9f25-2fb9842a0b87	system	CREATE	conversations	2c53edb2-241c-4aac-b2ab-63c6853c753f	\N	\N	\N	\N	success	\N	2025-10-21 16:55:58.398465
1d306ec8-f521-42ea-8ce6-2f76963dc530	6fb6342f-0dc4-4720-99ff-3590d07b5d69	CREATE_CONVERSATION	conversations	2c53edb2-241c-4aac-b2ab-63c6853c753f	\N	\N	\N	\N	success	\N	2025-10-21 16:55:58.446206
5323d2eb-0aed-48a1-9bac-b92251189885	system	CREATE	conversations	bfe5e8de-1a2d-4f1a-8205-e0024fd75a0f	\N	\N	\N	\N	success	\N	2025-10-21 16:56:12.984215
55feec79-e199-42c0-9da6-642ce207479c	6fb6342f-0dc4-4720-99ff-3590d07b5d69	CREATE_CONVERSATION	conversations	bfe5e8de-1a2d-4f1a-8205-e0024fd75a0f	\N	\N	\N	\N	success	\N	2025-10-21 16:56:13.03084
2e3fc5bc-bb26-4731-834b-284e5b24fa09	system	CREATE	conversations	a39a1880-2e71-46e7-942e-9d6723d33ee9	\N	\N	\N	\N	success	\N	2025-10-21 16:57:13.0753
103aace4-9b3b-4b2b-9146-f2b73feca81c	6fb6342f-0dc4-4720-99ff-3590d07b5d69	CREATE_CONVERSATION	conversations	a39a1880-2e71-46e7-942e-9d6723d33ee9	\N	\N	\N	\N	success	\N	2025-10-21 16:57:13.122185
26b106e6-ac14-4e5f-b4a7-3c9a68de145c	system	CREATE	conversations	530f9552-d9c2-4776-8e41-d43184c30b08	\N	\N	\N	\N	success	\N	2025-10-21 17:03:02.551835
ae279fb5-c782-4505-bf70-9077c08ecd42	6fb6342f-0dc4-4720-99ff-3590d07b5d69	CREATE_CONVERSATION	conversations	530f9552-d9c2-4776-8e41-d43184c30b08	\N	\N	\N	\N	success	\N	2025-10-21 17:03:02.604834
fecddc85-1f3e-463e-9b1d-68605b56ec4f	system	CREATE	conversations	c5714c11-f9ba-4ca6-b636-1829d9932139	\N	\N	\N	\N	success	\N	2025-10-21 17:03:38.126843
7c537326-41a6-4e10-a02d-833a1ce971fb	6fb6342f-0dc4-4720-99ff-3590d07b5d69	CREATE_CONVERSATION	conversations	c5714c11-f9ba-4ca6-b636-1829d9932139	\N	\N	\N	\N	success	\N	2025-10-21 17:03:38.172048
8efad283-273e-4ac7-9e31-01eb88395a7d	system	CREATE	messages	3f577741-6602-4c50-b5a9-af8e789185f4	\N	\N	\N	\N	success	\N	2025-10-21 17:05:30.467415
59e9fa07-7dbb-4971-bba1-4c74d921a234	6fb6342f-0dc4-4720-99ff-3590d07b5d69	SEND_MESSAGE	messages	3f577741-6602-4c50-b5a9-af8e789185f4	\N	\N	\N	\N	success	\N	2025-10-21 17:05:30.514792
09670883-c4cc-4ada-9914-d57573222c81	system	CREATE	conversations	3ca914c5-c60f-4001-bb9a-ed8781280f45	\N	\N	\N	\N	success	\N	2025-10-21 17:08:08.309035
570b1655-9234-4bf3-8b3f-b18acb7c894c	6fb6342f-0dc4-4720-99ff-3590d07b5d69	CREATE_CONVERSATION	conversations	3ca914c5-c60f-4001-bb9a-ed8781280f45	\N	\N	\N	\N	success	\N	2025-10-21 17:08:08.358869
377c5860-7f16-4895-bfd7-4c909609ba75	system	CREATE	messages	f0bc407b-0068-45e5-9e2b-07b6fe3d6267	\N	\N	\N	\N	success	\N	2025-10-21 17:08:08.704857
28e84e49-b98a-4181-818c-49c318488176	6fb6342f-0dc4-4720-99ff-3590d07b5d69	SEND_MESSAGE	messages	f0bc407b-0068-45e5-9e2b-07b6fe3d6267	\N	\N	\N	\N	success	\N	2025-10-21 17:08:08.752992
f7a9a30f-c8c7-458f-8645-4d44ad2f6eca	system	CREATE	conversations	52cf1be3-c1e3-4e39-bd90-3b0310e76f6a	\N	\N	\N	\N	success	\N	2025-10-21 17:08:20.190035
03878318-6419-4ecf-a250-d551633435b5	6fb6342f-0dc4-4720-99ff-3590d07b5d69	CREATE_CONVERSATION	conversations	52cf1be3-c1e3-4e39-bd90-3b0310e76f6a	\N	\N	\N	\N	success	\N	2025-10-21 17:08:20.23668
948fb934-1821-4a98-951f-3e135ed4f7ac	system	CREATE	messages	fe361c46-21f7-4dff-90b0-dca1490e3188	\N	\N	\N	\N	success	\N	2025-10-21 17:08:20.93066
596d0925-1910-4819-b6fa-de3389d85e47	6fb6342f-0dc4-4720-99ff-3590d07b5d69	SEND_MESSAGE	messages	fe361c46-21f7-4dff-90b0-dca1490e3188	\N	\N	\N	\N	success	\N	2025-10-21 17:08:20.976931
f4c6aff4-55fe-4083-b13a-aa3bbd7f3f1b	system	CREATE	messages	394bb79d-ee27-4ccd-94f3-0e6c4ab67653	\N	\N	\N	\N	success	\N	2025-10-21 17:09:04.601838
4b23b7f8-490d-44a9-ba6f-efef3a3e5ff4	6fb6342f-0dc4-4720-99ff-3590d07b5d69	SEND_MESSAGE	messages	394bb79d-ee27-4ccd-94f3-0e6c4ab67653	\N	\N	\N	\N	success	\N	2025-10-21 17:09:04.644481
21cc0288-1815-4fd4-86ea-412c979520c4	system	CREATE	messages	cfb9db54-e0b8-418d-807b-31e9909610e7	\N	\N	\N	\N	success	\N	2025-10-21 17:09:19.661789
d3dc296d-b486-46cd-8cf2-e7d9fe5dd294	6fb6342f-0dc4-4720-99ff-3590d07b5d69	SEND_MESSAGE	messages	cfb9db54-e0b8-418d-807b-31e9909610e7	\N	\N	\N	\N	success	\N	2025-10-21 17:09:19.704616
\.


--
-- Data for Name: billing_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.billing_settings (id, plan_name, plan_price, billing_cycle, payment_method, card_last4, card_expiry, next_billing_date, auto_renew, updated_at) FROM stdin;
dce8a224-0682-4b9f-a9a3-ef92257c68dd	Professional Plan	$99	monthly	Credit Card	1234	12/26	\N	t	2025-10-21 16:29:10.953
\.


--
-- Data for Name: business_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.business_settings (id, business_name, phone, email, website, address, updated_at) FROM stdin;
60668ece-a08b-4817-96d3-42e02d23308c	Rayhan Ferdous	01686333676	admin@gmail.com	https://comforthousebd.com/	Barishal Sadar, Bangladesh	2025-10-21 16:18:02.32
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.conversations (id, customer_id, customer_name, phone_number, last_message, last_message_at, status, unread_count, created_at, updated_at) FROM stdin;
20a7de53-d19a-46ef-8f4d-52eac413ade3	\N	34535345341	34535345341	asdhfjkash	2025-10-21 16:52:24.995	active	0	2025-10-21 16:52:25.78447	2025-10-21 16:52:25.78447
ae7a7d32-0144-4ac2-9576-97a9f928fce8	\N	admin	admin	asdfhasdf	2025-10-21 16:54:44.069	active	0	2025-10-21 16:54:44.767032	2025-10-21 16:54:44.767032
19258cc8-4ae3-459a-9ca1-fa53cc446f87	\N	+15551234567	+15551234567	Hello, this is a test message from AutoFlow GMS!	2025-10-21 16:54:56.466	active	0	2025-10-21 16:54:57.064158	2025-10-21 16:54:57.064158
f3de3f15-cf87-4b42-bac1-e0256ea70b99	\N	admin	admin	asdfhasdf	2025-10-21 16:55:07.573	active	0	2025-10-21 16:55:08.203377	2025-10-21 16:55:08.203377
2c53edb2-241c-4aac-b2ab-63c6853c753f	\N	admin	admin	asdfhasdf	2025-10-21 16:55:58.117	active	0	2025-10-21 16:55:58.351841	2025-10-21 16:55:58.351841
bfe5e8de-1a2d-4f1a-8205-e0024fd75a0f	\N	016863333676	016863333676	asdfhasdf	2025-10-21 16:56:12.263	active	0	2025-10-21 16:56:12.933856	2025-10-21 16:56:12.933856
a39a1880-2e71-46e7-942e-9d6723d33ee9	\N	euwtierw	euwtierw	dkjfgsjdfhg\n	2025-10-21 16:57:12.372	active	0	2025-10-21 16:57:13.023648	2025-10-21 16:57:13.023648
530f9552-d9c2-4776-8e41-d43184c30b08	\N	weutywue	weutywue	dfajhsdf	2025-10-21 17:03:02.222	active	0	2025-10-21 17:03:02.495419	2025-10-21 17:03:02.495419
c5714c11-f9ba-4ca6-b636-1829d9932139	\N	+15559876543	+15559876543	klj	2025-10-21 17:05:30.367	active	0	2025-10-21 17:03:38.076991	2025-10-21 17:05:30.399
3ca914c5-c60f-4001-bb9a-ed8781280f45	\N	+155596lT5hg	+155596lT5hg	Follow-up test message	2025-10-21 17:09:04.491	active	0	2025-10-21 17:08:08.256607	2025-10-21 17:09:04.521
52cf1be3-c1e3-4e39-bd90-3b0310e76f6a	\N	+15559876543	+15559876543	hi	2025-10-21 17:09:19.578	active	0	2025-10-21 17:08:20.142788	2025-10-21 17:09:19.602
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.customers (id, first_name, last_name, email, phone, address, city, state, zip_code, notes, created_at, updated_at) FROM stdin;
3698824c-4d43-4b48-8e5c-bdf3d8c85724	John	Smith	john.smith@email.com	555-123-4567	123 Main St	Springfield	IL	62701	Regular customer	2025-08-31 14:47:21.378975	2025-08-31 14:47:21.378975
7f41f745-9bd5-45cc-a19c-0720bcfa89fa	Sarah	Johnson	sarah.johnson@email.com	555-987-6543	456 Oak Ave	Springfield	IL	62702	Fleet account	2025-08-31 14:47:21.378975	2025-08-31 14:47:21.378975
cb451c22-2aec-434b-9d95-bf844bf481ae	Mike	Davis	mike.davis@email.com	555-555-1234	789 Pine St	Springfield	IL	62703	VIP customer	2025-08-31 14:47:21.378975	2025-08-31 14:47:21.378975
215fc71b-a99d-49ba-82d5-8eb09b838d4c	Abir	Hasan	anisuzzaman650@gmai.com	1812345678	Dhaka, Bangladesh	Mymensingh	Bangladesh	2216		2025-09-06 11:21:03.485992	2025-09-06 11:21:03.485992
11490a60-3e4b-4c75-aa13-38926657b155	John 	Doe	john@mail.com	1812345678	North richmond	aaa	CA	2216		2025-09-12 17:57:47.6894	2025-09-12 17:57:47.6894
2bba12c0-a0e4-4aa0-af51-11493051d3d4	John	DoeW3J	johnrBiz@email.com	555-1234	123 Main St	Springfield	IL	62701		2025-10-20 15:53:24.976927	2025-10-20 15:53:24.976927
c2e64a5a-7bdb-4f45-8d55-a0c21cbc6544	Test	User	testEhs6@example.com	555-1234	\N	Austin	TX	78701	\N	2025-10-21 01:54:33.707719	2025-10-21 01:54:33.707719
ec31c5bc-012e-43e8-802f-67450ab0c536	rayhan	ferdous	rayhan@mail.com	3534534534`	asdkfjasjhf	skdfjajh	jkasdhfk	asjdfh		2025-10-21 12:59:31.390285	2025-10-21 12:59:31.390285
\.


--
-- Data for Name: inspections; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.inspections (id, customer_id, vehicle_id, vehicle_info, customer_name, service_type, status, checklist_items, completed_items, notes, created_at, updated_at, repair_order_id) FROM stdin;
72ad25af-ded2-4417-855b-d5450bf4020d	3698824c-4d43-4b48-8e5c-bdf3d8c85724	e5da953e-24c0-43b7-a121-dbc5ff929bb9	2020 Honda Civic - ABC123	John Smith	tire-rotation	pending	12	0	\N	2025-09-12 14:18:53.571362	2025-09-12 14:18:53.571362	\N
5ccabe05-3c68-4a6b-811f-924956cfd5b0	7f41f745-9bd5-45cc-a19c-0720bcfa89fa	82b5e029-39de-4455-834c-fe9e34fe8870	2018 Toyota Camry - XYZ789	Sarah Johnson	brake-inspection	pending	12	0	\N	2025-09-12 14:19:31.303155	2025-09-12 14:19:31.303155	\N
0251eed6-9fc9-446b-b041-86cb3bc935d7	3698824c-4d43-4b48-8e5c-bdf3d8c85724	e5da953e-24c0-43b7-a121-dbc5ff929bb9	2020 Honda Civic - ABC123	John Smith	brake-inspection	pending	12	0	\N	2025-10-21 02:18:25.54825	2025-10-21 14:38:18.804	\N
\.


--
-- Data for Name: integration_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.integration_settings (id, google_reviews_enabled, google_reviews_api_key, stripe_enabled, stripe_api_key, stripe_publishable_key, twilio_enabled, twilio_account_sid, twilio_auth_token, twilio_phone_number, updated_at) FROM stdin;
e672723d-eaae-4f67-a8bd-86f23dae3a6e	f	\N	t	\N	\N	f	\N	\N	\N	2025-10-21 16:29:16.196
\.


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.inventory (id, part_number, name, description, category, quantity, min_stock, unit_cost, selling_price, supplier, supplier_part_number, location, last_ordered, notes, created_at, updated_at) FROM stdin;
2f76c822-19a6-406b-89eb-e833ab98e753	141	awejhf	awjehfqj	asdjkfhaj	16	17	1.52	1.29				\N		2025-10-21 14:00:10.953804	2025-10-21 14:00:20.665
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.invoices (id, invoice_number, customer_id, repair_order_id, subtotal, tax, total, status, due_date, paid_at, payment_method, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.messages (id, conversation_id, direction, content, phone_from, phone_to, status, is_read, twilio_sid, sent_by, created_at) FROM stdin;
3f577741-6602-4c50-b5a9-af8e789185f4	c5714c11-f9ba-4ca6-b636-1829d9932139	outbound	klj	+15551234567	+15559876543	sent	f	\N	6fb6342f-0dc4-4720-99ff-3590d07b5d69	2025-10-21 17:05:30.367788
f0bc407b-0068-45e5-9e2b-07b6fe3d6267	3ca914c5-c60f-4001-bb9a-ed8781280f45	outbound	Test message for AutoFlow GMS!	+15551234567	+155596lT5hg	sent	f	\N	6fb6342f-0dc4-4720-99ff-3590d07b5d69	2025-10-21 17:08:08.602736
fe361c46-21f7-4dff-90b0-dca1490e3188	52cf1be3-c1e3-4e39-bd90-3b0310e76f6a	outbound	asdfasd	+15551234567	+15559876543	sent	f	\N	6fb6342f-0dc4-4720-99ff-3590d07b5d69	2025-10-21 17:08:20.837052
394bb79d-ee27-4ccd-94f3-0e6c4ab67653	3ca914c5-c60f-4001-bb9a-ed8781280f45	outbound	Follow-up test message	+15551234567	+155596lT5hg	sent	f	\N	6fb6342f-0dc4-4720-99ff-3590d07b5d69	2025-10-21 17:09:04.491847
cfb9db54-e0b8-418d-807b-31e9909610e7	52cf1be3-c1e3-4e39-bd90-3b0310e76f6a	outbound	hi	+15551234567	+15559876543	sent	f	\N	6fb6342f-0dc4-4720-99ff-3590d07b5d69	2025-10-21 17:09:19.578101
\.


--
-- Data for Name: notification_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notification_settings (id, email_notifications, sms_notifications, appointment_reminders, payment_notifications, updated_at) FROM stdin;
81fef942-062b-4a85-b316-f8863fb8962e	t	f	f	t	2025-10-21 16:29:06.32
\.


--
-- Data for Name: operating_hours; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.operating_hours (id, day_of_week, is_open, open_time, close_time, updated_at) FROM stdin;
7f37aea9-772a-45df-8115-8761cf4ec0de	0	f	08:00	18:00	2025-10-21 16:31:08.33248
61f002eb-b6d4-4356-bc7f-c02dc474e1bb	1	f	08:00	18:00	2025-10-21 16:31:08.33248
f3afab97-6fb3-4221-a7a6-d81caf6080bb	2	t	08:00	18:00	2025-10-21 16:31:08.33248
f78f675b-3ed9-4170-b736-2cd955dc0492	3	t	08:00	18:00	2025-10-21 16:31:08.33248
8e60f1e0-1d4e-4521-8803-13776449a109	4	t	08:00	18:00	2025-10-21 16:31:08.33248
ad40934f-c16d-43b9-bcd1-d1ad6575baca	5	t	08:00	18:00	2025-10-21 16:31:08.33248
4833ae64-a823-42b9-839e-1b0b8d587cfe	6	f	08:00	18:00	2025-10-21 16:31:08.33248
\.


--
-- Data for Name: repair_orders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.repair_orders (id, order_number, customer_id, vehicle_id, appointment_id, technician_id, status, priority, description, diagnosis, estimated_cost, actual_cost, labor_hours, started_at, completed_at, created_at, updated_at) FROM stdin;
407df44e-6791-4d29-b76c-e43b90a71aad	RO-1757687607805	3698824c-4d43-4b48-8e5c-bdf3d8c85724	e5da953e-24c0-43b7-a121-dbc5ff929bb9	\N	d208dd69-4a4c-4716-8193-59eac18e900b	completed	high	descccc		20.00	\N	84.00	\N	\N	2025-09-12 14:33:47.091453	2025-10-21 12:41:40.128
c58d7ffe-7a60-4fde-82d7-6f7d7f8e0552	RO-1761063596132	7f41f745-9bd5-45cc-a19c-0720bcfa89fa	82b5e029-39de-4455-834c-fe9e34fe8870	\N	\N	created	urgent			\N	\N	\N	\N	\N	2025-10-21 16:20:31.925602	2025-10-21 16:20:52.134
\.


--
-- Data for Name: review_campaigns; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.review_campaigns (id, name, description, status, trigger, delay_days, email_template, sms_template, sent_count, response_count, created_at, updated_at) FROM stdin;
1953c26e-51f2-4ed0-b4a4-22f83b13946a	sdfjsdqkljsd	ksdlfgjklq	active	post_service	1			0	0	2025-10-21 16:19:02.7186	2025-10-21 16:31:38.584
1495c765-c0ee-4b90-aa0c-6a3f81601611			active	post_service	1			0	0	2025-10-21 16:18:50.42356	2025-10-21 16:31:44.932
4f6b11d6-e12c-4e3c-8278-4b2f36d7a4f4	afkl	kjsdlkfj	paused	post_service	1			0	0	2025-10-21 16:34:16.136476	2025-10-21 16:34:35.285
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.reviews (id, customer_id, campaign_id, rating, comment, platform, is_public, response_text, responded_at, created_at) FROM stdin;
\.


--
-- Data for Name: security_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.security_settings (id, two_factor_enabled, session_timeout, password_min_length, require_special_char, require_numbers, require_uppercase, ip_whitelist, login_attempts_limit, updated_at) FROM stdin;
c8abf334-7aca-46a4-847a-533a79307dda	f	30	8	t	t	t	\N	5	2025-10-21 16:29:21.776
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (sid, sess, expire) FROM stdin;
rzFsTglKisA_TxdGDUZb9Ndp08iYvxZe	{"cookie": {"path": "/", "secure": false, "expires": "2025-10-27T16:06:34.317Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": "2455eee6-7262-4b94-b52e-2520427c0fe9"}}	2025-10-27 16:06:35
daLJU4p-RRmZrvXW1qP1VvhAwn2b7jMp	{"cookie": {"path": "/", "secure": false, "expires": "2025-10-27T15:14:01.801Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": "febba519-7c5c-4192-8749-4055b821be51"}}	2025-10-27 15:18:38
wtBe7tov8fghALmOGF-qj8TjCPUjiTH-	{"cookie": {"path": "/", "secure": false, "expires": "2025-10-28T17:01:31.658Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": "6fb6342f-0dc4-4720-99ff-3590d07b5d69"}}	2025-10-28 17:03:39
RB13RhP25F47jYiExv2Lrq_z2M6IYEcN	{"cookie": {"path": "/", "secure": false, "expires": "2025-10-28T16:18:47.902Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": "a169929b-1dc1-4f3d-8868-6e3416e02c1f"}}	2025-10-28 16:20:22
71-mM5nYtY2x3FcBc9k2MlWX_OrpMHjL	{"cookie": {"path": "/", "secure": false, "expires": "2025-10-28T17:06:46.355Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": "6fb6342f-0dc4-4720-99ff-3590d07b5d69"}}	2025-10-28 17:09:06
QShYV_0DFWHbI42EQsmwWXkk7bp7ZRn3	{"cookie": {"path": "/", "secure": false, "expires": "2025-10-27T15:46:25.992Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": "10e4295d-4aaf-46c0-9952-8067446cc98f"}}	2025-10-27 15:56:46
hHqeLKyphV2P9jwpJDkNU5Mc-mR7TRgY	{"cookie": {"path": "/", "secure": false, "expires": "2025-10-28T16:23:04.919Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": "4cee52ab-2baa-425c-8b4b-21e9bac6a2d2"}}	2025-10-28 16:23:08
o9Bn_KKEuF29t2FbuxRWlIdPQliv4sY5	{"cookie": {"path": "/", "secure": false, "expires": "2025-10-28T16:47:51.038Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": "6fb6342f-0dc4-4720-99ff-3590d07b5d69"}}	2025-10-28 16:49:04
xxCM9EprBjg2cc3BQ9h0yAw4GQFUWYE_	{"cookie": {"path": "/", "secure": false, "expires": "2025-10-28T16:52:35.436Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": "6fb6342f-0dc4-4720-99ff-3590d07b5d69"}}	2025-10-28 16:57:18
ddM0Vs0OrxVKA3ztniWClhlUI8C7-tLg	{"cookie": {"path": "/", "secure": false, "expires": "2025-10-27T14:56:27.844Z", "httpOnly": true, "originalMaxAge": 604800000}}	2025-10-27 14:58:59
WD5prTwXXTUd9d6ab2EKTJ9uHD5tnwMk	{"cookie": {"path": "/", "secure": false, "expires": "2025-10-27T15:07:10.515Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": "3ce6f6ae-fe9e-4224-9789-ebc845f91e82"}}	2025-10-27 15:07:20
ZIH0bAS6GjQWZ5FhWULQg46Z1W5fzPJd	{"cookie": {"path": "/", "secure": false, "expires": "2025-10-28T17:10:35.067Z", "httpOnly": true, "originalMaxAge": 604800000}}	2025-10-28 17:10:42
JXnc95EEz6rM25pzM7npDpzwEHL9DAWx	{"cookie": {"path": "/", "secure": false, "expires": "2025-10-28T01:57:03.171Z", "httpOnly": true, "originalMaxAge": 604800000}}	2025-10-28 01:57:06
jFhZcbyZ4DDl6C9YmRqs-GD8uc2I1yHR	{"cookie": {"path": "/", "secure": false, "expires": "2025-10-28T01:46:07.364Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": "6fb6342f-0dc4-4720-99ff-3590d07b5d69"}}	2025-10-28 14:48:45
\.


--
-- Data for Name: system_health; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.system_health (id, component, status, response_time, details, checked_at) FROM stdin;
d1c56c4c-42eb-4763-9c59-688784f535bb	Database	healthy	2	{"queries": "responsive", "connection": "active"}	2025-09-01 01:32:46.26273
d885469d-472c-412a-b9e3-0a6dcf387781	Authentication	healthy	314	{"service": "replit-auth", "sessions": "active"}	2025-09-01 01:32:46.488773
b30ce930-4292-4765-83bb-60eb8f2dae4f	API Server	healthy	642	{"memory": "normal", "uptime": "99.9%"}	2025-09-01 01:32:46.702316
cae6e572-9dac-4d42-8cae-4bc0957a30f7	Storage	healthy	904	{"disk": "85%", "backup": "current"}	2025-09-01 01:32:46.884491
46fd1ace-b642-47e5-8a61-3747990d8579	Database	healthy	2	{"queries": "responsive", "connection": "active"}	2025-09-11 22:53:10.083321
a700b8a2-3e39-4837-8dff-8c384f82e523	Authentication	healthy	315	{"service": "replit-auth", "sessions": "active"}	2025-09-11 22:53:10.267428
72528756-f278-4333-903f-50cb7cd81cde	API Server	healthy	604	{"memory": "normal", "uptime": "99.9%"}	2025-09-11 22:53:10.438508
5e27651e-f6ee-4cfb-99a9-660665f44d21	Storage	healthy	909	{"disk": "85%", "backup": "current"}	2025-09-11 22:53:10.650194
ab8cb36e-b038-4757-a0bd-909f09115496	Database	healthy	1	{"queries": "responsive", "connection": "active"}	2025-10-20 14:53:49.68208
bcccf55a-4a9c-4e27-97d9-212c4d7e3f8c	Authentication	healthy	301	{"service": "replit-auth", "sessions": "active"}	2025-10-20 14:53:49.831323
7d5e58e3-1725-45d2-8c50-c61205bd2ea3	API Server	healthy	601	{"memory": "normal", "uptime": "99.9%"}	2025-10-20 14:53:49.900967
a99ea765-d7f5-45e9-8dba-414b0bc0290b	Storage	healthy	901	{"disk": "85%", "backup": "current"}	2025-10-20 14:53:49.946285
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, first_name, last_name, profile_image_url, role, created_at, updated_at, username, password) FROM stdin;
d19d48ef-9996-496e-a18c-afa08d0be094	tanvir.netmow1@gmail.com	Tanvir	Ahmed	\N	user	2025-09-06 14:56:38.310067	2025-09-06 14:56:38.310067	tanvir1234	$2b$12$Oh0WOa79yYVkWc0nfOJGa.wq2U7Mz9q5/uZas.QSP3Q7eYEsOhqli
bdf44fe8-c663-4134-93d5-b40c6648e421	anisuzzaman650@gmai.com	Abir	Hasan	\N	user	2025-09-10 06:44:09.305013	2025-09-10 06:44:09.305013	abir	$2b$12$yFQa5xHR97AuGLpnYpqXfeyrbcvxJ3dHUEZXx12mjOmBl463kQn/S
66028bfb-4222-4cbe-b2e6-62db0523f68a	danielmalka@liv.com	dan	malka	\N	user	2025-09-11 20:40:50.160239	2025-09-11 20:40:50.160239	danmalka	$2b$12$q38mBoy73Cg5amzXTJ6Z0OjXfV9G36h8T86ZG8gRCrDa1II4kmLi6
ebe0a23f-ef99-4513-86d0-b0d45a65444f	johndoe@email.com	John	Doe	\N	admin	2025-09-06 11:19:53.229236	2025-09-06 11:19:53.229236	johndoe	$2b$12$lMbmJVwtmx4/.HhDt2.gaOj0doBWlnDH1tYyk7oAA53A2g5CGjEoy
fb25791f-5c47-4d91-8d16-ef8eb6ebe4f6	cleint@gmai.com	cleint	Ha	\N	client	2025-09-12 17:41:18.566158	2025-09-12 17:41:18.566158	client	$2b$12$sPTsDsBo4xkOIm4XY16PMe/BRySxW1gXAN24V4uU0czp0xv2L9W.K
83bea52d-046d-4103-81a7-e349a4d5685b	michel@mail.com	michel	malka	\N	user	2025-09-12 17:02:52.638065	2025-09-12 18:02:55.323	michel	$2b$12$UyZ.lWVBb0ABJbWybdwp5eAAnl0roLJ5WL7EcyMCqEbfI4ou6n9tW
def6e232-9972-4e14-8c41-2aa73da1344d	test@user.com	test	user	\N	client	2025-10-20 14:36:58.577664	2025-10-20 14:36:58.577664	test	$2b$12$y91zIL9MEvxvFcQtt2zEC.q1ZsrbZnhvGujdGJaFfo5Y6CukNSOXe
3ce6f6ae-fe9e-4224-9789-ebc845f91e82	admin@autoflow.test	Admin	User	\N	admin	2025-10-20 14:54:31.091174	2025-10-20 14:54:31.091174	admin-test	$2b$12$NKBVdRA2.TXgdKRX8h.J5uCch1SVe2MxuucNdxXw4Bzca6dYwLucq
febba519-7c5c-4192-8749-4055b821be51	admin-scroll@test.com	Admin	Manager	\N	admin	2025-10-20 15:11:21.426175	2025-10-20 15:11:21.426175	admin-scroll-test	$2b$12$x68LUEhNsUHe20TOh6kcFu//4LfvAPHBm4ihLwaVhwN6iYfF.b/e6
10e4295d-4aaf-46c0-9952-8067446cc98f	testuser8cyL11@test.com	Test	UserSyF	\N	admin	2025-10-20 15:46:25.574482	2025-10-20 15:51:47.045	testuserEPsv	$2b$12$HNGePrQ/mlBJ5B54M5elNuhfPXj8JYamfnYrcRn80QLj1e57NYzpe
2455eee6-7262-4b94-b52e-2520427c0fe9	testadminpWpfnO@test.com	Test	Admin	\N	client	2025-10-20 16:06:33.945721	2025-10-20 16:06:33.945721	testadminhUHe	$2b$12$bkZxFh0FzIzDZ9bhd0A0TuoXe28Es0TXNEKkebgtYWtJvOWGcC6Vq
3421391f-e2fd-4a45-956d-bfccfd036dc5	autotest+m2S6@example.com	Auto	Tester	\N	client	2025-10-21 01:52:06.837262	2025-10-21 01:52:06.837262	autotest_m2S6	$2b$12$oddSJUP5kxtIQiQQemxI4.G/W9Cx/Fk1.31.8qgo/qv9W3c2Aabo6
d208dd69-4a4c-4716-8193-59eac18e900b	tanvir.netmow@gmail.com	Tanvir	Ahmed	\N	client	2025-09-06 14:29:52.403722	2025-10-21 12:48:37.196	tanvir1418	$2b$12$rgszRNNfTWO6NbeRgY0q2ug6U0MY/eqGfs98taO5ghYpU9dW3Kt/O
2a07ba00-d14a-49ba-ad58-d3893dd6003e	admin@test.com	\N	\N	\N	admin	2025-10-21 13:24:22.963767	2025-10-21 13:24:22.963767	\N	\N
9bb778e3-4e05-4082-88be-f0694a825d3c	test456@example.com	Test	User	\N	client	2025-10-21 16:03:44.264876	2025-10-21 16:03:44.264876	testuser456	$2b$12$1bIou5p3qaRBV6kvxC7/H.PI5JXJ5a1jkOD2.fNEvyQ3T8fX6utNa
75267dd3-5185-40da-b284-fae0c652804c	testuserP_OVn_@example.com	Test	User	\N	client	2025-10-21 16:04:47.195992	2025-10-21 16:04:47.195992	u_jDk2x8CeGY	$2b$12$C3Ts2lb1Cd9XcoyyFSuQfOX3i1mHp.rFXFM5ImPFaeCKbHJazdT4W
a169929b-1dc1-4f3d-8868-6e3416e02c1f	test9egxzV@example.com	Test	User	\N	client	2025-10-21 16:18:47.78741	2025-10-21 16:18:47.78741	ArtJWk9Y0w	$2b$12$by9Y3c5/6thes/VKumX.9O7m0U/6vKl5Qmw63xHokV1cQsr4.SDii
system	system@autoflow.internal	System	Account	\N	admin	2025-10-21 16:21:53.657634	2025-10-21 16:21:53.657634	system	not-a-real-password-hash
4cee52ab-2baa-425c-8b4b-21e9bac6a2d2	test3HsjcI@example.com	Test	User	\N	client	2025-10-21 16:23:04.471374	2025-10-21 16:23:04.471374	te7CjG1pL8	$2b$12$0QeTg36awFpw5wrdEafoteuSqjJxKdaoi8Fb5RgVZZQ0rl/7UhaL2
6fb6342f-0dc4-4720-99ff-3590d07b5d69	admin@garage.com	Admin	User	\N	admin	2025-09-12 17:01:02.924032	2025-10-21 16:46:43.478784	admin	$2b$12$GriulwoYUZH9EAB6HIt1j.Z1jPH6V1Vv/AL1juzhj1NrUazg9zXD.
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.vehicles (id, customer_id, year, make, model, vin, license_plate, color, mileage, notes, created_at, updated_at) FROM stdin;
e5da953e-24c0-43b7-a121-dbc5ff929bb9	3698824c-4d43-4b48-8e5c-bdf3d8c85724	2020	Honda	Civic	JHMFB1120LA123456	ABC123	Silver	45000	\N	2025-08-31 14:47:36.97581	2025-08-31 14:47:36.97581
82b5e029-39de-4455-834c-fe9e34fe8870	7f41f745-9bd5-45cc-a19c-0720bcfa89fa	2018	Toyota	Camry	JTDBF22K580123456	XYZ789	Blue	62000	\N	2025-08-31 14:47:38.29235	2025-08-31 14:47:38.29235
\.


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: billing_settings billing_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.billing_settings
    ADD CONSTRAINT billing_settings_pkey PRIMARY KEY (id);


--
-- Name: business_settings business_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: customers customers_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_unique UNIQUE (email);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: inspections inspections_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_pkey PRIMARY KEY (id);


--
-- Name: integration_settings integration_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.integration_settings
    ADD CONSTRAINT integration_settings_pkey PRIMARY KEY (id);


--
-- Name: inventory inventory_part_number_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_part_number_key UNIQUE (part_number);


--
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_unique UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notification_settings notification_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT notification_settings_pkey PRIMARY KEY (id);


--
-- Name: operating_hours operating_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.operating_hours
    ADD CONSTRAINT operating_hours_pkey PRIMARY KEY (id);


--
-- Name: repair_orders repair_orders_order_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.repair_orders
    ADD CONSTRAINT repair_orders_order_number_unique UNIQUE (order_number);


--
-- Name: repair_orders repair_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.repair_orders
    ADD CONSTRAINT repair_orders_pkey PRIMARY KEY (id);


--
-- Name: review_campaigns review_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.review_campaigns
    ADD CONSTRAINT review_campaigns_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: security_settings security_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.security_settings
    ADD CONSTRAINT security_settings_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: system_health system_health_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_health
    ADD CONSTRAINT system_health_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_vin_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_vin_unique UNIQUE (vin);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: appointments appointments_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: appointments appointments_vehicle_id_vehicles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_vehicle_id_vehicles_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: audit_log audit_log_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: conversations conversations_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: inspections inspections_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: inspections inspections_repair_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_repair_order_id_fkey FOREIGN KEY (repair_order_id) REFERENCES public.repair_orders(id);


--
-- Name: inspections inspections_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: invoices invoices_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: invoices invoices_repair_order_id_repair_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_repair_order_id_repair_orders_id_fk FOREIGN KEY (repair_order_id) REFERENCES public.repair_orders(id);


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);


--
-- Name: messages messages_sent_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sent_by_fkey FOREIGN KEY (sent_by) REFERENCES public.users(id);


--
-- Name: repair_orders repair_orders_appointment_id_appointments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.repair_orders
    ADD CONSTRAINT repair_orders_appointment_id_appointments_id_fk FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);


--
-- Name: repair_orders repair_orders_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.repair_orders
    ADD CONSTRAINT repair_orders_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: repair_orders repair_orders_technician_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.repair_orders
    ADD CONSTRAINT repair_orders_technician_id_users_id_fk FOREIGN KEY (technician_id) REFERENCES public.users(id);


--
-- Name: repair_orders repair_orders_vehicle_id_vehicles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.repair_orders
    ADD CONSTRAINT repair_orders_vehicle_id_vehicles_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: reviews reviews_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.review_campaigns(id);


--
-- Name: reviews reviews_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: vehicles vehicles_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

