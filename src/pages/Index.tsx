import { Suspense, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  MoveRight, 
  BarChart3, 
  Table, 
  Kanban, 
  Clock, 
  GitBranch, 
  Settings, 
  Users, 
  FileSpreadsheet, 
  BrainCircuit,
  Plus,
  Calendar,
  RefreshCw,
  Grid3X3,
  Upload,
  Filter,
  SlidersHorizontal,
  Eye,
  EyeOff,
  ExternalLink,
  HelpCircle,
  Bell,
  TrendingUp,
  Activity,
  UserCheck,
  Brain,
  Sparkles,
  MessageSquare,
  Download
} from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { SearchBar } from "@/components/SearchBar";
import { MetricsPanel } from "@/components/MetricsPanel";
import { LeadsTable } from "@/components/LeadsTable";
import { FilterPanel } from "@/components/FilterPanel";
import { EditLeadModal } from "@/components/EditLeadModal";
import { LeadsCardView } from "@/components/LeadsCardView";
import { LeadsKanbanView } from "@/components/LeadsKanbanView";
import { LeadsFollowUpView } from "@/components/LeadsFollowUpView";
import { PivotView } from "@/components/PivotView";
import { CSVUploadView } from "@/components/CSVUploadView";
import { AssociatesDashboard } from "@/components/AssociatesDashboard";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { AISettingsModal } from "@/components/AISettingsModal";
import { ExportModal } from "@/components/ExportModal";
import { ConsolidatedInsightsView } from "@/components/ConsolidatedInsightsView";
import { useLeads } from "@/contexts/LeadContext";
import { ThemeToggle, useTheme } from "@/contexts/ThemeContext";
import { PaginationControls } from "@/components/PaginationControls";
import { aiService } from "@/services/aiService";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Lead } from "@/services/googleSheets";
import { QuickFilters } from "@/components/QuickFilters";

const Index = () => {
  const { refreshData, isRefreshing, settings, updateSettings, addLead } = useLeads();
  const { isDark } = useTheme();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedView, setSelectedView] = useState<string>("table");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [aiSettingsOpen, setAiSettingsOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [compactMode, setCompactMode] = useState(false);
  const [isAIConfigured, setIsAIConfigured] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  useEffect(() => {
    setIsAIConfigured(aiService.isConfigured());
  }, []);

  const handleLeadClick = (lead: any) => {
    setSelectedLead(lead);
    setEditModalOpen(true);
  };

  const handleBulkEdit = () => {
    setSelectedLead(null);
    setEditModalOpen(true);
  };

  const handleAddNewLead = () => {
    const newLead: Lead = {
      id: `new-${Date.now()}`,
      fullName: "",
      email: "",
      phone: "",
      source: "Website",
      associate: "",
      status: "New",
      stage: "Initial Contact",
      createdAt: new Date().toISOString().split('T')[0],
      center: "",
      remarks: ""
    };
    
    setSelectedLead(newLead);
    setEditModalOpen(true);
  };

  const openExpirationsManager = () => {
    window.open('https://membership-expiry-navigator-40-rcm1.vercel.app/', '_blank');
  };

  const handleViewChange = (view: string) => {
    setSelectedView(view);
  };

  const handleDisplaySettings = () => {
    const columns = settings.visibleColumns || [];
    
    // Toggle compact mode
    updateSettings({
      ...settings,
      rowHeight: compactMode ? 48 : 36,
    });
    
    setCompactMode(!compactMode);
    
    toast.success(`${compactMode ? 'Standard' : 'Compact'} view enabled`);
  };

  const handleSettingsClick = () => {
    // Open settings panel
    toast.success("Settings panel opened");
  };

  const handleAISettings = () => {
    setAiSettingsOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 backdrop-blur-md">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                Agile Data Navigator
              </h1>
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-100 to-teal-100 dark:from-blue-900/50 dark:to-teal-900/50 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300">
                <Activity className="w-4 h-4" />
                Lead Management Portal
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur border-slate-200 dark:border-slate-700">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Last updated 2 min ago</span>
              </Button>
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Help/Onboarding Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowOnboarding(true)}
                className="gap-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur border-slate-200 dark:border-slate-700"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Help</span>
              </Button>
              
              {/* AI Settings Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAISettings}
                className={`gap-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur border-slate-200 dark:border-slate-700 ${isAIConfigured ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300' : ''}`}
              >
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isAIConfigured ? 'AI Enabled' : 'Setup AI'}
                </span>
                {isAIConfigured && <Sparkles className="w-3 h-3" />}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-9 h-9 p-0">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleAISettings}>
                    <Brain className="mr-2 h-4 w-4" />
                    <span>AI Configuration</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSettingsClick}>
                    <Users className="mr-2 h-4 w-4" />
                    <span>User Preferences</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.success("API settings opened")}>
                    <GitBranch className="mr-2 h-4 w-4" />
                    <span>API Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.success("Notifications opened")}>
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.success("Help center opened")}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help Center</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-4">
        <div className="flex flex-col-reverse sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2 w-full sm:w-auto">
            <SearchBar />
            <Button 
              variant="outline" 
              size="sm" 
              className={`gap-2 ${showFilters ? 'bg-primary/10 text-primary' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
          <a 
            href="https://membership-expiry-navigator-40-rcm1.vercel.app/" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full sm:w-auto gap-2"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Expirations Manager
          </a>
            <Button 
              className="w-full sm:w-auto gap-2 bg-gradient-to-r from-blue-500 to-teal-600 hover:from-blue-600 hover:to-teal-700 transition-all"
              onClick={handleAddNewLead}
            >
              <Plus className="h-4 w-4" />
              <span>Add New Lead</span>
            </Button>
          </div>
        </div>

      </div>

      {showFilters && (
        <div className="container py-2 mb-4">
          <FilterPanel />
        </div>
      )}

      <div className="container py-2">
        <MetricsPanel />
      </div>

      <div className="container flex-1 py-4 pb-8">
        <Tabs defaultValue="leads-main" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <TabsList className="grid grid-cols-4 md:grid-cols-8 w-full sm:w-auto bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-1 rounded-xl shadow-sm">
              <TabsTrigger value="leads-main" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-teal-500/20 rounded-lg">
                <Table className="w-4 h-4" />
                <span className="hidden md:inline">Leads</span>
              </TabsTrigger>
              <TabsTrigger value="card-view" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-teal-500/20 rounded-lg">
                <Grid3X3 className="w-4 h-4" />
                <span className="hidden md:inline">Cards</span>
              </TabsTrigger>
              <TabsTrigger value="kanban-view" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-teal-500/20 rounded-lg">
                <Kanban className="w-4 h-4" />
                <span className="hidden md:inline">Kanban</span>
              </TabsTrigger>
              <TabsTrigger value="followup-view" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-teal-500/20 rounded-lg">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden md:inline">Follow-ups</span>
              </TabsTrigger>
              <TabsTrigger value="pivot-view" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-teal-500/20 rounded-lg">
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden md:inline">Pivot</span>
              </TabsTrigger>
              <TabsTrigger value="csv-upload" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-teal-500/20 rounded-lg">
                <Upload className="w-4 h-4" />
                <span className="hidden md:inline">CSV Upload</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-teal-500/20 rounded-lg">
                <BrainCircuit className="w-4 h-4" />
                <span className="hidden md:inline">Insights</span>
                {isAIConfigured && <Sparkles className="w-3 h-3" />}
              </TabsTrigger>
              <TabsTrigger value="associates" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-teal-500/20 rounded-lg">
                <UserCheck className="w-4 h-4" />
                <span className="hidden md:inline">Associates</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2 w-full sm:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Display</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium">Display Settings</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Row Display</span>
                        <Button variant="outline" size="sm" onClick={handleDisplaySettings}>
                          {compactMode ? (
                            <Eye className="mr-2 h-4 w-4" />
                          ) : (
                            <EyeOff className="mr-2 h-4 w-4" />
                          )}
                          {compactMode ? 'Standard View' : 'Compact View'}
                        </Button>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Visible Columns</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['fullName', 'email', 'phone', 'source', 'associate', 'stage', 'status'].map(col => (
                            <div key={col} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`col-${col}`}
                                checked={settings.visibleColumns?.includes(col)}
                                onChange={(e) => {
                                  const visibleColumns = e.target.checked
                                    ? [...(settings.visibleColumns || []), col]
                                    : (settings.visibleColumns || []).filter(c => c !== col);
                                  
                                  updateSettings({ ...settings, visibleColumns });
                                }}
                                className="rounded border-gray-300"
                              />
                              <label htmlFor={`col-${col}`} className="text-sm capitalize">
                                {col === 'fullName' ? 'Name' : col}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              {selectedLeads.length > 0 && (
                <Button size="sm" className="gap-2" onClick={handleBulkEdit}>
                  <Users className="w-4 h-4" />
                  <span>Bulk Edit ({selectedLeads.length})</span>
                </Button>
              )}
              <Button 
                size="sm" 
                variant="outline"
                className="gap-2"
                onClick={() => setExportModalOpen(true)}
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>
              <Button 
                size="sm" 
                className="gap-2"
                onClick={refreshData}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>

          <TabsContent value="leads-main" className="mt-0">
            <Card className="shadow-md border-border/30 mb-4 glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Lead Management</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className={`gap-2 ${selectedView === "table" ? "bg-primary/10 text-primary" : ""}`} onClick={() => handleViewChange("table")}>
                      <Table className={`h-4 w-4`} />
                      <span>Table</span>
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  View and manage all leads with advanced filtering, sorting, and editing options.
                </p>
              </CardHeader>
            </Card>

            {/* Add QuickFilters component above the table */}
            <div className="mb-4">
              <QuickFilters />
            </div>

            <Suspense fallback={<div className="py-8 text-center">Loading leads data...</div>}>
              <LeadsTable 
                onLeadClick={handleLeadClick} 
                selectedLeads={selectedLeads}
                setSelectedLeads={setSelectedLeads}
                compactMode={compactMode}
              />
              <div className="mt-4">
                <PaginationControls />
              </div>
            </Suspense>
          </TabsContent>

          <TabsContent value="card-view" className="mt-0">
            <Card className="shadow-md border-border/30 mb-4 glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Card View</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  View leads in a card layout for a more visual experience.
                </p>
              </CardHeader>
            </Card>
            <LeadsCardView onLeadClick={handleLeadClick} />
            <div className="mt-4">
              <PaginationControls />
            </div>
          </TabsContent>

          <TabsContent value="kanban-view" className="mt-0">
            <Card className="shadow-md border-border/30 mb-4 glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Kanban View</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  View and manage leads in a kanban board layout.
                </p>
              </CardHeader>
            </Card>
            <LeadsKanbanView onLeadClick={handleLeadClick} />
          </TabsContent>

          <TabsContent value="followup-view" className="mt-0">
            <Card className="shadow-md border-border/30 mb-4 glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Follow-up Comments View
                  </CardTitle>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  View all leads with their follow-up comments and interaction history.
                </p>
              </CardHeader>
            </Card>
            <LeadsFollowUpView onLeadClick={handleLeadClick} />
          </TabsContent>

          <TabsContent value="pivot-view" className="mt-0">
            <Card className="shadow-md border-border/30 mb-4 glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Pivot Analysis</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Analyze your lead data with customizable pivot tables.
                </p>
              </CardHeader>
            </Card>
            <PivotView />
          </TabsContent>

          <TabsContent value="csv-upload" className="mt-0">
            <Card className="shadow-md border-border/30 mb-4 glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">CSV Upload</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Import leads from CSV files with custom mapping and processing.
                </p>
              </CardHeader>
            </Card>
            <CSVUploadView />
          </TabsContent>

          <TabsContent value="insights" className="mt-0">
            <ConsolidatedInsightsView />
          </TabsContent>

          <TabsContent value="associates" className="mt-0">
            <AssociatesDashboard />
          </TabsContent>
        </Tabs>
      </div>

      <EditLeadModal 
        isOpen={editModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        lead={selectedLead}
        selectedLeads={selectedLeads}
        clearSelection={() => setSelectedLeads([])}
      />

      <AISettingsModal 
        isOpen={aiSettingsOpen}
        onClose={() => {
          setAiSettingsOpen(false);
          setIsAIConfigured(aiService.isConfigured());
        }}
      />

      <OnboardingFlow 
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => {
          setShowOnboarding(false);
          toast.success("Welcome! Explore your enhanced lead management system.");
        }}
      />

      <ExportModal 
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />

      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-teal-600 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Agile Data Navigator</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Powered by AI • Built with ❤️</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {isAIConfigured && (
                <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-full">
                  <Sparkles className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300">AI Enhanced</span>
                </div>
              )}
              
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Last synced: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
