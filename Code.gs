var LOGO_BASE64 = "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";

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

// ---------- helpers de formato (checkbox estilo ☐ / ☑) ----------

function checkboxTrio(valor) {
  function box(n) { return (String(valor) === String(n) ? '☑ ' : '☐ ') + n; }
  return box(1) + '     ' + box(2) + '     ' + box(3);
}

function appendCheckboxLine(body, checked, label) {
  body.appendParagraph((checked ? '☑ ' : '☐ ') + label);
}

var SERVINORTE_NAVY = '#002060';

function addSectionRow(table, titulo) {
  var row = table.appendTableRow();
  var c0 = row.appendTableCell(titulo);
  var c1 = row.appendTableCell('');
  var c2 = row.appendTableCell('');
  [c0, c1, c2].forEach(function (c) { c.setBackgroundColor(SERVINORTE_NAVY); });
  var text = c0.editAsText();
  text.setBold(true);
  text.setFontSize(11);
  c0.setPaddingTop(4).setPaddingBottom(4);
  var par = c0.getChild(0).asParagraph();
  par.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
}

function addCriterioRow(table, criterio, descripcion, valor) {
  var row = table.appendTableRow();
  var c0 = row.appendTableCell(criterio);
  var c1 = row.appendTableCell(descripcion);
  var c2 = row.appendTableCell(checkboxTrio(valor));
  c0.editAsText().setBold(true).setFontSize(10);
  c1.editAsText().setFontSize(10);
  c2.editAsText().setFontSize(10);
}

// ---------- generación del PDF (misma estructura y texto que la plantilla original) ----------

function generarPdf(data) {
  var doc = DocumentApp.create('tmp_evaluacion_' + new Date().getTime());
  var body = doc.getBody();
  body.setMarginTop(55).setMarginBottom(40).setMarginLeft(50).setMarginRight(50);

  var header = doc.addHeader();
  var logoBlob = Utilities.newBlob(Utilities.base64Decode(LOGO_BASE64), 'image/png', 'servinorte-logo.png');
  header.appendImage(logoBlob).setWidth(185).setHeight(35);

  var title = body.appendParagraph('Evaluación de Periodo de Prueba');
  title.editAsText().setBold(true).setFontSize(14);
  body.appendParagraph(' ');

  body.appendParagraph('Nombre del Empleado: ' + (data.nombre || '________________________________'));
  body.appendParagraph('Puesto: ' + (data.puesto || '________________________________'));
  body.appendParagraph('Fecha de Inicio del Periodo de Prueba: ' + (data.fechaInicio || '________________'));
  body.appendParagraph('Fecha de Evaluación: ' + (data.fechaEvaluacion || '________________'));
  body.appendParagraph('Evaluador: ' + (data.evaluador || '________________________________'));
  body.appendParagraph(' ');

  body.appendParagraph('Criterios de Evaluación: Califique el desempeño del personal en base a la siguiente escala:');
  body.appendParagraph('DESEMPEÑO BAJO       DESEMPEÑO MEDIO       DESEMPEÑO ALTO');
  body.appendParagraph(' ');

  var criteria = data.criteria || {};

  // tabla única y continua, igual a la plantilla original
  var table = body.appendTable([['CRITERIO', 'DESCRIPCIÓN', 'Calificación']]);
  var headerRow = table.getRow(0);
  for (var i = 0; i < 3; i++) headerRow.getCell(i).editAsText().setBold(true).setFontSize(10);

  addSectionRow(table, 'DESEMPEÑO EN LA TAREA');
  addCriterioRow(table, 'Conocimiento técnico', 'Demuestra el conocimiento adecuado para realizar la tarea que se le encomienda.', criteria['tarea__conocimiento']);
  addCriterioRow(table, 'Productividad', 'El nivel de cumplimiento de las tareas, es óptimo en los tiempos considerados.', criteria['tarea__productividad']);
  addCriterioRow(table, 'Habilidad Técnica', 'Conocimiento y manejo de las herramientas, manejo de colectivos, manejo de tecnología o sistemas (ej.: herramientas tecnológicas, escáner, software de gestión, etc.).', criteria['tarea__habilidad']);
  addCriterioRow(table, 'Calidad', 'Grado de exactitud y calidad en la ejecución de las tareas asignadas.', criteria['tarea__calidad']);
  addCriterioRow(table, 'Resolución de problemas', 'Habilidad para resolver situaciones imprevistas de manera efectiva (por ejemplo, imprevistos de tráfico, auxilios, reparaciones adicionales y fuera de horario, etc.).', criteria['tarea__resolucion']);

  addSectionRow(table, 'ACTITUD Y COMPORTAMIENTO PROFESIONAL');
  addCriterioRow(table, 'Normativa interna', 'Cumplimiento de normas y procedimientos de trabajo establecidos para cada tarea.', criteria['actitud__normativa']);
  addCriterioRow(table, 'Profesionalismo', 'Responsabilidad por los resultados obtenidos en su trabajo.', criteria['actitud__profesionalismo']);
  addCriterioRow(table, 'Ética', 'Respeto por las políticas y valores de la empresa.', criteria['actitud__etica']);

  addSectionRow(table, 'TRABAJO COLABORATIVO');
  addCriterioRow(table, 'Trabajo en equipo', 'Predisposición y actitud para colaborar con el equipo de trabajo.', criteria['colaborativo__equipo']);
  addCriterioRow(table, 'Relaciones interpersonales', 'Capacidad para relacionarse efectivamente con sus pares.', criteria['colaborativo__interpersonales']);
  addCriterioRow(table, 'Comunicación', 'Habilidad para comunicarse de manera efectiva con los compañeros y supervisores.', criteria['colaborativo__comunicacion_equipo']);
  addCriterioRow(table, 'Adaptabilidad al cambio', 'Flexibilidad para adaptarse a cambios o nuevas tareas que se presenten.', criteria['colaborativo__adapt_cambio']);

  addSectionRow(table, 'PUNTUALIDAD Y RESPONSABILIDAD');
  addCriterioRow(table, 'Puntualidad', 'Llega a tiempo a su puesto de trabajo, respetando los horarios establecidos.', criteria['puntualidad__puntualidad']);
  addCriterioRow(table, 'Asistencia', 'Asistencia regular y sin ausencias injustificadas.', criteria['puntualidad__asistencia']);

  addSectionRow(table, 'CAPACIDAD DE APRENDER');
  addCriterioRow(table, 'Aprendizaje', 'Muestra rapidez en la adopción de nuevos procesos internos, herramientas o tecnologías.', criteria['aprender__aprendizaje']);
  addCriterioRow(table, 'Capacidad de mejora', 'Actitud ante la retroalimentación y disposición para mejorar.', criteria['aprender__mejora']);
  addCriterioRow(table, 'Autoconocimiento', 'Demuestra interés y habilidad para mejorar continuamente sus habilidades y desempeño.', criteria['aprender__autoconocimiento']);

  addSectionRow(table, 'RESOLUCIÓN DE PROBLEMAS Y TOMA DE DECISIONES');
  addCriterioRow(table, 'Capacidad Analítica', 'Capacidad para identificar problemas y encontrar soluciones rápidas y efectivas.', criteria['decisiones__analitica']);
  addCriterioRow(table, 'Toma de decisiones', 'Toma decisiones adecuadas, teniendo en cuenta los objetivos de la empresa y las posibles consecuencias.', criteria['decisiones__toma_decisiones']);
  addCriterioRow(table, 'Adaptabilidad ante imprevistos', 'Capacidad para manejar situaciones imprevistas, como retrasos, cambios de última hora, o problemas de tráfico (en el caso de conductores).', criteria['decisiones__adapt_imprevistos']);

  addSectionRow(table, 'SEGURIDAD E HIGIENE');
  addCriterioRow(table, 'Equipos de protección personal', 'Uso adecuado de equipos de protección personal (si aplica).', criteria['seguridad__epp']);
  addCriterioRow(table, 'Cumplimiento de normas de Seguridad', 'Cumplimiento de los protocolos de seguridad interna y externa (por ejemplo, en el caso de accidentes o situaciones de emergencia).', criteria['seguridad__normas_seguridad']);

  if (data.clientesAplica) {
    addSectionRow(table, 'RELACIONES CON CLIENTES (SI APLICA)');
    addCriterioRow(table, 'Modalidad de Contacto', 'Trato profesional y cortés hacia los clientes o usuarios.', criteria['clientes__contacto']);
    addCriterioRow(table, 'Capacidad de respuesta', 'Resolución efectiva de dudas o problemas planteados por los clientes.', criteria['clientes__respuesta']);
    addCriterioRow(table, 'Orientación al cliente', 'Capacidad para mantener una buena relación comercial y ofrecer un excelente servicio.', criteria['clientes__orientacion']);
    addCriterioRow(table, 'Resolución', 'Actitud proactiva para optimizar los procesos y resultados con los clientes.', criteria['clientes__resolucion_cliente']);
  }

  addSectionRow(table, 'COMUNICACIÓN');
  addCriterioRow(table, 'Claridad en la comunicación', 'Comunica de manera clara y efectiva tanto con superiores como con compañeros y clientes.', criteria['comunicacion__claridad']);
  addCriterioRow(table, 'Manejo de conflictos', 'Manejo adecuado de conflictos y resolución de problemas en la relación con terceros.', criteria['comunicacion__conflictos']);

  body.appendParagraph(' ');

  // EVALUACION FINAL — se marca sola según el puntaje ponderado
  body.appendParagraph('EVALUACION FINAL:').setBold(true);
  body.appendParagraph('Basado en los criterios anteriores, ¿cómo evaluaría el desempeño general del empleado durante el periodo de prueba?');
  var banda = data.banda || '';
  appendCheckboxLine(body, banda.indexOf('bajo') > -1, '1 – DESEMPEÑO BAJO');
  appendCheckboxLine(body, banda.indexOf('medio') > -1, '2 – DESEMPEÑO MEDIO');
  appendCheckboxLine(body, banda.indexOf('alto') > -1, '3 – DESEMPEÑO ALTO');
  body.appendParagraph('(Puntaje ponderado obtenido: ' + (data.puntaje || 0) + '%, calculado automáticamente en base a los criterios evaluados.)');
  body.appendParagraph(' ');

  body.appendParagraph('COMENTARIOS Y RECOMENDACIONES DEL EVALUADOR').setBold(true);
  body.appendParagraph('Fortalezas del empleado:');
  body.appendParagraph(data.fortalezas || '—');
  body.appendParagraph('Áreas de mejora:');
  body.appendParagraph(data.mejora || '—');
  body.appendParagraph('Recomendaciones del desempeño:');
  body.appendParagraph(data.recomendaciones || '—');
  body.appendParagraph(' ');

  // DECISIÓN FINAL — se marca sola: Alto=Aprobado, Medio=Extensión, Bajo=No aprobado
  body.appendParagraph('DECISIÓN FINAL: Resultado del Periodo de Prueba:').setBold(true);
  var decision = data.decision || '';
  appendCheckboxLine(body, decision.indexOf('Aprobado') === 0, 'APROBADO – Se confirma la contratación a largo plazo.');
  appendCheckboxLine(body, decision.indexOf('Extensión') === 0, 'EXTENSIÓN DEL PERIODO DE PRUEBA – Se solicita más tiempo para evaluar el desempeño.');
  appendCheckboxLine(body, decision.indexOf('No aprobado') === 0, 'NO APROBADO – Se decide no continuar con la relación laboral.');
  body.appendParagraph(' ');

  body.appendParagraph('Firma del Evaluador: ');
  if (data.firmaBase64) {
    var base64 = data.firmaBase64.indexOf(',') > -1 ? data.firmaBase64.split(',')[1] : data.firmaBase64;
    var imgBlob = Utilities.newBlob(Utilities.base64Decode(base64), 'image/png', 'firma.png');
    body.appendImage(imgBlob).setWidth(200).setHeight(80);
  }
  body.appendParagraph(' ');
  body.appendParagraph('Firma del Empleado (opcional): _______________________________________');
  body.appendParagraph('(a completar en la reunión de devolución de resultados)');

  body.editAsText().setFontFamily('Arial');

  doc.saveAndClose();

  var folder = getOrCreatePdfFolder();
  var pdfBlob = DriveApp.getFileById(doc.getId()).getAs('application/pdf');
  var safeName = (data.nombre || 'empleado').replace(/[^a-zA-Z0-9 _-]/g, '');
  var fileName = 'Evaluacion_' + safeName + '_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmm') + '.pdf';
  var pdfFile = folder.createFile(pdfBlob).setName(fileName);
  DriveApp.getFileById(doc.getId()).setTrashed(true);

  return pdfFile.getUrl();
}
