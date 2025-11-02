"use server";

import { currentUser } from "@clerk/nextjs/server";
// Initialize Schematic SDK
import { SchematicClient } from "@schematichq/schematic-typescript-node";
const apiKey = process.env.SCHEMATIC_API_KEY;
const client = new SchematicClient({ apiKey });

export async function getTemporaryAccessToken() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const response = await client.accesstokens.issueTemporaryAccessToken({
      resource_type: "company",
      lookup: { id: user.id },
    });

    console.log("Temporary Access Token Response:", response);

    return response.data.token;
  } catch (error) {
    console.error("Error getting temporary access token:", error);
    return null;
  }
}
