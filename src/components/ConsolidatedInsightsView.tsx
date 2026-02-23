import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BrainCircuit, 
  TrendingUp, 
  BarChart3, 
  Activity,
  Sparkles,
  Target,
  Users,
  Calendar,
  Award,
  Zap,
  Eye,
  RefreshCw,
  Download,
  Settings,
  Filter,
  ChevronRight
} from 'lucide-react';
import { AIInsightsView } from './AIInsightsView';
import { LeadPerformanceView } from './LeadPerformanceView';
import { LeadTrendsView } from './LeadTrendsView';
import { LeadAnalytics } from './LeadAnalytics';
import { useLeads } from '@/contexts/LeadContext';
import { aiService } from '@/services/aiService';
import { toast } from 'sonner';
import { Skeleton } from "@/components/ui/skeleton";

export const ConsolidatedInsightsView = () => {
  const { filteredLeads, statusCounts, sourceStats, associateStats, conversionRate, isRefreshing, refreshData } = useLeads();
  const [selectedInsightTab, setSelectedInsightTab] = useState('overview');
  const [isAIConfigured] = useState(() => aiService.isConfigured());

  const totalLeads = filteredLeads.length;
  const newLeads = filteredLeads.filter(lead => lead.status === 'New').length;
  const qualifiedLeads = filteredLeads.filter(lead => lead.stage === 'Qualified').length;
  const convertedLeads = filteredLeads.filter(lead => lead.status === 'Converted').length;

  // Quick metrics for the overview
  const quickMetrics = [
    {
      title: 'Total Leads',
      value: totalLeads,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      title: 'Conversion Rate',
      value: `${(conversionRate * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950'
    },
    {
      title: 'New This Month',
      value: newLeads,
      icon: Sparkles,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950'
    },
    {
      title: 'Qualified',
      value: qualifiedLeads,
      icon: Award,
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-950'
    }
  ];

  const insightTabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Eye,
      description: 'Quick insights and key metrics'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Detailed charts and analysis'
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: TrendingUp,
      description: 'Performance metrics and comparisons'
    },
    {
      id: 'trends',
      label: 'Trends',
      icon: Activity,
      description: 'Trend analysis and forecasting'
    },
    {
      id: 'ai-insights',
      label: 'AI Insights',
      icon: BrainCircuit,
      description: 'AI-powered recommendations'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickMetrics.map((metric, index) => (
          <Card key={index} className="border-border/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${metric.bg}`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Lead Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="text-xl font-bold text-primary">{count}</div>
                <div className="text-sm text-muted-foreground capitalize">{status}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Top Lead Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(sourceStats)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([source, count]) => (
                <div key={source} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{source}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Associates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Top Performing Associates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(associateStats)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([associate, count]) => (
                <div key={associate} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{associate}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setSelectedInsightTab('analytics')}>
              <BarChart3 className="w-4 h-4" />
              View Analytics
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setSelectedInsightTab('trends')}>
              <Activity className="w-4 h-4" />
              View Trends
            </Button>
            {isAIConfigured && (
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setSelectedInsightTab('ai-insights')}>
                <BrainCircuit className="w-4 h-4" />
                AI Insights
                <Sparkles className="w-3 h-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (selectedInsightTab) {
      case 'overview':
        return renderOverview();
      case 'analytics':
        return <LeadAnalytics />;
      case 'performance':
        return <LeadPerformanceView />;
      case 'trends':
        return <LeadTrendsView />;
      case 'ai-insights':
        return <AIInsightsView />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-border/30 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            Consolidated Insights Dashboard
          </CardTitle>
          <p className="text-muted-foreground">
            Comprehensive analytics, performance metrics, trends analysis, and AI-powered insights all in one place.
          </p>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <Tabs value={selectedInsightTab} onValueChange={setSelectedInsightTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full sm:w-auto bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-1 rounded-xl">
            {insightTabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 rounded-lg"
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {filteredLeads.length} records
            </Badge>
          </div>
        </div>

        {/* Tab Description */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {insightTabs.find(tab => tab.id === selectedInsightTab)?.description}
          </p>
        </div>

        {/* Tab Content */}
        <TabsContent value={selectedInsightTab} className="mt-0">
          {renderTabContent()}
        </TabsContent>
      </Tabs>

      {/* Additional Info */}
      {!isAIConfigured && selectedInsightTab === 'ai-insights' && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <BrainCircuit className="w-5 h-5" />
              <span className="font-medium">AI Features Not Configured</span>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Configure OpenAI integration in settings to unlock AI-powered insights and recommendations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};