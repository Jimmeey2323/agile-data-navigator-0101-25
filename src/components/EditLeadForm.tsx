
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Lead } from '@/services/googleSheets';
import { useLeads } from '@/contexts/LeadContext';

interface EditLeadFormProps {
  lead: Lead;
  onClose: () => void;
}

export const EditLeadForm: React.FC<EditLeadFormProps> = ({ lead, onClose }) => {
  const { updateLead } = useLeads();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<Lead>({
    defaultValues: lead,
  });

  const onSubmit = async (data: Lead) => {
    console.log('=== Form submission started ===');
    console.log('Form data:', data);
    console.log('Is form dirty:', isDirty);
    
    if (!isDirty) {
      console.log('No changes detected, closing modal');
      onClose();
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Ensure we preserve the original ID
      const updatedLead = {
        ...data,
        id: lead.id,
      };
      
      console.log('Calling updateLead with:', updatedLead);
      await updateLead(updatedLead);
      console.log('Update successful, closing modal');
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      // Error handling is done in the context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            {...register('fullName', { required: 'Full name is required' })}
          />
          {errors.fullName && (
            <p className="text-sm text-red-500 mt-1">{errors.fullName.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            {...register('phone')}
          />
        </div>
        
        <div>
          <Label htmlFor="source">Source</Label>
          <Input
            id="source"
            {...register('source')}
          />
        </div>
        
        <div>
          <Label htmlFor="associate">Associate</Label>
          <Input
            id="associate"
            {...register('associate')}
          />
        </div>
        
        <div>
          <Label htmlFor="status">Status</Label>
          <Input
            id="status"
            {...register('status')}
          />
        </div>
        
        <div>
          <Label htmlFor="stage">Stage</Label>
          <Input
            id="stage"
            {...register('stage')}
          />
        </div>
        
        <div>
          <Label htmlFor="center">Center</Label>
          <Input
            id="center"
            {...register('center')}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          {...register('remarks')}
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="followUp1Date">Follow Up 1 Date</Label>
          <Input
            id="followUp1Date"
            type="date"
            {...register('followUp1Date')}
          />
        </div>
        
        <div>
          <Label htmlFor="followUp1Comments">Follow Up 1 Comments</Label>
          <Textarea
            id="followUp1Comments"
            {...register('followUp1Comments')}
            rows={2}
          />
        </div>
        
        <div>
          <Label htmlFor="followUp2Date">Follow Up 2 Date</Label>
          <Input
            id="followUp2Date"
            type="date"
            {...register('followUp2Date')}
          />
        </div>
        
        <div>
          <Label htmlFor="followUp2Comments">Follow Up 2 Comments</Label>
          <Textarea
            id="followUp2Comments"
            {...register('followUp2Comments')}
            rows={2}
          />
        </div>
        
        <div>
          <Label htmlFor="followUp3Date">Follow Up 3 Date</Label>
          <Input
            id="followUp3Date"
            type="date"
            {...register('followUp3Date')}
          />
        </div>
        
        <div>
          <Label htmlFor="followUp3Comments">Follow Up 3 Comments</Label>
          <Textarea
            id="followUp3Comments"
            {...register('followUp3Comments')}
            rows={2}
          />
        </div>
        
        <div>
          <Label htmlFor="followUp4Date">Follow Up 4 Date</Label>
          <Input
            id="followUp4Date"
            type="date"
            {...register('followUp4Date')}
          />
        </div>
        
        <div>
          <Label htmlFor="followUp4Comments">Follow Up 4 Comments</Label>
          <Textarea
            id="followUp4Comments"
            {...register('followUp4Comments')}
            rows={2}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};
