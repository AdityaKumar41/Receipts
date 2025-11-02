"use server";

import { currentUser } from "@clerk/nextjs/server";

export async function uploadPdf(formData: FormData) {
  const user = await currentUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  try {

    const file = formData.get("file") as File;

    if (!file) {
      throw new Error("No file provided");
    }

    //validate file type
    if (file.type !== "application/pdf") {
      throw new Error("Invalid file type. Only PDFs are allowed.");
    }

    // handle convex upload logic here

    return { success: true, message: "File uploaded successfully" };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { success: false, message: "File upload failed" };
  }
}
