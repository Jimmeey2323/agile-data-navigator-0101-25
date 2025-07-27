
import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLeads } from '@/contexts/LeadContext';
import { 
  RefreshCw, 
  TrendingUp, 
  Award, 
  Users, 
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { formatRevenue } from '@/lib/utils';

export function EnhancedPivotView() {
  const { filteredLeads, loading } = useLeads();
  const [rowFields, setRowFields] = useState<string[]>(['associate']);
  const [colFields, setColFields] = useState<string[]>(['status']);
  const [valueField, setValueField] = useState<string>('count');
  const [valueType, setValueType] = useState<string>('count');
  const [showConversions, setShowConversions] = useState(false);
  const [showTrials, setShowTrials] = useState(false);
  const [showRevenue, setShowRevenue] = useState(false);

  const fieldOptions = [
    { value: 'fullName', label: 'Full Name' },
    { value: 'email', label: 'Email' },
    { value: 'source', label: 'Source' },
    { value: 'status', label: 'Status' },
    { value: 'stage', label: 'Stage' },
    { value: 'associate', label: 'Associate' },
    { value: 'center', label: 'Center' },
    { value: 'createdAt', label: 'Created (Month-Year)' },
    { value: 'createdAtYear', label: 'Created (Year)' },
    { value: 'createdAtMonth', label: 'Created (Month)' }
  ];

  const valueOptions = [
    { value: 'count', label: 'Count' },
    { value: 'conversions', label: 'Conversions' },
    { value: 'trials', label: 'Trials' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'conversionRate', label: 'Conversion Rate' }
  ];

  const getFieldValue = useCallback((lead: any, field: string) => {
    if (field === 'createdAt') {
      return new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    } else if (field === 'createdAtYear') {
      return new Date(lead.createdAt).getFullYear().toString();
    } else if (field === 'createdAtMonth') {
      return new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'long' });
    }
    return lead[field] || 'N/A';
  }, []);

  const pivotResult = useMemo(() => {
    const rowValues = new Set<string>();
    const colValues = new Set<string>();
    
    const rowField = rowFields[0] || 'associate';
    const colField = colFields[0] || 'status';
    
    filteredLeads.forEach(lead => {
      const rowValue = getFieldValue(lead, rowField);
      const colValue = getFieldValue(lead, colField);
      
      rowValues.add(rowValue);
      colValues.add(colValue);
    });
    
    const pivotData: Record<string, Record<string, any>> = {};
    const conversionData: Record<string, Record<string, number>> = {};
    const trialData: Record<string, Record<string, number>> = {};
    const revenueData: Record<string, Record<string, number>> = {};
    
    Array.from(rowValues).forEach(row => {
      pivotData[row] = {};
      conversionData[row] = {};
      trialData[row] = {};
      revenueData[row] = {};
      
      Array.from(colValues).forEach(col => {
        pivotData[row][col] = 0;
        conversionData[row][col] = 0;
        trialData[row][col] = 0;
        revenueData[row][col] = 0;
      });
    });
    
    filteredLeads.forEach(lead => {
      const rowValue = getFieldValue(lead, rowField);
      const colValue = getFieldValue(lead, colField);
      
      if (pivotData[rowValue] && pivotData[rowValue][colValue] !== undefined) {
        pivotData[rowValue][colValue] += 1;
        
        // Track conversions
        if (lead.stage === 'Membership Sold' || lead.stage === 'Closed Won') {
          conversionData[rowValue][colValue] += 1;
          revenueData[rowValue][colValue] += 75000; // Average membership value
        }
        
        // Track trials
        if (lead.stage === 'Trial Scheduled' || lead.stage === 'Trial Completed') {
          trialData[rowValue][colValue] += 1;
        }
      }
    });
    
    const sortedRowValues = Array.from(rowValues).sort();
    const sortedColValues = Array.from(colValues).sort();
    
    return {
      rowValues: sortedRowValues,
      colValues: sortedColValues,
      data: pivotData,
      conversions: conversionData,
      trials: trialData,
      revenue: revenueData
    };
  }, [filteredLeads, rowFields, colFields, getFieldValue]);

  const getCurrentData = () => {
    switch (valueType) {
      case 'conversions':
        return pivotResult.conversions;
      case 'trials':
        return pivotResult.trials;
      case 'revenue':
        return pivotResult.revenue;
      default:
        return pivotResult.data;
    }
  };

  const formatValue = (value: any) => {
    if (valueType === 'revenue') {
      return formatRevenue(value);
    }
    if (valueType === 'conversionRate') {
      const total = pivotResult.data;
      const conversions = pivotResult.conversions;
      // Calculate conversion rate logic here
      return `${((value / total) * 100).toFixed(1)}%`;
    }
    return value;
  };

  const currentData = getCurrentData();

  return (
    <div className="space-y-6">
      {/* Enhanced Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Row Fields
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={rowFields[0]} onValueChange={(value) => setRowFields([value])}>
              <SelectTrigger>
                <SelectValue placeholder="Select row field" />
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <PieChart className="h-4 w-4 mr-2" />
              Column Fields
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={colFields[0]} onValueChange={(value) => setColFields([value])}>
              <SelectTrigger>
                <SelectValue placeholder="Select column field" />
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Value Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={valueType} onValueChange={setValueType}>
              <SelectTrigger>
                <SelectValue placeholder="Select value type" />
              </SelectTrigger>
              <SelectContent>
                {valueOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{filteredLeads.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredLeads.filter(lead => lead.stage === 'Membership Sold').length}
                </p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trials</p>
                <p className="text-2xl font-bold text-orange-600">
                  {filteredLeads.filter(lead => lead.stage === 'Trial Scheduled' || lead.stage === 'Trial Completed').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatRevenue(filteredLeads.filter(lead => lead.stage === 'Membership Sold').length * 75000)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pivot Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Pivot Analysis - {valueOptions.find(v => v.value === valueType)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-muted font-semibold">
                    {fieldOptions.find(f => f.value === rowFields[0])?.label} / {fieldOptions.find(f => f.value === colFields[0])?.label}
                  </TableHead>
                  {pivotResult.colValues.map((col) => (
                    <TableHead key={col} className="bg-muted font-semibold text-center">
                      {col}
                    </TableHead>
                  ))}
                  <TableHead className="bg-muted font-semibold text-center">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pivotResult.rowValues.map((row) => (
                  <TableRow key={row}>
                    <TableCell className="font-medium bg-muted/50">{row}</TableCell>
                    {pivotResult.colValues.map((col) => (
                      <TableCell key={`${row}-${col}`} className="text-center">
                        <Badge variant={currentData[row][col] > 0 ? "default" : "secondary"}>
                          {formatValue(currentData[row][col])}
                        </Badge>
                      </TableCell>
                    ))}
                    <TableCell className="font-medium bg-muted/50 text-center">
                      <Badge variant="outline">
                        {formatValue(pivotResult.colValues.reduce((sum, col) => sum + currentData[row][col], 0))}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2">
                  <TableCell className="font-semibold bg-muted">Total</TableCell>
                  {pivotResult.colValues.map((col) => (
                    <TableCell key={`total-${col}`} className="font-medium bg-muted/50 text-center">
                      <Badge variant="outline">
                        {formatValue(pivotResult.rowValues.reduce((sum, row) => sum + currentData[row][col], 0))}
                      </Badge>
                    </TableCell>
                  ))}
                  <TableCell className="font-semibold bg-muted text-center">
                    <Badge>
                      {formatValue(pivotResult.rowValues.reduce(
                        (rowSum, row) => rowSum + pivotResult.colValues.reduce(
                          (colSum, col) => colSum + currentData[row][col], 0
                        ), 0
                      ))}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
