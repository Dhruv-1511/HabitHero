'use client';

import { memo } from 'react';
import {
  Dumbbell,
  BookOpen,
  Droplets,
  Moon,
  Apple,
  Brain,
  Heart,
  Pencil,
  Music,
  Code,
  Bike,
  Leaf,
  Sun,
  Coffee,
  Target,
  Zap,
  LucideProps,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  dumbbell: Dumbbell,
  'book-open': BookOpen,
  droplets: Droplets,
  moon: Moon,
  apple: Apple,
  brain: Brain,
  heart: Heart,
  pencil: Pencil,
  music: Music,
  code: Code,
  bike: Bike,
  leaf: Leaf,
  sun: Sun,
  coffee: Coffee,
  target: Target,
  zap: Zap,
};

interface IconComponentProps extends LucideProps {
  name: string;
}

export const IconComponent = memo(function IconComponent({ name, ...props }: IconComponentProps) {
  const Icon = iconMap[name] || Heart;
  return <Icon {...props} />;
});
