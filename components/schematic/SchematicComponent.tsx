import { getTemporaryAccessToken } from "@/actions/getTemporaryAccessToken";
import React from "react";
import SchematicEmbed from "./SchematicEmbed";
import { LockedPricingUI } from "../landing/locked-pricing-ui";

async function SchematicComponent({ componentId }: { componentId: string }) {
  if (!componentId) {
    return null;
  }
  const accessToken = await getTemporaryAccessToken();

  if (!accessToken) {
    return <LockedPricingUI />;
  }

  return <SchematicEmbed componentId={componentId} accessToken={accessToken} />;
}

export default SchematicComponent;
