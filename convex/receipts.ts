import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const uploadUrl = await ctx.storage.generateUploadUrl();
    return uploadUrl;
  },
});

export const storeReceipt = mutation({
  args: {
    userId: v.string(),
    fileId: v.id("_storage"),
    fileName: v.string(),
    size: v.number(),
    mimeType: v.string(),
  },
  handler: async (ctx, { userId, fileId, fileName, size, mimeType }) => {
    const receiptId = await ctx.db.insert("receipts", {
      userId: userId,
      fileId: fileId,
      fileName: fileName,
      uploadedAt: Date.now(),
      size: size,
      mimeType: mimeType,
      status: "processing",

      // Initialize extracted data fields as empty or default values
      merchantName: undefined,
      merchantAddress: undefined,
      merchantContact: undefined,
      transactionDate: undefined,
      transactionAmount: undefined,
      currency: undefined,
      items: [],
    });
    return receiptId;
  },
});

export const getReceipts = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    const receipts = await ctx.db
      .query("receipts")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();
    return receipts;
  },
});

export const getReceiptById = query({
  args: {
    id: v.id("receipts"),
  },
  handler: async (ctx, { id }) => {
    const receipt = await ctx.db.get(id);
    if (!receipt) {
      throw new Error("Receipt not found");
    }
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error("User not authenticated");
    }
    const userId = identify.subject;
    if (receipt.userId !== userId) {
      throw new Error("Access denied");
    }
    return receipt;
  },
});

export const getReceiptDownloadUrl = query({
  args: {
    fileId: v.id("_storage"),
  },
  handler: async (ctx, { fileId }) => {
    const downloadUrl = await ctx.storage.getUrl(fileId);
    return downloadUrl;
  },
});

export const updateReceiptStatus = mutation({
  args: {
    id: v.id("receipts"),
    status: v.string(),
  },
  handler: async (ctx, { id, status }) => {
    const receipt = await ctx.db.get(id);
    if (!receipt) {
      throw new Error("Receipt not found");
    }
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error("User not authenticated");
    }
    const userId = identify.subject;
    if (receipt.userId !== userId) {
      throw new Error("Access denied");
    }
    await ctx.db.patch(id, { status });
    return true;
  },
});

export const deleteReceipt = mutation({
  args: {
    id: v.id("receipts"),
  },
  handler: async (ctx, { id }) => {
    const receipt = await ctx.db.get(id);
    if (!receipt) {
      throw new Error("Receipt not found");
    }
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error("User not authenticated");
    }
    const userId = identify.subject;
    if (receipt.userId !== userId) {
      throw new Error("Access denied");
    }
    await ctx.db.delete(id);
    return true;
  },
});

export const updateReceiptWithExtractedData = mutation({
  args: {
    id: v.id("receipts"),
    fileDisplayName: v.string(),
    merchantName: v.string(),
    merchantAddress: v.string(),
    merchantContact: v.string(),
    transactionDate: v.string(),
    transactionAmount: v.number(),
    currency: v.string(),
    receiptSummary: v.string(),
    items: v.array(
      v.object({
        name: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        totalPrice: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const receipt = await ctx.db.get(args.id);
    if (!receipt) {
      throw new Error("Receipt not found");
    }
    await ctx.db.patch(args.id, {
      fileName: args.fileDisplayName,
      merchantName: args.merchantName,
      merchantAddress: args.merchantAddress,
      merchantContact: args.merchantContact,
      transactionDate: args.transactionDate,
      transactionAmount: args.transactionAmount,
      currency: args.currency,
      receiptSummary: args.receiptSummary,
      items: args.items,
      status: "completed",
    });
    return {
      userId: receipt.userId,
    };
  },
});
