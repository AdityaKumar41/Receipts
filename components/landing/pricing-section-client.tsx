"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";

export function AnimatedHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
    >
      <Badge
        className="rounded-full px-4 py-1.5 text-sm font-medium"
        variant="secondary"
      >
        Pricing
      </Badge>
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
        Simple, Transparent Pricing
      </h2>
      <p className="max-w-[800px] text-muted-foreground md:text-lg">
        Choose the plan that&apos;s right for your business. All plans include a
        14-day free trial.
      </p>
    </motion.div>
  );
}

export function AnimatedSchematicWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mx-auto max-w-5xl"
    >
      {children}
    </motion.div>
  );
}
