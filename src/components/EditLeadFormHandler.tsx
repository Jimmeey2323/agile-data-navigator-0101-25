import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useLeads } from '@/contexts/LeadContext';
import { Lead } from '@/services/googleSheets';
import { toast } from 'sonner';
import { Calendar, User, Building, Phone, Mail, MessageSquare, Clock, FileText, TrendingUp } from 'lucide-react';

interface EditLeadFormHandlerProps {
  lead: Lead | null;
  onClose: () => void;
  selectedLeads?: string[];
  clearSelection?: () => void;
}

export const EditLeadFormHandler: React.FC<EditLeadFormHandlerProps> = ({ 
  lead, 
  onClose, 
  selectedLeads = [], 
  clearSelection 
}) => {
  const { updateLead, addLead } = useLeads();
  const isNewLead = lead?.id?.startsWith('new-');
  const isBulkEdit = selectedLeads.length > 0 && !lead;

  const { register, handleSubmit, setValue, watch, formState: { isDirty, isSubmitting } } = useForm({
    defaultValues: {
      fullName: lead?.fullName || '',
      email: lead?.email || '',
      phone: lead?.phone || '',
      source: lead?.source || 'Website',
      associate: lead?.associate || '',
      status: lead?.status || 'New',
      stage: lead?.stage || 'Initial Contact',
      center: lead?.center || '',
      remarks: lead?.remarks || '',
      ...lead
    }
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === '-') return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const onSubmit = async (data: any) => {
    console.log('Form submission started', { data, isNewLead, isBulkEdit });
    
    try {
      if (isBulkEdit) {
        toast.info('Bulk edit functionality not yet implemented');
        return;
      }

      // Remove validation requirements - allow empty or "-" values
      const cleanedData = {
        ...data,
        email: data.email || '',
        fullName: data.fullName || 'Unknown'
      };

      if (isNewLead) {
        console.log('Creating new lead...');
        await addLead(cleanedData as Lead);
        toast.success('Lead created successfully!');
      } else if (lead) {
        console.log('Updating existing lead...', lead.id);
        const updatedLead = { ...lead, ...cleanedData };
        await updateLead(updatedLead);
        toast.success('Lead updated successfully!');
      }

      if (clearSelection) clearSelection();
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to save changes. Please try again.');
    }
  };

  const handleCancel = () => {
    console.log('Form cancelled');
    if (clearSelection) clearSelection();
    onClose();
  };

  // Set default values for form fields
  React.useEffect(() => {
    if (lead) {
      setValue('source', lead.source || 'Website');
      setValue('status', lead.status || 'New');
      setValue('stage', lead.stage || 'Initial Contact');
    }
  }, [lead, setValue]);

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-blue-50/30">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm border">
            <TabsTrigger value="basic" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <User className="w-4 h-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="followup" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4" />
              Follow-ups
            </TabsTrigger>
            <TabsTrigger value="additional" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4" />
              Additional Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 bg-white rounded-lg p-6 shadow-sm border mt-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  placeholder="Enter full name"
                  className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="Enter email (optional)"
                  className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Phone className="w-4 h-4" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="Enter phone number"
                  className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <TrendingUp className="w-4 h-4" />
                  Source
                </Label>
                <Select 
                  onValueChange={(value) => setValue('source', value)} 
                  value={watch('source') || lead?.source || 'Website'}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg">
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Advertisement">Advertisement</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="associate" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="w-4 h-4" />
                  Associate
                </Label>
                <Input
                  id="associate"
                  {...register('associate')}
                  placeholder="Enter associate name"
                  className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="center" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Building className="w-4 h-4" />
                  Center
                </Label>
                <Input
                  id="center"
                  {...register('center')}
                  placeholder="Enter center"
                  className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                <Select 
                  onValueChange={(value) => setValue('status', value)} 
                  value={watch('status') || lead?.status || 'New'}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg">
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Hot">Hot</SelectItem>
                    <SelectItem value="Warm">Warm</SelectItem>
                    <SelectItem value="Cold">Cold</SelectItem>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Converted">Converted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage" className="text-sm font-medium text-gray-700">Stage</Label>
                <Select 
                  onValueChange={(value) => setValue('stage', value)} 
                  value={watch('stage') || lead?.stage || 'Initial Contact'}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg">
                    <SelectItem value="Initial Contact">Initial Contact</SelectItem>
                    <SelectItem value="Trial Scheduled">Trial Scheduled</SelectItem>
                    <SelectItem value="Trial Completed">Trial Completed</SelectItem>
                    <SelectItem value="Shared Pricing & Schedule Details">Shared Pricing & Schedule Details</SelectItem>
                    <SelectItem value="Membership Sold">Membership Sold</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FileText className="w-4 h-4" />
                Remarks
              </Label>
              <Textarea
                id="remarks"
                {...register('remarks')}
                placeholder="Enter remarks"
                rows={3}
                className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </TabsContent>

          <TabsContent value="followup" className="space-y-6 bg-white rounded-lg p-6 shadow-sm border mt-4">
            <div className="grid grid-cols-1 gap-8">
              {[1, 2, 3, 4].map((num) => {
                const dateKey = `followUp${num}Date` as keyof Lead;
                const commentsKey = `followUp${num}Comments` as keyof Lead;
                const date = lead?.[dateKey];
                const comments = lead?.[commentsKey];
                
                return (
                  <div key={num} className="border-2 border-gray-100 rounded-xl p-6 bg-gradient-to-r from-gray-50 to-blue-50/30">
                    <div className="flex items-center gap-3 mb-4">
                      <MessageSquare className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-semibold text-lg text-gray-800">Follow-up {num}</h3>
                      {date && date !== '-' && (
                        <Badge variant="premium" className="flex items-center gap-1 ml-auto">
                          <Calendar className="w-3 h-3" />
                          {formatDate(date)}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor={commentsKey} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <MessageSquare className="w-4 h-4" />
                        Comments
                      </Label>
                      <Textarea
                        id={commentsKey}
                        {...register(commentsKey)}
                        placeholder="Enter follow-up comments"
                        defaultValue={comments}
                        rows={3}
                        className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="additional" className="space-y-6 bg-white rounded-lg p-6 shadow-sm border mt-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="createdAt" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4" />
                  Created Date
                </Label>
                <Input
                  id="createdAt"
                  type="date"
                  {...register('createdAt')}
                  defaultValue={lead?.createdAt}
                  className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sourceId" className="text-sm font-medium text-gray-700">Source ID</Label>
                <Input
                  id="sourceId"
                  {...register('Source ID')}
                  placeholder="Source ID"
                  defaultValue={lead?.["Source ID"]}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="memberId" className="text-sm font-medium text-gray-700">Member ID</Label>
                <Input
                  id="memberId"
                  {...register('Member ID')}
                  placeholder="Member ID"
                  defaultValue={lead?.["Member ID"]}
                  readOnly
                  className="bg-gray-50 text-center"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="convertedAt" className="text-sm font-medium text-gray-700">Converted To Customer At</Label>
                <Input
                  id="convertedAt"
                  {...register('Converted To Customer At')}
                  placeholder="Conversion date"
                  defaultValue={lead?.["Converted To Customer At"]}
                  className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="classType" className="text-sm font-medium text-gray-700">Class Type</Label>
                <Input
                  id="classType"
                  {...register('Class Type')}
                  placeholder="Class type"
                  defaultValue={lead?.["Class Type"]}
                  className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hostId" className="text-sm font-medium text-gray-700">Host ID</Label>
                <Input
                  id="hostId"
                  {...register('Host ID')}
                  placeholder="Host ID"
                  defaultValue={lead?.["Host ID"]}
                  readOnly
                  className="bg-gray-50 text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="channel" className="text-sm font-medium text-gray-700">Channel</Label>
                <Input
                  id="channel"
                  {...register('Channel')}
                  placeholder="Channel"
                  defaultValue={lead?.["Channel"]}
                  readOnly
                  className="bg-gray-50 text-center"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="period" className="text-sm font-medium text-gray-700">Period</Label>
                <Input
                  id="period"
                  {...register('Period')}
                  placeholder="Period"
                  defaultValue={lead?.["Period"]}
                  readOnly
                  className="bg-gray-50 text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="purchasesMade" className="text-sm font-medium text-gray-700">Purchases Made</Label>
                <Input
                  id="purchasesMade"
                  {...register('Purchases Made')}
                  placeholder="Number of purchases"
                  defaultValue={lead?.["Purchases Made"]}
                  readOnly
                  className="bg-gray-50 text-center"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ltv" className="text-sm font-medium text-gray-700">LTV</Label>
                <Input
                  id="ltv"
                  {...register('LTV')}
                  placeholder="Lifetime value"
                  defaultValue={lead?.["LTV"]}
                  readOnly
                  className="bg-gray-50 text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="visits" className="text-sm font-medium text-gray-700">Visits</Label>
                <Input
                  id="visits"
                  {...register('Visits')}
                  placeholder="Number of visits"
                  defaultValue={lead?.["Visits"]}
                  readOnly
                  className="bg-gray-50 text-center"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trialStatus" className="text-sm font-medium text-gray-700">Trial Status</Label>
                <Input
                  id="trialStatus"
                  {...register('Trial Status')}
                  placeholder="Trial status"
                  defaultValue={lead?.["Trial Status"]}
                  readOnly
                  className="bg-gray-50 text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="conversionStatus" className="text-sm font-medium text-gray-700">Conversion Status</Label>
                <Input
                  id="conversionStatus"
                  {...register('Conversion Status')}
                  placeholder="Conversion status"
                  defaultValue={lead?.["Conversion Status"]}
                  readOnly
                  className="bg-gray-50 text-center"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retentionStatus" className="text-sm font-medium text-gray-700">Retention Status</Label>
                <Input
                  id="retentionStatus"
                  {...register('Retention Status')}
                  placeholder="Retention status"
                  defaultValue={lead?.["Retention Status"]}
                  readOnly
                  className="bg-gray-50 text-center"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex flex-col-reverse sm:flex-row sm:space-x-2 p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50/30 flex items-center justify-between sm:justify-between flex-wrap gap-3 rounded-b-lg">
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 text-white font-medium px-6 py-2"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2"
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
