// AI Service for OpenAI integration
export interface AIConfig {
  apiKey: string;
  model: string;
  temperature: number;
}

export interface SentimentAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  keywords: string[];
  category: string;
  emotion?: string;
  urgency?: 'low' | 'medium' | 'high';
}

export interface FollowUpAnalysis {
  overallSentiment: SentimentAnalysis;
  commentBreakdown: {
    comment: string;
    sentiment: SentimentAnalysis;
    date: string;
    followUpStage: number;
  }[];
  insights: string[];
  recommendations: string[];
}

export interface AssociatePerformanceInsights {
  associate: string;
  strengths: string[];
  improvementAreas: string[];
  coachingRecommendations: string[];
  sentimentTrends: {
    week: string;
    averageSentiment: number;
    totalInteractions: number;
  }[];
  nextActions: string[];
}

export interface AIInsight {
  id: string;
  type: 'insight' | 'recommendation' | 'prediction' | 'analysis';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  data?: any;
  createdAt: string;
}

export interface LeadScore {
  score: number;
  factors: {
    name: string;
    weight: number;
    value: number;
    impact: number;
  }[];
  recommendations: string[];
  nextBestAction: string;
}

export interface AIAnalysisResult {
  insights: AIInsight[];
  leadScores: Record<string, LeadScore>;
  predictions: {
    conversionProbability: number;
    timeToConversion: number;
    recommendedActions: string[];
  };
  summary: string;
}

class AIService {
  private config: AIConfig | null = null;

  // Initialize AI service with API key
  initialize(config: AIConfig) {
    this.config = config;
    localStorage.setItem('ai_config', JSON.stringify(config));
  }

  // Load config from localStorage
  loadConfig(): AIConfig | null {
    const stored = localStorage.getItem('ai_config');
    if (stored) {
      this.config = JSON.parse(stored);
      return this.config;
    }
    return null;
  }

  // Check if AI is configured
  isConfigured(): boolean {
    return this.config !== null && this.config.apiKey !== '';
  }

  // Analyze sentiment of follow-up comments
  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    if (!this.isConfigured()) {
      // Fallback to simple keyword-based analysis
      return this.fallbackSentimentAnalysis(text);
    }

    const systemPrompt = `You are an expert sentiment analyzer specializing in customer service and sales interactions. 
    Analyze the sentiment, emotion, and urgency of customer communications.
    Consider context, tone, and underlying emotions beyond just positive/negative classification.`;

    const prompt = `Analyze this customer comment for sentiment, emotion, and urgency:

"${text}"

Provide analysis as JSON:
{
  "sentiment": "positive|neutral|negative",
  "confidence": 0.85,
  "keywords": ["relevant", "keywords"],
  "category": "interest|objection|timing|price|information",
  "emotion": "excited|concerned|frustrated|curious|etc",
  "urgency": "low|medium|high"
}`;

    try {
      const response = await this.callOpenAI(prompt, systemPrompt);
      const analysis = JSON.parse(response);
      return analysis;
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      return this.fallbackSentimentAnalysis(text);
    }
  }

  // Fallback sentiment analysis using keyword matching
  private fallbackSentimentAnalysis(text: string): SentimentAnalysis {
    if (!text || text.trim().length === 0) {
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        keywords: [],
        category: 'no-response'
      };
    }

    const lowerText = text.toLowerCase();
    
    // Define keyword patterns
    const positiveWords = ['interested', 'great', 'excellent', 'good', 'positive', 'excited', 'ready', 'yes', 'perfect', 'amazing'];
    const negativeWords = ['not', 'no', 'busy', 'later', 'maybe', 'unsure', 'difficult', 'problem', 'expensive', 'cancel'];
    const urgencyWords = ['urgent', 'asap', 'immediately', 'quick', 'fast', 'soon', 'today', 'now'];
    const interestWords = ['interested', 'curious', 'want', 'need', 'like', 'love'];
    const objectionWords = ['expensive', 'cost', 'price', 'budget', 'think', 'consider'];
    
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    const urgencyCount = urgencyWords.filter(word => lowerText.includes(word)).length;
    
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    let confidence = 0.6;
    let category = 'general';
    
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      confidence = Math.min(0.8, 0.5 + positiveCount * 0.1);
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      confidence = Math.min(0.8, 0.5 + negativeCount * 0.1);
    }
    
    // Determine category
    if (interestWords.some(word => lowerText.includes(word))) {
      category = 'interest';
    } else if (objectionWords.some(word => lowerText.includes(word))) {
      category = 'objection';
    } else if (lowerText.includes('busy') || lowerText.includes('time')) {
      category = 'timing';
    } else if (lowerText.includes('information') || lowerText.includes('detail')) {
      category = 'information';
    }
    
    const urgency = urgencyCount > 0 ? 'high' : 
                   (lowerText.includes('soon') || lowerText.includes('quick')) ? 'medium' : 'low';
    
    return {
      sentiment,
      confidence,
      keywords: [...positiveWords, ...negativeWords, ...urgencyWords].filter(word => lowerText.includes(word)),
      category,
      urgency: urgency as 'low' | 'medium' | 'high'
    };
  }

  // Analyze multiple follow-up comments for a lead
  async analyzeFollowUpComments(lead: any): Promise<FollowUpAnalysis> {
    const comments = [
      { text: lead.followUp1Comment, date: lead.followUp1Date, stage: 1 },
      { text: lead.followUp2Comment, date: lead.followUp2Date, stage: 2 },
      { text: lead.followUp3Comment, date: lead.followUp3Date, stage: 3 },
      { text: lead.followUp4Comment, date: lead.followUp4Date, stage: 4 }
    ].filter(comment => comment.text && comment.text.trim().length > 0);

    if (comments.length === 0) {
      return {
        overallSentiment: {
          sentiment: 'neutral',
          confidence: 0.5,
          keywords: [],
          category: 'no-comments'
        },
        commentBreakdown: [],
        insights: ['No follow-up comments available for analysis'],
        recommendations: ['Encourage detailed follow-up documentation']
      };
    }

    const commentAnalysis = await Promise.all(
      comments.map(async (comment) => ({
        comment: comment.text,
        sentiment: await this.analyzeSentiment(comment.text),
        date: comment.date,
        followUpStage: comment.stage
      }))
    );

    // Calculate overall sentiment
    const sentiments = commentAnalysis.map(c => c.sentiment);
    const avgConfidence = sentiments.reduce((sum, s) => sum + s.confidence, 0) / sentiments.length;
    const positiveCount = sentiments.filter(s => s.sentiment === 'positive').length;
    const negativeCount = sentiments.filter(s => s.sentiment === 'negative').length;
    
    let overallSentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (positiveCount > negativeCount) overallSentiment = 'positive';
    else if (negativeCount > positiveCount) overallSentiment = 'negative';

    // Generate insights
    const insights = [];
    const recommendations = [];

    if (overallSentiment === 'positive') {
      insights.push('Customer shows positive engagement throughout follow-up process');
      recommendations.push('Continue with current approach and move towards closing');
    } else if (overallSentiment === 'negative') {
      insights.push('Customer sentiment declining - needs immediate attention');
      recommendations.push('Schedule a personal call to address concerns');
    }

    if (sentiments.some(s => s.category === 'objection')) {
      insights.push('Price or feature concerns identified in communications');
      recommendations.push('Prepare value proposition and address specific objections');
    }

    if (sentiments.some(s => s.urgency === 'high')) {
      insights.push('High urgency detected - customer has immediate needs');
      recommendations.push('Prioritize this lead for immediate follow-up');
    }

    return {
      overallSentiment: {
        sentiment: overallSentiment,
        confidence: avgConfidence,
        keywords: [...new Set(sentiments.flatMap(s => s.keywords))],
        category: sentiments[sentiments.length - 1]?.category || 'general'
      },
      commentBreakdown: commentAnalysis,
      insights,
      recommendations
    };
  }

  // Generate performance insights for associates
  async generateAssociateInsights(associate: string, leads: any[]): Promise<AssociatePerformanceInsights> {
    const associateLeads = leads.filter(lead => lead.associate === associate);
    
    if (associateLeads.length === 0) {
      return {
        associate,
        strengths: [],
        improvementAreas: ['Insufficient data for analysis'],
        coachingRecommendations: ['Assign more leads to generate meaningful insights'],
        sentimentTrends: [],
        nextActions: ['Monitor performance with increased lead volume']
      };
    }

    // Analyze conversion patterns
    const conversions = associateLeads.filter(lead => lead.stage === 'Membership Sold');
    const conversionRate = (conversions.length / associateLeads.length) * 100;
    
    // Analyze follow-up patterns
    const followUpAnalysis = await Promise.all(
      associateLeads.map(lead => this.analyzeFollowUpComments(lead))
    );
    
    const strengths = [];
    const improvementAreas = [];
    const coachingRecommendations = [];
    const nextActions = [];

    // Analyze performance patterns
    if (conversionRate > 30) {
      strengths.push('High conversion rate indicates excellent closing skills');
    } else if (conversionRate < 15) {
      improvementAreas.push('Below-average conversion rate needs improvement');
      coachingRecommendations.push('Focus on qualifying leads better and improving closing techniques');
    }

    // Analyze sentiment patterns
    const positiveInteractions = followUpAnalysis.filter(a => a.overallSentiment.sentiment === 'positive').length;
    const negativeInteractions = followUpAnalysis.filter(a => a.overallSentiment.sentiment === 'negative').length;
    
    if (positiveInteractions > negativeInteractions * 2) {
      strengths.push('Excellent customer rapport and communication skills');
    } else if (negativeInteractions > positiveInteractions) {
      improvementAreas.push('Customer sentiment analysis shows room for improvement');
      coachingRecommendations.push('Work on empathy, active listening, and objection handling');
    }

    // Generate week-over-week sentiment trends (mock data for now)
    const sentimentTrends = Array.from({ length: 8 }, (_, i) => ({
      week: `Week ${i + 1}`,
      averageSentiment: 0.6 + Math.random() * 0.3,
      totalInteractions: Math.floor(Math.random() * 15) + 5
    }));

    // Default recommendations
    if (nextActions.length === 0) {
      nextActions.push('Continue monitoring performance metrics');
      nextActions.push('Schedule weekly one-on-one review meetings');
    }

    return {
      associate,
      strengths,
      improvementAreas,
      coachingRecommendations,
      sentimentTrends,
      nextActions
    };
  }
  private async callOpenAI(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.config) {
      throw new Error('AI service not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4',
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        temperature: this.config.temperature || 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  // Analyze leads data and generate insights
  async analyzeLeads(leads: any[]): Promise<AIAnalysisResult> {
    if (!this.isConfigured()) {
      throw new Error('AI service not configured');
    }

    const systemPrompt = `You are an expert CRM analyst specializing in lead management and conversion optimization. 
    Analyze the provided lead data and generate actionable insights, recommendations, and predictions.
    Focus on conversion patterns, lead quality indicators, and optimization opportunities.
    Provide specific, data-driven recommendations that can improve lead conversion rates.`;

    const prompt = `Analyze this lead data and provide insights:

Lead Summary:
- Total Leads: ${leads.length}
- Sources: ${[...new Set(leads.map(l => l.source))].join(', ')}
- Stages: ${[...new Set(leads.map(l => l.stage))].join(', ')}
- Status Distribution: ${Object.entries(leads.reduce((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {})).map(([k, v]) => `${k}: ${v}`).join(', ')}

Sample Lead Data (first 5):
${leads.slice(0, 5).map(lead => `
- ${lead.fullName}: ${lead.source} → ${lead.stage} (${lead.status})
  Follow-ups: ${[lead.followUp1Date, lead.followUp2Date, lead.followUp3Date, lead.followUp4Date].filter(Boolean).length}/4
  Created: ${lead.createdAt}
`).join('')}

Please provide:
1. Key insights about lead quality and conversion patterns
2. Specific recommendations for improvement
3. Predictions about conversion likelihood
4. Actionable next steps for the sales team

Format your response as JSON with the following structure:
{
  "insights": [
    {
      "type": "insight|recommendation|prediction",
      "title": "Brief title",
      "description": "Detailed description",
      "confidence": 0.85,
      "priority": "high|medium|low",
      "category": "conversion|quality|timing|process"
    }
  ],
  "summary": "Overall analysis summary",
  "recommendations": ["Action 1", "Action 2", "Action 3"]
}`;

    try {
      const response = await this.callOpenAI(prompt, systemPrompt);
      const parsed = JSON.parse(response);
      
      return {
        insights: parsed.insights.map((insight: any, index: number) => ({
          id: `ai-insight-${Date.now()}-${index}`,
          ...insight,
          actionable: insight.type === 'recommendation',
          createdAt: new Date().toISOString()
        })),
        leadScores: {},
        predictions: {
          conversionProbability: 0.75,
          timeToConversion: 14,
          recommendedActions: parsed.recommendations || []
        },
        summary: parsed.summary
      };
    } catch (error) {
      throw error;
    }
  }

  // Calculate AI-powered lead score
  async calculateLeadScore(lead: any): Promise<LeadScore> {
    if (!this.isConfigured()) {
      // Fallback to basic scoring
      return this.calculateBasicLeadScore(lead);
    }

    const systemPrompt = `You are a lead scoring expert. Analyze the provided lead data and calculate a comprehensive lead score (0-100) based on multiple factors including completeness, engagement, timing, and conversion indicators.`;

    const prompt = `Calculate a lead score for this lead:

Lead Data:
- Name: ${lead.fullName}
- Email: ${lead.email}
- Phone: ${lead.phone}
- Source: ${lead.source}
- Status: ${lead.status}
- Stage: ${lead.stage}
- Created: ${lead.createdAt}
- Associate: ${lead.associate}
- Remarks: ${lead.remarks}
- Follow-ups: ${[lead.followUp1Date, lead.followUp2Date, lead.followUp3Date, lead.followUp4Date].filter(Boolean).length}/4
- Follow-up Comments: ${[lead.followUp1Comments, lead.followUp2Comments, lead.followUp3Comments, lead.followUp4Comments].filter(Boolean).join('; ')}

Provide a JSON response with:
{
  "score": 85,
  "factors": [
    {
      "name": "Data Completeness",
      "weight": 0.25,
      "value": 0.9,
      "impact": 22.5
    }
  ],
  "recommendations": ["Specific action 1", "Specific action 2"],
  "nextBestAction": "Most important next step"
}`;

    try {
      const response = await this.callOpenAI(prompt, systemPrompt);
      return JSON.parse(response);
    } catch {
      return this.calculateBasicLeadScore(lead);
    }
  }

  // Fallback basic lead scoring
  private calculateBasicLeadScore(lead: any): LeadScore {
    const factors = [
      {
        name: 'Data Completeness',
        weight: 0.3,
        value: this.calculateCompleteness(lead),
        impact: 0
      },
      {
        name: 'Engagement Level',
        weight: 0.25,
        value: this.calculateEngagement(lead),
        impact: 0
      },
      {
        name: 'Stage Progress',
        weight: 0.25,
        value: this.calculateStageProgress(lead),
        impact: 0
      },
      {
        name: 'Follow-up Activity',
        weight: 0.2,
        value: this.calculateFollowUpActivity(lead),
        impact: 0
      }
    ];

    // Calculate impact for each factor
    factors.forEach(factor => {
      factor.impact = factor.weight * factor.value * 100;
    });

    const score = Math.round(factors.reduce((sum, factor) => sum + factor.impact, 0));

    return {
      score,
      factors,
      recommendations: this.generateRecommendations(lead, factors),
      nextBestAction: this.getNextBestAction(lead, factors)
    };
  }

  private calculateCompleteness(lead: any): number {
    const fields = ['fullName', 'email', 'phone', 'source', 'associate', 'remarks'];
    const completed = fields.filter(field => lead[field] && lead[field].trim() !== '').length;
    return completed / fields.length;
  }

  private calculateEngagement(lead: any): number {
    const hasRemarks = lead.remarks && lead.remarks.trim() !== '';
    const hasFollowUps = [lead.followUp1Date, lead.followUp2Date, lead.followUp3Date, lead.followUp4Date].filter(Boolean).length;
    const statusScore = { 'Hot': 1, 'Warm': 0.7, 'Cold': 0.4, 'Converted': 1, 'Lost': 0 }[lead.status] || 0.5;
    
    return (hasRemarks ? 0.3 : 0) + (hasFollowUps * 0.15) + (statusScore * 0.4);
  }

  private calculateStageProgress(lead: any): number {
    const stageScores = {
      'New Enquiry': 0.1,
      'Initial Contact': 0.3,
      'Trial Scheduled': 0.6,
      'Trial Completed': 0.8,
      'Membership Sold': 1.0,
      'Not Interested': 0,
      'Lost': 0
    };
    return stageScores[lead.stage] || 0.2;
  }

  private calculateFollowUpActivity(lead: any): number {
    const followUpCount = [lead.followUp1Date, lead.followUp2Date, lead.followUp3Date, lead.followUp4Date].filter(Boolean).length;
    return Math.min(followUpCount / 4, 1);
  }

  private generateRecommendations(lead: any, factors: any[]): string[] {
    const recommendations = [];
    
    if (factors[0].value < 0.8) {
      recommendations.push('Complete missing lead information (email, phone, remarks)');
    }
    
    if (factors[3].value < 0.5) {
      recommendations.push('Schedule follow-up activities to maintain engagement');
    }
    
    if (lead.status === 'Cold') {
      recommendations.push('Re-engage with personalized outreach or special offer');
    }
    
    if (factors[2].value < 0.6) {
      recommendations.push('Progress lead to next stage with trial scheduling');
    }

    return recommendations;
  }

  private getNextBestAction(lead: any, factors: any[]): string {
    if (!lead.followUp1Date) {
      return 'Schedule initial follow-up call within 24 hours';
    }
    
    if (lead.stage === 'Initial Contact') {
      return 'Schedule trial class or demo session';
    }
    
    if (lead.status === 'Hot' && lead.stage !== 'Membership Sold') {
      return 'Present membership options and pricing';
    }
    
    return 'Continue nurturing with regular follow-ups';
  }

  // Generate smart follow-up suggestions
  async generateFollowUpSuggestions(lead: any): Promise<string[]> {
    if (!this.isConfigured()) {
      return this.getBasicFollowUpSuggestions(lead);
    }

    const prompt = `Generate 3-5 specific follow-up suggestions for this lead:

Lead: ${lead.fullName}
Source: ${lead.source}
Status: ${lead.status}
Stage: ${lead.stage}
Last Contact: ${lead.followUp1Date || 'None'}
Remarks: ${lead.remarks}

Provide actionable, personalized follow-up suggestions as a JSON array of strings.`;

    try {
      const response = await this.callOpenAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      return this.getBasicFollowUpSuggestions(lead);
    }
  }

  private getBasicFollowUpSuggestions(lead: any): string[] {
    const suggestions = [];
    
    if (!lead.followUp1Date) {
      suggestions.push('Make initial contact call to introduce services');
    }
    
    if (lead.source === 'Website') {
      suggestions.push('Send welcome email with class schedule and pricing');
    }
    
    if (lead.status === 'Hot') {
      suggestions.push('Schedule trial class within next 3 days');
    }
    
    suggestions.push('Send personalized follow-up based on their interests');
    suggestions.push('Share success stories from similar members');
    
    return suggestions;
  }

  // Generate email templates
  async generateEmailTemplate(lead: any, purpose: string): Promise<string> {
    if (!this.isConfigured()) {
      return this.getBasicEmailTemplate(lead, purpose);
    }

    const prompt = `Generate a professional email template for ${purpose} to this lead:

Lead: ${lead.fullName}
Source: ${lead.source}
Status: ${lead.status}
Stage: ${lead.stage}
Remarks: ${lead.remarks}

Create a personalized, engaging email that:
1. Addresses them by name
2. References their source/interest
3. Provides value
4. Has a clear call-to-action
5. Maintains professional tone

Return just the email content without subject line.`;

    try {
      return await this.callOpenAI(prompt);
    } catch (error) {
      return this.getBasicEmailTemplate(lead, purpose);
    }
  }

  private getBasicEmailTemplate(lead: any, purpose: string): string {
    return `Hi ${lead.fullName},

Thank you for your interest in our services. Based on your inquiry through ${lead.source}, I wanted to personally reach out to help you get started.

We offer a variety of programs that might be perfect for your goals. I'd love to schedule a brief call to discuss your needs and show you how we can help.

Would you be available for a quick 15-minute conversation this week?

Best regards,
${lead.associate || 'Your Sales Team'}`;
  }
}

export const aiService = new AIService();