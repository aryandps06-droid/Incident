/** Shared easing & timing for cohesive premium motion */
export const easePremium = [0.16, 1, 0.3, 1] as const;

export const introTimeline = {
  background: 0,
  ambientLight: 0.2,
  orbAppear: 0.5,
  particles: 1.2,
  title: 1.8,
  subtitle: 2.0,
  tagline: 2.2,
  cards: 2.4,
  cardStagger: 0.1,
  header: 3.2,
  footer: 3.4,
} as const;

export const springSoft = { type: 'spring' as const, stiffness: 260, damping: 26 };
export const springMagnetic = { type: 'spring' as const, stiffness: 280, damping: 22 };
