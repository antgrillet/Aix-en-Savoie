/**
 * Framer Motion Animation Presets
 * HBC Aix-en-Savoie - Animation Library
 */

import { Variants, Transition } from 'framer-motion'

/* ================================
 * TRANSITION PRESETS
 * ================================ */

export const transitions = {
  // Spring transitions for natural movement
  spring: {
    type: 'spring',
    damping: 20,
    stiffness: 100,
  } as Transition,

  springBouncy: {
    type: 'spring',
    damping: 10,
    stiffness: 100,
    bounce: 0.5,
  } as Transition,

  springSmooth: {
    type: 'spring',
    damping: 30,
    stiffness: 120,
  } as Transition,

  // Tween transitions for precise timing
  fast: {
    type: 'tween',
    duration: 0.2,
    ease: 'easeOut',
  } as Transition,

  base: {
    type: 'tween',
    duration: 0.3,
    ease: 'easeInOut',
  } as Transition,

  slow: {
    type: 'tween',
    duration: 0.5,
    ease: 'easeInOut',
  } as Transition,

  verySlow: {
    type: 'tween',
    duration: 0.8,
    ease: 'easeInOut',
  } as Transition,
}

/* ================================
 * FADE ANIMATIONS
 * ================================ */

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.base,
  },
}

export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.spring,
  },
}

export const fadeInDown: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.spring,
  },
}

export const fadeInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.spring,
  },
}

export const fadeInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.spring,
  },
}

/* ================================
 * SCALE ANIMATIONS
 * ================================ */

export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.springBouncy,
  },
}

export const scaleOut: Variants = {
  hidden: {
    opacity: 0,
    scale: 1.2,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
}

export const popIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.springBouncy,
  },
}

/* ================================
 * SLIDE ANIMATIONS
 * ================================ */

export const slideInLeft: Variants = {
  hidden: {
    x: -100,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: transitions.spring,
  },
}

export const slideInRight: Variants = {
  hidden: {
    x: 100,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: transitions.spring,
  },
}

export const slideInUp: Variants = {
  hidden: {
    y: 100,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: transitions.spring,
  },
}

export const slideInDown: Variants = {
  hidden: {
    y: -100,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: transitions.spring,
  },
}

/* ================================
 * STAGGER ANIMATIONS
 * ================================ */

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.spring,
  },
}

/* ================================
 * CARD ANIMATIONS
 * ================================ */

export const cardHover: Variants = {
  rest: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.03,
    y: -8,
    transition: transitions.springSmooth,
  },
  tap: {
    scale: 0.98,
  },
}

export const cardFlip: Variants = {
  hidden: {
    rotateY: 90,
    opacity: 0,
  },
  visible: {
    rotateY: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 100,
    },
  },
}

/* ================================
 * CAROUSEL ANIMATIONS
 * ================================ */

export const carouselSlide: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
}

export const carouselSwipeConfidenceThreshold = 10000
export const carouselSwipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity
}

/* ================================
 * MENU ANIMATIONS
 * ================================ */

export const mobileMenuContainer: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
}

export const mobileMenuItem: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.spring,
  },
}

/* ================================
 * PAGE TRANSITIONS
 * ================================ */

export const pageTransition: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 120,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
}

/* ================================
 * SCROLL REVEAL ANIMATIONS
 * ================================ */

export const scrollReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 100,
    },
  },
}

export const scrollRevealLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 100,
    },
  },
}

export const scrollRevealRight: Variants = {
  hidden: {
    opacity: 0,
    x: 50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 100,
    },
  },
}

/* ================================
 * LOADING ANIMATIONS
 * ================================ */

export const spinner: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

export const pulse: Variants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export const bounce: Variants = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

/* ================================
 * HOVER INTERACTIONS
 * ================================ */

export const buttonHover = {
  scale: 1.05,
  transition: transitions.fast,
}

export const buttonTap = {
  scale: 0.95,
}

export const linkHover = {
  x: 5,
  transition: transitions.fast,
}

export const imageHover = {
  scale: 1.1,
  transition: transitions.slow,
}

/* ================================
 * VIEWPORT CONFIGURATION
 * ================================ */

export const viewportConfig = {
  once: true, // Only animate once
  amount: 0.3, // Trigger when 30% visible
  margin: '0px 0px -100px 0px', // Trigger 100px before entering viewport
}

/* ================================
 * HELPER FUNCTIONS
 * ================================ */

export const getStaggerDelay = (index: number, baseDelay = 0.1) => {
  return index * baseDelay
}

export const getDirectionVariant = (direction: 'up' | 'down' | 'left' | 'right') => {
  switch (direction) {
    case 'up':
      return fadeInUp
    case 'down':
      return fadeInDown
    case 'left':
      return fadeInLeft
    case 'right':
      return fadeInRight
    default:
      return fadeIn
  }
}
