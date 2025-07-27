
import React, { useState, useEffect, useMemo } from 'react';
import { useLeads } from '@/contexts/LeadContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  Calendar,
  User,
  Building,
  MapPin,
  Clock,
  TrendingUp,
  Target,
  Flag,
  Star,
  ArrowUpDown
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Lead, SortConfig } from '@/contexts/LeadContext';

interface LeadsTableProps {
  onLeadClick: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
}

export function LeadsTable({ onLeadClick, onEditLead, onDeleteLead }: LeadsTableProps) {
  const { 
    filteredLeads, 
    loading, 
    page, 
    pageSize, 
    sortConfig, 
    setSortConfig,
    displayMode 
  } = useLeads();
  
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [localSortConfig, setLocalSortConfig] = useState<SortConfig | null>(sortConfig);

  useEffect(() => {
    setLocalSortConfig(sortConfig);
  }, [sortConfig]);

  // Paginate leads
  const paginatedLeads = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredLeads.slice(startIndex, endIndex);
  }, [filteredLeads, page, pageSize]);

  const handleSort = (key: keyof Lead) => {
    const newSortConfig: SortConfig = {
      key,
      direction: localSortConfig?.key === key && localSortConfig?.direction === 'asc' ? 'desc' : 'asc'
    };
    
    setLocalSortConfig(newSortConfig);
    setSortConfig(newSortConfig);
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === paginatedLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(paginatedLeads.map(lead => lead.id));
    }
  };

  const toggleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const getSortIcon = (key: keyof Lead) => {
    if (localSortConfig?.key !== key) {
      return <ArrowUpDown className="h-3 w-3 ml-1 text-gray-400" />;
    }
    return localSortConfig.direction === 'asc' 
      ? <ChevronUp className="h-3 w-3 ml-1" />
      : <ChevronDown className="h-3 w-3 ml-1" />;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getStatusVariant = (status: string) => {
    const variants: Record<string, any> = {
      'Hot': 'destructive',
      'Warm': 'warning',
      'Cold': 'secondary',
      'Converted': 'success',
      'Won': 'success',
      'Lost': 'destructive',
      'Open': 'default'
    };
    return variants[status] || 'default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50 border-b">
            <TableHead className="w-12">
              <Checkbox 
                checked={selectedLeads.length === paginatedLeads.length}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            
            <TableHead className="text-left">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('fullName')}
                className="h-8 px-0 font-medium hover:bg-transparent"
              >
                Name
                {getSortIcon('fullName')}
              </Button>
            </TableHead>
            
            <TableHead className="text-left">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('email')}
                className="h-8 px-0 font-medium hover:bg-transparent"
              >
                Email
                {getSortIcon('email')}
              </Button>
            </TableHead>
            
            <TableHead className="text-left">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('phone')}
                className="h-8 px-0 font-medium hover:bg-transparent"
              >
                Phone
                {getSortIcon('phone')}
              </Button>
            </TableHead>
            
            <TableHead className="text-left">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('source')}
                className="h-8 px-0 font-medium hover:bg-transparent"
              >
                Source
                {getSortIcon('source')}
              </Button>
            </TableHead>
            
            <TableHead className="text-left">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('associate')}
                className="h-8 px-0 font-medium hover:bg-transparent"
              >
                Associate
                {getSortIcon('associate')}
              </Button>
            </TableHead>
            
            <TableHead className="text-left">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('stage')}
                className="h-8 px-0 font-medium hover:bg-transparent"
              >
                Stage
                {getSortIcon('stage')}
              </Button>
            </TableHead>
            
            <TableHead className="text-left">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('status')}
                className="h-8 px-0 font-medium hover:bg-transparent"
              >
                Status
                {getSortIcon('status')}
              </Button>
            </TableHead>
            
            <TableHead className="text-left">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('createdAt')}
                className="h-8 px-0 font-medium hover:bg-transparent"
              >
                Created At
                {getSortIcon('createdAt')}
              </Button>
            </TableHead>
            
            <TableHead className="text-right w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {paginatedLeads.map((lead) => (
            <TableRow
              key={lead.id}
              className="hover:bg-gray-50/50 transition-colors cursor-pointer"
              onClick={() => onLeadClick(lead)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedLeads.includes(lead.id)}
                  onCheckedChange={() => toggleSelectLead(lead.id)}
                />
              </TableCell>
              
              <TableCell className="text-left">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 border-2 border-white shadow-md">
                    <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(lead.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900">{lead.fullName}</div>
                    {displayMode === 'detail' && lead.center && (
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {lead.center}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              
              <TableCell className="text-left">
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{lead.email}</span>
                </div>
              </TableCell>
              
              <TableCell className="text-left">
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{lead.phone}</span>
                </div>
              </TableCell>
              
              <TableCell className="text-left">
                <Badge variant="outline" className="text-xs">
                  {lead.source}
                </Badge>
              </TableCell>
              
              <TableCell className="text-left">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{lead.associate}</span>
                </div>
              </TableCell>
              
              <TableCell className="text-left">
                <Badge variant="outline" className="text-xs">
                  {lead.stage}
                </Badge>
              </TableCell>
              
              <TableCell className="text-left">
                <StatusBadge status={lead.status} size="sm" />
              </TableCell>
              
              <TableCell className="text-left">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-500">{formatDate(lead.createdAt)}</span>
                </div>
              </TableCell>
              
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onLeadClick(lead)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditLead(lead)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Lead
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDeleteLead(lead.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {paginatedLeads.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No leads found matching your criteria.</div>
        </div>
      )}
    </div>
  );
}
