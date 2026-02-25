import React from "react";

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {children}
    </main>
  );
};

export default PublicLayout;
