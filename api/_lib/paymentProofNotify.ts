/**
 * Desk email when a client uploads payment proof.
 */

export interface PaymentProofNotifyPayload {
  orderId: string;
  customerName?: string;
  email?: string;
  fileName?: string;
}

function deskEmail(): string {
  return (
    process.env.PGR_DESK_EMAIL ||
    process.env.DESK_NOTIFICATION_EMAIL ||
    "almandlawy112@gmail.com"
  );
}

function fromEmail(): string {
  return process.env.PGR_FROM_EMAIL || "PGR UAE Desk <onboarding@resend.dev>";
}

export async function notifyDeskPaymentProof(
  payload: PaymentProofNotifyPayload
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[paymentProofNotify] RESEND_API_KEY not set — skipping email");
    return { sent: false, error: "RESEND_API_KEY not configured" };
  }

  const subject = `Payment proof uploaded — Order ${payload.orderId}`;
  const html = `
    <h2>Payment proof uploaded</h2>
    <p><strong>Order:</strong> ${payload.orderId}</p>
    <p><strong>Customer:</strong> ${payload.customerName || "—"}</p>
    <p><strong>Email:</strong> ${payload.email || "—"}</p>
    <p><strong>File:</strong> ${payload.fileName || "—"}</p>
    <p>Review in the admin panel and verify the bank transfer.</p>
    <p><a href="https://www.pgruae.com/admin">Open Admin Panel</a></p>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail(),
        to: [deskEmail()],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      return { sent: false, error: err };
    }
    return { sent: true };
  } catch (err: unknown) {
    return { sent: false, error: err instanceof Error ? err.message : "send failed" };
  }
}
