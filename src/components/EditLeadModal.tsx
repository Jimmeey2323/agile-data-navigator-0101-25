import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Save, X, User, Mail, Phone, Calendar, MapPin, FileText, Star, TrendingUp, Clock, CheckCircle, AlertCircle, Users, Target, Activity, BarChart3, PieChart, LineChart, Zap, Globe, MessageSquare, UserPlus, Building, Award, Lightbulb, ArrowRight, Eye, Edit, Trash2, Plus, RefreshCw, Calculator, Brain, Sparkles } from 'lucide-react';
import { useLeads } from '@/contexts/LeadContext';
import { Lead } from '@/services/googleSheets';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart as RechartsBarChart, Bar } from 'recharts';
import { SmartLeadScoring } from '@/components/SmartLeadScoring';
import { aiService } from '@/services/aiService';

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
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
  const {
    updateLead,
    addLead,
    leads,
    sourceOptions,
    associateOptions,
    centerOptions,
    stageOptions,
    statusOptions
  } = useLeads();
  
  const [formData, setFormData] = useState<Lead>({
    id: '',
    fullName: '',
    email: '',
    phone: '',
    source: '',
    associate: '',
    status: '',
    stage: '',
    createdAt: '',
    center: '',
    remarks: '',
    followUp1Date: '',
    followUp1Comments: '',
    followUp2Date: '',
    followUp2Comments: '',
    followUp3Date: '',
    followUp3Comments: '',
    followUp4Date: '',
    followUp4Comments: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAIConfigured, setIsAIConfigured] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Helper function to convert date to HTML input format (YYYY-MM-DD)
  const formatDateForInput = (dateString: string): string => {
    if (!dateString || dateString.trim() === '' || dateString.trim() === '-') {
      return '';
    }
    
    try {
      const trimmedDate = dateString.trim();
      
      // Handle DD/MM/YYYY format (like "20/09/2025")
      if (trimmedDate.includes('/')) {
        const parts = trimmedDate.split('/');
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          const year = parts[2];
          // Convert DD/MM/YYYY to YYYY-MM-DD
          return `${year}-${month}-${day}`;
        }
      }
      
      // Handle DD-MM-YYYY format (like "20-09-2025")
      if (trimmedDate.includes('-') && trimmedDate.split('-').length === 3) {
        const parts = trimmedDate.split('-');
        if (parts.length === 3 && parts[2].length === 4) {
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          const year = parts[2];
          return `${year}-${month}-${day}`;
        }
      }
      
      // Handle DD-MMM format like "19-Sept" (add current year)
      if (trimmedDate.includes('-') && trimmedDate.split('-').length === 2) {
        const parts = trimmedDate.split('-');
        const day = parts[0];
        const monthAbbr = parts[1];
        const monthMap: Record<string, string> = {
          'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
          'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
          'Sep': '09', 'Sept': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };
        const month = monthMap[monthAbbr];
        if (month) {
          const year = new Date().getFullYear();
          return `${year}-${month}-${day.padStart(2, '0')}`;
        }
      }
      
      // Try standard Date parsing as fallback
      const date = new Date(trimmedDate);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      
      return '';
    } catch {
      return '';
    }
  };

  // Initialize form data when lead changes
  useEffect(() => {
    setIsAIConfigured(aiService.isConfigured());
    
    if (lead) {
      // Convert dates to proper format for HTML inputs
      const formattedLead = {
        ...lead,
        followUp1Date: formatDateForInput(lead.followUp1Date || ''),
        followUp2Date: formatDateForInput(lead.followUp2Date || ''),
        followUp3Date: formatDateForInput(lead.followUp3Date || ''),
        followUp4Date: formatDateForInput(lead.followUp4Date || ''),
        createdAt: formatDateForInput(lead.createdAt || '')
      };
      
      setFormData(formattedLead);
      setHasUnsavedChanges(false);
      
      // Load AI suggestions if configured
      if (aiService.isConfigured()) {
        loadAISuggestions(lead);
      }
    } else {
      // Reset form for new lead
      setFormData({
        id: `new-${Date.now()}`,
        fullName: '',
        email: '',
        phone: '',
        source: sourceOptions[0] || '',
        associate: associateOptions[0] || '',
        status: statusOptions[0] || '',
        stage: stageOptions[0] || '',
        createdAt: new Date().toISOString().split('T')[0],
        center: centerOptions[0] || '',
        remarks: '',
        followUp1Date: '',
        followUp1Comments: '',
        followUp2Date: '',
        followUp2Comments: '',
        followUp3Date: '',
        followUp3Comments: '',
        followUp4Date: '',
        followUp4Comments: ''
      });
      setHasUnsavedChanges(false);
    }
  }, [lead, sourceOptions, associateOptions, centerOptions, stageOptions, statusOptions]);

  const loadAISuggestions = async (leadData: Lead) => {
    try {
      const suggestions = await aiService.generateFollowUpSuggestions(leadData);
      setAiSuggestions(suggestions);
    } catch {
      // Failed to load suggestions silently
    }
  };

  // Calculate dynamic lead score with detailed breakdown
  const leadScoreCalculation = useMemo(() => {
    let score = 0;
    const breakdown = [];
    
    // Basic information completeness (40 points)
    if (formData.fullName && formData.fullName.trim()) {
      score += 10;
      breakdown.push({ category: 'Full Name', points: 10, reason: 'Complete name provided' });
    } else {
      breakdown.push({ category: 'Full Name', points: 0, reason: 'Missing name' });
    }
    
    if (formData.email && formData.email.trim()) {
      score += 10;
      breakdown.push({ category: 'Email', points: 10, reason: 'Valid email address' });
    } else {
      breakdown.push({ category: 'Email', points: 0, reason: 'Missing email' });
    }
    
    if (formData.phone && formData.phone.trim()) {
      score += 10;
      breakdown.push({ category: 'Phone', points: 10, reason: 'Contact number provided' });
    } else {
      breakdown.push({ category: 'Phone', points: 0, reason: 'Missing phone number' });
    }
    
    if (formData.remarks && formData.remarks.trim()) {
      score += 10;
      breakdown.push({ category: 'Remarks', points: 10, reason: 'Additional notes provided' });
    } else {
      breakdown.push({ category: 'Remarks', points: 0, reason: 'No additional notes' });
    }
    
    // Stage progression (30 points)
    const stageScores = {
      'New Enquiry': 5,
      'Initial Contact': 10,
      'Trial Scheduled': 20,
      'Trial Completed': 25,
      'Membership Sold': 30,
      'Not Interested': 0,
      'Lost': 0
    };
    const stagePoints = stageScores[formData.stage as keyof typeof stageScores] || 0;
    score += stagePoints;
    breakdown.push({ 
      category: 'Stage Progress', 
      points: stagePoints, 
      reason: `Current stage: ${formData.stage}` 
    });
    
    // Status quality (20 points)
    const statusScores = {
      'Hot': 20,
      'Warm': 15,
      'Cold': 10,
      'Converted': 20,
      'Lost': 0
    };
    const statusPoints = statusScores[formData.status as keyof typeof statusScores] || 0;
    score += statusPoints;
    breakdown.push({ 
      category: 'Lead Quality', 
      points: statusPoints, 
      reason: `Status: ${formData.status}` 
    });
    
    // Follow-up activity (10 points)
    let followUpCount = 0;
    if (formData.followUp1Date) followUpCount++;
    if (formData.followUp2Date) followUpCount++;
    if (formData.followUp3Date) followUpCount++;
    if (formData.followUp4Date) followUpCount++;
    
    const followUpPoints = followUpCount * 2.5;
    score += followUpPoints;
    breakdown.push({ 
      category: 'Follow-up Activity', 
      points: followUpPoints, 
      reason: `${followUpCount} follow-up(s) completed` 
    });
    
    return {
      total: Math.min(Math.round(score), 100),
      breakdown,
      maxPossible: 100
    };
  }, [formData]);

  // Get similar leads
  const similarLeads = useMemo(() => {
    if (!formData.email && !formData.phone) return [];
    return leads.filter(l => l.id !== formData.id && (formData.email && l.email.includes(formData.email.split('@')[1]) || formData.phone && l.phone.slice(0, 6) === formData.phone.slice(0, 6) || l.source === formData.source)).slice(0, 5);
  }, [leads, formData, formData.id]);

  // Activity timeline data
  const timelineData = useMemo(() => {
    const activities = [];
    if (formData.createdAt) {
      activities.push({
        date: formData.createdAt,
        type: 'created',
        title: 'Lead Created',
        description: `Lead was created from ${formData.source}`,
        icon: <Plus className="h-4 w-4" />
      });
    }

    // Add follow-up activities
    for (let i = 1; i <= 4; i++) {
      const dateField = `followUp${i}Date` as keyof Lead;
      const commentField = `followUp${i}Comments` as keyof Lead;
      if (formData[dateField]) {
        activities.push({
          date: formData[dateField] as string,
          type: 'followup',
          title: `Follow-up ${i}`,
          description: formData[commentField] as string || 'No comments',
          icon: <MessageSquare className="h-4 w-4" />
        });
      }
    }
    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [formData]);

  // Chart data
  const engagementData = useMemo(() => {
    const followUps = timelineData.filter(item => item.type === 'followup');
    return followUps.map((item, index) => ({
      name: `Follow-up ${index + 1}`,
      engagement: Math.floor(Math.random() * 100) + 1,
      date: item.date
    }));
  }, [timelineData]);
  
  const sourceDistribution = useMemo(() => {
    const sourceCount = leads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(sourceCount).map(([source, count]) => ({
      name: source,
      value: count,
      fill: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
    }));
  }, [leads]);
  
  const handleInputChange = useCallback((field: keyof Lead, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  }, []);
  
  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      toast.error('Please enter a name for the lead');
      return;
    }
    setIsLoading(true);
    try {
      if (lead?.id && !lead.id.startsWith('new-')) {
        await updateLead(formData);
        toast.success('Lead updated successfully');
      } else {
        await addLead(formData);
        toast.success('Lead created successfully');
      }
      setHasUnsavedChanges(false);
      onClose();
      clearSelection?.();
    } catch {
      toast.error('Failed to save lead');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
        setHasUnsavedChanges(false);
      }
    } else {
      onClose();
    }
  };
  
  if (!isOpen) return null;

  const followUpsDone = [1,2,3,4].filter(i => {
    const d = formData[`followUp${i}Date` as keyof Lead] as string;
    const c = formData[`followUp${i}Comments` as keyof Lead] as string;
    return (d && d.trim() !== '' && d.trim() !== '-') || (c && c.trim() !== '' && c.trim() !== '-');
  }).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 bg-white border-0 shadow-2xl rounded-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-5 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 text-white">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-white/20">
                <AvatarFallback className="bg-blue-800 text-white font-bold text-sm">
                  {formData.fullName ? formData.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'NL'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg font-semibold text-white leading-tight">
                  {formData.fullName || 'New Lead'}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {formData.source && <span className="text-xs text-slate-400">{formData.source}</span>}
                  {formData.source && formData.status && <span className="text-slate-600">·</span>}
                  {formData.status && <span className="text-xs text-slate-300">{formData.status}</span>}
                  {formData.status && formData.stage && <span className="text-slate-600">·</span>}
                  {formData.stage && <span className="text-xs text-slate-400">{formData.stage}</span>}
                </div>
              </div>
              <div className="flex items-center gap-5 flex-shrink-0">
                <div className="text-right">
                  <div className="text-2xl font-bold text-white leading-none">{leadScoreCalculation.total}</div>
                  <div className="text-[11px] text-blue-300 mt-0.5">Lead Score</div>
                </div>
                <div className="w-px h-10 bg-blue-800" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-white leading-none">{followUpsDone}<span className="text-sm font-normal text-blue-300">/4</span></div>
                  <div className="text-[11px] text-blue-300 mt-0.5">Follow-ups</div>
                </div>
                <div className="w-px h-10 bg-blue-800" />
                <button onClick={handleClose} className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            {/* Tab bar */}
            <div className="flex-shrink-0 px-6 bg-white border-b border-slate-200">
              <TabsList className="h-11 bg-transparent p-0 gap-0 rounded-none">
                {[
                  { value: 'overview', label: 'Profile', icon: <User className="h-3.5 w-3.5" /> },
                  { value: 'followups', label: 'Follow-ups', icon: <MessageSquare className="h-3.5 w-3.5" /> },
                  { value: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-3.5 w-3.5" /> },
                ].map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-1.5 px-4 h-full text-sm font-medium text-slate-500 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-700 data-[state=active]:text-blue-800 data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-blue-700 transition-colors"
                  >
                    {tab.icon}
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full w-full">
                <div className="p-6 pb-20">

                  {/* ── PROFILE TAB (contact info + editable fields) ── */}
                  <TabsContent value="overview" className="mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                      {/* Left: Contact details (editable) */}
                      <div className="space-y-4">
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Details</h3>
                          </div>
                          <div className="p-4 space-y-3">
                            <div>
                              <Label htmlFor="fullName" className="text-xs text-slate-500 font-medium">Full Name *</Label>
                              <Input id="fullName" value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} className="mt-1 h-8 text-sm border-slate-200 bg-white" placeholder="Enter full name" />
                            </div>
                            <div>
                              <Label htmlFor="email" className="text-xs text-slate-500 font-medium">Email</Label>
                              <Input id="email" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} className="mt-1 h-8 text-sm border-slate-200 bg-white" placeholder="Email address" />
                            </div>
                            <div>
                              <Label htmlFor="phone" className="text-xs text-slate-500 font-medium">Phone</Label>
                              <Input id="phone" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} className="mt-1 h-8 text-sm border-slate-200 bg-white" placeholder="Phone number" />
                            </div>
                            <div>
                              <Label htmlFor="createdAt" className="text-xs text-slate-500 font-medium">Date Added</Label>
                              <Input id="createdAt" type="date" value={formData.createdAt} onChange={e => handleInputChange('createdAt', e.target.value)} className="mt-1 h-8 text-sm border-slate-200 bg-white" />
                            </div>
                          </div>
                        </div>

                        {/* Remarks */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Remarks</h3>
                          </div>
                          <div className="p-4">
                            <Textarea value={formData.remarks} onChange={e => handleInputChange('remarks', e.target.value)} className="text-sm border-slate-200 bg-white min-h-[90px] resize-none" placeholder="Notes or remarks..." />
                          </div>
                        </div>
                      </div>

                      {/* Right: Classification (editable) */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden h-fit">
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Classification</h3>
                        </div>
                        <div className="p-4 space-y-3">
                          <div>
                            <Label className="text-xs text-slate-500 font-medium">Source</Label>
                            <Select value={formData.source} onValueChange={v => handleInputChange('source', v)}>
                              <SelectTrigger className="mt-1 h-8 text-sm border-slate-200 bg-white"><SelectValue placeholder="Select source" /></SelectTrigger>
                              <SelectContent>{sourceOptions.map(o => <SelectItem key={o} value={o} className="text-sm">{o}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-slate-500 font-medium">Status</Label>
                            <Select value={formData.status} onValueChange={v => handleInputChange('status', v)}>
                              <SelectTrigger className="mt-1 h-8 text-sm border-slate-200 bg-white"><SelectValue placeholder="Select status" /></SelectTrigger>
                              <SelectContent>{statusOptions.map(o => <SelectItem key={o} value={o} className="text-sm">{o}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-slate-500 font-medium">Stage</Label>
                            <Select value={formData.stage} onValueChange={v => handleInputChange('stage', v)}>
                              <SelectTrigger className="mt-1 h-8 text-sm border-slate-200 bg-white"><SelectValue placeholder="Select stage" /></SelectTrigger>
                              <SelectContent>{stageOptions.map(o => <SelectItem key={o} value={o} className="text-sm">{o}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-slate-500 font-medium">Associate</Label>
                            <Select value={formData.associate} onValueChange={v => handleInputChange('associate', v)}>
                              <SelectTrigger className="mt-1 h-8 text-sm border-slate-200 bg-white"><SelectValue placeholder="Select associate" /></SelectTrigger>
                              <SelectContent>{associateOptions.map(o => <SelectItem key={o} value={o} className="text-sm">{o}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-slate-500 font-medium">Center</Label>
                            <Select value={formData.center} onValueChange={v => handleInputChange('center', v)}>
                              <SelectTrigger className="mt-1 h-8 text-sm border-slate-200 bg-white"><SelectValue placeholder="Select center" /></SelectTrigger>
                              <SelectContent>{centerOptions.map(o => <SelectItem key={o} value={o} className="text-sm">{o}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* ── FOLLOW-UPS TAB ── */}
                  <TabsContent value="followups" className="mt-0">
                    {/* Progress indicator */}
                    <div className="flex items-center gap-3 mb-5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex gap-1.5">
                        {[1,2,3,4].map(i => {
                          const d = formData[`followUp${i}Date` as keyof Lead] as string;
                          const c = formData[`followUp${i}Comments` as keyof Lead] as string;
                          const isDone = (d && d.trim() !== '' && d.trim() !== '-') || (c && c.trim() !== '' && c.trim() !== '-');
                          return (
                            <div key={i} className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold border ${
                              isDone ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-slate-400 border-slate-200'
                            }`}>{i}</div>
                          );
                        })}
                      </div>
                      <span className="text-sm text-slate-600 font-medium">{followUpsDone} of 4 follow-ups recorded</span>
                    </div>

                    {/* 2x2 grid of follow-up cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1,2,3,4].map(num => {
                        const dateField = `followUp${num}Date` as keyof Lead;
                        const commentsField = `followUp${num}Comments` as keyof Lead;
                        const date = formData[dateField] as string;
                        const comments = formData[commentsField] as string;
                        const hasDate = date && date.trim() !== '' && date.trim() !== '-';
                        const hasComment = comments && comments.trim() !== '' && comments.trim() !== '-';
                        const isDone = hasDate || hasComment;

                        return (
                          <div key={num} className={`border rounded-xl overflow-hidden ${isDone ? 'border-blue-200' : 'border-slate-200'}`}>
                            <div className={`px-4 py-2.5 flex items-center justify-between border-b ${isDone ? 'bg-gradient-to-r from-blue-900 to-indigo-900 border-blue-800' : 'bg-slate-50 border-slate-200'}`}>
                              <span className={`text-xs font-semibold uppercase tracking-wider ${isDone ? 'text-white' : 'text-slate-400'}`}>Follow-up {num}</span>
                              {isDone && <CheckCircle className="h-3.5 w-3.5 text-blue-200" />}
                            </div>
                            <div className="p-4 bg-white space-y-3">
                              <div>
                                <Label className="text-xs text-slate-500 font-medium">Date</Label>
                                <Input type="date" value={date || ''} onChange={e => handleInputChange(dateField, e.target.value)} className="mt-1 h-8 text-sm border-slate-200 bg-white" />
                              </div>
                              <div>
                                <Label className="text-xs text-slate-500 font-medium">Comments</Label>
                                <Textarea value={comments || ''} onChange={e => handleInputChange(commentsField, e.target.value)} placeholder={`Notes for follow-up ${num}...`} className="mt-1 text-sm border-slate-200 bg-white min-h-[70px] resize-none" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  {/* ── ANALYTICS TAB ── */}
                  <TabsContent value="analytics" className="mt-0 space-y-5">
                    {/* Score summary */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lead Score Breakdown</h3>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-4xl font-bold text-blue-900">{leadScoreCalculation.total}</div>
                          <div>
                            <div className="text-sm font-medium text-slate-700">
                              {leadScoreCalculation.total >= 80 ? 'Excellent' : leadScoreCalculation.total >= 60 ? 'Good' : leadScoreCalculation.total >= 40 ? 'Fair' : 'Needs Improvement'}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">out of 100 points</div>
                          </div>
                          <div className="flex-1">
                            <Progress value={leadScoreCalculation.total} className="h-2 bg-slate-100" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          {leadScoreCalculation.breakdown.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-xs text-slate-500 w-36 truncate">{item.category}</span>
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-700 to-indigo-600 rounded-full transition-all" style={{ width: `${(item.points / 30) * 100}%` }} />
                              </div>
                              <span className="text-xs font-semibold text-slate-700 w-6 text-right">{item.points}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Activity timeline */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Activity Timeline</h3>
                      </div>
                      <div className="p-4">
                        {timelineData.length > 0 ? (
                          <div className="relative">
                            <div className="absolute left-[11px] top-3 bottom-3 w-px bg-slate-200" />
                            <div className="space-y-4">
                              {timelineData.map((activity, index) => (
                                <div key={index} className="flex items-start gap-3">
                                  <div className="relative z-10 w-6 h-6 rounded-full bg-gradient-to-br from-blue-900 to-indigo-800 flex items-center justify-center text-white flex-shrink-0">
                                    <span className="scale-75">{activity.icon}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-sm font-medium text-slate-800">{activity.title}</span>
                                      <span className="text-xs text-slate-400">{formatDate(activity.date)}</span>
                                    </div>
                                    {activity.description && <p className="text-xs text-slate-500 mt-0.5">{activity.description}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Activity className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-400">No activity recorded yet</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Similar leads */}
                    {similarLeads.length > 0 && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Similar Leads</h3>
                        </div>
                        <div className="p-4 space-y-2">
                          {similarLeads.map(sl => (
                            <div key={sl.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                              <Avatar className="h-7 w-7 flex-shrink-0">
                                <AvatarFallback className="bg-slate-200 text-slate-600 text-xs font-semibold">
                                  {sl.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">{sl.fullName}</p>
                                <p className="text-xs text-slate-400 truncate">{sl.source} · {sl.status}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                </div>
              </ScrollArea>
            </div>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-3 bg-white border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              {hasUnsavedChanges && (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span>Unsaved changes</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isLoading} className="h-8 text-sm border-slate-200 text-slate-600 hover:bg-slate-50">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading || !formData.fullName.trim()} className="h-8 text-sm bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-950 hover:to-indigo-950 text-white">
                {isLoading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    {lead?.id && !lead.id.startsWith('new-') ? 'Update Lead' : 'Create Lead'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}