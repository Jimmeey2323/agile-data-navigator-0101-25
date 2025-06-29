import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLeads } from '@/contexts/LeadContext';
import { 
  MoreHorizontal, 
  ArrowUpDown, 
  Edit, 
  Trash2, 
  Eye, 
  FileText, 
  Phone, 
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  HelpCircle,
  Zap,
  Globe,
  LinkedinIcon,
  FacebookIcon,
  Twitter,
  Instagram,
  Megaphone,
  FilePlus2,
  UserPlus,
  Locate,
  CalendarClock,
  ShoppingCart,
  Hourglass,
  XCircle,
  PhoneCall,
  MessageCircle,
  WalletCards,
  Send,
  Landmark,
  BookX,
  UserX,
  Languages,
  PhoneOff,
  DollarSign,
  Calendar,
  Map,
  HeartPulse,
  LocateFixed,
  Plane,
  ThumbsUp,
  User,
  Ban,
  Settings,
  Bookmark,
  BookmarkCheck,
  Filter,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  X,
  Columns,
  EyeOff,
  Layers,
  TrendingUp,
  Activity,
  Sparkles,
  Target,
  Award,
  Star
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { formatDate, groupBy } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LeadsTableProps {
  onLeadClick: (lead: any) => void;
  selectedLeads: string[];
  setSelectedLeads: (leadIds: string[]) => void;
  compactMode?: boolean;
}

export const LeadsTable = ({ onLeadClick, selectedLeads, setSelectedLeads, compactMode = false }: LeadsTableProps) => {
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
  const [groupByField, setGroupByField] = useState<string>('none');
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    source: true,
    created: true,
    associate: true,
    stage: true,
    status: true,
    remarks: true,
    followUps: true
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
  let displayedLeads = filteredLeads;
  
  // Filter by bookmarks if enabled
  if (showBookmarkedOnly) {
    displayedLeads = displayedLeads.filter(lead => bookmarkedLeads.includes(lead.id));
  }
  
  // Group leads if grouping is enabled
  const groupedLeads = useMemo(() => {
    if (groupByField === 'none') {
      return { '': displayedLeads.slice(startIndex, startIndex + pageSize) };
    }
    
    const grouped = groupBy(displayedLeads, groupByField as keyof typeof displayedLeads[0]);
    
    // Apply pagination to each group
    const paginatedGroups: Record<string, any[]> = {};
    Object.entries(grouped).forEach(([key, leads]) => {
      paginatedGroups[key] = leads;
    });
    
    return paginatedGroups;
  }, [displayedLeads, groupByField, startIndex, pageSize]);

  const handleSort = (key: string) => {
    if (sortConfig?.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setSortConfig({ key, direction: 'asc' });
    }
  };

  const handleDeleteLead = (id: string) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      deleteLead(id)
        .then(() => {
          toast.success("Lead deleted successfully");
          if (bookmarkedLeads.includes(id)) {
            handleToggleBookmark(id, false);
          }
        })
        .catch((error) => {
          toast.error("Failed to delete lead");
          console.error(error);
        });
    }
  };

  const handleSelectAllLeads = (checked: boolean) => {
    if (checked) {
      const allLeads = Object.values(groupedLeads).flat();
      setSelectedLeads(allLeads.map(lead => lead.id));
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
    setCollapsedGroups(prev => 
      prev.includes(groupKey) 
        ? prev.filter(key => key !== groupKey)
        : [...prev, groupKey]
    );
  };

  const getStatusColor = (status: string) => {
    const statusCategories = {
      positive: ['Won', 'Trial Completed', 'Trial Scheduled'],
      negative: ['Lost', 'Unresponsive', 'Disqualified'],
      neutral: ['Open', 'Uncategorized']
    };

    if (statusCategories.positive.includes(status)) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300';
    } else if (statusCategories.negative.includes(status)) {
      return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300';
    } else if (statusCategories.neutral.includes(status)) {
      return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300';
    } else {
      return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800/50 dark:text-slate-300';
    }
  };

  const getSourceIcon = (source: string) => {
    const sourceIconMap: Record<string, JSX.Element> = {
      'Website': <Globe className="h-4 w-4 text-blue-500" />,
      'Website Form': <FilePlus2 className="h-4 w-4 text-blue-500" />,
      'Social Media': <Twitter className="h-4 w-4 text-sky-500" />,
      'Social - Instagram': <Instagram className="h-4 w-4 text-pink-600" />,
      'Social - Facebook': <FacebookIcon className="h-4 w-4 text-blue-600" />,
      'Referral': <UserPlus className="h-4 w-4 text-green-500" />,
      'Event': <Locate className="h-4 w-4 text-purple-500" />,
      'Cold Call': <PhoneCall className="h-4 w-4 text-blue-600" />,
      'Email Campaign': <Mail className="h-4 w-4 text-purple-500" />,
      'Other': <HelpCircle className="h-4 w-4 text-gray-500" />
    };
    
    return sourceIconMap[source] || <Globe className="h-4 w-4 text-gray-500" />;
  };

  const getStageIcon = (stage: string) => {
    const stageIconMap: Record<string, JSX.Element> = {
      'New Enquiry': <Zap className="h-4 w-4 text-blue-500" />,
      'Initial Contact': <PhoneCall className="h-4 w-4 text-blue-500" />,
      'Trial Scheduled': <Calendar className="h-4 w-4 text-purple-500" />,
      'Trial Completed': <CheckCircle className="h-4 w-4 text-green-600" />,
      'Membership Sold': <ShoppingCart className="h-4 w-4 text-green-900" />,
      'Not Interested': <BookX className="h-4 w-4 text-gray-500" />,
      'Lost': <UserX className="h-4 w-4 text-red-500" />
    };
    
    return stageIconMap[stage] || <HelpCircle className="h-4 w-4 text-gray-500" />;
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Won':
        return <CheckCircle className="h-4 w-4 text-green-700" />;
      case 'Lost':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'Hot':
        return <Star className="h-4 w-4 text-amber-500" fill="currentColor" />;
      case 'Warm':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'Cold':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'Converted':
        return <Award className="h-4 w-4 text-green-600" />;
      default:
        return <HelpCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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
    <Card className="shadow-lg border-border/30 overflow-hidden bg-white/95 backdrop-blur-xl">
      {/* Animated Title */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 p-6">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-indigo-800/20 animate-pulse"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Activity className="h-8 w-8 text-white animate-pulse" />
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Premium Lead Management
              </h2>
              <p className="text-indigo-100 mt-1">
                Advanced table with grouping, filtering, and analytics
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                    className={`text-white hover:bg-white/20 ${showBookmarkedOnly ? "bg-white/20" : ""}`}
                  >
                    {showBookmarkedOnly ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showBookmarkedOnly ? "Show all leads" : "Show only bookmarked leads"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Select value={groupByField} onValueChange={setGroupByField}>
              <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Group by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No grouping</SelectItem>
                <SelectItem value="source">Source</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="stage">Stage</SelectItem>
                <SelectItem value="associate">Associate</SelectItem>
                <SelectItem value="center">Center</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <Columns className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="space-y-2">
                  <Label>Visible Columns</Label>
                  {Object.entries(visibleColumns).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={`column-${key}`} className="capitalize">{key}</Label>
                      <Checkbox 
                        id={`column-${key}`} 
                        checked={value}
                        onCheckedChange={() => toggleColumn(key)}
                      />
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gradient-to-r from-indigo-600 to-purple-700 sticky top-0 z-10">
              <TableRow className="hover:bg-gradient-to-r hover:from-indigo-700 hover:to-purple-800 border-b border-white/20">
                <TableHead className="w-[50px] text-white h-[30px]">
                  <Checkbox 
                    checked={selectedLeads.length === Object.values(groupedLeads).flat().length && Object.values(groupedLeads).flat().length > 0}
                    onCheckedChange={handleSelectAllLeads}
                    className="border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-indigo-600"
                  />
                </TableHead>
                {visibleColumns.name && (
                  <TableHead className="min-w-[200px] text-white h-[30px]">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('fullName')}>
                      <User className="h-4 w-4 mr-2" />
                      Full Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.source && (
                  <TableHead className="min-w-[140px] text-white h-[30px]">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('source')}>
                      <Globe className="h-4 w-4 mr-2" />
                      Source
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.created && (
                  <TableHead className="min-w-[120px] text-white h-[30px]">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('createdAt')}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Created
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.associate && (
                  <TableHead className="min-w-[150px] text-white h-[30px]">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('associate')}>
                      <User className="h-4 w-4 mr-2" />
                      Associate
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.stage && (
                  <TableHead className="min-w-[200px] text-white h-[30px]">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('stage')}>
                      <Target className="h-4 w-4 mr-2" />
                      Stage
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.status && (
                  <TableHead className="min-w-[120px] text-white h-[30px]">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('status')}>
                      <Activity className="h-4 w-4 mr-2" />
                      Status
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.remarks && (
                  <TableHead className="min-w-[200px] text-white h-[30px]">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('remarks')}>
                      <FileText className="h-4 w-4 mr-2" />
                      Remarks
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                )}
                <TableHead className="text-right w-[100px] text-white h-[30px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedLeads).map(([groupKey, groupLeads]) => (
                <React.Fragment key={groupKey}>
                  {groupByField !== 'none' && groupKey && (
                    <TableRow className="bg-slate-50 hover:bg-slate-100 border-b-2 border-slate-200">
                      <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 2} className="h-[30px]">
                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleGroup(groupKey)}
                            className="flex items-center gap-2 font-semibold text-slate-700"
                          >
                            {collapsedGroups.includes(groupKey) ? (
                              <ChevronRight className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            <Layers className="h-4 w-4" />
                            {groupKey} ({groupLeads.length} leads)
                          </Button>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span>Subtotal: {groupLeads.length} leads</span>
                            <Badge variant="outline" className="bg-white">
                              {Math.round((groupLeads.length / filteredLeads.length) * 100)}% of total
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {(groupByField === 'none' || !collapsedGroups.includes(groupKey)) && groupLeads.map((lead) => (
                    <TableRow 
                      key={lead.id} 
                      className="h-[30px] hover:bg-slate-50/80 transition-colors cursor-pointer border-b border-slate-100"
                      onClick={() => onLeadClick(lead)}
                    >
                      <TableCell className="h-[30px] py-1" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={selectedLeads.includes(lead.id)}
                            onCheckedChange={(checked) => handleSelectLead(lead.id, checked === true)}
                            className="h-4 w-4"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-5 w-5 p-0 ${bookmarkedLeads.includes(lead.id) ? 'text-amber-500' : 'text-slate-400'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleBookmark(lead.id, !bookmarkedLeads.includes(lead.id));
                            }}
                          >
                            {bookmarkedLeads.includes(lead.id) ? (
                              <BookmarkCheck className="h-3 w-3" />
                            ) : (
                              <Bookmark className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      
                      {visibleColumns.name && (
                        <TableCell className="h-[30px] py-1">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 border">
                              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
                                {getInitials(lead.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm truncate max-w-[150px]">
                                {lead.fullName}
                              </span>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                {lead.email && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    <span className="truncate max-w-[100px]">{lead.email}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      )}
                      
                      {visibleColumns.source && (
                        <TableCell className="h-[30px] py-1">
                          <Badge 
                            variant="outline" 
                            className="bg-blue-50 text-blue-800 border-blue-200 flex items-center gap-1 w-[120px] justify-center h-6"
                          >
                            {getSourceIcon(lead.source)}
                            <span className="truncate text-xs">{lead.source}</span>
                          </Badge>
                        </TableCell>
                      )}
                      
                      {visibleColumns.created && (
                        <TableCell className="h-[30px] py-1 text-sm text-slate-600">
                          {formatDate(lead.createdAt)}
                        </TableCell>
                      )}
                      
                      {visibleColumns.associate && (
                        <TableCell className="h-[30px] py-1">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="bg-gradient-to-br from-slate-500 to-slate-600 text-white text-xs">
                                {getInitials(lead.associate)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate text-sm max-w-[100px]">{lead.associate}</span>
                          </div>
                        </TableCell>
                      )}
                      
                      {visibleColumns.stage && (
                        <TableCell className="h-[30px] py-1">
                          <Badge 
                            variant="outline" 
                            className="bg-purple-50 text-purple-800 border-purple-200 flex items-center gap-1 w-[180px] justify-center h-6"
                          >
                            {getStageIcon(lead.stage)}
                            <span className="truncate text-xs">{lead.stage}</span>
                          </Badge>
                        </TableCell>
                      )}
                      
                      {visibleColumns.status && (
                        <TableCell className="h-[30px] py-1">
                          <Badge 
                            className={`${getStatusColor(lead.status)} flex items-center gap-1 w-[100px] justify-center h-6`}
                          >
                            {getStatusIcon(lead.status)}
                            <span className="text-xs">{lead.status}</span>
                          </Badge>
                        </TableCell>
                      )}
                      
                      {visibleColumns.remarks && (
                        <TableCell className="h-[30px] py-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-sm text-slate-600 truncate max-w-[180px] block">
                                  {lead.remarks || 'No remarks'}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>{lead.remarks || 'No remarks'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      )}
                      
                      <TableCell className="text-right h-[30px] py-1" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onLeadClick(lead)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Lead
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info("View details coming soon")}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteLead(lead.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Lead
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
              
              {Object.values(groupedLeads).flat().length === 0 && (
                <TableRow>
                  <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 2} className="text-center py-10 text-slate-500">
                    {showBookmarkedOnly && bookmarkedLeads.length === 0 ? (
                      <div className="flex flex-col items-center gap-2">
                        <Bookmark className="h-8 w-8 text-slate-400" />
                        <p>No bookmarked leads found. Bookmark some leads to see them here.</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowBookmarkedOnly(false)}
                        >
                          Show All Leads
                        </Button>
                      </div>
                    ) : (
                      <>
                        No leads found. {filteredLeads.length > 0 ? "Try adjusting your filters or pagination." : "Add some leads to get started."}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};