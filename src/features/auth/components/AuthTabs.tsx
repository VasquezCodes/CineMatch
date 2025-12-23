"use client";

import { motion } from "framer-motion";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

interface AuthTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

const tabs = [
  { id: "login", label: "Iniciar Sesión" },
  { id: "register", label: "Registro" },
];

export function AuthTabs({ value, onValueChange, className }: AuthTabsProps) {
  return (
    <TabsPrimitive.List
      className={cn(
        "relative grid w-full grid-cols-2 bg-muted/80 h-11 p-1.5 border border-border gap-1 rounded-xl",
        className
      )}
    >
      {tabs.map((tab) => (
        <TabsPrimitive.Trigger
          key={tab.id}
          value={tab.id}
          className={cn(
            "relative z-10 flex-1 h-full text-sm font-medium transition-colors duration-300 rounded-lg",
            value === tab.id
              ? "text-primary-foreground"
              : "text-muted-foreground"
          )}
        >
          {tab.label}
          
          {value === tab.id && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-primary rounded-lg shadow-sm"
              style={{ zIndex: -1 }}
              transition={{
                type: "spring",
                bounce: 0.2,
                duration: 0.6,
              }}
            />
          )}
        </TabsPrimitive.Trigger>
      ))}
    </TabsPrimitive.List>
  );
}

