import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { motion } from "framer-motion";
import ProgramasGroupedSection from "@/components/sections/programas-grouped";
import { animate, stagger } from "animejs";

export default function Page() {
  return (
    <div className="min-h-svh flex flex-col bg-background text-foreground">
      {/* Barra superior de contacto */}
      <div className="bg-[#7A1D1D] text-white text-xs">
        <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center gap-4 justify-between">
          <div className="flex flex-wrap gap-4">
            <span>☎ (084) 272238</span>
            <span>✉ admin@cbt.edu.pe</span>
            <span>📍 Av. Cusco Nº 496</span>
          </div>
          {/* Botón de inscripción removido: se mantiene acceso desde "Formularios" */}
        </div>
      </div>

      {/* Navbar principal */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2" aria-label="Inicio">
            <div className="size-8 rounded-full bg-primary text-primary-foreground grid place-items-center font-bold">
              CBT
            </div>
            <span className="font-semibold hidden sm:inline">
              Ciclo Básico Tecnológico
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <a href="#hero" className="text-sm hover:underline">
              Inicio
            </a>
            <a href="#nosotros" className="text-sm hover:underline">
              Nosotros
            </a>
            <a href="#ciclos" className="text-sm hover:underline">
              Ciclos
            </a>
            <a href="#grupos" className="text-sm hover:underline">
              Grupos
            </a>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="hidden md:inline-flex"
            >
              <Link to="/login">Iniciar sesión</Link>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button size="sm">Formularios</Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Formularios</SheetTitle>
                </SheetHeader>
                <div className="p-4 flex flex-col gap-3">
                  <Button asChild size="lg" className="justify-start">
                    <Link to="/inscripcion">Inscripción</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    className="justify-start"
                    variant="secondary"
                  >
                    <Link to="/pagos/registro">Registro de Pagos</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section id="hero" className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-linear-to-br from-[#7A1D1D]/80 via-[#7A1D1D]/60 to-transparent"
          aria-hidden
        />
        {/* Overlay respirando */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          initial={{ opacity: 0.15 }}
          animate={{ opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="bg-[radial-gradient(ellipse_at_top_left,rgba(122,29,29,0.2),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(122,29,29,0.15),transparent_50%)]">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative">
            <HeroContent />
            {/* Indicador de scroll */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 bottom-4 text-white/80 text-xs"
              initial={{ y: 0, opacity: 0.8 }}
              animate={{ y: [0, 6, 0], opacity: [0.8, 1, 0.8] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Desplázate
            </motion.div>
          </div>
        </div>
      </section>

      <main className="flex-1">
        {/* Nosotros */}
        <section
          id="nosotros"
          className="max-w-6xl mx-auto px-4 py-12 md:py-16 space-y-8"
        >
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-semibold">Nosotros</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-sm md:text-base">
              Nuestra plataforma educativa te brinda acceso a clases en vivo,
              materiales, simulacros y evaluaciones en línea, con un enfoque
              práctico y docente calificado.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              viewport={{ once: true, margin: "-80px" }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Misión</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Formar estudiantes con visión tecnológica y valores, con
                  metodologías innovadoras y acompañamiento permanente para su
                  ingreso al IEST.
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              viewport={{ once: true, margin: "-80px" }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Visión</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Ser referentes en formación preuniversitaria y pre
                  tecnológica, con excelencia académica y vinculación al
                  entorno.
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                title: "Experiencia",
                desc: "Más de 10 años formando estudiantes.",
              },
              {
                title: "Orientación vocacional",
                desc: "Te guiamos en la elección de tu carrera.",
              },
              {
                title: "Material didáctico",
                desc: "Textos elaborados y clases grabadas.",
              },
              {
                title: "Docentes calificados",
                desc: "Profesionales con amplia experiencia.",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                viewport={{ once: true, margin: "-80px" }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {f.desc}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Programas por grupo */}
        <ProgramasGroupedSection />

        {/* Ciclos */}
        <section id="ciclos" className="bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 space-y-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-center">
              Ciclos disponibles
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  fecha: { d: "02", m: "Enero" },
                  titulo: "Ciclo Intensivo 2025",
                  costo: "Una cuota S/ 600 o Dos cuotas S/ 400 + 250",
                  turno: "Mañana (07:00–13:00)",
                  examenes: "Fechas programadas",
                },
                {
                  fecha: { d: "15", m: "Mayo" },
                  titulo: "Ciclo Ordinario I - 2025",
                  costo: "Una cuota S/ 600 o Dos cuotas",
                  turno: "Tarde (14:00–20:00)",
                  examenes: "Fechas programadas",
                },
              ].map((c, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 6 + i,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Card className="overflow-hidden">
                    <div className="flex">
                      <div className="bg-[#7A1D1D] text-white p-4 grid place-items-center min-w-24">
                        <div className="text-center">
                          <div className="text-2xl font-bold leading-none">
                            {c.fecha.d}
                          </div>
                          <div className="text-xs uppercase tracking-wide">
                            {c.fecha.m}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{c.titulo}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid sm:grid-cols-3 gap-3 text-sm">
                          <div>
                            <div className="font-medium">Costo</div>
                            <div className="text-muted-foreground">
                              {c.costo}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">Turno</div>
                            <div className="text-muted-foreground">
                              {c.turno}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">Exámenes</div>
                            <div className="text-muted-foreground">
                              {c.examenes}
                            </div>
                          </div>
                          <div className="sm:col-span-3 pt-2">
                            <Button asChild>
                              <Link to="/inscripcion">Inscríbete</Link>
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Grupos - reemplazado por Programas por grupo */}
      </main>

      {/* Footer simple */}
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            © {new Date().getFullYear()} CBT - Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-4">
            <a href="#nosotros" className="hover:underline">
              Nosotros
            </a>
            <a href="#ciclos" className="hover:underline">
              Ciclos
            </a>
            <a href="#grupos" className="hover:underline">
              Grupos
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HeroContent() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const paragraphRef = useRef<HTMLParagraphElement | null>(null);
  const buttonsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    animate(titleRef.current as Element, {
      opacity: [0, 1],
      translateY: [32, 0],
      duration: 800,
      easing: "easeOutQuad",
    });
    animate(paragraphRef.current as Element, {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 600,
      easing: "easeOutQuad",
      delay: 200,
    });
    const btns = buttonsRef.current?.querySelectorAll("a, button") ?? [];
    if (btns && (btns as any).length !== 0) {
      animate(btns as unknown as Element, {
        opacity: [0, 1],
        scale: [0.92, 1],
        duration: 500,
        delay: stagger(120, { start: 350 }),
      });
    }

    const btn = buttonsRef.current?.querySelector(
      'a[href="/inscripcion"]'
    ) as HTMLElement | null;
    if (btn) {
      animate(btn, {
        scale: [1, 1.04, 1],
        easing: "easeInOutSine",
        duration: 1600,
        direction: "alternate",
        loop: true,
        delay: 800,
      });
    }
  }, []);

  return (
    <div ref={rootRef} className="text-center text-white space-y-4">
      <h1
        ref={titleRef}
        className="text-3xl md:text-5xl font-semibold tracking-tight opacity-0"
      >
        Prepárate con el CBT
      </h1>
      <p
        ref={paragraphRef}
        className="text-sm md:text-base/relaxed opacity-0 max-w-3xl mx-auto"
      >
        Ingreso directo al IEST – Túpac Amaru vía CBT. Educación personalizada,
        material didáctico y plataformas virtuales.
      </p>
      <div
        ref={buttonsRef}
        className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 opacity-0"
      >
        <Button
          asChild
          size="lg"
          className="bg-amber-400 text-black hover:bg-amber-500"
        >
          <Link to="/inscripcion">Inscribirse</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link to="/pagos/registro">Registrar pago</Link>
        </Button>
      </div>
    </div>
  );
}
