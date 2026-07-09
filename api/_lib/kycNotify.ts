/**
 * Desk email when a client submits KYC for review.
 */

export interface KycNotifyPayload {
  customerId: string;
  fullName: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  status?: string;
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

export async function notifyDeskNewKyc(
  payload: KycNotifyPayload
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { sent: false, error: "RESEND_API_KEY not configured" };
  }

  const subject = `KYC submitted for review — ${payload.fullName || payload.email || payload.customerId}`;

  const lines = [
    `Customer: ${payload.fullName || "—"}`,
    `Email: ${payload.email || "—"}`,
    `Phone: ${payload.phone || "—"}`,
    `Location: ${[payload.city, payload.country].filter(Boolean).join(", ") || "—"}`,
    `Status: ${payload.status || "Pending review"}`,
    `Profile ID: ${payload.customerId}`,
    "",
    "Review and approve in the PGR UAE admin panel → KYC Compliance.",
  ];

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;color:#1F1A17;max-width:560px">
      <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#A47C36;font-weight:bold">
        PGR UAE Compliance Desk
      </p>
      <h2 style="font-family:Georgia,serif;font-weight:500">${subject}</h2>
      <pre style="background:#F7F4ED;padding:16px;border-radius:8px;font-size:13px;line-height:1.6;white-space:pre-wrap">${lines.join("\n")}</pre>
    </div>
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
      const errText = await res.text().catch(() => "");
      return { sent: false, error: errText || `HTTP ${res.status}` };
    }

    return { sent: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Email send failed";
    return { sent: false, error: message };
  }
}
