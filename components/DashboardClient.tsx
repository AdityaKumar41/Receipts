"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import PDFDropzone from "@/components/PDFDropzone";
import { useSchematicEntitlement } from "@schematichq/schematic-react";
import {
  FileText,
  Calendar,
  DollarSign,
  Store,
  Trash2,
  Download,
  Eye,
  Loader2,
  TrendingUp,
  Package,
  CreditCard,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DashboardClient() {
  const { user } = useUser();

  const receipts = useQuery(
    api.receipts.getReceipts,
    user?.id ? { userId: user.id } : "skip",
  );

  const {
    value: isFeatureEnabled,
    featureUsageExceeded,
    featureAllocation,
    featureUsage,
  } = useSchematicEntitlement("scan");

  console.log("Schematic Debug:", {
    isFeatureEnabled,
    featureUsageExceeded,
    featureAllocation,
    featureUsage,
  });

  const handleUploadSuccess = () => {
    // Receipts will automatically refresh via Convex real-time updates
  };

  // Calculate stats
  const totalReceipts = receipts?.length || 0;
  const totalAmount =
    receipts?.reduce(
      (sum, receipt) => sum + (receipt.transactionAmount || 0),
      0,
    ) || 0;
  const processingCount =
    receipts?.filter((r) => r.status === "processing").length || 0;
  const completedCount =
    receipts?.filter((r) => r.status === "completed").length || 0;

  const usagePercentage =
    featureAllocation && featureAllocation !== -1 && featureUsage
      ? (featureUsage / featureAllocation) * 100
      : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-black dark:text-white">
            Upload and manage your receipts with AI-powered insights
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Receipts
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReceipts}</div>
              <p className="text-xs text-muted-foreground">
                {completedCount} completed, {processingCount} processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalAmount.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all receipts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scans Used</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {featureUsage || 0}
                {featureAllocation !== -1 && (
                  <span className="text-sm font-normal text-black dark:text-white">
                    {" "}
                    / {featureAllocation || 0}
                  </span>
                )}
              </div>
              {featureAllocation !== -1 && (
                <div className="mt-2">
                  <div className="w-full bg-white dark:bg-black border border-black dark:border-white rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all bg-black dark:bg-white"
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plan Status</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {featureAllocation === -1 ? "Unlimited" : "Limited"}
              </div>
              <p className="text-xs text-muted-foreground">
                {featureUsageExceeded ? (
                  <span className="text-red-500 font-semibold">
                    Limit reached
                  </span>
                ) : (
                  "Active subscription"
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Upload Receipt</CardTitle>
              <CardDescription>
                Drag and drop or click to upload your receipt (PDF only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PDFDropzone onUploadSuccess={handleUploadSuccess} />
            </CardContent>
          </Card>
        </div>

        {/* Receipts List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Receipts</CardTitle>
            <CardDescription>
              View and manage your uploaded receipts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!receipts ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-black dark:text-white" />
              </div>
            ) : receipts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-black dark:text-white mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                  No receipts yet
                </h3>
                <p className="text-black dark:text-white mb-4">
                  Upload your first receipt to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {receipts.map((receipt) => (
                  <div
                    key={receipt._id}
                    className="flex items-center justify-between p-4 border border-black dark:border-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-black dark:bg-white rounded-lg">
                        <FileText className="h-6 w-6 text-white dark:text-black" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-black dark:text-white">
                            {receipt.fileName}
                          </h4>
                          <Badge
                            variant={
                              receipt.status === "completed"
                                ? "default"
                                : receipt.status === "processing"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {receipt.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-black dark:text-white">
                          {receipt.merchantName && (
                            <div className="flex items-center gap-1">
                              <Store className="h-4 w-4" />
                              <span>{receipt.merchantName}</span>
                            </div>
                          )}
                          {receipt.transactionDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{receipt.transactionDate}</span>
                            </div>
                          )}
                          {receipt.transactionAmount !== undefined && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>
                                {receipt.currency || "$"}
                                {receipt.transactionAmount.toFixed(2)}
                              </span>
                            </div>
                          )}
                          {receipt.items && receipt.items.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4" />
                              <span>{receipt.items.length} items</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
