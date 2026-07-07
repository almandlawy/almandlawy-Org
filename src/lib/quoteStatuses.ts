/**
 * Desk quote funnel statuses — aligned with bullion quote desk workflow (not ecommerce checkout).
 */

export const QUOTE_STATUSES = [
  "New Request",
  "Contacted",
  "Desk Review",
  "KYC Required",
  "KYC Under Review",
  "Quote Sent",
  "Customer Accepted",
  "Payment Pending",
  "Ready for Collection",
  "Completed",
  "Cancelled",
  "Expired Quote",
] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export function quoteStatusBadgeClass(status: string): string {
  switch (status) {
    case "New Request":
    case "Pending":
      return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
    case "Contacted":
      return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
    case "Desk Review":
      return "bg-violet-500/10 text-violet-400 border border-violet-500/20";
    case "KYC Required":
      return "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse";
    case "KYC Under Review":
      return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
    case "Quote Sent":
    case "Approved":
      return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
    case "Customer Accepted":
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    case "Payment Pending":
      return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    case "Ready for Collection":
      return "bg-teal-500/10 text-teal-400 border border-teal-500/20";
    case "Completed":
      return "bg-green-500/10 text-green-400 border border-green-500/20";
    case "Cancelled":
    case "Rejected":
    case "Expired Quote":
      return "bg-gray-500/10 text-text-secondary border border-gray-500/20 line-through";
    default:
      return "bg-zinc-800 text-zinc-500 border border-zinc-700";
  }
}
