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
        backgroundColor: ['#10b981', '#6b7280'],
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
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: false,
      }]
    };
  } else if (type === 'area') {
    return {
      labels: baseLabels,
      datasets: [{
        ...baseDataset,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: true,
      }]
    };
  } else if (type === 'bar') {
    return {
      labels: baseLabels,
      datasets: [{
        ...baseDataset,
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: '#8b5cf6',
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
      className="overflow-hidden bg-white border-0 shadow-2xl transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:-translate-y-2 hover:scale-[1.02] group cursor-pointer rounded-2xl backdrop-blur-lg ring-1 ring-gradient-to-r ring-from-gray-800 ring-to-gray-600 hover:ring-from-blue-600 hover:ring-to-teal-600 transform-gpu"
      onClick={onDrillDown}
      style={{ height: 161 }} // Increased height by 15% (140 * 1.15 = 161)
    >
      {/* Dark gradient header bar */}
      <div className="h-1 w-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-teal-600 transition-all duration-500" />
      
      <CardContent className="p-4 relative overflow-hidden h-full flex flex-col"> {/* Reduced padding and flex layout */}
        {/* Subtle animated background accent */}
        <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-gray-800/10 via-transparent to-gray-600/10 group-hover:opacity-10 transition-opacity duration-500" />
        
        <div className="flex justify-between items-start relative z-10 flex-1">
          <div className="flex-1 min-w-0"> {/* Added min-w-0 for text overflow */}
            <p className="text-xs font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-1 tracking-wide uppercase group-hover:from-blue-600 group-hover:to-teal-600 transition-all duration-300">{title}</p>
            <h3 className="text-2xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1 group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300">
              {loading ? (
                <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
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
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex items-center text-xs font-semibold px-2 py-0.5 rounded-full transition-all duration-300",
                positive 
                  ? "text-emerald-700 bg-emerald-100 group-hover:bg-emerald-200 border border-emerald-300" 
                  : "text-red-700 bg-red-100 group-hover:bg-red-200 border border-red-300"
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
          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-700 group-hover:from-blue-600 group-hover:to-teal-600 transition-all duration-500 shadow-lg group-hover:shadow-xl group-hover:scale-110 transform-gpu border border-gray-600 group-hover:border-blue-500">
            <div className="transform group-hover:scale-110 transition-transform duration-300">
              {React.cloneElement(icon as React.ReactElement, {
                className: "h-5 w-5 text-white"
              })}
            </div>
          </div>
        </div>
        
        {/* Chart section at the bottom */}
        <div className="mt-2 h-12 w-full relative z-10"> {/* Fixed height chart area */}
          {!loading && (() => {
            const chartType = Math.random() > 0.75 ? 'doughnut' : 
                             Math.random() > 0.5 ? 'bar' : 
                             Math.random() > 0.25 ? 'area' : 'line';
            const chartData = generateChartData(chartType, title);
            
            switch(chartType) {
              case 'line':
                return <MiniLineChart data={chartData} />;
              case 'bar':
                return <MiniBarChart data={chartData} />;
              case 'area':
                return <MiniAreaChart data={chartData} />;
              case 'doughnut':
                return (
                  <div className="h-full w-12 mx-auto">
                    <MiniDoughnutChart data={chartData} />
                  </div>
                );
              default:
                return <MiniLineChart data={chartData} />;
            }
          })()}
        </div>
        
        {/* Subtle shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-800/5 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
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