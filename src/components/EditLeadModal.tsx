import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useLeads } from '@/contexts/LeadContext';
import { Lead } from '@/services/googleSheets';
import { 
  Save, 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  Users, 
  Building, 
  Tag,
  Clock,
  FileText,
  Star,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit3,
  Activity,
  TrendingUp,
  Target,
  Zap,
  Globe,
  Smartphone,
  AtSign,
  MapPinIcon,
  CalendarDays,
  UserCheck,
  Building2,
  StickyNote,
  History,
  Bell,
  Flag,
  Eye,
  MoreHorizontal,
  ChevronRight,
  Trash2,
  Copy,
  ExternalLink,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Filter,
  Search,
  BookmarkPlus,
  Share2,
  Archive,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { FollowUpCard } from './FollowUpCard';
import { cn, formatDate } from '@/lib/utils';

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  selectedLeads?: string[];
  clearSelection?: () => void;
}

interface ValidationError {
  field: string;
  message: string;
}

interface LeadActivity {
  id: string;
  type: 'created' | 'updated' | 'status_changed' | 'follow_up' | 'note_added';
  description: string;
  timestamp: string;
  user: string;
}

export function EditLeadModal({ 
  isOpen, 
  onClose, 
  lead, 
  selectedLeads = [], 
  clearSelection 
}: EditLeadModalProps) {
  const { 
    updateLead, 
    addLead, 
    sourceOptions, 
    associateOptions, 
    centerOptions, 
    stageOptions, 
    statusOptions,
    leads 
  } = useLeads();
  
  const [formData, setFormData] = useState<Partial<Lead>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [leadScore, setLeadScore] = useState(0);
  const [similarLeads, setSimilarLeads] = useState<Lead[]>([]);
  const [leadActivities, setLeadActivities] = useState<LeadActivity[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const isNewLead = lead?.id?.startsWith('new-');
  const isBulkEdit = selectedLeads.length > 0 && !lead;

  // Calculate lead score based on various factors
  const calculateLeadScore = useCallback((data: Partial<Lead>) => {
    let score = 0;
    
    // Basic information completeness (40 points)
    if (data.fullName?.trim()) score += 10;
    if (data.email?.trim()) score += 10;
    if (data.phone?.trim()) score += 10;
    if (data.remarks?.trim()) score += 10;
    
    // Engagement level (30 points)
    const followUps = [data.followUp1Date, data.followUp2Date, data.followUp3Date, data.followUp4Date].filter(Boolean);
    score += followUps.length * 7.5;
    
    // Status progression (30 points)
    const statusScores: Record<string, number> = {
      'Won': 30,
      'Trial Completed': 25,
      'Trial Scheduled': 20,
      'Warm': 15,
      'Open': 10,
      'Cold': 5,
      'Lost': 0
    };
    score += statusScores[data.status || ''] || 0;
    
    return Math.min(100, Math.round(score));
  }, []);

  // Find similar leads based on email domain, phone area code, or source
  const findSimilarLeads = useCallback((data: Partial<Lead>) => {
    if (!data.email && !data.phone) return [];
    
    return leads.filter(l => {
      if (l.id === data.id) return false;
      
      // Same email domain
      if (data.email && l.email) {
        const dataDomain = data.email.split('@')[1];
        const leadDomain = l.email.split('@')[1];
        if (dataDomain === leadDomain) return true;
      }
      
      // Same phone area code (first 3 digits)
      if (data.phone && l.phone) {
        const dataArea = data.phone.replace(/\D/g, '').substring(0, 3);
        const leadArea = l.phone.replace(/\D/g, '').substring(0, 3);
        if (dataArea === leadArea && dataArea.length === 3) return true;
      }
      
      // Same source and similar timeframe
      if (data.source === l.source && data.createdAt && l.createdAt) {
        const dateDiff = Math.abs(new Date(data.createdAt).getTime() - new Date(l.createdAt).getTime());
        if (dateDiff < 7 * 24 * 60 * 60 * 1000) return true; // Within 7 days
      }
      
      return false;
    }).slice(0, 5);
  }, [leads]);

  // Generate mock activities for demonstration
  const generateLeadActivities = useCallback((leadData: Partial<Lead>) => {
    const activities: LeadActivity[] = [];
    
    if (leadData.createdAt) {
      activities.push({
        id: '1',
        type: 'created',
        description: 'Lead created',
        timestamp: leadData.createdAt,
        user: leadData.associate || 'System'
      });
    }
    
    // Add follow-up activities
    [1, 2, 3, 4].forEach(num => {
      const dateField = `followUp${num}Date` as keyof Lead;
      const commentField = `followUp${num}Comments` as keyof Lead;
      
      if (leadData[dateField]) {
        activities.push({
          id: `follow-${num}`,
          type: 'follow_up',
          description: `Follow-up #${num}: ${leadData[commentField] || 'No comments'}`,
          timestamp: leadData[dateField] as string,
          user: leadData.associate || 'Unknown'
        });
      }
    });
    
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, []);

  useEffect(() => {
    if (lead) {
      setFormData({ ...lead });
      setLeadScore(calculateLeadScore(lead));
      setSimilarLeads(findSimilarLeads(lead));
      setLeadActivities(generateLeadActivities(lead));
    } else {
      const defaultData = {
        fullName: '',
        email: '',
        phone: '',
        source: sourceOptions[0] || 'Website',
        associate: associateOptions[0] || '',
        status: statusOptions[0] || 'Open',
        stage: stageOptions[0] || 'New Enquiry',
        center: centerOptions[0] || '',
        remarks: '',
        createdAt: new Date().toISOString().split('T')[0],
        followUp1Date: '',
        followUp1Comments: '',
        followUp2Date: '',
        followUp2Comments: '',
        followUp3Date: '',
        followUp3Comments: '',
        followUp4Date: '',
        followUp4Comments: ''
      };
      setFormData(defaultData);
      setLeadScore(calculateLeadScore(defaultData));
      setSimilarLeads([]);
      setLeadActivities([]);
    }
    setHasUnsavedChanges(false);
    setValidationErrors([]);
  }, [lead, calculateLeadScore, findSimilarLeads, generateLeadActivities, sourceOptions, associateOptions, statusOptions, stageOptions, centerOptions]);

  const validateForm = useCallback((data: Partial<Lead>): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    if (!data.fullName?.trim()) {
      errors.push({ field: 'fullName', message: 'Full name is required' });
    }
    
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }
    
    if (data.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone.replace(/\D/g, ''))) {
      errors.push({ field: 'phone', message: 'Please enter a valid phone number' });
    }
    
    return errors;
  }, []);

  const handleInputChange = useCallback((field: keyof Lead, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    setHasUnsavedChanges(true);
    
    // Update lead score in real-time
    setLeadScore(calculateLeadScore(newData));
    
    // Update similar leads if email or phone changed
    if (field === 'email' || field === 'phone') {
      setSimilarLeads(findSimilarLeads(newData));
    }
    
    // Clear validation errors for this field
    setValidationErrors(prev => prev.filter(error => error.field !== field));
    
    // Auto-save if enabled
    if (isAutoSaveEnabled && !isNewLead) {
      const timeoutId = setTimeout(() => {
        handleAutoSave(newData);
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [formData, calculateLeadScore, findSimilarLeads, isAutoSaveEnabled, isNewLead]);

  const handleAutoSave = async (data: Partial<Lead>) => {
    if (!lead || isNewLead) return;
    
    try {
      const updatedLead: Lead = { ...lead, ...data } as Lead;
      await updateLead(updatedLead);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      toast.success('Changes auto-saved', { duration: 2000 });
    } catch (error) {
      console.error('Auto-save failed:', error);
      toast.error('Auto-save failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast.error('Please fix the validation errors');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isNewLead) {
        const newLead: Lead = {
          ...formData,
          id: `lead-${Date.now()}`,
          createdAt: formData.createdAt || new Date().toISOString().split('T')[0]
        } as Lead;
        
        await addLead(newLead);
        toast.success('Lead created successfully');
      } else if (lead) {
        const updatedLead: Lead = { ...lead, ...formData } as Lead;
        await updateLead(updatedLead);
        toast.success('Lead updated successfully');
      }

      setHasUnsavedChanges(false);
      if (clearSelection) clearSelection();
      onClose();
    } catch (error) {
      console.error('Error saving lead:', error);
      toast.error('Failed to save lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      'Won': <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
      'Lost': <XCircle className="h-4 w-4 text-red-500" />,
      'Open': <AlertCircle className="h-4 w-4 text-blue-500" />,
      'Trial Completed': <Star className="h-4 w-4 text-amber-500" />,
      'Trial Scheduled': <Calendar className="h-4 w-4 text-purple-500" />,
      'Warm': <TrendingUp className="h-4 w-4 text-orange-500" />,
      'Cold': <Clock className="h-4 w-4 text-gray-500" />,
      'Unresponsive': <AlertTriangle className="h-4 w-4 text-red-400" />
    };
    return icons[status] || <Clock className="h-4 w-4 text-gray-500" />;
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50';
    if (score >= 60) return 'text-amber-600 bg-amber-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getFollowUps = () => {
    const followUps = [];
    for (let i = 1; i <= 4; i++) {
      const dateField = `followUp${i}Date` as keyof Lead;
      const commentField = `followUp${i}Comments` as keyof Lead;
      
      if (formData[dateField]) {
        followUps.push({
          number: i,
          date: formData[dateField] as string,
          comments: (formData[commentField] as string) || '',
          associate: formData.associate || ''
        });
      }
    }
    return followUps;
  };

  const getFieldError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 bg-white/95 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Enhanced Header */}
          <DialogHeader className="px-8 py-6 border-b border-white/10 bg-gradient-to-r from-slate-50/80 to-white/60 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-white border border-white/40 shadow-lg flex items-center justify-center backdrop-blur-sm">
                    <User className="h-8 w-8 text-slate-600" />
                  </div>
                  {!isNewLead && (
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold",
                      getLeadScoreColor(leadScore)
                    )}>
                      {leadScore}
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <DialogTitle className="text-3xl font-bold text-slate-900">
                    {isNewLead ? 'Create New Lead' : isBulkEdit ? `Edit ${selectedLeads.length} Leads` : formData.fullName || 'Edit Lead'}
                  </DialogTitle>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {isNewLead ? 'Creating today' : `Created ${formatDate(formData.createdAt || '')}`}
                    </span>
                    {!isNewLead && (
                      <>
                        <span className="flex items-center gap-1">
                          <Activity className="h-4 w-4" />
                          Score: {leadScore}/100
                        </span>
                        {lastSaved && (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle className="h-4 w-4" />
                            Saved {formatDate(lastSaved.toISOString(), 'HH:mm:ss')}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {!isNewLead && !isBulkEdit && formData.status && (
                  <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30 shadow-sm">
                    {getStatusIcon(formData.status)}
                    <span className="text-sm font-semibold text-slate-700">{formData.status}</span>
                  </div>
                )}
                
                {hasUnsavedChanges && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-medium text-amber-700">Unsaved changes</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/40">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Progress Bar for Lead Score */}
            {!isNewLead && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Lead Quality Score</span>
                  <span className="font-semibold">{leadScore}%</span>
                </div>
                <Progress value={leadScore} className="h-2 bg-white/40" />
              </div>
            )}
          </DialogHeader>

          {/* Enhanced Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="px-8 py-4 border-b border-white/10 bg-gradient-to-r from-white/30 to-slate-50/40 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <TabsList className="bg-white/40 backdrop-blur-sm border border-white/30 p-1 rounded-xl shadow-sm">
                    <TabsTrigger 
                      value="overview" 
                      className="data-[state=active]:bg-white/90 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-slate-700 font-medium transition-all"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="details" 
                      className="data-[state=active]:bg-white/90 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-slate-700 font-medium transition-all"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Details
                    </TabsTrigger>
                    <TabsTrigger 
                      value="followups" 
                      className="data-[state=active]:bg-white/90 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-slate-700 font-medium transition-all"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Follow-ups
                      {getFollowUps().length > 0 && (
                        <Badge className="ml-2 bg-slate-100 text-slate-700 border-white/30 text-xs px-2 py-0.5">
                          {getFollowUps().length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="insights" 
                      className="data-[state=active]:bg-white/90 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-slate-700 font-medium transition-all"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Insights
                    </TabsTrigger>
                    <TabsTrigger 
                      value="activity" 
                      className="data-[state=active]:bg-white/90 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-slate-700 font-medium transition-all"
                    >
                      <History className="h-4 w-4 mr-2" />
                      Activity
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Switch
                        checked={isAutoSaveEnabled}
                        onCheckedChange={setIsAutoSaveEnabled}
                        disabled={isNewLead}
                      />
                      <span>Auto-save</span>
                    </div>
                    
                    <Button variant="ghost" size="sm" onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}>
                      <Settings className="h-4 w-4 mr-1" />
                      Advanced
                    </Button>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 px-8 py-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <TabsContent value="overview" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      {/* Main Information */}
                      <div className="xl:col-span-2 space-y-6">
                        <Card className="bg-white/50 backdrop-blur-sm border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                              </div>
                              Personal Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  Full Name *
                                </Label>
                                <Input
                                  id="fullName"
                                  value={formData.fullName || ''}
                                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                                  placeholder="Enter full name"
                                  className={cn(
                                    "bg-white/70 backdrop-blur-sm border border-white/40 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 rounded-xl h-12 text-slate-900 placeholder:text-slate-500",
                                    getFieldError('fullName') && "border-red-300 focus:border-red-400 focus:ring-red-200"
                                  )}
                                  required
                                />
                                {getFieldError('fullName') && (
                                  <p className="text-xs text-red-600 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {getFieldError('fullName')}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                  <AtSign className="h-4 w-4" />
                                  Email Address
                                </Label>
                                <div className="relative">
                                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                                  <Input
                                    id="email"
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="Enter email address"
                                    className={cn(
                                      "pl-12 bg-white/70 backdrop-blur-sm border border-white/40 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 rounded-xl h-12 text-slate-900 placeholder:text-slate-500",
                                      getFieldError('email') && "border-red-300 focus:border-red-400 focus:ring-red-200"
                                    )}
                                  />
                                </div>
                                {getFieldError('email') && (
                                  <p className="text-xs text-red-600 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {getFieldError('email')}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                  <Smartphone className="h-4 w-4" />
                                  Phone Number
                                </Label>
                                <div className="relative">
                                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                                  <Input
                                    id="phone"
                                    value={formData.phone || ''}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="Enter phone number"
                                    className={cn(
                                      "pl-12 bg-white/70 backdrop-blur-sm border border-white/40 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 rounded-xl h-12 text-slate-900 placeholder:text-slate-500",
                                      getFieldError('phone') && "border-red-300 focus:border-red-400 focus:ring-red-200"
                                    )}
                                  />
                                </div>
                                {getFieldError('phone') && (
                                  <p className="text-xs text-red-600 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {getFieldError('phone')}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="createdAt" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                  <CalendarDays className="h-4 w-4" />
                                  Created Date
                                </Label>
                                <div className="relative">
                                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                                  <Input
                                    id="createdAt"
                                    type="date"
                                    value={formData.createdAt || ''}
                                    onChange={(e) => handleInputChange('createdAt', e.target.value)}
                                    className="pl-12 bg-white/70 backdrop-blur-sm border border-white/40 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 rounded-xl h-12 text-slate-900"
                                  />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-white/50 backdrop-blur-sm border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                <Tag className="h-4 w-4 text-white" />
                              </div>
                              Lead Classification
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="source" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                  <Globe className="h-4 w-4" />
                                  Lead Source
                                </Label>
                                <Select value={formData.source || ''} onValueChange={(value) => handleInputChange('source', value)}>
                                  <SelectTrigger className="bg-white/70 backdrop-blur-sm border border-white/40 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 rounded-xl h-12">
                                    <SelectValue placeholder="Select source" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl rounded-xl">
                                    {sourceOptions.map(source => (
                                      <SelectItem key={source} value={source} className="hover:bg-slate-50 rounded-lg">
                                        {source}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="status" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                  <Flag className="h-4 w-4" />
                                  Status
                                </Label>
                                <Select value={formData.status || ''} onValueChange={(value) => handleInputChange('status', value)}>
                                  <SelectTrigger className="bg-white/70 backdrop-blur-sm border border-white/40 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 rounded-xl h-12">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl rounded-xl">
                                    {statusOptions.map(status => (
                                      <SelectItem key={status} value={status} className="hover:bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                          {getStatusIcon(status)}
                                          {status}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="stage" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                  <Target className="h-4 w-4" />
                                  Current Stage
                                </Label>
                                <Select value={formData.stage || ''} onValueChange={(value) => handleInputChange('stage', value)}>
                                  <SelectTrigger className="bg-white/70 backdrop-blur-sm border border-white/40 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 rounded-xl h-12">
                                    <SelectValue placeholder="Select stage" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl rounded-xl">
                                    {stageOptions.map(stage => (
                                      <SelectItem key={stage} value={stage} className="hover:bg-slate-50 rounded-lg">
                                        {stage}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="associate" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                  <UserCheck className="h-4 w-4" />
                                  Assigned Associate
                                </Label>
                                <Select value={formData.associate || ''} onValueChange={(value) => handleInputChange('associate', value)}>
                                  <SelectTrigger className="bg-white/70 backdrop-blur-sm border border-white/40 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 rounded-xl h-12">
                                    <SelectValue placeholder="Select associate" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl rounded-xl">
                                    {associateOptions.map(associate => (
                                      <SelectItem key={associate} value={associate} className="hover:bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                          <Users className="h-4 w-4" />
                                          {associate}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Sidebar */}
                      <div className="space-y-6">
                        {/* Lead Score Card */}
                        <Card className="bg-gradient-to-br from-slate-50 to-white border border-white/40 shadow-lg">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                              <Zap className="h-5 w-5 text-amber-500" />
                              Lead Score
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center space-y-4">
                              <div className={cn(
                                "w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-bold border-4",
                                leadScore >= 80 ? "border-emerald-500 text-emerald-600" :
                                leadScore >= 60 ? "border-amber-500 text-amber-600" :
                                leadScore >= 40 ? "border-orange-500 text-orange-600" :
                                "border-red-500 text-red-600"
                              )}>
                                {leadScore}
                              </div>
                              <div className="space-y-2">
                                <Progress value={leadScore} className="h-2" />
                                <p className="text-sm text-slate-600">
                                  {leadScore >= 80 ? "Excellent lead quality" :
                                   leadScore >= 60 ? "Good lead quality" :
                                   leadScore >= 40 ? "Average lead quality" :
                                   "Needs improvement"}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Similar Leads */}
                        {similarLeads.length > 0 && (
                          <Card className="bg-white/50 backdrop-blur-sm border border-white/40 shadow-lg">
                            <CardHeader className="pb-4">
                              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-500" />
                                Similar Leads
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {similarLeads.slice(0, 3).map(similarLead => (
                                  <div key={similarLead.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/40 border border-white/30">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                      <User className="h-4 w-4 text-slate-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-slate-900 truncate">{similarLead.fullName}</p>
                                      <p className="text-xs text-slate-600">{similarLead.source} • {similarLead.status}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Quick Actions */}
                        <Card className="bg-white/50 backdrop-blur-sm border border-white/40 shadow-lg">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                              <Zap className="h-5 w-5 text-purple-500" />
                              Quick Actions
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <Button variant="outline" size="sm" className="w-full justify-start bg-white/60 border-white/40 hover:bg-white/80">
                                <BookmarkPlus className="h-4 w-4 mr-2" />
                                Add to Favorites
                              </Button>
                              <Button variant="outline" size="sm" className="w-full justify-start bg-white/60 border-white/40 hover:bg-white/80">
                                <Share2 className="h-4 w-4 mr-2" />
                                Share Lead
                              </Button>
                              <Button variant="outline" size="sm" className="w-full justify-start bg-white/60 border-white/40 hover:bg-white/80">
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate Lead
                              </Button>
                              <Button variant="outline" size="sm" className="w-full justify-start bg-white/60 border-white/40 hover:bg-white/80">
                                <Archive className="h-4 w-4 mr-2" />
                                Archive Lead
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="bg-white/50 backdrop-blur-sm border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-white" />
                            </div>
                            Location & Assignment
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="center" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                              <MapPinIcon className="h-4 w-4" />
                              Center/Location
                            </Label>
                            <Select value={formData.center || ''} onValueChange={(value) => handleInputChange('center', value)}>
                              <SelectTrigger className="bg-white/70 backdrop-blur-sm border border-white/40 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 rounded-xl h-12">
                                <SelectValue placeholder="Select center" />
                              </SelectTrigger>
                              <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl rounded-xl">
                                {centerOptions.map(center => (
                                  <SelectItem key={center} value={center} className="hover:bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4" />
                                      {center}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/50 backdrop-blur-sm border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                              <StickyNote className="h-4 w-4 text-white" />
                            </div>
                            Notes & Remarks
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <Label htmlFor="remarks" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Remarks & Notes
                            </Label>
                            <Textarea
                              id="remarks"
                              value={formData.remarks || ''}
                              onChange={(e) => handleInputChange('remarks', e.target.value)}
                              placeholder="Add any additional notes, observations, or important details about this lead..."
                              rows={6}
                              className="bg-white/70 backdrop-blur-sm border border-white/40 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 rounded-xl resize-none text-slate-900 placeholder:text-slate-500"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="followups" className="mt-0 space-y-6">
                    <Card className="bg-white/50 backdrop-blur-sm border border-white/40 shadow-lg">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <MessageSquare className="h-4 w-4 text-white" />
                          </div>
                          Follow-up History & Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {getFollowUps().length > 0 ? (
                          <div className="space-y-4 mb-8">
                            {getFollowUps().map((followUp) => (
                              <FollowUpCard
                                key={followUp.number}
                                followUpNumber={followUp.number}
                                date={followUp.date}
                                comments={followUp.comments}
                                associate={followUp.associate}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 mb-8">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                              <MessageSquare className="h-8 w-8 text-slate-400" />
                            </div>
                            <p className="text-slate-600 font-semibold text-lg">No follow-ups recorded yet</p>
                            <p className="text-sm text-slate-500 mt-2">Start tracking your interactions with this lead by adding follow-up activities below</p>
                          </div>
                        )}

                        <Separator className="my-8 bg-slate-200" />

                        <div className="space-y-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                              <Plus className="h-4 w-4 text-white" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900">Add Follow-up Activities</h4>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map((num) => (
                              <div key={num} className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-white/60 to-slate-50/40 backdrop-blur-sm border border-white/30 shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                                    {num}
                                  </div>
                                  <h5 className="font-bold text-slate-800">Follow-up #{num}</h5>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Date
                                  </Label>
                                  <Input
                                    type="date"
                                    value={formData[`followUp${num}Date` as keyof Lead] as string || ''}
                                    onChange={(e) => handleInputChange(`followUp${num}Date` as keyof Lead, e.target.value)}
                                    className="bg-white/70 backdrop-blur-sm border border-white/40 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 rounded-xl h-11"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Comments & Notes
                                  </Label>
                                  <Textarea
                                    value={formData[`followUp${num}Comments` as keyof Lead] as string || ''}
                                    onChange={(e) => handleInputChange(`followUp${num}Comments` as keyof Lead, e.target.value)}
                                    placeholder="Describe the interaction, outcome, next steps..."
                                    rows={4}
                                    className="bg-white/70 backdrop-blur-sm border border-white/40 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 rounded-xl resize-none text-slate-900 placeholder:text-slate-500"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="insights" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-lg">
                        <CardHeader>
                          <CardTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Lead Performance
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-blue-700">Engagement Score</span>
                              <span className="font-bold text-blue-900">{Math.round(leadScore * 0.8)}/80</span>
                            </div>
                            <Progress value={leadScore * 0.8} className="h-2" />
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-blue-700">Response Rate</span>
                              <span className="font-bold text-blue-900">{getFollowUps().length > 0 ? '85%' : 'N/A'}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-blue-700">Days Since Created</span>
                              <span className="font-bold text-blue-900">
                                {formData.createdAt ? Math.floor((new Date().getTime() - new Date(formData.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 shadow-lg">
                        <CardHeader>
                          <CardTitle className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {leadScore < 60 && (
                              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-amber-800">Improve lead quality</p>
                                  <p className="text-xs text-amber-700">Add more contact information and follow-ups</p>
                                </div>
                              </div>
                            )}
                            
                            {getFollowUps().length === 0 && (
                              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-blue-800">Schedule first follow-up</p>
                                  <p className="text-xs text-blue-700">Reach out within 24 hours for best results</p>
                                </div>
                              </div>
                            )}
                            
                            {formData.status === 'Open' && getFollowUps().length > 0 && (
                              <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-emerald-800">Good engagement</p>
                                  <p className="text-xs text-emerald-700">Continue nurturing this lead</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="activity" className="mt-0 space-y-6">
                    <Card className="bg-white/50 backdrop-blur-sm border border-white/40 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                            <History className="h-4 w-4 text-white" />
                          </div>
                          Activity Timeline
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {leadActivities.length > 0 ? (
                          <div className="space-y-4">
                            {leadActivities.map((activity, index) => (
                              <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl bg-white/40 border border-white/30">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                  {activity.type === 'created' && <Plus className="h-4 w-4 text-green-600" />}
                                  {activity.type === 'follow_up' && <MessageSquare className="h-4 w-4 text-blue-600" />}
                                  {activity.type === 'updated' && <Edit3 className="h-4 w-4 text-orange-600" />}
                                  {activity.type === 'status_changed' && <Flag className="h-4 w-4 text-purple-600" />}
                                  {activity.type === 'note_added' && <FileText className="h-4 w-4 text-gray-600" />}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-slate-900">{activity.description}</p>
                                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                                    <span>{formatDate(activity.timestamp)}</span>
                                    <span>•</span>
                                    <span>{activity.user}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                              <History className="h-8 w-8 text-slate-400" />
                            </div>
                            <p className="text-slate-600 font-semibold">No activity recorded yet</p>
                            <p className="text-sm text-slate-500 mt-1">Activity will appear here as you interact with this lead</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </form>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Enhanced Footer */}
          <div className="px-8 py-6 border-t border-white/10 bg-gradient-to-r from-slate-50/60 to-white/40 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  {isNewLead ? 'All fields marked with * are required' : 'Changes are tracked automatically'}
                </span>
                {validationErrors.length > 0 && (
                  <span className="flex items-center gap-1 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    {validationErrors.length} validation error{validationErrors.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="bg-white/70 backdrop-blur-sm border border-white/40 hover:bg-white/90 text-slate-700 rounded-xl px-6 h-11 font-medium"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting || validationErrors.length > 0}
                  className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white border-0 rounded-xl px-8 h-11 shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {isNewLead ? 'Create Lead' : 'Save Changes'}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}