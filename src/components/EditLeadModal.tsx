import React, { useState, useEffect } from 'react';
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
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { FollowUpCard } from './FollowUpCard';

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
  const { updateLead, addLead, sourceOptions, associateOptions, centerOptions, stageOptions, statusOptions } = useLeads();
  const [formData, setFormData] = useState<Partial<Lead>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const isNewLead = lead?.id?.startsWith('new-');
  const isBulkEdit = selectedLeads.length > 0 && !lead;

  useEffect(() => {
    if (lead) {
      setFormData({ ...lead });
    } else {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        source: 'Website',
        associate: '',
        status: 'Open',
        stage: 'New Enquiry',
        center: '',
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
      });
    }
  }, [lead]);

  const handleInputChange = (field: keyof Lead, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName?.trim()) {
      toast.error('Full name is required');
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
        toast.success('Lead added successfully');
      } else if (lead) {
        const updatedLead: Lead = {
          ...lead,
          ...formData
        } as Lead;
        
        await updateLead(updatedLead);
        toast.success('Lead updated successfully');
      }

      if (clearSelection) {
        clearSelection();
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving lead:', error);
      toast.error('Failed to save lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Won': return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'Lost': return <X className="h-4 w-4 text-red-500" />;
      case 'Open': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'Trial Completed': return <Star className="h-4 w-4 text-amber-500" />;
      case 'Trial Scheduled': return <Calendar className="h-4 w-4 text-purple-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-8 py-6 border-b border-white/10 bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-700" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-semibold text-gray-900">
                    {isNewLead ? 'Add New Lead' : isBulkEdit ? `Edit ${selectedLeads.length} Leads` : 'Edit Lead'}
                  </DialogTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {isNewLead ? 'Create a new lead record' : isBulkEdit ? 'Update multiple leads at once' : 'Update lead information and track progress'}
                  </p>
                </div>
              </div>
              
              {!isNewLead && !isBulkEdit && formData.status && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 backdrop-blur-sm border border-white/20">
                  {getStatusIcon(formData.status)}
                  <span className="text-sm font-medium text-gray-700">{formData.status}</span>
                </div>
              )}
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="px-8 py-4 border-b border-white/10 bg-white/20 backdrop-blur-sm">
                <TabsList className="bg-white/30 backdrop-blur-sm border border-white/20 p-1 rounded-xl">
                  <TabsTrigger 
                    value="basic" 
                    className="data-[state=active]:bg-white/80 data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-lg px-6 py-2 text-gray-700 font-medium transition-all"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger 
                    value="details" 
                    className="data-[state=active]:bg-white/80 data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-lg px-6 py-2 text-gray-700 font-medium transition-all"
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger 
                    value="followups" 
                    className="data-[state=active]:bg-white/80 data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-lg px-6 py-2 text-gray-700 font-medium transition-all"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Follow-ups
                    {getFollowUps().length > 0 && (
                      <Badge className="ml-2 bg-white/50 text-gray-700 border-white/30 text-xs">
                        {getFollowUps().length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1 px-8 py-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <TabsContent value="basic" className="mt-0 space-y-6">
                    <Card className="bg-white/40 backdrop-blur-sm border border-white/30 shadow-lg">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Personal Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                              Full Name *
                            </Label>
                            <Input
                              id="fullName"
                              value={formData.fullName || ''}
                              onChange={(e) => handleInputChange('fullName', e.target.value)}
                              placeholder="Enter full name"
                              className="bg-white/60 backdrop-blur-sm border border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/20 rounded-lg"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                              Email Address
                            </Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                              <Input
                                id="email"
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="Enter email address"
                                className="pl-10 bg-white/60 backdrop-blur-sm border border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/20 rounded-lg"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                              Phone Number
                            </Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                              <Input
                                id="phone"
                                value={formData.phone || ''}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                placeholder="Enter phone number"
                                className="pl-10 bg-white/60 backdrop-blur-sm border border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/20 rounded-lg"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="createdAt" className="text-sm font-medium text-gray-700">
                              Created Date
                            </Label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                              <Input
                                id="createdAt"
                                type="date"
                                value={formData.createdAt || ''}
                                onChange={(e) => handleInputChange('createdAt', e.target.value)}
                                className="pl-10 bg-white/60 backdrop-blur-sm border border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/20 rounded-lg"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="details" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="bg-white/40 backdrop-blur-sm border border-white/30 shadow-lg">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Tag className="h-5 w-5" />
                            Lead Classification
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="source" className="text-sm font-medium text-gray-700">
                              Lead Source
                            </Label>
                            <Select value={formData.source || ''} onValueChange={(value) => handleInputChange('source', value)}>
                              <SelectTrigger className="bg-white/60 backdrop-blur-sm border border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/20 rounded-lg">
                                <SelectValue placeholder="Select source" />
                              </SelectTrigger>
                              <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/30 shadow-xl">
                                {sourceOptions.map(source => (
                                  <SelectItem key={source} value={source} className="hover:bg-white/50">
                                    {source}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                              Status
                            </Label>
                            <Select value={formData.status || ''} onValueChange={(value) => handleInputChange('status', value)}>
                              <SelectTrigger className="bg-white/60 backdrop-blur-sm border border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/20 rounded-lg">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/30 shadow-xl">
                                {statusOptions.map(status => (
                                  <SelectItem key={status} value={status} className="hover:bg-white/50">
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
                            <Label htmlFor="stage" className="text-sm font-medium text-gray-700">
                              Current Stage
                            </Label>
                            <Select value={formData.stage || ''} onValueChange={(value) => handleInputChange('stage', value)}>
                              <SelectTrigger className="bg-white/60 backdrop-blur-sm border border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/20 rounded-lg">
                                <SelectValue placeholder="Select stage" />
                              </SelectTrigger>
                              <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/30 shadow-xl">
                                {stageOptions.map(stage => (
                                  <SelectItem key={stage} value={stage} className="hover:bg-white/50">
                                    {stage}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/40 backdrop-blur-sm border border-white/30 shadow-lg">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Building className="h-5 w-5" />
                            Assignment & Location
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="associate" className="text-sm font-medium text-gray-700">
                              Assigned Associate
                            </Label>
                            <Select value={formData.associate || ''} onValueChange={(value) => handleInputChange('associate', value)}>
                              <SelectTrigger className="bg-white/60 backdrop-blur-sm border border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/20 rounded-lg">
                                <SelectValue placeholder="Select associate" />
                              </SelectTrigger>
                              <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/30 shadow-xl">
                                {associateOptions.map(associate => (
                                  <SelectItem key={associate} value={associate} className="hover:bg-white/50">
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4" />
                                      {associate}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="center" className="text-sm font-medium text-gray-700">
                              Center/Location
                            </Label>
                            <Select value={formData.center || ''} onValueChange={(value) => handleInputChange('center', value)}>
                              <SelectTrigger className="bg-white/60 backdrop-blur-sm border border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/20 rounded-lg">
                                <SelectValue placeholder="Select center" />
                              </SelectTrigger>
                              <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/30 shadow-xl">
                                {centerOptions.map(center => (
                                  <SelectItem key={center} value={center} className="hover:bg-white/50">
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4" />
                                      {center}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="remarks" className="text-sm font-medium text-gray-700">
                              Remarks & Notes
                            </Label>
                            <Textarea
                              id="remarks"
                              value={formData.remarks || ''}
                              onChange={(e) => handleInputChange('remarks', e.target.value)}
                              placeholder="Add any additional notes or remarks..."
                              rows={4}
                              className="bg-white/60 backdrop-blur-sm border border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/20 rounded-lg resize-none"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="followups" className="mt-0 space-y-6">
                    <Card className="bg-white/40 backdrop-blur-sm border border-white/30 shadow-lg">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          Follow-up History
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {getFollowUps().length > 0 ? (
                          <div className="space-y-4">
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
                          <div className="text-center py-8">
                            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 font-medium">No follow-ups recorded yet</p>
                            <p className="text-sm text-gray-500 mt-1">Follow-up activities will appear here once added</p>
                          </div>
                        )}

                        <Separator className="my-6 bg-white/30" />

                        <div className="space-y-6">
                          <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Follow-up Activities
                          </h4>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map((num) => (
                              <div key={num} className="space-y-4 p-4 rounded-lg bg-white/30 backdrop-blur-sm border border-white/20">
                                <h5 className="font-medium text-gray-800">Follow-up #{num}</h5>
                                
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-gray-700">Date</Label>
                                  <Input
                                    type="date"
                                    value={formData[`followUp${num}Date` as keyof Lead] as string || ''}
                                    onChange={(e) => handleInputChange(`followUp${num}Date` as keyof Lead, e.target.value)}
                                    className="bg-white/60 backdrop-blur-sm border border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/20 rounded-lg"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-gray-700">Comments</Label>
                                  <Textarea
                                    value={formData[`followUp${num}Comments` as keyof Lead] as string || ''}
                                    onChange={(e) => handleInputChange(`followUp${num}Comments` as keyof Lead, e.target.value)}
                                    placeholder="Enter follow-up notes..."
                                    rows={3}
                                    className="bg-white/60 backdrop-blur-sm border border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/20 rounded-lg resize-none"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </form>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-white/10 bg-gradient-to-r from-white/30 to-white/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {isNewLead ? 'All fields marked with * are required' : 'Changes will be saved immediately'}
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-white/80 text-gray-700 rounded-lg px-6"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white border-0 rounded-lg px-6 shadow-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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