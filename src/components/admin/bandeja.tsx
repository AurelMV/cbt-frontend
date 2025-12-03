import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  User,
  CreditCard,
  Calendar,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle2,
  XCircle,
  School,
  GraduationCap,
  AlertCircle,
  Search,
  ExternalLink,
} from "lucide-react";
import {
  aprobarPago as apiAprobarPago,
  aprobarPreinscripcion as apiAprobarPre,
  getCounts,
  listPagosPendientes,
  listPreinsPendientes,
  rechazarPago as apiRechazarPago,
  rechazarPreinscripcion as apiRechazarPre,
  type BandejaPagoItem,
  type BandejaPreItem,
} from "@/services/bandeja";
import { getCiclos } from "@/services/ciclos";
import { getProgramas } from "@/services/programas";
import { api } from "@/services/http";

type PaginatedResult<T> = {
  items: T[];
  pages: number;
};

async function fetchAllPaginated<T>(path: string): Promise<T[]> {
  const out: T[] = [];
  const limit = 100;
  let page = 0;
  while (true) {
    const separator = path.includes("?") ? "&" : "?";
    const url = `${path}${separator}page=${page}&limit=${limit}`;
    const res = await api.get<PaginatedResult<T> | T[]>(url, {
      silentError: true,
    });
    if (Array.isArray(res)) {
      out.push(...res);
      break;
    }
    const items = Array.isArray(res.items) ? res.items : [];
    out.push(...items);
    const pages = typeof res.pages === "number" ? res.pages : 0;
    page += 1;
    if (page >= pages) {
      break;
    }
  }
  return out;
}

type Grupo = { id: number; nombreGrupo: string; ciclo_id: number; estado: boolean };
type Clase = { id: number; codigoClase: string; grupo_id: number };

type ButtonVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "ghost"
  | "link"
  | "outline";
type ButtonSize = "default" | "sm" | "lg" | "icon";

export function BandejaButton({
  label = "Bandeja",
  variant = "secondary",
  size = "default",
  className,
  icon,
  trigger,
}: Readonly<{
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  icon?: React.ReactNode;
  trigger?: React.ReactNode;
}>) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("inscripciones");
  const [searchTerm, setSearchTerm] = useState("");

  // Datos reales desde backend
  const [inscripciones, setInscripciones] = useState<BandejaPreItem[]>([]);
  const [pagos, setPagos] = useState<BandejaPagoItem[]>([]);
  const [counts, setCounts] = useState<{ pre: number; pay: number }>({
    pre: 0,
    pay: 0,
  });
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [clases, setClases] = useState<Clase[]>([]);
  const [selGrupoByPre, setSelGrupoByPre] = useState<
    Record<number, number | undefined>
  >({});
  const [selClaseByPre, setSelClaseByPre] = useState<
    Record<number, number | undefined>
  >({});
  const [ciclos, setCiclos] = useState<
    Array<{ id: number; nombreCiclo: string }>
  >([]);
  const [programas, setProgramas] = useState<
    Array<{ id: number; nombrePrograma: string }>
  >([]);

  const [cicloFiltroPagos, setCicloFiltroPagos] = useState<string>("all");
  
  const cicloNombre = useMemo(
    () => Object.fromEntries(ciclos.map((c) => [c.id, c.nombreCiclo])),
    [ciclos]
  );

  const programaNombre = useMemo(
    () => Object.fromEntries(programas.map((p) => [p.id, p.nombrePrograma])),
    [programas]
  );

  const inscripcionesFiltradas = useMemo(() => {
    if (!searchTerm) return inscripciones;
    const lower = searchTerm.toLowerCase();
    return inscripciones.filter(({ preinscripcion: pre }) => 
      pre.nombreAlumno.toLowerCase().includes(lower) ||
      pre.aPaterno.toLowerCase().includes(lower) ||
      pre.aMaterno.toLowerCase().includes(lower) ||
      pre.nroDocumento.includes(lower)
    );
  }, [inscripciones, searchTerm]);

  const pagosFiltrados = useMemo(
    () =>
      pagos
        .filter(
          (p) =>
            cicloFiltroPagos === "all" ||
            (p.inscripcion?.idCiclo &&
              String(p.inscripcion.idCiclo) === cicloFiltroPagos)
        )
        .sort(
          (a, b) =>
            new Date(b.pago.fecha).getTime() - new Date(a.pago.fecha).getTime()
        ),
    [pagos, cicloFiltroPagos]
  );
  const pendingInsCount = counts.pre;
  const pendingPayCount = counts.pay;
  const totalPending = pendingInsCount + pendingPayCount;

  const reloadAll = async () => {
    try {
      const [c, pre, pay, cg, cc, ci, prog] = await Promise.all([
        getCounts(),
        listPreinsPendientes(),
        listPagosPendientes(),
        fetchAllPaginated<Grupo>("/grupos/"),
        fetchAllPaginated<Clase>("/clases/"),
        getCiclos(),
        getProgramas(),
      ]);
      setCounts({ pre: c.preinscripcionesPendientes, pay: c.pagosPendientes });
      setInscripciones(pre);
      setPagos(pay);
      setGrupos(cg);
      setClases(cc);
      setCiclos(ci);
      setProgramas(prog);
    } catch (error) {
      console.error("No se pudo cargar la bandeja", error);
      toast.error("No se pudo cargar la bandeja");
    }
  };

  useEffect(() => {
    if (open) reloadAll();
  }, [open]);

  const aprobarInscripcion = async (
    preId: number,
    idGrupo: number | undefined,
    idClase: number | undefined
  ) => {
    try {
      if (!idGrupo || !idClase) {
        toast.error("Falta seleccionar grupo y clase");
        return;
      }
      await apiAprobarPre(preId, { idGrupo, idClase });
      toast.success("Inscripción aprobada");
      await reloadAll();
    } catch {
      toast.error("No se pudo aprobar la inscripción");
    }
  };
  const rechazarInscripcion = async (preId: number) => {
    try {
      await apiRechazarPre(preId);
      toast.success("Inscripción rechazada");
      await reloadAll();
    } catch {
      toast.error("No se pudo rechazar");
    }
  };

  const aprobarPago = async (id: number, nombre?: string) => {
    try {
      await apiAprobarPago(id);
      toast.success("Pago aprobado", {
        description: nombre ? `De ${nombre}` : undefined,
      });
      await reloadAll();
    } catch {
      toast.error("No se pudo aprobar el pago");
    }
  };
  const desaprobarPago = async (id: number) => {
    try {
      await apiRechazarPago(id);
      toast.success("Pago rechazado");
      await reloadAll();
    } catch {
      toast.error("No se pudo rechazar el pago");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <div className="relative inline-flex w-full">
            {trigger ?? (
              <Button variant={variant} size={size} className={className}>
                {icon}
                {size === "icon" ? (
                  <span className="sr-only">{label}</span>
                ) : (
                  label
                )}
              </Button>
            )}
            {totalPending > 0 && (
              <Badge
                variant="default"
                className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-[10px] leading-4"
              >
                {totalPending}
              </Badge>
            )}
          </div>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-3xl flex flex-col h-full p-0 gap-0">
          <div className="p-6 border-b">
            <SheetHeader>
              <SheetTitle className="text-2xl">Bandeja de revisión</SheetTitle>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col p-6">
            <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="inscripciones" className="relative">
                    Inscripciones
                    {pendingInsCount > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">{pendingInsCount}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="pagos" className="relative">
                    Pagos
                    {pendingPayCount > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">{pendingPayCount}</Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="inscripciones" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre o DNI..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="rounded-md border flex-1 overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead>Estudiante</TableHead>
                        <TableHead>DNI</TableHead>
                        <TableHead>Programa</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inscripcionesFiltradas.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            No hay inscripciones pendientes.
                          </TableCell>
                        </TableRow>
                      ) : (
                        inscripcionesFiltradas.map(({ preinscripcion: pre, prepagos }) => {
                          const gruposCiclo = grupos.filter(
                            (g) => g.ciclo_id === pre.idCiclo
                          );
                          const selGrupo = selGrupoByPre[pre.id];
                          const clasesGrupo = clases.filter(
                            (c) => c.grupo_id === (selGrupo ?? -1)
                          );
                          const selClase = selClaseByPre[pre.id];
                          return (
                            <TableRow key={pre.id}>
                              <TableCell className="font-medium">
                                <div className="flex flex-col">
                                  <span>{pre.nombreAlumno} {pre.aPaterno}</span>
                                  <span className="text-xs text-muted-foreground">{pre.aMaterno}</span>
                                </div>
                              </TableCell>
                              <TableCell>{pre.nroDocumento}</TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <Badge variant="outline" className="w-fit">
                                    {programaNombre[pre.idPrograma] ?? pre.idPrograma}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {cicloNombre[pre.idCiclo] ?? pre.idCiclo}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Sheet>
                                  <SheetTrigger asChild>
                                    <Button size="sm">
                                      Revisar
                                    </Button>
                                  </SheetTrigger>
                                  <SheetContent
                                    side="right"
                                    className="w-full sm:max-w-2xl flex flex-col h-full p-0 gap-0"
                                  >
                                    <div className="p-6 border-b bg-muted/10">
                                      <SheetHeader>
                                        <div className="flex items-center justify-between">
                                          <SheetTitle className="text-xl font-bold flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-primary" />
                                            Solicitud #{pre.id}
                                          </SheetTitle>
                                          <Badge variant="outline" className="text-sm px-3 py-1 bg-background">
                                            {pre.fechaNacimiento}
                                          </Badge>
                                        </div>
                                      </SheetHeader>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                      {/* Programa y Ciclo - Destacado */}
                                      <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Programa</span>
                                            <div className="text-lg font-bold text-primary mt-1 flex items-center gap-2">
                                              <GraduationCap className="h-5 w-5" />
                                              {programaNombre[pre.idPrograma] ?? pre.idPrograma}
                                            </div>
                                          </div>
                                          <div>
                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ciclo Académico</span>
                                            <div className="text-lg font-semibold mt-1 flex items-center gap-2">
                                              <Calendar className="h-5 w-5 text-muted-foreground" />
                                              {cicloNombre[pre.idCiclo] ?? pre.idCiclo}
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Datos del Estudiante */}
                                      <Card>
                                        <CardHeader className="pb-3">
                                          <CardTitle className="text-base font-medium flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Información del Estudiante
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                          <div className="col-span-2">
                                            <span className="text-muted-foreground text-xs">Nombre Completo</span>
                                            <div className="font-medium text-base">{pre.nombreAlumno} {pre.aPaterno} {pre.aMaterno}</div>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground text-xs">DNI / Documento</span>
                                            <div className="font-medium">{pre.nroDocumento}</div>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground text-xs">Sexo</span>
                                            <div className="font-medium">{pre.sexo === 'M' ? 'Masculino' : 'Femenino'}</div>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground text-xs flex items-center gap-1"><Mail className="h-3 w-3" /> Email</span>
                                            <div className="font-medium truncate" title={pre.email}>{pre.email}</div>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground text-xs flex items-center gap-1"><Phone className="h-3 w-3" /> Teléfono</span>
                                            <div className="font-medium">{pre.telefonoEstudiante}</div>
                                          </div>
                                          <div className="col-span-2">
                                            <span className="text-muted-foreground text-xs flex items-center gap-1"><MapPin className="h-3 w-3" /> Dirección</span>
                                            <div className="font-medium">{pre.Direccion}</div>
                                          </div>
                                        </CardContent>
                                      </Card>

                                      {/* Prepagos */}
                                      <Card>
                                        <CardHeader className="pb-3">
                                          <CardTitle className="text-base font-medium flex items-center gap-2">
                                            <CreditCard className="h-4 w-4" />
                                            Detalles del Pago
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          {prepagos.length === 0 ? (
                                            <div className="text-center py-4 text-muted-foreground flex flex-col items-center gap-2">
                                              <AlertCircle className="h-8 w-8 opacity-50" />
                                              <span>No se registraron pagos previos</span>
                                            </div>
                                          ) : (
                                            <div className="space-y-4">
                                              {prepagos.map((pp) => (
                                                <div key={pp.id} className="flex flex-col gap-4 p-4 rounded-md border bg-muted/30">
                                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                      <span className="text-xs text-muted-foreground">Voucher</span>
                                                      <div className="font-mono font-medium">{pp.nroVoucher}</div>
                                                    </div>
                                                    <div>
                                                      <span className="text-xs text-muted-foreground">Monto</span>
                                                      <div className="font-bold text-green-600">S/ {pp.monto.toFixed(2)}</div>
                                                    </div>
                                                    <div>
                                                      <span className="text-xs text-muted-foreground">Fecha</span>
                                                      <div>{pp.fecha}</div>
                                                    </div>
                                                    <div>
                                                      <span className="text-xs text-muted-foreground">Medio</span>
                                                      <div className="capitalize">{pp.medioPago}</div>
                                                    </div>
                                                  </div>
                                                  {pp.foto && (
                                                    <div className="mt-2">
                                                      <p className="text-xs font-medium text-muted-foreground mb-2">Comprobante:</p>
                                                      <div className="relative overflow-hidden rounded-lg border bg-white flex justify-center group">
                                                        <img
                                                          src={pp.foto}
                                                          alt="Voucher"
                                                          className="max-h-[300px] w-auto object-contain"
                                                        />
                                                        <Button
                                                          variant="secondary"
                                                          size="sm"
                                                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                          onClick={() => window.open(pp.foto!, '_blank')}
                                                        >
                                                          <ExternalLink className="h-4 w-4 mr-2" />
                                                          Abrir original
                                                        </Button>
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </CardContent>
                                      </Card>

                                      {/* Asignación */}
                                      <Card className="border-primary/20 shadow-sm">
                                        <CardHeader className="pb-3 bg-primary/5">
                                          <CardTitle className="text-base font-medium flex items-center gap-2 text-primary">
                                            <School className="h-4 w-4" />
                                            Asignación Académica
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                              <label className="text-sm font-medium">Grupo</label>
                                              <Select
                                                value={selGrupo ? String(selGrupo) : undefined}
                                                onValueChange={(v) => {
                                                  const g = Number(v);
                                                  setSelGrupoByPre((s) => ({ ...s, [pre.id]: g }));
                                                  setSelClaseByPre((s) => ({ ...s, [pre.id]: undefined }));
                                                }}
                                              >
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Seleccionar Grupo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {gruposCiclo.filter(g => g.estado).map((g) => (
                                                    <SelectItem key={g.id} value={String(g.id)}>
                                                      {g.nombreGrupo}
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                              <p className="text-[10px] text-muted-foreground">Solo se muestran grupos activos</p>
                                            </div>
                                            <div className="space-y-2">
                                              <label className="text-sm font-medium">Clase</label>
                                              <Select
                                                value={selClase ? String(selClase) : undefined}
                                                disabled={!selGrupo}
                                                onValueChange={(v) => {
                                                  const c = Number(v);
                                                  setSelClaseByPre((s) => ({ ...s, [pre.id]: c }));
                                                }}
                                              >
                                                <SelectTrigger>
                                                  <SelectValue placeholder={selGrupo ? "Seleccionar Clase" : "Primero elija grupo"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {clasesGrupo.map((c) => (
                                                    <SelectItem key={c.id} value={String(c.id)}>
                                                      {c.codigoClase}
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>

                                    <div className="p-6 border-t bg-background mt-auto">
                                      <div className="flex gap-3">
                                        <Button
                                          className="flex-1 gap-2"
                                          onClick={() => aprobarInscripcion(pre.id, selGrupo, selClase)}
                                          disabled={!selGrupo || !selClase}
                                        >
                                          <CheckCircle2 className="h-4 w-4" />
                                          Aprobar Inscripción
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          className="flex-1 gap-2"
                                          onClick={() => rechazarInscripcion(pre.id)}
                                        >
                                          <XCircle className="h-4 w-4" />
                                          Rechazar
                                        </Button>
                                      </div>
                                    </div>
                                  </SheetContent>
                                </Sheet>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="pagos" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium" htmlFor="cicloFiltro">
                      Filtrar por Ciclo:
                    </label>
                    <Select
                      value={cicloFiltroPagos}
                      onValueChange={setCicloFiltroPagos}
                    >
                      <SelectTrigger id="cicloFiltro" className="w-40">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="2025-1">2025-1</SelectItem>
                        <SelectItem value="2025-2">2025-2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="rounded-md border flex-1 overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Comprobante</TableHead>
                        <TableHead>Estudiante</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagosFiltrados.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            No hay pagos pendientes.
                          </TableCell>
                        </TableRow>
                      ) : (
                        pagosFiltrados.map((item) => (
                          <TableRow key={item.pago.id}>
                            <TableCell>{item.pago.fecha}</TableCell>
                            <TableCell className="font-mono">{item.pago.nroVoucher}</TableCell>
                            <TableCell>
                              {item.alumno
                                ? `${item.alumno.nombreAlumno} ${item.alumno.aPaterno}`
                                : "-"}
                            </TableCell>
                            <TableCell className="font-medium">S/ {item.pago.monto.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={item.pago.Estado ? "default" : "secondary"}>
                                {item.pago.Estado ? "Aprobado" : "Pendiente"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Sheet>
                                <SheetTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    Revisar
                                  </Button>
                                </SheetTrigger>
                                <SheetContent
                                  side="right"
                                  className="w-full sm:max-w-2xl flex flex-col h-full p-0 gap-0"
                                >
                                  <div className="p-6 border-b bg-muted/10">
                                    <SheetHeader>
                                      <div className="flex items-center justify-between">
                                        <SheetTitle className="text-xl font-bold flex items-center gap-2">
                                          <CreditCard className="h-5 w-5 text-primary" />
                                          Pago #{item.pago.id}
                                        </SheetTitle>
                                        <Badge variant="outline" className="text-sm px-3 py-1 bg-background">
                                          {item.pago.fecha}
                                        </Badge>
                                      </div>
                                    </SheetHeader>
                                  </div>

                                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {/* Información del Pago */}
                                    <Card>
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-base font-medium">Detalles de la Transacción</CardTitle>
                                      </CardHeader>
                                      <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <span className="text-muted-foreground text-xs">Nro Voucher</span>
                                          <div className="font-mono font-medium text-lg">{item.pago.nroVoucher}</div>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground text-xs">Monto</span>
                                          <div className="font-bold text-xl text-green-600">S/ {item.pago.monto.toFixed(2)}</div>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground text-xs">Medio de Pago</span>
                                          <div className="capitalize font-medium">{item.pago.medioPago}</div>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground text-xs">Estado Actual</span>
                                          <div>
                                            <Badge variant={item.pago.Estado ? "default" : "secondary"}>
                                              {item.pago.Estado ? "Aprobado" : "Pendiente"}
                                            </Badge>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>

                                    {/* Evidencia */}
                                    {item.pago.foto && (
                                      <Card>
                                        <CardHeader className="pb-3">
                                          <CardTitle className="text-base font-medium">Comprobante de Pago</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="relative group overflow-hidden rounded-lg border bg-muted/20 flex justify-center">
                                            <img
                                              src={item.pago.foto}
                                              alt="Comprobante"
                                              className="max-h-[400px] object-contain"
                                            />
                                            <Button
                                              variant="secondary"
                                              size="sm"
                                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                              onClick={() => window.open(item.pago.foto!, '_blank')}
                                            >
                                              <ExternalLink className="h-4 w-4 mr-2" />
                                              Abrir original
                                            </Button>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}

                                    {/* Datos del Estudiante (si existe) */}
                                    {item.alumno && (
                                      <Card>
                                        <CardHeader className="pb-3">
                                          <CardTitle className="text-base font-medium flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Datos del Estudiante
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                          <div className="col-span-2">
                                            <span className="text-muted-foreground text-xs">Nombre Completo</span>
                                            <div className="font-medium">{item.alumno.nombreAlumno} {item.alumno.aPaterno} {item.alumno.aMaterno}</div>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground text-xs">DNI</span>
                                            <div className="font-medium">{item.alumno.nroDocumento}</div>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground text-xs">Código</span>
                                            {/* <div className="font-medium">{item.alumno.codigoAlumno}</div> */}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}
                                  </div>

                                  <div className="p-6 border-t bg-background mt-auto">
                                    <div className="flex gap-3">
                                      <Button
                                        className="flex-1 gap-2"
                                        onClick={() => aprobarPago(item.pago.id, item.alumno?.nombreAlumno)}
                                      >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Aprobar Pago
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        className="flex-1 gap-2"
                                        onClick={() => desaprobarPago(item.pago.id)}
                                      >
                                        <XCircle className="h-4 w-4" />
                                        Rechazar
                                      </Button>
                                    </div>
                                  </div>
                                </SheetContent>
                              </Sheet>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
  );
}
