
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Settings, Clock, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLeads } from '@/contexts/LeadContext';
import { cn, formatDate } from '@/lib/utils';

export function Header() {
  const location = useLocation();
  const { lastRefreshed, isRefreshing, refreshData } = useLeads();
  const [showMenu, setShowMenu] = useState(false);
  
  const navItems = [
    { path: '/', label: 'Leads - Main' },
    { path: '/leads-by-associate', label: 'Leads by Associate' },
    { path: '/ai-insights', label: 'AI Insights' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/leads-by-source', label: 'Leads by Source' },
    { path: '/admin', label: 'Admin' },
  ];
  
  return (
    <header className="sticky top-0 z-40 w-full glass shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-lg font-semibold">L</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Lead Portal
            </span>
          </Link>
          
          <div className="h-6 border-l border-border mx-2" />
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-1 ml-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:text-foreground hover:bg-secondary/80"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          {/* Mobile nav trigger */}
          <button
            className="md:hidden flex items-center gap-1 ml-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={() => setShowMenu(!showMenu)}
          >
            <span>Menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn("transition-transform", showMenu ? "rotate-180" : "")}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Last updated: {formatDate(lastRefreshed.toISOString(), "HH:mm:ss")}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Data auto-refreshes every 15 minutes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => refreshData()}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            <span className="sr-only">Refresh</span>
          </Button>
          
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>
          
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </div>
      
      {/* Mobile navigation menu */}
      {showMenu && (
        <div className="md:hidden px-6 pb-4 border-t border-border/30 bg-background/95 backdrop-blur-md">
          <nav className="flex flex-col gap-1 mt-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:text-foreground hover:bg-secondary/80"
                )}
                onClick={() => setShowMenu(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
