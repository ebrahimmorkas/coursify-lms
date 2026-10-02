export default function CoursesLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6">
      <div className="mb-8 h-9 w-56 rounded-lg bg-slate-200" />
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <div className="h-96 rounded-xl bg-slate-200" />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-80 rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
