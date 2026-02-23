import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AssociateAnalytics } from './AssociateAnalytics';
import { FollowUpInsights } from './FollowUpInsights';
import { WeeklyPerformance } from './WeeklyPerformance';
import { useLeads } from '@/contexts/LeadContext';
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Calendar,
  BarChart3,
  Target,
  Award,
  Activity,
  Zap,
  Download,
  RefreshCw,
  DollarSign,
  CheckCircle,
  Crown,
  Sparkles
} from 'lucide-react';

interface DashboardMetrics {
  totalAssociates: number;
  avgConversionRate: number;
  totalRevenue: number;
  followUpCompliance: number;
  topPerformer: string;
  improvementOpportunities: number;
}

export function AssociatesDashboard() {
  const { filteredLeads, loading, refreshData } = useLeads();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate dashboard metrics
  const dashboardMetrics = React.useMemo(() => {
    if (!filteredLeads || filteredLeads.length === 0) {
      return {
        totalAssociates: 0,
        avgConversionRate: 0,
        totalRevenue: 0,
        followUpCompliance: 0,
        topPerformer: 'N/A',
        improvementOpportunities: 0
      };
    }

    const associates = [...new Set(filteredLeads.map(lead => lead.associate).filter(Boolean))];
    let totalConversions = 0;
    let totalLeads = 0;
    let totalRevenue = 0;
    let followUpCompleted = 0;
    let followUpRequired = 0;
    let topPerformer = '';
    let bestConversionRate = 0;

    associates.forEach(associate => {
      const associateLeads = filteredLeads.filter(lead => lead.associate === associate);
      const conversions = associateLeads.filter(lead => lead.stage === 'Membership Sold');
      const conversionRate = associateLeads.length > 0 ? (conversions.length / associateLeads.length) * 100 : 0;
      
      if (conversionRate > bestConversionRate) {
        bestConversionRate = conversionRate;
        topPerformer = associate;
      }

      totalLeads += associateLeads.length;
      totalConversions += conversions.length;
      totalRevenue += conversions.length * 75000;

      // Calculate follow-up compliance
      associateLeads.forEach(lead => {
        const createdDate = new Date(lead.createdAt);
        const daysSince = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSince >= 1) {
          followUpRequired++;
          if (lead.followUp1Date) followUpCompleted++;
        }
        if (daysSince >= 3) {
          followUpRequired++;
          if (lead.followUp2Date) followUpCompleted++;
        }
        if (daysSince >= 5) {
          followUpRequired++;
          if (lead.followUp3Date) followUpCompleted++;
        }
        if (daysSince >= 7) {
          followUpRequired++;
          if (lead.followUp4Date) followUpCompleted++;
        }
      });
    });

    const avgConversionRate = totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0;
    const followUpCompliance = followUpRequired > 0 ? (followUpCompleted / followUpRequired) * 100 : 100;
    const improvementOpportunities = associates.filter(associate => {
      const associateLeads = filteredLeads.filter(lead => lead.associate === associate);
      const conversionRate = associateLeads.length > 0 ? 
        (associateLeads.filter(lead => lead.stage === 'Membership Sold').length / associateLeads.length) * 100 : 0;
      return conversionRate < avgConversionRate;
    }).length;

    return {
      totalAssociates: associates.length,
      avgConversionRate,
      totalRevenue,
      followUpCompliance,
      topPerformer,
      improvementOpportunities
    };
  }, [filteredLeads]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 rounded-full border-2 border-slate-300 border-t-slate-800 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading Associates Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Associates Dashboard
          </h1>
          <p className="text-slate-600 mt-2">
            Performance analytics and insights for your sales team
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Total Associates</CardTitle>
              <Users className="h-6 w-6 text-slate-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 mb-1">{dashboardMetrics.totalAssociates}</div>
            <p className="text-sm text-slate-500">Active team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Avg. Conversion Rate</CardTitle>
              <Target className="h-6 w-6 text-slate-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {dashboardMetrics.avgConversionRate.toFixed(1)}%
            </div>
            <p className="text-sm text-slate-500">Team average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
              <DollarSign className="h-6 w-6 text-slate-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              ₹{(dashboardMetrics.totalRevenue / 100000).toFixed(1)}L
            </div>
            <p className="text-sm text-slate-500">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Follow-up Compliance</CardTitle>
              <CheckCircle className="h-6 w-6 text-slate-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {dashboardMetrics.followUpCompliance.toFixed(1)}%
            </div>
            <p className="text-sm text-slate-500">Team compliance</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Crown className="h-5 w-5 text-slate-600" />
              Top Performer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-slate-900 mb-1">{dashboardMetrics.topPerformer}</div>
            <p className="text-sm text-slate-600">Leading the team with exceptional conversion rates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Zap className="h-5 w-5 text-slate-600" />
              Improvement Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-slate-900 mb-1">{dashboardMetrics.improvementOpportunities}</div>
            <p className="text-sm text-slate-600">Associates below team average needing support</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Activity className="h-5 w-5 text-slate-600" />
              Follow-up Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 mb-2">
              {filteredLeads.filter(lead => {
                const createdDate = new Date(lead.createdAt);
                const daysSince = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
                return daysSince >= 1 && (!lead.followUp1Date || daysSince >= 3 && !lead.followUp2Date);
              }).length}
            </div>
            <p className="text-green-700 text-sm">Associates requiring follow-up attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="followups">
              <MessageSquare className="h-4 w-4 mr-2" />
              Follow-ups
            </TabsTrigger>
            <TabsTrigger value="weekly">
              <Calendar className="h-4 w-4 mr-2" />
              Weekly Trends
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="overview" className="space-y-6 focus:outline-none">
              <AssociateAnalytics />
            </TabsContent>

            <TabsContent value="followups" className="space-y-6 focus:outline-none">
              <FollowUpInsights />
            </TabsContent>

            <TabsContent value="weekly" className="space-y-6 focus:outline-none">
              <WeeklyPerformance />
            </TabsContent>
          </div>
        </Tabs>
      </Card>


    </div>
  );
}