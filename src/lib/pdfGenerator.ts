import { jsPDF } from "jspdf";

export function generateQuotePDF(q: any, customerName: string = "Accredited Investor"): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const primaryColor = [12, 13, 14]; // #0c0d0e (Deep Charcoal Black)
  const accentColor = [197, 168, 92]; // #c5a85c (PGR Gold)
  const textColor = [50, 50, 50]; // Medium Grey
  const lightBg = [250, 249, 245]; // Off-White

  // 1. Header Area with Luxury Branding
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, "F");

  // Gold accent bar
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(0, 40, 210, 2, "F");

  // Logo / Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text("PGR UAE", 15, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text("PRECIOUS METALS & PHYSICAL BULLION DESK", 15, 26);
  doc.text("DUBAI, UNITED ARAB EMIRATES", 15, 31);

  // Quote Title & Watermark badge
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("OFFICIAL FIRM QUOTE", 140, 25);

  // 2. Info Grid Layout
  const quoteId = q.id || `PGR-QT-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date(q.created_at || Date.now()).toLocaleString();
  const expiryStr = q.expires_at ? new Date(q.expires_at).toLocaleString() : "5 Minutes from generation";

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("QUOTE SPECIFICATIONS", 15, 55);

  // Specifications Box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(230, 225, 210);
  doc.rect(15, 58, 180, 90, "DF");

  // Inner grid details
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
  const productFirm = q.product_firm_price ?? q.quoted_price ?? q.price ?? 0;
  const shippingFee = q.shipping_fee ?? 0;
  const totalPrice = q.quoted_price ?? q.price ?? (Number(productFirm) + Number(shippingFee));
  const currency = q.currency || "USD";

  drawRow("Quote Reference Number:", quoteId);
  drawRow("Authorized Client Name:", customerName);
  drawRow("Product Classification:", category);
  drawRow("Metal Specification:", metal.toUpperCase());
  drawRow("Allocated Net Weight:", weight);
  drawRow("Refinery Certified Purity:", purity);
  drawRow("Product Firm Price:", `${Number(productFirm).toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currency}`);
  if (Number(shippingFee) > 0) {
    drawRow("Shipping Fee:", `${Number(shippingFee).toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currency}${q.shipping_company ? ` (${q.shipping_company})` : ""}`);
  }
  drawRow("Total Firm Quote Amount:", `${Number(totalPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currency}`);

  // 3. Status Badge & Timer
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(15, 142, 180, 22, "FD");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("CONTRACT STATUS: FIRM QUOTE CONFIRMED BY PGR UAE DESK", 22, 151);

  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Lock-in Valid Until: ${expiryStr} (Dubai Local Time)`, 22, 158);

  // 4. Payment & Collection Instructions
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("PAYMENT & TRUSTEE INSTRUCTIONS", 15, 178);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);

  const bankInstructions = [
    "1. Wire Transfer: Please execute a transfer for the contract price above to the PGR UAE escrow account.",
    "   Beneficiary: PGR UAE Precious Metals LLC",
    "   Bank Name: Emirates NBD Bank PJSC, Dubai Marina Branch",
    "   IBAN / Swift: AE83 0260 0000 1209 8903 1721 (USD/AED multi-currency)",
    "2. Reference Requirement: You MUST include the quote reference number above in the wire description.",
    "3. Handover and Pickup: Once the wire clears and is verified, you can collect the allocated bullion at:",
    "   PGR Desk: Almas Tower, West Trade Zone, Dubai Marina, Dubai, UAE (Appointment Required).",
    "4. Mandatory Storage Option: Alternatively, you can request continuous allocated storage under PGR vaulting."
  ];

  let bankY = 184;
  bankInstructions.forEach(line => {
    doc.text(line, 15, bankY);
    bankY += 6;
  });

  // 5. Compliance Disclaimer
  doc.setFillColor(245, 245, 245);
  doc.rect(15, 242, 180, 32, "F");

  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("REGULATORY COMPLIANCE AND AML/CTF DISCLAIMER", 18, 248);

  doc.setFont("helvetica", "normal");
  const disclaimerText = [
    "By accepting this contract, the counterparty certifies compliance with the UAE Central Bank and UAE Ministry of Economy guidelines concerning physical gold sourcing, anti-money laundering (AML), and combatting terrorist financing (CTF). Transactions require valid ID verification (Emirates ID/Passport) and a formal declaration of funds source prior to physical asset dispatch, delivery, or custom clearing."
  ];

  let discY = 253;
  disclaimerText.forEach(para => {
    const lines = doc.splitTextToSize(para, 174);
    doc.text(lines, 18, discY);
    discY += 9;
  });

  // Footer watermark
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text("PGR UAE PRECIOUS METALS LLC  |  SECURE VAULT AND DESK CONTRACTS  |  WWW.PGRUAE.COM", 40, 287);

  // Save the PDF
  doc.save(`PGR_QUOTE_${quoteId}.pdf`);
}
