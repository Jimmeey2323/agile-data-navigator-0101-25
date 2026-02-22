import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLeads } from '@/contexts/LeadContext';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Target,
  BarChart3,
  Activity,
  Eye,
  Zap,
  Star,
  Heart,
  Frown,
  Meh,
  Smile,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatDate } from '@/lib/utils';

interface FollowUpAnalysis {
  associate: string;
  totalFollowUps: number;
  completionRate: number;
  avgDaysToComplete: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  followUpsByDay: {
    day: string;
    count: number;
    completed: number;
  }[];
  commentAnalysis: {
    category: string;
    count: number;
    examples: string[];
  }[];
  weeklyTrends: {
    week: string;
    completed: number;
    scheduled: number;
    overdue: number;
  }[];
}

const SENTIMENT_COLORS = ['#10b981', '#f59e0b', '#ef4444']; // green, yellow, red
const FOLLOW_UP_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']; // blue, purple, green, yellow

// Mock AI sentiment analysis - in real app, this would call the AI service
const analyzeSentiment = (comment: string): 'positive' | 'neutral' | 'negative' => {
  if (!comment) return 'neutral';
  const lowerComment = comment.toLowerCase();
  
  const positiveWords = ['interested', 'great', 'excellent', 'good', 'positive', 'excited', 'ready', 'yes'];
  const negativeWords = ['not', 'no', 'busy', 'later', 'maybe', 'unsure', 'difficult', 'problem'];
  
  const positiveCount = positiveWords.filter(word => lowerComment.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerComment.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
};

const categorizeComment = (comment: string): string => {
  if (!comment) return 'No Response';
  const lowerComment = comment.toLowerCase();
  
  if (lowerComment.includes('interested') || lowerComment.includes('ready')) return 'High Interest';
  if (lowerComment.includes('busy') || lowerComment.includes('later')) return 'Timing Issues';
  if (lowerComment.includes('price') || lowerComment.includes('cost')) return 'Price Concerns';
  if (lowerComment.includes('think') || lowerComment.includes('consider')) return 'Needs Time';
  if (lowerComment.includes('call') || lowerComment.includes('meeting')) return 'Wants Contact';
  if (lowerComment.includes('information') || lowerComment.includes('details')) return 'Needs Info';
  return 'General Response';
};

export function FollowUpInsights() {
  const { filteredLeads, loading } = useLeads();
  const [selectedAssociate, setSelectedAssociate] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('30days');

  // Calculate follow-up insights
  const followUpAnalysis = useMemo(() => {
    if (!filteredLeads || filteredLeads.length === 0) return [];

    const associates = selectedAssociate === 'all' 
      ? [...new Set(filteredLeads.map(lead => lead.associate).filter(Boolean))]
      : [selectedAssociate];

    return associates.map(associate => {
      const associateLeads = filteredLeads.filter(lead => lead.associate === associate);
      
      // Analyze follow-ups
      let totalFollowUps = 0;
      let completedFollowUps = 0;
      const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
      const commentCategories: { [key: string]: { count: number; examples: string[] } } = {};
      
      const followUpsByDay = [1, 3, 5, 7].map(day => {
        const dayFollowUps = associateLeads.filter(lead => {
          const createdDate = new Date(lead.createdAt);
          const daysSince = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysSince >= day;
        });
        
        const completed = dayFollowUps.filter(lead => {
          if (day === 1) return lead.followUp1Date;
          if (day === 3) return lead.followUp2Date;
          if (day === 5) return lead.followUp3Date;
          if (day === 7) return lead.followUp4Date;
          return false;
        });

        totalFollowUps += dayFollowUps.length;
        completedFollowUps += completed.length;

        // Analyze comments for sentiment and categorization
        completed.forEach(lead => {
          const comment = day === 1 ? lead.followUp1Comment : 
                         day === 3 ? lead.followUp2Comment :
                         day === 5 ? lead.followUp3Comment : lead.followUp4Comment;
          
          if (comment) {
            const sentiment = analyzeSentiment(comment);
            sentimentCounts[sentiment]++;
            
            const category = categorizeComment(comment);
            if (!commentCategories[category]) {
              commentCategories[category] = { count: 0, examples: [] };
            }
            commentCategories[category].count++;
            if (commentCategories[category].examples.length < 3) {
              commentCategories[category].examples.push(comment);
            }
          }
        });

        return {
          day: `Day ${day}`,
          count: dayFollowUps.length,
          completed: completed.length
        };
      });

      // Generate weekly trends (last 8 weeks)
      const weeklyTrends = Array.from({ length: 8 }, (_, i) => {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const weekLeads = associateLeads.filter(lead => {
          const leadDate = new Date(lead.createdAt);
          return leadDate >= weekStart && leadDate <= weekEnd;
        });

        const completed = weekLeads.filter(lead => 
          lead.followUp1Date || lead.followUp2Date || lead.followUp3Date || lead.followUp4Date
        ).length;

        const overdue = weekLeads.filter(lead => {
          const createdDate = new Date(lead.createdAt);
          const daysSince = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
          
          return (daysSince >= 1 && !lead.followUp1Date) ||
                 (daysSince >= 3 && !lead.followUp2Date) ||
                 (daysSince >= 5 && !lead.followUp3Date) ||
                 (daysSince >= 7 && !lead.followUp4Date);
        }).length;

        return {
          week: `Week ${8 - i}`,
          completed,
          scheduled: weekLeads.length,
          overdue
        };
      }).reverse();

      return {
        associate,
        totalFollowUps,
        completionRate: totalFollowUps > 0 ? (completedFollowUps / totalFollowUps) * 100 : 0,
        avgDaysToComplete: 2.5, // Mock calculation
        sentimentBreakdown: {
          positive: sentimentCounts.positive,
          neutral: sentimentCounts.neutral,
          negative: sentimentCounts.negative
        },
        followUpsByDay,
        commentAnalysis: Object.entries(commentCategories).map(([category, data]) => ({
          category,
          count: data.count,
          examples: data.examples
        })),
        weeklyTrends
      } as FollowUpAnalysis;
    });
  }, [filteredLeads, selectedAssociate]);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="h-4 w-4 text-green-600" />;
      case 'negative': return <ThumbsDown className="h-4 w-4 text-red-600" />;
      default: return <Meh className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      case 'negative': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading follow-up insights...</p>
      </div>
    );
  }

  const totalSentiment = followUpAnalysis.reduce((acc, item) => ({
    positive: acc.positive + item.sentimentBreakdown.positive,
    neutral: acc.neutral + item.sentimentBreakdown.neutral,
    negative: acc.negative + item.sentimentBreakdown.negative
  }), { positive: 0, neutral: 0, negative: 0 });

  const sentimentData = [
    { name: 'Positive', value: totalSentiment.positive, color: '#10b981' },
    { name: 'Neutral', value: totalSentiment.neutral, color: '#f59e0b' },
    { name: 'Negative', value: totalSentiment.negative, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <MessageSquare className="h-6 w-6 text-purple-600" />
            Follow-up Insights & Comment Analysis
          </CardTitle>
          <p className="text-slate-600">AI-powered analysis of follow-up patterns, sentiment, and comment categorization</p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="trends">Weekly Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {followUpAnalysis.map(analysis => (
              <Card key={analysis.associate} className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{analysis.associate}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Completion Rate</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {analysis.completionRate.toFixed(1)}%
                    </Badge>
                  </div>
                  <Progress value={analysis.completionRate} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Follow-ups</span>
                    <span className="font-semibold">{analysis.totalFollowUps}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Avg. Days</span>
                    <span className="font-semibold">{analysis.avgDaysToComplete}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Follow-up Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Follow-up Timeline Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={followUpAnalysis[0]?.followUpsByDay || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Required" />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sentiment Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-600" />
                  Sentiment Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Comment Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Comment Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {followUpAnalysis[0]?.commentAnalysis.map(category => (
                  <div key={category.category} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800">{category.category}</h4>
                      <p className="text-sm text-slate-600">{category.count} mentions</p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {category.count}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sentiment by Associate */}
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Analysis by Associate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {followUpAnalysis.map(analysis => (
                  <div key={analysis.associate} className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold mb-3">{analysis.associate}</h4>
                    <div className="flex gap-4">
                      {Object.entries(analysis.sentimentBreakdown).map(([sentiment, count]) => (
                        <div key={sentiment} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getSentimentColor(sentiment)}`}>
                          {getSentimentIcon(sentiment)}
                          <span className="font-medium capitalize">{sentiment}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Follow-up Completion Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 3, 5, 7].map(day => {
                  const dayData = followUpAnalysis[0]?.followUpsByDay.find(d => d.day === `Day ${day}`);
                  const completionRate = dayData ? (dayData.completed / dayData.count) * 100 : 0;
                  
                  return (
                    <div key={day} className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-green-800">Day {day} Follow-up</h4>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Completion Rate</span>
                          <span className="font-semibold">{completionRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={completionRate} className="h-2" />
                        <div className="text-xs text-slate-600">
                          {dayData?.completed || 0} of {dayData?.count || 0} completed
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Weekly Follow-up Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={followUpAnalysis[0]?.weeklyTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="#10b981" name="Completed" strokeWidth={2} />
                  <Line type="monotone" dataKey="scheduled" stroke="#3b82f6" name="Scheduled" strokeWidth={2} />
                  <Line type="monotone" dataKey="overdue" stroke="#ef4444" name="Overdue" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}