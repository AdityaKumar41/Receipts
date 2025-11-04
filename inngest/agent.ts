import {
  anthropic,
  createNetwork,
  getDefaultRoutingAgent,
  openai,
} from "@inngest/agent-kit";

import { createServer } from "@inngest/agent-kit/server";
import { inngest } from "@/inngest/client";
import Event from "./constant";
import { databaseAgent } from "./agents/database-agent";
import { receiptScanningAgent } from "./agents/receipt-scanning-agent";

const agentNetwork = createNetwork({
  name: "Receipt Scanning Agent Network",
  agents: [databaseAgent, receiptScanningAgent],
  defaultModel: openai({
    model: "gpt-5-nano",
    defaultParameters: {
      max_completion_tokens: 2000,
    },
  }),

  defaultRouter: ({ network }) => {
    const saveToDatabase = network.state.kv.get("save-to-database");

    if (saveToDatabase !== undefined) {
      return undefined;
    }

    return getDefaultRoutingAgent();
  },
});

export const server = createServer({
  agents: [databaseAgent, receiptScanningAgent],
  networks: [agentNetwork],
});

export const extractAndSavePDF = inngest.createFunction(
  { id: "extract-and-save-pdf" },
  { event: Event.EXTRACT_DATA_FROM_PDF_AND_SAVE_TO_DATABASE },
  async ({ event }) => {
    const result = await agentNetwork.run(
      `Extract data from this pdf: ${event.data.url}. Once the data is extracted, save it to the database using the receiptId: ${event.data.receiptId}. Once the receipt is successfully saved to the database you can terminate the agent process.`,
    );
    return result.state.kv.get("receipt");
  },
);
