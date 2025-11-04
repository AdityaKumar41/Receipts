import { openai } from "@inngest/agent-kit";
import { inngest } from "@/inngest/client";
import Event from "./constant";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import convex from "@/lib/convexClient";
import schematicClient from "@/lib/schematic";

// Note: We previously used an Agent Network. That added routing loops causing
// long-running executions. To make the pipeline deterministic and fast, this
// function now performs two direct steps: parse with OpenAI, then save to Convex.

export const extractAndSavePDF = inngest.createFunction(
  { id: "extract-and-save-pdf" },
  { event: Event.EXTRACT_DATA_FROM_PDF_AND_SAVE_TO_DATABASE },
  async ({ event, step }) => {
    const { url, receiptId, fileDisplayName } = event.data as {
      url: string;
      receiptId: string;
      fileDisplayName?: string;
    };

    // 1) Upload the PDF to OpenAI Files API and get a file_id
    const fileId = await step.run("openai-upload-file", async () => {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("Missing OPENAI_API_KEY env var");

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.status}`);
      const bytes = await res.arrayBuffer();

      const fd = new FormData();
      const blob = new Blob([bytes], { type: "application/pdf" });
      fd.append("file", blob, "receipt.pdf");
      fd.append("purpose", "assistants");

      const uploadRes = await fetch("https://api.openai.com/v1/files", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: fd,
      });
      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        throw new Error(
          `OpenAI file upload failed: ${uploadRes.status} ${errText}`,
        );
      }
      const json = (await uploadRes.json()) as { id: string };
      return json.id;
    });

    // 2) Ask OpenAI to extract structured JSON from the uploaded PDF
    const raw = await step.ai.infer("infer-receipt-json", {
      model: openai({
        model: "gpt-4o-mini",
        defaultParameters: { max_completion_tokens: 2000 },
      }) as any,
      body: {
        messages: [
          {
            role: "user",
            content: [
              { type: "file", file: { file_id: fileId } },
              {
                type: "text",
                text: `Extract the receipt as strict JSON only. Respond with only a JSON object and nothing else.
Schema:
{
  "merchant": { "name": string, "address": string, "contact": string },
  "transaction": { "date": string, "receipt_number": string, "payment_method": string },
  "items": [{ "name": string, "quantity": number, "unit_price": number, "total_price": number }],
  "totals": { "subtotal": number, "tax": number, "total": number, "currency": string }
}
If a value is missing, use an empty string for text and 0 for numbers.`,
              },
            ],
          },
        ],
      },
    });

    // 3) Parse and normalize the model output into our DB fields
    const jsonText = typeof raw === "string" ? raw : JSON.stringify(raw);

    const extractFirstJson = (txt: string) => {
      // Remove code fences if present
      const cleaned = txt.replace(/^```[a-zA-Z]*\n?|```$/g, "").trim();
      // Try direct parse
      try {
        return JSON.parse(cleaned);
      } catch {}
      // Fallback: grab first {...} block
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (m) {
        return JSON.parse(m[0]);
      }
      throw new Error("Model did not return JSON");
    };

    const parsed = await step.run("parse-json", async () =>
      extractFirstJson(jsonText),
    );

    // Map to DB shape with minimal coercion
    const merchant = parsed.merchant ?? {};
    const transaction = parsed.transaction ?? {};
    const totals = parsed.totals ?? {};
    const items = Array.isArray(parsed.items) ? parsed.items : [];

    const dbPayload = {
      id: receiptId as Id<"receipts">,
      currency: String(totals.currency ?? "").toUpperCase(),
      fileDisplayName: fileDisplayName ?? merchant.name ?? "Receipt",
      items: items.map((it: any) => ({
        name: String(it.name ?? ""),
        quantity: Number(it.quantity ?? 0),
        unitPrice: Number(it.unit_price ?? it.unitPrice ?? 0),
        totalPrice: Number(it.total_price ?? it.totalPrice ?? 0),
      })),
      merchantAddress: String(merchant.address ?? ""),
      merchantContact: String(merchant.contact ?? ""),
      merchantName: String(merchant.name ?? ""),
      transactionDate: String(transaction.date ?? ""),
      transactionAmount: Number(totals.total ?? 0),
      receiptSummary:
        `${merchant.name ?? ""} on ${transaction.date ?? ""} — total ${totals.total ?? 0} ${totals.currency ?? ""}`.trim(),
    };

    // 4) Save into Convex
    const save = await step.run("save-receipt-to-database", async () => {
      const result = await convex.mutation(
        api.receipts.updateReceiptWithExtractedData,
        dbPayload,
      );
      await schematicClient.track({
        event: "scan",
        company: { id: result.userId },
        user: { id: result.userId },
      });
      return { ok: true } as const;
    });

    return { receiptId, status: save.ok ? "saved" : "failed" } as const;
  },
);
