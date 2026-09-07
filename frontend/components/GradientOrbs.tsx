export default function GradientOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="animate-orb-drift absolute -left-32 top-0 h-[500px] w-[500px] rounded-full bg-gold opacity-[0.12] blur-[130px]" />
      <div
        className="animate-orb-drift absolute -right-32 top-1/4 h-[560px] w-[560px] rounded-full bg-violet opacity-[0.16] blur-[140px]"
        style={{ animationDelay: "-5s" }}
      />
      <div
        className="animate-orb-drift absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-gold opacity-[0.08] blur-[120px]"
        style={{ animationDelay: "-9s" }}
      />
      <div className="noise-overlay" />
    </div>
  );
}
