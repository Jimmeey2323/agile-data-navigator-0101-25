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
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
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

export function formatFollowUpDate(dateString: string): string {
  if (!dateString || dateString.trim() === '' || dateString.trim() === '-') {
    return 'No date';
  }
  
  // Try to parse different date formats
  let date: Date | null = null;
  
  // Try parsing as-is first
  date = new Date(dateString);
  
  // If that fails, try common date formats
  if (isNaN(date.getTime())) {
    // Try DD/MM/YYYY format
    const ddmmyyyy = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // Try MM/DD/YYYY format
    if (isNaN(date.getTime())) {
      const mmddyyyy = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (mmddyyyy) {
        const [, month, day, year] = mmddyyyy;
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    }
    
    // Try YYYY-MM-DD format
    if (isNaN(date.getTime())) {
      const yyyymmdd = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (yyyymmdd) {
        const [, year, month, day] = yyyymmdd;
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    }
  }
  
  if (isNaN(date.getTime())) {
    console.warn('Could not parse date:', dateString);
    return dateString; // Return original if we can't parse it
  }
  
  // Format as DD-MMM (e.g., "25-Dec")
  return date.toLocaleDateString('en-GB', {
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