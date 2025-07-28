
import React, { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLeads, type Lead } from '@/contexts/LeadContext';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Edit, 
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  User,
  MapPin,
  Target,
  Clock,
  Filter
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface SortConfig {
  key: keyof Lead;
  direction: 'asc' | 'desc';
}

export function LeadsTable() {
  const { 
    filteredLeads, 
    loading, 
    updateLead, 
    sortConfig, 
    setSortConfig,
    displayMode,
    settings 
  } = useLeads();

  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof Lead } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  // Initialize visible columns
  useEffect(() => {
    if (settings.visibleColumns.length > 0) {
      setVisibleColumns(settings.visibleColumns);
    } else if (filteredLeads.length > 0) {
      // Default visible columns for better performance
      setVisibleColumns(['fullName', 'email', 'phone', 'source', 'associate', 'stage', 'status', 'createdAt']);
    }
  }, [settings.visibleColumns, filteredLeads.length]);

  // Memoize sorted data for performance
  const sortedLeads = useMemo(() => {
    if (!sortConfig) return filteredLeads;
    
    return [...filteredLeads].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === bValue) return 0;
      
      const result = aValue > bValue ? 1 : -1;
      return sortConfig.direction === 'asc' ? result : -result;
    });
  }, [filteredLeads, sortConfig]);

  const handleSort = (key: keyof Lead) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleCellEdit = async (lead: Lead, field: keyof Lead, value: string) => {
    try {
      const updatedLead = { ...lead, [field]: value };
      await updateLead(updatedLead);
      setEditingCell(null);
      setEditValue('');
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(sortedLeads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads(prev => [...prev, leadId]);
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
    }
  };

  const getSortIcon = (key: keyof Lead) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'hot': return 'bg-red-100 text-red-800 border-red-200';
      case 'warm': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cold': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'converted': return 'bg-green-100 text-green-800 border-green-200';
      case 'lost': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin h-10 w-10 rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading leads...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Leads Management</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {sortedLeads.length} leads
            </span>
            {selectedLeads.length > 0 && (
              <Badge variant="secondary">
                {selectedLeads.length} selected
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedLeads.length === sortedLeads.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                {visibleColumns.map(column => (
                  <TableHead 
                    key={column}
                    className="cursor-pointer hover:bg-muted/50 text-left"
                    onClick={() => handleSort(column as keyof Lead)}
                  >
                    <div className="flex items-center gap-2 justify-start">
                      <span className="capitalize">{column.replace(/([A-Z])/g, ' $1').trim()}</span>
                      {getSortIcon(column as keyof Lead)}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLeads.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedLeads.includes(lead.id)}
                      onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                    />
                  </TableCell>
                  {visibleColumns.map(column => (
                    <TableCell key={column} className="text-left align-top">
                      {editingCell?.id === lead.id && editingCell.field === column ? (
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleCellEdit(lead, column as keyof Lead, editValue)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleCellEdit(lead, column as keyof Lead, editValue);
                            }
                          }}
                          className="h-8"
                          autoFocus
                        />
                      ) : (
                        <div
                          className="min-h-[32px] flex items-center cursor-pointer hover:bg-muted/50 rounded px-2 py-1 text-left"
                          onClick={() => {
                            setEditingCell({ id: lead.id, field: column as keyof Lead });
                            setEditValue(String(lead[column as keyof Lead] || ''));
                          }}
                        >
                          {column === 'status' ? (
                            <StatusBadge status={lead.status} />
                          ) : column === 'stage' ? (
                            <Badge variant="outline" className="text-left">
                              {lead.stage}
                            </Badge>
                          ) : column === 'createdAt' ? (
                            <span className="text-left">{formatDate(lead.createdAt)}</span>
                          ) : (
                            <span className="text-left">{lead[column as keyof Lead] || '-'}</span>
                          )}
                        </div>
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingCell({ id: lead.id, field: 'fullName' });
                        setEditValue(lead.fullName || '');
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
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

export default LeadsTable;
