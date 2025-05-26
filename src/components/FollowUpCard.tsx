
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MessageSquare, User, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface FollowUpCardProps {
  followUpNumber: number;
  date: string;
  comments: string;
  associate?: string;
}

export function FollowUpCard({ followUpNumber, date, comments, associate }: FollowUpCardProps) {
  const getFollowUpColor = (number: number) => {
    const colors = [
      'from-blue-500 to-indigo-500',
      'from-green-500 to-emerald-500', 
      'from-orange-500 to-amber-500',
      'from-purple-500 to-violet-500'
    ];
    return colors[(number - 1) % colors.length];
  };

  return (
    <Card className="shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Follow-up #{followUpNumber}
          </CardTitle>
          <Badge 
            className={`bg-gradient-to-r ${getFollowUpColor(followUpNumber)} text-white text-xs px-2 py-1 shadow-sm`}
          >
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(date)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {comments || 'No comments provided'}
            </p>
          </div>
          
          {associate && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <User className="w-3 h-3 text-slate-500" />
              <span className="text-xs text-slate-500">By {associate}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            <span>Logged on {formatDate(date)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
