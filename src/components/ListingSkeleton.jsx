export default function ListingSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="aspect-square skeleton-glass" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 rounded skeleton-glass" />
        <div className="h-5 w-1/2 rounded skeleton-glass" />
        <div className="h-3 w-2/3 rounded skeleton-glass" />
      </div>
    </div>
  );
}
