# Guía de Integración: Agente de IA para Inmobiliaria y Constructora

Esta guía detalla las opciones prácticas y el procedimiento técnico para integrar un agente de Inteligencia Artificial desarrollado en tu proyecto dentro de una web estática orientada al sector inmobiliario y de la construcción.

---

## 1. Funcionalidades "Pro" Recomendadas

Para convertir una web estática informativa en un canal activo de captación y cualificación de clientes 24/7, se recomiendan las siguientes funciones:

1. **Buscador Conversacional Inteligente (RAG Inmobiliario)**
   - Permite a los usuarios buscar inmuebles o promociones utilizando lenguaje natural.
   - *Ejemplo:* "Busco un piso de 3 habitaciones con terraza en el centro por menos de 280.000€".
   - El agente procesa la consulta y realiza una búsqueda semántica sobre el catálogo.

2. **Agente Calificador de Leads y Agendamiento 24/7**
   - Atiende dudas frecuentes (ubicaciones, plazos de entrega, garantías de construcción).
   - Recopila datos clave del cliente (presupuesto, urgencia, necesidad de financiación).
   - Conecta con herramientas de calendario para agendar visitas comerciales automáticamente.

3. **Asistente de Memoria de Calidades (Venta sobre Plano)**
   - Diseñado específicamente para constructoras.
   - Responde preguntas sobre especificaciones técnicas, materiales, eficiencia energética y fases de obra.

---

## 2. Métodos de Integración Técnica

Al tratarse de una web estática, el desarrollo pesado y la lógica de la IA deben alojarse en tu propia infraestructura (backend/servidor), mientras que la web del cliente solo incluye una capa liviana de integración.

### Opción A: Widget Flotante (JavaScript Embed)
*La opción más rápida, limpia y mantenible.*

1. **Despliegue Backend:** Alojas la API del agente y la base de datos (por ejemplo, Supabase con `pgvector` o Pinecone) en tu entorno.
2. **Generación del Script:** Creas un script autocontenido (`agent-widget.js`) que renderiza la interfaz del chat.
3. **Inyección en el HTML:** El cliente solo necesita agregar una línea de código antes del cierre de la etiqueta `</body>`:

```html
<script src="https://tudominio.com/agent-widget.js" data-agent-id="inmobiliaria-xyz" defer></script>
```

### Opción B: Componentes Embed / iFrames (Buscador en el Hero)
*Ideal si se busca integrar la IA en una sección específica del diseño (por ejemplo, la barra de búsqueda principal).*

1. **Contenedor:** Se coloca un elemento `<div>` reservado dentro de la plantilla HTML estática.
2. **Carga:** Se renderiza el componente interactivo mediante un iframe o un Web Component que llama a tu API de búsqueda avanzada.

---

## 3. Arquitectura y Seguridad Recomendada

- **CORS Configurado:** Limita el acceso a tus endpoints backend únicamente desde el dominio oficial del cliente.
- **Sincronización de Datos:** Mantén un panel donde el cliente pueda actualizar el catálogo de propiedades o sincronízalo periódicamente con su CRM.
- **Límites de Uso (Rate Limiting):** Aplica restricciones por IP para proteger tus tokens de la API del LLM frente a posibles abusos.