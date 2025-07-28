
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLeads } from '@/contexts/LeadContext';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar, 
  Target, 
  Award, 
  Users, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Filter
} from 'lucide-react';
import { formatDate, formatNumber, formatRevenue } from '@/lib/utils';

interface MonthlyData {
  month: string;
  leadsReceived: number;
  membershipsSold: number;
  trialCompleted: number;
  leadToTrialConversion: number;
  trialToSoldConversion: number;
  leadToSoldConversion: number;
}

interface PerformanceMetrics {
  [key: string]: MonthlyData[];
}

export function LeadPerformanceView() {
  const { filteredLeads, loading } = useLeads();
  const [selectedMetric, setSelectedMetric] = useState<string>('leadsReceived');
  const [selectedView, setSelectedView] = useState<string>('source');
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const metricOptions = [
    { value: 'leadsReceived', label: 'Leads Received', icon: <Users className="h-3 w-3" /> },
    { value: 'membershipsSold', label: 'Memberships Sold', icon: <Award className="h-3 w-3" /> },
    { value: 'trialCompleted', label: 'Trial Completed', icon: <Target className="h-3 w-3" /> },
    { value: 'leadToTrialConversion', label: 'Lead to Trial %', icon: <TrendingUp className="h-3 w-3" /> },
    { value: 'trialToSoldConversion', label: 'Trial to Sold %', icon: <TrendingUp className="h-3 w-3" /> },
    { value: 'leadToSoldConversion', label: 'Lead to Sold %', icon: <Activity className="h-3 w-3" /> }
  ];

  const viewOptions = [
    { value: 'source', label: 'Source Analysis' },
    { value: 'associate', label: 'Associate Analysis' },
    { value: 'stage', label: 'Stage Analysis' },
    { value: 'status', label: 'Status Analysis' }
  ];

  // Generate month labels for the last 12 months
  const monthLabels = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
    }
    return months;
  }, []);

  // Process leads data into monthly performance metrics
  const performanceData = useMemo(() => {
    if (!filteredLeads || filteredLeads.length === 0) {
      return {};
    }

    const data: PerformanceMetrics = {};
    
    // Get unique values for the selected view
    const uniqueValues = [...new Set(filteredLeads.map(lead => {
      switch(selectedView) {
        case 'source': return lead.source || 'Unknown';
        case 'associate': return lead.associate || 'Unknown';
        case 'stage': return lead.stage || 'Unknown';
        case 'status': return lead.status || 'Unknown';
        default: return lead.source || 'Unknown';
      }
    }))].filter(Boolean);

    uniqueValues.forEach(value => {
      const valueLeads = filteredLeads.filter(lead => {
        switch(selectedView) {
          case 'source': return (lead.source || 'Unknown') === value;
          case 'associate': return (lead.associate || 'Unknown') === value;
          case 'stage': return (lead.stage || 'Unknown') === value;
          case 'status': return (lead.status || 'Unknown') === value;
          default: return (lead.source || 'Unknown') === value;
        }
      });

      data[value] = monthLabels.map(month => {
        // Parse month for comparison
        const [monthName, year] = month.split(' ');
        const monthIndex = new Date(Date.parse(monthName + " 1, 2000")).getMonth();
        const fullYear = 2000 + parseInt(year);
        
        // Filter leads for this month
        const monthLeads = valueLeads.filter(lead => {
          if (!lead.createdAt) return false;
          try {
            const leadDate = new Date(lead.createdAt);
            return leadDate.getMonth() === monthIndex && leadDate.getFullYear() === fullYear;
          } catch (error) {
            console.error('Error parsing date:', lead.createdAt, error);
            return false;
          }
        });

        const leadsReceived = monthLeads.length;
        const membershipsSold = monthLeads.filter(lead => 
          lead.stage === 'Membership Sold' || lead.status === 'Converted'
        ).length;
        const trialCompleted = monthLeads.filter(lead => 
          lead.stage === 'Trial Completed' || lead.stage === 'Membership Sold'
        ).length;
        
        const leadToTrialConversion = leadsReceived > 0 ? (trialCompleted / leadsReceived) * 100 : 0;
        const trialToSoldConversion = trialCompleted > 0 ? (membershipsSold / trialCompleted) * 100 : 0;
        const leadToSoldConversion = leadsReceived > 0 ? (membershipsSold / leadsReceived) * 100 : 0;

        return {
          month,
          leadsReceived,
          membershipsSold,
          trialCompleted,
          leadToTrialConversion: Math.round(leadToTrialConversion * 100) / 100,
          trialToSoldConversion: Math.round(trialToSoldConversion * 100) / 100,
          leadToSoldConversion: Math.round(leadToSoldConversion * 100) / 100
        };
      });
    });

    return data;
  }, [filteredLeads, selectedView, monthLabels]);

  // Calculate totals for each month
  const monthlyTotals = useMemo(() => {
    return monthLabels.map(month => {
      const monthData = Object.values(performanceData).reduce((acc, valueData) => {
        const monthEntry = valueData.find(entry => entry.month === month);
        if (monthEntry) {
          acc.leadsReceived += monthEntry.leadsReceived;
          acc.membershipsSold += monthEntry.membershipsSold;
          acc.trialCompleted += monthEntry.trialCompleted;
        }
        return acc;
      }, {
        month,
        leadsReceived: 0,
        membershipsSold: 0,
        trialCompleted: 0,
        leadToTrialConversion: 0,
        trialToSoldConversion: 0,
        leadToSoldConversion: 0
      });

      // Calculate conversion rates for totals
      monthData.leadToTrialConversion = monthData.leadsReceived > 0 ? 
        Math.round((monthData.trialCompleted / monthData.leadsReceived) * 10000) / 100 : 0;
      monthData.trialToSoldConversion = monthData.trialCompleted > 0 ? 
        Math.round((monthData.membershipsSold / monthData.trialCompleted) * 10000) / 100 : 0;
      monthData.leadToSoldConversion = monthData.leadsReceived > 0 ? 
        Math.round((monthData.membershipsSold / monthData.leadsReceived) * 10000) / 100 : 0;

      return monthData;
    });
  }, [performanceData, monthLabels]);

  // Calculate row totals
  const rowTotals = useMemo(() => {
    const totals: Record<string, MonthlyData> = {};
    
    Object.entries(performanceData).forEach(([key, data]) => {
      totals[key] = data.reduce((acc, monthData) => ({
        month: 'Total',
        leadsReceived: acc.leadsReceived + monthData.leadsReceived,
        membershipsSold: acc.membershipsSold + monthData.membershipsSold,
        trialCompleted: acc.trialCompleted + monthData.trialCompleted,
        leadToTrialConversion: 0,
        trialToSoldConversion: 0,
        leadToSoldConversion: 0
      }), {
        month: 'Total',
        leadsReceived: 0,
        membershipsSold: 0,
        trialCompleted: 0,
        leadToTrialConversion: 0,
        trialToSoldConversion: 0,
        leadToSoldConversion: 0
      });

      // Calculate conversion rates
      if (totals[key].leadsReceived > 0) {
        totals[key].leadToTrialConversion = Math.round((totals[key].trialCompleted / totals[key].leadsReceived) * 10000) / 100;
        totals[key].leadToSoldConversion = Math.round((totals[key].membershipsSold / totals[key].leadsReceived) * 10000) / 100;
      }
      if (totals[key].trialCompleted > 0) {
        totals[key].trialToSoldConversion = Math.round((totals[key].membershipsSold / totals[key].trialCompleted) * 10000) / 100;
      }
    });

    return totals;
  }, [performanceData]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const formatMetricValue = (value: number, metric: string) => {
    if (metric.includes('Conversion')) {
      return `${value}%`;
    }
    return formatNumber(value);
  };

  const getMetricIcon = (metric: string) => {
    const option = metricOptions.find(opt => opt.value === metric);
    return option?.icon || <BarChart3 className="h-3 w-3" />;
  };

  const getCellColor = (value: number, metric: string) => {
    if (metric.includes('Conversion')) {
      if (value >= 50) return 'bg-green-100 text-green-800 border-green-200';
      if (value >= 25) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      if (value >= 10) return 'bg-orange-100 text-orange-800 border-orange-200';
      return 'bg-red-100 text-red-800 border-red-200';
    } else {
      if (value >= 50) return 'bg-blue-100 text-blue-800 border-blue-200';
      if (value >= 20) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      if (value >= 10) return 'bg-purple-100 text-purple-800 border-purple-200';
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="mt-4 text-muted-foreground text-sm">Loading performance data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="bg-gradient-to-r from-slate-50 to-white border-slate-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Lead Performance Analytics
              </CardTitle>
              <p className="text-slate-600 mt-1 text-sm">Month-on-month performance comparison across different metrics</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={selectedView} onValueChange={setSelectedView}>
                <SelectTrigger className="w-48 bg-white border-slate-300 text-sm">
                  <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent>
                  {viewOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="text-sm">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-56 bg-white border-slate-300 text-sm">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  {metricOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="text-sm">
                      <div className="flex items-center gap-2">
                        {option.icon}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-white border-slate-300 text-sm"
              >
                <RefreshCw className={`h-3 w-3 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Performance Table */}
      <Card className="shadow-xl border-slate-200 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getMetricIcon(selectedMetric)}
            {metricOptions.find(opt => opt.value === selectedMetric)?.label} - {viewOptions.find(opt => opt.value === selectedView)?.label}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="font-mono text-xs">
              <TableHeader className="bg-gradient-to-r from-slate-700 to-slate-800 sticky top-0 z-10">
                <TableRow className="border-b border-slate-600">
                  <TableHead className="text-white font-bold text-xs w-[200px] bg-slate-800 h-[50px] text-left">
                    {selectedView.charAt(0).toUpperCase() + selectedView.slice(1)}
                  </TableHead>
                  {monthLabels.map((month) => (
                    <TableHead key={month} className="text-white font-bold text-xs text-center min-w-[100px] h-[50px]">
                      {month}
                    </TableHead>
                  ))}
                  <TableHead className="text-white font-bold text-xs text-center min-w-[100px] bg-slate-800 h-[50px]">
                    TOTAL
                  </TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody className="bg-white">
                {Object.entries(performanceData).map(([key, data], rowIndex) => (
                  <TableRow 
                    key={key} 
                    className={`hover:bg-slate-50 transition-colors border-b border-slate-100 h-[50px] ${
                      rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <TableCell className="font-semibold text-slate-800 bg-slate-100 border-r border-slate-200 h-[50px] text-left">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-teal-600"></div>
                        <span className="truncate max-w-[160px] text-xs">{key}</span>
                      </div>
                    </TableCell>
                    
                    {data.map((monthData) => {
                      const value = monthData[selectedMetric as keyof MonthlyData] as number;
                      
                      return (
                        <TableCell 
                          key={monthData.month} 
                          className="text-center p-2 h-[50px] align-middle"
                        >
                          <Badge 
                            className={`${getCellColor(value, selectedMetric)} font-mono text-xs px-2 py-1 min-w-[50px] justify-center border`}
                          >
                            {formatMetricValue(value, selectedMetric)}
                          </Badge>
                        </TableCell>
                      );
                    })}
                    
                    <TableCell className="text-center font-bold bg-slate-100 border-l border-slate-200 h-[50px] align-middle">
                      <Badge 
                        className={`${getCellColor(rowTotals[key][selectedMetric as keyof MonthlyData] as number, selectedMetric)} font-mono text-xs px-2 py-1 min-w-[50px] justify-center font-bold border`}
                      >
                        {formatMetricValue(rowTotals[key][selectedMetric as keyof MonthlyData] as number, selectedMetric)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-700">Total Leads</p>
                <p className="text-xl font-bold text-green-800">
                  {filteredLeads.length.toLocaleString()}
                </p>
              </div>
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-700">Converted</p>
                <p className="text-xl font-bold text-blue-800">
                  {filteredLeads.filter(lead => lead.stage === 'Membership Sold' || lead.status === 'Converted').length}
                </p>
              </div>
              <Award className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-700">Conversion Rate</p>
                <p className="text-xl font-bold text-purple-800">
                  {filteredLeads.length > 0 ? Math.round((filteredLeads.filter(lead => lead.stage === 'Membership Sold' || lead.status === 'Converted').length / filteredLeads.length) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default LeadPerformanceView;
