
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
  Target
} from "lucide-react";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        hot: "border-transparent bg-red-500 text-white hover:bg-red-600",
        warm: "border-transparent bg-orange-500 text-white hover:bg-orange-600",
        cold: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
        converted: "border-transparent bg-green-500 text-white hover:bg-green-600",
        lost: "border-transparent bg-gray-500 text-white hover:bg-gray-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Hot: CheckCircle,
  Warm: Clock,
  Cold: AlertCircle,
  Converted: Target,
  Lost: XCircle,
};

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  status?: string;
  showIcon?: boolean;
}

function StatusBadge({ className, variant, status, showIcon = true, ...props }: StatusBadgeProps) {
  const getVariantFromStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'hot': return 'hot';
      case 'warm': return 'warm';  
      case 'cold': return 'cold';
      case 'converted': return 'converted';
      case 'lost': return 'lost';
      default: return 'default';
    }
  };

  const effectiveVariant = variant || getVariantFromStatus(status || '');
  const IconComponent = status ? statusIcons[status] : null;

  return (
    <div className={cn(statusBadgeVariants({ variant: effectiveVariant }), className)} {...props}>
      {showIcon && IconComponent && <IconComponent className="mr-1 h-3 w-3" />}
      {status || props.children}
    </div>
  );
}

export { StatusBadge, statusBadgeVariants };
