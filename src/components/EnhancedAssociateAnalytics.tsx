
import React, { useState, useMemo } from 'react';
import { useLeads, Lead } from '@/contexts/LeadContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
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
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  Users, 
  Target, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Award,
  Clock,
  Activity,
  CheckCircle,
  Calendar,
  Phone,
  Mail,
  Star,
  Zap,
  BarChart3,
  User
} from 'lucide-react';
import { formatRevenue, formatDate, countByKey } from '@/lib/utils';

// Helper function to group leads by a field
const groupLeadsByField = (leads: Lead[], field: keyof Lead) => {
  return leads.reduce((acc: Record<string, Lead[]>, lead) => {
    const key = String(lead[field]);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(lead);
    return acc;
  }, {});
};

interface AssociateMetrics {
  name: string;
  totalLeads: number;
  conversions: number;
  trials: number;
  conversionRate: number;
  trialConversionRate: number;
  revenue: number;
  avgDealSize: number;
  avgResponseTime: number;
  followUpRate: number;
  leadSources: Record<string, number>;
  monthlyTrends: Array<{
    month: string;
    leads: number;
    conversions: number;
    revenue: number;
  }>;
  performanceScore: number;
  rank: number;
}

export function EnhancedAssociateAnalytics() {
  const { filteredLeads, loading, associateOptions } = useLeads();
  const [selectedAssociates, setSelectedAssociates] = useState<string[]>([]);
  const [comparisonMetric, setComparisonMetric] = useState('conversionRate');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'radar'>('line');
  const [timeRange, setTimeRange] = useState('3months');

  const metrics = [
    { value: 'conversionRate', label: 'Conversion Rate' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'totalLeads', label: 'Total Leads' },
    { value: 'followUpRate', label: 'Follow-up Rate' },
    { value: 'performanceScore', label: 'Performance Score' }
  ];

  const associateMetrics = useMemo(() => {
    const avgDealValue = 75000;
    const metrics: AssociateMetrics[] = [];
    
    associateOptions.forEach((associate, index) => {
      const associateLeads = filteredLeads.filter(lead => lead.associate === associate);
      const conversions = associateLeads.filter(lead => 
        lead.stage === 'Membership Sold' || lead.stage === 'Closed Won'
      );
      const trials = associateLeads.filter(lead => 
        lead.stage === 'Trial Scheduled' || lead.stage === 'Trial Completed'
      );
      
      // Calculate follow-up rate
      const leadsWithFollowUp = associateLeads.filter(lead => 
        lead.followUp1Date || lead.followUp2Date || lead.followUp3Date || lead.followUp4Date
      );
      
      // Calculate monthly trends
      const monthlyData = groupLeadsByField(associateLeads, 'createdAt');
      const monthlyTrends = Object.entries(monthlyData)
        .map(([_, leads]) => {
          const firstLead = leads[0];
          if (!firstLead) return null;
          
          const date = new Date(firstLead.createdAt);
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          return {
            month,
            leads: leads.length,
            conversions: leads.filter(l => l.stage === 'Membership Sold' || l.stage === 'Closed Won').length,
            revenue: leads.filter(l => l.stage === 'Membership Sold' || l.stage === 'Closed Won').length * avgDealValue
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6);
      
      const conversionRate = associateLeads.length > 0 ? (conversions.length / associateLeads.length) * 100 : 0;
      const trialConversionRate = trials.length > 0 ? (conversions.length / trials.length) * 100 : 0;
      const followUpRate = associateLeads.length > 0 ? (leadsWithFollowUp.length / associateLeads.length) * 100 : 0;
      
      // Calculate performance score (weighted average)
      const performanceScore = (
        (conversionRate * 0.4) + 
        (trialConversionRate * 0.3) + 
        (followUpRate * 0.2) + 
        (Math.min(associateLeads.length / 10, 10) * 0.1)
      );
      
      metrics.push({
        name: associate,
        totalLeads: associateLeads.length,
        conversions: conversions.length,
        trials: trials.length,
        conversionRate,
        trialConversionRate,
        revenue: conversions.length * avgDealValue,
        avgDealSize: avgDealValue,
        avgResponseTime: 24, // Mock data
        followUpRate,
        leadSources: countByKey(associateLeads, 'source'),
        monthlyTrends,
        performanceScore,
        rank: index + 1
      });
    });
    
    // Sort by performance score and assign ranks
    metrics.sort((a, b) => b.performanceScore - a.performanceScore);
    metrics.forEach((metric, index) => {
      metric.rank = index + 1;
    });
    
    return metrics;
  }, [filteredLeads, associateOptions]);

  const comparisonData = useMemo(() => {
    if (selectedAssociates.length === 0) return [];
    
    const selectedMetrics = associateMetrics.filter(m => selectedAssociates.includes(m.name));
    
    // Create comparison data for charts
    const months = selectedMetrics[0]?.monthlyTrends.map(t => t.month) || [];
    
    return months.map(month => {
      const dataPoint: any = { month };
      selectedMetrics.forEach(metric => {
        const monthData = metric.monthlyTrends.find(t => t.month === month);
        dataPoint[metric.name] = monthData ? monthData[comparisonMetric as keyof typeof monthData] : 0;
      });
      return dataPoint;
    });
  }, [selectedAssociates, associateMetrics, comparisonMetric]);

  const radarData = useMemo(() => {
    if (selectedAssociates.length === 0) return [];
    
    const selectedMetrics = associateMetrics.filter(m => selectedAssociates.includes(m.name));
    
    const categories = [
      { key: 'conversionRate', label: 'Conversion Rate', max: 100 },
      { key: 'followUpRate', label: 'Follow-up Rate', max: 100 },
      { key: 'trialConversionRate', label: 'Trial Conversion', max: 100 },
      { key: 'totalLeads', label: 'Lead Volume', max: Math.max(...selectedMetrics.map(m => m.totalLeads)) },
      { key: 'performanceScore', label: 'Performance Score', max: 100 }
    ];
    
    return categories.map(category => {
      const dataPoint: any = { category: category.label };
      selectedMetrics.forEach(metric => {
        const value = metric[category.key as keyof AssociateMetrics];
        dataPoint[metric.name] = typeof value === 'number' ? value : 0;
      });
      return dataPoint;
    });
  }, [selectedAssociates, associateMetrics]);

  const handleAssociateToggle = (associate: string) => {
    setSelectedAssociates(prev => 
      prev.includes(associate) 
        ? prev.filter(a => a !== associate)
        : [...prev, associate]
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Award className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Award className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Award className="h-4 w-4 text-amber-600" />;
    return <span className="text-sm font-medium">#{rank}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Associate Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Associate Performance Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {associateMetrics.map((metric) => (
              <div
                key={metric.name}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedAssociates.includes(metric.name)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleAssociateToggle(metric.name)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedAssociates.includes(metric.name)}
                    onChange={() => handleAssociateToggle(metric.name)}
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(metric.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{metric.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getRankBadge(metric.rank)}
                      <Badge className={getPerformanceColor(metric.performanceScore)}>
                        {metric.performanceScore.toFixed(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Leads:</span>
                    <span className="ml-1 font-medium">{metric.totalLeads}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Conv:</span>
                    <span className="ml-1 font-medium">{metric.conversionRate.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Revenue:</span>
                    <span className="ml-1 font-medium">{formatRevenue(metric.revenue)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Trials:</span>
                    <span className="ml-1 font-medium">{metric.trials}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Controls */}
      {selectedAssociates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Side-by-Side Comparison
              <Badge variant="outline" className="ml-2">
                {selectedAssociates.length} Associates
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Metric:</label>
                <Select value={comparisonMetric} onValueChange={setComparisonMetric}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {metrics.map(metric => (
                      <SelectItem key={metric.value} value={metric.value}>
                        {metric.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Chart Type:</label>
                <Select value={chartType} onValueChange={(value: 'line' | 'bar' | 'radar') => setChartType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="radar">Radar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Chart */}
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'radar' ? (
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis />
                    {selectedAssociates.map((associate, index) => (
                      <Radar
                        key={associate}
                        name={associate}
                        dataKey={associate}
                        stroke={`hsl(${index * 137.5 % 360}, 70%, 50%)`}
                        fill={`hsl(${index * 137.5 % 360}, 70%, 50%)`}
                        fillOpacity={0.3}
                      />
                    ))}
                    <Legend />
                  </RadarChart>
                ) : chartType === 'bar' ? (
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {selectedAssociates.map((associate, index) => (
                      <Bar
                        key={associate}
                        dataKey={associate}
                        fill={`hsl(${index * 137.5 % 360}, 70%, 50%)`}
                      />
                    ))}
                  </BarChart>
                ) : (
                  <LineChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {selectedAssociates.map((associate, index) => (
                      <Line
                        key={associate}
                        type="monotone"
                        dataKey={associate}
                        stroke={`hsl(${index * 137.5 % 360}, 70%, 50%)`}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Comparison Table */}
      {selectedAssociates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Associate</TableHead>
                    <TableHead className="text-right">Rank</TableHead>
                    <TableHead className="text-right">Total Leads</TableHead>
                    <TableHead className="text-right">Conversions</TableHead>
                    <TableHead className="text-right">Conv. Rate</TableHead>
                    <TableHead className="text-right">Trials</TableHead>
                    <TableHead className="text-right">Trial Conv.</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Follow-up Rate</TableHead>
                    <TableHead className="text-right">Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {associateMetrics
                    .filter(metric => selectedAssociates.includes(metric.name))
                    .map((metric) => (
                      <TableRow key={metric.name}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                                {getInitials(metric.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{metric.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            {getRankBadge(metric.rank)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{metric.totalLeads}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {metric.conversions}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={metric.conversionRate >= 20 ? 'default' : 'secondary'}>
                            {metric.conversionRate.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Calendar className="h-3 w-3 text-orange-500" />
                            {metric.trials}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {metric.trialConversionRate.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatRevenue(metric.revenue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {metric.followUpRate.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className={getPerformanceColor(metric.performanceScore)}>
                            {metric.performanceScore.toFixed(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
