
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
  Calendar,
  User,
  Globe,
  Share2,
  Building,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  Flame,
  TrendingUp,
  Snowflake,
  Settings,
  Filter,
  RefreshCw,
  Grid3X3,
  Layers
} from 'lucide-react';
import { formatDate, groupBy } from '@/lib/utils';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface OptimizedKanbanViewProps {
  onLeadClick: (lead: any) => void;
}

export function OptimizedKanbanView({ onLeadClick }: OptimizedKanbanViewProps) {
  const { filteredLeads, loading, settings, updateSettings } = useLeads();
  const [groupByField, setGroupByField] = useState<string>(settings.kanbanGroupBy || 'status');
  const [compactMode, setCompactMode] = useState(false);
  const [showAvatars, setShowAvatars] = useState(true);
  const [showEmptyColumns, setShowEmptyColumns] = useState(true);
  
  const groupByOptions = [
    { value: 'status', label: 'Status' },
    { value: 'stage', label: 'Stage' },
    { value: 'source', label: 'Source' },
    { value: 'associate', label: 'Associate' },
    { value: 'center', label: 'Center' }
  ];
  
  // Memoized grouped leads for performance
  const groupedLeads = useMemo(() => {
    if (!filteredLeads.length) return {};
    
    const grouped = groupBy(filteredLeads, groupByField as keyof typeof filteredLeads[0]);
    
    // Sort leads within each group by creation date
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });
    
    return grouped;
  }, [filteredLeads, groupByField]);
  
  const handleGroupByChange = useCallback((value: string) => {
    setGroupByField(value);
    updateSettings({
      ...settings,
      kanbanGroupBy: value
    });
  }, [settings, updateSettings]);
  
  const sortedGroups = useMemo(() => {
    const groups = Object.keys(groupedLeads);
    if (!showEmptyColumns) {
      return groups.filter(group => groupedLeads[group].length > 0);
    }
    return groups.sort((a, b) => a.localeCompare(b));
  }, [groupedLeads, showEmptyColumns]);
  
  const getInitials = useCallback((name: string): string => {
    if (!name) return 'NA';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, []);
  
  const getGroupColor = useCallback((group: string): string => {
    if (groupByField === 'status') {
      const statusColors: Record<string, string> = {
        'Hot': 'from-red-500 to-orange-500',
        'Warm': 'from-amber-500 to-yellow-500',
        'Cold': 'from-blue-500 to-cyan-500',
        'Converted': 'from-green-500 to-emerald-500',
        'Won': 'from-green-600 to-emerald-600',
        'Lost': 'from-red-600 to-red-700',
        'Open': 'from-orange-500 to-orange-600'
      };
      return statusColors[group] || 'from-gray-500 to-gray-400';
    }
    
    const colors = [
      'from-indigo-600 to-purple-600',
      'from-sky-600 to-indigo-600',
      'from-emerald-600 to-teal-600',
      'from-amber-600 to-orange-600',
      'from-fuchsia-600 to-pink-600',
      'from-violet-600 to-indigo-600'
    ];
    
    const index = group.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }, [groupByField]);

  const getSourceIcon = useCallback((source: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Website': <Globe className="h-3 w-3" />,
      'Referral': <User className="h-3 w-3" />,
      'Social Media': <Share2 className="h-3 w-3" />,
      'Event': <Calendar className="h-3 w-3" />,
      'Cold Call': <Phone className="h-3 w-3" />,
      'Partner': <Building className="h-3 w-3" />,
      'Email Campaign': <Mail className="h-3 w-3" />
    };
    return icons[source] || <Globe className="h-3 w-3" />;
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Hot': <Flame className="h-3 w-3 text-amber-500" />,
      'Warm': <TrendingUp className="h-3 w-3 text-orange-500" />,
      'Cold': <Snowflake className="h-3 w-3 text-blue-500" />,
      'Converted': <CheckCircle className="h-3 w-3 text-green-600" />,
      'Won': <CheckCircle className="h-3 w-3 text-green-600" />,
      'Lost': <XCircle className="h-3 w-3 text-red-600" />
    };
    return icons[status] || <Clock className="h-3 w-3 text-gray-500" />;
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground text-sm">Loading kanban board...</p>
      </div>
    );
  }
  
  if (Object.keys(groupedLeads).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Grid3X3 className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">No leads found</h3>
        <p className="text-slate-500 text-sm">Try adjusting your filters or import some leads to get started.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Header with Controls */}
      <Card className="border-border/30 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-teal-600 rounded-lg">
                <Grid3X3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Kanban Board</h2>
                <p className="text-xs text-slate-600">Organize and track your leads efficiently</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Select value={groupByField} onValueChange={handleGroupByChange}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue placeholder="Group by" />
                </SelectTrigger>
                <SelectContent>
                  {groupByOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-2">
                    <Settings className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Display Settings</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="compact-mode" className="text-xs">Compact Mode</Label>
                        <Switch
                          id="compact-mode"
                          checked={compactMode}
                          onCheckedChange={setCompactMode}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-avatars" className="text-xs">Show Avatars</Label>
                        <Switch
                          id="show-avatars"
                          checked={showAvatars}
                          onCheckedChange={setShowAvatars}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-empty" className="text-xs">Show Empty Columns</Label>
                        <Switch
                          id="show-empty"
                          checked={showEmptyColumns}
                          onCheckedChange={setShowEmptyColumns}
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("Kanban refreshed")}
                className="h-8 px-2"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {sortedGroups.map(group => (
          <div key={group} className="flex flex-col h-fit rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white">
            <div className={`bg-gradient-to-r ${getGroupColor(group)} p-3 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  <h3 className="text-sm font-semibold truncate">{group || 'Undefined'}</h3>
                </div>
                <Badge className="bg-white/30 text-white text-xs">
                  {groupedLeads[group].length}
                </Badge>
              </div>
            </div>
            
            <div className="flex-1 space-y-2 p-3 bg-slate-50/30 max-h-96 overflow-y-auto">
              {groupedLeads[group].map(lead => (
                <Card 
                  key={lead.id} 
                  className="shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 bg-white group"
                  style={{
                    borderLeftColor: lead.status === 'Hot' ? '#ef4444' : 
                                    lead.status === 'Warm' ? '#f59e0b' : 
                                    lead.status === 'Cold' ? '#3b82f6' : 
                                    lead.status === 'Converted' ? '#10b981' : '#6b7280'
                  }}
                  onClick={() => onLeadClick(lead)}
                >
                  <CardContent className={`p-3 ${compactMode ? 'space-y-1' : 'space-y-2'}`}>
                    <div className="flex items-start gap-2">
                      {showAvatars && (
                        <Avatar className={`border-2 border-white shadow-sm ${compactMode ? 'h-6 w-6' : 'h-8 w-8'}`}>
                          <AvatarFallback className={`text-white bg-gradient-to-br ${getGroupColor(group)} ${compactMode ? 'text-xs' : 'text-sm'}`}>
                            {getInitials(lead.fullName)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold line-clamp-1 text-slate-800 group-hover:text-blue-600 transition-colors ${
                          compactMode ? 'text-xs' : 'text-sm'
                        }`}>
                          {lead.fullName}
                        </h4>
                        {groupByField !== 'status' && lead.status && (
                          <div className="flex items-center gap-1 mt-1">
                            {getStatusIcon(lead.status)}
                            <Badge variant="outline" className="text-xs px-1 py-0 bg-white">
                              {lead.status}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!compactMode && (
                      <div className="text-xs space-y-1 text-slate-600">
                        {lead.email && (
                          <div className="flex items-center gap-1 truncate">
                            <Mail className="h-2.5 w-2.5 flex-shrink-0 text-slate-400" />
                            <span className="truncate">{lead.email}</span>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-2.5 w-2.5 flex-shrink-0 text-slate-400" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1">
                      {lead.source && groupByField !== 'source' && (
                        <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 border-blue-200 text-blue-700 text-xs px-1 py-0">
                          {getSourceIcon(lead.source)}
                          <span className="truncate max-w-[60px]">{lead.source}</span>
                        </Badge>
                      )}
                      
                      {groupByField !== 'stage' && lead.stage && (
                        <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 text-xs px-1 py-0">
                          <span className="truncate max-w-[70px]">{lead.stage}</span>
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDate(lead.createdAt)}
                      </div>
                      
                      <Avatar className="h-4 w-4 border border-white shadow-sm">
                        <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                          {getInitials(lead.associate || 'NA')}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-slate-500 hover:text-slate-700 hover:bg-white border-2 border-dashed border-slate-200 hover:border-slate-300 transition-all text-xs py-2"
                onClick={() => toast.info("Add new lead functionality coming soon")}
              >
                <Plus className="mr-2 h-3 w-3" />
                Add Card
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
