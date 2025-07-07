import React, { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function getStatusBadge(status: string): ReactNode {
  switch (status.toLowerCase()) {
    case 'passed':
      return <Badge className="bg-green-500">Passed</Badge>;
    case 'failed':
      return <Badge className="bg-red-500">Failed</Badge>;
    case 'pending':
      return <Badge className="bg-amber-500">Pending</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export function getCardBackgroundColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'passed':
      return 'bg-green-50 border-green-100';
    case 'failed':
      return 'bg-red-50 border-red-100';
    case 'pending':
      return 'bg-amber-50 border-amber-100';
    default:
      return 'bg-white border-gray-200';
  }
}

export function formatDate(date: Date, formatStr: string = 'PP'): string {
  return format(date, formatStr);
} 