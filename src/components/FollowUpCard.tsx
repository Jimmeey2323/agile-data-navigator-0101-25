
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MessageSquare, User, Clock, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface FollowUpCardProps {
  followUpNumber: number;
  date: string;
  comments: string;
  associate?: string;
}

export function FollowUpCard({ followUpNumber, date, comments, associate }: FollowUpCardProps) {
  return (
    <Card className="group relative shadow-sm border border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg hover:border-slate-300/80 dark:hover:border-slate-600/80 transition-all duration-300 ease-in-out bg-gradient-to-br from-slate-50/30 to-white dark:from-slate-800/30 dark:to-slate-900 overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50/20 dark:to-slate-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300">
              <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </div>
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300 tracking-wide">
              Follow-up #{followUpNumber}
            </CardTitle>
          </div>
          <Badge 
            variant="professional"
            className="text-xs px-3 py-1.5 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200/50 dark:border-slate-600/50"
          >
            <Calendar className="w-3 h-3 mr-1.5" />
            {formatDate(date)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 pb-5 relative z-10">
        <div className="space-y-4">
          {/* Comments Section */}
          <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-lg p-4 border border-slate-100/80 dark:border-slate-700/50 group-hover:bg-slate-50/70 dark:group-hover:bg-slate-800/40 transition-colors duration-300">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center mt-0.5 shadow-sm">
                <MessageSquare className="w-3 h-3 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {comments || 'No comments provided'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Footer Information */}
          <div className="flex items-center justify-between pt-2">
            {associate && (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-800 dark:to-indigo-900 flex items-center justify-center shadow-sm">
                  <User className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {associate}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
              <Clock className="w-3 h-3" />
              <span className="font-medium">Logged {formatDate(date)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
