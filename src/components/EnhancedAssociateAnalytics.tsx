
import React, { useState, useMemo } from 'react';
import { useLeads } from '@/contexts/LeadContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedBadge } from '@/components/ui/enhanced-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { 
  Users, 
  TrendingUp, 
  Target, 
  Award, 
  Calendar,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Zap,
  Eye,
  UserCheck,
  Activity
} from 'lucide-react';

export const EnhancedAssociateAnalytics = () => {
  const { filteredLeads, associateOptions } = useLeads();
  const [selectedAssociates, setSelectedAssociates] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState<'overview' | 'detailed' | 'performance'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Calculate metrics for each associate
  const associateMetrics = useMemo(() => {
    const metrics: Record<string, any> = {};
    
    associateOptions.forEach(associate => {
      const associateLeads = filteredLeads.filter(lead => lead.associate === associate);
      
      const totalLeads = associateLeads.length;
      const convertedLeads = associateLeads.filter(lead => lead.stage === 'Membership Sold').length;
      const hotLeads = associateLeads.filter(lead => lead.status === 'Hot').length;
      const warmLeads = associateLeads.filter(lead => lead.status === 'Warm').length;
      const coldLeads = associateLeads.filter(lead => lead.status === 'Cold').length;
      const lostLeads = associateLeads.filter(lead => lead.status === 'Lost').length;
      
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
      const avgLeadValue = 75000; // ₹75,000 per conversion
      const revenue = convertedLeads * avgLeadValue;
      
      // Source distribution
      const sourceDistribution = associateLeads.reduce((acc, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Stage distribution
      const stageDistribution = associateLeads.reduce((acc, lead) => {
        acc[lead.stage] = (acc[lead.stage] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentLeads = associateLeads.filter(lead => 
        new Date(lead.createdAt) >= thirtyDaysAgo
      );
      
      metrics[associate] = {
        totalLeads,
        convertedLeads,
        hotLeads,
        warmLeads,
        coldLeads,
        lostLeads,
        conversionRate,
        revenue,
        sourceDistribution,
        stageDistribution,
        recentActivity: recentLeads.length,
        avgResponseTime: '2.5h', // Mock data
        followUpRate: 85, // Mock data
        qualificationRate: (hotLeads + warmLeads) / totalLeads * 100 || 0
      };
    });
    
    return metrics;
  }, [filteredLeads, associateOptions]);

  const handleAssociateSelect = (associate: string) => {
    setSelectedAssociates(prev => 
      prev.includes(associate) 
        ? prev.filter(a => a !== associate)
        : [...prev, associate]
    );
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceLevel = (rate: number) => {
    if (rate >= 80) return 'Excellent';
    if (rate >= 60) return 'Good';
    if (rate >= 40) return 'Average';
    return 'Needs Improvement';
  };

  // Chart colors
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Associate Analytics</h2>
          <p className="text-sm text-gray-600">Compare performance across associates</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(value: typeof timeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={comparisonMode} onValueChange={(value: typeof comparisonMode) => setComparisonMode(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Associate Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Associates to Compare
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {associateOptions.map(associate => (
              <Button
                key={associate}
                variant={selectedAssociates.includes(associate) ? "default" : "outline"}
                size="sm"
                onClick={() => handleAssociateSelect(associate)}
                className="flex items-center gap-2"
              >
                <UserCheck className="h-4 w-4" />
                {associate}
                {selectedAssociates.includes(associate) && (
                  <Badge variant="secondary" className="ml-2">
                    {associateMetrics[associate]?.totalLeads || 0}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
          
          {selectedAssociates.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Selected {selectedAssociates.length} associate(s) for comparison
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Content */}
      {selectedAssociates.length > 0 && (
        <Tabs value={comparisonMode} onValueChange={(value: typeof comparisonMode) => setComparisonMode(value)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedAssociates.map(associate => {
                const metrics = associateMetrics[associate];
                return (
                  <Card key={associate} className="border-2 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-blue-500" />
                        {associate}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{metrics.totalLeads}</div>
                          <div className="text-xs text-gray-600">Total Leads</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{metrics.convertedLeads}</div>
                          <div className="text-xs text-gray-600">Converted</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Conversion Rate</span>
                          <span className={getPerformanceColor(metrics.conversionRate)}>
                            {metrics.conversionRate.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={metrics.conversionRate} className="h-2" />
                      </div>
                      
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span>Revenue</span>
                          <span className="font-semibold">₹{(metrics.revenue / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Performance</span>
                          <span>{getPerformanceLevel(metrics.conversionRate)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Performance Comparison Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={selectedAssociates.map(associate => ({
                    associate,
                    totalLeads: associateMetrics[associate].totalLeads,
                    converted: associateMetrics[associate].convertedLeads,
                    conversionRate: associateMetrics[associate].conversionRate
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="associate" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalLeads" fill="#3b82f6" name="Total Leads" />
                    <Bar dataKey="converted" fill="#10b981" name="Converted" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedAssociates.map(associate => {
                const metrics = associateMetrics[associate];
                return (
                  <Card key={associate} className="border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        {associate} - Detailed Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Status Distribution */}
                      <div>
                        <h4 className="font-semibold mb-2">Lead Status Distribution</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <EnhancedBadge variant="hot" size="sm">Hot</EnhancedBadge>
                            <span className="font-semibold">{metrics.hotLeads}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <EnhancedBadge variant="warm" size="sm">Warm</EnhancedBadge>
                            <span className="font-semibold">{metrics.warmLeads}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <EnhancedBadge variant="cold" size="sm">Cold</EnhancedBadge>
                            <span className="font-semibold">{metrics.coldLeads}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <EnhancedBadge variant="lost" size="sm">Lost</EnhancedBadge>
                            <span className="font-semibold">{metrics.lostLeads}</span>
                          </div>
                        </div>
                      </div>

                      {/* Source Distribution */}
                      <div>
                        <h4 className="font-semibold mb-2">Top Lead Sources</h4>
                        <div className="space-y-2">
                          {Object.entries(metrics.sourceDistribution)
                            .sort(([,a], [,b]) => (b as number) - (a as number))
                            .slice(0, 3)
                            .map(([source, count]) => (
                              <div key={source} className="flex justify-between items-center">
                                <span className="text-sm">{source}</span>
                                <Badge variant="secondary">{String(count)}</Badge>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div>
                        <h4 className="font-semibold mb-2">Recent Activity</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-500" />
                            <span>New Leads: {metrics.recentActivity}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span>Avg Response: {String(metrics.avgResponseTime)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    Conversion Rates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedAssociates.map(associate => {
                      const metrics = associateMetrics[associate];
                      return (
                        <div key={associate} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">{associate}</span>
                            <span className="text-sm font-semibold">{metrics.conversionRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={metrics.conversionRate} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Revenue Generated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedAssociates.map(associate => {
                      const metrics = associateMetrics[associate];
                      return (
                        <div key={associate} className="flex justify-between items-center">
                          <span className="text-sm">{associate}</span>
                          <span className="text-sm font-semibold">₹{(metrics.revenue / 1000).toFixed(0)}K</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-500" />
                    Qualification Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedAssociates.map(associate => {
                      const metrics = associateMetrics[associate];
                      return (
                        <div key={associate} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">{associate}</span>
                            <span className="text-sm font-semibold">{metrics.qualificationRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={metrics.qualificationRate} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* No Selection State */}
      {selectedAssociates.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Associates to Compare</h3>
            <p className="text-gray-600 text-center mb-6">
              Choose one or more associates from the list above to see detailed performance analytics and comparisons.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
