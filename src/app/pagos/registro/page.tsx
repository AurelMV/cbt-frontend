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
import FileUploader from "@/components/common/file-uploader";
import { toast } from "sonner";
import { getCiclos } from "@/services/ciclos";
import {
  buscarInscripcion,
  type InscripcionLookup,
} from "@/services/inscripciones";
import { crearPago } from "@/services/pagos";

const schema = z.object({
  dni: z
    .string()
    .min(6, "Mínimo 6 caracteres")
    .max(20, "Máximo 20 caracteres")
    .regex(/^[A-Za-z0-9-]+$/g, "Solo letras, números y guiones"),
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
    // Ajuste de tipos por diferencias entre zod v4 y RHF tipos estrictos
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      if (!cicloId || Number.isNaN(cicloId)) throw new Error("Ciclo inválido");
  const data = await buscarInscripcion(dni, cicloId, { silentError: true });
      setPerfil(data);
      toast.success("Datos encontrados", {
        description: `${data.nombreAlumno} ${data.aPaterno} ${data.aMaterno}`,
      });
    } catch {
      setPerfil(null);
      toast.error("No se encontraron datos para el DNI ingresado");
    } finally {
      setLoadingPerfil(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (!perfil)
        throw new Error("Busque y seleccione una inscripción primero");
      // Convertir archivo a base64 (string)
      const file = values.archivo;
      const fotoBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result === "string") return resolve(result);
          reject(new Error("No se pudo leer el archivo"));
        };
        reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
        reader.readAsDataURL(file);
      });

      await crearPago({
        nroVoucher: values.comprobante,
        medioPago: values.banco,
        monto: values.monto,
        fecha: values.fecha,
        idInscripcion: perfil.idInscripcion,
        foto: fotoBase64,
        Estado: false, // pendiente hasta validación
      }, { silentError: true });

      toast.success("Pago registrado", {
        description: `Comprobante ${values.comprobante}`,
      });
      form.reset({ dni: "", ciclo: "", banco: "" });
      setPerfil(null);
    } catch {
      toast.error("No se pudo registrar el pago");
    }
  };

  useEffect(() => {
    // Cargar ciclos para el selector
    const load = async () => {
      try {
        const data = await getCiclos();
        setCiclos(data);
      } catch {
        // no-op
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
      <h1 className="text-2xl md:text-3xl font-semibold">Registro de Pagos</h1>

      <div className="border rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field>
            <FieldLabel htmlFor="dni">DNI</FieldLabel>
            <FieldContent>
              <Input id="dni" {...form.register("dni")} />
              <FieldError errors={[form.formState.errors.dni]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Ciclo</FieldLabel>
            <FieldContent>
              <Select
                value={form.watch("ciclo")}
                onValueChange={(v) =>
                  form.setValue("ciclo", v, { shouldValidate: true })
                }
              >
                <SelectTrigger aria-invalid={!!form.formState.errors.ciclo}>
                  <SelectValue placeholder="Seleccione ciclo" />
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
            </FieldContent>
          </Field>
          <div className="flex items-end">
            <Button
              type="button"
              onClick={buscar}
              disabled={
                loadingPerfil || !form.watch("dni") || !form.watch("ciclo")
              }
            >
              {loadingPerfil ? "Buscando…" : "Buscar"}
            </Button>
          </div>
        </div>
        {perfil && (
          <div className="text-sm text-muted-foreground">
            {perfil.nombreAlumno} {perfil.aPaterno} {perfil.aMaterno}{" "}
            {perfil.Codigo ? `· Código ${perfil.Codigo}` : ""}
          </div>
        )}
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="comprobante">Nº de comprobante</FieldLabel>
              <FieldContent>
                <Input
                  id="comprobante"
                  aria-invalid={!!form.formState.errors.comprobante}
                  {...form.register("comprobante")}
                />
                <FieldError errors={[form.formState.errors.comprobante]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="fecha">Fecha de pago</FieldLabel>
              <FieldContent>
                <Input
                  id="fecha"
                  type="date"
                  aria-invalid={!!form.formState.errors.fecha}
                  {...form.register("fecha")}
                />
                <FieldError errors={[form.formState.errors.fecha]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="monto">Monto</FieldLabel>
              <FieldContent>
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  min="0"
                  aria-invalid={!!form.formState.errors.monto}
                  {...form.register("monto", { valueAsNumber: true })}
                />
                <FieldError errors={[form.formState.errors.monto]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Banco/Proveedor</FieldLabel>
              <FieldContent>
                <Select
                  value={form.watch("banco")}
                  onValueChange={(v) =>
                    form.setValue("banco", v, { shouldValidate: true })
                  }
                >
                  <SelectTrigger aria-invalid={!!form.formState.errors.banco}>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bcp">Transferencia </SelectItem>
                    <SelectItem value="bbva">Deposito</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError errors={[form.formState.errors.banco]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Archivo comprobante (PDF/JPG/PNG ≤ 5MB)</FieldLabel>
              <FieldContent>
                <FileUploader
                  value={form.getValues("archivo") as unknown as File | null}
                  onChange={(f) =>
                    form.setValue("archivo", f as File, {
                      shouldValidate: true,
                    })
                  }
                />
                <FieldError errors={[form.formState.errors.archivo]} />
              </FieldContent>
            </Field>
          </FieldGroup>
        </FieldSet>
        <Button type="submit" disabled={!form.formState.isValid || !perfil}>
          Registrar pago
        </Button>
      </form>
    </div>
  );
}
