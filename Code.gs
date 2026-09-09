var TEMPLATE_DOC_ID = '1_29jlaNih3cx33WE8zrmwvkQ9SrWlS54';

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
      data.fortalezas || '',
      data.mejora || '',
      data.recomendaciones || '',
      ''
    ];

    sheet.appendRow(row);
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();

    var pdfUrl = generarPdf(data);
    sheet.getRange(lastRow, lastCol).setValue(pdfUrl);

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
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

  // El documento usa campos de combinación {{...}}, no líneas con guion bajo.
  body.replaceText('\\{\\{Inicio del período de prueba\\}\\}', safeReplacement(data.fechaInicio));
  body.replaceText('\\{\\{Nombre del empleado\\}\\}', safeReplacement(data.nombre));
  body.replaceText('\\{\\{Puesto\\}\\}', safeReplacement(data.puesto));
  body.replaceText('\\{\\{Evaluador\\}\\}', safeReplacement(data.evaluador));
  body.replaceText('\\{\\{Fecha de evaluación\\}\\}', safeReplacement(data.fechaEvaluacion));

  // Recorre TODAS las tablas del documento (ahora hay varias antes de la de
  // criterios: logo, datos del evaluado, datos del evaluador) y marca el
  // casillero de cada criterio ya respondido, dejando intactos los que no
  // aplican. No se asume que la tabla de criterios sea la primera.
  var tables = body.getTables();
  var matched = 0;
  for (var t = 0; t < tables.length; t++) {
    var table = tables[t];
    for (var r = 0; r < table.getNumRows(); r++) {
      var row = table.getRow(r);
      if (row.getNumCells() < 3) continue;
      var calCell = row.getCell(2);
      if (calCell.getText().indexOf('☐') === -1) continue; // fila de título de sección o encabezado
      var key = CRITERIA_ORDER[matched];
      matched++;
      var valor = key ? criteria[key] : undefined;
      if (valor) {
        calCell.editAsText().setText(checkboxTrio(valor));
      }
    }
  }

  var banda = data.banda || '';
  if (banda.indexOf('bajo') > -1) {
    body.replaceText('☐ 1 – DESEMPEÑO BAJO', '☑ 1 – DESEMPEÑO BAJO');
  } else if (banda.indexOf('medio') > -1) {
    body.replaceText('☐ 2 – DESEMPEÑO MEDIO', '☑ 2 – DESEMPEÑO MEDIO');
  } else if (banda.indexOf('alto') > -1) {
    body.replaceText('☐ 3 – DESEMPEÑO ALTO', '☑ 3 – DESEMPEÑO ALTO');
  }

  body.replaceText('Fortalezas del empleado:', 'Fortalezas del empleado: ' + safeReplacement(data.fortalezas));
  body.replaceText('Áreas de mejora:', 'Áreas de mejora: ' + safeReplacement(data.mejora));
  body.replaceText('Recomendaciones del desempeño:', 'Recomendaciones del desempeño: ' + safeReplacement(data.recomendaciones));

  var decision = data.decision || '';
  if (decision.indexOf('Aprobado') === 0) {
    body.replaceText('APROBADO: Se confirma la contratación a largo plazo\\.', '☑ APROBADO: Se confirma la contratación a largo plazo.');
  } else if (decision.indexOf('Extensión') === 0) {
    body.replaceText('EXTENSIÓN DEL PERIODO DE PRUEBA: Se solicita más tiempo para evaluar el desempeño\\.', '☑ EXTENSIÓN DEL PERIODO DE PRUEBA: Se solicita más tiempo para evaluar el desempeño.');
  } else if (decision.indexOf('No aprobado') === 0) {
    body.replaceText('NO APROBADO: Se decide NO continuar con la relación laboral\\.', '☑ NO APROBADO: Se decide NO continuar con la relación laboral.');
  }

  if (data.firmaBase64) {
    var found = body.findText('Firma del Evaluador');
    if (found) {
      var el = found.getElement();
      while (el && el.getType() !== DocumentApp.ElementType.PARAGRAPH) {
        el = el.getParent();
      }
      if (el) {
        var idx = body.getChildIndex(el);
        var base64 = data.firmaBase64.indexOf(',') > -1 ? data.firmaBase64.split(',')[1] : data.firmaBase64;
        var imgBlob = Utilities.newBlob(Utilities.base64Decode(base64), 'image/png', 'firma.png');
        body.insertImage(idx, imgBlob).setWidth(160).setHeight(60);
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
