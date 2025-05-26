import React, { useState, useEffect } from 'react';
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
  EyeOff
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { formatDate } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [isFollowUpsCollapsed, setIsFollowUpsCollapsed] = useState(true);
  const [rowHeight, setRowHeight] = useState(25); // Default row height in px
  const [displaySettings, setDisplaySettings] = useState({
    density: "compact", // compact, comfortable, spacious
    fontSize: "medium", // small, medium, large
    showAvatars: true,
    showIcons: true,
    enableAnimations: false,
    colorIntensity: 50 // 0-100
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
  
  const paginatedLeads = displayedLeads.slice(startIndex, startIndex + pageSize);

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
          // Remove from bookmarks if bookmarked
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

  const handleViewDetails = (id: string) => {
    toast.info("View details functionality coming soon");
  };

  const handleSelectAllLeads = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(paginatedLeads.map(lead => lead.id));
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

  const handleToggleRow = (id: string) => {
    setExpandedRows(expandedRows.includes(id) ? expandedRows.filter(rowId => rowId !== id) : [...expandedRows, id]);
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

  const toggleAllColumns = (value: boolean) => {
    setVisibleColumns({
      name: value,
      source: value,
      created: value,
      associate: value,
      stage: value,
      status: value,
      remarks: value,
      followUps: value
    });
  };

  // Status color mapping with category-based grouping
  const getStatusColor = (status: string) => {
    // Group by category
    const statusCategories = {
      positive: ['Won', 'Trial Completed', 'Trial Scheduled'],
      negative: ['Lost', 'Unresponsive', 'Disqualified'],
      neutral: ['Open', 'Uncategorized']
    };

    if (statusCategories.positive.includes(status)) {
      return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300';
    } else if (statusCategories.negative.includes(status)) {
      return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300';
    } else if (statusCategories.neutral.includes(status)) {
      return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300';
    } else {
      return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/50 dark:text-gray-300';
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

  const getStageIcon = (stage: string) => {
    const stageIconMap: Record<string, JSX.Element> = {
      // Initial stages
      'New Enquiry': <Zap className="h-4 w-4 text-blue-500" />,
      'Initial Contact': <PhoneCall className="h-4 w-4 text-blue-500" />,
      'Sent Introductory message': <MessageCircle className="h-4 w-4 text-indigo-500" />,
      'Sent Introductory Message': <MessageCircle className="h-4 w-4 text-indigo-500" />,
      
      // Information sharing
      'Shared Pricing & Schedule Details': <DollarSign className="h-4 w-4 text-green-500" />,
      'Shared Pricing & Schedule details on WhatsApp': <MessageCircle className="h-4 w-4 text-green-500" />,
      'Shared Class Descriptions and Benefits': <FilePlus2 className="h-4 w-4 text-orange-500" />,
      'Shared Membership Packages And Exclusive Deals': <WalletCards className="h-4 w-4 text-amber-500" />,
      
      // Trial related
      'Trial Scheduled': <Calendar className="h-4 w-4 text-purple-500" />,
      'Trial Rescheduled': <CalendarClock className="h-4 w-4 text-purple-600" />,
      'Trial Completed': <CheckCircle className="h-4 w-4 text-green-600" />,
      'Post Trial Follow Up': <Send className="h-4 w-4 text-blue-600" />,
      'Followed up with Trial Participants': <Send className="h-4 w-4 text-blue-600" />,
      'Positive Trial Feedback - Interested in Membership': <CheckCircle className="h-4 w-4 text-green-600" />,
      
      // Membership / conversion
      'Membership Sold': <ShoppingCart className="h-4 w-4 text-green-900" />,
      
      // Call status
      'Called - Did Not Answer': <PhoneOff className="h-4 w-4 text-red-500" />,
      'Called - Did not answer': <PhoneOff className="h-4 w-4 text-red-500" />,
      'Called - Asked to Call back later': <CalendarClock className="h-4 w-4 text-amber-500" />,
      'Called - Client out of town/traveling': <Plane className="h-4 w-4 text-blue-500" />,
      'Called - Invalid Contact No': <XCircle className="h-4 w-4 text-red-500" />,
      
      // Client status
      'Client Unresponsive': <Clock className="h-4 w-4 text-red-400" />,
      'Will get back to us at a later date': <CalendarClock className="h-4 w-4 text-amber-500" />,
      'Will come back once I exhaust my current gym membership': <Hourglass className="h-4 w-4 text-amber-500" />,
      'No Response after Trial': <Clock className="h-4 w-4 text-red-400" />,
      
      // Not interested
      'Not Interested - Other': <BookX className="h-4 w-4 text-gray-500" />,
      'Not Interested - Proximity Issues': <Map className="h-4 w-4 text-gray-500" />,
      'Not Interested - Pricing Issues': <DollarSign className="h-4 w-4 text-gray-500" />,
      'Not Interested - Timings not suitable': <Clock className="h-4 w-4 text-gray-500" />,
      'Not Interested - Health Issues': <HeartPulse className="h-4 w-4 text-gray-500" />,
      'Language Barrier - Couldn\'t comprehend or speak the language': <Languages className="h-4 w-4 text-gray-500" />,
      'Lead Dropped or Lost': <UserX className="h-4 w-4 text-red-500" />,
      
      // Special cases
      'Looking for Virtual Classes': <Globe className="h-4 w-4 text-blue-500" />,
      'Looking For Virtual Classes': <Globe className="h-4 w-4 text-blue-500" />
    };
    
    return stageIconMap[stage] || <HelpCircle className="h-4 w-4 text-gray-500" />;
  };

  const getSourceIcon = (source: string) => {
    const sourceIconMap: Record<string, JSX.Element> = {
      'Website': <Globe className="h-4 w-4 text-blue-500" />,
      'Website Form': <FilePlus2 className="h-4 w-4 text-blue-500" />,
      'Website - Pre/Post Natal': <Landmark className="h-4 w-4 text-pink-500" />,
      
      'Social': <Twitter className="h-4 w-4 text-sky-500" />,
      'Social Media': <Twitter className="h-4 w-4 text-sky-500" />,
      'Social - Instagram': <Instagram className="h-4 w-4 text-pink-600" />,
      'Social - Facebook': <FacebookIcon className="h-4 w-4 text-blue-600" />,
      
      'Referral': <UserPlus className="h-4 w-4 text-green-500" />,
      'Client Referral': <UserPlus className="h-4 w-4 text-green-600" />,
      'Staff Referral': <UserPlus className="h-4 w-4 text-green-500" />,
      
      'Event': <Locate className="h-4 w-4 text-purple-500" />,
      'Hosted Class': <Locate className="h-4 w-4 text-purple-600" />,
      'Hosted Class ': <Locate className="h-4 w-4 text-purple-600" />,
      'Outdoor Class': <LocateFixed className="h-4 w-4 text-green-600" />,
      
      'Abandoned checkout': <ShoppingCart className="h-4 w-4 text-red-500" />,
      'Walkin': <Map className="h-4 w-4 text-blue-500" />,
      
      'Incoming call': <PhoneCall className="h-4 w-4 text-blue-600" />,
      'Enquiry on call': <PhoneCall className="h-4 w-4 text-blue-500" />,
      'Missed call': <PhoneOff className="h-4 w-4 text-red-500" />,
      
      'Yellow Messenger/Whatsapp Enquiry': <MessageCircle className="h-4 w-4 text-green-500" />,
      'Incoming sms': <MessageCircle className="h-4 w-4 text-blue-500" />,
      
      'Dashboard': <Landmark className="h-4 w-4 text-purple-500" />,
      'Endpoint (API)': <Globe className="h-4 w-4 text-gray-500" />,
      
      'Influencer Sign-up': <UserPlus className="h-4 w-4 text-pink-500" />,
      'Influencer Marketing': <Megaphone className="h-4 w-4 text-pink-600" />,
      
      'Other': <HelpCircle className="h-4 w-4 text-gray-500" />
    };
    
    return sourceIconMap[source] || <Globe className="h-4 w-4 text-gray-500" />;
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Won':
        return <CheckCircle className="h-4 w-4 text-green-700" />; // Success
      case 'Lost':
        return <XCircle className="h-4 w-4 text-red-600" />; // Lost
      case 'Unresponsive':
        return <UserX className="h-4 w-4 text-red-600" />; // Unresponsive
      case 'Trial Completed':
        return <ThumbsUp className="h-4 w-4 text-yellow-500" />; // Completed
      case 'Trial Scheduled':
        return <Calendar className="h-4 w-4 text-amber-500" />; // Scheduled
      case 'Open':
        return <AlertCircle className="h-4 w-4 text-blue-500" />; // Open
      case 'Disqualified':
        return <Ban className="h-4 w-4 text-red-600" />; // Disqualified
      case 'Uncategorized':
        return <HelpCircle className="h-4 w-4 text-gray-500" />; // Uncategorized
      default:
        return <HelpCircle className="h-4 w-4 text-gray-500" />; // Default icon
    }
  };

  // Get follow-up badge color based on type
  const getFollowUpBadgeColor = (comment: string) => {
    const lowerComment = comment.toLowerCase();
    
    if (lowerComment.includes('call') || lowerComment.includes('phone')) {
      return 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-700 hover:text-white';
    } else if (lowerComment.includes('email') || lowerComment.includes('mail')) {
      return 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-700 hover:text-white';
    } else if (lowerComment.includes('meeting') || lowerComment.includes('appointment')) {
      return 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-700 hover:text-white';
    } else if (lowerComment.includes('whatsapp') || lowerComment.includes('message')) {
      return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-700 hover:text-white';
    } else if (lowerComment.includes('trial') || lowerComment.includes('demo')) {
      return 'bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-700 hover:text-white';
    } else if (lowerComment.includes('payment') || lowerComment.includes('invoice')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-700 hover:text-white';
    } else {
      return 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-700 hover:text-white';
    }
  };

  // Get no follow-up icon
  const getNoFollowUpIcon = () => (
    <div className="flex items-center gap-1.5 text-gray-500">
      <Clock className="h-4 w-4 text-gray-400" />
      <span className="text-sm">No follow-ups</span>
    </div>
  );

  // Clean up remarks text
  const cleanRemarks = (remarks: string) => {
    if (!remarks) return "No remarks";
    
    return remarks
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/^./, str => str.toUpperCase());
  };

  // Get row height class based on settings
  const getRowHeightClass = () => {
    return `h-[${rowHeight}px]`;
  };

  // Format follow-up comment
  const formatFollowUpComment = (comment: string) => {
    if (!comment || comment.trim() === '-' || comment.trim() === '') return null;
    
    return comment.trim()
      .replace(/\s+/g, ' ')
      .replace(/^./, str => str.toUpperCase());
  };

  if (loading) {
    return (
      <Card className="shadow-md border-border/30">
        <CardContent className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            {Array(5).fill(0).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md border-border/30 overflow-hidden glass-card">
      <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Leads Management</CardTitle>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                  className={showBookmarkedOnly ? "bg-amber-100 text-amber-800 border-amber-300" : ""}
                >
                  {showBookmarkedOnly ? <BookmarkCheck className="h-4 w-4 mr-1" /> : <Bookmark className="h-4 w-4 mr-1" />}
                  {showBookmarkedOnly ? "Showing Bookmarks" : "Show Bookmarks"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {showBookmarkedOnly ? "Show all leads" : "Show only bookmarked leads"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns className="h-4 w-4 mr-1" />
                Columns
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="all-columns">All Columns</Label>
                  <Checkbox 
                    id="all-columns" 
                    checked={Object.values(visibleColumns).every(Boolean)}
                    onCheckedChange={(checked) => toggleAllColumns(!!checked)}
                  />
                </div>
                <div className="border-t my-2" />
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

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Display Settings
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <Tabs defaultValue="layout">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                  <TabsTrigger value="behavior">Behavior</TabsTrigger>
                </TabsList>
                <TabsContent value="layout" className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label>Row Height ({rowHeight}px)</Label>
                    <Slider 
                      value={[rowHeight]} 
                      min={24} 
                      max={60} 
                      step={2}
                      onValueChange={(value) => setRowHeight(value[0])}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Density</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {["compact", "comfortable", "spacious"].map((density) => (
                        <Button 
                          key={density}
                          variant={displaySettings.density === density ? "default" : "outline"}
                          size="sm"
                          onClick={() => setDisplaySettings({...displaySettings, density})}
                          className="capitalize"
                        >
                          {density}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="collapse-followups">Collapse Follow-ups</Label>
                    <Switch 
                      id="collapse-followups" 
                      checked={isFollowUpsCollapsed}
                      onCheckedChange={setIsFollowUpsCollapsed}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="appearance" className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label>Font Size</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {["small", "medium", "large"].map((size) => (
                        <Button 
                          key={size}
                          variant={displaySettings.fontSize === size ? "default" : "outline"}
                          size="sm"
                          onClick={() => setDisplaySettings({...displaySettings, fontSize: size})}
                          className="capitalize"
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Color Intensity ({displaySettings.colorIntensity}%)</Label>
                    <Slider 
                      value={[displaySettings.colorIntensity]} 
                      min={30} 
                      max={100} 
                      step={5}
                      onValueChange={(value) => setDisplaySettings({...displaySettings, colorIntensity: value[0]})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-avatars">Show Avatars</Label>
                    <Switch 
                      id="show-avatars" 
                      checked={displaySettings.showAvatars}
                      onCheckedChange={(checked) => setDisplaySettings({...displaySettings, showAvatars: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-icons">Show Icons</Label>
                    <Switch 
                      id="show-icons" 
                      checked={displaySettings.showIcons}
                      onCheckedChange={(checked) => setDisplaySettings({...displaySettings, showIcons: checked})}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="behavior" className="space-y-4 mt-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enable-animations">Enable Animations</Label>
                    <Switch 
                      id="enable-animations" 
                      checked={displaySettings.enableAnimations}
                      onCheckedChange={(checked) => setDisplaySettings({...displaySettings, enableAnimations: checked})}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gradient-to-r from-indigo-500 to-purple-700 text-white sticky top-0 z-10">
              <TableRow className="hover:bg-gradient-to-r hover:from-indigo-700 hover:to-purple-900">
                <TableHead className="w-[50px] text-white">
                  <Checkbox 
                    checked={selectedLeads.length === paginatedLeads.length && paginatedLeads.length > 0}
                    onCheckedChange={handleSelectAllLeads}
                    aria-label="Select all leads"
                  />
                </TableHead>
                {visibleColumns.name && (
                  <TableHead className="min-w-[200px] text-white">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('fullName')}>
                      Full Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.source && (
                  <TableHead className="min-w-[140px] text-white">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('source')}>
                      Source
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.created && (
                  <TableHead className="min-w-[120px] text-white">
                                        <div className="flex items-center cursor-pointer" onClick={() => handleSort('createdAt')}>
                      Created
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.associate && (
                  <TableHead className="min-w-[150px] text-white">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('associate')}>
                      Associate
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.stage && (
                  <TableHead className="min-w-[200px] text-white">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('stage')}>
                      Stage
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.status && (
                  <TableHead className="min-w-[120px] text-white">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('status')}>
                      Status
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.remarks && (
                  <TableHead className="min-w-[200px] text-white">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('remarks')}>
                      Remarks
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.followUps && (
                  <TableHead className="min-w-[250px] text-white">
                    <div className="flex items-center">
                      <span>Follow-Ups</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 ml-1 text-white hover:bg-white/20"
                        onClick={() => setIsFollowUpsCollapsed(!isFollowUpsCollapsed)}
                      >
                        {isFollowUpsCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableHead>
                )}
                <TableHead className="text-right w-[100px] text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLeads.length > 0 ? (
                paginatedLeads.map((lead) => (
                  <TableRow 
                    key={lead.id} 
                    className={`${getRowHeightClass()} hover:bg-muted/20 transition-colors cursor-pointer`}
                    onClick={() => onLeadClick(lead)}
                  >
                    <TableCell className="font-medium text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={selectedLeads.includes(lead.id)}
                          onCheckedChange={(checked) => handleSelectLead(lead.id, checked === true)}
                          aria-label={`Select lead ${lead.fullName}`}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-6 w-6 p-0 ${bookmarkedLeads.includes(lead.id) ? 'text-amber-500' : 'text-muted-foreground'}`}
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
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {displaySettings.showAvatars && (
                            <Avatar className="h-8 w-8 border">
                              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium text-xs">
                                {getInitials(lead.fullName)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex flex-col">
                            <span className={`font-medium text-foreground truncate max-w-[180px] ${displaySettings.fontSize === 'small' ? 'text-sm' : displaySettings.fontSize === 'large' ? 'text-base' : ''}`}>
                              {lead.fullName}
                            </span>
                            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                              {lead.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate max-w-[150px]">{lead.email}</span>
                                </div>
                              )}
                              {lead.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{lead.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.source && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className="bg-indigo-100 text-indigo-800 flex items-center gap-1.5 py-1 hover:bg-indigo-700 hover:text-white hover:border-indigo-500 transition-colors"
                          >
                            {displaySettings.showIcons && React.cloneElement(getSourceIcon(lead.source), { className: "h-4 w-4 text-indigo-500 group-hover:text-white" })}
                            <span className="truncate max-w-[100px]">{lead.source}</span>
                          </Badge>
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.created && (
                      <TableCell>{formatDate(lead.createdAt)}</TableCell>
                    )}
                    {visibleColumns.associate && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {displaySettings.showAvatars && (
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-xs">
                                {getInitials(lead.associate)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <span className="truncate max-w-[100px]">{lead.associate}</span>
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.stage && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className="bg-blue-100 text-blue-800 flex items-center gap-1.5 py-1 hover:bg-blue-700 hover:text-white hover:border-blue-500 transition-colors"
                          >
                            {displaySettings.showIcons && React.cloneElement(getStageIcon(lead.stage), { className: "h-4 w-4 text-blue-500 group-hover:text-white" })}
                            <span className="truncate max-w-[150px]">{lead.stage}</span>
                          </Badge>
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.status && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {displaySettings.showIcons && getStatusIcon(lead.status)}
                          <Badge 
                            className={`${getStatusColor(lead.status)} font-medium hover:bg-opacity-90 hover:text-white transition-colors`}
                          >
                            {lead.status}
                          </Badge>
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.remarks && (
                      <TableCell>
                        <div className="max-w-[200px] overflow-hidden text-ellipsis">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="line-clamp-2">{cleanRemarks(lead.remarks)}</span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>{cleanRemarks(lead.remarks)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.followUps && (
                      <TableCell>
                        <Collapsible open={!isFollowUpsCollapsed} className="w-full">
                          <CollapsibleContent>
                            <div className="space-y-1.5">
                              {(() => {
                                // Process follow-ups
                                const followUps = [1, 2, 3, 4].map((index) => {
                                  const dateField = `followUp${index}Date`;
                                  const commentsField = `followUp${index}Comments`;
                                  const followUpDate = lead[dateField];
                                  const followUpComment = formatFollowUpComment(lead[commentsField]);
                                  
                                  if (!followUpDate || !followUpComment) return null;
                                  
                                  return {
                                    date: followUpDate,
                                    comment: followUpComment,
                                    index
                                  };
                                }).filter(Boolean);
                                
                                if (followUps.length === 0) {
                                  return getNoFollowUpIcon();
                                }
                                
                                return followUps.map((followUp) => (
                                  <div key={followUp.index} className="flex items-center gap-2">
                                    <Badge 
                                      variant="outline"
                                      className={`${getFollowUpBadgeColor(followUp.comment)} flex items-center gap-1.5 py-1 transition-colors`}
                                    >
                                      <Calendar className="h-3.5 w-3.5" />
                                      {formatDate(followUp.date)}
                                    </Badge>
                                    <span className="truncate max-w-[150px] text-sm">{followUp.comment}</span>
                                  </div>
                                ));
                              })()}
                            </div>
                          </CollapsibleContent>
                          <CollapsibleTrigger asChild>
                            {isFollowUpsCollapsed && (
                              <Button variant="ghost" size="sm" className="w-full justify-start text-left text-muted-foreground">
                                <ChevronRight className="h-4 w-4 mr-1" />
                                {(() => {
                                  // Count valid follow-ups
                                  const followUpCount = [1, 2, 3, 4].filter((index) => {
                                    const dateField = `followUp${index}Date`;
                                    const commentsField = `followUp${index}Comments`;
                                    const followUpDate = lead[dateField];
                                    const followUpComment = formatFollowUpComment(lead[commentsField]);
                                    
                                    return followUpDate && followUpComment;
                                  }).length;
                                  
                                  return followUpCount > 0 
                                    ? `${followUpCount} follow-up${followUpCount > 1 ? 's' : ''}` 
                                    : "No follow-ups";
                                })()}
                              </Button>
                            )}
                          </CollapsibleTrigger>
                        </Collapsible>
                      </TableCell>
                    )}
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Open menu">
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
                          <DropdownMenuItem onClick={() => handleViewDetails(lead.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewDetails(lead.id)}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Notes
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleToggleBookmark(lead.id, !bookmarkedLeads.includes(lead.id))}
                          >
                            {bookmarkedLeads.includes(lead.id) ? (
                              <>
                                <BookmarkCheck className="mr-2 h-4 w-4 text-amber-500" />
                                Remove Bookmark
                              </>
                            ) : (
                              <>
                                <Bookmark className="mr-2 h-4 w-4" />
                                Bookmark Lead
                              </>
                            )}
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">
                    {showBookmarkedOnly && bookmarkedLeads.length === 0 ? (
                      <div className="flex flex-col items-center gap-2">
                        <Bookmark className="h-8 w-8 text-muted-foreground/50" />
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