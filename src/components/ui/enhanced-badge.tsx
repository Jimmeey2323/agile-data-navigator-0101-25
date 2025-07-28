
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { 
  Globe, 
  Users, 
  Calendar, 
  Target, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Flame, 
  Snowflake,
  Phone,
  Mail,
  UserPlus,
  MessageCircle,
  Star,
  Award,
  Zap,
  TrendingUp,
  Heart,
  Eye,
  ThumbsUp,
  Crown,
  Sparkles
} from "lucide-react"

const enhancedBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        
        // Source variants
        website: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
        social: "border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100",
        referral: "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
        event: "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100",
        coldcall: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
        email: "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100",
        other: "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100",
        
        // Stage variants
        newenquiry: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
        initialcontact: "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
        trialscheduled: "border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
        trialcompleted: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
        membershipsold: "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
        notinterested: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
        lost: "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100",
        
        // Status variants
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

const iconMap = {
  // Source icons
  website: Globe,
  social: Users,
  referral: UserPlus,
  event: Calendar,
  coldcall: Phone,
  email: Mail,
  other: Activity,
  
  // Stage icons
  newenquiry: Star,
  initialcontact: MessageCircle,
  trialscheduled: Calendar,
  trialcompleted: CheckCircle,
  membershipsold: Award,
  notinterested: XCircle,
  lost: XCircle,
  
  // Status icons
  won: CheckCircle,
  lost: XCircle,
  hot: Flame,
  warm: TrendingUp,
  cold: Snowflake,
  converted: Award,
  open: Eye,
  disqualified: XCircle,
  unresponsive: Clock,
}

export interface EnhancedBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof enhancedBadgeVariants> {
  showIcon?: boolean
}

function EnhancedBadge({ className, variant, showIcon = true, children, ...props }: EnhancedBadgeProps) {
  const IconComponent = variant && iconMap[variant as keyof typeof iconMap]
  
  return (
    <div className={cn(enhancedBadgeVariants({ variant }), className)} {...props}>
      {showIcon && IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
      {children}
    </div>
  )
}

export { EnhancedBadge, enhancedBadgeVariants }
