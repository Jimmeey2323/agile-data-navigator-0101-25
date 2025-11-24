import React, { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuGroup, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnhancedBadge } from "@/components/ui/enhanced-badge";
import { useLeads } from '@/contexts/LeadContext';
import { MoreHorizontal, ArrowUpDown, Edit, Trash2, Eye, FileText, Phone, Mail, AlertCircle, CheckCircle, Clock, HelpCircle, Zap, Globe, LinkedinIcon, FacebookIcon, Twitter, Instagram, Megaphone, FilePlus2, UserPlus, Locate, CalendarClock, ShoppingCart, Hourglass, XCircle, PhoneCall, MessageCircle, WalletCards, Send, Landmark, BookX, UserX, Languages, PhoneOff, DollarSign, Calendar, Map, HeartPulse, LocateFixed, Plane, ThumbsUp, User, Ban, Settings, Bookmark, BookmarkCheck, Filter, ChevronDown, ChevronRight, ChevronUp, X, Columns, EyeOff, Layers, TrendingUp, Activity, Sparkles, Target, Award, Star, AlertTriangle as AlertTriangleIcon, Flame, Snowflake, Crown } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { formatDate, groupBy, getFollowUpStatus, formatRevenue, formatDisplayText, formatFollowUpDate } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface Lead {
  id: string;
  fullName: string;
  source: string;
  createdAt: string;
  associate: string;
  stage: string;
  status: string;
  remarks?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

interface LeadsTableProps {
  onLeadClick: (lead: Lead) => void;
  selectedLeads: string[];
  setSelectedLeads: (leadIds: string[]) => void;
  compactMode?: boolean;
}

export const LeadsTable = ({
  onLeadClick,
  selectedLeads,
  setSelectedLeads,
  compactMode = false
}: LeadsTableProps) => {
  const {
    filteredLeads,
    loading,
    sortConfig,
    setSortConfig,
    page,
    pageSize,
    deleteLead,
    setPageSize
  } = useLeads();

  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [bookmarkedLeads, setBookmarkedLeads] = useState<string[]>([]);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [groupByFields, setGroupByFields] = useState<string[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    source: true,
    created: true,
    associate: true,
    stage: true,
    status: true,
    remarks: true,
    followUps: true,
    followUpComments: true
  });

  // Load bookmarks from localStorage on component mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('bookmarkedLeads');
    if (savedBookmarks) {
      setBookmarkedLeads(JSON.parse(savedBookmarks));
    }
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('bookmarkedLeads', JSON.stringify(bookmarkedLeads));
  }, [bookmarkedLeads]);
  const startIndex = (page - 1) * pageSize;

  let displayedLeads: Lead[] = filteredLeads as Lead[];

  // Filter by bookmarks if enabled

  if (showBookmarkedOnly) {
    displayedLeads = displayedLeads.filter((lead: Lead) => bookmarkedLeads.includes(lead.id));
  }

  // Multi-level grouping function
  const createMultiLevelGroups = (leads: Lead[], fields: string[]): Record<string, Lead[]> => {
    if (fields.length === 0) {
      return { '': leads };
    }

    const grouped: Record<string, Lead[]> = {};
    
    for (const lead of leads) {
      const groupKey = fields.map(field => {
        const value = lead[field as keyof Lead];
        return value || 'Unassigned';
      }).join(' → ');
      
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(lead);
    }
    
    return grouped;
  };

  // Group leads if grouping is enabled
  // Note: displayedLeads already includes sorting from filteredLeads
  const groupedLeads: Record<string, Lead[]> = useMemo(() => {
    if (groupByFields.length === 0) {
      // When no grouping, apply pagination to already-sorted leads
      return {
        '': displayedLeads.slice(startIndex, startIndex + pageSize)
      };
    }
    // When grouping, use all leads (sorted) and group them
    return createMultiLevelGroups(displayedLeads, groupByFields);
  }, [displayedLeads, groupByFields, startIndex, pageSize]);

  const handleSort = (key: string) => {
    if (sortConfig?.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setSortConfig({
        key,
        direction: 'asc'
      });
    }
  };

  const handleDeleteLead = (id: string) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      deleteLead(id).then(() => {
        toast.success("Lead deleted successfully");
        if (bookmarkedLeads.includes(id)) {
          handleToggleBookmark(id, false);
        }
      }).catch(error => {
        toast.error("Failed to delete lead");
        console.error(error);
      });
    }
  };

  const handleSelectAllLeads = (checked: boolean) => {
    if (checked) {
      const allLeads: Lead[] = Object.values(groupedLeads).flat();
      setSelectedLeads(allLeads.map((lead: Lead) => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, leadId]);
    } else {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    }
  };

  const handleToggleBookmark = (id: string, isBookmarked: boolean) => {
    if (isBookmarked) {
      setBookmarkedLeads([...bookmarkedLeads, id]);
      toast.success("Lead bookmarked for quick access");
    } else {
      setBookmarkedLeads(bookmarkedLeads.filter(leadId => leadId !== id));
      toast.success("Lead removed from bookmarks");
    }
  };

  const toggleColumn = (column: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups(prev => prev.includes(groupKey) ? prev.filter(key => key !== groupKey) : [...prev, groupKey]);
  };

  // Get enhanced badge variant for different categories
  const getSourceBadgeVariant = (source: string) => {
    const sourceVariants: Record<string, string> = {
      'Website': 'website',
      'Website Form': 'website',
      'Social Media': 'social',
      'Social - Instagram': 'social',
      'Social - Facebook': 'social',
      'Referral': 'referral',
      'Event': 'event',
      'Cold Call': 'coldcall',
      'Email Campaign': 'email',
      'Other': 'other'
    };
    return sourceVariants[source] || 'other';
  };

  const getStageBadgeVariant = (stage: string) => {
    const stageVariants: Record<string, string> = {
      'New Enquiry': 'newenquiry',
      'Initial Contact': 'initialcontact',
      'Trial Scheduled': 'trialscheduled',
      'Trial Completed': 'trialcompleted',
      'Membership Sold': 'membershipsold',
      'Not Interested': 'notinterested',
      'Lost': 'lost'
    };
    return stageVariants[stage] || 'default';
  };

  const getStatusBadgeVariant = (status: string) => {
    const statusVariants: Record<string, string> = {
      'Won': 'won',
      'Lost': 'lost',
      'Hot': 'hot',
      'Warm': 'warm',
      'Cold': 'cold',
      'Converted': 'converted',
      'Open': 'open',
      'Disqualified': 'disqualified',
      'Unresponsive': 'unresponsive'
    };
    return statusVariants[status] || 'default';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
  };

  // Function to aggregate all meaningful follow-up comments with dates
  const getAllFollowUpComments = (lead: Lead) => {
    const followUps = [
      { date: lead.followUp1Date, comments: lead.followUp1Comments, number: 1 },
      { date: lead.followUp2Date, comments: lead.followUp2Comments, number: 2 },
      { date: lead.followUp3Date, comments: lead.followUp3Comments, number: 3 },
      { date: lead.followUp4Date, comments: lead.followUp4Comments, number: 4 }
    ];
    
    const validFollowUps = followUps.filter(followUp => {
      // Only include follow-ups that have BOTH meaningful comments AND valid dates
      const hasValidComments = followUp.comments && 
        typeof followUp.comments === 'string' &&
        followUp.comments.trim() !== '' && 
        followUp.comments.trim() !== '-' &&
        followUp.comments.toLowerCase().trim() !== 'no comments' &&
        followUp.comments.toLowerCase().trim() !== 'n/a';
        
      const hasValidDate = followUp.date && 
        typeof followUp.date === 'string' &&
        followUp.date.trim() !== '' && 
        followUp.date.trim() !== '-' &&
        followUp.date.toLowerCase().trim() !== 'no date' &&
        followUp.date.toLowerCase().trim() !== 'n/a' &&
        followUp.date !== '1900-01-01'; // Avoid placeholder dates
      
      return hasValidComments && hasValidDate;
    });
    
    const formattedComments = validFollowUps.map(followUp => {
      const formattedDate = formatFollowUpDate(followUp.date);
      const formattedComment = formatDisplayText(followUp.comments);
      
      return `${formattedDate} - ${formattedComment}`;
    });
    
    return formattedComments.length > 0 ? formattedComments.join(' | ') : '';
  };

  if (loading) {
    return (
      <Card className="shadow-md border-border/30">
        <CardContent className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            {Array(5).fill(0).map((_, index) => (
              <Skeleton key={index} className="h-8 w-full rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-2xl border-0 overflow-hidden bg-white/95 backdrop-blur-sm rounded-xl">
      {/* Enhanced Header with sophisticated design */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-purple-900/10 to-blue-900/10"></div>
        <div className="relative flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Activity className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide font-sans">
                Lead Management System
              </h2>
              <p className="text-gray-300 mt-1 font-medium text-sm tracking-wide">
                Advanced analytics & comprehensive lead tracking
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)} className={`text-white hover:bg-white/20 transition-colors ${showBookmarkedOnly ? "bg-white/20" : ""}`}>
                    {showBookmarkedOnly ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showBookmarkedOnly ? "Show all leads" : "Show only bookmarked leads"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-44 bg-white/10 border-white/30 text-white font-medium text-sm backdrop-blur-sm justify-between">
                  <span>
                    {groupByFields.length === 0 ? 'Group by...' : `${groupByFields.length} field${groupByFields.length > 1 ? 's' : ''}`}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" align="start">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Group by fields</h4>
                  <div className="space-y-2">
                    {['source', 'status', 'stage', 'associate', 'center'].map((field) => (
                      <div key={field} className="flex items-center space-x-2">
                        <Checkbox
                          id={field}
                          checked={groupByFields.includes(field)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setGroupByFields([...groupByFields, field]);
                            } else {
                              setGroupByFields(groupByFields.filter(f => f !== field));
                            }
                          }}
                        />
                        <Label htmlFor={field} className="text-sm capitalize">
                          {field}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {groupByFields.length > 0 && (
                    <div className="pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGroupByFields([])}
                        className="w-full"
                      >
                        Clear all
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            
            {groupByFields.length > 0 && (
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/20 transition-colors text-xs px-2 py-1"
                  onClick={() => setCollapsedGroups([])}
                >
                  Expand All
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/20 transition-colors text-xs px-2 py-1"
                  onClick={() => {
                    // Get all group keys to collapse them all
                    const allGroupKeys = Object.keys(groupedLeads).filter(key => key !== '');
                    setCollapsedGroups(allGroupKeys);
                  }}
                >
                  Collapse All
                </Button>
              </div>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 transition-colors">
                  <Columns className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Visible Columns</Label>
                  {Object.entries(visibleColumns).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={`column-${key}`} className="capitalize text-sm">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                      <Checkbox id={`column-${key}`} checked={value} onCheckedChange={() => toggleColumn(key)} />
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="overflow-x-auto bg-white rounded-b-xl border-l-4 border-r-4 border-black max-w-[98vw]"> {/* Made table wider */}
          <div className="relative">
            <Table className="w-full text-sm min-w-[1400px]"> {/* Added minimum width */}
              <TableHeader className="sticky top-0 z-20 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg">
                <TableRow className="border-0 hover:bg-gradient-to-r hover:from-gray-800 hover:via-gray-700 hover:to-gray-800 transition-all duration-300">
                  <TableHead className="w-16 text-white font-bold text-center border-r border-white/10 h-14 bg-transparent">
                    <Checkbox 
                      checked={selectedLeads.length === Object.values(groupedLeads).flat().length && Object.values(groupedLeads).flat().length > 0} 
                      onCheckedChange={handleSelectAllLeads} 
                      className="border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-gray-800" 
                    />
                  </TableHead>
                  {visibleColumns.name && (
                    <TableHead className="min-w-[280px] text-white font-bold border-r border-white/10 h-14 bg-transparent">
                      <div className="flex items-center cursor-pointer py-2" onClick={() => handleSort('fullName')}>
                        <User className="h-4 w-4 mr-2" />
                        FULL NAME
                        {sortConfig?.key === 'fullName' ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="ml-2 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-2 h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="ml-2 h-4 w-4 opacity-60" />
                        )}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.source && (
                    <TableHead className="min-w-[140px] text-white font-bold border-r border-white/10 h-14 bg-transparent">
                      <div className="flex items-center cursor-pointer py-2" onClick={() => handleSort('source')}>
                        <Globe className="h-4 w-4 mr-2" />
                        SOURCE
                        {sortConfig?.key === 'source' ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="ml-2 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-2 h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="ml-2 h-4 w-4 opacity-60" />
                        )}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.created && (
                    <TableHead className="min-w-[120px] text-white font-bold border-r border-white/10 h-14 bg-transparent">
                      <div className="flex items-center cursor-pointer py-2" onClick={() => handleSort('createdAt')}>
                        <Calendar className="h-4 w-4 mr-2" />
                        CREATED
                        {sortConfig?.key === 'createdAt' ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="ml-2 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-2 h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="ml-2 h-4 w-4 opacity-60" />
                        )}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.associate && (
                    <TableHead className="min-w-[180px] text-white font-bold border-r border-white/10 h-14 bg-transparent">
                      <div className="flex items-center cursor-pointer py-2" onClick={() => handleSort('associate')}>
                        <User className="h-4 w-4 mr-2" />
                        ASSOCIATE
                        {sortConfig?.key === 'associate' ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="ml-2 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-2 h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="ml-2 h-4 w-4 opacity-60" />
                        )}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.stage && (
                    <TableHead className="min-w-[220px] text-white font-bold border-r border-white/10 h-14 bg-transparent"> {/* Increased from 160px to 220px */}
                      <div className="flex items-center cursor-pointer py-2" onClick={() => handleSort('stage')}>
                        <Target className="h-4 w-4 mr-2" />
                        STAGE
                        {sortConfig?.key === 'stage' ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="ml-2 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-2 h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="ml-2 h-4 w-4 opacity-60" />
                        )}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.status && (
                    <TableHead className="min-w-[120px] text-white font-bold border-r border-white/10 h-14 bg-transparent">
                      <div className="flex items-center cursor-pointer py-2" onClick={() => handleSort('status')}>
                        <Activity className="h-4 w-4 mr-2" />
                        STATUS
                        {sortConfig?.key === 'status' ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="ml-2 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-2 h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="ml-2 h-4 w-4 opacity-60" />
                        )}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.remarks && (
                    <TableHead className="min-w-[350px] text-white font-bold border-r border-white/10 h-14 bg-transparent"> {/* Increased from 200px to 350px */}
                      <div className="flex items-center cursor-pointer py-2" onClick={() => handleSort('remarks')}>
                        <FileText className="h-4 w-4 mr-2" />
                        REMARKS
                        {sortConfig?.key === 'remarks' ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="ml-2 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-2 h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="ml-2 h-4 w-4 opacity-60" />
                        )}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.followUps && (
                    <TableHead className="min-w-[140px] text-white font-bold border-r border-white/10 h-14 bg-transparent">
                      <div className="flex items-center py-2">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        FOLLOW-UPS
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.followUpComments && (
                    <TableHead className="min-w-[450px] text-white font-bold border-r border-white/10 h-14 bg-transparent"> {/* Increased from 300px to 450px */}
                      <div className="flex items-center py-2">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        FOLLOW-UP COMMENTS
                      </div>
                    </TableHead>
                  )}
                  <TableHead className="w-24 text-white font-bold text-center h-14 bg-transparent">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {Object.entries(groupedLeads).map(([groupKey, groupLeadsArr]) => (
                  <React.Fragment key={groupKey}>
                    {groupByFields.length > 0 && groupKey && (
                      <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 border-b-2 border-gray-200">
                        <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 2} className="h-14">
                          <div className="flex items-center justify-between">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => toggleGroup(groupKey)} 
                              className="flex items-center gap-2 font-bold text-gray-800 hover:text-gray-900 text-sm"
                            >
                              {collapsedGroups.includes(groupKey) ? (
                                <ChevronRight className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                              <Layers className="h-4 w-4" />
                              {groupKey} ({groupLeadsArr.length} leads)
                            </Button>
                            <div className="flex items-center gap-4 text-sm text-gray-700 font-semibold">
                              <span>Subtotal: {groupLeadsArr.length} leads</span>
                              <div className="bg-white border border-gray-300 text-sm px-2 py-1 rounded">
                                {filteredLeads.length > 0 ? Math.round(groupLeadsArr.length / filteredLeads.length * 100) : 0}% of total
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    
                    {(groupByFields.length === 0 || !collapsedGroups.includes(groupKey)) && 
                      groupLeadsArr.map((lead: Lead) => {
                        const followUpStatus = getFollowUpStatus(lead);
                        const allComments = getAllFollowUpComments(lead);
                        
                        return (
                          <TableRow 
                            key={lead.id} 
                            className="max-h-10 hover:bg-gray-50/80 transition-all duration-200 cursor-pointer border-b border-gray-100 group" 
                            onClick={() => onLeadClick(lead)}
                          >
                            <TableCell className="max-h-10 py-1 text-center border-r border-gray-100" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-2">
                                <Checkbox 
                                  checked={selectedLeads.includes(lead.id)} 
                                  onCheckedChange={checked => handleSelectLead(lead.id, checked === true)} 
                                  className="h-4 w-4" 
                                />
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className={`h-6 w-6 p-0 ${bookmarkedLeads.includes(lead.id) ? 'text-amber-500' : 'text-gray-400'}`} 
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleToggleBookmark(lead.id, !bookmarkedLeads.includes(lead.id));
                                  }}
                                >
                                  {bookmarkedLeads.includes(lead.id) ? (
                                    <BookmarkCheck className="h-4 w-4" />
                                  ) : (
                                    <Bookmark className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>

                            {visibleColumns.name && (
                              <TableCell className="max-h-10 py-1 border-r border-gray-100">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8 border-2 border-gray-200">
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-teal-600 text-white text-sm font-bold">
                                      {getInitials(lead.fullName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="font-semibold text-sm text-gray-800 truncate max-w-[200px] cursor-pointer">
                                            {lead.fullName}
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs bg-gray-800 text-white">
                                          <p className="font-semibold">{lead.fullName}</p>
                                          <p className="text-sm">{lead.email}</p>
                                          <p className="text-sm">{lead.phone}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                                      {lead.email && (
                                        <div className="flex items-center gap-1">
                                          <Mail className="h-3 w-3" />
                                          <span className="truncate max-w-[160px]">{lead.email}</span>
                                        </div>
                                      )}
                                      {lead.phone && (
                                        <div className="flex items-center gap-1">
                                          <Phone className="h-3 w-3" />
                                          <span className="truncate max-w-[160px]">{lead.phone}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            )}
                            
                            {visibleColumns.source && (
                              <TableCell className="max-h-10 py-1 border-r border-gray-100">
                                <div className="flex justify-start items-center">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="inline-flex items-center gap-2 text-sm text-gray-700 font-medium">
                                          <Globe className="h-4 w-4" />
                                          {lead.source}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-gray-800 text-white">
                                        <p>Source: {lead.source}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            )}
                            
                            {visibleColumns.created && (
                              <TableCell className="max-h-10 py-1 border-r border-gray-100">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="text-sm text-gray-700 font-medium cursor-pointer">
                                        {formatDate(lead.createdAt)}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-gray-800 text-white">
                                      <p>Created: {formatDate(lead.createdAt)}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                            )}
                            
                            {visibleColumns.associate && (
                              <TableCell className="max-h-10 py-1 border-r border-gray-100">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white text-sm font-bold">
                                      {getInitials(lead.associate)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="truncate text-sm font-medium text-gray-700 max-w-[140px] cursor-pointer">
                                          {lead.associate}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-gray-800 text-white">
                                        <p>Associate: {lead.associate}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            )}
                            
                            {visibleColumns.stage && (
                              <TableCell className="max-h-10 py-1 border-r border-gray-100">
                                <div className="flex justify-start">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="inline-flex items-center gap-2 text-sm text-gray-700 font-medium">
                                          <Target className="h-4 w-4" />
                                          {lead.stage}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-gray-800 text-white">
                                        <p>Stage: {lead.stage}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            )}
                            
                            {visibleColumns.status && (
                              <TableCell className="max-h-10 py-1 border-r border-gray-100">
                                <div className="flex justify-start">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="inline-flex items-center gap-2 text-sm text-gray-700 font-medium">
                                          <Activity className="h-4 w-4" />
                                          {lead.status}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-gray-800 text-white">
                                        <p>Status: {lead.status}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            )}
                            
                            {visibleColumns.remarks && (
                              <TableCell className="max-h-10 py-1 border-r border-gray-100">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="text-sm text-gray-700 truncate max-w-[300px] block cursor-pointer">
                                        {lead.remarks ? formatDisplayText(lead.remarks) : 'No remarks'}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs bg-gray-800 text-white">
                                      <p className="font-semibold">Remarks:</p>
                                      <p>{lead.remarks ? formatDisplayText(lead.remarks) : 'No remarks'}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                            )}
                            
                            {visibleColumns.followUps && (
                              <TableCell className="max-h-10 py-1 border-r border-gray-100" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    <MessageCircle className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-semibold">
                                      {followUpStatus.completed}/{followUpStatus.total}
                                    </span>
                                  </div>
                                  
                                  {followUpStatus.overdue > 0 && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center gap-1">
                                            <AlertTriangleIcon className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-600 font-medium">
                                              {followUpStatus.overdue}
                                            </span>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-red-600 text-white">
                                          <p>{followUpStatus.overdue} follow-up(s) overdue</p>
                                          <p>Lead created {followUpStatus.daysSinceCreated} days ago</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                  
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-96 rounded-xl shadow-xl border-0 bg-white/90 backdrop-blur-lg">
                                      <div className="space-y-4 p-2">
                                        <h4 className="font-bold text-sm text-gray-700 mb-2 border-b border-gray-200 pb-1">Follow-up History</h4>
                                        {followUpStatus.followUps.length === 0 && (
                                          <div className="text-sm text-gray-400">No follow-ups found.</div>
                                        )}
                                        {followUpStatus.followUps.map((followUp, index) => {
                                          const isOverdue = !followUp.isValid && followUpStatus.daysSinceCreated >= followUp.expectedDay;
                                          return (
                                            <div 
                                              key={index} 
                                              className={`p-3 rounded-xl border text-sm flex flex-col gap-1 ${
                                                isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                                              }`} 
                                              style={{boxShadow:'0 2px 8px 0 rgba(0,0,0,0.04)'}}
                                            >
                                              <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-gray-700">Follow-up {index + 1}</span>
                                                {isOverdue && <AlertTriangleIcon className="h-4 w-4 text-red-500" />}
                                                {followUp.isValid && <CheckCircle className="h-4 w-4 text-green-500" />}
                                                <Clock className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-500">Day {followUp.expectedDay}</span>
                                              </div>
                                              {followUp.date ? (
                                                <>
                                                  <p className="text-sm text-gray-600">Date: <span className="font-semibold">{formatDate(followUp.date)}</span></p>
                                                  <p className="text-sm text-gray-700">{followUp.comments || <span className="italic text-gray-400">No comments</span>}</p>
                                                </>
                                              ) : (
                                                <p className={`text-sm ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                                                  {isOverdue ? `Overdue (expected day ${followUp.expectedDay})` : `Expected on day ${followUp.expectedDay}`}
                                                </p>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </TableCell>
                            )}

                            {visibleColumns.followUpComments && (
                              <TableCell className="max-h-10 py-1 border-r border-gray-100">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="text-sm text-gray-700 max-w-[400px]">
                                        {allComments ? (
                                          <p className="truncate cursor-pointer">{allComments}</p>
                                        ) : (
                                          <span className="italic text-gray-400">No follow-up comments</span>
                                        )}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-2xl bg-gray-800 text-white">
                                      <p className="font-semibold">All Follow-up Comments:</p>
                                      <div className="text-sm whitespace-pre-line max-h-64 overflow-y-auto">
                                        {allComments ? (
                                          allComments.split(' | ').map((comment, index) => (
                                            <p key={index} className="mb-2 last:mb-0">{comment}</p>
                                          ))
                                        ) : (
                                          'No follow-up comments available'
                                        )}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                            )}
                            
                            <TableCell className="max-h-10 py-1 text-center" onClick={e => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-200">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                  <DropdownMenuLabel className="text-sm">Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => onLeadClick(lead)} className="text-sm">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Lead
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => toast.info("View details coming soon")} className="text-sm">
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive focus:text-destructive text-sm" 
                                    onClick={() => handleDeleteLead(lead.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Lead
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    }
                  </React.Fragment>
                ))}
                
                {Object.values(groupedLeads).flat().length === 0 && (
                  <TableRow>
                    <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 2} className="text-center py-12 text-gray-500">
                      {showBookmarkedOnly && bookmarkedLeads.length === 0 ? (
                        <div className="flex flex-col items-center gap-4">
                          <Bookmark className="h-12 w-12 text-gray-400" />
                          <p className="text-lg">No bookmarked leads found. Bookmark some leads to see them here.</p>
                          <Button variant="outline" size="sm" onClick={() => setShowBookmarkedOnly(false)}>
                            Show All Leads
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          <User className="h-12 w-12 text-gray-400" />
                          <p className="text-lg">No leads found. {filteredLeads.length > 0 ? "Try adjusting your filters or pagination." : "Add some leads to get started."}</p>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
