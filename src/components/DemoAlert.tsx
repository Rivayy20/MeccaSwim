'use client';

import React from 'react';

// DemoAlert provides a reusable onClick handler that stops event propagation
// and shows an alert (using browser alert or toast if we had one set up)
export const handleDemoAction = (e?: React.MouseEvent | React.FormEvent) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  alert("Mode Demo: Fitur perubahan data dinonaktifkan untuk alasan keamanan.");
};

export function DemoAlertWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div onClickCapture={handleDemoAction}>
      {children}
    </div>
  );
}
