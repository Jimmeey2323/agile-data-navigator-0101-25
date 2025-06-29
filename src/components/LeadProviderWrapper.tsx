
import React from 'react';
import { LeadProvider } from '@/contexts/LeadContext';

interface LeadProviderWrapperProps {
  children: React.ReactNode;
}

export const LeadProviderWrapper: React.FC<LeadProviderWrapperProps> = ({ children }) => {
  console.log('LeadProviderWrapper rendering');
  
  return (
    <LeadProvider>
      {children}
    </LeadProvider>
  );
};
