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
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useLeads } from '@/contexts/LeadContext';
import { cn, formatNumber, calculatePercentageChange } from '@/lib/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CountUp from 'react-countup';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

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

  // Format revenue values with 1 decimal place
  const formatRevenue = (value: number): string => {
    if (value >= 10000000) { // 1 Crore
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) { // 1 Lakh
      return `₹${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) { // 1 Thousand
      return `₹${(value / 1000).toFixed(1)}K`;
    } else {
      return `₹${value.toFixed(1)}`;
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
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-blue-600/10 to-teal-600/10 rounded-2xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center shadow-lg">
                <BarChart3 className="h-6 w-6 text-gray-200 animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-200">
                  Key Metrics
                </h2>
                <p className="text-sm text-gray-300 mt-1">Real-time performance insights</p>
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
              icon={<Users className="h-6 w-6" />}
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
              icon={<Layers className="h-6 w-6" />}
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
              icon={<Activity className="h-6 w-6" />}
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
              icon={<Star className="h-6 w-6" />}
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
              icon={<Clock className="h-6 w-6" />}
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
              icon={<MessageSquare className="h-6 w-6" />}
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
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
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

// Generate chart data helper function
const generateChartData = (type: 'line' | 'bar' | 'area' | 'doughnut', title: string) => {
  const baseLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const isPositive = Math.random() > 0.3;
  
  let data;
  if (type === 'doughnut') {
    data = [65, 35];
    return {
      labels: ['Converted', 'Pending'],
      datasets: [{
        data,
        backgroundColor: ['#1e3a8a', '#1d4ed8'],
        borderWidth: 0,
      }]
    };
  } else {
    data = baseLabels.map((_, i) => {
      const base = 10 + Math.random() * 30;
      const trend = isPositive ? i * 2 : (baseLabels.length - i) * 1.5;
      return Math.max(5, base + trend + (Math.random() - 0.5) * 10);
    });
  }

  const baseDataset = {
    data,
    borderWidth: 2,
    pointRadius: 0,
    pointHoverRadius: 3,
  };

  if (type === 'line') {
    return {
      labels: baseLabels,
      datasets: [{
        ...baseDataset,
        borderColor: '#1d4ed8',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: false,
      }]
    };
  } else if (type === 'area') {
    return {
      labels: baseLabels,
      datasets: [{
        ...baseDataset,
        borderColor: '#1d4ed8',
        backgroundColor: 'rgba(29, 78, 216, 0.2)',
        fill: true,
      }]
    };
  } else if (type === 'bar') {
    return {
      labels: baseLabels,
      datasets: [{
        ...baseDataset,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3b82f6',
        borderWidth: 1,
      }]
    };
  }
};

// Mini chart components
const MiniLineChart = ({ data }: { data: any }) => (
  <Line
    data={data}
    options={{
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { display: false },
        y: { display: false }
      },
      elements: { point: { radius: 0 } },
      interaction: { intersect: false }
    }}
  />
);

const MiniBarChart = ({ data }: { data: any }) => (
  <Bar
    data={data}
    options={{
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    }}
  />
);

const MiniAreaChart = ({ data }: { data: any }) => (
  <Line
    data={data}
    options={{
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { display: false },
        y: { display: false }
      },
      elements: { point: { radius: 0 } },
      interaction: { intersect: false }
    }}
  />
);

const MiniDoughnutChart = ({ data }: { data: any }) => (
  <Doughnut
    data={data}
    options={{
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      cutout: '70%'
    }}
  />
);

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
      className="overflow-hidden bg-gradient-to-br from-white via-gray-50/80 to-white border-0 shadow-[0_8px_32px_rgba(31,38,135,0.17)] hover:shadow-[0_12px_48px_rgba(31,38,135,0.25)] transition-all duration-700 hover:-translate-y-3 hover:scale-[1.03] group cursor-pointer rounded-3xl backdrop-blur-xl backdrop-saturate-200 ring-1 ring-white/20 hover:ring-white/40 transform-gpu relative before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-blue-600/5 before:via-blue-600/5 before:to-teal-600/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500"
      onClick={onDrillDown}
      style={{ height: 165, minHeight: 165, maxHeight: 165 }} // Fixed container height with constraints
    >
      {/* Sophisticated gradient header with animated shimmer */}
      <div className="h-1.5 w-full bg-gradient-to-r from-slate-200 via-blue-300/60 to-slate-200 group-hover:from-blue-500 group-hover:via-blue-500 group-hover:to-teal-500 transition-all duration-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      </div>
      
      <CardContent className="p-4 relative overflow-hidden flex flex-col" style={{ height: 'calc(100% - 6px)' }}> {/* Controlled padding and explicit height calculation */}
        {/* Advanced glassmorphism background with animated particles */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute top-4 right-6 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse" />
          <div className="absolute top-8 right-4 w-1 h-1 bg-blue-400/40 rounded-full animate-pulse delay-300" />
          <div className="absolute bottom-6 left-4 w-1.5 h-1.5 bg-teal-400/35 rounded-full animate-pulse delay-500" />
        </div>
        <div className="absolute inset-0 opacity-3 bg-gradient-to-br from-blue-600/8 via-transparent to-blue-600/8 group-hover:opacity-8 transition-opacity duration-700" />
        
        <div className="flex justify-between items-start relative z-10 flex-shrink-0 mb-2"> {/* Changed from flex-1 to flex-shrink-0 with fixed margin */}
          <div className="flex-1 min-w-0 overflow-hidden"> {/* Added overflow-hidden for text containment */}
            <p className="text-xs font-bold bg-gradient-to-r from-gray-700 to-gray-500 bg-clip-text text-transparent mb-1 tracking-wider uppercase group-hover:from-blue-600 group-hover:to-blue-600 transition-all duration-500 relative truncate"> {/* Reduced margin and added truncate */}
              <span className="relative z-10">{title}</span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500" />
            </p>
            <h3 className="text-2xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-1 group-hover:from-blue-700 group-hover:via-blue-700 group-hover:to-teal-700 transition-all duration-500 relative drop-shadow-sm leading-tight truncate"> {/* Reduced size from 3xl to 2xl, reduced margin, added leading-tight and truncate */}
              {loading ? (
                <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <>
                  {isCurrency ? (
                    // For currency values, use formatted display but CountUp the scaled number
                    <CountUp
                      start={0}
                      end={currencyValue >= 10000000 ? currencyValue / 10000000 : 
                           currencyValue >= 100000 ? currencyValue / 100000 : 
                           currencyValue >= 1000 ? currencyValue / 1000 : currencyValue}
                      duration={2}
                      separator="," 
                      decimals={1}
                      decimal="."
                      prefix="₹"
                      suffix={currencyValue >= 10000000 ? 'Cr' : 
                             currencyValue >= 100000 ? 'L' : 
                             currencyValue >= 1000 ? 'K' : ''}
                    />
                  ) : (
                    <CountUp
                      start={0}
                      end={numericValue}
                      duration={2}
                      separator="," 
                      decimals={isPercentage ? 1 : 0}
                      decimal="."
                      suffix={isPercentage && !value.toString().includes('%') ? '%' : ''}
                    />
                  )}
                </>
              )}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0"> {/* Added flex-shrink-0 */}
              <div className={cn(
                "flex items-center text-xs font-bold px-2 py-0.5 rounded-full transition-all duration-500 backdrop-blur-sm shadow-lg flex-shrink-0", /* Reduced padding and added flex-shrink-0 */
                positive 
                  ? "text-emerald-800 bg-gradient-to-r from-emerald-100 to-emerald-50 group-hover:from-emerald-200 group-hover:to-emerald-100 border border-emerald-300/60 group-hover:border-emerald-400 shadow-emerald-200/50" 
                  : "text-red-800 bg-gradient-to-r from-red-100 to-red-50 group-hover:from-red-200 group-hover:to-red-100 border border-red-300/60 group-hover:border-red-400 shadow-red-200/50"
              )}>
                {positive ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {loading ? (
                  <div className="h-3 w-8 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  `${Math.abs(change).toFixed(1)}%`
                )}
              </div>
            </div>
          </div>
          <div className="h-10 w-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 group-hover:from-blue-600 group-hover:via-blue-600 group-hover:to-teal-600 transition-all duration-700 shadow-2xl shadow-gray-900/25 group-hover:shadow-blue-600/30 group-hover:scale-110 transform-gpu border border-gray-500/50 group-hover:border-blue-400/60 backdrop-blur-sm relative overflow-hidden flex-shrink-0"> {/* Reduced size from 12x12 to 10x10 and added flex-shrink-0 */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
            <div className="transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 relative z-10">
              {React.cloneElement(icon as React.ReactElement, {
                className: "h-4 w-4 text-white" // Reduced icon size from h-5 w-5 to h-4 w-4
              })}
            </div>
          </div>
        </div>
        
        {/* Enhanced chart section with gradient background */}
        <div className="flex-1 min-h-0 w-full relative z-10 rounded-xl bg-gradient-to-br from-gray-50/80 to-white/60 backdrop-blur-sm border border-gray-200/40 p-2 group-hover:border-blue-300/40 transition-all duration-500 overflow-hidden"> {/* Changed to flex-1 with min-h-0 for proper flex behavior and added overflow-hidden */}
          {!loading && (() => {
            const chartType = Math.random() > 0.75 ? 'doughnut' : 
                             Math.random() > 0.5 ? 'bar' : 
                             Math.random() > 0.25 ? 'area' : 'line';
            const chartData = generateChartData(chartType, title);
            
            switch(chartType) {
              case 'line':
                return <div className="h-full w-full overflow-hidden"><MiniLineChart data={chartData} /></div>;
              case 'bar':
                return <div className="h-full w-full overflow-hidden"><MiniBarChart data={chartData} /></div>;
              case 'area':
                return <div className="h-full w-full overflow-hidden"><MiniAreaChart data={chartData} /></div>;
              case 'doughnut':
                return (
                  <div className="h-full w-full flex items-center justify-center overflow-hidden">
                    <div className="h-full w-8 max-w-full"> {/* Reduced from w-12 to w-8 and added max-w-full */}
                      <MiniDoughnutChart data={chartData} />
                    </div>
                  </div>
                );
              default:
                return <div className="h-full w-full overflow-hidden"><MiniLineChart data={chartData} /></div>;
            }
          })()}
        </div>
        
        {/* Advanced shine and glow effects on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-400/8 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1500 ease-out" />
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/60 to-transparent transform group-hover:translate-x-full transition-transform duration-1200 delay-200" />
        </div>
        {/* Outer glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-br from-blue-600/0 via-blue-600/0 to-teal-600/0 group-hover:from-blue-600/10 group-hover:via-blue-600/10 group-hover:to-teal-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-xl" />
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