
import React, { useState, useEffect } from 'react';
import { useLeads } from '@/contexts/LeadContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedBadge } from '@/components/ui/enhanced-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpDown, ArrowUp, ArrowDown, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Lead, SortConfig } from '@/contexts/LeadContext';

export const LeadsTable = () => {
  const { 
    filteredLeads, 
    loading, 
    page, 
    setPage, 
    pageSize, 
    totalPages, 
    sortConfig, 
    setSortConfig,
    displayMode 
  } = useLeads();

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Calculate pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  const handleSort = (key: keyof Lead) => {
    setSortConfig((prev: SortConfig | null) => {
      if (prev?.key === key) {
        return prev.direction === 'asc' 
          ? { key, direction: 'desc' } 
          : { key, direction: 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (key: keyof Lead) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditModalOpen(true);
  };

  const getStatusVariant = (status: string) => {
    const statusMap: Record<string, string> = {
      'Hot': 'hot',
      'Warm': 'warm',
      'Cold': 'cold',
      'Won': 'won',
      'Converted': 'converted',
      'Lost': 'lost',
      'New': 'new',
      'Contacted': 'contacted',
      'Qualified': 'qualified',
      'Nurturing': 'nurturing',
      'Proposal': 'proposalStage',
      'Negotiation': 'negotiation',
      'Disqualified': 'disqualified',
      'Unresponsive': 'unresponsive',
      'Rejected': 'rejected'
    };
    return statusMap[status] || 'default';
  };

  const getSourceVariant = (source: string) => {
    const sourceMap: Record<string, string> = {
      'Website': 'website',
      'Website Form': 'websiteform',
      'Referral': 'referral',
      'Social Media': 'social',
      'Instagram': 'instagram',
      'Facebook': 'facebook',
      'Twitter': 'twitter',
      'LinkedIn': 'linkedin',
      'YouTube': 'youtube',
      'Event': 'event',
      'Cold Call': 'coldcall',
      'Email Campaign': 'email',
      'Partner': 'partner',
      'Advertisement': 'advertisement',
      'Walk-in': 'walkin'
    };
    return sourceMap[source] || 'other';
  };

  const getStageVariant = (stage: string) => {
    const stageMap: Record<string, string> = {
      'New Enquiry': 'newenquiry',
      'Initial Contact': 'initialcontact',
      'Follow-up': 'followup',
      'Demo': 'demo',
      'Trial Scheduled': 'trialscheduled',
      'Trial Completed': 'trialcompleted',
      'Proposal': 'proposal',
      'Negotiation': 'negotiationStage',
      'Membership Sold': 'membershipsold',
      'Closed Won': 'closedwon',
      'Not Interested': 'notinterested',
      'Closed Lost': 'closedlost'
    };
    return stageMap[stage] || 'default';
  };

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger a refresh if needed
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading leads...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads Table</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('name')}
                    className="h-auto p-0 font-semibold"
                  >
                    Name
                    {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead className="w-[200px]">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('email')}
                    className="h-auto p-0 font-semibold"
                  >
                    Email
                    {getSortIcon('email')}
                  </Button>
                </TableHead>
                <TableHead className="w-[150px]">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('phone')}
                    className="h-auto p-0 font-semibold"
                  >
                    Phone
                    {getSortIcon('phone')}
                  </Button>
                </TableHead>
                <TableHead className="w-[120px] text-left">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('source')}
                    className="h-auto p-0 font-semibold"
                  >
                    Source
                    {getSortIcon('source')}
                  </Button>
                </TableHead>
                <TableHead className="w-[120px] text-left">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('associate')}
                    className="h-auto p-0 font-semibold"
                  >
                    Associate
                    {getSortIcon('associate')}
                  </Button>
                </TableHead>
                <TableHead className="w-[120px] text-left">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('stage')}
                    className="h-auto p-0 font-semibold"
                  >
                    Stage
                    {getSortIcon('stage')}
                  </Button>
                </TableHead>
                <TableHead className="w-[120px] text-left">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('status')}
                    className="h-auto p-0 font-semibold"
                  >
                    Status
                    {getSortIcon('status')}
                  </Button>
                </TableHead>
                <TableHead className="w-[120px] text-left">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('createdAt')}
                    className="h-auto p-0 font-semibold"
                  >
                    Created At
                    {getSortIcon('createdAt')}
                  </Button>
                </TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLeads.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.phone}</TableCell>
                  <TableCell className="text-left">
                    <EnhancedBadge 
                      variant={getSourceVariant(lead.source)}
                      badgeType="source"
                      value={lead.source}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell className="text-left">{lead.associate}</TableCell>
                  <TableCell className="text-left">
                    <EnhancedBadge 
                      variant={getStageVariant(lead.stage)}
                      badgeType="stage"
                      value={lead.stage}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell className="text-left">
                    <EnhancedBadge 
                      variant={getStatusVariant(lead.status)}
                      badgeType="status"
                      value={lead.status}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell className="text-left">
                    {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditLead(lead)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredLeads.length)} of {filteredLeads.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(i + 1)}
                  className="w-8"
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
