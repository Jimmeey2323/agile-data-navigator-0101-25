
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

  const [isExpanded, setIsExpanded] = useState(false);

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
    <Card className="shadow-lg border-2 border-primary/20 animate-fade-in bg-gradient-to-r from-primary/5 to-primary/10">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-primary/10 transition-colors rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Key Metrics Overview</h3>
            </div>
            {isExpanded ? <ChevronUp className="h-5 w-5 text-primary" /> : <ChevronDown className="h-5 w-5 text-primary" />}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <Card key={index} className="relative overflow-hidden border-2 border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-10`} />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{metric.title}</p>
                      <p className="text-3xl font-bold mt-1 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{metric.value}</p>
                      <p className={`text-xs mt-2 flex items-center gap-1 ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                        <TrendingUp className="h-3 w-3" />
                        {metric.change} from last period
                      </p>
                    </div>
                    <div className={`p-4 rounded-full bg-gradient-to-br ${metric.color} shadow-lg`}>
                      <metric.icon className="h-8 w-8 text-white" />
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
