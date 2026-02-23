import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatDate(dateString: string | Date, format?: string): string {
  if (!dateString) return '';
  
  let date: Date;
  
  if (typeof dateString === 'string') {
    // For follow-up dates, use our enhanced parsing
    const parsedDate = parseFollowUpDate(dateString);
    if (parsedDate) {
      date = parsedDate;
    } else {
      date = new Date(dateString);
    }
  } else {
    date = dateString;
  }
  
  if (isNaN(date.getTime())) {
    return '';
  }
  
  if (format === 'HH:mm:ss') {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Enhanced date parsing function that handles multiple formats
function parseFollowUpDate(dateString: string): Date | null {
  if (!dateString || dateString.trim() === '' || dateString.trim() === '-') {
    return null;
  }

  const cleanDate = dateString.trim();
  let parsedDate: Date | null = null;

  // Try direct parsing first (handles ISO formats like YYYY-MM-DD)
  parsedDate = new Date(cleanDate);
  if (!isNaN(parsedDate.getTime()) && cleanDate.includes('-') && cleanDate.length >= 8) {
    return parsedDate;
  }

  // Try DD/MM/YYYY format (common in Google Sheets)
  const ddmmyyyyMatch = cleanDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    // Validate date components
    if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12) {
      // Assume DD/MM/YYYY format (day first) if day > 12
      if (dayNum > 12) {
        parsedDate = new Date(yearNum, monthNum - 1, dayNum);
      } else {
        // For ambiguous cases (both <= 12), try DD/MM/YYYY first
        parsedDate = new Date(yearNum, monthNum - 1, dayNum);
        // Validate the parsed date makes sense
        if (parsedDate.getDate() !== dayNum || parsedDate.getMonth() !== monthNum - 1) {
          // Try MM/DD/YYYY format instead
          parsedDate = new Date(yearNum, dayNum - 1, monthNum);
        }
      }
      
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
  }

  // Try MM/DD/YYYY format
  const mmddyyyyMatch = cleanDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mmddyyyyMatch) {
    const [, month, day, year] = mmddyyyyMatch;
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12) {
      parsedDate = new Date(yearNum, monthNum - 1, dayNum);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
  }

  // Try DD-MM-YYYY or DD.MM.YYYY formats
  const ddmmyyyyDashMatch = cleanDate.match(/^(\d{1,2})[-.](\d{1,2})[-.](\d{4})$/);
  if (ddmmyyyyDashMatch) {
    const [, day, month, year] = ddmmyyyyDashMatch;
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12) {
      parsedDate = new Date(yearNum, monthNum - 1, dayNum);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
  }

  // Try parsing with natural language (e.g., "Jan 15, 2024", "15 Jan 2024")
  const naturalDate = new Date(cleanDate);
  if (!isNaN(naturalDate.getTime())) {
    return naturalDate;
  }

  return null;
}

export function formatFollowUpDate(dateString: string): string {
  if (!dateString || dateString.trim() === '' || dateString.trim() === '-') {
    return 'No date';
  }
  
  const parsedDate = parseFollowUpDate(dateString);
  
  if (!parsedDate) {
    // If we can't parse it, return the original string
    return dateString;
  }
  
  // Format as DD-MMM (e.g., "25-Dec")
  return parsedDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short'
  }).replace(' ', '-');
}

export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

export function getUniqueValues<T>(items: T[], key: keyof T): string[] {
  const uniqueValues = new Set<string>();
  
  items.forEach(item => {
    const value = item[key];
    if (value && typeof value === 'string' && value.trim() !== '') {
      uniqueValues.add(value);
    }
  });
  
  return Array.from(uniqueValues).sort();
}

export function countByKey<T>(items: T[], key: keyof T): Record<string, number> {
  const counts: Record<string, number> = {};
  
  items.forEach(item => {
    const value = item[key];
    if (value && typeof value === 'string' && value.trim() !== '') {
      counts[value] = (counts[value] || 0) + 1;
    }
  });
  
  return counts;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  
  return ((current - previous) / previous) * 100;
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result: Record<string, T[]>, currentValue: T) => {
    const keyValue = String(currentValue[key] || 'Unknown');
    (result[keyValue] = result[keyValue] || []).push(currentValue);
    return result;
  }, {});
}

// Format revenue values with Indian currency notation
export function formatDisplayText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .trim() // Remove leading/trailing spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .toLowerCase() // Convert to lowercase first
    .replace(/^\w/, c => c.toUpperCase()) // Capitalize first letter
    .replace(/\.\s*\w/g, match => match.toUpperCase()) // Capitalize after periods
    .replace(/!\s*\w/g, match => match.toUpperCase()) // Capitalize after exclamation marks
    .replace(/\?\s*\w/g, match => match.toUpperCase()); // Capitalize after question marks
}

export function formatRevenue(amount: number): string {
  if (amount >= 10000000) { // 1 Crore
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) { // 1 Lakh
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) { // 1 Thousand
    return `₹${(amount / 1000).toFixed(1)}K`;
  } else {
    return `₹${amount}`;
  }
}

// Check if follow-up comment is meaningful (not just "-" or ".")
export function isValidFollowUpComment(comment: string): boolean {
  if (!comment || typeof comment !== 'string') return false;
  const trimmed = comment.trim();
  return trimmed !== '' && trimmed !== '-' && trimmed !== '.';
}

// Get follow-up status with timeline validation
export function getFollowUpStatus(lead: any) {
  const createdDate = new Date(lead.createdAt);
  const now = new Date();
  const daysSinceCreated = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const followUps = [
    { 
      date: lead.followUp1Date, 
      comments: lead.followUp1Comments, 
      expectedDay: 1,
      isValid: lead.followUp1Date && isValidFollowUpComment(lead.followUp1Comments)
    },
    { 
      date: lead.followUp2Date, 
      comments: lead.followUp2Comments, 
      expectedDay: 3,
      isValid: lead.followUp2Date && isValidFollowUpComment(lead.followUp2Comments)
    },
    { 
      date: lead.followUp3Date, 
      comments: lead.followUp3Comments, 
      expectedDay: 5,
      isValid: lead.followUp3Date && isValidFollowUpComment(lead.followUp3Comments)
    },
    { 
      date: lead.followUp4Date, 
      comments: lead.followUp4Comments, 
      expectedDay: 7,
      isValid: lead.followUp4Date && isValidFollowUpComment(lead.followUp4Comments)
    }
  ];

  let completedCount = 0;
  let overdueCount = 0;
  let nextDue = null;

  followUps.forEach((followUp, index) => {
    if (followUp.isValid) {
      completedCount++;
    } else if (daysSinceCreated >= followUp.expectedDay) {
      overdueCount++;
      if (!nextDue) {
        nextDue = followUp.expectedDay;
      }
    }
  });

  return {
    completed: completedCount,
    total: 4,
    overdue: overdueCount,
    nextDue,
    daysSinceCreated,
    followUps
  };
}

// Generate contextual questions for delayed follow-ups
export function getFollowUpQuestions(lead: any): string[] {
  const status = getFollowUpStatus(lead);
  const questions: string[] = [];
  const leadStatus = lead.status?.toLowerCase();
  const leadStage = lead.stage?.toLowerCase();
  
  // Skip if status is won, lost, or disqualified
  const closedStatuses = ['won', 'lost', 'disqualified'];
  if (closedStatuses.some(s => leadStatus?.includes(s) || leadStage?.includes(s))) {
    return questions;
  }
  
  // Check each follow-up for delays
  status.followUps.forEach((followUp: any, index: number) => {
    const followUpNum = index + 1;
    const expectedDay = followUp.expectedDay;
    
    if (!followUp.isValid && status.daysSinceCreated >= expectedDay) {
      const daysLate = status.daysSinceCreated - expectedDay;
      
      if (daysLate === 0) {
        questions.push(`⏰ Follow-up ${followUpNum} is due today (Day ${expectedDay}). Have you contacted the lead?`);
      } else if (daysLate <= 2) {
        questions.push(`⚠️ Follow-up ${followUpNum} is ${daysLate} day${daysLate > 1 ? 's' : ''} overdue. What's preventing you from following up?`);
      } else if (daysLate <= 5) {
        questions.push(`🚨 Follow-up ${followUpNum} is ${daysLate} days overdue. Why hasn't this lead been contacted since day ${expectedDay}?`);
      } else {
        questions.push(`❌ Follow-up ${followUpNum} is ${daysLate} days overdue! This lead may be at risk of going cold. What action will you take immediately?`);
      }
    }
  });
  
  // Add overall context questions
  if (status.daysSinceCreated > 7 && status.completed === 0) {
    questions.push(`🔴 URGENT: No follow-ups in ${status.daysSinceCreated} days! Why has this lead been completely neglected?`);
  } else if (status.daysSinceCreated > 14 && status.completed < 2) {
    questions.push(`📉 Lead is ${status.daysSinceCreated} days old with only ${status.completed} follow-up(s). Is this lead still viable?`);
  }
  
  return questions;
}