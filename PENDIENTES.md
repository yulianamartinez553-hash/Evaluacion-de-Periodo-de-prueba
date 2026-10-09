# Pendiente: formulario `/general`

Objetivo: una tercera variante del formulario, en `/general`, que muestre las
28 preguntas **genéricas originales** (las que tenía Chofer antes de
reescribirlas para roster minero), como opción separada de `/` (Chofer,
roster minero) y `/logistica` (Administrativo de Logística).

## Ya hecho

- `evaluacion-general.html` — copia de `index.html` con las 28 preguntas
  genéricas originales (mismos IDs y pesos "fundamental" que Chofer) y
  `rol: 'general'` en el payload que manda al backend. **Está en el repo
  pero todavía no está ruteado** (ver "Falta" más abajo).

## Falta (en este orden)

1. **Generar la plantilla de Google Docs para `/general`.**
   Ejecutar una vez, desde el editor de Apps Script del mismo proyecto que
   ya usan Chofer y Logística, la función `crearPlantillaGeneral()` (copiarla
   al final de `Código.gs`, guardar, elegirla en el desplegable, ▶ Ejecutar).
   Copia la plantilla de Chofer y le revierte el texto de cada pregunta al
   enunciado genérico original, sin tocar la plantilla de Chofer actual.
   Del log de ejecución hay que sacar el **ID del documento nuevo**
   (línea "ID del nuevo documento GENERAL: ...").

2. **Conectar ese ID en `Code.gs`** — agregar:
   - `var GENERAL_TEMPLATE_DOC_ID = '<el ID del paso 1>';`
   - Una hoja nueva "General" en la planilla (mismo patrón que
     `getOrCreateLogisticaSheet()`, pero con las columnas de Chofer ya que
     la estructura de criterios es idéntica).
   - `handleGeneralSubmission(data)` — igual a `handleChoferSubmission`
     pero escribiendo en la hoja "General" y usando
     `GENERAL_TEMPLATE_DOC_ID` para `generarPdf(...)`.
   - En `doPost`, sumar la rama `data.rol === 'general'` antes del
     `else` que cae en Chofer por default.

3. **Activar la ruta en `vercel.json`** — agregar:
   ```json
   { "source": "/general", "destination": "/evaluacion-general.html" }
   ```
   al array `rewrites` (junto a la de `/logistica`).

4. **Probar**: enviar una prueba con `rol:'general'` directo al
   `APPS_SCRIPT_URL` (o desde el formulario real en `/general` una vez
   desplegado) y confirmar que: aparece una fila nueva en la hoja
   "General" (no en la de Chofer), y el PDF generado usa el texto
   genérico original (no el de roster minero).

## Por qué no se activó ya

Si se agrega el rewrite de `/general` sin terminar el paso 2, el
formulario mostraría las preguntas viejas pero el envío caería en
`handleChoferSubmission` por default (ninguna rama de `doPost` reconoce
`rol:'general'` todavía) — el PDF resultante usaría la plantilla de Chofer,
que ya tiene el texto **nuevo** de roster minero. Quedaría una evaluación
cuyo PDF no coincide con lo que el evaluador realmente leyó y contestó en
el formulario. Por eso se deja sin rutear hasta terminar los 3 pasos de
arriba.
