import React, { useState, useMemo } from 'react';
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
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  ArrowUpDown, 
  Edit, 
  Trash2, 
  Eye, 
  FileText, 
  Phone, 
  Mail,
  CheckCircle,
  Clock,
  HelpCircle,
  Zap,
  Globe,
  FacebookIcon,
  Twitter,
  Instagram,
  FilePlus2,
  UserPlus,
  Locate,
  ShoppingCart,
  XCircle,
  PhoneCall,
  BookX,
  UserX,
  Calendar,
  User,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronRight,
  Columns,
  Layers,
  TrendingUp,
  Activity,
  Target,
  Award,
  Star,
  Building2,
  UserCheck
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data for demonstration
const mockLeads = [
  {
    id: '1',
    fullName: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    source: 'Website',
    createdAt: '2024-01-15T10:30:00Z',
    associate: 'Sarah Johnson',
    stage: 'New Enquiry',
    status: 'Hot',
    remarks: 'Interested in premium membership. Follow up next week.',
    center: 'Downtown'
  },
  {
    id: '2',
    fullName: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '+1 (555) 987-6543',
    source: 'Social Media',
    createdAt: '2024-01-14T14:20:00Z',
    associate: 'Mike Wilson',
    stage: 'Trial Scheduled',
    status: 'Warm',
    remarks: 'Trial scheduled for this Friday at 3 PM.',
    center: 'North Branch'
  },
  {
    id: '3',
    fullName: 'Michael Brown',
    email: 'michael.brown@email.com',
    phone: '+1 (555) 456-7890',
    source: 'Referral',
    createdAt: '2024-01-13T09:15:00Z',
    associate: 'Lisa Chen',
    stage: 'Membership Sold',
    status: 'Won',
    remarks: 'Purchased annual membership. Very satisfied with service.',
    center: 'South Location'
  },
  {
    id: '4',
    fullName: 'Sarah Wilson',
    email: 'sarah.wilson@email.com',
    phone: '+1 (555) 321-0987',
    source: 'Cold Call',
    createdAt: '2024-01-12T16:45:00Z',
    associate: 'David Kim',
    stage: 'Not Interested',
    status: 'Lost',
    remarks: 'Not interested at this time. May reconsider in 6 months.',
    center: 'East Branch'
  },
  {
    id: '5',
    fullName: 'Robert Garcia',
    email: 'robert.garcia@email.com',
    phone: '+1 (555) 654-3210',
    source: 'Website Form',
    createdAt: '2024-01-11T11:30:00Z',
    associate: 'Amanda Lee',
    stage: 'Initial Contact',
    status: 'Cold',
    remarks: 'Requested information about pricing and packages.',
    center: 'West Center'
  }
];

const mockContext = {
  filteredLeads: mockLeads,
  loading: false,
  sortConfig: { key: 'createdAt', direction: 'desc' },
  setSortConfig: () => {},
  page: 1,
  pageSize: 10,
  deleteLead: () => Promise.resolve(),
  setPageSize: () => {}
};

// Mock toast function
const toast = {
  success: (message) => console.log('Success:', message),
  error: (message) => console.log('Error:', message),
  info: (message) => console.log('Info:', message)
};

// Mock utils
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key] || 'Unknown';
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

interface LeadsTableProps {
  onLeadClick?: (lead: any) => void;
  selectedLeads: string[];
  setSelectedLeads: (leadIds: string[]) => void;
  compactMode?: boolean;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  onLeadClick = () => {},
  selectedLeads,
  setSelectedLeads,
  compactMode
}) => {
  // Mock context and utils
  const {
    filteredLeads,
    loading,
    sortConfig,
    setSortConfig,
    page,
    pageSize,
    deleteLead,
  } = mockContext;

  const toast = {
    success: (message: string) => console.log('Success:', message),
    error: (message: string) => console.log('Error:', message),
    info: (message: string) => console.log('Info:', message),
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
    return array.reduce((groups: Record<string, T[]>, item: T) => {
      const group = (item[key] as string) || 'Unknown';
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  };

  // State
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
  });

  // Pagination and filtering
  const startIndex = (page - 1) * pageSize;
  let displayedLeads = filteredLeads;
  if (showBookmarkedOnly) {
    displayedLeads = displayedLeads.filter((lead: { id: string }) => bookmarkedLeads.includes(lead.id));
  }

  // Grouping
  const groupedLeads = useMemo<Record<string, typeof mockLeads>>(() => {
    if (groupByField === 'none') {
      return { '': displayedLeads.slice(startIndex, startIndex + pageSize) };
    }
    const grouped = groupBy(displayedLeads, groupByField as keyof typeof displayedLeads[0]);
    return grouped;
  }, [displayedLeads, groupByField, startIndex, pageSize]);

  // Handlers
  const handleSelectAllLeads = (checked: boolean) => {
    if (checked) {
      const allLeads = Object.values(groupedLeads).flat() as { id: string }[];
      setSelectedLeads(allLeads.map((lead) => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, leadId]);
    } else {
      setSelectedLeads(selectedLeads.filter((id) => id !== leadId));
    }
  };

  const handleToggleBookmark = (id: string, isBookmarked: boolean) => {
    if (isBookmarked) {
      setBookmarkedLeads([...bookmarkedLeads, id]);
      toast.success("Lead bookmarked for quick access");
    } else {
      setBookmarkedLeads(bookmarkedLeads.filter((leadId: string) => leadId !== id));
      toast.success("Lead removed from bookmarks");
    }
  };

  const toggleColumn = (column: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((prev) =>
      prev.includes(groupKey)
        ? prev.filter((key) => key !== groupKey)
        : [...prev, groupKey]
    );
  };

  const handleSort = (key: string) => {
    if (sortConfig?.key === key) {
      setSortConfig(undefined);
    } else {
      setSortConfig({ key, direction: 'asc' });
    }
  };

  const handleDeleteLead = (id: string) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      deleteLead()
        .then(() => {
          toast.success("Lead deleted successfully");
          if (bookmarkedLeads.includes(id)) {
            handleToggleBookmark(id, false);
          }
        })
        .catch((error: unknown) => {
          toast.error("Failed to delete lead");
          console.error(error);
        });
    }
  };

  // Icon helpers
  const getSourceIcon = (source: string): React.ReactElement => {
    const sourceIconMap: Record<string, React.ReactElement> = {
      'Website': <Globe className="h-4 w-4" />,
      'Website Form': <FilePlus2 className="h-4 w-4" />,
      'Social Media': <Twitter className="h-4 w-4" />,
      'Social - Instagram': <Instagram className="h-4 w-4" />,
      'Social - Facebook': <FacebookIcon className="h-4 w-4" />,
      'Referral': <UserPlus className="h-4 w-4" />,
      'Event': <Locate className="h-4 w-4" />,
      'Cold Call': <PhoneCall className="h-4 w-4" />,
      'Email Campaign': <Mail className="h-4 w-4" />,
      'Other': <HelpCircle className="h-4 w-4" />,
    };
    return sourceIconMap[source] || <Globe className="h-4 w-4" />;
  };

  const getStageIcon = (stage: string): React.ReactElement => {
    const stageIconMap: Record<string, React.ReactElement> = {
      'New Enquiry': <Zap className="h-4 w-4" />,
      'Initial Contact': <PhoneCall className="h-4 w-4" />,
      'Trial Scheduled': <Calendar className="h-4 w-4" />,
      'Trial Completed': <CheckCircle className="h-4 w-4" />,
      'Membership Sold': <ShoppingCart className="h-4 w-4" />,
      'Not Interested': <BookX className="h-4 w-4" />,
      'Lost': <UserX className="h-4 w-4" />,
    };
    return stageIconMap[stage] || <HelpCircle className="h-4 w-4" />;
  };

  const getStatusIcon = (status: string): React.ReactElement => {
    switch (status) {
      case 'Won':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Lost':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'Hot':
        return <Star className="h-4 w-4 text-orange-500" fill="currentColor" />;
      case 'Warm':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'Cold':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'Converted':
        return <Award className="h-4 w-4 text-purple-600" />;
      default:
        return <HelpCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Helper for initials
  const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.split(' ');
    return parts.length === 1
      ? parts[0][0]
      : parts[0][0] + parts[parts.length - 1][0];
  };

  if (loading) {
    return (
      <Card className="shadow-sm border">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            {Array(5).fill(0).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Lead Management
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Manage and track your sales leads efficiently
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={showBookmarkedOnly ? "default" : "outline"}
                      size="sm" 
                      onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                      className="h-9"
                    >
                      {showBookmarkedOnly ? <BookmarkCheck className="h-4 w-4 mr-2" /> : <Bookmark className="h-4 w-4 mr-2" />}
                      {showBookmarkedOnly ? "Bookmarked" : "All Leads"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {showBookmarkedOnly ? "Show all leads" : "Show only bookmarked leads"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Select value={groupByField} onValueChange={setGroupByField}>
                <SelectTrigger className="w-40 h-9">
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
                  <Button variant="outline" size="sm" className="h-9">
                    <Columns className="h-4 w-4 mr-2" />
                    Columns
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="end">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Visible Columns</Label>
                    <div className="space-y-3">
                      {Object.entries(visibleColumns).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label htmlFor={`column-${key}`} className="text-sm capitalize">
                            {key === 'name' ? 'Contact' : key}
                          </Label>
                          <Switch 
                            id={`column-${key}`} 
                            checked={value}
                            onCheckedChange={() => toggleColumn(key)}
                            size="sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Table Section */}
      <Card className="shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/80 border-b-2 border-gray-200">
              <TableRow className="hover:bg-gray-50">
                <TableHead className="w-12 text-center">
                  <Checkbox 
                    checked={selectedLeads.length === Object.values(groupedLeads).flat().length && Object.values(groupedLeads).flat().length > 0}
                    onCheckedChange={handleSelectAllLeads}
                    className="border-gray-300"
                  />
                </TableHead>
                {visibleColumns.name && (
                  <TableHead className="min-w-[280px] font-semibold text-gray-700">
                    <div className="flex items-center cursor-pointer hover:text-gray-900" onClick={() => handleSort('fullName')}>
                      <User className="h-4 w-4 mr-2" />
                      Contact Information
                      <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.source && (
                  <TableHead className="min-w-[140px] font-semibold text-gray-700">
                    <div className="flex items-center cursor-pointer hover:text-gray-900" onClick={() => handleSort('source')}>
                      <Globe className="h-4 w-4 mr-2" />
                      Source
                      <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.created && (
                  <TableHead className="min-w-[120px] font-semibold text-gray-700">
                    <div className="flex items-center cursor-pointer hover:text-gray-900" onClick={() => handleSort('createdAt')}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Created
                      <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.associate && (
                  <TableHead className="min-w-[160px] font-semibold text-gray-700">
                    <div className="flex items-center cursor-pointer hover:text-gray-900" onClick={() => handleSort('associate')}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Associate
                      <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.stage && (
      <Card className="shadow-sm border border-gray-200 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
                      Stage
                      <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.status && (
                  <TableHead className="min-w-[120px] font-semibold text-gray-700">
                    <div className="flex items-center cursor-pointer hover:text-gray-900" onClick={() => handleSort('status')}>
                      <Activity className="h-4 w-4 mr-2" />
                      Status
                      <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.remarks && (
                  <TableHead className="min-w-[200px] font-semibold text-gray-700">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Remarks
                    </div>
                  </TableHead>
                )}
                <TableHead className="text-center w-16 font-semibold text-gray-700">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedLeads).map(([groupKey, groupLeads]) => (
                <React.Fragment key={groupKey}>
                  {groupByField !== 'none' && groupKey && (
                    <TableRow className="bg-slate-50 hover:bg-slate-100 border-b border-gray-200">
                      <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 2} className="py-3">
                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleGroup(groupKey)}
                            className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
                          >
                            {collapsedGroups.includes(groupKey) ? (
                              <ChevronRight className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            <Layers className="h-4 w-4" />
                            {groupKey} ({groupLeads.length})
                          </Button>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                            {Math.round((groupLeads.length / filteredLeads.length) * 100)}% of total
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {(groupByField === 'none' || !collapsedGroups.includes(groupKey)) && groupLeads.map((lead) => (
                    <TableRow 
                      key={lead.id} 
                      className="hover:bg-gray-50/80 transition-colors cursor-pointer border-b border-gray-100"
                      onClick={() => onLeadClick(lead)}
                    >
                      <TableCell className="text-center py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <Checkbox 
                            checked={selectedLeads.includes(lead.id)}
                            onCheckedChange={(checked) => handleSelectLead(lead.id, checked === true)}
                            className="border-gray-300"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-6 w-6 p-0 ${bookmarkedLeads.includes(lead.id) ? 'text-amber-500 hover:text-amber-600' : 'text-gray-400 hover:text-gray-600'}`}
                            onClick={(e) => {
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
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10 border border-gray-200">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium">
                                {getInitials(lead.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                            {Math.round(((groupLeads as any[]).length / filteredLeads.length) * 100)}% of total
                          </Badge>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate max-w-[180px]">{lead.email}</span>
                                </div>
                  {(groupByField === 'none' || !collapsedGroups.includes(groupKey)) && (groupLeads as any[]).map((lead: any) => (
                                  <Phone className="h-3 w-3" />
                                  <span>{lead.phone}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      )}
                      
                      {visibleColumns.source && (
                        <TableCell className="py-4">
                          <Badge variant="outline" className="flex items-center gap-1.5 w-fit bg-white border-gray-200">
                            {getSourceIcon(lead.source)}
                            <span className="text-xs font-medium">{lead.source}</span>
                          </Badge>
                        </TableCell>
                      )}
                      
                      {visibleColumns.created && (
                        <TableCell className="py-4">
                          <div className="text-sm text-gray-700 font-medium">
                            {formatDate(lead.createdAt)}
                          </div>
                        </TableCell>
                      )}
                      
                      {visibleColumns.associate && (
                        <TableCell className="h-[40px] py-2 text-left align-middle">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-gradient-to-br from-slate-500 to-slate-600 text-white text-xs font-bold">
                                {getInitials(lead.associate)}
                              </AvatarFallback>
                            </Avatar>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="truncate text-sm font-semibold text-gray-700 max-w-[140px] cursor-pointer">
                                    {lead.associate}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-800 text-white">
                                  <p>Associate: {lead.associate}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      )}
                      
                      {visibleColumns.stage && (
                        <TableCell className="h-[40px] py-2 text-left align-middle">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge 
                                  variant="outline" 
                                  className="bg-gray-800/80 text-white border-gray-600 flex items-center gap-1.5 w-[200px] justify-center h-6 font-mono text-xs cursor-pointer"
                                >
                          <Badge variant="outline" className="flex items-center gap-1.5 w-fit bg-white border-gray-200" asChild>
                            <span>
                              {getSourceIcon(lead.source)}
                              <span className="text-xs font-medium">{lead.source}</span>
                            </span>
                          </Badge>
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent className="bg-slate-800 text-white max-w-xs">
                                <p>Stage: {lead.stage}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      )}
                      
                      {visibleColumns.status && (
                        <TableCell className="h-[40px] py-2 text-left align-middle">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge 
                                  className="bg-gray-800/80 text-white border-gray-600 flex items-center gap-1.5 w-[120px] justify-center h-6 font-mono text-xs cursor-pointer"
                                >
                                  <span className="text-white flex items-center justify-center">
                                    {React.cloneElement(getStatusIcon(lead.status), { className: "h-3.5 w-3.5 text-white" })}
                                  </span>
                                  <span className="text-xs text-white">{lead.status}</span>
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent className="bg-slate-800 text-white">
                                <p>Status: {lead.status}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      )}
                      
                      {visibleColumns.remarks && (
                        <TableCell className="h-[40px] py-2 text-left align-middle">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-sm text-gray-700 truncate max-w-[200px] block cursor-pointer">
                                <Badge 
                                  variant="outline" 
                                  className="bg-gray-800/80 text-white border-gray-600 flex items-center gap-1.5 w-[200px] justify-center h-6 font-mono text-xs cursor-pointer"
                                  asChild
                                >
                                  <span>
                                    <span className="text-white flex items-center justify-center">
                                      {React.cloneElement(getStageIcon(lead.stage), { className: "h-3.5 w-3.5 text-white" })}
                                    </span>
                                    <span className="truncate text-white">{lead.stage}</span>
                                  </span>
                                </Badge>
                        </TableCell>
                      )}
                      
                      <TableCell className="text-right h-[40px] py-2 align-middle" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-slate-200">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                                <Badge 
                                  className="bg-gray-800/80 text-white border-gray-600 flex items-center gap-1.5 w-[120px] justify-center h-6 font-mono text-xs cursor-pointer"
                                  asChild
                                >
                                  <span>
                                    <span className="text-white flex items-center justify-center">
                                      {React.cloneElement(getStatusIcon(lead.status), { className: "h-3.5 w-3.5 text-white" })}
                                    </span>
                                    <span className="text-xs text-white">{lead.status}</span>
                                  </span>
                                </Badge>
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
};        </div>
      </CardContent>
      </Card>
    </div>
  );
};