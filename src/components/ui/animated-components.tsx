import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useTheme, useAnimations } from '@/contexts/ThemeContext';

// Animated Card Component
interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
  hover?: boolean;
  glass?: boolean;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, delay = 0, hover = true, glass = false, ...props }, ref) => {
    const animations = useAnimations();
    const { isDark } = useTheme();
    
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border shadow-sm transition-all duration-300',
          glass 
            ? `bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-white/20 dark:border-slate-700/20`
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
          hover && 'hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1',
          animations.slideIn,
          className
        )}
        style={{ animationDelay: `${delay}ms` }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

// Animated Button Component
interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, className, variant = 'primary', size = 'md', loading = false, icon, disabled, ...props }, ref) => {
    const { isDark } = useTheme();
    
    const variants = {
      primary: 'bg-gradient-to-r from-blue-500 to-teal-600 hover:from-blue-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl',
      secondary: 'bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 text-slate-700 dark:text-slate-200 hover:from-slate-300 hover:to-slate-400 dark:hover:from-slate-600 dark:hover:to-slate-500',
      success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl',
      warning: 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl',
      error: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
    };
    
    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg'
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
          'hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2',
          variants[variant],
          sizes[size],
          (disabled || loading) && 'opacity-50 cursor-not-allowed hover:scale-100',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
        ) : icon ? (
          icon
        ) : null}
        {children}
      </button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

// Animated Badge Component
interface AnimatedBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  pulse?: boolean;
}

export const AnimatedBadge = forwardRef<HTMLDivElement, AnimatedBadgeProps>(
  ({ children, className, variant = 'default', pulse = false, ...props }, ref) => {
    const variants = {
      default: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200',
          variants[variant],
          pulse && 'animate-pulse',
          'hover:scale-110',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AnimatedBadge.displayName = 'AnimatedBadge';

// Animated Progress Bar
interface AnimatedProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const AnimatedProgress = forwardRef<HTMLDivElement, AnimatedProgressProps>(
  ({ value, max = 100, color = 'blue', size = 'md', animated = true, className, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const colors = {
      blue: 'from-blue-400 to-blue-600',
      green: 'from-green-400 to-green-600',
      yellow: 'from-yellow-400 to-yellow-600',
      red: 'from-red-400 to-red-600',
      purple: 'from-purple-400 to-purple-600'
    };
    
    const sizes = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4'
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          'w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden',
          sizes[size],
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out',
            colors[color],
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);

AnimatedProgress.displayName = 'AnimatedProgress';

// Stagger Animation Container
interface StaggerContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  stagger?: number;
}

export const StaggerContainer = forwardRef<HTMLDivElement, StaggerContainerProps>(
  ({ children, stagger = 100, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-4', className)}
        {...props}
      >
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            className="animate-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * stagger}ms` }}
          >
            {child}
          </div>
        ))}
      </div>
    );
  }
);

StaggerContainer.displayName = 'StaggerContainer';

// Floating Action Button
interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const FloatingActionButton = forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ children, className, position = 'bottom-right', ...props }, ref) => {
    const positions = {
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6',
      'top-right': 'top-6 right-6',
      'top-left': 'top-6 left-6'
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          'fixed z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300',
          'bg-gradient-to-r from-blue-500 to-teal-600 text-white',
          'hover:shadow-xl hover:scale-110 active:scale-95',
          'focus:outline-none focus:ring-4 focus:ring-blue-300',
          positions[position],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

FloatingActionButton.displayName = 'FloatingActionButton';

// Animated Counter
interface AnimatedCounterProps {
  end: number;
  start?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  end,
  start = 0,
  duration = 2,
  decimals = 0,
  prefix = '',
  suffix = '',
  className
}) => {
  const [count, setCount] = React.useState(start);
  
  React.useEffect(() => {
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = start + (end - start) * easeOutQuart;
      
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, start, duration]);
  
  return (
    <span className={cn('font-bold tabular-nums', className)}>
      {prefix}
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString()}
      {suffix}
    </span>
  );
};

// Skeleton Loader
interface MotionSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
  avatar?: boolean;
  width?: string;
  height?: string;
}

export const MotionSkeleton = forwardRef<HTMLDivElement, MotionSkeletonProps>(
  ({ lines = 3, avatar = false, width, height, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('animate-pulse space-y-3', className)} {...props}>
        {avatar && (
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-slate-300 dark:bg-slate-600 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-3/4" />
              <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-1/2" />
            </div>
          </div>
        )}
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="h-3 bg-slate-300 dark:bg-slate-600 rounded"
            style={{
              width: width || `${Math.random() * 30 + 70}%`,
              height: height || undefined
            }}
          />
        ))}
      </div>
    );
  }
);

MotionSkeleton.displayName = 'MotionSkeleton';