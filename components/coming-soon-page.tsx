import Link from "next/link"
import { ArrowLeft, Clock, type LucideIcon } from "lucide-react"

interface ComingSoonPageProps {
  title: string
  description: string
  icon: LucideIcon
}

export function ComingSoonPage({ title, description, icon: Icon }: ComingSoonPageProps) {
  return (
    <main className="min-h-screen bg-[#F6F2EE] px-4 py-24 sm:px-6 sm:py-32 dark:bg-[#17313A]">
      <section className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-[#17313A]/10 bg-white p-8 text-center shadow-xl shadow-[#17313A]/10 sm:p-14 dark:border-white/10 dark:bg-[#0F2027] dark:shadow-black/20">
        <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--conectia-arcilla)]/15">
          <Icon className="h-11 w-11 text-[var(--conectia-arcilla)]" aria-hidden="true" />
        </div>
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--conectia-arcilla)]/30 bg-[var(--conectia-arcilla)]/10 px-4 py-2 text-sm font-bold text-[#17313A] dark:text-[#EAE4DD]">
          <Clock className="h-4 w-4" aria-hidden="true" />
          Próximamente
        </div>
        <h1 className="font-serif text-4xl font-black text-[#17313A] sm:text-5xl dark:text-[#EAE4DD]">{title}</h1>
        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-[#4A4F57] sm:text-lg dark:text-[#B0ACA6]">
          {description}
        </p>
        <p className="mt-4 text-sm text-[#6B7280] dark:text-[#B0ACA6]">
          Estamos trabajando para habilitar esta sección.
        </p>
        <Link
          href="/"
          className="mt-9 inline-flex items-center gap-2 rounded-xl bg-[#17313A] px-5 py-3 font-semibold text-[#EAE4DD] transition-colors hover:bg-[var(--conectia-arcilla-hover)] dark:bg-[var(--conectia-arcilla)] dark:text-[#17313A]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al inicio
        </Link>
      </section>
    </main>
  )
}
