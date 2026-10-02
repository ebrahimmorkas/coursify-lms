import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Award, GraduationCap } from "lucide-react";
import { getCertificate } from "@/lib/queries/learn";
import { PrintButton } from "./print-button";

async function load(id: string) {
  return getCertificate(id).catch(() => null);
}

export async function generateMetadata(props: PageProps<"/certificates/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const certificate = await load(id);
  if (!certificate) return { title: "Certificate not found" };
  return {
    title: `${certificate.learnerName} — ${certificate.courseTitle} certificate`,
    description: `${certificate.learnerName} completed ${certificate.courseTitle} on Coursify.`,
  };
}

/** Public so learners can share a link that anyone can verify. */
export default async function CertificatePage(props: PageProps<"/certificates/[id]">) {
  const { id } = await props.params;
  const certificate = await load(id);
  if (!certificate) notFound();

  const completedOn = new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
    certificate.completedAt,
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 print:p-0">
      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <article className="relative overflow-hidden rounded-2xl border-8 border-double border-brand-600 bg-white p-10 text-center shadow-xl sm:p-16 print:shadow-none">
        <div className="absolute -top-20 -right-20 size-64 rounded-full bg-brand-50" aria-hidden />
        <div
          className="absolute -bottom-24 -left-24 size-72 rounded-full bg-brand-50"
          aria-hidden
        />

        <div className="relative">
          <div className="flex items-center justify-center gap-2 text-brand-700">
            <GraduationCap className="size-7" aria-hidden />
            <span className="text-xl font-bold">Coursify</span>
          </div>

          <p className="mt-10 text-sm font-semibold tracking-[0.3em] text-slate-500 uppercase">
            Certificate of completion
          </p>
          <p className="mt-8 text-slate-600">This certifies that</p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-slate-900 sm:text-5xl">
            {certificate.learnerName}
          </h1>
          <p className="mt-6 text-slate-600">has successfully completed</p>
          <h2 className="mt-3 text-2xl font-semibold text-brand-700">{certificate.courseTitle}</h2>

          <div className="mt-12 grid gap-8 text-sm sm:grid-cols-3">
            <div>
              <p className="font-semibold text-slate-900">{completedOn}</p>
              <p className="mt-1 border-t border-slate-300 pt-1 text-slate-500">Date</p>
            </div>
            <div className="flex justify-center">
              <Award className="size-16 text-amber-500" aria-hidden />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{certificate.instructorName}</p>
              <p className="mt-1 border-t border-slate-300 pt-1 text-slate-500">Instructor</p>
            </div>
          </div>

          <p className="mt-12 font-mono text-xs text-slate-400">Certificate ID: {certificate.id}</p>
        </div>
      </article>
    </div>
  );
}
