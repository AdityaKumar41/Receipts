"use client";

import { motion } from "framer-motion";
import { Lock, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const mockPlans = [
  {
    name: "Starter",
    price: "$29",
    description: "Perfect for small teams and startups.",
    features: [
      "Up to 5 team members",
      "Basic analytics",
      "5GB storage",
      "Email support",
    ],
  },
  {
    name: "Professional",
    price: "$79",
    description: "Ideal for growing businesses.",
    features: [
      "Up to 20 team members",
      "Advanced analytics",
      "25GB storage",
      "Priority email support",
      "API access",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$199",
    description: "For large organizations with complex needs.",
    features: [
      "Unlimited team members",
      "Custom analytics",
      "Unlimited storage",
      "24/7 phone & email support",
      "Advanced API access",
      "Custom integrations",
    ],
  },
];

export function LockedPricingUI() {
  return (
    <div className="relative mx-auto max-w-5xl">
      {/* Blurred pricing cards */}
      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8 blur-sm pointer-events-none select-none">
        {mockPlans.map((plan, i) => (
          <Card
            key={i}
            className={`relative overflow-hidden h-full ${
              plan.popular
                ? "border-primary shadow-lg"
                : "border-border/40 shadow-md"
            } bg-gradient-to-b from-background to-muted/10 backdrop-blur`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                Most Popular
              </div>
            )}
            <CardContent className="p-6 flex flex-col h-full">
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <div className="flex items-baseline mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
              <p className="text-muted-foreground mt-2">{plan.description}</p>
              <ul className="space-y-3 my-6 flex-grow">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center">
                    <Check className="mr-2 size-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full mt-auto rounded-full ${
                  plan.popular
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-muted hover:bg-muted/80"
                }`}
                variant={plan.popular ? "default" : "outline"}
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lock overlay */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="relative z-10 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-2xl"
          >
            <Lock className="size-10" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
