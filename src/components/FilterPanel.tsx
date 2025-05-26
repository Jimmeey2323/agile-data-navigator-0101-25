import React, { useState } from 'react';
import { 
  Check, 
  ChevronDown, 
  Calendar as CalendarIcon, 
  X,
  Tag,
  Filter,
  ChevronUp
} from 'lucide-react';
import { useLeads } from '@/contexts/LeadContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function FilterPanel() {
  const { 
    filters, 
    setFilters, 
    clearFilters, 
    sourceOptions, 
    associateOptions, 
    centerOptions, 
    stageOptions, 
    statusOptions 
  } = useLeads();
  
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Multi-select state management
  const [sourceOpen, setSourceOpen] = useState(false);
  const [associateOpen, setAssociateOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [stageOpen, setStageOpen] = useState(false);

  const handleQuickFilter = (period: string) => {
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    switch (period) {
      case 'this-week':
        start = new Date(now.setDate(now.getDate() - now.getDay()));
        end = new Date();
        break;
      case 'last-week':
        const lastWeekStart = new Date(now.setDate(now.getDate() - now.getDay() - 7));
        const lastWeekEnd = new Date(now.setDate(now.getDate() - now.getDay() - 1));
        start = lastWeekStart;
        end = lastWeekEnd;
        break;
      case 'this-month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date();
        break;
      case 'last-month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'this-quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = new Date();
        break;
      case 'this-year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date();
        break;
    }

    setFilters({
      ...filters,
      dateRange: { start, end }
    });
  };

  const MultiSelectField = ({ 
    options, 
    selected, 
    onSelectionChange, 
    placeholder, 
    open, 
    onOpenChange,
    colorScheme = 'primary'
  }: {
    options: string[];
    selected: string[];
    onSelectionChange: (values: string[]) => void;
    placeholder: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    colorScheme?: string;
  }) => {
    // Ensure options and selected are always arrays
    const safeOptions = options || [];
    const safeSelected = selected || [];
    
    return (
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={`justify-between min-w-[200px] border-2 ${safeSelected.length > 0 ? 'border-primary/50 bg-primary/5' : 'border-gray-200'}`}>
            {safeSelected.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="font-medium">{placeholder}</span>
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  {safeSelected.length}
                </Badge>
              </div>
            ) : (
              placeholder
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {safeOptions.map((option) => (
                <CommandItem
                  key={option}
                  onSelect={() => {
                    const newSelected = safeSelected.includes(option)
                      ? safeSelected.filter(item => item !== option)
                      : [...safeSelected, option];
                    onSelectionChange(newSelected);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      safeSelected.includes(option) ? "opacity-100 text-primary" : "opacity-0"
                    )}
                  />
                  <span className={safeSelected.includes(option) ? "font-medium text-primary" : ""}>{option}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  // Count active filters - ensure all filter arrays exist
  const activeFilterCount = 
    (filters.source?.length || 0) + 
    (filters.associate?.length || 0) + 
    (filters.center?.length || 0) + 
    (filters.stage?.length || 0) + 
    (filters.status?.length || 0) + 
    (filters.dateRange?.start ? 1 : 0) + 
    (filters.dateRange?.end ? 1 : 0);

  return (
    <Card className="shadow-lg border-2 border-primary/20 animate-fade-in bg-gradient-to-r from-primary/5 to-primary/10">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-primary/10 transition-colors rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Filters & Quick Actions</h3>
              {activeFilterCount > 0 && (
                <Badge className="bg-primary text-primary-foreground">{activeFilterCount}</Badge>
              )}
            </div>
            {isExpanded ? <ChevronUp className="h-5 w-5 text-primary" /> : <ChevronDown className="h-5 w-5 text-primary" />}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4">
          {/* Quick Filter Buttons */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-3 text-primary">Quick Date Filters</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'this-week', label: 'This Week' },
                { key: 'last-week', label: 'Last Week' },
                { key: 'this-month', label: 'This Month' },
                { key: 'last-month', label: 'Last Month' },
                { key: 'this-quarter', label: 'This Quarter' },
                { key: 'this-year', label: 'This Year' }
              ].map(period => (
                <Button
                  key={period.key}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFilter(period.key)}
                  className="text-xs border-2 border-primary/20 hover:bg-primary/10 hover:border-primary/40"
                >
                  {period.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Multi-select Filters */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <MultiSelectField
                options={sourceOptions || []}
                selected={filters.source || []}
                onSelectionChange={(values) => setFilters({ ...filters, source: values })}
                placeholder="Sources"
                open={sourceOpen}
                onOpenChange={setSourceOpen}
              />

              <MultiSelectField
                options={associateOptions || []}
                selected={filters.associate || []}
                onSelectionChange={(values) => setFilters({ ...filters, associate: values })}
                placeholder="Associates"
                open={associateOpen}
                onOpenChange={setAssociateOpen}
              />

              <MultiSelectField
                options={statusOptions || []}
                selected={filters.status || []}
                onSelectionChange={(values) => setFilters({ ...filters, status: values })}
                placeholder="Status"
                open={statusOpen}
                onOpenChange={setStatusOpen}
              />

              <MultiSelectField
                options={stageOptions || []}
                selected={filters.stage || []}
                onSelectionChange={(values) => setFilters({ ...filters, stage: values })}
                placeholder="Stages"
                open={stageOpen}
                onOpenChange={setStageOpen}
              />

              {/* Center Dropdown */}
              <Select
                value={filters.center?.length > 0 ? filters.center[0] : "all-centers"}
                onValueChange={(value) => setFilters({ ...filters, center: value === "all-centers" ? [] : [value] })}
              >
                <SelectTrigger className={`min-w-[200px] border-2 ${filters.center?.length > 0 ? 'border-primary/50 bg-primary/5' : 'border-gray-200'}`}>
                  <SelectValue placeholder="Select Center" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-centers">All Centers</SelectItem>
                  {(centerOptions || []).map((center) => (
                    <SelectItem key={center} value={center}>
                      {center}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Range Filter */}
              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={`min-w-[200px] justify-start border-2 ${filters.dateRange.start ? 'border-primary/50 bg-primary/5' : 'border-gray-200'}`}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.start ? (
                      filters.dateRange.end ? (
                        <>
                          {format(filters.dateRange.start, "LLL dd")} -{" "}
                          {format(filters.dateRange.end, "LLL dd")}
                        </>
                      ) : (
                        format(filters.dateRange.start, "LLL dd, y")
                      )
                    ) : (
                      "Date Range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{
                      from: filters.dateRange.start || undefined,
                      to: filters.dateRange.end || undefined,
                    }}
                    onSelect={(range) => {
                      setFilters({
                        ...filters,
                        dateRange: {
                          start: range?.from || null,
                          end: range?.to || null,
                        }
                      });
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Clear Filters Button */}
            <div className="flex justify-end pt-4 border-t border-primary/20">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
                disabled={activeFilterCount === 0}
                className="gap-2 border-2 border-destructive/20 text-destructive hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
                Clear All Filters
              </Button>
            </div>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-primary/20">
                <span className="text-sm font-semibold text-primary">Active Filters:</span>
                {(filters.source || []).map(source => (
                  <Badge key={source} variant="outline" className="gap-1 border-primary/30 text-primary">
                    Source: {source}
                    <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => 
                      setFilters({ ...filters, source: (filters.source || []).filter(s => s !== source) })
                    } />
                  </Badge>
                ))}
                {(filters.associate || []).map(associate => (
                  <Badge key={associate} variant="outline" className="gap-1 border-primary/30 text-primary">
                    Associate: {associate}
                    <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => 
                      setFilters({ ...filters, associate: (filters.associate || []).filter(a => a !== associate) })
                    } />
                  </Badge>
                ))}
                {(filters.status || []).map(status => (
                  <Badge key={status} variant="outline" className="gap-1 border-primary/30 text-primary">
                    Status: {status}
                    <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => 
                      setFilters({ ...filters, status: (filters.status || []).filter(s => s !== status) })
                    } />
                  </Badge>
                ))}
                {(filters.stage || []).map(stage => (
                  <Badge key={stage} variant="outline" className="gap-1 border-primary/30 text-primary">
                    Stage: {stage}
                    <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => 
                      setFilters({ ...filters, stage: (filters.stage || []).filter(s => s !== stage) })
                    } />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
