
import React, { useState, useCallback, useEffect } from 'react';
import { useLeads, Lead, SortConfig } from '@/contexts/LeadContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  Mail 
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDate } from '@/lib/utils';

interface LeadsTableProps {
  onLeadClick?: (lead: Lead) => void;
  onEditLead?: (lead: Lead) => void;
  onDeleteLead?: (leadId: string) => void;
}

export function LeadsTable({ onLeadClick, onEditLead, onDeleteLead }: LeadsTableProps) {
  const { 
    filteredLeads, 
    loading, 
    sortConfig, 
    setSortConfig, 
    page, 
    pageSize, 
    displayMode,
    settings 
  } = useLeads();

  // Calculate pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  const handleSort = (key: keyof Lead) => {
    setSortConfig(prev => {
      if (prev && prev.key === key) {
        return prev.direction === 'asc' 
          ? { key, direction: 'desc' } 
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (key: keyof Lead) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const getStatusColor = (status: string, stage: string) => {
    if (stage === 'Membership Sold') return 'bg-green-100 text-green-800';
    if (status === 'Hot') return 'bg-red-100 text-red-800';
    if (status === 'Warm') return 'bg-yellow-100 text-yellow-800';
    if (status === 'Cold') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Leads ({filteredLeads.length})</span>
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredLeads.length)} of {filteredLeads.length}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('fullName')}
                >
                  <div className="flex items-center gap-2">
                    Full Name
                    {getSortIcon('fullName')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-2">
                    Email
                    {getSortIcon('email')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('phone')}
                >
                  <div className="flex items-center gap-2">
                    Phone
                    {getSortIcon('phone')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-left"
                  onClick={() => handleSort('source')}
                >
                  <div className="flex items-center gap-2">
                    Source
                    {getSortIcon('source')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-left"
                  onClick={() => handleSort('associate')}
                >
                  <div className="flex items-center gap-2">
                    Associate
                    {getSortIcon('associate')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-left"
                  onClick={() => handleSort('stage')}
                >
                  <div className="flex items-center gap-2">
                    Stage
                    {getSortIcon('stage')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-left"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {getSortIcon('status')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-left"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-2">
                    Created At
                    {getSortIcon('createdAt')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLeads.map((lead) => (
                <TableRow 
                  key={lead.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => onLeadClick?.(lead)}
                >
                  <TableCell className="font-medium">{lead.fullName}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.phone}</TableCell>
                  <TableCell className="text-left">{lead.source}</TableCell>
                  <TableCell className="text-left">{lead.associate}</TableCell>
                  <TableCell className="text-left">
                    <StatusBadge status={lead.stage} />
                  </TableCell>
                  <TableCell className="text-left">
                    <Badge className={getStatusColor(lead.status, lead.stage)}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left">{formatDate(lead.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onLeadClick?.(lead)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditLead?.(lead)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDeleteLead?.(lead.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
