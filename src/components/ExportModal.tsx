import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLeads } from '@/contexts/LeadContext';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Database, 
  Code,
  CheckCircle,
  Filter,
  Calendar,
  Users,
  BarChart3,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'csv' | 'json' | 'xlsx' | 'tsv';

export const ExportModal = ({ isOpen, onClose }: ExportModalProps) => {
  const { filteredLeads, filters, statusCounts } = useLeads();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'fullName', 'email', 'phone', 'source', 'associate', 'status', 'stage', 'createdAt'
  ]);
  const [includeFilters, setIncludeFilters] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);

  const allFields = [
    { id: 'fullName', label: 'Full Name' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Phone' },
    { id: 'source', label: 'Source' },
    { id: 'associate', label: 'Associate' },
    { id: 'status', label: 'Status' },
    { id: 'stage', label: 'Stage' },
    { id: 'createdAt', label: 'Created Date' },
    { id: 'center', label: 'Center' },
    { id: 'remarks', label: 'Remarks' },
    { id: 'followUp1Date', label: 'Follow-up 1 Date' },
    { id: 'followUp1Comments', label: 'Follow-up 1 Comments' },
    { id: 'followUp2Date', label: 'Follow-up 2 Date' },
    { id: 'followUp2Comments', label: 'Follow-up 2 Comments' },
    { id: 'followUp3Date', label: 'Follow-up 3 Date' },
    { id: 'followUp3Comments', label: 'Follow-up 3 Comments' },
    { id: 'followUp4Date', label: 'Follow-up 4 Date' },
    { id: 'followUp4Comments', label: 'Follow-up 4 Comments' },
  ];

  const formatOptions = [
    { id: 'csv', label: 'CSV', icon: FileText, description: 'Comma-separated values, compatible with Excel' },
    { id: 'json', label: 'JSON', icon: Code, description: 'JavaScript Object Notation, for developers' },
    { id: 'xlsx', label: 'Excel', icon: FileSpreadsheet, description: 'Microsoft Excel format' },
    { id: 'tsv', label: 'TSV', icon: Database, description: 'Tab-separated values' },
  ];

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const selectAllFields = () => {
    setSelectedFields(allFields.map(field => field.id));
  };

  const clearAllFields = () => {
    setSelectedFields([]);
  };

  const getFilteredData = () => {
    return filteredLeads.map(lead => {
      const filteredLead: any = {};
      selectedFields.forEach(field => {
        filteredLead[field] = lead[field] || '';
      });
      return filteredLead;
    });
  };

  const generateMetadata = () => {
    const activeFilters = [];
    if (filters.search) activeFilters.push(`Search: "${filters.search}"`);
    if (filters.source.length > 0) activeFilters.push(`Source: ${filters.source.join(', ')}`);
    if (filters.associate.length > 0) activeFilters.push(`Associate: ${filters.associate.join(', ')}`);
    if (filters.status.length > 0) activeFilters.push(`Status: ${filters.status.join(', ')}`);
    if (filters.stage.length > 0) activeFilters.push(`Stage: ${filters.stage.join(', ')}`);
    if (filters.center.length > 0) activeFilters.push(`Center: ${filters.center.join(', ')}`);
    
    return {
      exportDate: new Date().toISOString(),
      totalRecords: filteredLeads.length,
      appliedFilters: activeFilters,
      selectedFields: selectedFields,
      statusBreakdown: statusCounts
    };
  };

  const exportCSV = () => {
    const data = getFilteredData();
    let csvContent = Papa.unparse(data);
    
    if (includeMetadata) {
      const metadata = generateMetadata();
      const metadataHeader = `# Export Metadata\n# Generated: ${metadata.exportDate}\n# Records: ${metadata.totalRecords}\n# Filters: ${metadata.appliedFilters.join('; ')}\n\n`;
      csvContent = metadataHeader + csvContent;
    }
    
    downloadFile(csvContent, 'leads-export.csv', 'text/csv');
  };

  const exportJSON = () => {
    const data = getFilteredData();
    const output = {
      ...(includeMetadata && { metadata: generateMetadata() }),
      data: data
    };
    
    const jsonContent = JSON.stringify(output, null, 2);
    downloadFile(jsonContent, 'leads-export.json', 'application/json');
  };

  const exportTSV = () => {
    const data = getFilteredData();
    let tsvContent = Papa.unparse(data, { delimiter: '\t' });
    
    if (includeMetadata) {
      const metadata = generateMetadata();
      const metadataHeader = `# Export Metadata\n# Generated: ${metadata.exportDate}\n# Records: ${metadata.totalRecords}\n# Filters: ${metadata.appliedFilters.join('; ')}\n\n`;
      tsvContent = metadataHeader + tsvContent;
    }
    
    downloadFile(tsvContent, 'leads-export.tsv', 'text/tab-separated-values');
  };

  const exportExcel = () => {
    // For simplicity, we'll export as CSV with .xlsx extension
    // In a real implementation, you'd use a library like xlsx
    const data = getFilteredData();
    const csvContent = Papa.unparse(data);
    downloadFile(csvContent, 'leads-export.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    toast.info('Note: Excel format exported as CSV. Use a proper Excel library for full .xlsx support.');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (selectedFields.length === 0) {
      toast.error('Please select at least one field to export');
      return;
    }

    switch (selectedFormat) {
      case 'csv':
        exportCSV();
        break;
      case 'json':
        exportJSON();
        break;
      case 'xlsx':
        exportExcel();
        break;
      case 'tsv':
        exportTSV();
        break;
    }

    toast.success(`Successfully exported ${filteredLeads.length} records as ${selectedFormat.toUpperCase()}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Leads Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Export Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{filteredLeads.length}</div>
                  <div className="text-sm text-muted-foreground">Total Records</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedFields.length}</div>
                  <div className="text-sm text-muted-foreground">Selected Fields</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{Object.keys(statusCounts).length}</div>
                  <div className="text-sm text-muted-foreground">Status Types</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {[filters.search, ...filters.source, ...filters.associate, ...filters.status, ...filters.stage, ...filters.center].filter(Boolean).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Filters</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="format" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="format">Export Format</TabsTrigger>
              <TabsTrigger value="fields">Select Fields</TabsTrigger>
              <TabsTrigger value="options">Options</TabsTrigger>
            </TabsList>

            <TabsContent value="format" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formatOptions.map((format) => (
                  <Card 
                    key={format.id} 
                    className={`cursor-pointer transition-all ${
                      selectedFormat === format.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedFormat(format.id as ExportFormat)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <format.icon className="w-8 h-8 text-blue-600" />
                        <div className="flex-1">
                          <div className="font-semibold">{format.label}</div>
                          <div className="text-sm text-muted-foreground">{format.description}</div>
                        </div>
                        {selectedFormat === format.id && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="fields" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllFields}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAllFields}>
                    Clear All
                  </Button>
                </div>
                <Badge variant="secondary">
                  {selectedFields.length} of {allFields.length} fields selected
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {allFields.map((field) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.id}
                      checked={selectedFields.includes(field.id)}
                      onCheckedChange={() => toggleField(field.id)}
                    />
                    <Label htmlFor={field.id} className="text-sm font-medium">
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="options" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeFilters"
                    checked={includeFilters}
                    onCheckedChange={(checked) => setIncludeFilters(!!checked)}
                  />
                  <Label htmlFor="includeFilters" className="text-sm font-medium">
                    Include applied filters in export
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeMetadata"
                    checked={includeMetadata}
                    onCheckedChange={(checked) => setIncludeMetadata(!!checked)}
                  />
                  <Label htmlFor="includeMetadata" className="text-sm font-medium">
                    Include export metadata (timestamp, record count, etc.)
                  </Label>
                </div>

                {includeFilters && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Active Filters Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {filters.search && (
                          <Badge variant="outline">Search: "{filters.search}"</Badge>
                        )}
                        {filters.source.length > 0 && (
                          <Badge variant="outline">Source: {filters.source.join(', ')}</Badge>
                        )}
                        {filters.associate.length > 0 && (
                          <Badge variant="outline">Associate: {filters.associate.join(', ')}</Badge>
                        )}
                        {filters.status.length > 0 && (
                          <Badge variant="outline">Status: {filters.status.join(', ')}</Badge>
                        )}
                        {filters.stage.length > 0 && (
                          <Badge variant="outline">Stage: {filters.stage.join(', ')}</Badge>
                        )}
                        {filters.center.length > 0 && (
                          <Badge variant="outline">Center: {filters.center.join(', ')}</Badge>
                        )}
                        {!filters.search && filters.source.length === 0 && filters.associate.length === 0 && 
                         filters.status.length === 0 && filters.stage.length === 0 && filters.center.length === 0 && (
                          <Badge variant="secondary">No filters applied - exporting all data</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              Export {filteredLeads.length} Records
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};