import { Variants, Transition } from 'motion/react';

// Common Easing Curves
export const EASINGS = {
  smoothOut: [0.16, 1, 0.3, 1] as const, // Spring-like feel for smooth UI
  bounceOut: [0.34, 1.56, 0.64, 1] as const, // Energetic bounce
  standard: [0.4, 0.0, 0.2, 1] as const, // Standard material curve
  sharpIn: [0.4, 0.0, 1, 1] as const,
};

// Common Transitions
export const TRANSITIONS = {
  fast: { duration: 0.2, ease: EASINGS.smoothOut } as Transition,
  standard: { duration: 0.35, ease: EASINGS.smoothOut } as Transition,
  screenChange: { duration: 0.45, ease: EASINGS.smoothOut } as Transition,
  grandFinale: { duration: 0.7, ease: EASINGS.smoothOut } as Transition,
  springy: { type: 'spring', stiffness: 350, damping: 28 } as Transition,
  gentleSpring: { type: 'spring', stiffness: 220, damping: 22 } as Transition,
};

// Check for prefers-reduced-motion in browser safely
export const shouldReduceMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Host & Player Screen Transition Variants
export const screenVariants: Variants = {
  initial: (direction: 'lobby-start' | 'reveal' | 'leaderboard' | 'podium' | 'analytics' | 'default' = 'default') => {
    if (shouldReduceMotion()) return { opacity: 0 };

    switch (direction) {
      case 'lobby-start':
        return { opacity: 0, scale: 0.94, y: 20 };
      case 'reveal':
        return { opacity: 0, scale: 0.98, filter: 'blur(4px)' };
      case 'leaderboard':
        return { opacity: 0, x: 24 };
      case 'podium':
        return { opacity: 0, scale: 0.9, y: 30 };
      case 'analytics':
        return { opacity: 0, y: 15 };
      default:
        return { opacity: 0, y: 12 };
    }
  },
  animate: {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    filter: 'blur(0px)',
    transition: TRANSITIONS.screenChange,
  },
  exit: (direction: 'lobby-start' | 'reveal' | 'leaderboard' | 'podium' | 'analytics' | 'default' = 'default') => {
    if (shouldReduceMotion()) return { opacity: 0 };

    switch (direction) {
      case 'lobby-start':
        return { opacity: 0, scale: 1.05, filter: 'blur(4px)', transition: { duration: 0.3 } };
      case 'reveal':
        return { opacity: 0, scale: 0.97, transition: { duration: 0.25 } };
      case 'leaderboard':
        return { opacity: 0, x: -20, transition: { duration: 0.25 } };
      case 'podium':
        return { opacity: 0, scale: 0.95, transition: { duration: 0.4 } };
      default:
        return { opacity: 0, scale: 0.98, y: -10, transition: { duration: 0.25 } };
    }
  },
};

// Modal Backdrop & Content Variants
export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

export const modalContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.28, ease: EASINGS.smoothOut },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 8,
    transition: { duration: 0.18, ease: EASINGS.sharpIn },
  },
};

// Stagger Container Variants
export const staggerContainer = (staggerChildren = 0.07, delayChildren = 0.05): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: shouldReduceMotion() ? 0 : staggerChildren,
      delayChildren: shouldReduceMotion() ? 0 : delayChildren,
    },
  },
});

// Stagger Item Variants
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: shouldReduceMotion() ? 0 : 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASINGS.smoothOut },
  },
};

// Podium Placement Sequential Variants
export const podiumItemVariants = (delaySeconds: number): Variants => ({
  hidden: { opacity: 0, y: shouldReduceMotion() ? 0 : 40, scale: 0.88 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: shouldReduceMotion() ? 0 : delaySeconds,
      duration: 0.65,
      ease: EASINGS.bounceOut,
    },
  },
});

// Interactive Button Animations
export const buttonHoverTap = {
  hover: { scale: 1.02, transition: { duration: 0.15 } },
  tap: { scale: 0.96, transition: { duration: 0.1 } },
};

// Shake animation for incorrect answer
export const shakeVariant = {
  shake: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: { duration: 0.45 },
  },
};
