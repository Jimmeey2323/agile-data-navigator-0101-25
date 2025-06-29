
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EditLeadFormHandler } from '@/components/EditLeadFormHandler';
import { Lead } from '@/services/googleSheets';

interface SimpleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  selectedLeads?: string[];
  clearSelection?: () => void;
}

export const SimpleEditModal: React.FC<SimpleEditModalProps> = ({
  isOpen,
  onClose,
  lead,
  selectedLeads = [],
  clearSelection
}) => {
  console.log('SimpleEditModal render:', { isOpen, leadId: lead?.id, selectedLeadsCount: selectedLeads.length });

  const modalTitle = selectedLeads.length > 0 
    ? `Bulk Edit (${selectedLeads.length} leads)`
    : lead?.id?.startsWith('new-') 
    ? 'Add New Lead'
    : 'Edit Lead';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-white border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 -m-6 mb-0 rounded-t-lg">
          <DialogTitle className="text-xl font-semibold">{modalTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="-m-6 mt-0">
          <EditLeadFormHandler 
            lead={lead}
            onClose={onClose}
            selectedLeads={selectedLeads}
            clearSelection={clearSelection}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
