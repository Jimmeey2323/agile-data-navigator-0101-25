
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  User, 
  Phone, 
  Calendar, 
  Target,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";

const enhancedBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-green-500 text-white hover:bg-green-600",
        warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
        error: "border-transparent bg-red-500 text-white hover:bg-red-600",
        info: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
        premium: "border-transparent bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600",
        trending: "border-transparent bg-gradient-to-r from-green-400 to-blue-500 text-white hover:from-green-500 hover:to-blue-600",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-sm",
        lg: "px-3 py-1 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface EnhancedBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof enhancedBadgeVariants> {
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  pulse?: boolean;
  glow?: boolean;
}

function EnhancedBadge({ 
  className, 
  variant, 
  size, 
  icon, 
  trend, 
  pulse = false, 
  glow = false,
  children,
  ...props 
}: EnhancedBadgeProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="ml-1 h-3 w-3" />;
      case 'down': return <TrendingDown className="ml-1 h-3 w-3" />;
      case 'neutral': return <Minus className="ml-1 h-3 w-3" />;
      default: return null;
    }
  };

  const baseClasses = cn(
    enhancedBadgeVariants({ variant, size }),
    {
      'animate-pulse': pulse,
      'shadow-lg': glow,
      'shadow-current': glow,
    },
    className
  );

  return (
    <div className={baseClasses} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
      {getTrendIcon()}
    </div>
  );
}

export { EnhancedBadge, enhancedBadgeVariants };
