import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLeads } from '@/contexts/LeadContext';
import { ChevronDown, RefreshCw, Settings, Plus, X, Calculator } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function PivotView() {
  const { filteredLeads, loading } = useLeads();
  const [rowFields, setRowFields] = useState<string[]>(['status']);
  const [colFields, setColFields] = useState<string[]>(['source']);
  const [valueFields, setValueFields] = useState<string[]>(['count']);
  const [aggregationMethods, setAggregationMethods] = useState<Record<string, string>>({ count: 'count' });
  const [showTotals, setShowTotals] = useState(true);
  const [showSubtotals, setShowSubtotals] = useState(false);
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [customFormula, setCustomFormula] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fieldOptions = [
    { value: 'fullName', label: 'Full Name', type: 'text' },
    { value: 'email', label: 'Email', type: 'text' },
    { value: 'source', label: 'Source', type: 'text' },
    { value: 'status', label: 'Status', type: 'text' },
    { value: 'stage', label: 'Stage', type: 'text' },
    { value: 'associate', label: 'Associate', type: 'text' },
    { value: 'center', label: 'Center', type: 'text' },
    { value: 'ltv', label: 'LTV', type: 'number' },
    { value: 'visits', label: 'Visits', type: 'number' },
    { value: 'purchasesMade', label: 'Purchases Made', type: 'number' },
    { value: 'createdAt', label: 'Created (Month-Year)', type: 'date' },
    { value: 'createdAtYear', label: 'Created (Year)', type: 'date' },
    { value: 'createdAtMonth', label: 'Created (Month)', type: 'date' },
    { value: 'count', label: 'Count of Records', type: 'calculated' }
  ];

  const aggregationOptions = [
    { value: 'count', label: 'Count' },
    { value: 'sum', label: 'Sum' },
    { value: 'avg', label: 'Average' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maximum' },
    { value: 'median', label: 'Median' },
    { value: 'mode', label: 'Mode' },
    { value: 'stddev', label: 'Standard Deviation' },
    { value: 'variance', label: 'Variance' },
    { value: 'countDistinct', label: 'Count Distinct' }
  ];

  const formatValue = (value: number, field: string) => {
    if (field === 'ltv' || field.includes('revenue') || field.includes('value')) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }).format(value);
    }
    
    if (typeof value === 'number') {
      return value.toLocaleString('en-IN', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      });
    }
    
    return value;
  };

  const getFieldValue = (lead: any, field: string) => {
    if (field === 'count') return 1;
    if (field === 'createdAt') {
      return new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    } else if (field === 'createdAtYear') {
      return new Date(lead.createdAt).getFullYear().toString();
    } else if (field === 'createdAtMonth') {
      return new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'long' });
    }
    
    const value = lead[field];
    if (field === 'ltv' && typeof value === 'string') {
      return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
    }
    if (field === 'visits' || field === 'purchasesMade') {
      return parseFloat(value) || 0;
    }
    
    return value || 'N/A';
  };

  const calculateAggregation = (values: number[], method: string) => {
    if (!values.length) return 0;
    
    switch (method) {
      case 'count':
        return values.length;
      case 'sum':
        return values.reduce((sum, val) => sum + val, 0);
      case 'avg':
        return values.reduce((sum, val) => sum + val, 0) / values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'median':
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
      case 'mode':
        const frequency: Record<number, number> = {};
        values.forEach(val => frequency[val] = (frequency[val] || 0) + 1);
        return parseFloat(Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b));
      case 'stddev':
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
      case 'variance':
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        return values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
      case 'countDistinct':
        return new Set(values).size;
      default:
        return values.length;
    }
  };

  const pivotResult = useMemo(() => {
    const rowValues = new Set<string>();
    const colValues = new Set<string>();
    
    const rowField = rowFields[0] || 'status';
    const colField = colFields[0] || 'source';
    
    filteredLeads.forEach(lead => {
      const rowValue = getFieldValue(lead, rowField);
      const colValue = getFieldValue(lead, colField);
      
      rowValues.add(String(rowValue));
      colValues.add(String(colValue));
    });
    
    const pivotData: Record<string, Record<string, Record<string, number>>> = {};
    
    // Initialize structure
    Array.from(rowValues).forEach(row => {
      pivotData[row] = {};
      Array.from(colValues).forEach(col => {
        pivotData[row][col] = {};
        valueFields.forEach(field => {
          pivotData[row][col][field] = 0;
        });
      });
    });
    
    // Collect values for aggregation
    const aggregationData: Record<string, Record<string, Record<string, number[]>>> = {};
    
    filteredLeads.forEach(lead => {
      const rowValue = String(getFieldValue(lead, rowField));
      const colValue = String(getFieldValue(lead, colField));
      
      if (!aggregationData[rowValue]) {
        aggregationData[rowValue] = {};
      }
      if (!aggregationData[rowValue][colValue]) {
        aggregationData[rowValue][colValue] = {};
      }
      
      valueFields.forEach(field => {
        if (!aggregationData[rowValue][colValue][field]) {
          aggregationData[rowValue][colValue][field] = [];
        }
        
        const value = getFieldValue(lead, field);
        if (typeof value === 'number') {
          aggregationData[rowValue][colValue][field].push(value);
        } else if (field === 'count') {
          aggregationData[rowValue][colValue][field].push(1);
        }
      });
    });
    
    // Calculate aggregations
    Object.keys(aggregationData).forEach(row => {
      Object.keys(aggregationData[row]).forEach(col => {
        valueFields.forEach(field => {
          const values = aggregationData[row][col][field] || [];
          const method = aggregationMethods[field] || 'count';
          pivotData[row][col][field] = calculateAggregation(values, method);
        });
      });
    });
    
    return {
      rowValues: Array.from(rowValues).sort(),
      colValues: Array.from(colValues).sort(),
      data: pivotData
    };
  }, [filteredLeads, rowFields, colFields, valueFields, aggregationMethods]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  const addField = (field: string, type: 'row' | 'col' | 'value') => {
    switch (type) {
      case 'row':
        if (!rowFields.includes(field)) {
          setRowFields([...rowFields, field]);
        }
        break;
      case 'col':
        if (!colFields.includes(field)) {
          setColFields([...colFields, field]);
        }
        break;
      case 'value':
        if (!valueFields.includes(field)) {
          setValueFields([...valueFields, field]);
          setAggregationMethods({
            ...aggregationMethods,
            [field]: 'count'
          });
        }
        break;
    }
  };

  const removeField = (field: string, type: 'row' | 'col' | 'value') => {
    switch (type) {
      case 'row':
        setRowFields(rowFields.filter(f => f !== field));
        break;
      case 'col':
        setColFields(colFields.filter(f => f !== field));
        break;
      case 'value':
        setValueFields(valueFields.filter(f => f !== field));
        const newMethods = { ...aggregationMethods };
        delete newMethods[field];
        setAggregationMethods(newMethods);
        break;
    }
  };

  useEffect(() => {
    handleRefresh();
  }, [rowFields, colFields, valueFields, aggregationMethods, filteredLeads]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="configuration" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="table">Pivot Table</TabsTrigger>
          <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="configuration" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Row Fields */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Row Fields
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {rowFields.map((field, index) => (
                  <div key={`row-${index}`} className="flex items-center justify-between p-2 bg-secondary/40 rounded-md">
                    <span className="text-sm font-medium">
                      {fieldOptions.find(f => f.value === field)?.label || field}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeField(field, 'row')}
                      className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Select onValueChange={(value) => addField(value, 'row')}>
                  <SelectTrigger>
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
              </CardContent>
            </Card>

            {/* Column Fields */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Column Fields
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {colFields.map((field, index) => (
                  <div key={`col-${index}`} className="flex items-center justify-between p-2 bg-secondary/40 rounded-md">
                    <span className="text-sm font-medium">
                      {fieldOptions.find(f => f.value === field)?.label || field}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeField(field, 'col')}
                      className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Select onValueChange={(value) => addField(value, 'col')}>
                  <SelectTrigger>
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
              </CardContent>
            </Card>

            {/* Value Fields */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Value Fields
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {valueFields.map((field, index) => (
                  <div key={`value-${index}`} className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-secondary/40 rounded-md">
                      <span className="text-sm font-medium">
                        {fieldOptions.find(f => f.value === field)?.label || field}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeField(field, 'value')}
                        className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <Select 
                      value={aggregationMethods[field] || 'count'} 
                      onValueChange={(value) => setAggregationMethods({
                        ...aggregationMethods,
                        [field]: value
                      })}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {aggregationOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                <Select onValueChange={(value) => addField(value, 'value')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add value field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-totals">Show Totals</Label>
                    <Switch 
                      id="show-totals"
                      checked={showTotals} 
                      onCheckedChange={setShowTotals} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-subtotals">Show Subtotals</Label>
                    <Switch 
                      id="show-subtotals"
                      checked={showSubtotals} 
                      onCheckedChange={setShowSubtotals} 
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="decimal-places">Decimal Places</Label>
                    <Input
                      id="decimal-places"
                      type="number"
                      min="0"
                      max="10"
                      value={decimalPlaces}
                      onChange={(e) => setDecimalPlaces(parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="custom-formula">Custom Formula</Label>
                    <Input
                      id="custom-formula"
                      value={customFormula}
                      onChange={(e) => setCustomFormula(e.target.value)}
                      placeholder="e.g., SUM(field1) / COUNT(field2)"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table">
          <div className="flex justify-end mb-4">
            <Button onClick={handleRefresh} className="gap-2" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Generate Pivot Table
            </Button>
          </div>
          
          <Card className="border-border/40 bg-white dark:bg-gray-900">
            <div className="p-4 overflow-x-auto">
              {isLoading ? (
                <div className="p-8 flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="bg-muted/50 font-semibold min-w-[120px]">
                        {fieldOptions.find(f => f.value === rowFields[0])?.label || rowFields[0]}
                        {' / '}
                        {fieldOptions.find(f => f.value === colFields[0])?.label || colFields[0]}
                      </TableHead>
                      {pivotResult.colValues.map((col) => (
                        <TableHead key={col} className="bg-muted/50 font-semibold text-center min-w-[100px]">
                          {col}
                        </TableHead>
                      ))}
                      {showTotals && (
                        <TableHead className="bg-muted/70 font-bold text-center">Total</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pivotResult.rowValues.map((row) => (
                      <TableRow key={row} className="hover:bg-muted/30">
                        <TableCell className="font-semibold bg-muted/30 sticky left-0">{row}</TableCell>
                        {pivotResult.colValues.map((col) => (
                          <TableCell key={`${row}-${col}`} className="text-center">
                            <div className="space-y-1">
                              {valueFields.map(field => (
                                <div key={field} className="text-sm">
                                  <Badge variant="outline" className="text-xs mb-1">
                                    {fieldOptions.find(f => f.value === field)?.label}
                                  </Badge>
                                  <div className="font-medium">
                                    {formatValue(pivotResult.data[row][col][field], field)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        ))}
                        {showTotals && (
                          <TableCell className="font-bold bg-muted/30 text-center">
                            <div className="space-y-1">
                              {valueFields.map(field => (
                                <div key={field} className="text-sm">
                                  {formatValue(
                                    pivotResult.colValues.reduce((sum, col) => 
                                      sum + pivotResult.data[row][col][field], 0
                                    ), 
                                    field
                                  )}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    {showTotals && (
                      <TableRow className="border-t-2 bg-muted/50">
                        <TableCell className="font-bold">Total</TableCell>
                        {pivotResult.colValues.map((col) => (
                          <TableCell key={`total-${col}`} className="font-semibold text-center">
                            <div className="space-y-1">
                              {valueFields.map(field => (
                                <div key={field} className="text-sm">
                                  {formatValue(
                                    pivotResult.rowValues.reduce((sum, row) => 
                                      sum + pivotResult.data[row][col][field], 0
                                    ), 
                                    field
                                  )}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        ))}
                        <TableCell className="font-bold bg-muted/70 text-center">
                          <div className="space-y-1">
                            {valueFields.map(field => (
                              <div key={field} className="text-sm">
                                {formatValue(
                                  pivotResult.rowValues.reduce((rowSum, row) => 
                                    rowSum + pivotResult.colValues.reduce((colSum, col) => 
                                      colSum + pivotResult.data[row][col][field], 0
                                    ), 0
                                  ), 
                                  field
                                )}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  )}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PivotView;
