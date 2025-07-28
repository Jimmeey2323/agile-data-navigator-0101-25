import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLeads } from '@/contexts/LeadContext';
import { LeadsTable } from '@/components/LeadsTable';
import { LeadsCardView } from '@/components/LeadsCardView';
import { LeadsKanbanView } from '@/components/LeadsKanbanView';
import { MetricsPanel } from '@/components/MetricsPanel';
import { FilterPanel } from '@/components/FilterPanel';
import { SearchBar } from '@/components/SearchBar';
import { QuickFilters } from '@/components/QuickFilters';
import { LeadAnalytics } from '@/components/LeadAnalytics';
import { AssociateAnalytics } from '@/components/AssociateAnalytics';
import { LeadPerformanceView } from '@/components/LeadPerformanceView';
import { LeadTrendsView } from '@/components/LeadTrendsView';
import { CSVUploadView } from '@/components/CSVUploadView';
import { AIInsightsView } from '@/components/AIInsightsView';
import { PivotView } from '@/components/PivotView';
import { EditLeadModal } from '@/components/EditLeadModal';
import { SmartLeadScoring } from '@/components/SmartLeadScoring';
import { PaginationControls } from '@/components/PaginationControls';
import { 
  Plus, 
  Download, 
  Upload, 
  Filter, 
  Search, 
  RefreshCw, 
  Settings, 
  BarChart3,
  Users,
  TrendingUp,
  Brain,
  Table,
  LayoutGrid,
  KanbanSquare,
  Calendar,
  FileText,
  Target
} from 'lucide-react';

export default function Index() {
  const {
    filteredLeads,
    loading,
    filters,
    setFilters,
    clearFilters,
    view,
    setView,
    displayMode,
    setDisplayMode,
    refreshData,
    isRefreshing,
    lastRefreshed,
    statusCounts,
    sourceStats,
    associateStats,
    convertedLeadsCount,
    ltv,
    conversionRate,
    sourceOptions,
    associateOptions,
    centerOptions,
    stageOptions,
    statusOptions,
    addToSearchHistory,
    updateLead,
    addLead,
    deleteLead
  } = useLeads();

  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  const handleLeadClick = (lead: any) => {
    setSelectedLead(lead);
    setShowEditModal(true);
  };

  const handleAddLead = () => {
    setSelectedLead(null);
    setShowAddModal(true);
  };

  const handleSaveLead = async (lead: any) => {
    try {
      if (selectedLead) {
        await updateLead(lead);
      } else {
        await addLead(lead);
      }
      setShowEditModal(false);
      setShowAddModal(false);
      setSelectedLead(null);
    } catch (error) {
      console.error('Error saving lead:', error);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLead(leadId);
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const handleSearchChange = (term: string) => {
    setFilters({ ...filters, search: term });
    if (term) {
      addToSearchHistory(term);
    }
  };

  const handleSourceFilter = (sources: string[]) => {
    setFilters({ ...filters, source: sources });
  };

  const handleAssociateFilter = (associates: string[]) => {
    setFilters({ ...filters, associate: associates });
  };

  const handleCenterFilter = (centers: string[]) => {
    setFilters({ ...filters, center: centers });
  };

  const handleStageFilter = (stages: string[]) => {
    setFilters({ ...filters, stage: stages });
  };

  const handleStatusFilter = (statuses: string[]) => {
    setFilters({ ...filters, status: statuses });
  };

  const handleDateRangeFilter = (start: Date | null, end: Date | null) => {
    setFilters({ ...filters, dateRange: { start, end } });
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredLeads.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +2.1% from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Converted</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{convertedLeadsCount}</div>
                  <p className="text-xs text-muted-foreground">
                    {conversionRate.toFixed(1)}% conversion rate
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total LTV</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{ltv.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +15.3% from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statusCounts.Hot || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Require immediate attention
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(sourceStats).map(([source, count]) => (
                      <div key={source} className="flex justify-between items-center">
                        <span className="text-sm">{source}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Associates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(associateStats).map(([associate, count]) => (
                      <div key={associate} className="flex justify-between items-center">
                        <span className="text-sm">{associate}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
        
      case 'table':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SearchBar onSearch={handleSearchChange} />
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button size="sm" onClick={handleAddLead}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lead
                </Button>
              </div>
            </div>

            <QuickFilters
              onSourceFilter={handleSourceFilter}
              onAssociateFilter={handleAssociateFilter}
              onCenterFilter={handleCenterFilter}
              onStageFilter={handleStageFilter}
              onStatusFilter={handleStatusFilter}
            />

            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={handleClearFilters}
            />

            <LeadsTable />
            
            <PaginationControls />
          </div>
        );
        
      case 'cards':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <SearchBar onSearch={handleSearchChange} />
              <Button size="sm" onClick={handleAddLead}>
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </div>
            <LeadsCardView />
          </div>
        );
        
      case 'kanban':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <SearchBar onSearch={handleSearchChange} />
              <Button size="sm" onClick={handleAddLead}>
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </div>
            <LeadsKanbanView />
          </div>
        );
        
      case 'analytics':
        return <LeadAnalytics />;
        
      case 'associates':
        return <AssociateAnalytics />;
        
      case 'performance':
        return <LeadPerformanceView />;
        
      case 'trends':
        return <LeadTrendsView />;
        
      case 'upload':
        return <CSVUploadView />;
        
      case 'ai':
        return <AIInsightsView />;
        
      case 'pivot':
        return <PivotView />;
        
      case 'scoring':
        return <SmartLeadScoring />;
        
      default:
        return <div>Select a view</div>;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center gap-2">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">LeadFlow CRM</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredLeads.length} leads • Last updated {lastRefreshed.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="border-b">
              <TabsList className="grid w-full grid-cols-12 h-auto p-1">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center gap-2">
                  <Table className="h-4 w-4" />
                  Table
                </TabsTrigger>
                <TabsTrigger value="cards" className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Cards
                </TabsTrigger>
                <TabsTrigger value="kanban" className="flex items-center gap-2">
                  <KanbanSquare className="h-4 w-4" />
                  Kanban
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="associates" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Associates
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trends
                </TabsTrigger>
                <TabsTrigger value="pivot" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Pivot
                </TabsTrigger>
                <TabsTrigger value="scoring" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Scoring
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Insights
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="p-6">
                {renderMainContent()}
              </div>
            </div>
          </Tabs>
        </div>
      </div>

      {showEditModal && (
        <EditLeadModal
          lead={selectedLead}
          onSave={handleSaveLead}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}
