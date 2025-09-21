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
  Activity,
  TrendingUp,
  Target,
  Award,
  Zap,
  Clock,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Download,
  X
} from 'lucide-react';
import { useLeads } from '@/contexts/LeadContext';
import { cn, formatNumber, calculatePercentageChange } from '@/lib/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [drillDownModal, setDrillDownModal] = useState<{
    isOpen: boolean;
    title: string;
    value: string | number;
    change: number;
    description: string;
    statusCounts: Record<string, number>;
    filteredLeads: any[];
    totalLeads: number;
  } | null>(null);
  
  // Calculate total leads count
  const totalLeads = filteredLeads.length;
  const totalAllLeads = leads.length;
  
  // For demo purposes, calculate week-over-week change
  const weekOnWeekChange = calculatePercentageChange(
    totalLeads,
    totalLeads > 10 ? totalLeads - Math.floor(Math.random() * 10) : totalLeads
  );
  
  // Calculate active leads (not closed)
  const closedStatuses = ['Converted', 'Lost', 'Rejected'];
  const activeLeads = filteredLeads.filter(lead => 
    !closedStatuses.includes(lead.status)
  ).length;

  // Calculate response time metrics
  const avgResponseTime = 3.2; // hours (mock data)
  const responseTimeChange = -15.4; // percentage improvement

  // Calculate follow-up metrics
  const followUpRate = 78.5; // percentage of leads with follow-ups
  const followUpChange = 12.3; // percentage improvement

  // Format revenue values
  const formatRevenue = (value: number): string => {
    if (value >= 10000000) { // 1 Crore
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) { // 1 Lakh
      return `₹${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) { // 1 Thousand
      return `₹${(value / 1000).toFixed(1)}K`;
    } else {
      return `₹${value}`;
    }
  };

  const openDrillDownModal = (data: {
    title: string;
    value: string | number;
    change: number;
    description: string;
    statusCounts: Record<string, number>;
    filteredLeads: any[];
    totalLeads: number;
  }) => {
    setDrillDownModal({ ...data, isOpen: true });
  };

  const closeDrillDownModal = () => {
    setDrillDownModal(null);
  };

  return (
    <section className="w-full">
      {/* Enhanced title section with dark accents */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-teal-600/10 rounded-2xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center shadow-lg">
                <BarChart3 className="h-6 w-6 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
                  Key Metrics
                </h2>
                <p className="text-sm text-gray-400 mt-1">Real-time performance insights</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50"></div>
                <span className="text-xs text-gray-400">Live</span>
              </div>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-2 hover:bg-gray-700 rounded-lg focus:outline-none transition-all duration-300 hover:scale-105 group"
              >
                {collapsed ? (
                  <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
                ) : (
                  <ChevronUp className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {!collapsed && (
        <>
          {totalLeads === 0 && !loading ? (
            <div className="col-span-full bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-6 rounded-lg">
              <div className="flex items-center justify-center space-x-3">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-amber-800 mb-2">No Data Found</h3>
                  <p className="text-amber-700 mb-3">
                    Your current filters may be too restrictive, or the selected location/date range has no leads.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <p className="text-sm text-amber-600">
                      💡 Try: Clearing filters, selecting a different location, or expanding the date range
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 auto-rows-fr">
              <TooltipProvider>
            <MetricCard
              title="Total Leads"
              value={totalLeads}
              change={weekOnWeekChange}
              icon={<Users className="h-6 w-6 text-blue-600" />}
              description={`${formatNumber(totalLeads)} of ${formatNumber(totalAllLeads)} total leads`}
              loading={loading}
              onDrillDown={() => openDrillDownModal({
                title: "Total Leads",
                value: totalLeads,
                change: weekOnWeekChange,
                description: `${formatNumber(totalLeads)} of ${formatNumber(totalAllLeads)} total leads`,
                statusCounts,
                filteredLeads,
                totalLeads
              })}
              tooltip={{
                title: "Total Leads",
                content: "Total number of leads in your current filtered view. This includes all leads regardless of their status or stage.",
                insights: [
                  "Represents your current lead pipeline",
                  "Use filters to segment by source, status, or date",
                  "Track growth trends over time"
                ]
              }}
            />
            
            <MetricCard
              title="Active Leads"
              value={activeLeads}
              change={calculatePercentageChange(
                activeLeads,
                activeLeads > 5 ? activeLeads - Math.floor(Math.random() * 5) : activeLeads
              )}
              icon={<Layers className="h-6 w-6 text-teal-600" />}
              description="Leads in active stages"
              loading={loading}
              onDrillDown={() => openDrillDownModal({
                title: "Active Leads",
                value: activeLeads,
                change: calculatePercentageChange(
                  activeLeads,
                  activeLeads > 5 ? activeLeads - Math.floor(Math.random() * 5) : activeLeads
                ),
                description: "Leads in active stages",
                statusCounts,
                filteredLeads,
                totalLeads
              })}
              tooltip={{
                title: "Active Leads",
                content: "Leads that are currently being worked on and haven't been closed (won or lost).",
                insights: [
                  "Excludes converted, lost, and rejected leads",
                  "Focus your efforts on these leads",
                  "Monitor for stagnant leads that need attention"
                ]
              }}
            />
            
            <MetricCard
              title="Conversion Rate"
              value={conversionRate.toFixed(1) + '%'}
              change={calculatePercentageChange(
                conversionRate,
                conversionRate > 2 ? conversionRate - Math.random() * 2 : conversionRate
              )}
              icon={<Activity className="h-6 w-6 text-green-600" />}
              description={`${convertedLeadsCount} converted leads`}
              loading={loading}
              isPercentage={true}
              onDrillDown={() => openDrillDownModal({
                title: "Conversion Rate",
                value: conversionRate.toFixed(1) + '%',
                change: calculatePercentageChange(
                  conversionRate,
                  conversionRate > 2 ? conversionRate - Math.random() * 2 : conversionRate
                ),
                description: `${convertedLeadsCount} converted leads`,
                statusCounts,
                filteredLeads,
                totalLeads
              })}
              tooltip={{
                title: "Conversion Rate",
                content: "Percentage of leads that have been successfully converted to customers.",
                insights: [
                  "Industry average is typically 2-5%",
                  "Higher rates indicate effective sales process",
                  "Track by source to identify best channels"
                ]
              }}
            />
            
            <MetricCard
              title="Estimated Value"
              value={formatRevenue(ltv)}
              change={calculatePercentageChange(
                ltv,
                ltv > 2000 ? ltv - Math.random() * 2000 : ltv
              )}
              icon={<Star className="h-6 w-6 text-orange-600" />}
              description="Total revenue from conversions"
              loading={loading}
              isCurrency={true}
              currencyValue={ltv}
              onDrillDown={() => openDrillDownModal({
                title: "Estimated Value",
                value: formatRevenue(ltv),
                change: calculatePercentageChange(
                  ltv,
                  ltv > 2000 ? ltv - Math.random() * 2000 : ltv
                ),
                description: "Total revenue from conversions",
                statusCounts,
                filteredLeads,
                totalLeads
              })}
              tooltip={{
                title: "Estimated Value",
                content: "Total estimated revenue from converted leads based on average deal size.",
                insights: [
                  "Based on ₹75,000 average membership value",
                  "Helps track ROI of marketing efforts",
                  "Use to justify marketing spend"
                ]
              }}
            />

            <MetricCard
              title="Avg Response Time"
              value={`${avgResponseTime}h`}
              change={responseTimeChange}
              icon={<Clock className="h-6 w-6 text-red-600" />}
              description="Time to first response"
              loading={loading}
              onDrillDown={() => openDrillDownModal({
                title: "Avg Response Time",
                value: `${avgResponseTime}h`,
                change: responseTimeChange,
                description: "Time to first response",
                statusCounts,
                filteredLeads,
                totalLeads
              })}
              tooltip={{
                title: "Average Response Time",
                content: "Average time between lead creation and first contact attempt.",
                insights: [
                  "Faster response times improve conversion rates",
                  "Aim for under 1 hour for best results",
                  "Leads contacted within 5 minutes are 21x more likely to convert"
                ]
              }}
            />

            <MetricCard
              title="Follow-up Rate"
              value={`${followUpRate}%`}
              change={followUpChange}
              icon={<MessageSquare className="h-6 w-6 text-cyan-600" />}
              description="Leads with follow-up activities"
              loading={loading}
              isPercentage={true}
              onDrillDown={() => openDrillDownModal({
                title: "Follow-up Rate",
                value: `${followUpRate}%`,
                change: followUpChange,
                description: "Leads with follow-up activities",
                statusCounts,
                filteredLeads,
                totalLeads
              })}
              tooltip={{
                title: "Follow-up Rate",
                content: "Percentage of leads that have at least one follow-up activity recorded.",
                insights: [
                  "Higher follow-up rates lead to better conversions",
                  "Aim for 80%+ follow-up rate",
                  "Multiple follow-ups increase success probability"
                ]
              }}
            />
          </TooltipProvider>
            </div>
          )}
        </>
      )}
      
      {/* Drill-down Modal */}
      {drillDownModal && (
        <Dialog open={drillDownModal.isOpen} onOpenChange={closeDrillDownModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800">
                {drillDownModal.title} - Detailed Analytics
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Current Period Stats */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Current Period</h4>
                <div className="text-2xl font-bold text-blue-600">{drillDownModal.value}</div>
                <div className="text-sm text-gray-600">{drillDownModal.description}</div>
              </div>
              
              {/* Change Analysis */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Trend Analysis</h4>
                <div className="flex items-center gap-2">
                  {drillDownModal.change > 0 ? (
                    <ArrowUpRight className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`text-lg font-bold ${drillDownModal.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(drillDownModal.change).toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm text-gray-600">vs previous period</div>
              </div>
            </div>

            {/* Breakdown by Source/Associate */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-4">Breakdown by Status</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(drillDownModal.statusCounts).map(([status, count]) => (
                  <div key={status} className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">{status}</div>
                    <div className="text-lg font-bold text-gray-800">{count as number}</div>
                    <div className="text-xs text-gray-500">
                      {drillDownModal.totalLeads > 0 ? (((count as number) / drillDownModal.totalLeads) * 100).toFixed(1) : 0}% of total
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-4">Recent Activity</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {drillDownModal.filteredLeads.slice(0, 5).map((lead, index) => (
                  <div key={lead.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">{lead.fullName || 'Unknown'}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {lead.source || 'N/A'} • {lead.status || 'N/A'}
                    </div>
                  </div>
                ))}
                {drillDownModal.filteredLeads.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-400" />
                    <p>No data available for current filters</p>
                    <p className="text-xs">Try adjusting your filter settings</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button size="sm" onClick={closeDrillDownModal}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
  tooltip?: {
    title: string;
    content: string;
    insights: string[];
  };
  onDrillDown?: () => void;
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
  currencyValue = 0,
  tooltip,
  onDrillDown
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

  const cardContent = (
    <Card
      className="overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-0 shadow-2xl transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:-translate-y-2 hover:scale-[1.02] group cursor-pointer rounded-2xl backdrop-blur-lg ring-1 ring-gray-700 hover:ring-gray-500 transform-gpu h-full"
      onClick={onDrillDown}
      style={{ minHeight: 160 }}
    >
      <CardContent className="p-6 relative overflow-hidden">
        {/* Subtle animated background gradient */}
        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-blue-400/20 via-transparent to-teal-400/20 group-hover:opacity-30 transition-opacity duration-500" />
        
        <div className="flex justify-between items-start relative z-10">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-400 mb-2 tracking-wide uppercase group-hover:text-gray-300 transition-colors duration-300">{title}</p>
            <h3 className="text-3xl font-extrabold text-white mb-1 group-hover:text-blue-100 transition-colors duration-300">
              {loading ? (
                <div className="h-8 w-24 bg-gray-700 animate-pulse rounded"></div>
              ) : (
                <>
                  {isCurrency && !value.toString().includes('₹') ? '₹' : ''}
                  <CountUp
                    start={0}
                    end={numericValue}
                    duration={2}
                    separator="," 
                    decimals={isPercentage ? 1 : 0}
                    decimal="."
                    suffix={isPercentage && !value.toString().includes('%') ? '%' : ''}
                  />
                </>
              )}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={cn(
                "flex items-center text-xs font-semibold px-2 py-1 rounded-full transition-all duration-300",
                positive 
                  ? "text-emerald-400 bg-emerald-500/20 group-hover:bg-emerald-500/30" 
                  : "text-red-400 bg-red-500/20 group-hover:bg-red-500/30"
              )}>
                {positive ? (
                  <ArrowUpRight className="h-3 w-3 mr-1 animate-pulse" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1 animate-pulse" />
                )}
                {loading ? (
                  <div className="h-3 w-10 bg-gray-700 animate-pulse rounded"></div>
                ) : (
                  `${Math.abs(change).toFixed(1)}%`
                )}
              </div>
              <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                {loading ? (
                  <div className="h-3 w-20 bg-gray-700 animate-pulse rounded"></div>
                ) : (
                  description
                )}
              </span>
            </div>
          </div>
          <div className="h-14 w-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-600 group-hover:from-blue-600 group-hover:to-teal-600 transition-all duration-500 shadow-lg group-hover:shadow-xl group-hover:scale-110 transform-gpu">
            <div className="transform group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
          </div>
        </div>
        {tooltip && (
          <div className="mt-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
            <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-800/50 px-3 py-2 rounded-lg backdrop-blur-sm">
              <Info className="h-3 w-3 animate-pulse" />
              <span>Click for detailed analytics</span>
            </div>
          </div>
        )}
        
        {/* Subtle shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      </CardContent>
    </Card>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {cardContent}
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-4" side="bottom">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm mb-1">{tooltip.title}</h4>
              <p className="text-xs text-muted-foreground">{tooltip.content}</p>
            </div>
            <div>
              <h5 className="font-medium text-xs mb-2 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Key Insights
              </h5>
              <ul className="space-y-1">
                {tooltip.insights.map((insight, index) => (
                  <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return cardContent;
}