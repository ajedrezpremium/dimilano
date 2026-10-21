# Módulo Legal & Económico — Di Milano

## Objetivo

Dotar al agente Milano de una capa de orientación legal y económica para acompañar al cliente potencial en operaciones de compraventa, alquiler, reforma y construcción, sin sustituir al abogado ni al asesor fiscal.

Di Milano actúa como **intermediario independiente**: equilibra los intereses de propietario, comprador/inquilino y proveedores, declara honorarios y posibles conflictos y deriva a profesionales colegiados cuando el caso lo requiere.

## Qué incluye

### 1. Modo “Legal & económico” del agente

- Botón en el chat para cambiar entre **Agente general** y **Legal & económico**.
- El modo legal responde con esta estructura: clave legal → qué comprobar/hacer → coste o impuesto orientativo → documento o siguiente paso.
- También detecta consultas legales escritas en modo general (ITP, arras, fianza, licencias, seguros, etc.).
- Base de conocimiento en `assets/js/legal.js`; prompt legal en `api/chat.js`.

### 2. Sección pública `#legal`

- Cuatro bloques: Compraventa, Alquiler, Reforma y obra, Garantías de las partes.
- Acciones “Consultar al agente” que abren el chat en modo legal con una pregunta precargada.
- Biblioteca de documentos PDF descargables.

### 3. Documentación estándar (`docs/`)

| Documento | Uso |
|---|---|
| `guia-fiscal-operaciones.pdf` | ITP, IVA, AJD, plusvalía, IRPF y ejemplos |
| `checklist-compraventa.pdf` | Cargas, arras, notaría y gastos |
| `checklist-alquiler.pdf` | Fianza, garantía adicional y obligaciones |
| `checklist-reforma.pdf` | Licencias, seguros y garantías LOE |
| `modelo-arras.pdf` | Plantilla orientativa de arras penitenciales |
| `modelo-presupuesto-obra.pdf` | Presupuesto por capítulos, IVA y pagos |
| `hoja-encargo-venta.pdf` | Encargo de intermediación y honorarios |

Los modelos son orientativos y deben revisarse por un profesional antes de firmar.

## Base legal y fiscal utilizada (España / Galicia, 2026)

- **Código Civil**: compraventa (arts. 1445 y ss.) y arras penitenciales (art. 1454).
- **LAU, Ley 29/1994**, modificada por la **Ley 12/2023** por el derecho a la vivienda: duración, fianza y garantías adicionales.
- **LOE, Ley 38/1999**: garantías de 10, 3 y 1 año; seguro decenal en obra nueva.
- **Ley 8/2012, de 29 de junio, de vivienda de Galicia** y normativa autonómica/municipal de habitabilidad.
- **Atriga** (Hacienda gallega): ITP general 8 %; 7 % para vivienda habitual con requisitos; AJD 1,5 %.
- **Plusvalía municipal** (TRLRHL) e **IRPF** sobre la ganancia; no residentes: retención del 3 %.
- **IVA**: 10 % en obra nueva y en renovación/reparación de vivienda que cumpla requisitos; 21 % en el resto.
- **Certificado de eficiencia energética** obligatorio para vender o alquilar (RD 390/2021 y normativa gallega).

> Las cifras son rangos orientativos. Antes de una operación concreta hay que confirmar tipo, base imponible, bonificaciones y ordenanza municipal.

## Límites y cumplimiento

- El agente no es abogado ni asesor fiscal y no emite dictámenes personalizados.
- No redacta contratos a medida: ofrece modelos y deriva a profesionales colegiados.
- No promete resultados ni oculta conflictos de interés.
- La información es general y puede quedar desactualizada: revisar cada año los tipos autonómicos y la normativa estatal.

## Mantenimiento

1. Actualizar tipos y referencias en `assets/js/legal.js` y en `LEGAL_BASE` de `api/chat.js`.
2. Regenerar PDFs desde las plantillas HTML (`marketing`/workspace) y sustituir los archivos de `docs/`.
3. Probar el modo legal en escritorio y móvil.
4. Revisar que los enlaces del footer y de la sección `#legal` siguen apuntando a archivos existentes.

## Próximas mejoras

- Firma electrónica y cumplimentación online de los modelos.
- Calculadora fiscal interactiva con validación de comunidad autónoma.
- Panel de expedientes por operación (documentos, partes, hitos y consentimientos).
- Registro de versiones de cada plantilla y fecha de última revisión legal.
