export const duration = {
  instant: 0,
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 600,
} as const;

export const easing = {
  standard: 'ease',
  decelerate: 'ease-out',
  accelerate: 'ease-in',
  sharp: 'ease-in-out',
} as const;

export const spring = {
  gentle: {
    damping: 20,
    stiffness: 180,
    mass: 1,
  },
  responsive: {
    damping: 22,
    stiffness: 220,
    mass: 0.8,
  },
  bouncy: {
    damping: 14,
    stiffness: 200,
    mass: 1,
  },
  stiff: {
    damping: 30,
    stiffness: 300,
    mass: 1,
  },
} as const;

export type DurationKey = keyof typeof duration;
export type SpringKey = keyof typeof spring;
