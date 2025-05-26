
import React, { useState } from 'react';
import { LeadProvider, useLeads } from '@/contexts/LeadContext';
import { Header } from '@/components/Header';
import { MetricsPanel } from '@/components/MetricsPanel';
import { SearchBar } from '@/components/SearchBar';
import { QuickFilters } from '@/components/QuickFilters';
import { FilterPanel } from '@/components/FilterPanel';
import { LeadsTable } from '@/components/LeadsTable';
import { LeadsCardView } from '@/components/LeadsCardView';
import { LeadsKanbanView } from '@/components/LeadsKanbanView';
import { PivotView } from '@/components/PivotView';
import { AIInsightsView } from '@/components/AIInsightsView';
import { CSVUploadView } from '@/components/CSVUploadView';
import { PaginationControls } from '@/components/PaginationControls';
import { EditLeadModal } from '@/components/EditLeadModal';
import { Toaster } from '@/components/ui/sonner';

// Main Index component wrapped with provider
function IndexContent() {
  const { view, filteredLeads, loading } = useLeads();
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleLeadClick = (lead: any) => {
    setSelectedLead(lead);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedLead(null);
    setIsEditModalOpen(false);
  };

  const renderView = () => {
    switch (view) {
      case 'table':
        return <LeadsTable onLeadClick={handleLeadClick} />;
      case 'card':
        return <LeadsCardView onLeadClick={handleLeadClick} />;
      case 'kanban':
        return <LeadsKanbanView onLeadClick={handleLeadClick} />;
      case 'pivot':
        return <PivotView />;
      case 'ai-insights':
        return <AIInsightsView />;
      case 'csv-upload':
        return <CSVUploadView />;
      default:
        return <LeadsTable onLeadClick={handleLeadClick} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto p-4 space-y-6">
        <MetricsPanel />
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/4">
            <FilterPanel />
          </div>
          
          <div className="lg:w-3/4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchBar />
              </div>
            </div>
            
            <QuickFilters />
            
            <div className="bg-card rounded-lg border shadow-sm">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading leads...</p>
                </div>
              ) : (
                <>
                  {renderView()}
                  
                  {(view === 'table' || view === 'card') && filteredLeads.length > 0 && (
                    <div className="border-t p-4">
                      <PaginationControls />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <EditLeadModal
        lead={selectedLead}
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
      />
      
      <Toaster />
    </div>
  );
}

// Export the wrapped component
export default function Index() {
  return (
    <LeadProvider>
      <IndexContent />
    </LeadProvider>
  );
}
