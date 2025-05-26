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
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-primary/10 to-primary/5">
          <TabsTrigger value="configuration" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Configuration</TabsTrigger>
          <TabsTrigger value="table" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Pivot Table</TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Advanced Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="configuration" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Row Fields */}
            <Card className="shadow-lg border-2 border-primary/20">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Row Fields
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-6">
                {rowFields.map((field, index) => (
                  <div key={`row-${index}`} className="flex items-center justify-between p-3 bg-secondary/40 rounded-lg border">
                    <span className="text-sm font-medium">
                      {fieldOptions.find(f => f.value === field)?.label || field}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeField(field, 'row')}
                      className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Select onValueChange={(value) => addField(value, 'row')}>
                  <SelectTrigger className="border-2 border-dashed border-primary/30 hover:border-primary/60">
                    <SelectValue placeholder="+ Add row field" />
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
            <Card className="shadow-lg border-2 border-primary/20">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-emerald-600" />
                  Column Fields
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-6">
                {colFields.map((field, index) => (
                  <div key={`col-${index}`} className="flex items-center justify-between p-3 bg-secondary/40 rounded-lg border">
                    <span className="text-sm font-medium">
                      {fieldOptions.find(f => f.value === field)?.label || field}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeField(field, 'col')}
                      className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Select onValueChange={(value) => addField(value, 'col')}>
                  <SelectTrigger className="border-2 border-dashed border-emerald-300/30 hover:border-emerald-300/60">
                    <SelectValue placeholder="+ Add column field" />
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
            <Card className="shadow-lg border-2 border-primary/20">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-purple-600" />
                  Value Fields
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-6">
                {valueFields.map((field, index) => (
                  <div key={`value-${index}`} className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-secondary/40 rounded-lg border">
                      <span className="text-sm font-medium">
                        {fieldOptions.find(f => f.value === field)?.label || field}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeField(field, 'value')}
                        className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Select 
                      value={aggregationMethods[field] || 'count'} 
                      onValueChange={(value) => setAggregationMethods({
                        ...aggregationMethods,
                        [field]: value
                      })}
                    >
                      <SelectTrigger className="text-xs border border-purple-200">
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
                  <SelectTrigger className="border-2 border-dashed border-purple-300/30 hover:border-purple-300/60">
                    <SelectValue placeholder="+ Add value field" />
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
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50">
              <CardTitle>Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <Label htmlFor="show-totals" className="font-medium">Show Totals</Label>
                    <Switch 
                      id="show-totals"
                      checked={showTotals} 
                      onCheckedChange={setShowTotals} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <Label htmlFor="show-subtotals" className="font-medium">Show Subtotals</Label>
                    <Switch 
                      id="show-subtotals"
                      checked={showSubtotals} 
                      onCheckedChange={setShowSubtotals} 
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="decimal-places" className="font-medium">Decimal Places</Label>
                    <Input
                      id="decimal-places"
                      type="number"
                      min="0"
                      max="10"
                      value={decimalPlaces}
                      onChange={(e) => setDecimalPlaces(parseInt(e.target.value) || 0)}
                      className="border-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="custom-formula" className="font-medium">Custom Formula</Label>
                    <Input
                      id="custom-formula"
                      value={customFormula}
                      onChange={(e) => setCustomFormula(e.target.value)}
                      placeholder="e.g., SUM(field1) / COUNT(field2)"
                      className="border-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table">
          <div className="flex justify-end mb-4">
            <Button onClick={handleRefresh} className="gap-2 bg-gradient-to-r from-primary to-primary/80" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Generate Pivot Table
            </Button>
          </div>
          
          <Card className="border-2 border-primary/20 bg-white dark:bg-gray-900 shadow-xl">
            <div className="p-4 overflow-x-auto">
              {isLoading ? (
                <div className="p-8 flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-primary/10 to-primary/5">
                      <TableHead className="bg-primary/20 font-bold text-primary min-w-[150px] border-r-2 border-primary/30">
                        {fieldOptions.find(f => f.value === rowFields[0])?.label || rowFields[0]}
                        {' \\ '}
                        {fieldOptions.find(f => f.value === colFields[0])?.label || colFields[0]}
                      </TableHead>
                      {pivotResult.colValues.map((col) => (
                        <TableHead key={col} className="bg-primary/10 font-bold text-center min-w-[120px] border-r border-primary/20">
                          {col}
                        </TableHead>
                      ))}
                      {showTotals && (
                        <TableHead className="bg-primary/30 font-bold text-center border-l-2 border-primary/50">Total</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pivotResult.rowValues.map((row, rowIndex) => (
                      <TableRow key={row} className={`hover:bg-primary/5 ${rowIndex % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/30' : ''}`}>
                        <TableCell className="font-semibold bg-primary/10 sticky left-0 border-r-2 border-primary/30">{row}</TableCell>
                        {pivotResult.colValues.map((col) => (
                          <TableCell key={`${row}-${col}`} className="text-center border-r border-gray-200 dark:border-gray-700">
                            {valueFields.length === 1 ? (
                              <div className="font-medium text-lg">
                                {formatValue(pivotResult.data[row][col][valueFields[0]], valueFields[0])}
                              </div>
                            ) : (
                              <div className="space-y-1">
                                {valueFields.map(field => (
                                  <div key={field} className="text-sm">
                                    <div className="text-xs text-muted-foreground">
                                      {fieldOptions.find(f => f.value === field)?.label}
                                    </div>
                                    <div className="font-medium">
                                      {formatValue(pivotResult.data[row][col][field], field)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </TableCell>
                        ))}
                        {showTotals && (
                          <TableCell className="font-bold bg-primary/20 text-center border-l-2 border-primary/50">
                            {valueFields.length === 1 ? (
                              <div className="font-bold text-lg">
                                {formatValue(
                                  pivotResult.colValues.reduce((sum, col) => 
                                    sum + pivotResult.data[row][col][valueFields[0]], 0
                                  ), 
                                  valueFields[0]
                                )}
                              </div>
                            ) : (
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
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    {showTotals && (
                      <TableRow className="border-t-4 border-primary/50 bg-primary/20">
                        <TableCell className="font-bold text-primary">Total</TableCell>
                        {pivotResult.colValues.map((col) => (
                          <TableCell key={`total-${col}`} className="font-semibold text-center border-r border-primary/30">
                            {valueFields.length === 1 ? (
                              <div className="font-bold text-lg">
                                {formatValue(
                                  pivotResult.rowValues.reduce((sum, row) => 
                                    sum + pivotResult.data[row][col][valueFields[0]], 0
                                  ), 
                                  valueFields[0]
                                )}
                              </div>
                            ) : (
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
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="font-bold bg-primary/40 text-center border-l-2 border-primary/70">
                          {valueFields.length === 1 ? (
                            <div className="font-bold text-lg text-primary">
                              {formatValue(
                                pivotResult.rowValues.reduce((rowSum, row) => 
                                  rowSum + pivotResult.colValues.reduce((colSum, col) => 
                                    colSum + pivotResult.data[row][col][valueFields[0]], 0
                                  ), 0
                                ), 
                                valueFields[0]
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {valueFields.map(field => (
                                <div key={field} className="text-sm font-bold text-primary">
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
                          )}
                        </TableCell>
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
