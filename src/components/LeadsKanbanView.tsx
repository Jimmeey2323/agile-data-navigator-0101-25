
import React, { useState, useMemo, memo } from 'react';
import { useLeads } from '@/contexts/LeadContext';
import { Card, CardContent } from '@/components/ui/card';
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
  Grip,
  Clock,
  User
} from 'lucide-react';
import { formatDate, groupBy } from '@/lib/utils';
import { toast } from 'sonner';

interface LeadsKanbanViewProps {
  onLeadClick: (lead: any) => void;
}

// Memoized card component to prevent unnecessary re-renders
const LeadCard = memo(({ lead, onLeadClick }: { lead: any; onLeadClick: (lead: any) => void }) => {
  const getInitials = (name: string): string => {
    if (!name) return 'NA';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getStatusColor = (status: string): string => {
    switch(status) {
      case 'Hot': return 'from-red-500 to-orange-500';
      case 'Warm': return 'from-amber-500 to-yellow-500';
      case 'Cold': return 'from-blue-500 to-cyan-500';
      case 'Converted': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-gray-400';
    }
  };

  return (
    <Card 
      className="kanban-card shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 hover:scale-[1.02] bg-white dark:bg-gray-800"
      style={{
        borderLeftColor: `hsl(var(--primary))`
      }}
      onClick={() => onLeadClick(lead)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarFallback className={`text-sm font-semibold text-white bg-gradient-to-br ${getStatusColor(lead.status)}`}>
                {getInitials(lead.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-sm line-clamp-1">{lead.fullName}</h4>
              <Badge 
                variant={lead.status === 'Converted' ? 'default' : 'secondary'} 
                className="text-xs mt-1"
              >
                {lead.status}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="space-y-2 text-xs text-muted-foreground">
          {lead.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{lead.email}</span>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 flex-shrink-0" />
              <span>{lead.phone}</span>
            </div>
          )}
        </div>
        
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(lead.createdAt)}
          </span>
          
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span className="text-muted-foreground truncate max-w-[60px]">
              {lead.associate || 'Unassigned'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export function LeadsKanbanView({ onLeadClick }: LeadsKanbanViewProps) {
  const { filteredLeads, loading, settings, updateSettings } = useLeads();
  const [groupByField, setGroupByField] = useState<string>(settings.kanbanGroupBy || 'status');
  
  const groupByOptions = [
    { value: 'status', label: 'Status' },
    { value: 'stage', label: 'Stage' },
    { value: 'source', label: 'Source' },
    { value: 'associate', label: 'Associate' },
    { value: 'center', label: 'Center' }
  ];
  
  // Memoize grouped leads to prevent unnecessary recalculations
  const groupedLeads = useMemo(() => {
    return groupBy(filteredLeads, groupByField as keyof typeof filteredLeads[0]);
  }, [filteredLeads, groupByField]);
  
  const handleGroupByChange = (value: string) => {
    setGroupByField(value);
    updateSettings({
      ...settings,
      kanbanGroupBy: value
    });
  };
  
  const sortedGroups = useMemo(() => {
    return Object.keys(groupedLeads).sort((a, b) => a.localeCompare(b));
  }, [groupedLeads]);
  
  const getGroupColor = (group: string): string => {
    if (groupByField === 'status') {
      switch(group) {
        case 'Hot': return 'from-red-600 to-orange-600';
        case 'Warm': return 'from-amber-600 to-yellow-600';
        case 'Cold': return 'from-blue-600 to-cyan-600';
        case 'Converted': return 'from-green-600 to-emerald-600';
        default: return 'from-gray-600 to-gray-500';
      }
    }
    
    const colors = [
      'from-indigo-600 to-purple-600',
      'from-sky-600 to-indigo-600',
      'from-emerald-600 to-teal-600',
      'from-amber-600 to-orange-600',
      'from-fuchsia-600 to-pink-600',
      'from-violet-600 to-purple-600'
    ];
    
    const index = group.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };
  
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading kanban board...</p>
      </div>
    );
  }
  
  if (Object.keys(groupedLeads).length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No leads found. Try adjusting your filters or import some leads.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Grip className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Kanban Board
          </h2>
        </div>
        
        <Select value={groupByField} onValueChange={handleGroupByChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Group by" />
          </SelectTrigger>
          <SelectContent>
            {groupByOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                Group by {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {sortedGroups.map(group => (
          <div key={group} className="flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-border/50 overflow-hidden">
            <div className={`bg-gradient-to-r ${getGroupColor(group)} p-4 text-white`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{group || 'Undefined'}</h3>
                <Badge className="bg-white/20 text-white hover:bg-white/30 border-white/30">
                  {groupedLeads[group].length}
                </Badge>
              </div>
            </div>
            
            <div className="flex-1 p-4 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
              {groupedLeads[group].map(lead => (
                <LeadCard key={lead.id} lead={lead} onLeadClick={onLeadClick} />
              ))}
              
              <Button 
                variant="ghost" 
                className="w-full justify-center text-sm text-muted-foreground hover:text-foreground border-2 border-dashed border-border hover:border-primary/50 h-12"
                onClick={() => toast.info("Add new lead functionality coming soon")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
