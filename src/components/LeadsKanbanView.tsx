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
  Kanban,
  Grip,
  Calendar,
  CalendarCheck,
  BookmarkCheck,
  User,
  Users,
  Globe,
  Link,
  Share2,
  Building,
  FileText,
  CheckCircle,
  XCircle,
  Flag,
  Target,
  MessageSquare,
  Clock,
  Activity,
  TrendingUp,
  Star,
  Award,
  Zap,
  Settings,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  Layers,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  RefreshCw
} from 'lucide-react';
import { formatDate, groupBy } from '@/lib/utils';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface LeadsKanbanViewProps {
  onLeadClick: (lead: any) => void;
}

export function LeadsKanbanView({ onLeadClick }: LeadsKanbanViewProps) {
  const { filteredLeads, loading, settings, updateSettings } = useLeads();
  const [groupByField, setGroupByField] = useState<string>(settings.kanbanGroupBy || 'status');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [compactMode, setCompactMode] = useState(false);
  const [showAvatars, setShowAvatars] = useState(true);
  const [cardHeight, setCardHeight] = useState([120]);
  const [columnsPerRow, setColumnsPerRow] = useState([4]);
  const [showEmptyColumns, setShowEmptyColumns] = useState(true);
  
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
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' }
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
  
  const getStatusColor = useCallback((status: string): string => {
    const colors: Record<string, string> = {
      'Hot': 'from-red-800 to-orange-800',
      'Warm': 'from-amber-800 to-yellow-800',
      'Cold': 'from-blue-800 to-cyan-800',
      'Converted': 'from-green-800 to-emerald-800',
      'Won': 'from-green-900 to-emerald-900',
      'Lost': 'from-red-900 to-rose-900',
      'Open': 'from-orange-800 to-amber-900'
    };
    return colors[status] || 'from-slate-700 to-slate-800';
  }, []);
  
  const getGroupColor = useCallback((group: string): string => {
    if (groupByField === 'status') {
      return getStatusColor(group);
    }
    
    const colors = [
      'from-indigo-800 to-purple-900',
      'from-sky-800 to-indigo-900',
      'from-emerald-800 to-teal-900',
      'from-amber-800 to-orange-900',
      'from-fuchsia-800 to-pink-900',
      'from-violet-800 to-indigo-900'
    ];
    
    const index = group.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }, [groupByField, getStatusColor]);

  const getSourceIcon = useCallback((source: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Website': <Globe className="h-3 w-3" />,
      'Referral': <Users className="h-3 w-3" />,
      'Social Media': <Share2 className="h-3 w-3" />,
      'Event': <Calendar className="h-3 w-3" />,
      'Cold Call': <Phone className="h-3 w-3" />,
      'Partner': <Building className="h-3 w-3" />,
      'Email Campaign': <Mail className="h-3 w-3" />
    };
    return icons[source] || <Link className="h-3 w-3" />;
  }, []);

  const getStageIcon = useCallback((stage: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Qualification': <Target className="h-3 w-3" />,
      'Needs Analysis': <FileText className="h-3 w-3" />,
      'Proposal': <FileText className="h-3 w-3" />,
      'Negotiation': <MessageSquare className="h-3 w-3" />,
      'Closed Won': <CheckCircle className="h-3 w-3" />,
      'Closed Lost': <XCircle className="h-3 w-3" />
    };
    return icons[stage] || <Flag className="h-3 w-3" />;
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Hot': <Star className="h-3 w-3 text-amber-500" fill="currentColor" />,
      'Warm': <TrendingUp className="h-3 w-3 text-orange-500" />,
      'Cold': <Clock className="h-3 w-3 text-blue-500" />,
      'Converted': <Award className="h-3 w-3 text-green-600" />,
      'Won': <CheckCircle className="h-3 w-3 text-green-600" />,
      'Lost': <XCircle className="h-3 w-3 text-red-600" />
    };
    return icons[status] || <Activity className="h-3 w-3 text-gray-500" />;
  }, []);

  const getFollowUpBadges = useCallback((lead: any) => {
    const followUps = [];
    for (let i = 1; i <= 4; i++) {
      const dateField = `followUp${i}Date`;
      const commentField = `followUp${i}Comments`;
      if (lead[dateField]) {
        followUps.push({
          date: lead[dateField],
          comment: lead[commentField] || '',
          index: i
        });
      }
    }
    return followUps;
  }, []);
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200 dark:shadow-amber-900/30 animate-pulse">
          <Kanban className="h-7 w-7 text-white" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-slate-700 dark:text-slate-200">Loading board…</p>
          <p className="text-xs text-slate-400 mt-1">Organising your leads into columns</p>
        </div>
      </div>
    );
  }

  if (Object.keys(groupedLeads).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center shadow-inner">
          <Zap className="h-8 w-8 text-slate-400 dark:text-slate-500" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">No leads found</h3>
          <p className="text-sm text-slate-400 mt-1">Adjust your filters or import leads to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Toolbar ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200 dark:shadow-amber-900/30 flex-shrink-0">
            <Kanban className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">Kanban Board</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {filteredLeads.length} leads &middot; {sortedGroups.length} columns
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={groupByField} onValueChange={handleGroupByChange}>
            <SelectTrigger className="h-8 w-36 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <Layers className="h-3 w-3 mr-1.5 text-slate-400" />
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

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-8 w-32 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value} className="text-xs">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="h-8 w-8 p-0 rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm"
          >
            {sortOrder === 'asc' ? <SortAsc className="h-3.5 w-3.5" /> : <SortDesc className="h-3.5 w-3.5" />}
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 rounded-2xl border-slate-200 dark:border-slate-700 shadow-2xl p-5">
              <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200 mb-4">Board Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="compact-mode" className="text-xs text-slate-600 dark:text-slate-400">Compact mode</Label>
                  <Switch id="compact-mode" checked={compactMode} onCheckedChange={setCompactMode} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-avatars" className="text-xs text-slate-600 dark:text-slate-400">Show avatars</Label>
                  <Switch id="show-avatars" checked={showAvatars} onCheckedChange={setShowAvatars} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-empty" className="text-xs text-slate-600 dark:text-slate-400">Show empty columns</Label>
                  <Switch id="show-empty" checked={showEmptyColumns} onCheckedChange={setShowEmptyColumns} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-600 dark:text-slate-400">Card height: {cardHeight[0]}px</Label>
                  <Slider value={cardHeight} onValueChange={setCardHeight} max={200} min={80} step={10} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-600 dark:text-slate-400">Columns per row: {columnsPerRow[0]}</Label>
                  <Slider value={columnsPerRow} onValueChange={setColumnsPerRow} max={6} min={2} step={1} />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Board refreshed")}
            className="h-8 w-8 p-0 rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Board ──────────────────────────────────────────────────── */}
      <div className="overflow-x-auto pb-6">
        <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
          {sortedGroups.map(group => {
            const colGradient = getGroupColor(group);
            const count = groupedLeads[group].length;

            return (
              <div
                key={group}
                className="flex flex-col w-[295px] rounded-2xl overflow-hidden
                  bg-slate-50/90 dark:bg-slate-800/60
                  border border-slate-200/80 dark:border-slate-700/50
                  shadow-lg backdrop-blur-sm"
              >
                {/* Column header */}
                <div className={`bg-gradient-to-r ${colGradient} px-4 py-3.5`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Layers className="h-4 w-4 text-white/80" />
                      <span className="text-sm font-semibold text-white truncate max-w-[140px]">
                        {group || 'Undefined'}
                      </span>
                      <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-white/25 text-white text-xs font-bold">
                        {count}
                      </span>
                    </div>
                    <button className="text-white/60 hover:text-white transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2.5 h-1 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-white/60 transition-all duration-500"
                      style={{ width: `${Math.min((count / Math.max(filteredLeads.length, 1)) * 100 * 3, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Cards list */}
                <div
                  className="flex-1 p-3 space-y-2.5 overflow-y-auto"
                  style={{ maxHeight: '68vh' }}
                >
                  {groupedLeads[group].map(lead => {
                    const cardAccent = getGroupColor(lead.status || group);
                    return (
                      <div
                        key={lead.id}
                        onClick={() => onLeadClick(lead)}
                        className="group relative bg-white dark:bg-slate-700/70
                          rounded-xl border border-slate-200/70 dark:border-slate-600/40
                          shadow-sm hover:shadow-xl hover:-translate-y-0.5
                          transition-all duration-200 cursor-pointer overflow-hidden"
                        style={{ minHeight: `${cardHeight[0]}px` }}
                      >
                        {/* Left accent strip */}
                        <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${cardAccent}`} />

                        <div className={`px-3.5 pt-3 pb-3 ${compactMode ? 'space-y-1.5' : 'space-y-2.5'} pl-[14px]`}>

                          {/* Lead name + avatar */}
                          <div className="flex items-start gap-2.5">
                            {showAvatars && (
                              <Avatar className={`ring-2 ring-white dark:ring-slate-700 shadow-sm flex-shrink-0 ${compactMode ? 'h-6 w-6' : 'h-8 w-8'}`}>
                                <AvatarFallback
                                  className={`text-white font-bold bg-gradient-to-br ${cardAccent} ${compactMode ? 'text-[9px]' : 'text-xs'}`}
                                >
                                  {getInitials(lead.fullName)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight ${compactMode ? 'text-xs' : 'text-sm'}`}>
                                {lead.fullName}
                              </p>
                              {groupByField !== 'status' && lead.status && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  {getStatusIcon(lead.status)}
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{lead.status}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Contact info */}
                          {!compactMode && (
                            <div className="space-y-1">
                              {lead.email && (
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                  <Mail className="h-3 w-3 flex-shrink-0 opacity-70" />
                                  <span className="truncate">{lead.email}</span>
                                </div>
                              )}
                              {lead.phone && (
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                  <Phone className="h-3 w-3 flex-shrink-0 opacity-70" />
                                  <span>{lead.phone}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            {lead.source && groupByField !== 'source' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md
                                bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300
                                border border-sky-100 dark:border-sky-800/50">
                                {getSourceIcon(lead.source)}
                                <span className="max-w-[55px] truncate">{lead.source}</span>
                              </span>
                            )}
                            {groupByField !== 'stage' && lead.stage && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md
                                bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300
                                border border-violet-100 dark:border-violet-800/50">
                                {getStageIcon(lead.stage)}
                                <span className="max-w-[70px] truncate">{lead.stage}</span>
                              </span>
                            )}
                          </div>

                          {/* Follow-ups */}
                          {!compactMode && getFollowUpBadges(lead).length > 0 && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 transition-colors select-none">
                                <MessageSquare className="h-2.5 w-2.5" />
                                {getFollowUpBadges(lead).length} follow-up{getFollowUpBadges(lead).length > 1 ? 's' : ''}
                              </summary>
                              <div className="mt-1.5 space-y-1.5 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                {getFollowUpBadges(lead).slice(0, 2).map((fu, idx) => (
                                  <div key={idx} className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                                      <CalendarCheck className="h-2.5 w-2.5 text-emerald-500" />
                                      <span>F{fu.index}: {formatDate(fu.date)}</span>
                                    </div>
                                    {fu.comment && (
                                      <p className="ml-4 text-slate-500 dark:text-slate-400 line-clamp-1">{fu.comment}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}

                          {/* Footer row */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50">
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                              <Clock className="h-2.5 w-2.5" />
                              {formatDate(lead.createdAt)}
                            </span>
                            {lead.associate && (
                              <Avatar className="h-5 w-5 ring-1 ring-white dark:ring-slate-700 shadow-sm">
                                <AvatarFallback
                                  className="bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300"
                                  style={{ fontSize: '7px' }}
                                >
                                  {getInitials(lead.associate)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add card button */}
                  <button
                    onClick={() => toast.info("Add new lead functionality coming soon")}
                    className="w-full flex items-center justify-center gap-1.5 text-xs
                      text-slate-400 dark:text-slate-500
                      hover:text-slate-600 dark:hover:text-slate-300
                      py-2.5 rounded-xl
                      border-2 border-dashed border-slate-200 dark:border-slate-700
                      hover:border-slate-300 dark:hover:border-slate-600
                      hover:bg-white/70 dark:hover:bg-slate-700/30
                      transition-all duration-150"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add card
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}