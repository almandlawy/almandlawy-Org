import { jsPDF } from "jspdf";
import { formatQuoteAmount, resolveQuoteCurrency } from "./quoteUtils";

export function generateQuotePDF(q: any, customerName: string = "Accredited Investor"): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const primaryColor = [12, 13, 14];
  const accentColor = [197, 168, 92];
  const textColor = [50, 50, 50];
  const lightBg = [250, 249, 245];

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, "F");

  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(0, 40, 210, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text("PGR UAE", 15, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text("PRECIOUS METALS & PHYSICAL BULLION DESK", 15, 26);
  doc.text("DUBAI, UNITED ARAB EMIRATES", 15, 31);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("OFFICIAL FIRM QUOTE", 140, 25);

  const quoteId = q.id || `PGR-QT-${Math.floor(100000 + Math.random() * 900000)}`;
  const expiryStr = q.expires_at ? new Date(q.expires_at).toLocaleString() : "Desk-confirmed expiry";

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("QUOTE SPECIFICATIONS", 15, 55);

  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(230, 225, 210);
  doc.rect(15, 58, 180, 95, "DF");

  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);

  let y = 66;
  const drawRow = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, 80, y);
    y += 9;
  };

  const metal = q.metalInterest || q.metal_interest || q.metal || "Gold";
  const category = q.productCategory || q.product_category || `${metal.toUpperCase()} Bullion`;
  const weight = q.weight || q.weight_preference || "100 Grams";
  const purity = q.purity || "Au 99.99% (24 Karats)";
  const currency = resolveQuoteCurrency(q.currency);
  const productFirm = Number(q.product_firm_price ?? q.quoted_price ?? q.price ?? 0);
  const shippingFee = Number(q.shipping_fee ?? 0);
  const totalPrice = Number(q.quoted_price ?? q.price ?? (productFirm + shippingFee));

  drawRow("Quote Reference Number:", quoteId);
  drawRow("Authorized Client Name:", customerName);
  drawRow("Product Classification:", category);
  drawRow("Metal Specification:", metal.toUpperCase());
  drawRow("Allocated Net Weight:", weight);
  drawRow("Refinery Certified Purity:", purity);
  drawRow("Product Firm Price:", formatQuoteAmount(productFirm, currency));
  if (shippingFee > 0) {
    drawRow("Shipping Fee:", `${formatQuoteAmount(shippingFee, currency)}${q.shipping_company ? ` (${q.shipping_company})` : ""}`);
  }
  drawRow("Total Firm Quote:", formatQuoteAmount(totalPrice, currency));
  drawRow("Quote Currency:", currency);

  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(15, 158, 180, 22, "FD");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("FIRM QUOTE CONFIRMED BY PGR UAE DESK", 22, 167);

  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Quote Expiry Time: ${expiryStr} (Dubai Local Time)`, 22, 174);

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("PAYMENT & TRUSTEE INSTRUCTIONS", 15, 194);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);

  const bankInstructions = [
    "1. Wire Transfer: Please execute a transfer for the total firm quote amount above to the PGR UAE escrow account.",
    "   Beneficiary: PGR UAE Precious Metals LLC",
    "   Bank Name: Emirates NBD Bank PJSC, Dubai Marina Branch",
    "   IBAN / Swift: AE83 0260 0000 1209 8903 1721 (AED/USD multi-currency)",
    "2. Reference Requirement: You MUST include the quote reference number above in the wire description.",
    "3. Handover and Pickup: Once the wire clears and is verified, you can collect the allocated bullion at:",
    "   PGR Desk: Almas Tower, West Trade Zone, Dubai Marina, Dubai, UAE (Appointment Required)."
  ];

  let bankY = 200;
  bankInstructions.forEach(line => {
    doc.text(line, 15, bankY);
    bankY += 6;
  });

  doc.setFillColor(245, 245, 245);
  doc.rect(15, 248, 180, 28, "F");

  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("COMPLIANCE NOTICE", 18, 254);

  doc.setFont("helvetica", "normal");
  const disclaimerText = [
    "Final quote confirmed by PGR UAE desk. Subject to market movement and compliance review.",
    "Indicative market references on the public site are not firm quotes until desk confirmation.",
    "Transactions require valid ID verification (Emirates ID/Passport) and AML/CTF compliance before dispatch."
  ];

  let discY = 259;
  disclaimerText.forEach(para => {
    const lines = doc.splitTextToSize(para, 174);
    doc.text(lines, 18, discY);
    discY += 7;
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text("PGR UAE PRECIOUS METALS LLC  |  SECURE VAULT AND DESK CONTRACTS  |  WWW.PGRUAE.COM", 40, 287);

  doc.save(`PGR_QUOTE_${quoteId}.pdf`);
}
