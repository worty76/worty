export const MusicCardSkeleton = () => (
  <div className="flex flex-col rounded-xl overflow-hidden primary-color-bg transition-all duration-700 hover:shadow-lg">
    <div className="relative aspect-square secondary-color-bg opacity-10 animate-[pulse_2.5s_ease-in-out_infinite]" />
    <div className="p-5 space-y-4">
      <div className="flex gap-3">
        <div className="h-5 w-20 secondary-color-bg opacity-10 rounded-full animate-[pulse_2.5s_ease-in-out_infinite]" />
        <div className="h-5 w-20 secondary-color-bg opacity-10 rounded-full animate-[pulse_2.5s_ease-in-out_infinite]" />
      </div>
      <div className="h-7 w-full secondary-color-bg opacity-10 rounded-lg animate-[pulse_2.5s_ease-in-out_infinite]" />
      <div className="h-5 w-2/3 secondary-color-bg opacity-10 rounded-lg animate-[pulse_2.5s_ease-in-out_infinite]" />
      <div className="h-5 w-36 secondary-color-bg opacity-10 rounded-lg animate-[pulse_2.5s_ease-in-out_infinite]" />
    </div>
  </div>
);
