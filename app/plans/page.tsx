import SchematicComponent from "@/components/schematic/SchematicComponent";
import React from "react";

function page() {
  return (
    <div className="container xl:max-w-5xl mx-auto p-4 md:p-0">
      <div className="text-center space-y-4 m-12">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Choose Your Plan
        </h2>
        <p className="text-muted-foreground text-lg whitespace-pre-line">
          Start with our free plan and upgrade as your needs grow. No credit
          card required.
        </p>
      </div>
      <SchematicComponent
        componentId={process.env.NEXT_PUBLIC_SCHEMATIC_CUSTOMER_ID!}
      />
    </div>
  );
}

export default page;
