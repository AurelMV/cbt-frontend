import { useEffect, useMemo, useRef, useState } from "react"
import { animate, stagger } from "animejs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getProgramas, type ProgramaRead } from "@/services/programas"

type ProgInfo = {
  nombre: string
  descripcion: string
  grupo: "A" | "B" | "C"
}

// Mapeo de 10 programas con descripciones y grupo, según imágenes de referencia
const PROGRAMAS_BASE: ProgInfo[] = [
  {
    nombre: "Desarrollo de Sistemas de Información",
    grupo: "A",
    descripcion:
      "Serás capaz de desarrollar programas y soluciones informáticas de acuerdo al avance de las TIC y acorde a las necesidades de empresas.",
  },
  {
    nombre: "Electrónica Industrial",
    grupo: "A",
    descripcion:
      "Planificar, organizar, diseñar, montar e instalar sistemas electrónicos; mantenimiento preventivo y correctivo.",
  },
  {
    nombre: "Electricidad Industrial",
    grupo: "A",
    descripcion:
      "Planificar, supervisar e instalar sistemas eléctricos industriales y automatización de líneas.",
  },
  {
    nombre: "Mecatrónica Automotriz",
    grupo: "A",
    descripcion:
      "Ejecutar y supervisar el mantenimiento integral de unidades automotrices con normas de seguridad.",
  },
  {
    nombre: "Mecánica de Producción Industrial",
    grupo: "A",
    descripcion:
      "Planificar, coordinar y supervisar labores productivas y de mantenimiento mecánico de equipos.",
  },
  {
    nombre: "Enfermería Técnica",
    grupo: "B",
    descripcion:
      "Organizar y realizar servicios técnicos de enfermería en atención integral a la persona, familia y comunidad.",
  },
  {
    nombre: "Laboratorio Clínico y Anatomía Patológica",
    grupo: "B",
    descripcion:
      "Procesar muestras biológicas en los procesos preanalítico, analítico y post-analítico con calidad.",
  },
  {
    nombre: "Contabilidad",
    grupo: "C",
    descripcion:
      "Registrar operaciones económicas y financieras según normativa vigente y sistemas de contabilidad.",
  },
  {
    nombre: "Guía Oficial de Turismo",
    grupo: "C",
    descripcion:
      "Interpretar, informar y conducir servicios turísticos con enfoque sostenible y cultural.",
  },
  {
    nombre: "Administración de Servicios de Hostelería y Restaurantes",
    grupo: "C",
    descripcion:
      "Gestionar recursos humanos, materiales, financieros y servicios en empresas de hostelería y restaurantes.",
  },
]

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

// Imports estáticos de la carpeta issta (nombres de archivos no normalizados)
import imgElectrica from "../../../issta/Electrica Industrial.jpg"
import imgDesarrollo from "../../../issta/Desarrolllo de Sistemas.jpg"
import imgContabilidad from "../../../issta/Contabilidad.jpg"
import imgElectronica from "../../../issta/Electronica.jpg"
import imgAdministracion from "../../../issta/Administracion.jpg"
import imgMecanica from "../../../issta/Mecanica.jpg"
import imgMecanicaProduccion from "../../../issta/Mecanica de Produccion.jpg"
import imgLaboratorio from "../../../issta/Laboratorio Clinico.jpg"
import imgGuiaTurismo from "../../../issta/Gia Oficial de Turismo.jpg"
import imgEnfermeria from "../../../issta/Enfermeria Tecnica.jpg"

// Mapa manual slug -> imagen (se eligió la más representativa cuando hay ambigüedad)
// Nota: algunos nombres difieren de los oficiales (acentos, palabras faltantes) y se mapearon manualmente.
const IMG_MAP: Record<string, string> = {
  "desarrollo-de-sistemas-de-informacion": imgDesarrollo,
  "electronica-industrial": imgElectronica,
  "electricidad-industrial": imgElectrica,
  "mecatronica-automotriz": imgMecanica, // No hay archivo específico; uso 'Mecanica.jpg'
  "mecanica-de-produccion-industrial": imgMecanicaProduccion,
  "enfermeria-tecnica": imgEnfermeria,
  "laboratorio-clinico-y-anatomia-patologica": imgLaboratorio,
  "contabilidad": imgContabilidad,
  "guia-oficial-de-turismo": imgGuiaTurismo,
  "administracion-de-servicios-de-hosteleria-y-restaurantes": imgAdministracion,
}

function ProgramCard({ nombre, descripcion }: { nombre: string; descripcion: string }) {
  const slug = toSlug(nombre)
  const mapped = IMG_MAP[slug]
  // Fallback a placeholder embebido si no hay imagen mapeada
  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-video w-full bg-muted relative">
        <img
          loading="lazy"
          src={mapped || "/programas/placeholder.svg"}
          alt={`Imagen representativa del programa ${nombre}`}
          onError={(e) => {
            const img = e.currentTarget
            if (img.src.endsWith("placeholder.svg")) return
            img.onerror = null
            img.src = "/programas/placeholder.svg"
          }}
          className="h-full w-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm md:text-base text-center">{nombre}</h3>
        <p className="text-xs md:text-sm text-muted-foreground mt-2 line-clamp-3 text-center">
          {descripcion}
        </p>
      </CardContent>
    </Card>
  )
}

function Row({ title, items }: { title: string; items: ProgInfo[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const scrollBy = (dir: -1 | 1) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * (el.clientWidth * 0.9), behavior: "smooth" })
  }
  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const targets = ref.current?.querySelectorAll('[data-program-card]')
            if (targets && targets.length) {
              animate(targets as unknown as Element, {
                opacity: [0,1],
                translateY: [24,0],
                duration: 600,
                delay: stagger(90),
                easing: 'easeOutQuad'
              })
              observer.disconnect()
            }
          }
        })
      },
      { threshold: 0.2 }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-sm text-amber-500 font-semibold tracking-wide">NUESTROS PROGRAMAS DE ESTUDIO</div>
          <h3 className="text-xl md:text-2xl font-bold">GRUPO {title}</h3>
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="outline" onClick={() => scrollBy(-1)} aria-label="Anterior">
            ‹
          </Button>
          <Button size="icon" variant="outline" onClick={() => scrollBy(1)} aria-label="Siguiente">
            ›
          </Button>
        </div>
      </div>
      <div ref={ref} className="flex gap-4 overflow-x-auto scroll-smooth pb-2">
        {items.map((it) => (
          <div
            key={it.nombre}
            data-program-card
            className="min-w-[260px] sm:min-w-[300px] lg:min-w-[340px] opacity-0"
          >
            <ProgramCard nombre={it.nombre} descripcion={it.descripcion} />
          </div>
        ))}
      </div>
    </section>
  )
}

export default function ProgramasGroupedSection() {
  const [apiItems, setApiItems] = useState<ProgramaRead[] | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await getProgramas()
        if (mounted) setApiItems(res)
      } catch {
        if (mounted) setApiItems(null)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  // Si responde la API, cruzamos por nombre para conservar grupo/descripcion; si no, usamos base
  const items = useMemo(() => {
    // Normaliza para comparar sin tildes/espacios/caso
    const norm = (s: string) =>
      s
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim()

    if (!apiItems) return PROGRAMAS_BASE

    const baseNames = new Set(PROGRAMAS_BASE.map((p) => norm(p.nombre)))
    // Unimos BASE + extras de API que no existan en base
    const extras: ProgInfo[] = apiItems
      .filter((p) => !baseNames.has(norm(p.nombrePrograma)))
      .map((p) => ({ nombre: p.nombrePrograma, descripcion: "", grupo: "C" as const }))

    return [...PROGRAMAS_BASE, ...extras]
  }, [apiItems])

  const groupA = items.filter((i) => i.grupo === "A")
  const groupB = items.filter((i) => i.grupo === "B")
  const groupC = items.filter((i) => i.grupo === "C")

  return (
    <section id="programas-por-grupo" className="max-w-6xl mx-auto px-4 py-12 md:py-16 space-y-10">
      <Row title="A" items={groupA} />
      <Row title="B" items={groupB} />
      <Row title="C" items={groupC} />
    </section>
  )
}
