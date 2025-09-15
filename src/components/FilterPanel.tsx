import React, { useState } from 'react';
import { Check, ChevronDown, Calendar as CalendarIcon, X, Tag } from 'lucide-react';
import { useLeads } from '@/contexts/LeadContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
  const [sourceOpen, setSourceOpen] = useState(false);
  const [associateOpen, setAssociateOpen] = useState(false);
  const [centerOpen, setCenterOpen] = useState(false);
  const [stageOpen, setStageOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const handleSourceChange = (value: string) => {
    const currentValues = [...filters.source];
    const index = currentValues.indexOf(value);
    
    if (index > -1) {
      currentValues.splice(index, 1);
    } else {
      currentValues.push(value);
    }
    
    setFilters({ ...filters, source: currentValues });
  };

  const handleAssociateChange = (value: string) => {
    const currentValues = [...filters.associate];
    const index = currentValues.indexOf(value);
    
    if (index > -1) {
      currentValues.splice(index, 1);
    } else {
      currentValues.push(value);
    }
    
    setFilters({ ...filters, associate: currentValues });
  };

  const handleCenterChange = (value: string) => {
    const currentValues = [...filters.center];
    const index = currentValues.indexOf(value);
    
    if (index > -1) {
      currentValues.splice(index, 1);
    } else {
      currentValues.push(value);
    }
    
    setFilters({ ...filters, center: currentValues });
  };

  const handleStageChange = (value: string) => {
    const currentValues = [...filters.stage];
    const index = currentValues.indexOf(value);
    
    if (index > -1) {
      currentValues.splice(index, 1);
    } else {
      currentValues.push(value);
    }
    
    setFilters({ ...filters, stage: currentValues });
  };

  const handleStatusChange = (value: string) => {
    const currentValues = [...filters.status];
    const index = currentValues.indexOf(value);
    
    if (index > -1) {
      currentValues.splice(index, 1);
    } else {
      currentValues.push(value);
    }
    
    setFilters({ ...filters, status: currentValues });
  };

  const handleStartDateChange = (date: Date | null) => {
    setFilters({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        start: date,
      },
    });
  };

  const handleEndDateChange = (date: Date | null) => {
    setFilters({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        end: date,
      },
    });
  };

  const handleClearDateRange = () => {
    setFilters({
      ...filters,
      dateRange: {
        start: null,
        end: null
      }
    });
    setDatePopoverOpen(false);
  };

  // Count active filters
  const activeFilterCount = 
    filters.source.length + 
    filters.associate.length + 
    filters.center.length + 
    filters.stage.length + 
    filters.status.length + 
    (filters.dateRange.start ? 1 : 0) + 
    (filters.dateRange.end ? 1 : 0);

  const MultiSelectFilter = ({ 
    title, 
    options, 
    selectedValues, 
    onValueChange, 
    open, 
    setOpen,
    icon 
  }: {
    title: string;
    options: string[];
    selectedValues: string[];
    onValueChange: (value: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    icon?: React.ReactNode;
  }) => {
    const allSelected = options.length > 0 && selectedValues.length === options.length;
    const noneSelected = selectedValues.length === 0;
    
    const handleSelectAll = () => {
      options.forEach(option => {
        if (!selectedValues.includes(option)) onValueChange(option);
      });
    };
    
    const handleDeselectAll = () => {
      selectedValues.forEach(option => onValueChange(option));
    };
    
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2 h-9 border-slate-300 hover:bg-slate-100 backdrop-blur-sm bg-white/80">
            {icon}
            {title}
            {selectedValues.length > 0 && (
              <Badge className="ml-1 bg-gradient-to-r from-blue-500 to-teal-400 text-white shadow-sm">{selectedValues.length}</Badge>
            )}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0 border-0 shadow-2xl rounded-2xl bg-white/95 backdrop-blur-lg" align="start">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-2xl">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs px-3 py-1.5 hover:bg-blue-100 text-blue-600 font-medium" 
              onClick={handleSelectAll} 
              disabled={allSelected}
            >
              Select All
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs px-3 py-1.5 hover:bg-red-100 text-red-600 font-medium" 
              onClick={handleDeselectAll} 
              disabled={noneSelected}
            >
              Deselect All
            </Button>
          </div>
          <Command className="bg-transparent">
            <CommandInput placeholder={`Search ${title.toLowerCase()}...`} className="border-0 focus:ring-0" />
            <CommandList className="max-h-64">
              <CommandEmpty className="py-6 text-center text-sm text-slate-500">No {title.toLowerCase()} found.</CommandEmpty>
              <CommandGroup className="p-2">
                {options.map((option) => (
                  <CommandItem
                    key={option}
                    onSelect={() => onValueChange(option)}
                    className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border-2 transition-colors",
                      selectedValues.includes(option)
                        ? "bg-gradient-to-r from-blue-500 to-teal-400 border-blue-500 text-white shadow-sm"
                        : "border-slate-300 hover:border-blue-400"
                    )}>
                      <Check className={cn(
                        "h-3 w-3 transition-opacity",
                        selectedValues.includes(option) ? "opacity-100" : "opacity-0"
                      )} />
                    </div>
                    <span className="font-medium text-slate-700">{option}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <Card className="p-6 shadow-xl border-0 bg-white/70 backdrop-blur-lg rounded-2xl animate-fade-in">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-wrap items-center gap-4 justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-lg tracking-wide text-slate-800">Filters</h3>
            {activeFilterCount > 0 ? (
              <Badge className="ml-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white shadow">{activeFilterCount}</Badge>
            ) : (
              <span className="ml-2 text-sm text-slate-400">No active filters</span>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearFilters}
            disabled={activeFilterCount === 0}
            className="gap-2 border-slate-300 hover:bg-slate-100 backdrop-blur-sm bg-white/80"
          >
            <X className="h-4 w-4" />
            Clear All
          </Button>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <MultiSelectFilter
            title="Source"
            options={sourceOptions}
            selectedValues={filters.source}
            onValueChange={handleSourceChange}
            open={sourceOpen}
            setOpen={setSourceOpen}
            icon={<Tag className="h-4 w-4 text-blue-500" />}
          />
          
          <MultiSelectFilter
            title="Associate"
            options={associateOptions}
            selectedValues={filters.associate}
            onValueChange={handleAssociateChange}
            open={associateOpen}
            setOpen={setAssociateOpen}
          />
          
          <MultiSelectFilter
            title="Center"
            options={centerOptions}
            selectedValues={filters.center}
            onValueChange={handleCenterChange}
            open={centerOpen}
            setOpen={setCenterOpen}
          />
          
          <MultiSelectFilter
            title="Status"
            options={statusOptions}
            selectedValues={filters.status}
            onValueChange={handleStatusChange}
            open={statusOpen}
            setOpen={setStatusOpen}
          />
          
          <MultiSelectFilter
            title="Stage"
            options={stageOptions}
            selectedValues={filters.stage}
            onValueChange={handleStageChange}
            open={stageOpen}
            setOpen={setStageOpen}
          />
          
          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2 border-slate-300 hover:bg-slate-100 backdrop-blur-sm bg-white/80">
                <CalendarIcon className="h-4 w-4 text-indigo-500" />
                Date Range
                {(filters.dateRange.start || filters.dateRange.end) && (
                  <Badge className="ml-1 bg-gradient-to-r from-blue-500 to-teal-400 text-white shadow">
                    {filters.dateRange.start && filters.dateRange.end ? '2' : '1'}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-xl shadow-xl border-0 bg-white/95 backdrop-blur-lg" align="start">
              <div className="flex flex-col space-y-4 p-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">Start Date</label>
                    {filters.dateRange.start && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-red-100"
                        onClick={() => handleStartDateChange(null)}
                      >
                        <X className="h-3 w-3 text-red-500" />
                      </Button>
                    )}
                  </div>
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.start || undefined}
                    onSelect={handleStartDateChange}
                    initialFocus
                    disabled={(date) => 
                      filters.dateRange.end 
                        ? date > filters.dateRange.end 
                        : false
                    }
                    className="rounded-lg border-0"
                  />
                </div>
                
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">End Date</label>
                    {filters.dateRange.end && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-red-100"
                        onClick={() => handleEndDateChange(null)}
                      >
                        <X className="h-3 w-3 text-red-500" />
                      </Button>
                    )}
                  </div>
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.end || undefined}
                    onSelect={handleEndDateChange}
                    disabled={(date) => 
                      filters.dateRange.start 
                        ? date < filters.dateRange.start 
                        : false
                    }
                    className="rounded-lg border-0"
                  />
                </div>
                
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-slate-300 hover:bg-slate-100"
                    onClick={handleClearDateRange}
                  >
                    Clear Range
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-blue-500 to-teal-400 text-white shadow hover:from-blue-600 hover:to-teal-500"
                    onClick={() => setDatePopoverOpen(false)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 text-sm">
            <span className="font-medium text-slate-500">Active:</span>
            {filters.source.length > 0 && (
              <Badge variant="outline" className="bg-blue-50 hover:bg-blue-100 gap-1 border-blue-200 text-blue-700">
                Source: {filters.source.length}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, source: [] })} />
              </Badge>
            )}
            {filters.associate.length > 0 && (
              <Badge variant="outline" className="bg-green-50 hover:bg-green-100 gap-1 border-green-200 text-green-700">
                Associate: {filters.associate.length}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, associate: [] })} />
              </Badge>
            )}
            {filters.center.length > 0 && (
              <Badge variant="outline" className="bg-purple-50 hover:bg-purple-100 gap-1 border-purple-200 text-purple-700">
                Center: {filters.center.length}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, center: [] })} />
              </Badge>
            )}
            {filters.stage.length > 0 && (
              <Badge variant="outline" className="bg-orange-50 hover:bg-orange-100 gap-1 border-orange-200 text-orange-700">
                Stage: {filters.stage.length}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, stage: [] })} />
              </Badge>
            )}
            {filters.status.length > 0 && (
              <Badge variant="outline" className="bg-red-50 hover:bg-red-100 gap-1 border-red-200 text-red-700">
                Status: {filters.status.length}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, status: [] })} />
              </Badge>
            )}
            {(filters.dateRange.start || filters.dateRange.end) && (
              <Badge variant="outline" className="bg-indigo-50 hover:bg-indigo-100 gap-1 border-indigo-200 text-indigo-700">
                Date: {filters.dateRange.start && format(filters.dateRange.start, 'MMM d')}
                {filters.dateRange.start && filters.dateRange.end && ' to '}
                {filters.dateRange.end && format(filters.dateRange.end, 'MMM d')}
                <X className="h-3 w-3 cursor-pointer" onClick={handleClearDateRange} />
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}