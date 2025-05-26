
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeads } from '@/contexts/LeadContext';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Target,
  ChevronDown,
  ChevronUp,
  BarChart3
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function MetricsPanel() {
  const { 
    filteredLeads, 
    statusCounts, 
    sourceStats, 
    associateStats, 
    convertedLeadsCount, 
    ltv, 
    conversionRate 
  } = useLeads();

  const [isCollapsed, setIsCollapsed] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const metrics = [
    {
      title: 'Total Leads',
      value: filteredLeads.length.toLocaleString(),
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      change: '+2.5%',
      changeType: 'positive'
    },
    {
      title: 'Total LTV',
      value: formatCurrency(ltv),
      icon: DollarSign,
      color: 'from-purple-500 to-violet-500',
      change: '+8.3%',
      changeType: 'positive'
    },
    {
      title: 'Converted Leads',
      value: convertedLeadsCount.toLocaleString(),
      icon: Target,
      color: 'from-orange-500 to-red-500',
      change: '+15%',
      changeType: 'positive'
    }
  ];

  return (
    <Card className="shadow-md border-border/30 animate-fade-in">
      <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <h3 className="font-medium text-base">Key Metrics Overview</h3>
            </div>
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <Card key={index} className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200">
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-10`} />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                      <p className="text-2xl font-bold mt-1">{metric.value}</p>
                      <p className={`text-xs mt-1 ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change} from last period
                      </p>
                    </div>
                    <div className={`p-3 rounded-full bg-gradient-to-br ${metric.color}`}>
                      <metric.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
