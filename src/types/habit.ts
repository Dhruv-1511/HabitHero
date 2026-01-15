export interface HabitNote {
  date: string;
  note: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: HabitCategory;
  createdAt: string;
  completedDates: string[];
  reminderTime?: string;
  weeklyGoal: number;
  notes: HabitNote[];
}

export type HabitCategory =
  | 'health'
  | 'work'
  | 'personal'
  | 'learning'
  | 'fitness'
  | 'mindfulness';

export const HABIT_CATEGORIES: Record<HabitCategory, { label: string; emoji: string }> = {
  health: { label: 'Health', emoji: '💚' },
  work: { label: 'Work', emoji: '💼' },
  personal: { label: 'Personal', emoji: '✨' },
  learning: { label: 'Learning', emoji: '📚' },
  fitness: { label: 'Fitness', emoji: '💪' },
  mindfulness: { label: 'Mindfulness', emoji: '🧘' },
};

export type HabitColor =
  | 'emerald'
  | 'violet'
  | 'rose'
  | 'amber'
  | 'sky'
  | 'orange'
  | 'cyan'
  | 'pink';

export const HABIT_COLORS: Record<HabitColor, { bg: string; text: string; ring: string; glow: string }> = {
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-400', ring: 'ring-emerald-500', glow: 'shadow-emerald-500/50' },
  violet: { bg: 'bg-violet-500', text: 'text-violet-400', ring: 'ring-violet-500', glow: 'shadow-violet-500/50' },
  rose: { bg: 'bg-rose-500', text: 'text-rose-400', ring: 'ring-rose-500', glow: 'shadow-rose-500/50' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-400', ring: 'ring-amber-500', glow: 'shadow-amber-500/50' },
  sky: { bg: 'bg-sky-500', text: 'text-sky-400', ring: 'ring-sky-500', glow: 'shadow-sky-500/50' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-400', ring: 'ring-orange-500', glow: 'shadow-orange-500/50' },
  cyan: { bg: 'bg-cyan-500', text: 'text-cyan-400', ring: 'ring-cyan-500', glow: 'shadow-cyan-500/50' },
  pink: { bg: 'bg-pink-500', text: 'text-pink-400', ring: 'ring-pink-500', glow: 'shadow-pink-500/50' },
};

export const HABIT_ICONS = [
  'dumbbell',
  'book-open',
  'droplets',
  'moon',
  'apple',
  'brain',
  'heart',
  'pencil',
  'music',
  'code',
  'bike',
  'leaf',
  'sun',
  'coffee',
  'target',
  'zap',
] as const;

export type HabitIcon = typeof HABIT_ICONS[number];

export interface HabitTemplate {
  name: string;
  icon: string;
  color: HabitColor;
  category: HabitCategory;
  weeklyGoal: number;
  description: string;
}

export const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    name: 'Morning Meditation',
    icon: 'brain',
    color: 'violet',
    category: 'mindfulness',
    weeklyGoal: 7,
    description: 'Start your day with 10 minutes of mindfulness',
  },
  {
    name: 'Exercise',
    icon: 'dumbbell',
    color: 'rose',
    category: 'fitness',
    weeklyGoal: 5,
    description: 'Get moving for at least 30 minutes',
  },
  {
    name: 'Read Books',
    icon: 'book-open',
    color: 'amber',
    category: 'learning',
    weeklyGoal: 7,
    description: 'Read for 20+ minutes daily',
  },
  {
    name: 'Drink Water',
    icon: 'droplets',
    color: 'sky',
    category: 'health',
    weeklyGoal: 7,
    description: 'Stay hydrated with 8 glasses daily',
  },
  {
    name: 'Sleep Early',
    icon: 'moon',
    color: 'violet',
    category: 'health',
    weeklyGoal: 7,
    description: 'Get to bed before 11 PM',
  },
  {
    name: 'Learn Coding',
    icon: 'code',
    color: 'emerald',
    category: 'learning',
    weeklyGoal: 5,
    description: 'Practice programming skills',
  },
  {
    name: 'Healthy Eating',
    icon: 'apple',
    color: 'emerald',
    category: 'health',
    weeklyGoal: 7,
    description: 'Eat fruits and vegetables',
  },
  {
    name: 'Journaling',
    icon: 'pencil',
    color: 'pink',
    category: 'personal',
    weeklyGoal: 5,
    description: 'Write your thoughts and reflections',
  },
  {
    name: 'Go for a Walk',
    icon: 'bike',
    color: 'cyan',
    category: 'fitness',
    weeklyGoal: 7,
    description: 'Take a 15-minute walk outside',
  },
  {
    name: 'No Social Media',
    icon: 'zap',
    color: 'orange',
    category: 'personal',
    weeklyGoal: 5,
    description: 'Avoid social media for the day',
  },
];

export const MOTIVATIONAL_QUOTES = [
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { quote: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Small daily improvements are the key to staggering long-term results.", author: "Unknown" },
  { quote: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { quote: "Your habits will determine your future.", author: "Jack Canfield" },
  { quote: "First forget inspiration. Habit is more dependable.", author: "Octavia Butler" },
  { quote: "Champions don't do extraordinary things. They do ordinary things extraordinarily well.", author: "Unknown" },
  { quote: "The chains of habit are too light to be felt until they are too heavy to be broken.", author: "Warren Buffett" },
  { quote: "You'll never change your life until you change something you do daily.", author: "John C. Maxwell" },
  { quote: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { quote: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { quote: "Don't count the days, make the days count.", author: "Muhammad Ali" },
];
