import React, { useState, useEffect, useRef } from 'react';
import { useLeads } from '@/contexts/LeadContext';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Phone, 
  Save, 
  X, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  User,
  MessageSquare,
  CalendarCheck,
  Building,
  Users,
  Share2,
  CalendarDays,
  Search,
  Clipboard,
  FileText,
  BadgeDollarSign,
  CheckCircle as Check,
  XCircle,
  Flag,
  Globe,
  Info,
  Clock,
  Star,
  MapPin,
  Briefcase,
  PersonStanding,
  Megaphone,
  PhoneIncoming,
  MessagesSquare,
  Smartphone,
  Instagram,
  Facebook,
  ExternalLink,
  HelpCircle,
  BellRing,
  Ban,
  Award,
  Bookmark,
  History,
  PenTool,
  PieChart,
  Activity,
  FileSignature,
  Zap,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Paperclip,
  Mic,
  ArrowUpRight,
  Copy,
  RefreshCw,
  HeartHandshake,
  Timer,
  Loader2,
  Edit2
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  selectedLeads?: string[];
  clearSelection?: () => void;
}

export function EditLeadModal({ 
  isOpen, 
  onClose, 
  lead, 
  selectedLeads = [], 
  clearSelection 
}: EditLeadModalProps) {
  const { updateLead, sourceOptions, associateOptions, stageOptions, statusOptions } = useLeads();
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [autoSave, setAutoSave] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [recording, setRecording] = useState(false);
  const [audioNote, setAudioNote] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [leadScore, setLeadScore] = useState(50);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewHistory, setViewHistory] = useState(false);
  
  // Sample mock history data
  const historyItems = [
    { id: 1, type: 'edit', field: 'status', from: 'Open', to: 'Trial Scheduled', user: 'Jane Smith', timestamp: new Date(2023, 11, 20, 15, 30) },
    { id: 2, type: 'note', content: 'Client is interested in yoga classes only', user: 'Mark Johnson', timestamp: new Date(2023, 11, 19, 9, 45) },
    { id: 3, type: 'email', subject: 'Schedule confirmation', user: 'Jane Smith', timestamp: new Date(2023, 11, 18, 14, 15) },
    { id: 4, type: 'call', duration: '4:30', user: 'Jane Smith', notes: 'Discussed membership options', timestamp: new Date(2023, 11, 17, 11, 0) },
    { id: 5, type: 'edit', field: 'stage', from: 'New Enquiry', to: 'Shared Pricing & Schedule Details', user: 'Mark Johnson', timestamp: new Date(2023, 11, 15, 16, 20) },
  ];
  
  // Communication samples
  const communicationHistory = [
    { id: 1, type: 'email', direction: 'outgoing', subject: 'Welcome to Yoga Studio', content: 'Thank you for your interest...', timestamp: new Date(2023, 11, 15, 10, 0) },
    { id: 2, type: 'sms', direction: 'outgoing', content: 'Your trial class is scheduled for tomorrow at 10am', timestamp: new Date(2023, 11, 16, 9, 30) },
    { id: 3, type: 'call', direction: 'incoming', duration: '3:15', notes: 'Client asked about parking options', timestamp: new Date(2023, 11, 17, 14, 45) },
    { id: 4, type: 'email', direction: 'incoming', subject: 'Re: Welcome to Yoga Studio', content: 'Thanks for the information...', timestamp: new Date(2023, 11, 18, 11, 20) },
    { id: 5, type: 'whatsapp', direction: 'outgoing', content: 'Just checking if you\'ll be attending the trial class tomorrow?', timestamp: new Date(2023, 11, 19, 15, 0) },
  ];
  
  // Additional prospect details
  const prospectDetails = {
    interests: ['Yoga', 'Meditation', 'Wellness'],
    preferredTime: 'Morning',
    previousExperience: 'Beginner',
    referredBy: 'Sarah Wilson',
    priceDiscount: '10%',
    location: '2.5 miles from studio',
    leadQuality: 'Hot',
    expectedConversion: 'High'
  };
  
  const isBulkEdit = !lead && selectedLeads.length > 0;
  const title = isBulkEdit 
    ? `Bulk Edit ${selectedLeads.length} Leads` 
    : lead?.fullName 
      ? `Edit Lead: ${lead.fullName}`
      : 'Edit Lead';
  
  useEffect(() => {
    if (lead) {
      setFormData({ ...lead });
      console.log('Lead data loaded:', lead);
      // Reset leadScore based on lead data
      setLeadScore(calculateLeadScore(lead));
    } else {
      setFormData({});
    }
  }, [lead]);
  
  // Calculate a lead score based on available information
  const calculateLeadScore = (leadData: any) => {
    if (!leadData) return 50;
    
    let score = 50; // Default starting score
    
    // Add points for completed information
    if (leadData.fullName) score += 5;
    if (leadData.email) score += 10;
    if (leadData.phone) score += 10;
    
    // Add points based on stage
    const stageScores: Record<string, number> = {
      'New Enquiry': 5,
      'Sent Introductory message': 10,
      'Shared Pricing & Schedule Details': 15,
      'Trial Scheduled': 25,
      'Trial Completed': 30,
      'Membership Sold': 40,
    };
    
    if (leadData.stage && stageScores[leadData.stage]) {
      score += stageScores[leadData.stage];
    }
    
    // Add points for follow-ups
    for (let i = 1; i <= 4; i++) {
      if (leadData[`followUp${i}Date`] && leadData[`followUp${i}Comments`]) {
        score += 5;
      }
    }
    
    // Cap at 100
    return Math.min(score, 100);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (autoSave) {
      setSaveStatus('saving');
      // Simulate auto-save delay
      setTimeout(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }, 1000);
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (autoSave) {
      setSaveStatus('saving');
      // Simulate auto-save delay
      setTimeout(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }, 1000);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isBulkEdit) {
        // Handle bulk edit logic here
        toast.success(`Updated ${selectedLeads.length} leads successfully`);
        
        if (clearSelection) {
          clearSelection();
        }
      } else if (lead) {
        await updateLead({ ...lead, ...formData });
        toast.success("Lead updated successfully");
      }
      
      onClose();
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Failed to update lead");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
      toast.success(`${e.target.files.length} file(s) attached`);
    }
  };
  
  const handleRemoveAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };
  
  const handleAudioRecording = () => {
    if (recording) {
      // Stop recording simulation
      setRecording(false);
      setAudioNote('audio_note_' + Date.now() + '.mp3');
      toast.success('Audio note recorded');
    } else {
      // Start recording simulation
      setRecording(true);
      toast.info('Recording started...');
    }
  };
  
  const toggleSectionExpand = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  const handleCopyLeadInfo = () => {
    // Create a summary of lead info
    const summary = `
Name: ${formData.fullName || 'N/A'}
Email: ${formData.email || 'N/A'}
Phone: ${formData.phone || 'N/A'}
Status: ${formData.status || 'N/A'}
Stage: ${formData.stage || 'N/A'}
Source: ${formData.source || 'N/A'}
    `.trim();
    
    navigator.clipboard.writeText(summary)
      .then(() => toast.success('Lead information copied to clipboard'))
      .catch(() => toast.error('Failed to copy lead information'));
  };
  
  const generateAIRecommendations = () => {
    setIsGeneratingAI(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsGeneratingAI(false);
      toast.success('AI recommendations generated', {
        description: 'Based on the lead profile, we recommend scheduling a follow-up call within 48 hours.',
        action: {
          label: 'Apply',
          onClick: () => {
            // Apply the recommendation logic
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dateStr = tomorrow.toISOString().split('T')[0];
            
            handleFollowUpChange(1, 'date', dateStr);
            handleFollowUpChange(1, 'comments', 'AI recommended follow-up call to discuss membership options');
            
            toast.info('AI recommendation applied');
          }
        }
      });
    }, 2000);
  };

  const getSourceColor = (source: string) => {
    const colorMap: Record<string, string> = {
      'Website': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
      'Walkin': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300',
      'Social Media': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300',
      'Social - Instagram': 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/30 dark:text-pink-300',
      'Social - Facebook': 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300',
      'Client Referral': 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-300',
      'Staff Referral': 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300',
      'Incoming call': 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300',
      'Yellow Messenger/Whatsapp Enquiry': 'bg-lime-100 text-lime-800 border-lime-300 dark:bg-lime-900/30 dark:text-lime-300',
      'Hosted Class': 'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-900/30 dark:text-violet-300',
      'Outdoor Class': 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300',
      'Abandoned checkout': 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300',
      'Influencer Marketing': 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300',
      'Missed call': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300',
    };
    return colorMap[source] || 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/50 dark:text-gray-300';
  };

  const getStageColor = (stage: string) => {
    const colorMap: Record<string, string> = {
      'New Enquiry': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
      'Sent Introductory message': 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300',
      'Shared Pricing & Schedule Details': 'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-900/30 dark:text-violet-300',
      'Trial Scheduled': 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300',
      'Trial Completed': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300',
      'Membership Sold': 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300',
      'Client Unresponsive': 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/50 dark:text-gray-300',
      'Not Interested - Pricing Issues': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300',
      'Will get back to us at a later date': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300',
      'Lead Dropped or Lost': 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300',
    };
    return colorMap[stage] || 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/50 dark:text-gray-300';
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'Open': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
      'Trial Scheduled': 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300',
      'Trial Completed': 'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-900/30 dark:text-violet-300',
      'Won': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300',
      'Lost': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300',
      'Unresponsive': 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/50 dark:text-gray-300',
      'Disqualified': 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300',
      'Uncategorized': 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/50 dark:text-gray-300',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/50 dark:text-gray-300';
  };

  const getSourceIcon = (source: string) => {
    const sourceIconMap: Record<string, React.ReactNode> = {
      'Website': <Globe className="h-3.5 w-3.5" />,
      'Website Form': <ExternalLink className="h-3.5 w-3.5" />,
      'Client Referral': <Users className="h-3.5 w-3.5" />,
      'Staff Referral': <PersonStanding className="h-3.5 w-3.5" />,
      'Social Media': <Share2 className="h-3.5 w-3.5" />,
      'Social - Instagram': <Instagram className="h-3.5 w-3.5" />,
      'Social - Facebook': <Facebook className="h-3.5 w-3.5" />,
      'Social': <Share2 className="h-3.5 w-3.5" />,
      'Hosted Class': <CalendarDays className="h-3.5 w-3.5" />,
      'Outdoor Class': <MapPin className="h-3.5 w-3.5" />,
      'Walkin': <PersonStanding className="h-3.5 w-3.5" />,
      'Incoming call': <PhoneIncoming className="h-3.5 w-3.5" />,
      'Yellow Messenger/Whatsapp Enquiry': <MessagesSquare className="h-3.5 w-3.5" />,
      'Abandoned checkout': <Smartphone className="h-3.5 w-3.5" />,
      'Influencer Marketing': <Megaphone className="h-3.5 w-3.5" />,
      'Missed call': <Phone className="h-3.5 w-3.5" />,
    };
    return sourceIconMap[source] || <Globe className="h-3.5 w-3.5" />;
  };

  const getStageIcon = (stage: string) => {
    const stageIconMap: Record<string, React.ReactNode> = {
      'New Enquiry': <Star className="h-3.5 w-3.5" />,
      'Sent Introductory message': <Mail className="h-3.5 w-3.5" />,
      'Shared Pricing & Schedule Details': <FileText className="h-3.5 w-3.5" />,
      'Trial Scheduled': <CalendarCheck className="h-3.5 w-3.5" />,
      'Trial Completed': <CheckCircle className="h-3.5 w-3.5" />,
      'Membership Sold': <Award className="h-3.5 w-3.5" />,
      'Client Unresponsive': <Clock className="h-3.5 w-3.5" />,
      'Not Interested - Pricing Issues': <Ban className="h-3.5 w-3.5" />,
      'Will get back to us at a later date': <Calendar className="h-3.5 w-3.5" />,
      'Lead Dropped or Lost': <XCircle className="h-3.5 w-3.5" />,
    };
    return stageIconMap[stage] || <HelpCircle className="h-3.5 w-3.5" />;
  };

  const getStatusIcon = (status: string) => {
    const statusIconMap: Record<string, React.ReactNode> = {
      'Open': <Star className="h-3.5 w-3.5" />,
      'Trial Scheduled': <CalendarCheck className="h-3.5 w-3.5" />,
      'Trial Completed': <Check className="h-3.5 w-3.5" />,
      'Won': <Award className="h-3.5 w-3.5" />,
      'Lost': <XCircle className="h-3.5 w-3.5" />,
      'Unresponsive': <Clock className="h-3.5 w-3.5" />,
      'Disqualified': <Ban className="h-3.5 w-3.5" />,
      'Uncategorized': <HelpCircle className="h-3.5 w-3.5" />,
    };
    return statusIconMap[status] || <HelpCircle className="h-3.5 w-3.5" />;
  };

  const getFollowUpColor = (index: number) => {
    const colors = [
      'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800/60 dark:text-blue-300',
      'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800/60 dark:text-purple-300',
      'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800/60 dark:text-amber-300',
      'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800/60 dark:text-emerald-300'
    ];
    return colors[index % colors.length];
  };

  const handleFollowUpChange = (index: number, field: 'date' | 'comments', value: string) => {
    const dateField = `followUp${index}Date`;
    const commentsField = `followUp${index}Comments`;
    
    if (field === 'date') {
      setFormData(prev => ({ ...prev, [dateField]: value }));
    } else {
      setFormData(prev => ({ ...prev, [commentsField]: value }));
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Get the lead score color based on value
  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    if (score >= 40) return 'text-blue-500';
    if (score >= 20) return 'text-orange-500';
    return 'text-red-500';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    if (score >= 40) return 'bg-blue-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Get human-readable timeframe from date
  const getTimeframe = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };
  
  // Get the icon for a history item based on type
  const getHistoryItemIcon = (type: string) => {
    switch (type) {
      case 'edit': return <Edit2 className="h-4 w-4 text-blue-500" />;
      case 'note': return <FileSignature className="h-4 w-4 text-purple-500" />;
      case 'email': return <Mail className="h-4 w-4 text-amber-500" />;
      case 'call': return <Phone className="h-4 w-4 text-green-500" />;
      case 'sms': return <MessageSquare className="h-4 w-4 text-indigo-500" />;
      case 'whatsapp': return <MessagesSquare className="h-4 w-4 text-teal-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Get the message direction icon
  const getDirectionIcon = (direction: string) => {
    if (direction === 'incoming') {
      return <ArrowUpRight className="h-3 w-3 text-green-500 rotate-180" />;
    }
    return <ArrowUpRight className="h-3 w-3 text-blue-500" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0 gap-0 rounded-lg shadow-xl bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800/80">
        <DialogHeader className="p-6 pb-2 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:to-purple-950/30 border-b border-slate-200/70 dark:border-slate-800/70">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl flex items-center gap-2 font-semibold">
              {isBulkEdit ? (
                <span className="inline-flex items-center">
                <CheckCircle className="h-5 w-5 text-indigo-500 mr-2" />
                {title}
              </span>
            ) : (
              <span className="inline-flex items-center">
                <Avatar className="h-7 w-7 mr-2 ring-2 ring-white dark:ring-slate-800 shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
                    {lead ? getInitials(lead.fullName) : "?"}
                  </AvatarFallback>
                </Avatar>
                {title}
              </span>
            )}
          </DialogTitle>
          
          <div className="flex items-center gap-2">
            {!isBulkEdit && lead && (
              <>
                <Badge 
                  variant="outline" 
                  className={`${getStatusColor(formData.status || "")} px-2 py-0.5`}
                >
                  {getStatusIcon(formData.status || "")}
                  <span className="ml-1">{formData.status || "No Status"}</span>
                </Badge>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={handleCopyLeadInfo}
                      >
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy lead info</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => setViewHistory(!viewHistory)}
                      >
                        <History className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View history</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>
        </div>
        
        <DialogDescription className="mt-1.5 flex items-center justify-between">
          <span>
            {isBulkEdit 
              ? "Update multiple leads at once. Only changed fields will be updated."
              : "Update the lead information below."}
          </span>
          
          {saveStatus !== 'idle' && (
            <div className="flex items-center gap-2 text-xs">
              {saveStatus === 'saving' && (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin text-amber-500" />
                  <span className="text-amber-500">Auto-saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <Check className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">Saved</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">Error saving</span>
                </>
              )}
            </div>
          )}
        </DialogDescription>
      </DialogHeader>
      
      <div className="flex h-[calc(90vh-13rem)] overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span>Details</span>
                </TabsTrigger>
                <TabsTrigger value="followups" className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4" />
                  <span>Follow-ups</span>
                </TabsTrigger>
                <TabsTrigger value="communication" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Communication</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  <span>Analytics</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6 pt-2">
                {!isBulkEdit && (
                  <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/70">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4 text-indigo-500" />
                          Personal Information
                        </CardTitle>
                        
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">Lead Score:</span>
                          <Badge variant="outline" className="font-mono">
                            <span className={getLeadScoreColor(leadScore)}>{leadScore}</span>
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 pb-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                        <div className="relative">
                          <Input
                            id="fullName"
                            name="fullName"
                            value={formData.fullName || ''}
                            onChange={handleInputChange}
                            placeholder="Full Name"
                            className="pl-9 bg-white/80 dark:bg-slate-950/50"
                          />
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                        <div className="relative">
                          <Input
                            id="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleInputChange}
                            placeholder="Email"
                            className="pl-9 bg-white/80 dark:bg-slate-950/50"
                          />
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                        <div className="relative">
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone || ''}
                            onChange={handleInputChange}
                            placeholder="Phone"
                            className="pl-9 bg-white/80 dark:bg-slate-950/50"
                          />
                          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="createdAt" className="text-sm font-medium">Created At</Label>
                        <div className="relative">
                          <Input
                            id="createdAt"
                            name="createdAt"
                            value={formData.createdAt || ''}
                            readOnly
                            className="pl-9 bg-muted/20"
                          />
                          <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/70">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                      <Clipboard className="h-4 w-4 text-indigo-500" />
                      Lead Classification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 pb-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2.5">
                      <Label htmlFor="source" className="text-sm font-medium">Source</Label>
                      <Select
                        name="source"
                        value={formData.source || ''}
                        onValueChange={(value) => handleSelectChange('source', value)}
                      >
                        <SelectTrigger className="bg-white/80 dark:bg-slate-950/50">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[240px]">
                          {sourceOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              <div className="flex items-center gap-2">
                                {getSourceIcon(option)}
                                <span>{option}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.source && (
                        <Badge className={`mt-1.5 flex items-center gap-1 ${getSourceColor(formData.source)}`}>
                          {getSourceIcon(formData.source)}
                          <span>{formData.source}</span>
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2.5">
                      <Label htmlFor="associate" className="text-sm font-medium">Associate</Label>
                      <Select
                        name="associate"
                        value={formData.associate || ''}
                        onValueChange={(value) => handleSelectChange('associate', value)}
                      >
                        <SelectTrigger className="bg-white/80 dark:bg-slate-950/50">
                          <SelectValue placeholder="Select associate" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[240px]">
                          {associateOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                                    {getInitials(option)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{option}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
  
                      {formData.associate && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                              {getInitials(formData.associate)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">{formData.associate}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2.5">
                      <Label htmlFor="stage" className="text-sm font-medium">Stage</Label>
                      <Select
                        name="stage"
                        value={formData.stage || ''}
                        onValueChange={(value) => handleSelectChange('stage', value)}
                      >
                        <SelectTrigger className="bg-white/80 dark:bg-slate-950/50">
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[240px]">
                          {stageOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              <div className="flex items-center gap-2">
                                {getStageIcon(option)}
                                <span>{option}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.stage && (
                        <Badge className={`mt-1.5 flex items-center gap-1 ${getStageColor(formData.stage)}`}>
                          {getStageIcon(formData.stage)}
                          <span>{formData.stage}</span>
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2.5">
                      <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                      <Select
                        name="status"
                        value={formData.status || ''}
                        onValueChange={(value) => handleSelectChange('status', value)}
                      >
                        <SelectTrigger className="bg-white/80 dark:bg-slate-950/50">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(option)}
                                <span>{option}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.status && (
                        <Badge className={`mt-1.5 flex items-center gap-1 ${getStatusColor(formData.status)}`}>
                          {getStatusIcon(formData.status)}
                          <span>{formData.status}</span>
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/70">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                        <MessageSquare className="h-4 w-4 text-indigo-500" />
                        Additional Information
                      </CardTitle>
                      
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={handleAudioRecording}
                              >
                                {recording ? (
                                  <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                                ) : (
                                  <Mic className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {recording ? 'Stop recording' : 'Record audio note'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                                <input
                                  type="file"
                                  ref={fileInputRef}
                                  className="hidden"
                                  onChange={handleFileUpload}
                                  multiple
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Attach files</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={generateAIRecommendations}
                                disabled={isGeneratingAI}
                              >
                                {isGeneratingAI ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                                ) : (
                                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Generate AI recommendations</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 pb-5">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="remarks" className="text-sm font-medium">Remarks</Label>
                        <Textarea
                          id="remarks"
                          name="remarks"
                          value={formData.remarks || ''}
                          onChange={handleInputChange}
                          placeholder="Add any notes or remarks about this lead"
                          rows={3}
                          className="resize-none bg-white/80 dark:bg-slate-950/50"
                        />
                      </div>
                      
                      {(attachments.length > 0 || audioNote) && (
                        <div className="mt-3 space-y-2">
                          <Label className="text-xs text-muted-foreground">Attachments</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {audioNote && (
                              <div className="flex items-center justify-between p-2 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 text-amber-800 dark:text-amber-300">
                                <div className="flex items-center gap-2">
                                  <Mic className="h-3.5 w-3.5" />
                                  <span className="text-xs truncate">{audioNote}</span>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6" 
                                  onClick={() => setAudioNote(null)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                            
                            {attachments.map((file, index) => (
                              <div 
                                key={index}
                                className="flex items-center justify-between p-2 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 text-blue-800 dark:text-blue-300"
                              >
                                <div className="flex items-center gap-2">
                                  <Paperclip className="h-3.5 w-3.5" />
                                  <span className="text-xs truncate">{file.name}</span>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6" 
                                  onClick={() => handleRemoveAttachment(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="followups" className="pt-2">
                {!isBulkEdit && lead ? (
                  <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/70">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                          <CalendarCheck className="h-4 w-4 text-indigo-500" />
                          Scheduled Follow-ups
                        </CardTitle>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {(() => {
                              const count = [1, 2, 3, 4].filter(index => formData[`followUp${index}Date`]).length;
                              return `${count} scheduled`;
                            })()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 pb-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((index) => {
                          const dateField = `followUp${index}Date`;
                          const commentsField = `followUp${index}Comments`;
                          const hasDate = formData[dateField];
                          
                          return (
                            <Card 
                              key={index} 
                              className={`transition-all border ${hasDate ? getFollowUpColor(index-1) : 'bg-white dark:bg-slate-950/50'}`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className={`flex items-center justify-center w-5 h-5 rounded-full ${hasDate ? 'bg-white text-xs border shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-xs'}`}>
                                      {index}
                                    </div>
                                    <span className="font-medium text-sm">Follow-up {index}</span>
                                  </div>
                                  {hasDate && (
                                    <Badge variant="outline" className="bg-white/80 dark:bg-slate-900/50 text-xs gap-1 font-normal">
                                      <Calendar className="h-3 w-3" />
                                      {formatDate(hasDate)}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="space-y-1">
                                    <Label htmlFor={dateField} className="text-xs">Schedule Date</Label>
                                    <Input
                                      id={dateField}
                                      name={dateField}
                                      type="date"
                                      value={formData[dateField] || ''}
                                      onChange={(e) => handleFollowUpChange(index, 'date', e.target.value)}
                                      className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                                    />
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <Label htmlFor={commentsField} className="text-xs">Notes</Label>
                                    <Textarea
                                      id={commentsField}
                                      name={commentsField}
                                      value={formData[commentsField] || ''}
                                      onChange={(e) => handleFollowUpChange(index, 'comments', e.target.value)}
                                      placeholder="Add notes for this follow-up"
                                      rows={2}
                                      className="resize-none bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-sm"
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <AlertTriangle className="h-10 w-10 text-amber-500 mb-2 opacity-80" />
                    <h3 className="text-lg font-medium">Not Available</h3>
                    <p className="text-sm text-muted-foreground max-w-md mt-1">
                      Follow-up scheduling is not available in bulk edit mode or when no lead is selected.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="communication" className="pt-2">
                {!isBulkEdit && lead ? (
                  <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/70">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                          <MessageSquare className="h-4 w-4 text-indigo-500" />
                          Communication History
                        </CardTitle>
                        
                        <ToggleGroup type="single" defaultValue="all">
                          <ToggleGroupItem value="all" size="sm" className="text-xs">
                            All
                          </ToggleGroupItem>
                          <ToggleGroupItem value="emails" size="sm" className="text-xs">
                            Emails
                          </ToggleGroupItem>
                          <ToggleGroupItem value="calls" size="sm" className="text-xs">
                            Calls
                          </ToggleGroupItem>
                          <ToggleGroupItem value="messages" size="sm" className="text-xs">
                            Messages
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[360px]">
                        <div className="space-y-1 p-0">
                          {communicationHistory.map((item) => (
                            <div 
                              key={item.id}
                              className="p-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/60"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  {getHistoryItemIcon(item.type)}
                                  <span className="font-medium text-sm">
                                    {item.type === 'email' && 'Email'}
                                    {item.type === 'call' && 'Phone Call'}
                                    {item.type === 'sms' && 'SMS'}
                                    {item.type === 'whatsapp' && 'WhatsApp'}
                                  </span>
                                  {getDirectionIcon(item.direction)}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {getTimeframe(item.timestamp)}
                                  </span>
                                  {item.type === 'call' && (
                                    <Badge variant="outline" className="text-xs">
                                      <Timer className="h-3 w-3 mr-1 text-blue-500" />
                                      {item.duration}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              {item.type === 'email' && (
                                <div className="mt-1 text-sm text-muted-foreground">
                                  <div className="font-medium text-xs mb-1 text-foreground">
                                    Subject: {item.subject}
                                  </div>
                                  <p className="line-clamp-2 text-xs">{item.content}</p>
                                </div>
                              )}
                              
                              {(item.type === 'sms' || item.type === 'whatsapp') && (
                              <div className="mt-1 p-2 rounded-md bg-blue-50 dark:bg-blue-900/20 text-xs">
                                {item.content}
                              </div>
                            )}
                            
                            {item.type === 'call' && item.notes && (
                              <div className="mt-1 text-xs text-muted-foreground italic">
                                <span className="font-medium text-foreground">Notes: </span>
                                {item.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Showing {communicationHistory.length} communications
                      </span>
                      <Button size="sm" variant="outline" className="text-xs gap-1">
                        <MessageSquare className="h-3 w-3" />
                        New Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertTriangle className="h-10 w-10 text-amber-500 mb-2 opacity-80" />
                  <h3 className="text-lg font-medium">Not Available</h3>
                  <p className="text-sm text-muted-foreground max-w-md mt-1">
                    Communication history is not available in bulk edit mode or when no lead is selected.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="analytics" className="pt-2">
              {!isBulkEdit && lead ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/70">
                      <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                        <Activity className="h-4 w-4 text-indigo-500" />
                        Lead Quality Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 pb-5">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Score</span>
                          <Badge variant="outline" className={`${getLeadScoreColor(leadScore)} font-mono text-base px-2 py-0.5`}>
                            {leadScore}
                          </Badge>
                        </div>
                        
                        <Progress value={leadScore} className={`h-2 ${getProgressColor(leadScore)}`} />
                        
                        <div className="flex justify-between text-xs text-muted-foreground pt-1">
                          <span>Cold</span>
                          <span>Warm</span>
                          <span>Hot</span>
                        </div>
                        
                        <div className="space-y-3 pt-2">
                          <div className="flex justify-between items-center text-sm">
                            <span>Contact Info</span>
                            <Badge variant="outline" className={formData.email && formData.phone ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300" : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"}>
                              {formData.email && formData.phone ? "Complete" : "Incomplete"}
                            </Badge>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span>Response Rate</span>
                            <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                              High
                            </Badge>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span>Stage Progress</span>
                            <Badge variant="outline" className={formData.stage === "Trial Completed" || formData.stage === "Membership Sold" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300" : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"}>
                              {formData.stage === "Trial Completed" || formData.stage === "Membership Sold" ? "Advanced" : "In Progress"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/70">
                      <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4 text-indigo-500" />
                        Prospect Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 pb-5">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Interests</span>
                          <div className="flex flex-wrap gap-1">
                            {prospectDetails.interests.map((interest, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Preferred Time</span>
                            <p className="text-sm">{prospectDetails.preferredTime}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Experience Level</span>
                            <p className="text-sm">{prospectDetails.previousExperience}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Referred By</span>
                            <p className="text-sm">{prospectDetails.referredBy || "N/A"}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Location</span>
                            <p className="text-sm">{prospectDetails.location}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Price Discount</span>
                            <p className="text-sm">{prospectDetails.priceDiscount}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Lead Quality</span>
                            <Badge className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300">
                              {prospectDetails.leadQuality}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm md:col-span-2">
                    <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/70">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                          <HeartHandshake className="h-4 w-4 text-indigo-500" />
                          Conversion Probability
                        </CardTitle>
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300">
                          {prospectDetails.expectedConversion}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 pb-5">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900/50 rounded-md">
                          <span className="text-sm">Conversion Chance</span>
                          <div className="w-1/2">
                            <Slider value={[85]} max={100} step={1} disabled />
                          </div>
                          <Badge variant="outline" className="font-mono">85%</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-green-800 dark:text-green-300">Positives</span>
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <ul className="list-disc list-inside text-xs text-green-700 dark:text-green-300 space-y-1">
                              <li>Completed trial session</li>
                              <li>Engaged multiple times</li>
                              <li>Asked about pricing</li>
                            </ul>
                          </div>
                          
                          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Concerns</span>
                              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <ul className="list-disc list-inside text-xs text-amber-700 dark:text-amber-300 space-y-1">
                              <li>Price sensitivity</li>
                              <li>Schedule constraints</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertTriangle className="h-10 w-10 text-amber-500 mb-2 opacity-80" />
                  <h3 className="text-lg font-medium">Not Available</h3>
                  <p className="text-sm text-muted-foreground max-w-md mt-1">
                    Analytics are not available in bulk edit mode or when no lead is selected.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </form>
      </div>
      
      {/* Side panel for history */}
      {viewHistory && !isBulkEdit && lead && (
        <div className="w-72 border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 overflow-auto">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <History className="h-4 w-4 text-indigo-500" />
              Activity Timeline
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Recent activity and changes</p>
          </div>
          
          <ScrollArea className="h-[calc(90vh-17rem)]">
            <div className="p-4 space-y-4">
              {historyItems.map((item, index) => (
                <div key={item.id} className="relative">
                  {index !== historyItems.length - 1 && (
                    <div className="absolute top-5 left-[11px] bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800 z-0" />
                  )}
                  
                  <div className="flex gap-3 relative z-10">
                    <div className="mt-0.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                        {getHistoryItemIcon(item.type)}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(item.timestamp, "MMM d, yyyy")} at {formatDate(item.timestamp, "h:mm a")}
                        </span>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-2 text-sm">
                        {item.type === 'edit' && (
                          <div>
                            <span className="font-medium">Changed {item.field}</span> from <Badge variant="outline" className="text-xs">{item.from}</Badge> to <Badge variant="outline" className="text-xs">{item.to}</Badge>
                          </div>
                        )}
                        
                        {item.type === 'note' && (
                          <div>
                            <span className="font-medium">Added note:</span>
                            <p className="text-xs mt-1 text-muted-foreground">{item.content}</p>
                          </div>
                        )}
                        
                        {item.type === 'email' && (
                          <div>
                            <span className="font-medium">Sent email:</span>
                            <p className="text-xs mt-1 text-muted-foreground">Subject: {item.subject}</p>
                          </div>
                        )}
                        
                        {item.type === 'call' && (
                          <div>
                            <span className="font-medium">Phone call:</span> <Badge variant="outline" className="text-xs">{item.duration}</Badge>
                            {item.notes && (
                              <p className="text-xs mt-1 text-muted-foreground">{item.notes}</p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <span className="text-xs font-medium">{item.user}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
    
    <DialogFooter className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 flex items-center justify-between sm:justify-between flex-wrap gap-2">
      <div className="flex items-center gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          <span>Cancel</span>
        </Button>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Auto-save</span>
          <Switch 
            checked={autoSave}
            onCheckedChange={setAutoSave}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {!isBulkEdit && lead && (
          <Button 
            type="button" 
            variant="outline"
            className="gap-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-900/20 dark:border-orange-900/50"
          >
            <Flag className="h-3.5 w-3.5" />
            <span>Flag</span>
          </Button>
        )}
        
        <Button 
          type="submit" 
          form="leadForm"
          disabled={loading}
          className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{isBulkEdit ? 'Update Selected Leads' : 'Save Changes'}</span>
        </Button>
      </div>
    </DialogFooter>
  </DialogContent>
</Dialog>
); }