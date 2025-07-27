
import React, { useState, useMemo } from 'react';
import { useLeads } from '@/contexts/LeadContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  DollarSign, 
  Calendar,
  Award,
  Activity,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Zap
} from 'lucide-react';

type AggregatorType = 'count' | 'sum' | 'average' | 'conversion_rate' | 'revenue';
type PivotDimension = 'associate' | 'source' | 'status' | 'stage' | 'center' | 'date';

export const EnhancedPivotView = () => {
  const { filteredLeads, associateOptions, sourceOptions, statusOptions, stageOptions, centerOptions } = useLeads();
  
  const [rowDimension, setRowDimension] = useState<PivotDimension>('associate');
  const [columnDimension, setColumnDimension] = useState<PivotDimension>('status');
  const [aggregator, setAggregator] = useState<AggregatorType>('count');
  const [showPercentages, setShowPercentages] = useState(false);
  const [activeTab, setActiveTab] = useState<'table' | 'chart' | 'insights'>('table');

  // Calculate pivot data
  const pivotData = useMemo(() => {
    const data: Record<string, Record<string, number>> = {};
    const rowTotals: Record<string, number> = {};
    const columnTotals: Record<string, number> = {};
    let grandTotal = 0;

    // Get unique values for dimensions
    const getUniqueValues = (dimension: PivotDimension) => {
      switch (dimension) {
        case 'associate': return associateOptions;
        case 'source': return sourceOptions;
        case 'status': return statusOptions;
        case 'stage': return stageOptions;
        case 'center': return centerOptions;
        case 'date': return [...new Set(filteredLeads.map(lead => 
          new Date(lead.createdAt).toLocaleDateString()
        ))].sort();
        default: return [];
      }
    };

    const getValueFromLead = (lead: any, dimension: PivotDimension): string => {
      switch (dimension) {
        case 'associate': return lead.associate;
        case 'source': return lead.source;
        case 'status': return lead.status;
        case 'stage': return lead.stage;
        case 'center': return lead.center;
        case 'date': return new Date(lead.createdAt).toLocaleDateString();
        default: return '';
      }
    };

    const rowValues = getUniqueValues(rowDimension);
    const columnValues = getUniqueValues(columnDimension);

    // Initialize data structure
    rowValues.forEach(row => {
      data[row] = {};
      rowTotals[row] = 0;
      columnValues.forEach(col => {
        data[row][col] = 0;
      });
    });

    columnValues.forEach(col => {
      columnTotals[col] = 0;
    });

    // Calculate aggregated values
    filteredLeads.forEach(lead => {
      const rowValue = getValueFromLead(lead, rowDimension);
      const columnValue = getValueFromLead(lead, columnDimension);

      if (rowValue && columnValue) {
        let value = 0;
        
        switch (aggregator) {
          case 'count':
            value = 1;
            break;
          case 'sum':
            // For sum, we'll count unique leads (could be extended for other metrics)
            value = 1;
            break;
          case 'average':
            value = 1;
            break;
          case 'conversion_rate':
            value = lead.stage === 'Membership Sold' ? 1 : 0;
            break;
          case 'revenue':
            value = lead.stage === 'Membership Sold' ? 75000 : 0; // ₹75,000 per conversion
            break;
          default:
            value = 1;
        }

        if (data[rowValue] && typeof data[rowValue][columnValue] === 'number') {
          data[rowValue][columnValue] += value;
          rowTotals[rowValue] += value;
          columnTotals[columnValue] += value;
          grandTotal += value;
        }
      }
    });

    // Calculate averages if needed
    if (aggregator === 'average') {
      Object.keys(data).forEach(row => {
        Object.keys(data[row]).forEach(col => {
          const count = filteredLeads.filter(lead => 
            getValueFromLead(lead, rowDimension) === row && 
            getValueFromLead(lead, columnDimension) === col
          ).length;
          if (count > 0) {
            data[row][col] = data[row][col] / count;
          }
        });
      });
    }

    return {
      data,
      rowValues,
      columnValues,
      rowTotals,
      columnTotals,
      grandTotal
    };
  }, [filteredLeads, rowDimension, columnDimension, aggregator, associateOptions, sourceOptions, statusOptions, stageOptions, centerOptions]);

  // Calculate conversion insights
  const conversionInsights = useMemo(() => {
    const insights: any[] = [];
    
    // Best performing associate
    const bestAssociate = associateOptions.reduce((best, associate) => {
      const associateLeads = filteredLeads.filter(lead => lead.associate === associate);
      const conversions = associateLeads.filter(lead => lead.stage === 'Membership Sold').length;
      const rate = associateLeads.length > 0 ? conversions / associateLeads.length : 0;
      
      if (rate > (best.rate || 0)) {
        return { associate, rate, conversions, total: associateLeads.length };
      }
      return best;
    }, {} as any);

    if (bestAssociate.associate) {
      insights.push({
        type: 'success',
        icon: <Award className="h-5 w-5" />,
        title: 'Top Performer',
        description: `${bestAssociate.associate} has the highest conversion rate`,
        value: `${(bestAssociate.rate * 100).toFixed(1)}%`,
        detail: `${bestAssociate.conversions}/${bestAssociate.total} conversions`
      });
    }

    // Best lead source
    const bestSource = sourceOptions.reduce((best, source) => {
      const sourceLeads = filteredLeads.filter(lead => lead.source === source);
      const conversions = sourceLeads.filter(lead => lead.stage === 'Membership Sold').length;
      const rate = sourceLeads.length > 0 ? conversions / sourceLeads.length : 0;
      
      if (rate > (best.rate || 0)) {
        return { source, rate, conversions, total: sourceLeads.length };
      }
      return best;
    }, {} as any);

    if (bestSource.source) {
      insights.push({
        type: 'info',
        icon: <TrendingUp className="h-5 w-5" />,
        title: 'Best Lead Source',
        description: `${bestSource.source} generates the highest quality leads`,
        value: `${(bestSource.rate * 100).toFixed(1)}%`,
        detail: `${bestSource.conversions}/${bestSource.total} conversions`
      });
    }

    // Total revenue
    const totalRevenue = filteredLeads.filter(lead => lead.stage === 'Membership Sold').length * 75000;
    insights.push({
      type: 'success',
      icon: <DollarSign className="h-5 w-5" />,
      title: 'Total Revenue',
      description: 'Revenue generated from converted leads',
      value: `₹${(totalRevenue / 1000).toFixed(0)}K`,
      detail: `${filteredLeads.filter(lead => lead.stage === 'Membership Sold').length} conversions`
    });

    return insights;
  }, [filteredLeads, associateOptions, sourceOptions]);

  // Format value for display
  const formatValue = (value: number) => {
    if (aggregator === 'revenue') {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    if (aggregator === 'conversion_rate' || showPercentages) {
      const total = pivotData.rowTotals[Object.keys(pivotData.rowTotals)[0]] || 1;
      return `${((value / total) * 100).toFixed(1)}%`;
    }
    return value.toString();
  };

  // Get cell color based on value
  const getCellColor = (value: number, max: number) => {
    if (max === 0) return 'bg-gray-50';
    const intensity = value / max;
    if (intensity > 0.8) return 'bg-green-100 text-green-800';
    if (intensity > 0.6) return 'bg-yellow-100 text-yellow-800';
    if (intensity > 0.4) return 'bg-orange-100 text-orange-800';
    if (intensity > 0.2) return 'bg-red-100 text-red-800';
    return 'bg-gray-50';
  };

  // Prepare chart data
  const chartData = pivotData.rowValues.map(row => ({
    name: row,
    ...pivotData.columnValues.reduce((acc, col) => ({
      ...acc,
      [col]: pivotData.data[row][col]
    }), {}),
    total: pivotData.rowTotals[row]
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enhanced Pivot Analysis</h2>
          <p className="text-sm text-gray-600">Analyze conversions, trials, and revenue metrics</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={rowDimension} onValueChange={(value: PivotDimension) => setRowDimension(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="associate">Associate</SelectItem>
              <SelectItem value="source">Source</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="stage">Stage</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="date">Date</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={columnDimension} onValueChange={(value: PivotDimension) => setColumnDimension(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="stage">Stage</SelectItem>
              <SelectItem value="source">Source</SelectItem>
              <SelectItem value="associate">Associate</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="date">Date</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={aggregator} onValueChange={(value: AggregatorType) => setAggregator(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="count">Count</SelectItem>
              <SelectItem value="conversion_rate">Conversion Rate</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="sum">Sum</SelectItem>
              <SelectItem value="average">Average</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant={showPercentages ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPercentages(!showPercentages)}
          >
            %
          </Button>
        </div>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {conversionInsights.map((insight, index) => (
          <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  insight.type === 'success' ? 'bg-green-100 text-green-600' :
                  insight.type === 'info' ? 'bg-blue-100 text-blue-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {insight.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">{insight.value}</span>
                    <span className="text-xs text-gray-500">{insight.detail}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pivot Table and Charts */}
      <Tabs value={activeTab} onValueChange={(value: typeof activeTab) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="table">Pivot Table</TabsTrigger>
          <TabsTrigger value="chart">Charts</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Pivot Table - {rowDimension} vs {columnDimension}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">{rowDimension}</TableHead>
                      {pivotData.columnValues.map(col => (
                        <TableHead key={col} className="text-center font-semibold">{col}</TableHead>
                      ))}
                      <TableHead className="text-center font-semibold bg-gray-100">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pivotData.rowValues.map(row => {
                      const maxValue = Math.max(...Object.values(pivotData.data[row]));
                      return (
                        <TableRow key={row}>
                          <TableCell className="font-medium">{row}</TableCell>
                          {pivotData.columnValues.map(col => (
                            <TableCell 
                              key={col} 
                              className={`text-center ${getCellColor(pivotData.data[row][col], maxValue)}`}
                            >
                              {formatValue(pivotData.data[row][col])}
                            </TableCell>
                          ))}
                          <TableCell className="text-center font-semibold bg-gray-100">
                            {formatValue(pivotData.rowTotals[row])}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className="border-t-2 bg-gray-50">
                      <TableCell className="font-bold">Total</TableCell>
                      {pivotData.columnValues.map(col => (
                        <TableCell key={col} className="text-center font-bold">
                          {formatValue(pivotData.columnTotals[col])}
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-bold bg-gray-200">
                        {formatValue(pivotData.grandTotal)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Bar Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    {pivotData.columnValues.slice(0, 5).map((col, index) => (
                      <Bar key={col} dataKey={col} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {filteredLeads.filter(lead => lead.stage === 'Membership Sold').length}
                    </div>
                    <div className="text-sm text-blue-600">Total Conversions</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {filteredLeads.filter(lead => lead.stage === 'Trial Completed').length}
                    </div>
                    <div className="text-sm text-green-600">Trials Completed</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {filteredLeads.filter(lead => lead.stage === 'Trial Scheduled').length}
                    </div>
                    <div className="text-sm text-orange-600">Trials Scheduled</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {filteredLeads.filter(lead => lead.stage === 'Demo').length}
                    </div>
                    <div className="text-sm text-purple-600">Demos Given</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { stage: 'New Enquiry', count: filteredLeads.filter(lead => lead.stage === 'New Enquiry').length },
                    { stage: 'Demo', count: filteredLeads.filter(lead => lead.stage === 'Demo').length },
                    { stage: 'Trial Scheduled', count: filteredLeads.filter(lead => lead.stage === 'Trial Scheduled').length },
                    { stage: 'Trial Completed', count: filteredLeads.filter(lead => lead.stage === 'Trial Completed').length },
                    { stage: 'Membership Sold', count: filteredLeads.filter(lead => lead.stage === 'Membership Sold').length }
                  ].map((item, index) => (
                    <div key={item.stage} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium">{item.stage}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-6 rounded-full flex items-center justify-center text-white text-sm font-medium"
                          style={{ width: `${(item.count / filteredLeads.length) * 100}%` }}
                        >
                          {item.count}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
