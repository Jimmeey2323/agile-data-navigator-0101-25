import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  ArrowLeft,
  X,
  Users,
  MessageSquare,
  Calendar,
  BarChart3,
  Sparkles,
  Palette,
  CheckCircle,
  Target,
  TrendingUp,
  Brain
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  highlight: string;
  action: {
    text: string;
    target: string;
  };
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Enhanced Associates Analytics!',
    description: 'Your lead management system has been upgraded with advanced analytics, AI-powered insights, and modern UI components. Let\'s explore the new features.',
    icon: Sparkles,
    highlight: 'Complete system enhancement with 8+ new features',
    action: {
      text: 'Start Tour',
      target: 'associates-tab'
    }
  },
  {
    id: 'associates-dashboard',
    title: 'Enhanced Associates Dashboard',
    description: 'The new associates section provides comprehensive performance analytics, follow-up tracking, and AI-powered insights for better team management.',
    icon: Users,
    highlight: 'Click on the "Associates" tab to see the new dashboard',
    action: {
      text: 'View Dashboard',
      target: 'associates-tab'
    }
  },
  {
    id: 'follow-up-insights',
    title: 'Follow-up Analysis & Sentiment Tracking',
    description: 'Analyze follow-up comments with AI-powered sentiment analysis, categorize interactions, and track completion rates across different time periods.',
    icon: MessageSquare,
    highlight: 'AI analyzes comment sentiment and provides coaching insights',
    action: {
      text: 'Explore Insights',
      target: 'followups-tab'
    }
  },
  {
    id: 'weekly-performance',
    title: 'Week-over-Week Performance Tracking',
    description: 'Monitor performance trends with detailed week-over-week comparisons, identify patterns, and track improvement areas with visual analytics.',
    icon: Calendar,
    highlight: 'See performance trends and week-over-week changes',
    action: {
      text: 'View Trends',
      target: 'weekly-tab'
    }
  },
  {
    id: 'ai-features',
    title: 'AI-Powered Intelligence',
    description: 'Configure OpenAI integration to unlock sentiment analysis, comment categorization, and personalized coaching recommendations for each associate.',
    icon: Brain,
    highlight: 'Setup AI in the header settings for full feature access',
    action: {
      text: 'Configure AI',
      target: 'ai-settings'
    }
  },
  {
    id: 'theme-system',
    title: 'Modern UI & Dark Mode',
    description: 'Enjoy a refreshed interface with dark/light theme support, animated components, and improved mobile responsiveness.',
    icon: Palette,
    highlight: 'Try the theme toggle button in the header',
    action: {
      text: 'Toggle Theme',
      target: 'theme-toggle'
    }
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Explore all the new features at your own pace. The enhanced analytics will help you make data-driven decisions and improve team performance.',
    icon: CheckCircle,
    highlight: 'All features are now available and ready to use',
    action: {
      text: 'Start Exploring',
      target: 'explore'
    }
  }
];

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export function OnboardingFlow({ isOpen, onClose, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  if (!isOpen) return null;

  const currentStepData = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const Icon = currentStepData.icon;

  const handleNext = () => {
    if (isLastStep) {
      setShowSummary(true);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete?.();
    onClose();
  };

  const handleComplete = () => {
    onComplete?.();
    onClose();
  };

  const getStepProgress = () => {
    return ((currentStep + 1) / onboardingSteps.length) * 100;
  };

  if (showSummary) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Welcome to Your Enhanced System!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-slate-600 dark:text-slate-400">
                You're now ready to leverage the full power of the enhanced lead management system. 
                Start with the Associates dashboard to see the new analytics in action.
              </p>
              
              {/* Quick Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Associates</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">New Dashboard</div>
                </div>
                
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <Brain className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-purple-800 dark:text-purple-200">AI Setup</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">Enable Intelligence</div>
                </div>
                
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <Palette className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-green-800 dark:text-green-200">Themes</div>
                  <div className="text-xs text-green-600 dark:text-green-400">Dark/Light Mode</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button onClick={handleComplete} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-8">
                <Target className="w-4 h-4 mr-2" />
                Start Exploring
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white/95 dark:bg-slate-900/95 backdrop-blur border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-slate-500">Step {currentStep + 1} of {onboardingSteps.length}</span>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(getStepProgress())}% Complete
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getStepProgress()}%` }}
              />
            </div>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                {currentStepData.description}
              </p>
              
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                    <TrendingUp className="w-3 h-3 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Key Highlight</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{currentStepData.highlight}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step-specific content */}
            {currentStep === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-2xl font-bold text-green-600">8+</div>
                  <div className="text-sm text-green-700 dark:text-green-300">New Features</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-2xl font-bold text-blue-600">AI</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Powered Analytics</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-2xl font-bold text-purple-600">100%</div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">Ready to Use</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSkip}
                className="text-slate-600"
              >
                Skip Tour
              </Button>
              
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>
            
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isLastStep ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Finish Tour
                </>
              ) : (
                <>
                  {currentStepData.action.text}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}