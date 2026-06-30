const PARTNERS = [
  "PAMP",
  "Valcambi",
  "Metalor",
  "The Perth Mint",
  "Asahi Refining",
  "Umicore",
  "Rand Refinery",
  "LBMA",
];

export default function PartnerLogos() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-4 lg:grid-cols-8 md:overflow-visible">
      {PARTNERS.map((name) => (
        <div
          key={name}
          className="glass-gold flex items-center justify-center min-h-[68px] min-w-[120px] md:min-w-0 px-4 text-center shrink-0 snap-center group"
        >
          <span className="text-[10px] md:text-[11px] font-serif font-semibold text-gray-400 group-hover:text-gold-base tracking-wide transition-colors">
            {name}
          </span>
        </div>
      ))}
    </div>
  );
}
