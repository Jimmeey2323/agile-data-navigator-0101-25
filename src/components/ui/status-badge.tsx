
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  Flame, 
  TrendingUp, 
  Snowflake, 
  Trophy, 
  CheckCircle, 
  XCircle, 
  Clock,
  Star,
  Eye,
  Sparkles,
  Phone,
  Heart,
  FileText,
  Handshake,
  Ban,
  EyeOff,
  ThumbsDown,
  type LucideIcon as LucideIconType
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<string, { 
  icon: LucideIconType; 
  color: string; 
  bgColor: string; 
  label: string; 
}> = {
  'Hot': {
    icon: Flame,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    label: 'Hot'
  },
  'Warm': {
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    label: 'Warm'
  },
  'Cold': {
    icon: Snowflake,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    label: 'Cold'
  },
  'Won': {
    icon: Trophy,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    label: 'Won'
  },
  'Converted': {
    icon: CheckCircle,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-200',
    label: 'Converted'
  },
  'Lost': {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    label: 'Lost'
  },
  'Open': {
    icon: Eye,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    label: 'Open'
  },
  'New': {
    icon: Sparkles,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50 border-cyan-200',
    label: 'New'
  },
  'Contacted': {
    icon: Phone,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-200',
    label: 'Contacted'
  },
  'Qualified': {
    icon: CheckCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    label: 'Qualified'
  },
  'Nurturing': {
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 border-pink-200',
    label: 'Nurturing'
  },
  'Proposal': {
    icon: FileText,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50 border-violet-200',
    label: 'Proposal'
  },
  'Negotiation': {
    icon: Handshake,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
    label: 'Negotiation'
  },
  'Disqualified': {
    icon: Ban,
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    label: 'Disqualified'
  },
  'Unresponsive': {
    icon: EyeOff,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 border-gray-200',
    label: 'Unresponsive'
  },
  'Rejected': {
    icon: ThumbsDown,
    color: 'text-red-800',
    bgColor: 'bg-red-50 border-red-200',
    label: 'Rejected'
  }
};

export function StatusBadge({ 
  status, 
  variant = 'default', 
  size = 'md',
  showIcon = true,
  className 
}: StatusBadgeProps) {
  const config = statusConfig[status];
  
  if (!config) {
    return (
      <Badge variant="outline" className={cn('text-gray-600', className)}>
        {status}
      </Badge>
    );
  }
  
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs h-6 px-2',
    md: 'text-sm h-7 px-3',
    lg: 'text-base h-8 px-4'
  };
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  };
  
  return (
    <Badge 
      variant={variant}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium transition-all',
        sizeClasses[size],
        variant === 'default' && config.bgColor,
        config.color,
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
}
