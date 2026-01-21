"use client";

import * as React from "react";
import {
  motion,
  useReducedMotion,
  type Variants,
  type ViewportOptions,
} from "framer-motion";

const EASE = [0.215, 0.61, 0.355, 1] as const;

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: EASE,
    },
  },
};

type TextRevealGroupAs = "div" | "section" | "header";

export interface TextRevealGroupProps {
  as?: TextRevealGroupAs;
  className?: string;
  children: React.ReactNode;
  viewport?: ViewportOptions;
}

const motionComponents = {
  div: motion.div,
  section: motion.section,
  header: motion.header,
} as const;

export const TextRevealGroup = React.memo(function TextRevealGroup({
  as = "div",
  className,
  children,
  viewport,
}: TextRevealGroupProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    if (as === "div") return <div className={className}>{children}</div>;
    if (as === "section")
      return <section className={className}>{children}</section>;
    if (as === "header")
      return <header className={className}>{children}</header>;
    return <div className={className}>{children}</div>;
  }

  const Component = motionComponents[as];
  const resolvedViewport: ViewportOptions = {
    once: true,
    amount: 0.2,
    ...viewport,
  };

  return (
    <Component
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={resolvedViewport}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        return <motion.div variants={itemVariants}>{child}</motion.div>;
      })}
    </Component>
  );
});
