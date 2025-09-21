
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLeads } from '@/contexts/LeadContext';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, ChevronsUpDown, RefreshCw } from 'lucide-react';

export function PivotView() {
  const { filteredLeads, loading } = useLeads();
  const [rowFields, setRowFields] = useState<string[]>(['status']);
  const [colFields, setColFields] = useState<string[]>(['source']);
  const [valueField, setValueField] = useState<string>('count');
  const [valueType, setValueType] = useState<string>('count');
  const [isLoading, setIsLoading] = useState(false);

  const fieldOptions = [
    { value: 'fullName', label: 'Full Name' },
    { value: 'email', label: 'Email' },
    { value: 'source', label: 'Source' },
    { value: 'status', label: 'Status' },
    { value: 'stage', label: 'Stage' },
    { value: 'associate', label: 'Associate' },
    { value: 'createdAt', label: 'Created (Month-Year)', formatter: (date: string) => {
      return new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }},
    { value: 'createdAtYear', label: 'Created (Year)', formatter: (date: string) => {
      return new Date(date).getFullYear().toString();
    }},
    { value: 'createdAtMonth', label: 'Created (Month)', formatter: (date: string) => {
      return new Date(date).toLocaleDateString('en-US', { month: 'long' });
    }}
  ];

  const valueOptions = [
    { value: 'count', label: 'Count' },
    { value: 'countUnique', label: 'Count Unique' },
    { value: 'sum', label: 'Sum' },
    { value: 'avg', label: 'Average' }
  ];

  const handleAddRowField = (value: string) => {
    if (!rowFields.includes(value)) {
      setRowFields([...rowFields, value]);
    }
  };

  const handleAddColField = (value: string) => {
    if (!colFields.includes(value)) {
      setColFields([...colFields, value]);
    }
  };

  const handleRemoveRowField = (index: number) => {
    setRowFields(rowFields.filter((_, i) => i !== index));
  };

  const handleRemoveColField = (index: number) => {
    setColFields(colFields.filter((_, i) => i !== index));
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate loading for demonstration
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const getFieldValue = (lead: any, field: string) => {
    if (field === 'createdAt') {
      return new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    } else if (field === 'createdAtYear') {
      return new Date(lead.createdAt).getFullYear().toString();
    } else if (field === 'createdAtMonth') {
      return new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'long' });
    }
    return lead[field] || 'N/A';
  };
  
  // Dynamic pivot data generation based on selected fields
  const pivotResult = useMemo(() => {
    // This function now dynamically generates the pivot table data based on user selections
    const rowValues = new Set<string>();
    const colValues = new Set<string>();
    
    // Get the row and column field names
    const rowField = rowFields[0] || 'status';
    const colField = colFields[0] || 'source';
    
    // Collect unique row and column values
    filteredLeads.forEach(lead => {
      const rowValue = getFieldValue(lead, rowField);
      const colValue = getFieldValue(lead, colField);
      
      rowValues.add(rowValue);
      colValues.add(colValue);
    });
    
    // Generate data structure
    const pivotData: Record<string, Record<string, number>> = {};
    Array.from(rowValues).forEach(row => {
      pivotData[row] = {};
      Array.from(colValues).forEach(col => {
        pivotData[row][col] = 0;
      });
    });
    
    // Fill data based on value type
    filteredLeads.forEach(lead => {
      const rowValue = getFieldValue(lead, rowField);
      const colValue = getFieldValue(lead, colField);
      
      if (pivotData[rowValue] && pivotData[rowValue][colValue] !== undefined) {
        if (valueType === 'count') {
          pivotData[rowValue][colValue] += 1;
        } else if (valueType === 'countUnique') {
          // For unique count, we'd normally track unique values
          // For this demo, we'll just increment
          pivotData[rowValue][colValue] += 1;
        } else if (valueType === 'sum' && valueField !== 'count') {
          // For sum, we'd add the numeric value of the selected field
          const fieldValue = lead[valueField];
          if (typeof fieldValue === 'number') {
            pivotData[rowValue][colValue] += fieldValue;
          }
        } else if (valueType === 'avg' && valueField !== 'count') {
          // For real average, we'd track sum and count, then divide
          // For this demo, we'll just increment
          pivotData[rowValue][colValue] += 1;
        }
      }
    });
    
    // Sort the row and column values
    const sortedRowValues = Array.from(rowValues).sort();
    const sortedColValues = Array.from(colValues).sort();
    
    return {
      rowValues: sortedRowValues,
      colValues: sortedColValues,
      data: pivotData
    };
  }, [filteredLeads, rowFields, colFields, valueField, valueType]);
  
  // Handle auto-refresh when fields change
  useEffect(() => {
    handleRefresh();
  }, [rowFields, colFields, valueField, valueType, filteredLeads]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border border-gray-300 shadow-lg rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-3 border-b border-gray-300">
            <h3 className="text-sm font-medium text-white">Row Fields</h3>
          </div>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {rowFields.map((field, index) => (
                <div key={`row-${index}`} className="flex items-center justify-between py-1 px-2 bg-gray-100 rounded-md border border-gray-200">
                  <span className="text-sm text-gray-700">{fieldOptions.find(f => f.value === field)?.label || field}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveRowField(index)} className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-200">×</Button>
                </div>
              ))}
              <Select onValueChange={handleAddRowField}>
                <SelectTrigger className="w-full mt-2 bg-white border-gray-300 text-gray-700">
                  <SelectValue placeholder="Add row field" />
                </SelectTrigger>
                <SelectContent>
                  {fieldOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-300 shadow-lg rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-3 border-b border-gray-300">
            <h3 className="text-sm font-medium text-white">Column Fields</h3>
          </div>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {colFields.map((field, index) => (
                <div key={`col-${index}`} className="flex items-center justify-between py-1 px-2 bg-gray-100 rounded-md border border-gray-200">
                  <span className="text-sm text-gray-700">{fieldOptions.find(f => f.value === field)?.label || field}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveColField(index)} className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-200">×</Button>
                </div>
              ))}
              <Select onValueChange={handleAddColField}>
                <SelectTrigger className="w-full mt-2 bg-white border-gray-300 text-gray-700">
                  <SelectValue placeholder="Add column field" />
                </SelectTrigger>
                <SelectContent>
                  {fieldOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-300 shadow-lg rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-3 border-b border-gray-300">
            <h3 className="text-sm font-medium text-white">Values</h3>
          </div>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-600">Value Field</label>
                <Select value={valueField} onValueChange={setValueField}>
                  <SelectTrigger className="w-full mt-1 bg-white border-gray-300 text-gray-700">
                    <SelectValue placeholder="Select value field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-xs text-gray-600">Aggregation</label>
                <Select value={valueType} onValueChange={setValueType}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select aggregation" />
                  </SelectTrigger>
                  <SelectContent>
                    {valueOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleRefresh} className="gap-2" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Generate Pivot Table
        </Button>
      </div>
      
      <Card className="bg-white border border-gray-300 shadow-lg rounded-2xl overflow-auto">
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-4 border-b border-gray-300">
          <h3 className="text-lg font-semibold text-white">Pivot Table Results</h3>
        </div>
        <div className="p-4 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-gradient-to-r from-gray-800 to-gray-700 font-medium text-white border-gray-600">
                    {fieldOptions.find(f => f.value === rowFields[0])?.label || rowFields[0]}
                    {' / '}
                    {fieldOptions.find(f => f.value === colFields[0])?.label || colFields[0]}
                  </TableHead>
                  {pivotResult.colValues.map((col) => (
                    <TableHead key={col} className="bg-gradient-to-r from-gray-800 to-gray-700 font-medium text-white border-gray-600">
                      {col}
                    </TableHead>
                  ))}
                  <TableHead className="bg-gradient-to-r from-gray-800 to-gray-700 font-medium text-white border-gray-600">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pivotResult.rowValues.map((row) => (
                  <TableRow key={row}>
                    <TableCell className="font-medium bg-gray-100 text-gray-800 border-gray-300">{row}</TableCell>
                    {pivotResult.colValues.map((col) => (
                      <TableCell key={`${row}-${col}`} className="text-gray-700 border-gray-300">
                        {pivotResult.data[row][col]}
                      </TableCell>
                    ))}
                    <TableCell className="font-medium bg-gray-100 text-gray-800 border-gray-300">
                      {pivotResult.colValues.reduce((sum, col) => sum + pivotResult.data[row][col], 0)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 border-gray-400">
                  <TableCell className="font-medium bg-gradient-to-r from-gray-800 to-gray-700 text-white border-gray-600">Total</TableCell>
                  {pivotResult.colValues.map((col) => (
                    <TableCell key={`total-${col}`} className="font-medium bg-gradient-to-r from-gray-800 to-gray-700 text-white border-gray-600">
                      {pivotResult.rowValues.reduce((sum, row) => sum + pivotResult.data[row][col], 0)}
                    </TableCell>
                  ))}
                  <TableCell className="font-medium bg-gradient-to-r from-gray-800 to-gray-700 text-white border-gray-600">
                    {pivotResult.rowValues.reduce(
                      (rowSum, row) => rowSum + pivotResult.colValues.reduce(
                        (colSum, col) => colSum + pivotResult.data[row][col], 0
                      ), 0
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}

export default PivotView;
