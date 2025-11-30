import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge"; // Opcional, para estados
import {
  Search,
  CreditCard,
  Calendar,
  Banknote,
  UserCheck,
  FileText,
  UploadCloud,
} from "lucide-react"; // Iconos
import FileUploader from "@/components/common/file-uploader";
import { toast } from "sonner";
import { getCiclos } from "@/services/ciclos";
import {
  buscarInscripcion,
  type InscripcionLookup,
} from "@/services/inscripciones";
import { crearPago, downloadComprobantePago } from "@/services/pagos";

// --- TUS SCHEMAS Y TIPOS (INTACTOS) ---
const schema = z.object({
  dni: z
    .string()
    .min(6, "Mínimo 6 caracteres")
    .max(20)
    .regex(/^[A-Za-z0-9-]+$/g),
  ciclo: z.string().min(1, "Seleccione ciclo"),
  comprobante: z.string().min(3, "Requerido"),
  fecha: z.string().refine(
    (v) => {
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return false;
      return d <= new Date();
    },
    { message: "No puede ser futura" }
  ),
  monto: z.coerce.number().positive("Monto inválido"),
  banco: z.string().min(1, "Seleccione una opción"),
  archivo: z
    .instanceof(File)
    .refine((f) => f.size <= 5 * 1024 * 1024, { message: "Máx 5MB" })
    .refine(
      (f) => ["application/pdf", "image/jpeg", "image/png"].includes(f.type),
      { message: "Formato inválido" }
    ),
});

type FormValues = z.infer<typeof schema>;

export default function Page() {
  // --- TU LÓGICA DE ESTADO (INTACTA) ---
  const [perfil, setPerfil] = useState<InscripcionLookup | null>(null);
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const [ciclos, setCiclos] = useState<
    Array<{ id: number; nombreCiclo: string }>
  >([]);

  const cicloOptions = useMemo(
    () => ciclos.map((c) => ({ value: String(c.id), label: c.nombreCiclo })),
    [ciclos]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { dni: "", ciclo: "", banco: "" },
    mode: "onChange",
  });

  const buscar = async () => {
    setLoadingPerfil(true);
    try {
      const dni = form.getValues("dni");
      const cicloIdStr = form.getValues("ciclo");
      const cicloId = Number(cicloIdStr);
      if (!cicloId || Number.isNaN(cicloId)) {
        toast.error("Seleccione un ciclo primero");
        return;
      }
      const data = await buscarInscripcion(dni, cicloId, { silentError: true });
      setPerfil(data);
      toast.success("Alumno encontrado");
    } catch {
      setPerfil(null);
      toast.error("No se encontraron datos", {
        description: "Verifique el DNI y el Ciclo seleccionado.",
      });
    } finally {
      setLoadingPerfil(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    // ... (Tu misma lógica de submit, copiada tal cual) ...
    try {
      if (!perfil)
        throw new Error("Busque y seleccione una inscripción primero");

      const file = values.archivo;
      const fotoBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result === "string") return resolve(result);
          reject(new Error("Error lectura archivo"));
        };
        reader.onerror = () => reject(new Error("Error lectura archivo"));
        reader.readAsDataURL(file);
      });

      const pago = await crearPago(
        {
          nroVoucher: values.comprobante,
          medioPago: values.banco,
          monto: values.monto,
          fecha: values.fecha,
          idInscripcion: perfil.idInscripcion,
          foto: fotoBase64,
          Estado: false,
        },
        { silentError: true }
      );

      try {
        await downloadComprobantePago(pago.id);
        toast.success("Pago registrado exitosamente");
      } catch (err) {
        toast.warning("Pago registrado, error al descargar PDF");
      }

      form.reset({ dni: "", ciclo: "", banco: "" });
      setPerfil(null);
    } catch {
      toast.error("Error al registrar el pago");
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCiclos();
        setCiclos(data);
      } catch {}
    };
    load();
  }, []);

  // --- NUEVA ESTRUCTURA VISUAL ---
  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Encabezado */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-600/20 text-white">
            <Banknote className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Registro de Pagos
            </h1>
            <p className="text-muted-foreground">
              Busque al estudiante y registre la transacción.
            </p>
          </div>
        </div>

        {/* PARTE 1: BÚSQUEDA (CARD) */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-500" />
              Paso 1: Buscar Inscripción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* Select Ciclo */}
              <div className="md:col-span-5">
                <Field>
                  <FieldLabel>Ciclo Académico</FieldLabel>
                  <Select
                    value={form.watch("ciclo")}
                    onValueChange={(v) =>
                      form.setValue("ciclo", v, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger
                      aria-invalid={!!form.formState.errors.ciclo}
                      className="h-10"
                    >
                      <SelectValue placeholder="Seleccione ciclo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cicloOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[form.formState.errors.ciclo]} />
                </Field>
              </div>

              {/* Input DNI */}
              <div className="md:col-span-4">
                <Field>
                  <FieldLabel htmlFor="dni">DNI del Alumno</FieldLabel>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dni"
                      className="pl-9 h-10"
                      placeholder="Ingrese DNI"
                      {...form.register("dni")}
                      onKeyDown={(e) => e.key === "Enter" && buscar()}
                    />
                  </div>
                  <FieldError errors={[form.formState.errors.dni]} />
                </Field>
              </div>

              {/* Botón Buscar */}
              <div className="md:col-span-3 pt-6 md:pt-[22px]">
                {" "}
                {/* Ajuste fino para alinear con inputs */}
                <Button
                  type="button"
                  onClick={buscar}
                  disabled={loadingPerfil}
                  className="w-full h-10 bg-blue-600 hover:bg-blue-700"
                >
                  {loadingPerfil ? "Buscando..." : "Buscar Alumno"}
                </Button>
              </div>
            </div>

            {/* RESULTADO DE LA BÚSQUEDA (FEEDBACK VISUAL) */}
            {perfil && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                <div className="bg-white p-2 rounded-full border border-blue-100">
                  <UserCheck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 text-lg">
                    {perfil.nombreAlumno} {perfil.aPaterno} {perfil.aMaterno}
                  </h4>
                  <div className="flex gap-2 text-sm text-blue-700">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Código:{" "}
                      <span className="font-mono font-medium">
                        {perfil.Codigo || "S/C"}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="ml-auto">
                  <Badge
                    variant="secondary"
                    className="bg-white text-blue-700 border-blue-200"
                  >
                    Inscripción Activa
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PARTE 2: FORMULARIO DE PAGO (SOLO VISIBLE SI HAY PERFIL O SIEMPRE VISIBLE PERO DESHABILITADO) */}
        <div
          className={
            !perfil
              ? "opacity-50 pointer-events-none grayscale transition-all duration-300"
              : "transition-all duration-300"
          }
        >
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  Paso 2: Detalles de la Transacción
                </CardTitle>
                <CardDescription>
                  Ingrese los datos del comprobante bancario.
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fila 1: Voucher y Banco */}
                <Field>
                  <FieldLabel htmlFor="comprobante">
                    Nº de Operación / Voucher
                  </FieldLabel>
                  <Input
                    id="comprobante"
                    placeholder="Ej. 1234567"
                    {...form.register("comprobante")}
                  />
                  <FieldError errors={[form.formState.errors.comprobante]} />
                </Field>

                <Field>
                  <FieldLabel>Banco / Método</FieldLabel>
                  <Select
                    value={form.watch("banco")}
                    onValueChange={(v) =>
                      form.setValue("banco", v, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger aria-invalid={!!form.formState.errors.banco}>
                      <SelectValue placeholder="Seleccione método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bcp">BCP / Transferencia</SelectItem>
                      <SelectItem value="bbva">BBVA / Depósito</SelectItem>
                      <SelectItem value="interbank">Interbank</SelectItem>
                      <SelectItem value="efectivo">Efectivo / Caja</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[form.formState.errors.banco]} />
                </Field>

                {/* Fila 2: Fecha y Monto */}
                <Field>
                  <FieldLabel htmlFor="fecha">Fecha de Pago</FieldLabel>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fecha"
                      type="date"
                      className="pl-9"
                      {...form.register("fecha")}
                    />
                  </div>
                  <FieldError errors={[form.formState.errors.fecha]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="monto">Monto Pagado</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-semibold text-sm">
                      S/.
                    </span>
                    <Input
                      id="monto"
                      type="number"
                      step="0.01"
                      className="pl-8 font-mono text-lg" // Letra un poco más grande para el dinero
                      placeholder="0.00"
                      {...form.register("monto", { valueAsNumber: true })}
                    />
                  </div>
                  <FieldError errors={[form.formState.errors.monto]} />
                </Field>

                {/* Fila 3: Archivo (Ancho completo) */}
                <div className="md:col-span-2">
                  <Field>
                    <FieldLabel className="flex items-center gap-2">
                      <UploadCloud className="w-4 h-4" />
                      Evidencia de Pago (Imagen o PDF)
                    </FieldLabel>
                    <div className="mt-2">
                      <FileUploader
                        value={
                          form.getValues("archivo") as unknown as File | null
                        }
                        onChange={(f) =>
                          form.setValue("archivo", f as File, {
                            shouldValidate: true,
                          })
                        }
                      />
                    </div>
                    <FieldError errors={[form.formState.errors.archivo]} />
                  </Field>
                </div>
              </CardContent>
              <div className="p-6 bg-gray-50/50 flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 gap-2"
                  disabled={!form.formState.isValid || !perfil}
                >
                  <CreditCard className="w-4 h-4" />
                  Confirmar y Registrar Pago
                </Button>
              </div>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
