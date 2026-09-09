var TEMPLATE_DOC_ID = '1gXFToCsxJm-lDhxoEyTnyf5nzmKuRNX539uQkS2gtYQ';

// Orden real de los 28 criterios tal como aparecen en la tabla del documento
// original (de arriba hacia abajo). No se identifican por nombre porque
// "Adaptabilidad" aparece dos veces con el mismo texto — se identifican por
// posición dentro de la tabla.
var CRITERIA_ORDER = [
  'tarea__conocimiento', 'tarea__productividad', 'tarea__habilidad', 'tarea__calidad', 'tarea__resolucion',
  'actitud__normativa', 'actitud__profesionalismo', 'actitud__etica',
  'colaborativo__equipo', 'colaborativo__interpersonales', 'colaborativo__comunicacion_equipo', 'colaborativo__adapt_cambio',
  'puntualidad__puntualidad', 'puntualidad__asistencia',
  'aprender__aprendizaje', 'aprender__mejora', 'aprender__autoconocimiento',
  'decisiones__analitica', 'decisiones__toma_decisiones', 'decisiones__adapt_imprevistos',
  'seguridad__epp', 'seguridad__normas_seguridad',
  'clientes__contacto', 'clientes__respuesta', 'clientes__orientacion', 'clientes__resolucion_cliente',
  'comunicacion__claridad', 'comunicacion__conflictos'
];

// El formulario manda fortalezas/mejora/recomendaciones como arreglo de
// hasta 3 ítems (uno por viñeta/línea de la plantilla). Para la planilla se
// unen en un solo texto por columna.
function joinItems(value) {
  var arr = Array.isArray(value) ? value : [value];
  return arr
    .filter(function(v){ return v && String(v).trim(); })
    .map(function(v){ return String(v).trim(); })
    .join(' | ');
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var criteria = data.criteria || {};

    function c(key) { return criteria[key] !== undefined ? criteria[key] : ''; }

    var row = [
      new Date(),
      data.nombre || '',
      data.puesto || '',
      data.fechaInicio || '',
      data.fechaEvaluacion || '',
      data.evaluador || '',
      c('tarea__conocimiento'), c('tarea__productividad'), c('tarea__habilidad'), c('tarea__calidad'), c('tarea__resolucion'),
      c('actitud__normativa'), c('actitud__profesionalismo'), c('actitud__etica'),
      c('colaborativo__equipo'), c('colaborativo__interpersonales'), c('colaborativo__comunicacion_equipo'), c('colaborativo__adapt_cambio'),
      c('puntualidad__puntualidad'), c('puntualidad__asistencia'),
      c('aprender__aprendizaje'), c('aprender__mejora'), c('aprender__autoconocimiento'),
      c('decisiones__analitica'), c('decisiones__toma_decisiones'), c('decisiones__adapt_imprevistos'),
      c('seguridad__epp'), c('seguridad__normas_seguridad'),
      data.clientesAplica ? 'Sí' : 'No',
      c('clientes__contacto'), c('clientes__respuesta'), c('clientes__orientacion'), c('clientes__resolucion_cliente'),
      c('comunicacion__claridad'), c('comunicacion__conflictos'),
      data.puntaje || 0,
      data.banda || '',
      data.decision || '',
      joinItems(data.fortalezas),
      joinItems(data.mejora),
      joinItems(data.recomendaciones),
      ''
    ];

    sheet.appendRow(row);
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();

    // Si la generación del PDF falla, la fila con las respuestas ya quedó
    // guardada igual — se deja el error escrito en esa celda en vez de un
    // link vacío sin explicación, para poder diagnosticarlo desde la
    // planilla sin depender de los registros de ejecución de Apps Script.
    var pdfUrl;
    try {
      pdfUrl = generarPdf(data);
    } catch (pdfErr) {
      pdfUrl = 'ERROR generando PDF: ' + String(pdfErr);
    }
    sheet.getRange(lastRow, lastCol).setValue(pdfUrl);

    return ContentService.createTextOutput(JSON.stringify({ ok: true, version: 'v8' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreatePdfFolder() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ssFile = DriveApp.getFileById(ss.getId());
  var parents = ssFile.getParents();
  var parentFolder = parents.hasNext() ? parents.next() : DriveApp.getRootFolder();
  var folders = parentFolder.getFoldersByName('PDFs - Evaluaciones');
  return folders.hasNext() ? folders.next() : parentFolder.createFolder('PDFs - Evaluaciones');
}

// Escapa $ y \ para usar un valor arbitrario como reemplazo en replaceText
// (Text.replaceText interpreta $1, \1, etc. como referencias de grupo).
function safeReplacement(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/\\/g, '\\\\')
    .replace(/\$/g, '\\$');
}

// Convierte una fecha ISO ("2026-09-07", tal como la entrega <input type="date">)
// a formato local "07/09/2026". Se hace con split de string en vez de un
// objeto Date para no correr riesgo de que el huso horario del script corra
// el día.
function formatDateEs(isoDate) {
  var parts = String(isoDate || '').split('-');
  if (parts.length !== 3) return isoDate || '';
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

// Escribe hasta 3 ítems en los elementos que siguen a la etiqueta indicada:
// las 3 viñetas vacías debajo de "Fortalezas del empleado:"/"Áreas de
// mejora:", o las 3 líneas en blanco debajo de "Recomendaciones del
// desempeño:" (separadas por líneas horizontales sueltas, que se saltean).
function fillItemsBelow(body, labelText, items) {
  var found = body.findText(labelText);
  if (!found) return;
  var el = found.getElement();
  while (el && el.getType() !== DocumentApp.ElementType.LIST_ITEM && el.getType() !== DocumentApp.ElementType.PARAGRAPH) {
    el = el.getParent();
  }
  if (!el) return;
  var i = body.getChildIndex(el) + 1;
  var filled = 0;
  while (filled < 3 && i < body.getNumChildren()) {
    var child = body.getChild(i);
    var type = child.getType();
    if (type === DocumentApp.ElementType.HORIZONTAL_RULE) { i++; continue; }
    if (type !== DocumentApp.ElementType.LIST_ITEM && type !== DocumentApp.ElementType.PARAGRAPH) break;
    var value = (items && items[filled]) ? String(items[filled]).trim() : '';
    if (value) child.editAsText().setText(value);
    filled++;
    i++;
  }
}

// Los tres renglones de "RESULTADO DEL PERIODO DE PRUEBA" son un checklist
// nativo de Google Docs (lista con casillero tildable), no imágenes ni
// texto con "☐" — por eso se marcan con ListItem.setChecked(), el método
// nativo de Apps Script para checklists, en vez de buscar/reemplazar una
// imagen dentro del párrafo.
function markDecisionCheckbox(body, prefix) {
  for (var i = 0; i < body.getNumChildren(); i++) {
    var child = body.getChild(i);
    if (child.getType() !== DocumentApp.ElementType.LIST_ITEM) continue;
    var item = child.asListItem();
    if (item.getText().indexOf(prefix) !== 0) continue;
    try {
      item.setChecked(true);
    } catch (err) {
      // No es un checklist tildable para la API (setChecked tiró error) —
      // se marca resaltando el texto en vez de romper la generación del PDF.
      item.editAsText().setBold(true).setForegroundColor('#1c7a3c');
    }
    return true;
  }
  return false;
}

function checkboxTrio(valor) {
  function box(n) { return (String(valor) === String(n) ? '☑ ' : '☐ ') + n; }
  return box(1) + ' ' + box(2) + ' ' + box(3);
}

// ---------- generación del PDF: se copia el documento original y solo se completan los valores ----------

function generarPdf(data) {
  var folder = getOrCreatePdfFolder();
  var criteria = data.criteria || {};

  var copyFile = DriveApp.getFileById(TEMPLATE_DOC_ID).makeCopy('tmp_evaluacion_' + new Date().getTime(), folder);
  var doc = DocumentApp.openById(copyFile.getId());
  var body = doc.getBody();

  // La plantilla usa tokens {{...}} en su propia línea (no "Etiqueta: ___").
  body.replaceText('\\{\\{Inicio del período de prueba\\}\\}', safeReplacement(formatDateEs(data.fechaInicio)));
  body.replaceText('\\{\\{Nombre del empleado\\}\\}', safeReplacement(data.nombre));
  body.replaceText('\\{\\{Puesto\\}\\}', safeReplacement(data.puesto));
  body.replaceText('\\{\\{Evaluador\\}\\}', safeReplacement(data.evaluador));
  body.replaceText('\\{\\{Fecha de evaluación\\}\\}', safeReplacement(formatDateEs(data.fechaEvaluacion)));

  // El documento tiene varias tablas pequeñas de layout para el encabezado
  // además de la tabla grande de criterios, así que hay que recorrerlas todas
  // (no asumir que la primera es la de criterios). Se identifica la fila de
  // datos por tener "☐" en la 3ra celda (las filas de título de sección no
  // lo tienen) y se marca el casillero de cada criterio ya respondido,
  // dejando intactos (en blanco) los que no aplican.
  var tables = body.getTables();
  var matched = 0;
  tables.forEach(function(table){
    for (var r = 0; r < table.getNumRows(); r++) {
      var row = table.getRow(r);
      if (row.getNumCells() < 3) continue;
      var calCell = row.getCell(2);
      if (calCell.getText().indexOf('☐') === -1) continue;
      var key = CRITERIA_ORDER[matched];
      matched++;
      var valor = key ? criteria[key] : undefined;
      if (valor) {
        calCell.editAsText().setText(checkboxTrio(valor));
      }
    }
  });

  var banda = data.banda || '';
  if (banda.indexOf('bajo') > -1) {
    body.replaceText('☐ 1 – DESEMPEÑO BAJO', '☑ 1 – DESEMPEÑO BAJO');
  } else if (banda.indexOf('medio') > -1) {
    body.replaceText('☐ 2 – DESEMPEÑO MEDIO', '☑ 2 – DESEMPEÑO MEDIO');
  } else if (banda.indexOf('alto') > -1) {
    body.replaceText('☐ 3 – DESEMPEÑO ALTO', '☑ 3 – DESEMPEÑO ALTO');
  }

  fillItemsBelow(body, 'Fortalezas del empleado:', data.fortalezas);
  fillItemsBelow(body, 'Áreas de mejora:', data.mejora);
  fillItemsBelow(body, 'Recomendaciones del desempeño:', data.recomendaciones);

  var decision = data.decision || '';
  if (decision.indexOf('Aprobado') === 0) {
    markDecisionCheckbox(body, 'APROBADO:');
  } else if (decision.indexOf('Extensión') === 0) {
    markDecisionCheckbox(body, 'EXTENSIÓN DEL PERIODO DE PRUEBA:');
  } else if (decision.indexOf('No aprobado') === 0) {
    markDecisionCheckbox(body, 'NO APROBADO:');
  }

  if (data.firmaBase64) {
    var found = body.findText('Firma del Evaluador');
    if (found) {
      var labelPara = found.getElement();
      while (labelPara && labelPara.getType() !== DocumentApp.ElementType.PARAGRAPH) {
        labelPara = labelPara.getParent();
      }
      var underscoreEl = labelPara ? labelPara.getPreviousSibling() : null;
      if (underscoreEl && underscoreEl.getType() === DocumentApp.ElementType.PARAGRAPH) {
        var underscorePara = underscoreEl.asParagraph();
        var text = underscorePara.editAsText();
        var raw = text.getText();

        // El renglón en blanco arranca con un salto de línea suave y
        // espacios sueltos antes de los guiones bajos del evaluador. Si se
        // inserta la firma sin sacar eso primero, queda en su propia línea
        // en blanco, flotando arriba de todo el bloque de firma. Se recorta
        // hasta el primer "_" para que la imagen quede pegada justo al
        // inicio del renglón del evaluador.
        var firstDash = raw.indexOf('_');
        if (firstDash > 0) {
          text.deleteText(0, firstDash - 1);
        }

        var base64 = data.firmaBase64.indexOf(',') > -1 ? data.firmaBase64.split(',')[1] : data.firmaBase64;
        var imgBlob = Utilities.newBlob(Utilities.base64Decode(base64), 'image/png', 'firma.png');
        var img = underscorePara.insertInlineImage(0, imgBlob);

        // El frontend ya recorta la firma a su trazo real (sin el espacio en
        // blanco de sobra del recuadro), así que acá solo hace falta
        // escalarla manteniendo proporción dentro de un tamaño fijo chico.
        var maxW = 110, maxH = 34;
        var naturalW = img.getWidth(), naturalH = img.getHeight();
        var scale = Math.min(maxW / naturalW, maxH / naturalH, 1);
        img.setWidth(Math.round(naturalW * scale)).setHeight(Math.round(naturalH * scale));
      }
    }
  }

  doc.saveAndClose();

  var pdfBlob = DriveApp.getFileById(copyFile.getId()).getAs('application/pdf');
  var safeName = (data.nombre || 'empleado').replace(/[^a-zA-Z0-9 _-]/g, '');
  var fileName = 'Evaluacion_' + safeName + '_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmm') + '.pdf';
  var pdfFile = folder.createFile(pdfBlob).setName(fileName);
  DriveApp.getFileById(copyFile.getId()).setTrashed(true);

  return pdfFile.getUrl();
}
