import { BarChart3, Briefcase, Code2, Database, Palette, Server, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, typeof Code2> = {
  "Web Development": Code2,
  "Data Science": Database,
  "Mobile Development": Smartphone,
  DevOps: Server,
  Design: Palette,
  Business: Briefcase,
};

const gradients = [
  "from-indigo-500 via-purple-500 to-pink-500",
  "from-sky-500 via-cyan-500 to-emerald-500",
  "from-amber-500 via-orange-500 to-rose-500",
  "from-emerald-500 via-teal-500 to-sky-600",
  "from-fuchsia-500 via-violet-500 to-indigo-600",
  "from-slate-700 via-slate-800 to-indigo-900",
];

function hash(value: string) {
  let result = 0;
  for (const char of value) result = (result * 31 + char.charCodeAt(0)) >>> 0;
  return result;
}

/** Generated artwork so every course has a consistent, attractive cover without uploads. */
export function CourseCover({
  slug,
  category,
  title,
  className,
  size = "md",
}: {
  slug: string;
  category: string;
  title: string;
  className?: string;
  size?: "md" | "lg";
}) {
  const Icon = categoryIcons[category] ?? BarChart3;
  const gradient = gradients[hash(slug) % gradients.length];

  return (
    <div
      className={cn(
        "relative flex aspect-video items-end overflow-hidden bg-gradient-to-br p-4 text-white",
        gradient,
        className,
      )}
      aria-hidden
    >
      <Icon
        className={cn(
          "absolute opacity-20",
          size === "lg" ? "-top-6 -right-6 size-48" : "-top-4 -right-4 size-28",
        )}
        strokeWidth={1.25}
      />
      <span
        className={cn(
          "relative line-clamp-2 font-semibold drop-shadow-sm",
          size === "lg" ? "text-2xl" : "text-base",
        )}
      >
        {title}
      </span>
    </div>
  );
}
