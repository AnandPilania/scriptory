// Shared Framer Motion variants for consistent animation language

export const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
}

export const slideUp = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
}

export const slideDown = {
    initial: { opacity: 0, y: -12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
}

export const slideRight = {
    initial: { opacity: 0, x: '100%' },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: '100%' },
}

export const scaleIn = {
    initial: { opacity: 0, scale: 0.94 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
}

export const popIn = {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.5 },
}

// Stagger container — apply to a ul/div containing motion items
export const staggerContainer = {
    animate: {
        transition: { staggerChildren: 0.045, delayChildren: 0.05 },
    },
}

// Stagger item — apply to each li/div inside a stagger container
export const staggerItem = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -6 },
}

// Spring presets
export const springs = {
    snappy: { type: 'spring', stiffness: 500, damping: 35 },
    bouncy: { type: 'spring', stiffness: 400, damping: 20 },
    gentle: { type: 'spring', stiffness: 200, damping: 30 },
    panel: { type: 'spring', stiffness: 320, damping: 30 },
}

// Page transition (used by each page wrapper)
export const pageTransition = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -4, transition: { duration: 0.15, ease: 'easeIn' } },
}
