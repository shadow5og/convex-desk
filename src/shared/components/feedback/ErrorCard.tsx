import React from "react";

interface ErrorCardProps {
  message?: string;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({ message = "Something went wrong." }) => (
  <div className="p-4 border border-destructive bg-destructive/10 text-destructive rounded-lg">
    {message}
  </div>
);
