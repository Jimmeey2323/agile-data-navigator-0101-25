
import React, { useState, useMemo } from 'react';
import { useLeads } from '@/contexts/LeadContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  Users, 
  Calendar,
  Award,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Zap
} from 'lucide-react';
import { formatRevenue, groupBy } from '@/lib/utils';

interface PivotData {
  [key: string]: {
    total: number;
    converted: number;
    trials: number;
    conversionRate: number;
    revenue: number;
    avgDealSize: number;
    timeToConvert: number;
  };
}

export function EnhancedPivotView() {
  const { filteredLeads, loading } = useLeads();
  
  const [rowDimension, setRowDimension] = useState('associate');
  const [columnDimension, setColumnDimension] = useState('source');
  const [metric, setMetric] = useState('conversion');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  
  const dimensions = [
    { value: 'associate', label: 'Associate' },
    { value: 'source', label: 'Source' },
    { value: 'stage', label: 'Stage' },
    { value: 'status', label: 'Status' },
    { value: 'center', label: 'Center' }
  ];

  const metrics = [
    { value: 'conversion', label: 'Conversion Rate' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'trials', label: 'Trials Scheduled' },
    { value: 'total', label: 'Total Leads' },
    { value: 'avgDealSize', label: 'Avg Deal Size' }
  ];

  const pivotData = useMemo(() => {
    const data: PivotData = {};
    const avgDealValue = 75000; // ₹75,000 per conversion
    
    filteredLeads.forEach(lead => {
      const rowKey = lead[rowDimension as keyof typeof lead] as string || 'Unknown';
      
      if (!data[rowKey]) {
        data[rowKey] = {
          total: 0,
          converted: 0,
          trials: 0,
          conversionRate: 0,
          revenue: 0,
          avgDealSize: 0,
          timeToConvert: 0
        };
      }
      
      data[rowKey].total += 1;
      
      if (lead.stage === 'Membership Sold' || lead.stage === 'Closed Won') {
        data[rowKey].converted += 1;
        data[rowKey].revenue += avgDealValue;
      }
      
      if (lead.stage === 'Trial Scheduled' || lead.stage === 'Trial Completed') {
        data[rowKey].trials += 1;
      }
    });
    
    // Calculate rates and averages
    Object.keys(data).forEach(key => {
      const item = data[key];
      item.conversionRate = item.total > 0 ? (item.converted / item.total) * 100 : 0;
      item.avgDealSize = item.converted > 0 ? item.revenue / item.converted : 0;
    });
    
    return data;
  }, [filteredLeads, rowDimension]);

  const chartData = useMemo(() => {
    return Object.entries(pivotData).map(([key, value]) => ({
      name: key,
      value: value[metric as keyof typeof value],
      total: value.total,
      converted: value.converted,
      trials: value.trials,
      revenue: value.revenue
    }));
  }, [pivotData, metric]);

  const totalMetrics = useMemo(() => {
    const totals = {
      totalLeads: filteredLeads.length,
      totalConverted: filteredLeads.filter(lead => 
        lead.stage === 'Membership Sold' || lead.stage === 'Closed Won'
      ).length,
      totalTrials: filteredLeads.filter(lead => 
        lead.stage === 'Trial Scheduled' || lead.stage === 'Trial Completed'
      ).length,
      totalRevenue: 0,
      overallConversionRate: 0
    };
    
    totals.totalRevenue = totals.totalConverted * 75000;
    totals.overallConversionRate = totals.totalLeads > 0 
      ? (totals.totalConverted / totals.totalLeads) * 100 
      : 0;
    
    return totals;
  }, [filteredLeads]);

  const getMetricColor = (value: number, type: string) => {
    if (type === 'conversion') {
      return value >= 20 ? 'text-green-600' : value >= 10 ? 'text-yellow-600' : 'text-red-600';
    }
    return 'text-blue-600';
  };

  const formatMetricValue = (value: number, type: string) => {
    switch (type) {
      case 'conversion':
        return `${value.toFixed(1)}%`;
      case 'revenue':
        return formatRevenue(value);
      default:
        return value.toFixed(0);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Leads</p>
                <p className="text-2xl font-bold text-blue-800">{totalMetrics.totalLeads}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Conversions</p>
                <p className="text-2xl font-bold text-green-800">{totalMetrics.totalConverted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Trials</p>
                <p className="text-2xl font-bold text-orange-800">{totalMetrics.totalTrials}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Revenue</p>
                <p className="text-2xl font-bold text-purple-800">{formatRevenue(totalMetrics.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-600 font-medium">Conversion Rate</p>
                <p className="text-2xl font-bold text-teal-800">{totalMetrics.overallConversionRate.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Advanced Pivot Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Row Dimension:</label>
              <Select value={rowDimension} onValueChange={setRowDimension}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dimensions.map(dim => (
                    <SelectItem key={dim.value} value={dim.value}>
                      {dim.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Metric:</label>
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {metrics.map(met => (
                    <SelectItem key={met.value} value={met.value}>
                      {met.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Chart Type:</label>
              <Select value={chartType} onValueChange={(value: 'bar' | 'pie') => setChartType(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="pie">Pie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chart */}
          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => formatMetricValue(value, metric)}
                    labelFormatter={(label) => `${dimensions.find(d => d.value === rowDimension)?.label}: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatMetricValue(value, metric)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatMetricValue(value, metric)} />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Detailed Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{dimensions.find(d => d.value === rowDimension)?.label}</TableHead>
                  <TableHead className="text-right">Total Leads</TableHead>
                  <TableHead className="text-right">Conversions</TableHead>
                  <TableHead className="text-right">Trials</TableHead>
                  <TableHead className="text-right">Conversion Rate</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Avg Deal Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(pivotData)
                  .sort(([,a], [,b]) => b.conversionRate - a.conversionRate)
                  .map(([key, data]) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{key}</TableCell>
                      <TableCell className="text-right">{data.total}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {data.converted}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Calendar className="h-3 w-3 text-orange-500" />
                          {data.trials}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          variant={data.conversionRate >= 20 ? 'default' : 'secondary'}
                          className={getMetricColor(data.conversionRate, 'conversion')}
                        >
                          {data.conversionRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatRevenue(data.revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatRevenue(data.avgDealSize)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
