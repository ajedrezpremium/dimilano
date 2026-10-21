/* Di Milano — Base de conocimiento legal y económica (orientativa)
   No sustituye asesoramiento jurídico ni fiscal individual. */
"use strict";
window.MV_LEGAL = (function () {
  const DISCLAIMER = "Información general orientativa (España/Galicia, 2026). No es asesoramiento jurídico ni fiscal individual ni sustituye la revisión de un abogado o asesor colegiado. Las cifras y tipos pueden variar según la operación, el inmueble y la normativa vigente.";

  const TOPICS = {
    compraventa: {
      icon: "⚖️",
      title: "Compraventa de vivienda",
      tag: "Código Civil · ITP · Notaría",
      intro: "Una compraventa segura empieza por verificar el inmueble y las cargas antes de firmar, y por separar precio, impuestos y gastos.",
      bullets: [
        "Antes de la oferta: nota simple registral, cargas y embargos, IBI, recibos de comunidad, certificado energético y certificado de habitabilidad/ocupación.",
        "Segunda mano: ITP general del 8 % en Galicia (7 % para vivienda habitual si se cumplen requisitos). Obra nueva: IVA del 10 % + AJD del 1,5 %.",
        "Gastos habituales del comprador: notaría 0,4–0,7 %, registro 0,2–0,3 %, gestoría 300–500 € y tasación 300–450 € si hay hipoteca.",
        "El vendedor asume plusvalía municipal e IRPF por la ganancia. Si no es residente, se retiene un 3 % del precio.",
        "Las arras penitenciales (art. 1454 CC) fijan la señal y las consecuencias de incumplir; deben documentarse por escrito."
      ],
      docs: ["checklist-compraventa", "modelo-arras", "guia-fiscal-operaciones"],
      ask: "Quiero comprar una vivienda en Vigo: ¿qué debo revisar antes de firmar y qué impuestos y gastos tendré?"
    },
    alquiler: {
      icon: "🔑",
      title: "Arrendamiento y fianza",
      tag: "LAU 29/1994 · Ley 12/2023",
      intro: "El contrato de vivienda habitual tiene reglas imperativas de duración, fianza y actualización de renta que conviene pactar por escrito.",
      bullets: [
        "Duración: 5 años si el arrendador es persona física (7 si es sociedad), con prórrogas legales; el inquilino puede desistir con preaviso.",
        "Fianza legal: 1 mensualidad de renta. La garantía adicional (aval, depósito…) no puede superar 2 mensualidades en vivienda habitual.",
        "Actualización de renta: solo con índice pactado y dentro de los límites legales; no se puede subir libremente durante el contrato.",
        "El propietario debe entregar certificado energético, contrato escrito, recibos y justificar gastos repercutibles; el inquilino responde del uso y conservación.",
        "Fiscalidad del propietario: rendimientos del capital inmobiliario en IRPF; el inquilino no paga ITP por el alquiler de vivienda."
      ],
      docs: ["checklist-alquiler", "guia-fiscal-operaciones"],
      ask: "Voy a alquilar una vivienda en Vigo: ¿qué fianza y garantías son legales y qué obligaciones tienen propietario e inquilino?"
    },
    reforma: {
      icon: "🛠️",
      title: "Reforma y construcción",
      tag: "LOE 38/1999 · Licencias",
      intro: "Una reforma se protege con un presupuesto desglosado, un contrato claro, licencias y un régimen de garantías y seguros verificable.",
      bullets: [
        "Comprueba si la obra requiere licencia municipal o declaración responsable; en comunidad, autorización para elementos comunes y horarios.",
        "Exige presupuesto por capítulos, mediciones, plazo, forma de pago y qué incluye (materiales, medios auxiliares, limpieza y residuos).",
        "La LOE fija garantías de 10 años (estructura), 3 años (estanqueidad/habitabilidad) y 1 año (acabados). El seguro decenal es obligatorio para obra nueva, no para toda reforma.",
        "Contrata seguro de responsabilidad civil del ejecutor y conserva dirección facultativa, visados y certificado final cuando proceda.",
        "IVA: 10 % en obras de renovación/reparación de vivienda que cumplan requisitos; 21 % en el resto. La reforma integral suele sumar honorarios técnicos del 8–12 %."
      ],
      docs: ["checklist-reforma", "modelo-presupuesto-obra"],
      ask: "Voy a reformar mi vivienda en Vigo: ¿qué licencias, contrato, seguros y garantías debo exigir?"
    },
    garantias: {
      icon: "🛡️",
      title: "Garantías y partes",
      tag: "Propietario · Cliente · Proveedor",
      intro: "La seguridad de la operación se construye con documentos verificables y con obligaciones equilibradas para todas las partes.",
      bullets: [
        "Propietario: título y cargas comprobados, energía y habitabilidad, seguro del inmueble, fianza depositada y rendición de cuentas.",
        "Comprador/inquilino: identidad y solvencia, arras o fianza documentadas, condiciones suspensivas (hipoteca, inspección) y calendario de pagos.",
        "Proveedor/constructor: contrato de obra, presupuesto firmado, seguro RC, garantías LOE, hitos de pago y retención por acabados.",
        "Intermediación: Di Milano actúa como intermediario independiente, declara honorarios y posibles conflictos, y busca el equilibrio entre las partes.",
        "Nunca pagues fuera de un medio trazable ni firmes un documento sin revisar cargas, cláusulas de desistimiento y penalizaciones."
      ],
      docs: ["hoja-encargo-venta", "modelo-arras", "modelo-presupuesto-obra"],
      ask: "¿Qué garantías y protecciones debe haber entre propietario, comprador, inquilino y proveedor en una operación inmobiliaria?"
    },
    fiscalidad: {
      icon: "📊",
      title: "Impuestos y trámites",
      tag: "Atriga · Hacienda · IRPF",
      intro: "Los impuestos dependen del tipo de operación. Esta tabla es una orientación para Vigo y Galicia; confirma siempre el caso concreto.",
      bullets: [
        "Compra usada: ITP 8 % (7 % vivienda habitual con requisitos), modelo 600 en 30 días hábiles; notaría y registro aparte.",
        "Compra nueva: IVA 10 % + AJD 1,5 %; el promotor repercute el IVA y el comprador liquida el AJD.",
        "Venta: plusvalía municipal (según ordenanza y valor catastral) e IRPF sobre la ganancia; no residente, retención del 3 %.",
        "Alquiler: el propietario declara rendimientos en IRPF; fianza de 1 mes y garantía adicional máxima de 2 mensualidades.",
        "Reforma: IVA 10 % si cumple requisitos de renovación de vivienda; 21 % en caso contrario. Guarda todas las facturas."
      ],
      docs: ["guia-fiscal-operaciones", "checklist-compraventa"],
      ask: "Hazme un resumen de los impuestos y trámites de comprar, vender, alquilar o reformar una vivienda en Galicia."
    }
  };

  const DOCS = [
    { id: "guia-fiscal-operaciones", title: "Guía fiscal de la operación", desc: "ITP, IVA, AJD, plusvalía, IRPF y ejemplos numéricos.", file: "docs/guia-fiscal-operaciones.pdf", tag: "Guía" },
    { id: "checklist-compraventa", title: "Checklist de compraventa", desc: "Documentos, cargas, arras, notaría y gastos.", file: "docs/checklist-compraventa.pdf", tag: "Checklist" },
    { id: "checklist-alquiler", title: "Checklist de alquiler", desc: "Fianza, garantía adicional, contrato y obligaciones.", file: "docs/checklist-alquiler.pdf", tag: "Checklist" },
    { id: "checklist-reforma", title: "Checklist de reforma", desc: "Licencias, presupuesto, seguros y garantías LOE.", file: "docs/checklist-reforma.pdf", tag: "Checklist" },
    { id: "modelo-arras", title: "Modelo de contrato de arras", desc: "Plantilla orientativa con cláusulas y firma.", file: "docs/modelo-arras.pdf", tag: "Modelo" },
    { id: "modelo-presupuesto-obra", title: "Modelo de presupuesto de obra", desc: "Capítulos, mediciones, IVA y pagos.", file: "docs/modelo-presupuesto-obra.pdf", tag: "Modelo" },
    { id: "hoja-encargo-venta", title: "Hoja de encargo de venta", desc: "Encargo de intermediación y honorarios.", file: "docs/hoja-encargo-venta.pdf", tag: "Modelo" }
  ];

  return { DISCLAIMER, TOPICS, DOCS };
})();
