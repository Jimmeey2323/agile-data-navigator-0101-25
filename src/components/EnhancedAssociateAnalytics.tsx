
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeads } from '@/contexts/LeadContext';
import { 
  Users, 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar,
  Phone,
  Mail,
  Star,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Zap
} from 'lucide-react';
import { formatRevenue, formatDate } from '@/lib/utils';

export function EnhancedAssociateAnalytics() {
  const { filteredLeads, associateOptions } = useLeads();
  const [selectedAssociates, setSelectedAssociates] = useState<string[]>([]);
  const [comparisonMetric, setComparisonMetric] = useState<string>('conversions');

  const comparisonMetrics = [
    { value: 'conversions', label: 'Conversions', icon: Trophy },
    { value: 'leads', label: 'Total Leads', icon: Users },
    { value: 'trials', label: 'Trials', icon: Calendar },
    { value: 'revenue', label: 'Revenue', icon: TrendingUp },
    { value: 'conversionRate', label: 'Conversion Rate', icon: Target }
  ];

  const associateStats = useMemo(() => {
    const stats: Record<string, any> = {};
    
    associateOptions.forEach(associate => {
      const associateLeads = filteredLeads.filter(lead => lead.associate === associate);
      const conversions = associateLeads.filter(lead => lead.stage === 'Membership Sold').length;
      const trials = associateLeads.filter(lead => 
        lead.stage === 'Trial Scheduled' || lead.stage === 'Trial Completed'
      ).length;
      const revenue = conversions * 75000;
      const conversionRate = associateLeads.length > 0 ? (conversions / associateLeads.length) * 100 : 0;
      
      // Source breakdown
      const sourceBreakdown = associateLeads.reduce((acc, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Status breakdown
      const statusBreakdown = associateLeads.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Stage breakdown
      const stageBreakdown = associateLeads.reduce((acc, lead) => {
        acc[lead.stage] = (acc[lead.stage] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Recent activity
      const recentLeads = associateLeads
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      
      stats[associate] = {
        totalLeads: associateLeads.length,
        conversions,
        trials,
        revenue,
        conversionRate,
        sourceBreakdown,
        statusBreakdown,
        stageBreakdown,
        recentLeads,
        avgFollowUps: associateLeads.reduce((acc, lead) => {
          let followUps = 0;
          if (lead.followUp1Date) followUps++;
          if (lead.followUp2Date) followUps++;
          if (lead.followUp3Date) followUps++;
          if (lead.followUp4Date) followUps++;
          return acc + followUps;
        }, 0) / associateLeads.length || 0
      };
    });
    
    return stats;
  }, [filteredLeads, associateOptions]);

  const handleAssociateToggle = (associate: string) => {
    setSelectedAssociates(prev => 
      prev.includes(associate) 
        ? prev.filter(a => a !== associate)
        : [...prev, associate].slice(0, 3) // Max 3 associates
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getMetricValue = (associate: string, metric: string) => {
    const stats = associateStats[associate];
    if (!stats) return 0;
    
    switch (metric) {
      case 'conversions':
        return stats.conversions;
      case 'leads':
        return stats.totalLeads;
      case 'trials':
        return stats.trials;
      case 'revenue':
        return stats.revenue;
      case 'conversionRate':
        return stats.conversionRate;
      default:
        return 0;
    }
  };

  const formatMetricValue = (value: number, metric: string) => {
    switch (metric) {
      case 'revenue':
        return formatRevenue(value);
      case 'conversionRate':
        return `${value.toFixed(1)}%`;
      default:
        return value;
    }
  };

  return (
    <div className="space-y-6">
      {/* Associate Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Associate Comparison Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Associates (Max 3)</label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {associateOptions.map(associate => (
                  <Button
                    key={associate}
                    variant={selectedAssociates.includes(associate) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAssociateToggle(associate)}
                    disabled={!selectedAssociates.includes(associate) && selectedAssociates.length >= 3}
                    className="justify-start"
                  >
                    <Avatar className="h-4 w-4 mr-2">
                      <AvatarFallback className="text-xs">
                        {getInitials(associate)}
                      </AvatarFallback>
                    </Avatar>
                    {associate}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Comparison Metric</label>
              <Select value={comparisonMetric} onValueChange={setComparisonMetric}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {comparisonMetrics.map(metric => (
                    <SelectItem key={metric.value} value={metric.value}>
                      <div className="flex items-center">
                        <metric.icon className="h-4 w-4 mr-2" />
                        {metric.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison View */}
      {selectedAssociates.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {selectedAssociates.map(associate => {
            const stats = associateStats[associate];
            if (!stats) return null;

            return (
              <Card key={associate} className="shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(associate)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{associate}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {stats.totalLeads} leads • {stats.conversions} conversions
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-lg font-semibold">{stats.totalLeads}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Total Leads</p>
                    </div>
                    
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Trophy className="h-4 w-4 text-green-600" />
                        <span className="text-lg font-semibold">{stats.conversions}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Conversions</p>
                    </div>
                    
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Calendar className="h-4 w-4 text-orange-600" />
                        <span className="text-lg font-semibold">{stats.trials}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Trials</p>
                    </div>
                    
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Target className="h-4 w-4 text-purple-600" />
                        <span className="text-lg font-semibold">{stats.conversionRate.toFixed(1)}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Conv. Rate</p>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <TrendingUp className="h-5 w-5 text-emerald-600 mr-2" />
                        <span className="font-medium">Revenue Generated</span>
                      </div>
                      <span className="text-xl font-bold text-emerald-600">
                        {formatRevenue(stats.revenue)}
                      </span>
                    </div>
                  </div>

                  {/* Top Sources */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Top Sources
                    </h4>
                    <div className="space-y-1">
                      {Object.entries(stats.sourceBreakdown)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 3)
                        .map(([source, count]) => (
                          <div key={source} className="flex items-center justify-between">
                            <span className="text-sm">{source}</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Status Breakdown */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <Activity className="h-4 w-4 mr-2" />
                      Status Breakdown
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(stats.statusBreakdown).map(([status, count]) => (
                        <Badge key={status} variant="secondary" className="text-xs">
                          {status}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Performance Indicators */}
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Avg Follow-ups</span>
                      <span className="font-medium">{stats.avgFollowUps.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Performance</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${
                              i < Math.floor(stats.conversionRate / 20) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Overall Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Associate Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {associateOptions
              .map(associate => ({
                name: associate,
                ...associateStats[associate]
              }))
              .sort((a, b) => b.conversions - a.conversions)
              .slice(0, 10)
              .map((associate, index) => (
                <div key={associate.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {index + 1}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(associate.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{associate.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {associate.totalLeads} leads • {associate.conversionRate.toFixed(1)}% rate
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{associate.conversions} conversions</p>
                    <p className="text-xs text-muted-foreground">{formatRevenue(associate.revenue)}</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
