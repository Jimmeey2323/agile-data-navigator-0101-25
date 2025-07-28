
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Flame, 
  Snowflake,
  TrendingUp,
  Eye,
  Award,
  Star,
  Activity,
  HelpCircle,
  type LucideIcon
} from "lucide-react"

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        won: "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
        lost: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
        hot: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
        warm: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
        cold: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
        converted: "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
        open: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
        disqualified: "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100",
        unresponsive: "border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type IconComponent = typeof LucideIcon

const statusIcons: Record<string, IconComponent> = {
  won: CheckCircle,
  lost: XCircle,
  hot: Flame,
  warm: TrendingUp,
  cold: Snowflake,
  converted: Award,
  open: Eye,
  disqualified: XCircle,
  unresponsive: Clock,
  default: Activity,
}

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  showIcon?: boolean
}

function StatusBadge({ className, variant, showIcon = true, children, ...props }: StatusBadgeProps) {
  const IconComponent = statusIcons[variant || 'default'] || statusIcons.default
  
  return (
    <div className={cn(statusBadgeVariants({ variant }), className)} {...props}>
      {showIcon && <IconComponent className="w-3 h-3 mr-1" />}
      {children}
    </div>
  )
}

export { StatusBadge, statusBadgeVariants }
