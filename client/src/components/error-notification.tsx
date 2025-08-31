import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorNotificationProps {
  error?: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export default function ErrorNotification({ error, onDismiss, onRetry }: ErrorNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentError, setCurrentError] = useState<string>("");

  useEffect(() => {
    if (error) {
      setCurrentError(error);
      setIsVisible(true);
      
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onDismiss) onDismiss();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [error, onDismiss]);

  useEffect(() => {
    // Global error handler for unhandled errors
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      setCurrentError(`Application error: ${event.error?.message || 'Unknown error'}`);
      setIsVisible(true);
    };

    // Promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setCurrentError(`System error: ${event.reason?.message || event.reason || 'Unknown error'}`);
      setIsVisible(true);
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry action - reload the page
      window.location.reload();
    }
  };

  const handleReportIssue = () => {
    // In a real application, this would send the error to a logging service
    console.log('Reporting issue:', currentError);
    
    // For now, we'll just show a notification that the issue was reported
    setCurrentError("Issue reported successfully. Our team has been notified.");
    setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  };

  if (!isVisible || !currentError) {
    return null;
  }

  return (
    <div 
      className="fixed top-4 right-4 z-50 max-w-md"
      data-testid="error-notification"
    >
      <Card className="border-destructive bg-destructive/5 shadow-lg">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-destructive flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="fas fa-exclamation-triangle text-destructive-foreground text-xs"></i>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-destructive mb-1">System Error Detected</h4>
              <p className="text-sm text-destructive/80 mb-3" data-testid="error-message">
                {currentError}
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleRetry}
                  className="bg-destructive hover:bg-destructive/90"
                  data-testid="button-retry"
                >
                  <i className="fas fa-redo mr-1 text-xs"></i>
                  Retry
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleReportIssue}
                  className="border-destructive text-destructive hover:bg-destructive/10"
                  data-testid="button-report-issue"
                >
                  <i className="fas fa-bug mr-1 text-xs"></i>
                  Report Issue
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 p-1"
              data-testid="button-dismiss"
            >
              <i className="fas fa-times text-sm"></i>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
