
import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  Layers, 
  DollarSign,
  ChevronDown,
  ChevronUp,
  Star,
  Activity
} from 'lucide-react';
import { useLeads } from '@/contexts/LeadContext';
import { cn, formatNumber, calculatePercentageChange } from '@/lib/utils';
import { Card, CardContent } from "@/components/ui/card";
import CountUp from 'react-countup';

export function MetricsPanel() {
  const { 
    statusCounts, 
    filteredLeads, 
    leads, 
    convertedLeadsCount, 
    ltv, 
    conversionRate,
    loading 
  } = useLeads();
  
  const [collapsed, setCollapsed] = useState(false);
  
  // Calculate total leads count
  const totalLeads = filteredLeads.length;
  const totalAllLeads = leads.length;
  
  // For demo purposes, calculate week-over-week change
  // In a real app, we would use historical data
  const weekOnWeekChange = calculatePercentageChange(
    totalLeads,
    totalLeads > 10 ? totalLeads - Math.floor(Math.random() * 10) : totalLeads
  );
  
  // Calculate active leads (not closed)
  const closedStatuses = ['Converted', 'Lost', 'Rejected'];
  const activeLeads = filteredLeads.filter(lead => 
    !closedStatuses.includes(lead.status)
  ).length;
  
  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-medium animate-pulse bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Key Metrics</h2>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-secondary rounded-md focus:outline-none"
        >
          {collapsed ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
      </div>
      
      {!collapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Leads"
            value={totalLeads}
            change={weekOnWeekChange}
            icon={<Users className="h-5 w-5" />}
            description={`${formatNumber(totalLeads)} of ${formatNumber(totalAllLeads)} total leads`}
            loading={loading}
          />
          
          <MetricCard
            title="Active Leads"
            value={activeLeads}
            change={calculatePercentageChange(
              activeLeads,
              activeLeads > 5 ? activeLeads - Math.floor(Math.random() * 5) : activeLeads
            )}
            icon={<Layers className="h-5 w-5" />}
            description="Leads in active stages"
            loading={loading}
          />
          
          <MetricCard
            title="Conversion Rate"
            value={conversionRate.toFixed(1) + '%'}
            change={calculatePercentageChange(
              conversionRate,
              conversionRate > 2 ? conversionRate - Math.random() * 2 : conversionRate
            )}
            icon={<Activity className="h-5 w-5" />}
            description={`${convertedLeadsCount} converted leads`}
            loading={loading}
            isPercentage={true}
          />
          
          <MetricCard
            title="Estimated Value"
            value={`₹${formatNumber(ltv)}`}
            change={calculatePercentageChange(
              ltv,
              ltv > 2000 ? ltv - Math.random() * 2000 : ltv
            )}
            icon={<Star className="h-5 w-5" />}
            description="Memberships sold value"
            loading={loading}
            isCurrency={true}
            currencyValue={ltv}
          />
        </div>
      )}
    </section>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  description: string;
  loading?: boolean;
  isPercentage?: boolean;
  isCurrency?: boolean;
  currencyValue?: number;
}

function MetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  description, 
  loading = false,
  isPercentage = false,
  isCurrency = false,
  currencyValue = 0
}: MetricCardProps) {
  const positive = change >= 0;
  const prevValueRef = useRef<string | number>(0);

  useEffect(() => {
    prevValueRef.current = value;
  }, [value]);

  // Parse numeric value for CountUp
  const numericValue = (() => {
    if (typeof value === 'number') return value;
    if (isPercentage) return parseFloat(value.toString());
    if (isCurrency) return currencyValue;
    return parseInt(value.toString().replace(/[^0-9.-]+/g, '') || '0');
  })();
  
  return (
    <Card className="overflow-hidden glass-card transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-semibold mt-1">
              {loading ? (
                <div className="h-8 w-24 bg-muted/40 animate-pulse rounded"></div>
              ) : (
                <>
                  {isCurrency ? '₹' : ''}
                  <CountUp
                    start={0}
                    end={numericValue}
                    duration={1.5}
                    separator=","
                    decimals={isPercentage ? 1 : 0}
                    decimal="."
                    suffix={isPercentage ? '%' : ''}
                  />
                </>
              )}
            </h3>
          </div>
          <div className="h-9 w-9 rounded-full flex items-center justify-center bg-primary/10">
            {icon}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          <div className={cn(
            "flex items-center text-xs font-medium",
            positive ? "text-green-600" : "text-red-600"
          )}>
            {positive ? (
              <ArrowUpRight className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-1" />
            )}
            {loading ? (
              <div className="h-3 w-10 bg-muted/40 animate-pulse rounded"></div>
            ) : (
              `${Math.abs(change).toFixed(1)}%`
            )}
          </div>
          
          <span className="text-xs text-muted-foreground">
            {loading ? (
              <div className="h-3 w-20 bg-muted/40 animate-pulse rounded"></div>
            ) : (
              description
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
