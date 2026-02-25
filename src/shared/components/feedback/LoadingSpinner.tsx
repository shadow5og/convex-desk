import React from "react";

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Loading..." }) => (
  <div className="flex flex-col justify-center items-center h-48 gap-3">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);
