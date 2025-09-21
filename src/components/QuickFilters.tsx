import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLeads } from '@/contexts/LeadContext';
import { 
  Clock, 
  Calendar,
  CalendarDays,
  CalendarRange,
  Building,
  MapPin,
  Timer,
  CalendarClock,
  User
} from 'lucide-react';

export function QuickFilters() {
  const { setFilters, filters, centerOptions, associateOptions } = useLeads();

  const getDateRange = (type: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (type) {
      case 'today':
        return {
          start: today,
          end: today
        };
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          start: yesterday,
          end: yesterday
        };
      case 'thisWeek':
        const startOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(today.getDate() - daysToMonday);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return {
          start: startOfWeek,
          end: endOfWeek
        };
      case 'lastWeek':
        const lastWeekStart = new Date(today);
        const currentDayOfWeek = today.getDay();
        const daysToLastMonday = currentDayOfWeek === 0 ? 13 : currentDayOfWeek + 6;
        lastWeekStart.setDate(today.getDate() - daysToLastMonday);
        
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
        
        return {
          start: lastWeekStart,
          end: lastWeekEnd
        };
      case 'thisMonth':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          start: startOfMonth,
          end: today
        };
      case 'lastMonth':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        return {
          start: lastMonthStart,
          end: lastMonthEnd
        };
      case 'last7Days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return {
          start: sevenDaysAgo,
          end: today
        };
      case 'last30Days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return {
          start: thirtyDaysAgo,
          end: today
        };
      default:
        return { start: null, end: null };
    }
  };

  const handleQuickFilter = (type: string) => {
    const dateRange = getDateRange(type);
    
    // Check if this filter is already active - if so, clear it
    const isCurrentlyActive = (
      filters.dateRange.start?.getTime() === dateRange.start?.getTime() &&
      filters.dateRange.end?.getTime() === dateRange.end?.getTime()
    );
    
    if (isCurrentlyActive) {
      // Clear the filter
      setFilters({
        ...filters,
        dateRange: { start: null, end: null }
      });
    } else {
      // Apply the filter - PRESERVE existing center filters
      setFilters({
        ...filters,
        dateRange
      });
    }
  };

  const handleCenterFilter = (center: string) => {
    const isCurrentlyActive = filters.center.includes(center);
    
    if (isCurrentlyActive) {
      // Remove the center filter - PRESERVE existing date filters
      setFilters({
        ...filters,
        center: filters.center.filter(c => c !== center)
      });
    } else {
      // Add the center filter - PRESERVE existing date filters
      setFilters({
        ...filters,
        center: [...filters.center, center]
      });
    }
  };

  const handleAssociateFilter = (associate: string) => {
    const isCurrentlyActive = filters.associate.includes(associate);
    
    if (isCurrentlyActive) {
      // Remove the associate filter - PRESERVE existing filters
      setFilters({
        ...filters,
        associate: filters.associate.filter(a => a !== associate)
      });
    } else {
      // Add the associate filter - PRESERVE existing filters
      setFilters({
        ...filters,
        associate: [...filters.associate, associate]
      });
    }
  };

  const isActiveFilter = (type: string) => {
    const dateRange = getDateRange(type);
    return (
      filters.dateRange.start?.getTime() === dateRange.start?.getTime() &&
      filters.dateRange.end?.getTime() === dateRange.end?.getTime()
    );
  };

  const isActiveCenterFilter = (center: string) => {
    return filters.center.includes(center);
  };

  const isActiveAssociateFilter = (associate: string) => {
    return filters.associate.includes(associate);
  };

  const quickFilterButtons = [
    { key: 'today', label: 'Today', icon: Clock },
    { key: 'yesterday', label: 'Yesterday', icon: Timer },
    { key: 'last7Days', label: 'Last 7 Days', icon: CalendarDays },
    { key: 'thisWeek', label: 'This Week', icon: Calendar },
    { key: 'lastWeek', label: 'Last Week', icon: CalendarClock },
    { key: 'thisMonth', label: 'This Month', icon: CalendarRange },
    { key: 'lastMonth', label: 'Last Month', icon: CalendarRange },
    { key: 'last30Days', label: 'Last 30 Days', icon: CalendarDays },
  ];

  return (
    <Card className="p-4 shadow-xl border-0 bg-white/70 backdrop-blur-lg rounded-2xl">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-2">
          <h4 className="text-sm font-semibold text-slate-700 mb-1">Quick Date Filters</h4>
          <div className="flex flex-wrap gap-2">
            {quickFilterButtons.map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={isActiveFilter(key) ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickFilter(key)}
                className={`gap-2 h-8 text-xs rounded-lg transition-all duration-200 ${
                  isActiveFilter(key) 
                    ? 'bg-gradient-to-r from-blue-500 to-teal-400 text-white shadow-md scale-105' 
                    : 'hover:bg-blue-50 hover:scale-105'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>
        {centerOptions.length > 0 && (
          <div className="flex flex-col space-y-2">
            <h4 className="text-sm font-semibold text-slate-700 mb-1">Location Filters</h4>
            <div className="flex flex-wrap gap-2">
              {centerOptions.map((center) => (
                <Button
                  key={center}
                  variant={isActiveCenterFilter(center) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCenterFilter(center)}
                  className={`gap-2 h-8 text-xs rounded-lg transition-all duration-200 ${
                    isActiveCenterFilter(center) 
                      ? 'bg-gradient-to-r from-green-400 to-blue-400 text-white shadow-md scale-105' 
                      : 'hover:bg-green-50 hover:scale-105'
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  {center}
                </Button>
              ))}
            </div>
          </div>
        )}
        {associateOptions.length > 0 && (
          <div className="flex flex-col space-y-2">
            <h4 className="text-sm font-semibold text-slate-700 mb-1">Associate Filters</h4>
            <div className="flex flex-wrap gap-2">
              {associateOptions.map((associate) => (
                <Button
                  key={associate}
                  variant={isActiveAssociateFilter(associate) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleAssociateFilter(associate)}
                  className={`gap-2 h-8 text-xs rounded-lg transition-all duration-200 ${
                    isActiveAssociateFilter(associate) 
                      ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md scale-105' 
                      : 'hover:bg-purple-50 hover:scale-105'
                  }`}
                >
                  <User className="h-4 w-4" />
                  {associate}
                </Button>
              ))}
            </div>
          </div>
        )}
        {/* Active filters summary */}
        {(filters.dateRange.start || filters.dateRange.end || filters.center.length > 0 || filters.associate.length > 0) && (
          <div className="pt-2 border-t border-slate-200">
            <div className="text-xs text-slate-500">
              <span className="font-medium">Active: </span>
              {filters.dateRange.start && (
                <span className="text-blue-600">Date filter + </span>
              )}
              {filters.center.length > 0 && (
                <span className="text-green-600">{filters.center.length} location(s) + </span>
              )}
              {filters.associate.length > 0 && (
                <span className="text-purple-600">{filters.associate.length} associate(s)</span>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}