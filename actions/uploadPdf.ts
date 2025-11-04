"use server";

import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { currentUser } from "@clerk/nextjs/server";
import { getFileDownloadUrl } from "./getFileDownloadUrl";
import { inngest } from "@/inngest/client";
import Event from "@/inngest/constant";

export async function uploadPdf(formData: FormData) {
  const user = await currentUser();

  if (!user) {
    return {
      sucess: false,
      message: "User not authenticated. Please sign in.",
    };
  }

  try {
    const file = formData.get("file") as File;

    if (!file) {
      return { sucess: false, message: "No file provided" };
    }

    //validate file type
    if (file.type !== "application/pdf") {
      return {
        sucess: false,
        message: "Invalid file type. Only PDFs are allowed.",
      };
    }

    // Create a server-side Convex client
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    // handle convex upload logic here
    const uploadUrl = await convex.mutation(api.receipts.generateUploadUrl, {});

    console.log("Upload URL generated:", uploadUrl);

    const arrayBuffer = await file.arrayBuffer();
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": file.type,
      },
      body: arrayBuffer,
    });

    console.log("Upload response status:", uploadResponse.status);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("Upload failed:", errorText);
      return {
        sucess: false,
        message: `Failed to upload file to storage: ${uploadResponse.status}`,
      };
    }

    const { storageId } = await uploadResponse.json();
    console.log("Storage ID:", storageId);

    const receiptId = await convex.mutation(api.receipts.storeReceipt, {
      userId: user.id,
      fileId: storageId,
      fileName: file.name,
      size: file.size,
      mimeType: file.type,
    });

    const fileUrl = await getFileDownloadUrl(storageId);

    // TODO: Trigger inngest agent flow
    await inngest.send({
      name: Event.EXTRACT_DATA_FROM_PDF_AND_SAVE_TO_DATABASE,
      data: {
        url: fileUrl.url,
        receiptId,
      },
    });

    return {
      sucess: true,
      data: {
        receiptId,
        fileName: file.name,
      },
      message: "File uploaded successfully",
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    return {
      sucess: false,
      message: error instanceof Error ? error.message : "File upload failed",
    };
  }
}
