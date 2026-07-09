/**
 * Optional desk email alerts when a quote request is received (Resend API).
 */

export interface QuoteNotifyPayload {
  inquiryId: string;
  name: string;
  phone: string;
  productCategory: string;
  countryCity?: string;
  quantityBudget?: string;
  source?: string;
  sourceLanguage?: string;
  message?: string;
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

export async function notifyDeskNewQuote(
  payload: QuoteNotifyPayload
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { sent: false, error: "RESEND_API_KEY not configured" };
  }

  const isAr = payload.sourceLanguage === "ar";
  const subject = isAr
    ? `طلب عرض سعر جديد ${payload.inquiryId} — PGR UAE`
    : `New quote request ${payload.inquiryId} — PGR UAE`;

  const lines = [
    `Inquiry: ${payload.inquiryId}`,
    `Name: ${payload.name}`,
    `Phone / WhatsApp: ${payload.phone}`,
    `Product: ${payload.productCategory}`,
    payload.countryCity ? `Location: ${payload.countryCity}` : "",
    payload.quantityBudget ? `Qty/Budget: ${payload.quantityBudget}` : "",
    payload.source ? `Source: ${payload.source}` : "",
    payload.message ? `Message:\n${payload.message}` : "",
  ].filter(Boolean);

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;color:#1F1A17;max-width:560px">
      <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#A47C36;font-weight:bold">
        PGR UAE Quote Desk
      </p>
      <h2 style="font-family:Georgia,serif;font-weight:500">${subject}</h2>
      <pre style="background:#F7F4ED;padding:16px;border-radius:8px;font-size:13px;line-height:1.6;white-space:pre-wrap">${lines.join("\n")}</pre>
      <p style="font-size:12px;color:#5E564D">Reply on WhatsApp or update status in the admin panel.</p>
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
