export const BlogCardSkeleton = () => (
  <div className="flex max-w-xl flex-col items-start justify-between rounded-md border secondary-color-border p-5 primary-color-bg transition-all duration-1000">
    <div className="flex items-center gap-x-4 text-xs">
      <div className="h-3 w-24 secondary-color-bg opacity-20 rounded animate-[pulse_2s_ease-in-out_infinite]" />
    </div>
    <div className="group relative w-full">
      <div className="mt-3 h-6 w-3/4 secondary-color-bg opacity-20 rounded animate-[pulse_2s_ease-in-out_infinite]" />
      <div className="mt-5 h-4 w-full secondary-color-bg opacity-20 rounded animate-[pulse_2s_ease-in-out_infinite]" />
    </div>
  </div>
);
