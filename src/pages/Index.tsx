
import React, { useState, useCallback } from 'react';
import { EditLeadModal } from '@/components/EditLeadModal';
import { LeadsTable } from '@/components/LeadsTable';
import { LeadsCardView } from '@/components/LeadsCardView';
import { LeadTrendsView } from '@/components/LeadTrendsView';
import { OptimizedKanbanView } from '@/components/OptimizedKanbanView';
import { EnhancedPivotView } from '@/components/EnhancedPivotView';
import { EnhancedAssociateAnalytics } from '@/components/EnhancedAssociateAnalytics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  ArrowDown, 
  ArrowUp, 
  Edit, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  TrendingUp,
  Users,
  Calendar,
  Trello,
  LayoutDashboard,
  BarChart3,
  UserCog2,
  ListChecks
} from 'lucide-react';
import { useLeads, LeadFilters, ViewType } from '@/contexts/LeadContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"

export default function Index() {
  const { 
    filters, 
    setFilters, 
    clearFilters, 
    sourceOptions, 
    associateOptions, 
    centerOptions, 
    stageOptions, 
    statusOptions, 
    statusCounts, 
    sourceStats, 
    associateStats, 
    convertedLeadsCount, 
    ltv, 
    conversionRate, 
    addToSearchHistory, 
    searchHistory, 
    clearSearchHistory,
    view,
    setView
  } = useLeads();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  
  const handleLeadClick = (lead) => {
    setSelectedLead(lead);
    setIsEditModalOpen(true);
  };
  
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedLead(null);
  };
  
  const handleSearchChange = (e) => {
    const searchTerm = e.target.value;
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };
  
  const handleAddToSearchHistory = (term) => {
    addToSearchHistory(term);
  };
  
  const handleClearSearchHistory = () => {
    clearSearchHistory();
  };
  
  const handleSourceFilterChange = (value: string[]) => {
    setFilters(prev => ({ ...prev, source: value }));
  };
  
  const handleAssociateFilterChange = (value: string[]) => {
    setFilters(prev => ({ ...prev, associate: value }));
  };
  
  const handleCenterFilterChange = (value: string[]) => {
    setFilters(prev => ({ ...prev, center: value }));
  };
  
  const handleStageFilterChange = (value: string[]) => {
    setFilters(prev => ({ ...prev, stage: value }));
  };
  
  const handleStatusFilterChange = (value: string[]) => {
    setFilters(prev => ({ ...prev, status: value }));
  };
  
  const handleDateRangeChange = (date: { start: Date | null; end: Date | null }) => {
    setFilters(prev => ({ ...prev, dateRange: date }));
  };
  
  const handleClearFilters = () => {
    clearFilters();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Lead Management Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Track and manage your leads effectively.
            </p>
          </div>
          <Button variant="default" onClick={() => setIsEditModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </div>
        
        {/* Search and Filter Section */}
        <div className="mb-4 flex items-center justify-between">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search leads..."
              className="bg-white pl-10 shadow-sm"
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Popover open={isFilterPopoverOpen} onOpenChange={setIsFilterPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4 shadow-md">
                <ScrollArea className="h-[400px] w-full rounded-md border">
                  <div className="p-4">
                    <h4 className="mb-4 font-medium">Filter Leads</h4>
                    
                    <Separator className="my-2" />
                    
                    <div className="space-y-2">
                      <Label htmlFor="source">Source:</Label>
                      <div className="space-y-2">
                        {sourceOptions.map(source => (
                          <div key={source} className="flex items-center space-x-2">
                            <Checkbox
                              id={source}
                              checked={filters.source.includes(source)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleSourceFilterChange([...filters.source, source]);
                                } else {
                                  handleSourceFilterChange(filters.source.filter(s => s !== source));
                                }
                              }}
                            />
                            <Label htmlFor={source} className="text-sm">{source}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div className="space-y-2">
                      <Label htmlFor="associate">Associate:</Label>
                      <div className="space-y-2">
                        {associateOptions.map(associate => (
                          <div key={associate} className="flex items-center space-x-2">
                            <Checkbox
                              id={associate}
                              checked={filters.associate.includes(associate)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleAssociateFilterChange([...filters.associate, associate]);
                                } else {
                                  handleAssociateFilterChange(filters.associate.filter(a => a !== associate));
                                }
                              }}
                            />
                            <Label htmlFor={associate} className="text-sm">{associate}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div className="space-y-2">
                      <Label htmlFor="center">Center:</Label>
                      <div className="space-y-2">
                        {centerOptions.map(center => (
                          <div key={center} className="flex items-center space-x-2">
                            <Checkbox
                              id={center}
                              checked={filters.center.includes(center)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleCenterFilterChange([...filters.center, center]);
                                } else {
                                  handleCenterFilterChange(filters.center.filter(c => c !== center));
                                }
                              }}
                            />
                            <Label htmlFor={center} className="text-sm">{center}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div className="space-y-2">
                      <Label htmlFor="stage">Stage:</Label>
                      <div className="space-y-2">
                        {stageOptions.map(stage => (
                          <div key={stage} className="flex items-center space-x-2">
                            <Checkbox
                              id={stage}
                              checked={filters.stage.includes(stage)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleStageFilterChange([...filters.stage, stage]);
                                } else {
                                  handleStageFilterChange(filters.stage.filter(s => s !== stage));
                                }
                              }}
                            />
                            <Label htmlFor={stage} className="text-sm">{stage}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div className="space-y-2">
                      <Label htmlFor="status">Status:</Label>
                      <div className="space-y-2">
                        {statusOptions.map(status => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox
                              id={status}
                              checked={filters.status.includes(status)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleStatusFilterChange([...filters.status, status]);
                                } else {
                                  handleStatusFilterChange(filters.status.filter(s => s !== status));
                                }
                              }}
                            />
                            <Label htmlFor={status} className="text-sm">{status}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <div className="flex justify-end p-3">
                  <Button variant="secondary" size="sm" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Search className="mr-2 h-4 w-4" />
                  Search History
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0">
                <Command>
                  <CommandInput placeholder="Type a command or search..." />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="History">
                      {searchHistory.map((term) => (
                        <CommandItem
                          key={term}
                          onSelect={() => {
                            handleAddToSearchHistory(term);
                            setFilters(prev => ({ ...prev, search: term }));
                          }}
                        >
                          <span>{term}</span>
                          <CommandShortcut>
                            <ArrowUp className="mr-2 h-4 w-4" />
                          </CommandShortcut>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandItem onSelect={handleClearSearchHistory}>
                      Clear History
                    </CommandItem>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {/* Metrics and Quick Filters */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center space-x-4 p-4">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <div>
                <h3 className="text-lg font-semibold">{convertedLeadsCount}</h3>
                <p className="text-sm text-gray-500">Converted Leads</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center space-x-4 p-4">
              <Users className="h-6 w-6 text-blue-500" />
              <div>
                <h3 className="text-lg font-semibold">{Object.keys(associateStats).length}</h3>
                <p className="text-sm text-gray-500">Active Associates</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center space-x-4 p-4">
              <Calendar className="h-6 w-6 text-orange-500" />
              <div>
                <h3 className="text-lg font-semibold">{sourceOptions.length}</h3>
                <p className="text-sm text-gray-500">Lead Sources</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center space-x-4 p-4">
              <Trello className="h-6 w-6 text-purple-500" />
              <div>
                <h3 className="text-lg font-semibold">{statusOptions.length}</h3>
                <p className="text-sm text-gray-500">Lead Statuses</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Section */}
          <div className="w-full lg:w-1/4">
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="mb-2 text-sm font-medium">Status Overview</h3>
                  <div className="space-y-2">
                    {Object.entries(statusCounts).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm">{status}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="mb-2 text-sm font-medium">Top Lead Sources</h3>
                  <div className="space-y-2">
                    {Object.entries(sourceStats)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([source, count]) => (
                        <div key={source} className="flex items-center justify-between">
                          <span className="text-sm">{source}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="mb-2 text-sm font-medium">Top Associates</h3>
                  <div className="space-y-2">
                    {Object.entries(associateStats)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([associate, count]) => (
                        <div key={associate} className="flex items-center justify-between">
                          <span className="text-sm">{associate}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="mb-2 text-sm font-medium">Financial Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">LTV</span>
                      <span className="font-semibold">₹{ltv.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Conversion Rate</span>
                      <span className="font-semibold">{conversionRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="flex-1 space-y-6">
            
            <Tabs value={view} onValueChange={(value) => setView(value as ViewType)} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="card">Cards</TabsTrigger>
                <TabsTrigger value="kanban">Kanban</TabsTrigger>
                <TabsTrigger value="pivot">Pivot</TabsTrigger>
                <TabsTrigger value="associate">Associates</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>
              
              <TabsContent value="table" className="space-y-4">
                <LeadsTable />
              </TabsContent>
              
              <TabsContent value="card" className="space-y-4">
                <LeadsCardView onLeadClick={handleLeadClick} />
              </TabsContent>
              
              <TabsContent value="kanban" className="space-y-4">
                <OptimizedKanbanView onLeadClick={handleLeadClick} />
              </TabsContent>
              
              <TabsContent value="pivot" className="space-y-4">
                <EnhancedPivotView />
              </TabsContent>
              
              <TabsContent value="associate" className="space-y-4">
                <EnhancedAssociateAnalytics />
              </TabsContent>
              
              <TabsContent value="timeline" className="space-y-4">
                <LeadTrendsView />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Lead Edit Modal */}
      <EditLeadModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        lead={selectedLead}
      />
    </div>
  );
}
