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
  Eye,
  Settings,
  Download,
  RefreshCw,
  Filter,
  Search,
  BrainCircuit,
  Sparkles,
  Star,
  Crown,
  Trophy,
  Medal,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle
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
  const { filteredLeads, loading } = useLeads();
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
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const getMetricTrend = (value: number, benchmark: number) => {
    const diff = value - benchmark;
    if (diff > 5) return { trend: 'up', color: 'text-green-600', icon: <TrendingUp className="h-4 w-4" /> };
    if (diff < -5) return { trend: 'down', color: 'text-red-600', icon: <AlertTriangle className="h-4 w-4" /> };
    return { trend: 'stable', color: 'text-yellow-600', icon: <Activity className="h-4 w-4" /> };
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 40) return 'from-green-400 to-emerald-500';
    if (rate >= 30) return 'from-blue-400 to-cyan-500';
    if (rate >= 20) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-pink-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600 text-lg">Loading Associates Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Associates Dashboard
          </h1>
          <p className="text-slate-600 text-lg mt-2">
            Comprehensive performance analytics and insights for your sales team
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="bg-white/70 backdrop-blur border-blue-200">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          
          <Button variant="outline" className="bg-white/70 backdrop-blur border-blue-200">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          
          <Button variant="outline" className="bg-white/70 backdrop-blur border-blue-200">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Total Associates</CardTitle>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800 mb-2">{dashboardMetrics.totalAssociates}</div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Active Team Members
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Avg. Conversion Rate</CardTitle>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800 mb-2">
              {dashboardMetrics.avgConversionRate.toFixed(1)}%
            </div>
            <div className={`flex items-center gap-1 ${getMetricTrend(dashboardMetrics.avgConversionRate, 25).color}`}>
              {getMetricTrend(dashboardMetrics.avgConversionRate, 25).icon}
              <span className="text-sm font-medium">Team Average</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800 mb-2">
              ₹{(dashboardMetrics.totalRevenue / 100000).toFixed(1)}L
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              This Period
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Follow-up Compliance</CardTitle>
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800 mb-2">
              {dashboardMetrics.followUpCompliance.toFixed(1)}%
            </div>
            <div className={`flex items-center gap-1 ${getMetricTrend(dashboardMetrics.followUpCompliance, 80).color}`}>
              {getMetricTrend(dashboardMetrics.followUpCompliance, 80).icon}
              <span className="text-sm font-medium">Team Compliance</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Crown className="h-5 w-5" />
              Top Performer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900 mb-2">{dashboardMetrics.topPerformer}</div>
            <p className="text-yellow-700 text-sm">Leading the team with exceptional conversion rates</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Zap className="h-5 w-5" />
              Improvement Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 mb-2">{dashboardMetrics.improvementOpportunities}</div>
            <p className="text-blue-700 text-sm">Associates below team average needing support</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Sparkles className="h-5 w-5" />
              AI Insights Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 mb-2">12</div>
            <p className="text-green-700 text-sm">Personalized recommendations ready for review</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Card className="bg-white/90 backdrop-blur border-white/30 shadow-2xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full bg-slate-100/80 backdrop-blur p-1 rounded-xl">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="performance" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger 
              value="followups" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Follow-ups</span>
            </TabsTrigger>
            <TabsTrigger 
              value="weekly" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
            >
              <Calendar className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Weekly</span>
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
            >
              <BrainCircuit className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">AI Insights</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="overview" className="space-y-6 focus:outline-none">
              <AssociateAnalytics />
            </TabsContent>

            <TabsContent value="performance" className="space-y-6 focus:outline-none">
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Individual Performance Analysis</h3>
                <p className="text-slate-600 mb-4">Detailed performance metrics, goals tracking, and coaching insights</p>
                <Button className="bg-gradient-to-r from-blue-500 to-teal-600">
                  <Award className="h-4 w-4 mr-2" />
                  Coming Soon
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="followups" className="space-y-6 focus:outline-none">
              <FollowUpInsights />
            </TabsContent>

            <TabsContent value="weekly" className="space-y-6 focus:outline-none">
              <WeeklyPerformance />
            </TabsContent>

            <TabsContent value="insights" className="space-y-6 focus:outline-none">
              <div className="text-center py-8">
                <BrainCircuit className="h-12 w-12 mx-auto text-purple-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
                <p className="text-slate-600 mb-4">Intelligent analysis and personalized recommendations for each associate</p>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-600">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Coming Soon
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-800">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-white/70 border-indigo-200">
              <Download className="h-6 w-6 text-indigo-600" />
              <span className="font-medium">Export Team Report</span>
              <span className="text-xs text-slate-600">Download comprehensive analytics</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-white/70 border-indigo-200">
              <MessageSquare className="h-6 w-6 text-indigo-600" />
              <span className="font-medium">Schedule Team Meeting</span>
              <span className="text-xs text-slate-600">Discuss performance insights</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-white/70 border-indigo-200">
              <Target className="h-6 w-6 text-indigo-600" />
              <span className="font-medium">Set Team Goals</span>
              <span className="text-xs text-slate-600">Define targets and objectives</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}