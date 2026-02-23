import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLeads } from '@/contexts/LeadContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target, 
  Users,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Activity,
  Zap,
  Flame,
  Star,
  DollarSign,
  Phone,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ComposedChart } from 'recharts';
import { formatDate } from '@/lib/utils';

interface WeeklyMetrics {
  week: string;
  startDate: Date;
  endDate: Date;
  associate: string;
  leadsGenerated: number;
  leadsConverted: number;
  conversionRate: number;
  revenue: number;
  followUpsCompleted: number;
  followUpsScheduled: number;
  followUpRate: number;
  avgResponseTime: number;
  customerSatisfaction: number;
  weekOverWeekChange: {
    leads: number;
    conversions: number;
    revenue: number;
    followUpRate: number;
  };
}

interface AssociateWeeklyData {
  associate: string;
  weeklyMetrics: WeeklyMetrics[];
  overallTrend: 'improving' | 'declining' | 'stable';
  keyInsights: string[];
  strongestWeek: WeeklyMetrics;
  weekestWeek: WeeklyMetrics;
  averageMetrics: {
    conversion: number;
    revenue: number;
    followUpRate: number;
    responseTime: number;
  };
}

const PERFORMANCE_COLORS = {
  excellent: '#10b981',
  good: '#3b82f6', 
  average: '#f59e0b',
  poor: '#ef4444'
};

const getPerformanceLevel = (value: number, metric: string) => {
  switch (metric) {
    case 'conversionRate':
      if (value >= 40) return 'excellent';
      if (value >= 25) return 'good';
      if (value >= 15) return 'average';
      return 'poor';
    case 'followUpRate':
      if (value >= 90) return 'excellent';
      if (value >= 75) return 'good';
      if (value >= 60) return 'average';
      return 'poor';
    case 'responseTime':
      if (value <= 2) return 'excellent';
      if (value <= 4) return 'good';
      if (value <= 6) return 'average';
      return 'poor';
    default:
      return 'average';
  }
};

const getTrendIcon = (change: number) => {
  if (change > 5) return <ArrowUpRight className="h-4 w-4 text-slate-600" />;
  if (change < -5) return <ArrowDownRight className="h-4 w-4 text-slate-600" />;
  return <Activity className="h-4 w-4 text-slate-500" />;
};

const getTrendColor = (change: number) => {
  if (change > 5) return 'text-slate-700 bg-slate-50 border-slate-200';
  if (change < -5) return 'text-slate-700 bg-slate-100 border-slate-300';
  return 'text-slate-600 bg-slate-50 border-slate-200';
};

export function WeeklyPerformance() {
  const { filteredLeads, loading } = useLeads();
  const [selectedAssociate, setSelectedAssociate] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<string>('conversionRate');
  const [weekRange, setWeekRange] = useState<number>(12); // Show last 12 weeks

  // Generate weekly performance data
  const weeklyPerformanceData = useMemo(() => {
    if (!filteredLeads || filteredLeads.length === 0) return [];

    const associates = [...new Set(filteredLeads.map(lead => lead.associate).filter(Boolean))];
    
    return associates.map(associate => {
      const associateLeads = filteredLeads.filter(lead => lead.associate === associate);
      
      // Generate last 12 weeks of data
      const weeklyMetrics: WeeklyMetrics[] = [];
      
      for (let i = weekRange - 1; i >= 0; i--) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - (i * 7));
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6);
        
        const weekLeads = associateLeads.filter(lead => {
          const leadDate = new Date(lead.createdAt);
          return leadDate >= startDate && leadDate <= endDate;
        });

        const convertedLeads = weekLeads.filter(lead => lead.stage === 'Membership Sold');
        const followUpsCompleted = weekLeads.filter(lead => 
          lead.followUp1Date || lead.followUp2Date || lead.followUp3Date || lead.followUp4Date
        );

        const conversionRate = weekLeads.length > 0 ? (convertedLeads.length / weekLeads.length) * 100 : 0;
        const followUpRate = weekLeads.length > 0 ? (followUpsCompleted.length / weekLeads.length) * 100 : 0;

        // Calculate week-over-week changes
        const prevWeekMetrics = weeklyMetrics[weeklyMetrics.length - 1];
        const weekOverWeekChange = prevWeekMetrics ? {
          leads: weekLeads.length - prevWeekMetrics.leadsGenerated,
          conversions: convertedLeads.length - prevWeekMetrics.leadsConverted,
          revenue: (convertedLeads.length * 75000) - prevWeekMetrics.revenue,
          followUpRate: followUpRate - prevWeekMetrics.followUpRate
        } : { leads: 0, conversions: 0, revenue: 0, followUpRate: 0 };

        weeklyMetrics.push({
          week: `Week ${weekRange - i}`,
          startDate,
          endDate,
          associate,
          leadsGenerated: weekLeads.length,
          leadsConverted: convertedLeads.length,
          conversionRate,
          revenue: convertedLeads.length * 75000,
          followUpsCompleted: followUpsCompleted.length,
          followUpsScheduled: weekLeads.length,
          followUpRate,
          avgResponseTime: 0, // Would need real response time tracking
          customerSatisfaction: 0, // Would need customer feedback system
          weekOverWeekChange
        });
      }

      // Calculate overall trends and insights
      const recentWeeks = weeklyMetrics.slice(-4);
      const olderWeeks = weeklyMetrics.slice(-8, -4);
      
      const recentAvg = recentWeeks.reduce((sum, week) => sum + week.conversionRate, 0) / recentWeeks.length;
      const olderAvg = olderWeeks.reduce((sum, week) => sum + week.conversionRate, 0) / olderWeeks.length;
      
      const overallTrend = recentAvg > olderAvg + 2 ? 'improving' : 
                          recentAvg < olderAvg - 2 ? 'declining' : 'stable';

      const strongestWeek = weeklyMetrics.reduce((best, current) => 
        current.conversionRate > best.conversionRate ? current : best
      );
      
      const weekestWeek = weeklyMetrics.reduce((worst, current) => 
        current.conversionRate < worst.conversionRate ? current : worst
      );

      // Generate insights
      const keyInsights = [];
      if (overallTrend === 'improving') {
        keyInsights.push('📈 Performance trending upward over last 4 weeks');
      } else if (overallTrend === 'declining') {
        keyInsights.push('📉 Performance showing decline - needs attention');
      }

      const avgFollowUpRate = weeklyMetrics.reduce((sum, week) => sum + week.followUpRate, 0) / weeklyMetrics.length;
      if (avgFollowUpRate > 85) {
        keyInsights.push('⭐ Excellent follow-up consistency');
      } else if (avgFollowUpRate < 60) {
        keyInsights.push('⚠️ Follow-up rate below optimal level');
      }

      const lastWeekChange = weeklyMetrics[weeklyMetrics.length - 1]?.weekOverWeekChange.conversions || 0;
      if (lastWeekChange > 0) {
        keyInsights.push(`🚀 +${lastWeekChange} more conversions than last week`);
      }

      return {
        associate,
        weeklyMetrics,
        overallTrend,
        keyInsights,
        strongestWeek,
        weekestWeek,
        averageMetrics: {
          conversion: weeklyMetrics.reduce((sum, week) => sum + week.conversionRate, 0) / weeklyMetrics.length,
          revenue: weeklyMetrics.reduce((sum, week) => sum + week.revenue, 0) / weeklyMetrics.length,
          followUpRate: avgFollowUpRate,
          responseTime: weeklyMetrics.reduce((sum, week) => sum + week.avgResponseTime, 0) / weeklyMetrics.length
        }
      } as AssociateWeeklyData;
    });
  }, [filteredLeads, weekRange]);

  // Filter data based on selection
  const displayData = selectedAssociate === 'all' ? weeklyPerformanceData : 
    weeklyPerformanceData.filter(data => data.associate === selectedAssociate);

  // Aggregate data for charts
  const chartData = useMemo(() => {
    if (selectedAssociate === 'all') {
      // Aggregate all associates' data
      const weekNumbers = weeklyPerformanceData[0]?.weeklyMetrics.map(w => w.week) || [];
      
      return weekNumbers.map(week => {
        const weekData = weeklyPerformanceData.reduce((acc, associateData) => {
          const weekMetrics = associateData.weeklyMetrics.find(w => w.week === week);
          if (weekMetrics) {
            acc.leadsGenerated += weekMetrics.leadsGenerated;
            acc.leadsConverted += weekMetrics.leadsConverted;
            acc.revenue += weekMetrics.revenue;
            acc.followUpsCompleted += weekMetrics.followUpsCompleted;
            acc.followUpsScheduled += weekMetrics.followUpsScheduled;
            acc.count += 1;
          }
          return acc;
        }, { leadsGenerated: 0, leadsConverted: 0, revenue: 0, followUpsCompleted: 0, followUpsScheduled: 0, count: 0 });

        return {
          week,
          leadsGenerated: weekData.leadsGenerated,
          leadsConverted: weekData.leadsConverted,
          conversionRate: weekData.leadsGenerated > 0 ? (weekData.leadsConverted / weekData.leadsGenerated) * 100 : 0,
          revenue: weekData.revenue,
          followUpRate: weekData.followUpsScheduled > 0 ? (weekData.followUpsCompleted / weekData.followUpsScheduled) * 100 : 0
        };
      });
    } else {
      return displayData[0]?.weeklyMetrics.map(week => ({
        week: week.week,
        leadsGenerated: week.leadsGenerated,
        leadsConverted: week.leadsConverted,
        conversionRate: week.conversionRate,
        revenue: week.revenue,
        followUpRate: week.followUpRate
      })) || [];
    }
  }, [weeklyPerformanceData, selectedAssociate, displayData]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading weekly performance data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Calendar className="h-6 w-6 text-indigo-600" />
                Weekly Performance Analysis
              </CardTitle>
              <p className="text-slate-600">Week-over-week trends and comparative performance metrics</p>
            </div>
            
            <div className="flex items-center gap-3">
              <select 
                value={selectedAssociate} 
                onChange={(e) => setSelectedAssociate(e.target.value)}
                className="px-3 py-2 border border-indigo-300 rounded-lg bg-white"
              >
                <option value="all">All Associates</option>
                {weeklyPerformanceData.map(data => (
                  <option key={data.associate} value={data.associate}>
                    {data.associate}
                  </option>
                ))}
              </select>
              
              <select 
                value={weekRange} 
                onChange={(e) => setWeekRange(Number(e.target.value))}
                className="px-3 py-2 border border-indigo-300 rounded-lg bg-white"
              >
                <option value={8}>Last 8 Weeks</option>
                <option value={12}>Last 12 Weeks</option>
                <option value={16}>Last 16 Weeks</option>
                <option value={24}>Last 24 Weeks</option>
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Performance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayData.map(data => (
              <Card key={data.associate} className="bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">{data.associate}</CardTitle>
                    <div className={`p-2 rounded-full ${
                      data.overallTrend === 'improving' ? 'bg-green-100' :
                      data.overallTrend === 'declining' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      {data.overallTrend === 'improving' ? <TrendingUp className="h-5 w-5 text-green-600" /> :
                       data.overallTrend === 'declining' ? <TrendingDown className="h-5 w-5 text-red-600" /> :
                       <Activity className="h-5 w-5 text-yellow-600" />}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <div className="font-bold text-blue-800">{data.averageMetrics.conversion.toFixed(1)}%</div>
                      <div className="text-blue-600 text-xs">Avg Conversion</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <div className="font-bold text-green-800">{data.averageMetrics.followUpRate.toFixed(1)}%</div>
                      <div className="text-green-600 text-xs">Follow-up Rate</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Best Week:</span>
                      <span className="font-semibold">{data.strongestWeek.conversionRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Avg Revenue/Week:</span>
                      <span className="font-semibold">₹{(data.averageMetrics.revenue / 1000).toFixed(0)}K</span>
                    </div>
                  </div>

                  {/* Trend Badge */}
                  <Badge className={`w-full justify-center ${
                    data.overallTrend === 'improving' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                    data.overallTrend === 'declining' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                    'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  }`}>
                    {data.overallTrend === 'improving' ? '📈 Improving' :
                     data.overallTrend === 'declining' ? '📉 Declining' : '➡️ Stable'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Weekly Performance Trends
                {selectedAssociate !== 'all' && (
                  <Badge variant="outline" className="ml-2">{selectedAssociate}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="leadsGenerated" fill="#3b82f6" name="Leads Generated" />
                  <Line yAxisId="right" type="monotone" dataKey="conversionRate" stroke="#10b981" strokeWidth={3} name="Conversion Rate %" />
                  <Line yAxisId="right" type="monotone" dataKey="followUpRate" stroke="#f59e0b" strokeWidth={2} name="Follow-up Rate %" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversion Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Conversion Rate Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="conversionRate" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Changes Table */}
          <Card>
            <CardHeader>
              <CardTitle>Week-over-Week Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Week</th>
                      <th className="text-left p-2">Leads</th>
                      <th className="text-left p-2">Conversions</th>
                      <th className="text-left p-2">Conversion Rate</th>
                      <th className="text-left p-2">WoW Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.slice(-8).map((week, index) => {
                      const prevWeek = chartData[chartData.indexOf(week) - 1];
                      const changePercent = prevWeek ? ((week.conversionRate - prevWeek.conversionRate) / prevWeek.conversionRate) * 100 : 0;
                      
                      return (
                        <tr key={week.week} className="border-b hover:bg-slate-50">
                          <td className="p-2 font-medium">{week.week}</td>
                          <td className="p-2">{week.leadsGenerated}</td>
                          <td className="p-2">{week.leadsConverted}</td>
                          <td className="p-2">{week.conversionRate.toFixed(1)}%</td>
                          <td className="p-2">
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs ${getTrendColor(changePercent)}`}>
                              {getTrendIcon(changePercent)}
                              {Math.abs(changePercent).toFixed(1)}%
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6 mt-6">
          {/* Associate Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Associate Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyPerformanceData.map(data => (
                  <div key={data.associate} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{data.associate}</h4>
                      <Badge className={
                        data.overallTrend === 'improving' ? 'bg-green-100 text-green-800' :
                        data.overallTrend === 'declining' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {data.overallTrend}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-slate-600">Avg Conversion</div>
                        <div className="font-bold text-lg">{data.averageMetrics.conversion.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-slate-600">Avg Revenue/Week</div>
                        <div className="font-bold text-lg">₹{(data.averageMetrics.revenue / 1000).toFixed(0)}K</div>
                      </div>
                      <div>
                        <div className="text-slate-600">Follow-up Rate</div>
                        <div className="font-bold text-lg">{data.averageMetrics.followUpRate.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-slate-600">Response Time</div>
                        <div className="font-bold text-lg">{data.averageMetrics.responseTime.toFixed(1)}h</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6 mt-6">
          {/* Key Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayData.map(data => (
              <Card key={data.associate}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    {data.associate} - Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.keyInsights.map((insight, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                  
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <h5 className="font-semibold mb-2">Performance Highlights</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Best Week Performance:</span>
                        <span className="font-semibold text-green-600">{data.strongestWeek.conversionRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Most Challenging Week:</span>
                        <span className="font-semibold text-red-600">{data.weekestWeek.conversionRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Performance Range:</span>
                        <span className="font-semibold">{(data.strongestWeek.conversionRate - data.weekestWeek.conversionRate).toFixed(1)}% variance</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}