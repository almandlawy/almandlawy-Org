const PARTNERS = [
  "PAMP", "Valcambi", "Metalor", "Perth Mint", "Asahi", "Umicore", "Rand Refinery", "LBMA",
];

export default function PartnerLogos() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {PARTNERS.map((name) => (
        <div
          key={name}
          className="premium-card flex items-center justify-center min-h-[72px] px-3 text-center group hover:border-gold-base/30 transition-all"
        >
          <span className="text-[11px] font-serif font-semibold text-gray-400 group-hover:text-white tracking-wide">
            {name}
          </span>
        </div>
      ))}
    </div>
  );
}
