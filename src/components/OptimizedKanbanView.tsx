
import React, { useState, useMemo, useCallback } from 'react';
import { useLeads } from '@/contexts/LeadContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Mail, 
  Phone, 
  Plus, 
  MoreHorizontal,
  Clock,
  User,
  TrendingUp,
  Grid3X3,
  Settings,
  RefreshCw,
  Layers
} from 'lucide-react';
import { formatDate, groupBy } from '@/lib/utils';
import { toast } from 'sonner';
import { EnhancedBadge } from '@/components/ui/enhanced-badge';

interface OptimizedKanbanViewProps {
  onLeadClick: (lead: any) => void;
}

export function OptimizedKanbanView({ onLeadClick }: OptimizedKanbanViewProps) {
  const { filteredLeads, loading, settings, updateSettings } = useLeads();
  const [groupByField, setGroupByField] = useState<string>(settings.kanbanGroupBy || 'status');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const groupByOptions = [
    { value: 'status', label: 'Status' },
    { value: 'stage', label: 'Stage' },
    { value: 'source', label: 'Source' },
    { value: 'associate', label: 'Associate' },
    { value: 'center', label: 'Center' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Created Date' },
    { value: 'fullName', label: 'Name' },
    { value: 'email', label: 'Email' }
  ];
  
  // Memoized grouped leads with performance optimization
  const groupedLeads = useMemo(() => {
    if (!filteredLeads.length) return {};
    
    const grouped = groupBy(filteredLeads, groupByField as keyof typeof filteredLeads[0]);
    
    // Sort leads within each group
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => {
        const aValue = a[sortBy as keyof typeof a];
        const bValue = b[sortBy as keyof typeof b];
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    });
    
    return grouped;
  }, [filteredLeads, groupByField, sortBy, sortOrder]);
  
  const handleGroupByChange = useCallback((value: string) => {
    setGroupByField(value);
    updateSettings({
      ...settings,
      kanbanGroupBy: value
    });
  }, [settings, updateSettings]);
  
  const sortedGroups = useMemo(() => {
    return Object.keys(groupedLeads).sort((a, b) => a.localeCompare(b));
  }, [groupedLeads]);
  
  const getInitials = useCallback((name: string): string => {
    if (!name) return 'NA';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, []);
  
  const getStatusColor = useCallback((status: string): string => {
    const colors: Record<string, string> = {
      'Hot': 'bg-red-500',
      'Warm': 'bg-amber-500',
      'Cold': 'bg-blue-500',
      'Converted': 'bg-green-500',
      'Won': 'bg-green-600',
      'Lost': 'bg-red-600',
      'Open': 'bg-orange-500'
    };
    return colors[status] || 'bg-gray-500';
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (Object.keys(groupedLeads).length === 0) {
    return (
      <div className="text-center py-12">
        <Grid3X3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No leads found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or add some leads to get started.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={groupByField} onValueChange={handleGroupByChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              {groupByOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.success("Kanban refreshed")}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedGroups.map(group => (
          <Card key={group} className="flex flex-col h-[600px] shadow-sm border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-medium">{group || 'Undefined'}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {groupedLeads[group].length}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 space-y-3 overflow-y-auto">
              {groupedLeads[group].map(lead => (
                <Card 
                  key={lead.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-l-4"
                  style={{ borderLeftColor: getStatusColor(lead.status) }}
                  onClick={() => onLeadClick(lead)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-muted">
                          {getInitials(lead.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{lead.fullName}</h4>
                        
                        <div className="flex items-center space-x-1 mt-1">
                          {lead.email && (
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{lead.email}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1 mt-2">
                          {lead.source && (
                            <EnhancedBadge
                              badgeType="source"
                              value={lead.source}
                              size="sm"
                            />
                          )}
                          
                          {lead.stage && (
                            <EnhancedBadge
                              badgeType="stage"
                              value={lead.stage}
                              size="sm"
                            />
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 pt-2 border-t">
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(lead.createdAt)}</span>
                          </div>
                          
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-xs bg-muted">
                              {getInitials(lead.associate || 'NA')}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground hover:text-foreground border-2 border-dashed"
                onClick={() => toast.info("Add new lead functionality coming soon")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
