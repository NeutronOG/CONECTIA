import type { LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PageHeroProps {
  eyebrow?: string
  title: string
  titleAccent?: string
  description?: string
  badge?: string
  icon?: LucideIcon
  /** URL de imagen de fondo. Si no se pasa se usa el color de marca */
  bgImage?: string
  extra?: React.ReactNode
}

export function PageHero({
  eyebrow = "CONECTIA",
  title,
  titleAccent,
  description,
  badge,
  icon: Icon,
  bgImage,
  extra,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden min-h-[300px] sm:min-h-[400px]">
      {/* Fondo */}
      {bgImage ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${bgImage}')` }}
          />
          <div className="absolute inset-0 bg-[#17313A]/68" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F2027]/70 via-[#17313A]/40 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-conectia-accent" />
      )}

      {/* Línea decorativa superior */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-conectia-primary via-conectia-primary/60 to-transparent z-10" />

      {/* Contenido */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20 sm:py-28 flex items-end">
        <div className="max-w-2xl space-y-5">
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 bg-white/12 border border-white/20 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-md flex-shrink-0">
                <Icon className="h-5 w-5 text-white" />
              </div>
            )}
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-[#F0C2B0] font-bold">
              {eyebrow}
            </span>
          </div>

          {/* Título */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight">
            {title}
            {titleAccent && (
              <>
                <br />
                <span className="text-[#F0C2B0] drop-shadow-[0_2px_18px_rgba(240,194,176,0.25)]">{titleAccent}</span>
              </>
            )}
          </h1>

          {/* Descripción */}
          {description && (
            <p className="text-white/75 text-base sm:text-lg leading-relaxed max-w-xl">
              {description}
            </p>
          )}

          {/* Badge */}
          {badge && (
            <Badge className="bg-white/12 text-white border border-white/15 px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur-md">
              {badge}
            </Badge>
          )}

          {/* Extra slot */}
          {extra}
        </div>
      </div>
    </section>
  )
}
