// Cache today's date string to avoid repeated Date object creation
let cachedToday: { date: string; timestamp: number } | null = null;

export function getTodayString(): string {
  const now = Date.now();
  // Cache valid for 60 seconds - will still catch day changes
  if (cachedToday && now - cachedToday.timestamp < 60000) {
    return cachedToday.date;
  }
  const dateString = new Date().toISOString().split('T')[0];
  cachedToday = { date: dateString, timestamp: now };
  return dateString;
}

// Cache week dates - invalidates when day changes
let cachedWeekDates: { dates: string[]; today: string } | null = null;

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function getWeekDates(): string[] {
  const today = getTodayString();

  // Return cached result if still valid
  if (cachedWeekDates && cachedWeekDates.today === today) {
    return cachedWeekDates.dates;
  }

  const dates: string[] = [];
  const todayDate = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(todayDate);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  cachedWeekDates = { dates, today };
  return dates;
}

export function getDayName(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function calculateStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const sorted = [...completedDates].sort().reverse();
  const today = getTodayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split('T')[0];

  if (sorted[0] !== today && sorted[0] !== yesterdayString) {
    return 0;
  }

  let streak = 1;
  let currentDate = new Date(sorted[0]);

  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateString = prevDate.toISOString().split('T')[0];

    if (sorted[i] === prevDateString) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
}

export function getMonthDates(year: number, month: number): string[] {
  const dates: string[] = [];
  const date = new Date(year, month, 1);

  while (date.getMonth() === month) {
    dates.push(date.toISOString().split('T')[0]);
    date.setDate(date.getDate() + 1);
  }

  return dates;
}
