
import React, { useState } from 'react';
import { LeadProvider, useLeads, Lead, LeadFilters } from '@/contexts/LeadContext';
import { EditLeadModal } from '@/components/EditLeadModal';
import { LeadsTable } from '@/components/LeadsTable';
import { OptimizedKanbanView } from '@/components/OptimizedKanbanView';
import { LeadsCardView } from '@/components/LeadsCardView';
import { EnhancedPivotView } from '@/components/EnhancedPivotView';
import { EnhancedAssociateAnalytics } from '@/components/EnhancedAssociateAnalytics';
import { LeadPerformanceView } from '@/components/LeadPerformanceView';
import { LeadTrendsView } from '@/components/LeadTrendsView';
import { CSVUploadView } from '@/components/CSVUploadView';
import { AIInsightsView } from '@/components/AIInsightsView';
import { MetricsPanel } from '@/components/MetricsPanel';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel } from '@/components/FilterPanel';
import { QuickFilters } from '@/components/QuickFilters';
import { PaginationControls } from '@/components/PaginationControls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  Grid, 
  BarChart3, 
  Users, 
  TrendingUp, 
  Upload, 
  Brain, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Settings, 
  RefreshCw,
  Calendar,
  Target,
  Award,
  Activity,
  Layers,
  PieChart,
  LineChart,
  User
} from 'lucide-react';
import { toast } from 'sonner';

// Create a simple date range picker component
const DateRangePicker = ({ onDateRangeChange, className }: { 
  onDateRangeChange: (start: Date | null, end: Date | null) => void;
  className?: string;
}) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartDate(value);
    const start = value ? new Date(value) : null;
    const end = endDate ? new Date(endDate) : null;
    onDateRangeChange(start, end);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndDate(value);
    const start = startDate ? new Date(startDate) : null;
    const end = value ? new Date(value) : null;
    onDateRangeChange(start, end);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Input
        type="date"
        value={startDate}
        onChange={handleStartDateChange}
        placeholder="Start date"
        className="w-32"
      />
      <Input
        type="date"
        value={endDate}
        onChange={handleEndDateChange}
        placeholder="End date"
        className="w-32"
      />
    </div>
  );
};

function LeadsApp() {
  const { 
    filteredLeads, 
    filters, 
    setFilters, 
    clearFilters, 
    view, 
    setView, 
    loading, 
    error, 
    refreshData,
    isRefreshing,
    lastRefreshed,
    updateLead,
    deleteLead
  } = useLeads();
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setShowEditModal(true);
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowEditModal(true);
  };

  const handleSaveLead = async (lead: Lead) => {
    try {
      await updateLead(lead);
      setShowEditModal(false);
      setSelectedLead(null);
      toast.success('Lead updated successfully');
    } catch (error) {
      toast.error('Failed to update lead');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteLead(leadId);
        toast.success('Lead deleted successfully');
      } catch (error) {
        toast.error('Failed to delete lead');
      }
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilters((prev: LeadFilters) => ({ ...prev, search: term }));
  };

  const handleSourceFilter = (sources: string[]) => {
    setFilters((prev: LeadFilters) => ({ ...prev, source: sources }));
  };

  const handleAssociateFilter = (associates: string[]) => {
    setFilters((prev: LeadFilters) => ({ ...prev, associate: associates }));
  };

  const handleCenterFilter = (centers: string[]) => {
    setFilters((prev: LeadFilters) => ({ ...prev, center: centers }));
  };

  const handleStageFilter = (stages: string[]) => {
    setFilters((prev: LeadFilters) => ({ ...prev, stage: stages }));
  };

  const handleStatusFilter = (statuses: string[]) => {
    setFilters((prev: LeadFilters) => ({ ...prev, status: statuses }));
  };

  const handleDateRangeFilter = (start: Date | null, end: Date | null) => {
    setFilters((prev: LeadFilters) => ({ 
      ...prev, 
      dateRange: { start, end } 
    }));
  };

  const handleRefresh = async () => {
    try {
      await refreshData();
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    }
  };

  const handleViewChange = (newView: string) => {
    setView(newView as any);
  };

  const renderContent = () => {
    switch (view) {
      case 'table':
        return (
          <LeadsTable 
            onLeadClick={handleLeadClick}
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
          />
        );
      case 'kanban':
        return <OptimizedKanbanView onLeadClick={handleLeadClick} />;
      case 'card':
        return <LeadsCardView onLeadClick={handleLeadClick} />;
      case 'pivot':
        return <EnhancedPivotView />;
      case 'associate':
        return <EnhancedAssociateAnalytics />;
      case 'performance':
        return <LeadPerformanceView />;
      case 'trends':
        return <LeadTrendsView />;
      case 'upload':
        return <CSVUploadView />;
      case 'ai':
        return <AIInsightsView />;
      default:
        return <LeadsTable onLeadClick={handleLeadClick} onEditLead={handleEditLead} onDeleteLead={handleDeleteLead} />;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Activity className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Data</h2>
            <p className="text-red-600 mb-4">{error.message}</p>
            <Button onClick={handleRefresh} variant="outline" className="border-red-300 text-red-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Lead Management System</h1>
            <p className="text-slate-600 mt-1">
              Manage and track your leads efficiently • Last updated: {lastRefreshed.toLocaleTimeString()}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="default"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-slate-300"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="border-slate-300"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Metrics Panel */}
        <MetricsPanel />

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DateRangePicker
                onDateRangeChange={handleDateRangeFilter}
                className="w-auto"
              />
              <Badge variant="outline" className="bg-white">
                {filteredLeads.length} leads
              </Badge>
            </div>
          </div>
          
          {showFilters && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Source</label>
                  <Select onValueChange={(value) => handleSourceFilter([value])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Associate</label>
                  <Select onValueChange={(value) => handleAssociateFilter([value])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select associate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Associates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select onValueChange={(value) => handleStatusFilter([value])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="hot">Hot</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="cold">Cold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* View Tabs */}
        <Tabs value={view} onValueChange={handleViewChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 bg-white border border-slate-200 rounded-lg p-1">
            <TabsTrigger value="table" className="flex items-center gap-2 text-xs lg:text-sm">
              <Table className="h-4 w-4" />
              Table
            </TabsTrigger>
            <TabsTrigger value="kanban" className="flex items-center gap-2 text-xs lg:text-sm">
              <Layers className="h-4 w-4" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="card" className="flex items-center gap-2 text-xs lg:text-sm">
              <Grid className="h-4 w-4" />
              Cards
            </TabsTrigger>
            <TabsTrigger value="pivot" className="flex items-center gap-2 text-xs lg:text-sm">
              <PieChart className="h-4 w-4" />
              Pivot
            </TabsTrigger>
            <TabsTrigger value="associate" className="flex items-center gap-2 text-xs lg:text-sm">
              <User className="h-4 w-4" />
              Associate
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2 text-xs lg:text-sm">
              <Target className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2 text-xs lg:text-sm">
              <LineChart className="h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2 text-xs lg:text-sm">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2 text-xs lg:text-sm">
              <Brain className="h-4 w-4" />
              AI
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={view} className="mt-6">
            {renderContent()}
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {view === 'table' && (
          <div className="flex justify-center">
            <PaginationControls />
          </div>
        )}
      </div>

      {/* Modals */}
      <EditLeadModal
        lead={selectedLead}
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSave={handleSaveLead}
      />
    </div>
  );
}

export default function Index() {
  return (
    <LeadProvider>
      <LeadsApp />
    </LeadProvider>
  );
}
