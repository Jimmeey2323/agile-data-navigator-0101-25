import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  MessageSquare, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  ExternalLink,
  Edit,
  Clock,
  MessageCircle,
  Activity,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Group
} from 'lucide-react';
import { useLeads } from '@/contexts/LeadContext';
import { Lead } from '@/services/googleSheets';
import { formatDate, formatFollowUpDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface LeadsFollowUpViewProps {
  onLeadClick?: (lead: Lead) => void;
}

type SortField = 'fullName' | 'associate' | 'center' | 'source' | 'stage' | 'createdAt';
type SortDirection = 'asc' | 'desc';
type GroupBy = 'none' | 'source' | 'stage' | 'associate' | 'center';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'New': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    'Contacted': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
    'Qualified': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    'Proposal': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
    'Negotiation': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
    'Closed': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800',
    'Lost': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
  };
  return colors[status] || colors['New'];
};

const getSourceColor = (source: string) => {
  const colors: Record<string, string> = {
    'Website': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    'Google Ads': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    'Facebook': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800',
    'Instagram': 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800',
    'Referral': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
    'Email': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
    'Phone': 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800',
    'Walk-in': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
    'Other': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800'
  };
  return colors[source] || colors['Other'];
};

const getStageColor = (stage: string) => {
  const colors: Record<string, string> = {
    'Lead': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/10 dark:text-blue-300 dark:border-blue-800',
    'Prospect': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/10 dark:text-indigo-300 dark:border-indigo-800',
    'Opportunity': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-300 dark:border-emerald-800',
    'Customer': 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/10 dark:text-green-300 dark:border-green-800'
  };
  return colors[stage] || colors['Lead'];
};

const getFollowUps = (lead: Lead): boolean => {
  return !!(lead.followUp1Date || lead.followUp1Comments || 
           lead.followUp2Date || lead.followUp2Comments ||
           lead.followUp3Date || lead.followUp3Comments ||
           lead.followUp4Date || lead.followUp4Comments);
};

export function LeadsFollowUpView({ onLeadClick }: LeadsFollowUpViewProps) {
  const { filteredLeads, loading, error } = useLeads();
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [associateFilter, setAssociateFilter] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Get unique values for filters
  const uniqueSources = useMemo(() => {
    const sources = Array.from(new Set(filteredLeads.map(lead => lead.source).filter(Boolean)));
    return sources.sort();
  }, [filteredLeads]);

  const uniqueStages = useMemo(() => {
    const stages = Array.from(new Set(filteredLeads.map(lead => lead.stage).filter(Boolean)));
    return stages.sort();
  }, [filteredLeads]);

  const uniqueAssociates = useMemo(() => {
    const associates = Array.from(new Set(filteredLeads.map(lead => lead.associate).filter(Boolean)));
    return associates.sort();
  }, [filteredLeads]);

  // Filter and sort leads
  const processedLeads = useMemo(() => {
    let leads = filteredLeads.filter(lead => getFollowUps(lead));

    // Apply search filter
    if (searchTerm) {
      leads = leads.filter(lead => 
        lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.associate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.center.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.remarks && lead.remarks.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply filters
    if (sourceFilter !== 'all') {
      leads = leads.filter(lead => lead.source === sourceFilter);
    }
    if (stageFilter !== 'all') {
      leads = leads.filter(lead => lead.stage === stageFilter);
    }
    if (associateFilter !== 'all') {
      leads = leads.filter(lead => lead.associate === associateFilter);
    }

    // Apply sorting
    if (sortConfig) {
      leads.sort((a, b) => {
        let aValue: any = a[sortConfig.field];
        let bValue: any = b[sortConfig.field];

        if (sortConfig.field === 'createdAt') {
          const aTime = new Date(aValue).getTime();
          const bTime = new Date(bValue).getTime();
          if (aTime < bTime) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aTime > bTime) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        } else {
          const aStr = String(aValue || '').toLowerCase();
          const bStr = String(bValue || '').toLowerCase();
          if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
      });
    }

    return leads;
  }, [filteredLeads, searchTerm, sourceFilter, stageFilter, associateFilter, sortConfig]);

  // Group leads if grouping is enabled
  const groupedLeads = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Leads': processedLeads };
    }

    const groups: Record<string, Lead[]> = {};
    processedLeads.forEach(lead => {
      const groupValue = lead[groupBy] || 'Unknown';
      if (!groups[groupValue]) {
        groups[groupValue] = [];
      }
      groups[groupValue].push(lead);
    });

    return groups;
  }, [processedLeads, groupBy]);

  const handleSort = (field: SortField) => {
    setSortConfig(current => {
      if (current?.field === field) {
        return {
          field,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { field, direction: 'asc' };
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig?.field !== field) {
      return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-3 h-3 ml-1" />
      : <ArrowDown className="w-3 h-3 ml-1" />;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardContent className="p-6 text-center">
          <div className="text-red-600 dark:text-red-400">
            <MessageCircle className="w-8 h-8 mx-auto mb-2" />
            <p>Failed to load follow-up data</p>
            <p className="text-sm text-muted-foreground mt-1">{error?.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (processedLeads.length === 0 && !loading && !error) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No Follow-ups Found</h3>
          <p className="text-sm text-muted-foreground">
            No leads with follow-up comments match your current filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Follow-up Comments</h2>
          <p className="text-muted-foreground">
            {processedLeads.length} lead{processedLeads.length !== 1 ? 's' : ''} with follow-up data
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Activity className="w-3 h-3 mr-1" />
          Live Data
        </Badge>
      </div>

      {/* Filters and Controls */}
      <Card className="border-0 shadow-sm bg-muted/30">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Source Filter */}
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {uniqueSources.map(source => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Stage Filter */}
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {uniqueStages.map(stage => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Associate Filter */}
            <Select value={associateFilter} onValueChange={setAssociateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Associates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Associates</SelectItem>
                {uniqueAssociates.map(associate => (
                  <SelectItem key={associate} value={associate}>{associate}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Group By */}
            <Select value={groupBy} onValueChange={(value) => setGroupBy(value as GroupBy)}>
              <SelectTrigger>
                <SelectValue placeholder="Group By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Grouping</SelectItem>
                <SelectItem value="source">Group by Source</SelectItem>
                <SelectItem value="stage">Group by Stage</SelectItem>
                <SelectItem value="associate">Group by Associate</SelectItem>
                <SelectItem value="center">Group by Center</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSourceFilter('all');
                setStageFilter('all');
                setAssociateFilter('all');
                setGroupBy('none');
                setSortConfig(null);
              }}
              className="w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table with Grouping */}
      {Object.entries(groupedLeads).map(([groupName, leads]) => (
        <div key={groupName}>
          {groupBy !== 'none' && (
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Group className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold">{groupName}</h3>
                <Badge variant="secondary" className="text-xs">
                  {leads.length} lead{leads.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <Separator className="mt-2" />
            </div>
          )}

          <Card className="border-0 shadow-sm">
            <div className="overflow-x-auto w-full">
              <Table className="table-auto w-max min-w-full">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="whitespace-nowrap font-semibold">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent whitespace-nowrap"
                        onClick={() => handleSort('fullName')}
                      >
                        Lead Info
                        {getSortIcon('fullName')}
                      </Button>
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent whitespace-nowrap"
                        onClick={() => handleSort('source')}
                      >
                        Source & Stage
                        {getSortIcon('source')}
                      </Button>
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold">Remarks</TableHead>
                    <TableHead className="whitespace-nowrap font-semibold">Follow-up 1</TableHead>
                    <TableHead className="whitespace-nowrap font-semibold">Follow-up 2</TableHead>
                    <TableHead className="whitespace-nowrap font-semibold">Follow-up 3</TableHead>
                    <TableHead className="whitespace-nowrap font-semibold">Follow-up 4</TableHead>
                    <TableHead className="whitespace-nowrap font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-muted/20 group">
                  {/* Lead Info */}
                  <TableCell className="align-top">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{lead.fullName}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {lead.associate}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {lead.center}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(lead.createdAt)}
                      </div>
                    </div>
                  </TableCell>

                  {/* Source & Stage */}
                  <TableCell className="align-top">
                    <div className="space-y-2">
                      <Badge className={cn("text-xs font-medium border", getSourceColor(lead.source))}>
                        {lead.source}
                      </Badge>
                      <Badge variant="outline" className={cn("text-xs font-medium", getStageColor(lead.stage))}>
                        {lead.stage}
                      </Badge>
                    </div>
                  </TableCell>

                  {/* Remarks */}
                  <TableCell className="align-top min-w-[180px] max-w-[280px]">
                    {lead.remarks ? (
                      <div className="text-xs bg-muted/30 p-2 rounded text-foreground leading-relaxed">
                        {lead.remarks}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground italic">No remarks</div>
                    )}
                  </TableCell>

                  {/* Follow-up 1 */}
                  <TableCell className="align-top min-w-[200px] max-w-[300px]">
                    {(lead.followUp1Date || lead.followUp1Comments) ? (
                      <div className="space-y-2">
                        {lead.followUp1Date && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatFollowUpDate(lead.followUp1Date) || lead.followUp1Date}
                          </div>
                        )}
                        {lead.followUp1Comments && (
                          <div className="text-xs bg-muted/30 p-2 rounded text-foreground leading-relaxed">
                            {lead.followUp1Comments}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground italic">No data</div>
                    )}
                  </TableCell>

                  {/* Follow-up 2 */}
                  <TableCell className="align-top min-w-[200px] max-w-[300px]">
                    {(lead.followUp2Date || lead.followUp2Comments) ? (
                      <div className="space-y-2">
                        {lead.followUp2Date && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatFollowUpDate(lead.followUp2Date) || lead.followUp2Date}
                          </div>
                        )}
                        {lead.followUp2Comments && (
                          <div className="text-xs bg-muted/30 p-2 rounded text-foreground leading-relaxed">
                            {lead.followUp2Comments}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground italic">No data</div>
                    )}
                  </TableCell>

                  {/* Follow-up 3 */}
                  <TableCell className="align-top min-w-[200px] max-w-[300px]">
                    {(lead.followUp3Date || lead.followUp3Comments) ? (
                      <div className="space-y-2">
                        {lead.followUp3Date && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatFollowUpDate(lead.followUp3Date) || lead.followUp3Date}
                          </div>
                        )}
                        {lead.followUp3Comments && (
                          <div className="text-xs bg-muted/30 p-2 rounded text-foreground leading-relaxed">
                            {lead.followUp3Comments}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground italic">No data</div>
                    )}
                  </TableCell>

                  {/* Follow-up 4 */}
                  <TableCell className="align-top min-w-[200px] max-w-[300px]">
                    {(lead.followUp4Date || lead.followUp4Comments) ? (
                      <div className="space-y-2">
                        {lead.followUp4Date && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatFollowUpDate(lead.followUp4Date) || lead.followUp4Date}
                          </div>
                        )}
                        {lead.followUp4Comments && (
                          <div className="text-xs bg-muted/30 p-2 rounded text-foreground leading-relaxed">
                            {lead.followUp4Comments}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground italic">No data</div>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="align-top">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onLeadClick?.(lead)}
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      ))}

      {processedLeads.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No Follow-ups Found</h3>
            <p className="text-sm text-muted-foreground">
              No leads with follow-up comments match your current filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}