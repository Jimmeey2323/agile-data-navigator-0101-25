import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Copy,
  MoreHorizontal,
  FileText,
  Filter,
  Columns,
  Eye,
  EyeOff
} from "lucide-react"
import { formatDate } from '@/lib/utils';
import { useLeads } from '@/contexts/LeadContext';
import { EnhancedBadge } from '@/components/ui/enhanced-badge';

interface DataTableColumnHeaderProps {
  column: {
    id: string;
    title: string;
  };
  onSort: (columnId: string) => void;
  sortable?: boolean;
}

interface Column {
  key: string;
  label: string;
  width?: string;
}

export function LeadsTable() {
  const { 
    leads, 
    filteredLeads, 
    loading, 
    error, 
    filters, 
    setFilters, 
    updateLead, 
    deleteLead: handleDeleteLead, 
    page, 
    setPage, 
    pageSize, 
    setPageSize, 
    totalPages, 
    sortConfig, 
    setSortConfig, 
    settings, 
    updateSettings 
  } = useLeads();
  
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [columnFilter, setColumnFilter] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<Column[]>([]);
  
  const columns: Column[] = useMemo(() => [
    { key: 'fullName', label: 'Full Name', width: 'w-[200px]' },
    { key: 'email', label: 'Email', width: 'w-[240px]' },
    { key: 'phone', label: 'Phone', width: 'w-[140px]' },
    { key: 'source', label: 'Source', width: 'w-[160px]' },
    { key: 'status', label: 'Status', width: 'w-[120px]' },
    { key: 'stage', label: 'Stage', width: 'w-[160px]' },
    { key: 'associate', label: 'Associate', width: 'w-[160px]' },
    { key: 'center', label: 'Center', width: 'w-[160px]' },
    { key: 'createdAt', label: 'Created At', width: 'w-[160px]' },
  ], []);
  
  // Initialize visible columns from settings or use default columns
  useEffect(() => {
    if (settings.visibleColumns && settings.visibleColumns.length > 0) {
      setVisibleColumns(columns.filter(col => settings.visibleColumns.includes(col.key)));
    } else {
      setVisibleColumns(columns);
    }
  }, [columns, settings.visibleColumns]);
  
  const handleVisibleColumnsChange = (newVisibleColumns: string[]) => {
    const updatedColumns = columns.filter(col => newVisibleColumns.includes(col.key));
    setVisibleColumns(updatedColumns);
    updateSettings({ visibleColumns: newVisibleColumns });
  };
  
  const paginatedLeads = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredLeads.slice(start, end);
  }, [filteredLeads, page, pageSize]);
  
  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev =>
      prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
    );
  };
  
  const handleSelectAll = (checked: boolean) => {
    setSelectedLeads(checked ? paginatedLeads.map(lead => lead.id) : []);
  };
  
  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      } else {
        return { key, direction: 'asc' };
      }
    });
  };
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-2">
        <Input
          placeholder="Filter columns..."
          value={columnFilter}
          onChange={(event) => setColumnFilter(event.target.value)}
          className="max-w-[200px]"
        />
        <div className="flex items-center space-x-2">
          <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <Columns className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-2">
              {columns
                .filter(column =>
                  column.label.toLowerCase().includes(columnFilter.toLowerCase())
                )
                .map(column => {
                  return (
                    <div key={column.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={column.key}
                        checked={visibleColumns.find(col => col.key === column.key) !== undefined}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleVisibleColumnsChange([...visibleColumns.map(col => col.key), column.key]);
                          } else {
                            handleVisibleColumnsChange(visibleColumns.filter(col => col.key !== column.key).map(col => col.key));
                          }
                        }}
                      />
                      <Label htmlFor={column.key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {column.label}
                      </Label>
                    </div>
                  )
                })}
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedLeads.length === paginatedLeads.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              {visibleColumns.map(column => (
                <TableHead 
                  key={column.key} 
                  className={`${column.width} ${
                    ['source', 'createdAt', 'associate', 'stage', 'status'].includes(column.key) 
                      ? 'text-left' 
                      : ''
                  }`}
                >
                  <Button
                    variant="ghost"
                    onClick={() => handleSort(column.key)}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    {column.label}
                    {sortConfig?.key === column.key && (
                      sortConfig.direction === 'asc' ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )
                    )}
                  </Button>
                </TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLeads.map((lead, index) => (
              <TableRow 
                key={lead.id}
                className={`${selectedLeads.includes(lead.id) ? 'bg-muted/50' : ''} hover:bg-muted/30`}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedLeads.includes(lead.id)}
                    onCheckedChange={() => handleSelectLead(lead.id)}
                  />
                </TableCell>
                
                {visibleColumns.map(column => (
                  <TableCell 
                    key={column.key} 
                    className={`${
                      ['source', 'createdAt', 'associate', 'stage', 'status'].includes(column.key) 
                        ? 'text-left' 
                        : ''
                    }`}
                  >
                    {column.key === 'source' && (
                      <div className="flex items-center space-x-2">
                        <EnhancedBadge 
                          badgeType="source" 
                          value={lead.source} 
                          size="sm"
                        />
                      </div>
                    )}
                    {column.key === 'status' && (
                      <div className="flex items-center space-x-2">
                        <EnhancedBadge 
                          badgeType="status" 
                          value={lead.status} 
                          size="sm"
                        />
                      </div>
                    )}
                    {column.key === 'stage' && (
                      <div className="flex items-center space-x-2">
                        <EnhancedBadge 
                          badgeType="stage" 
                          value={lead.stage} 
                          size="sm"
                        />
                      </div>
                    )}
                    {column.key === 'associate' && (
                      <div className="flex items-center space-x-2 text-left">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {getInitials(lead.associate)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{lead.associate}</span>
                      </div>
                    )}
                    {column.key === 'createdAt' && (
                      <div className="text-left">
                        <span className="text-sm">{formatDate(lead.createdAt)}</span>
                      </div>
                    )}
                    {!['source', 'status', 'stage', 'associate', 'createdAt'].includes(column.key) && (
                      <span>{lead[column.key as keyof typeof lead]}</span>
                    )}
                  </TableCell>
                ))}
                
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {}}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLead(lead.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {paginatedLeads.length} of {filteredLeads.length} lead(s)
        </div>
        <div className="space-x-2 py-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
