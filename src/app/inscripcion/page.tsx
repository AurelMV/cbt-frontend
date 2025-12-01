import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldContent,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import {
  User,
  MapPin,
  GraduationCap,
  CreditCard,
  Save,
  Eraser,
} from "lucide-react"; // Iconos para darle vida
import FileUploader from "@/components/common/file-uploader";

// ... TUS IMPORTACIONES DE SERVICIOS (Mantenlas igual) ...
import { type ProgramaRead } from "@/services/programas";
import { getCiclos, type Ciclo } from "@/services/ciclos";
import { getGruposPorCiclo, type Grupo } from "@/services/grupos";
import {
  getDepartamentos,
  getProvinciasPorDepartamento,
  getDistritosPorProvincia,
  getColegiosPorDistrito,
  type Departamento,
  type Distrito,
  type Provincia,
  type Colegio,
} from "@/services/ubicacion";
import {
  createPreinscripcion,
  downloadComprobante,
} from "@/services/preinscripciones";

// ... TU SCHEMA ZOD (Mantenlo igual) ...
const schema = z.object({
  // ... (tu código del schema aquí) ...
  // Para ahorrar espacio en la respuesta asumo que el schema es el mismo de tu código original
  nroDocumento: z.string().min(8).max(12).regex(/^\d+$/g),
  nombreAlumno: z.string().min(2).max(100),
  aPaterno: z.string().min(2).max(100),
  aMaterno: z.string().min(2).max(100),
  fechaNacimiento: z
    .string()
    .refine((v) => !Number.isNaN(new Date(v).getTime())),
  sexo: z.enum(["M", "F"]).default("M"),
  email: z.string().email(),
  telefonoEstudiante: z.string().min(7).max(15),
  telefonoApoderado: z.string().min(7).max(15),
  Direccion: z.string().min(3).max(200),
  anoCulminado: z.coerce.number().int(),
  departamento_id: z.coerce.number(),
  provincia_id: z.coerce.number(),
  distrito_id: z.coerce.number(),
  idColegio: z.coerce.number(),
  idPrograma: z.coerce.number(),
  idCiclo: z.coerce.number(),
  grupoId: z.coerce.number().optional(),
  nroVoucher: z.string().min(3),
  medioPago: z
    .enum(["deposito", "transferencia", "yape", "plin"])
    .default("deposito"),
  monto: z.coerce.number().positive(),
  fechaPago: z.string(),
  TipoPago: z
    .enum(["matricula", "mensualidad", "inscripcion"])
    .default("inscripcion"),
  documento: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function Page() {
  // ... TUS ESTADOS Y HOOKS (Mantenlos igual) ...
  const [submitting, setSubmitting] = useState(false);
  const [programas, setProgramas] = useState<ProgramaRead[]>([]);
  // ... resto de estados ...

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      sexo: "M",
      medioPago: "deposito",
      TipoPago: "inscripcion",
    },
    mode: "onChange",
  });

  // ... TUS USE EFFECT (Mantenlos igual, son vitales) ...
  // (Omití el código repetitivo de los useEffect para centrarme en el diseño,
  //  pero asume que aquí va todo tu código de carga de datos)

  // Dummy logic para que el ejemplo compile sin los servicios reales
  // En tu código real, NO BORRES tus useEffects.

  const onSubmit = async (values: FormValues) => {
    // ... TU LOGICA DE SUBMIT IGUAL ...
    console.log(values);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Principal */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Formulario de Inscripción
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete la información requerida para formalizar su matrícula.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => form.reset()}
              className="gap-2"
            >
              <Eraser className="w-4 h-4" /> Limpiar
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={submitting || !form.formState.isValid}
              className="gap-2"
            >
              {submitting ? (
                "Procesando..."
              ) : (
                <>
                  <Save className="w-4 h-4" /> Guardar Inscripción
                </>
              )}
            </Button>
          </div>
        </div>

        <form className="space-y-8">
          {/* SECCIÓN 1: DATOS PERSONALES */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Datos Personales</CardTitle>
                  <CardDescription>
                    Información básica del estudiante.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* DNI - Ocupa menos espacio */}
                <div className="md:col-span-4">
                  <Field>
                    <FieldLabel htmlFor="nroDocumento">DNI</FieldLabel>
                    <FieldContent>
                      <Input
                        id="nroDocumento"
                        placeholder="12345678"
                        {...form.register("nroDocumento")}
                      />
                      <FieldError
                        errors={[form.formState.errors.nroDocumento]}
                      />
                    </FieldContent>
                  </Field>
                </div>

                {/* Fecha Nacimiento */}
                <div className="md:col-span-4">
                  <Field>
                    <FieldLabel htmlFor="fechaNacimiento">
                      Fecha de Nacimiento
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="fechaNacimiento"
                        type="date"
                        {...form.register("fechaNacimiento")}
                      />
                      <FieldError
                        errors={[form.formState.errors.fechaNacimiento]}
                      />
                    </FieldContent>
                  </Field>
                </div>

                {/* Sexo */}
                <div className="md:col-span-4">
                  <Field>
                    <FieldLabel>Sexo</FieldLabel>
                    <Select
                      value={form.watch("sexo")}
                      onValueChange={(v) => form.setValue("sexo", v as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Femenino</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                {/* Nombres y Apellidos */}
                <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field>
                    <FieldLabel>Nombres</FieldLabel>
                    <Input {...form.register("nombreAlumno")} />
                  </Field>
                  <Field>
                    <FieldLabel>Apellido Paterno</FieldLabel>
                    <Input {...form.register("aPaterno")} />
                  </Field>
                  <Field>
                    <FieldLabel>Apellido Materno</FieldLabel>
                    <Input {...form.register("aMaterno")} />
                  </Field>
                </div>

                {/* Contacto */}
                <div className="md:col-span-6">
                  <Field>
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      {...form.register("email")}
                    />
                  </Field>
                </div>
                <div className="md:col-span-3">
                  <Field>
                    <FieldLabel>Tel. Estudiante</FieldLabel>
                    <Input {...form.register("telefonoEstudiante")} />
                  </Field>
                </div>
                <div className="md:col-span-3">
                  <Field>
                    <FieldLabel>Tel. Apoderado</FieldLabel>
                    <Input {...form.register("telefonoApoderado")} />
                  </Field>
                </div>

                <div className="md:col-span-12">
                  <Field>
                    <FieldLabel>Dirección</FieldLabel>
                    <Input {...form.register("Direccion")} />
                  </Field>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECCIÓN 2: UBICACIÓN Y COLEGIO */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Procedencia</CardTitle>
                  <CardDescription>
                    Ubicación y colegio de origen.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Field>
                  <FieldLabel>Departamento</FieldLabel>
                  <Select
                    value={String(form.watch("departamento_id") ?? "")}
                    onValueChange={(v) =>
                      form.setValue("departamento_id", Number(v))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Aquí van tus departamentos.map... */}
                      <SelectItem value="1">Ejemplo Dept</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Provincia</FieldLabel>
                  <Select
                    value={String(form.watch("provincia_id") ?? "")}
                    onValueChange={(v) =>
                      form.setValue("provincia_id", Number(v))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>{/* TUS PROVINCIAS */}</SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Distrito</FieldLabel>
                  <Select
                    value={String(form.watch("distrito_id") ?? "")}
                    onValueChange={(v) =>
                      form.setValue("distrito_id", Number(v))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>{/* TUS DISTRITOS */}</SelectContent>
                  </Select>
                </Field>

                <div className="md:col-span-2">
                  <Field>
                    <FieldLabel>Colegio de Procedencia</FieldLabel>
                    <Select
                      value={String(form.watch("idColegio") ?? "")}
                      onValueChange={(v) =>
                        form.setValue("idColegio", Number(v))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione colegio..." />
                      </SelectTrigger>
                      <SelectContent>{/* TUS COLEGIOS */}</SelectContent>
                    </Select>
                  </Field>
                </div>

                <Field>
                  <FieldLabel>Año de Culminación</FieldLabel>
                  <Input type="number" {...form.register("anoCulminado")} />
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* SECCIÓN 3: ACADÉMICO */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Información Académica</CardTitle>
                  <CardDescription>
                    Programa y ciclo al que postula.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field>
                  <FieldLabel>Programa de Estudio</FieldLabel>
                  <Select
                    value={String(form.watch("idPrograma") ?? "")}
                    onValueChange={(v) =>
                      form.setValue("idPrograma", Number(v))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione programa..." />
                    </SelectTrigger>
                    <SelectContent>{/* TUS PROGRAMAS */}</SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Ciclo Académico</FieldLabel>
                  <Select
                    value={String(form.watch("idCiclo") ?? "")}
                    onValueChange={(v) => form.setValue("idCiclo", Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione ciclo..." />
                    </SelectTrigger>
                    <SelectContent>{/* TUS CICLOS */}</SelectContent>
                  </Select>
                </Field>

                <div className="md:col-span-2">
                  <Field>
                    <FieldLabel>
                      Grupo Preferente{" "}
                      <span className="text-muted-foreground font-normal text-xs ml-2">
                        (Opcional - Sujeto a disponibilidad)
                      </span>
                    </FieldLabel>
                    <Select
                      value={String(form.watch("grupoId") ?? "")}
                      onValueChange={(v) => form.setValue("grupoId", Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sin preferencia" />
                      </SelectTrigger>
                      <SelectContent>{/* TUS GRUPOS */}</SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECCIÓN 4: PAGO */}
          <Card className="border-green-200 bg-green-50/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg text-green-700">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-green-900">
                    Registro de Pago
                  </CardTitle>
                  <CardDescription>
                    Detalles del comprobante de la transacción.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator className="bg-green-100" />
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4">
                  <Field>
                    <FieldLabel>Medio de Pago</FieldLabel>
                    <Select
                      value={form.watch("medioPago")}
                      onValueChange={(v) =>
                        form.setValue("medioPago", v as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deposito">
                          Depósito Bancario
                        </SelectItem>
                        <SelectItem value="transferencia">
                          Transferencia
                        </SelectItem>
                        <SelectItem value="yape">Yape</SelectItem>
                        <SelectItem value="plin">Plin</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="md:col-span-4">
                  <Field>
                    <FieldLabel>Tipo de Pago</FieldLabel>
                    <Select
                      value={form.watch("TipoPago")}
                      onValueChange={(v) => form.setValue("TipoPago", v as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inscripcion">Inscripción</SelectItem>
                        <SelectItem value="matricula">Matrícula</SelectItem>
                        <SelectItem value="mensualidad">Mensualidad</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="md:col-span-4">
                  <Field>
                    <FieldLabel>Fecha de Operación</FieldLabel>
                    <Input type="date" {...form.register("fechaPago")} />
                  </Field>
                </div>

                <div className="md:col-span-6">
                  <Field>
                    <FieldLabel>Nº de Operación / Voucher</FieldLabel>
                    <Input
                      placeholder="Ej. 123456"
                      {...form.register("nroVoucher")}
                    />
                  </Field>
                </div>

                <div className="md:col-span-6">
                  <Field>
                    <FieldLabel>Monto (S/.)</FieldLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">
                        S/.
                      </span>
                      <Input
                        className="pl-8"
                        type="number"
                        step="0.01"
                        {...form.register("monto")}
                      />
                    </div>
                  </Field>
                </div>

                <div className="md:col-span-12">
                  <Field>
                    <FieldLabel>Adjuntar Voucher (Imagen o PDF)</FieldLabel>
                    <div className="mt-2">
                      {/* Tu componente FileUploader existente */}
                      <FileUploader
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSizeMB={5}
                        // ... resto de props ...
                        onChange={(file) =>
                          form.setValue("documento", file ?? undefined)
                        }
                      />
                    </div>
                  </Field>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
      <Toaster />
    </div>
  );
}
