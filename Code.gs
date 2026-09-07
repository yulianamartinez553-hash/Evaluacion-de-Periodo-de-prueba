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

function addSectionRow(table, titulo) {
  var row = table.appendTableRow();
  var c0 = row.appendTableCell(titulo);
  row.appendTableCell('');
  row.appendTableCell('');
  c0.setBackgroundColor('#e9edf2');
  c0.editAsText().setBold(true);
}

function addCriterioRow(table, criterio, descripcion, valor) {
  var row = table.appendTableRow();
  row.appendTableCell(criterio).editAsText().setBold(true);
  row.appendTableCell(descripcion);
  row.appendTableCell(checkboxTrio(valor));
}

// ---------- generación del PDF (misma estructura y texto que la plantilla original) ----------

function generarPdf(data) {
  var doc = DocumentApp.create('tmp_evaluacion_' + new Date().getTime());
  var body = doc.getBody();
  body.setMarginTop(40).setMarginBottom(40).setMarginLeft(50).setMarginRight(50);

  body.appendParagraph('Evaluación de Periodo de Prueba').setHeading(DocumentApp.ParagraphHeading.TITLE);
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
  for (var i = 0; i < 3; i++) headerRow.getCell(i).editAsText().setBold(true);

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

  doc.saveAndClose();

  var folder = getOrCreatePdfFolder();
  var pdfBlob = DriveApp.getFileById(doc.getId()).getAs('application/pdf');
  var safeName = (data.nombre || 'empleado').replace(/[^a-zA-Z0-9 _-]/g, '');
  var fileName = 'Evaluacion_' + safeName + '_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmm') + '.pdf';
  var pdfFile = folder.createFile(pdfBlob).setName(fileName);
  DriveApp.getFileById(doc.getId()).setTrashed(true);

  return pdfFile.getUrl();
}
