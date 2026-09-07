export function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-surface/60 p-6">
      <div className="skeleton h-4 w-1/3 rounded-md" />
      <div className="skeleton h-3 w-2/3 rounded-md" />
    </div>
  );
}
