export function ProductSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden">
      <div className="aspect-[3/4] w-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
      <div className="p-4">
        <div className="h-5 w-2/3 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mb-2" />
        <div className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
      </div>
    </div>
  )
}
