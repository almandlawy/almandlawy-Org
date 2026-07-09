/**
 * Fire-and-forget desk email notifications (quote / KYC).
 */

export async function notifyDesk(type: "quote" | "kyc", payload: Record<string, unknown>): Promise<void> {
  try {
    await fetch("/api/desk-notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, ...payload }),
    });
  } catch (err) {
    console.warn(`[notifyDesk] ${type} notification failed:`, err);
  }
}
