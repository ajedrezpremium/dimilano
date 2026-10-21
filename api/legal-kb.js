/* Di Milano — respuestas legales deterministas (España/Galicia, 2026).
   No se usa el LLM para datos fiscales: evita alucinaciones de tipos y plazos. */

const DISCLAIMER = "Información general orientativa (España/Galicia, 2026). No es asesoramiento jurídico ni fiscal individual ni sustituye la revisión de un abogado o asesor colegiado. Las cifras pueden variar según la operación, el inmueble y la normativa vigente.";

const TOPICS = {
  compraventa: `Compraventa de vivienda
Clave legal: antes de firmar hay que verificar titularidad, cargas y capacidad del vendedor; las arras penitenciales se regulan en el art. 1454 del Código Civil.
Qué comprobar: nota simple registral, cargas y embargos, IBI, certificados de comunidad, certificado energético, habitabilidad/ocupación y licencias urbanísticas. Revisa físicamente el inmueble y las instalaciones.
Coste orientativo: en segunda mano, ITP general del 8 % en Galicia (7 % para vivienda habitual si se cumplen requisitos); notaría 0,4–0,7 %, registro 0,2–0,3 %, gestoría 300–500 € y tasación 300–450 € si hay hipoteca. En obra nueva: IVA 10 % + AJD 1,5 %. El vendedor paga plusvalía municipal e IRPF; un no residente soporta una retención del 3 %.
Siguiente paso: firma las arras por escrito con precio, plazo, condición de financiación y consecuencias del incumplimiento; antes de la notaría, revisa el borrador y prepara el modelo 600.`,
  alquiler: `Arrendamiento de vivienda habitual
Clave legal: la LAU (Ley 29/1994), modificada por la Ley 12/2023, fija límites imperativos de duración, fianza y garantías.
Qué comprobar: contrato escrito, identificación de las partes, renta, índice de actualización, gastos repercutibles, inventario y estado del inmueble. El propietario debe aportar certificado energético y, cuando corresponda, habitabilidad.
Coste y garantías: fianza legal de 1 mensualidad. La garantía adicional (aval, depósito u otra) no puede superar 2 mensualidades en vivienda habitual. Duración: 5 años si el arrendador es persona física (7 si es sociedad), con prórrogas legales. El propietario declara los rendimientos en IRPF; el inquilino no paga ITP por el alquiler.
Siguiente paso: firma contrato y anexo de inventario, entrega recibos de fianza y garantía, y revisa el preaviso de salida.`,
  reforma: `Reforma y obra
Clave legal: la LOE (Ley 38/1999) establece garantías de 10 años para estructura, 3 años para estanqueidad/habitabilidad y 1 año para acabados. El seguro decenal es obligatorio en obra nueva, no en toda reforma.
Qué comprobar: licencia municipal o declaración responsable, autorización de la comunidad para elementos comunes, presupuesto por capítulos con mediciones, contrato con plazo y penalizaciones, seguro de responsabilidad civil del ejecutor y gestión de residuos.
Coste orientativo: IVA del 10 % en obras de renovación/reparación de vivienda que cumplan requisitos; 21 % en el resto. Honorarios técnicos habituales del 8–12 % del presupuesto. Reserva una retención del 5–10 % hasta la lista de remates.
Siguiente paso: exige presupuesto y contrato firmados, hitos de pago verificables y certificado final de obra cuando proceda.`,
  garantias: `Garantías entre las partes
Propietario: título y cargas comprobados, certificado energético y habitabilidad, seguro del inmueble, fianza depositada y rendición de cuentas.
Comprador o inquilino: identidad y solvencia, arras o fianza documentadas, condiciones suspensivas (hipoteca, inspección) y calendario de pagos trazable.
Proveedor o constructor: contrato de obra, presupuesto firmado, seguro de responsabilidad civil, garantías LOE, hitos de pago y retención por acabados.
Intermediación: Di Milano actúa como intermediario independiente, declara honorarios y posibles conflictos y busca el equilibrio entre propietario, cliente y proveedor. No es un despacho de abogados.
Siguiente paso: no pagues fuera de un medio trazable ni firmes sin revisar cargas, cláusulas de desistimiento y penalizaciones.`,
  fiscalidad: `Impuestos y trámites habituales
Compra usada: ITP general del 8 % en Galicia; vivienda habitual con requisitos, 7 %. Modelo 600 en 30 días hábiles; notaría y registro aparte.
Compra nueva: IVA del 10 % sobre la vivienda + AJD del 1,5 % en Galicia.
Venta: plusvalía municipal (según ordenanza y valor catastral) e IRPF sobre la ganancia. No residente: retención del 3 %.
Alquiler: el propietario declara rendimientos en IRPF; fianza de 1 mes y garantía adicional máxima de 2 mensualidades.
Reforma: IVA del 10 % si la obra cumple los requisitos de renovación de vivienda; 21 % en el resto. Guarda facturas y justificantes.
Siguiente paso: confirma el caso concreto con Atriga/Hacienda o un asesor fiscal antes de presentar la autoliquidación.`
};

const DOCS = `Documentación descargable en la sección Legal:
· Guía fiscal de la operación
· Checklist de compraventa
· Checklist de alquiler
· Checklist de reforma
· Modelo de contrato de arras
· Modelo de presupuesto de obra
· Hoja de encargo de venta`;

function normalize(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function legalTopic(message) {
  const t = normalize(message);
  if (/documentacion|documento|pdf|checklist|plantilla|modelo de contrato/.test(t)) return "documentacion";
  if (/impuesto|iva\b|irpf|itp\b|ajd\b|plusvalia|fiscal|hacienda|deduccion/.test(t)) return "fiscalidad";
  if (/fianza|alquiler|alquilar|arrendamiento|lau\b|inquilino|casero|garantia adicional/.test(t)) return "alquiler";
  if (/arras|notaria|notario|registro de la propiedad|escritura|nota simple|cargas|compraventa|comprar vivienda|vender vivienda/.test(t)) return "compraventa";
  if (/reforma|licencia|seguro decenal|loe\b|arquitecto|aparejador|habitabilidad|certificado energetico|contrato de obra/.test(t)) return "reforma";
  if (/garantia|aval|proveedor|seguro de responsabilidad|incumplimiento|penalizacion/.test(t)) return "garantias";
  if (/legal|abogado|juridico|asesoria|normativa|ley\b/.test(t)) return "general";
  return null;
}

export function legalReply(message) {
  const topic = legalTopic(message);
  if (topic && TOPICS[topic]) return TOPICS[topic] + "\n\n" + DOCS + "\n\n" + DISCLAIMER;
  return `Asesoría legal y económica de Di Milano
Puedo orientarte sobre compraventa, alquiler, reforma, fiscalidad y garantías entre propietario, cliente y proveedor.
\n${DOCS}\n\nDime si quieres comprar, vender, alquilar o reformar y te indico qué revisar, qué coste orientativo tiene y qué documento te conviene.\n\n${DISCLAIMER}`;
}
