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
import { 
  Save, 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  FileText, 
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Target,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Globe,
  MessageSquare,
  UserPlus,
  Building,
  Award,
  Lightbulb,
  ArrowRight,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw
} from 'lucide-react';
import { useLeads } from '@/contexts/LeadContext';
import { Lead } from '@/services/googleSheets';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart as RechartsBarChart, Bar } from 'recharts';

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  selectedLeads?: string[];
  clearSelection?: () => void;
}

export function EditLeadModal({ isOpen, onClose, lead, selectedLeads = [], clearSelection }: EditLeadModalProps) {
  const { updateLead, addLead, leads, sourceOptions, associateOptions, centerOptions, stageOptions, statusOptions } = useLeads();
  
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
  const [autoSave, setAutoSave] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Initialize form data when lead changes
  useEffect(() => {
    if (lead) {
      setFormData(lead);
      setHasUnsavedChanges(false);
    } else {
      // Reset form for new lead
      setFormData({
        id: `new-${Date.now()}`,
        fullName: '',
        email: '',
        phone: '',
        source: sourceOptions[0] || '',
        associate: associateOptions[0] || '',
        status: statusOptions[0] || 'New',
        stage: stageOptions[0] || 'Initial Contact',
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

  // Calculate lead score
  const leadScore = useMemo(() => {
    let score = 0;
    const weights = {
      fullName: 15,
      email: 20,
      phone: 20,
      source: 10,
      associate: 10,
      status: 10,
      stage: 10,
      remarks: 5
    };

    Object.entries(weights).forEach(([field, weight]) => {
      if (formData[field as keyof Lead] && String(formData[field as keyof Lead]).trim()) {
        score += weight;
      }
    });

    return Math.min(score, 100);
  }, [formData]);

  // Get similar leads
  const similarLeads = useMemo(() => {
    if (!formData.email && !formData.phone) return [];
    
    return leads.filter(l => 
      l.id !== formData.id && (
        (formData.email && l.email.includes(formData.email.split('@')[1])) ||
        (formData.phone && l.phone.slice(0, 6) === formData.phone.slice(0, 6)) ||
        l.source === formData.source
      )
    ).slice(0, 5);
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
    setFormData(prev => ({ ...prev, [field]: value }));
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
    } catch (error) {
      console.error('Error saving lead:', error);
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-8 py-6 bg-gradient-to-r from-slate-50/80 to-white/80 backdrop-blur-sm border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-white/50 shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                    {formData.fullName ? formData.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'NL'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-2xl font-bold text-slate-800">
                    {lead?.id && !lead.id.startsWith('new-') ? 'Edit Lead' : 'Create New Lead'}
                  </DialogTitle>
                  <p className="text-slate-600 mt-1">
                    {formData.fullName || 'New Lead'} • {formData.source || 'No source'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Lead Score */}
                <div className="text-center">
                  <div className="text-sm font-medium text-slate-600 mb-1">Lead Score</div>
                  <div className="flex items-center gap-2">
                    <Progress value={leadScore} className="w-20 h-2" />
                    <span className="text-lg font-bold text-slate-800">{leadScore}%</span>
                  </div>
                </div>
                
                {/* Auto-save toggle */}
                <div className="flex items-center gap-2">
                  <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                  <span className="text-sm text-slate-600">Auto-save</span>
                </div>
                
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="px-8 py-4 bg-white/50 backdrop-blur-sm border-b border-white/20">
                <TabsList className="grid grid-cols-5 w-full bg-white/70 backdrop-blur-sm">
                  <TabsTrigger value="overview" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="details" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="followups" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Follow-ups
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Insights
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Activity
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-8">
                    <TabsContent value="overview" className="mt-0 space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <Card className="bg-white/70 backdrop-blur-sm border border-white/30">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <User className="h-5 w-5" />
                              Basic Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label htmlFor="fullName">Full Name *</Label>
                              <Input
                                id="fullName"
                                value={formData.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                className="bg-white/50 border-white/30"
                                placeholder="Enter full name"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="email">Email Address</Label>
                              <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="bg-white/50 border-white/30"
                                placeholder="Enter email address"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                className="bg-white/50 border-white/30"
                                placeholder="Enter phone number"
                              />
                            </div>
                          </CardContent>
                        </Card>

                        {/* Lead Classification */}
                        <Card className="bg-white/70 backdrop-blur-sm border border-white/30">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Target className="h-5 w-5" />
                              Lead Classification
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label htmlFor="source">Source</Label>
                              <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)}>
                                <SelectTrigger className="bg-white/50 border-white/30">
                                  <SelectValue placeholder="Select source" />
                                </SelectTrigger>
                                <SelectContent>
                                  {sourceOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label htmlFor="status">Status</Label>
                              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                                <SelectTrigger className="bg-white/50 border-white/30">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label htmlFor="stage">Stage</Label>
                              <Select value={formData.stage} onValueChange={(value) => handleInputChange('stage', value)}>
                                <SelectTrigger className="bg-white/50 border-white/30">
                                  <SelectValue placeholder="Select stage" />
                                </SelectTrigger>
                                <SelectContent>
                                  {stageOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Engagement Chart */}
                      {engagementData.length > 0 && (
                        <Card className="bg-white/70 backdrop-blur-sm border border-white/30">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <LineChart className="h-5 w-5" />
                              Engagement Timeline
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                              <RechartsLineChart data={engagementData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    borderRadius: '8px',
                                    backdropFilter: 'blur(10px)'
                                  }} 
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="engagement" 
                                  stroke="#6366f1" 
                                  strokeWidth={3}
                                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 6 }}
                                />
                              </RechartsLineChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    <TabsContent value="details" className="mt-0 space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="bg-white/70 backdrop-blur-sm border border-white/30">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Building className="h-5 w-5" />
                              Assignment & Location
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label htmlFor="associate">Associate</Label>
                              <Select value={formData.associate} onValueChange={(value) => handleInputChange('associate', value)}>
                                <SelectTrigger className="bg-white/50 border-white/30">
                                  <SelectValue placeholder="Select associate" />
                                </SelectTrigger>
                                <SelectContent>
                                  {associateOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label htmlFor="center">Center</Label>
                              <Select value={formData.center} onValueChange={(value) => handleInputChange('center', value)}>
                                <SelectTrigger className="bg-white/50 border-white/30">
                                  <SelectValue placeholder="Select center" />
                                </SelectTrigger>
                                <SelectContent>
                                  {centerOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label htmlFor="createdAt">Created Date</Label>
                              <Input
                                id="createdAt"
                                type="date"
                                value={formData.createdAt}
                                onChange={(e) => handleInputChange('createdAt', e.target.value)}
                                className="bg-white/50 border-white/30"
                              />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-white/70 backdrop-blur-sm border border-white/30">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="h-5 w-5" />
                              Notes & Remarks
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div>
                              <Label htmlFor="remarks">Remarks</Label>
                              <Textarea
                                id="remarks"
                                value={formData.remarks}
                                onChange={(e) => handleInputChange('remarks', e.target.value)}
                                className="bg-white/50 border-white/30 min-h-[120px]"
                                placeholder="Add any additional notes or remarks about this lead..."
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="followups" className="mt-0 space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(num => (
                          <Card key={num} className="bg-white/70 backdrop-blur-sm border border-white/30">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Follow-up {num}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <Label htmlFor={`followUp${num}Date`}>Date</Label>
                                <Input
                                  id={`followUp${num}Date`}
                                  type="date"
                                  value={formData[`followUp${num}Date` as keyof Lead] as string || ''}
                                  onChange={(e) => handleInputChange(`followUp${num}Date` as keyof Lead, e.target.value)}
                                  className="bg-white/50 border-white/30"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`followUp${num}Comments`}>Comments</Label>
                                <Textarea
                                  id={`followUp${num}Comments`}
                                  value={formData[`followUp${num}Comments` as keyof Lead] as string || ''}
                                  onChange={(e) => handleInputChange(`followUp${num}Comments` as keyof Lead, e.target.value)}
                                  className="bg-white/50 border-white/30"
                                  placeholder={`Add comments for follow-up ${num}...`}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="insights" className="mt-0 space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Source Distribution Chart */}
                        <Card className="bg-white/70 backdrop-blur-sm border border-white/30">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <PieChart className="h-5 w-5" />
                              Source Distribution
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                              <RechartsPieChart>
                                <Pie
                                  data={sourceDistribution}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  dataKey="value"
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                  {sourceDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        {/* Similar Leads */}
                        <Card className="bg-white/70 backdrop-blur-sm border border-white/30">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Users className="h-5 w-5" />
                              Similar Leads
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {similarLeads.length > 0 ? (
                              <div className="space-y-3">
                                {similarLeads.map(similarLead => (
                                  <div key={similarLead.id} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-gradient-to-br from-slate-500 to-slate-600 text-white text-xs">
                                        {similarLead.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">{similarLead.fullName}</p>
                                      <p className="text-xs text-slate-600">{similarLead.source} • {similarLead.status}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-600 text-center py-8">No similar leads found</p>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="activity" className="mt-0 space-y-6">
                      <Card className="bg-white/70 backdrop-blur-sm border border-white/30">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Activity Timeline
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {timelineData.length > 0 ? (
                            <div className="space-y-6">
                              {timelineData.map((activity, index) => (
                                <div key={index} className="flex items-start gap-4">
                                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                                    {activity.icon}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold text-slate-800">{activity.title}</h4>
                                      <Badge variant="outline" className="text-xs">
                                        {formatDate(activity.date)}
                                      </Badge>
                                    </div>
                                    <p className="text-slate-600 text-sm">{activity.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                              <p className="text-slate-600">No activity recorded yet</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </div>
                </ScrollArea>
              </div>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gradient-to-r from-slate-50/80 to-white/80 backdrop-blur-sm border-t border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                {hasUnsavedChanges && (
                  <>
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span>You have unsaved changes</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={isLoading || !formData.fullName.trim()}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {lead?.id && !lead.id.startsWith('new-') ? 'Update Lead' : 'Create Lead'}
                    </>
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