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

    return ContentService.createTextOutput(JSON.stringify({ ok: true, version: 'v15' }))
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

// Convierte una fecha ISO ("2026-09-07", tal como la entrega <input type="date">)
// a formato local "07/09/2026". Se hace con split de string en vez de un
// objeto Date para no correr riesgo de que el huso horario del script corra
// el día.
function formatDateEs(isoDate) {
  var parts = String(isoDate || '').split('-');
  if (parts.length !== 3) return isoDate || '';
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

// getAttributes() de un ListItem trae también atributos propios de listas
// (GLYPH_TYPE, LIST_ID, NESTING_LEVEL) que un elemento nuevo puede rechazar
// según el caso; para copiar el formato de forma confiable (negrita, tamaño,
// color, sangría, interlineado) se filtra a una lista fija de atributos de
// texto/párrafo en vez de copiar el objeto entero tal cual.
var COPYABLE_STYLE_ATTRS = [
  DocumentApp.Attribute.BOLD, DocumentApp.Attribute.ITALIC, DocumentApp.Attribute.UNDERLINE,
  DocumentApp.Attribute.STRIKETHROUGH, DocumentApp.Attribute.FONT_FAMILY, DocumentApp.Attribute.FONT_SIZE,
  DocumentApp.Attribute.FOREGROUND_COLOR, DocumentApp.Attribute.BACKGROUND_COLOR,
  DocumentApp.Attribute.INDENT_START, DocumentApp.Attribute.INDENT_END, DocumentApp.Attribute.INDENT_FIRST_LINE,
  DocumentApp.Attribute.LINE_SPACING, DocumentApp.Attribute.SPACING_BEFORE, DocumentApp.Attribute.SPACING_AFTER,
  DocumentApp.Attribute.HORIZONTAL_ALIGNMENT
];
function copyStyleAttrs(sourceAttrs) {
  var filtered = {};
  COPYABLE_STYLE_ATTRS.forEach(function(attr) {
    if (sourceAttrs[attr] !== undefined && sourceAttrs[attr] !== null) filtered[attr] = sourceAttrs[attr];
  });
  return filtered;
}

// Escribe hasta 3 ítems como viñetas debajo de la etiqueta indicada
// ("Fortalezas del empleado:", "Áreas de mejora:", "Recomendaciones del
// desempeño:"). "Fortalezas"/"Mejora" ya traen 3 viñetas en blanco
// preparadas en la plantilla y se reutilizan tal cual; "Recomendaciones"
// solo trae 1, así que para el 2do/3er ítem se inserta una viñeta nueva con
// el mismo estilo de lista en vez de pisar el párrafo de espaciado que le
// sigue (eso pisaba el título "RESULTADO DEL PERIODO DE PRUEBA" o quedaba
// con formato de espaciado en vez de viñeta).
function fillItemsBelow(body, labelText, items) {
  // items debe ser un arreglo de hasta 3 ítems. Si llegara un string suelto
  // se lo trata como un único ítem (y no como si fuera un arreglo de
  // caracteres, que es lo que pasa si se indexa un string directamente con
  // items[0], items[1], items[2] en Apps Script).
  var arr = Array.isArray(items) ? items : (items ? [items] : []);
  arr = arr.filter(function(v){ return v && String(v).trim(); }).map(function(v){ return String(v).trim(); });
  if (!arr.length) return;

  var found = body.findText(labelText);
  if (!found) return;
  var el = found.getElement();
  while (el && el.getType() !== DocumentApp.ElementType.LIST_ITEM && el.getType() !== DocumentApp.ElementType.PARAGRAPH) {
    el = el.getParent();
  }
  if (!el) return;

  var i = body.getChildIndex(el) + 1;
  var anchor = null;
  while (i < body.getNumChildren()) {
    var child = body.getChild(i);
    if (child.getType() === DocumentApp.ElementType.HORIZONTAL_RULE) { i++; continue; }
    if (child.getType() === DocumentApp.ElementType.LIST_ITEM) { anchor = child.asListItem(); break; }
    return; // la sección no tiene ninguna viñeta preparada para completar
  }
  if (!anchor) return;

  anchor.setText(arr[0]);
  var slot = i + 1;
  for (var n = 1; n < Math.min(arr.length, 3); n++) {
    var next = slot < body.getNumChildren() ? body.getChild(slot) : null;
    if (next && next.getType() === DocumentApp.ElementType.LIST_ITEM && next.asListItem().getListId() === anchor.getListId()) {
      // ya hay una viñeta en blanco lista para este ítem: se reutiliza.
      next.asListItem().setText(arr[n]);
    } else {
      // no quedan viñetas preparadas: se inserta una nueva con el mismo
      // estilo de lista que la primera, en vez de escribir sobre lo que
      // venga después (que puede no ser una viñeta en absoluto).
      var newItem = body.insertListItem(slot, arr[n]);
      newItem.setAttributes(copyStyleAttrs(anchor.getAttributes()));
      newItem.setListId(anchor);
    }
    slot++;
  }
}

// Los tres renglones de "RESULTADO DEL PERIODO DE PRUEBA" son un checklist
// nativo de Google Docs (lista con casillero tildable). ListItem.setChecked()
// no tira error pero tampoco se refleja de forma confiable en el PDF
// exportado, así que en vez de eso se convierte cada ítem en un párrafo de
// texto plano con "☐ "/"☑ " al principio — el mismo mecanismo que ya se usa
// para los casilleros de la tabla de criterios de arriba — para pintar solo
// el casillero y no toda la frase.
function convertResultadoChecklist(body, checkedPrefix) {
  var prefixes = ['APROBADO:', 'EXTENSIÓN DEL PERIODO DE PRUEBA:', 'NO APROBADO:'];
  var targets = [];
  for (var i = 0; i < body.getNumChildren(); i++) {
    var child = body.getChild(i);
    if (child.getType() !== DocumentApp.ElementType.LIST_ITEM) continue;
    var item = child.asListItem();
    var text = item.getText();
    for (var p = 0; p < prefixes.length; p++) {
      if (text.indexOf(prefixes[p]) === 0) {
        targets.push({ index: i, item: item, text: text, checked: prefixes[p] === checkedPrefix });
        break;
      }
    }
  }
  if (!targets.length) return;

  // "APROBADO" es siempre el primero de los tres, pegado al título
  // "RESULTADO DEL PERIODO DE PRUEBA" de arriba. Entre el título y
  // "APROBADO" la plantilla tiene un párrafo invisible de solo espaciado
  // con letra de 1pt. Ni "APROBADO" ni los otros dos especifican su propio
  // tamaño de letra (dependen del tamaño por defecto del documento, 11pt),
  // así que copiar los atributos de cualquiera de los tres nunca trae un
  // FONT_SIZE explícito para forzar — y el párrafo nuevo que se inserta en
  // el lugar de "APROBADO" hereda el 1pt del espaciador de al lado en vez
  // del 11pt por defecto. Por eso el tamaño se fuerza acá explícitamente.
  var referenceAttrs = copyStyleAttrs(targets[targets.length - 1].item.getAttributes());
  referenceAttrs[DocumentApp.Attribute.FONT_SIZE] = 11;

  // De atrás para adelante para que insertar/quitar párrafos no corra los
  // índices de los elementos que todavía faltan procesar.
  for (var t = targets.length - 1; t >= 0; t--) {
    var target = targets[t];
    var box = target.checked ? '☑ ' : '☐ ';
    var newPara = body.insertParagraph(target.index, box + target.text);
    newPara.setAttributes(referenceAttrs);
    body.removeChild(body.getChild(target.index + 1));
  }
}

function checkboxTrio(valor) {
  function box(n) { return (String(valor) === String(n) ? '☑ ' : '☐ ') + n; }
  return box(1) + ' ' + box(2) + ' ' + box(3);
}

// Completa los campos {{...}} de las tablas del encabezado celda por celda
// (igual que los casilleros de la tabla de criterios), en vez de usar
// body.replaceText() en todo el documento. body.replaceText() usa un motor
// de regex que en pruebas reales terminaba reemplazando el valor correcto
// en la celda equivocada cuando el texto de la celda quedaba dividido en
// más de un "run" interno — por eso "Nombre del empleado" y "Puesto"
// aparecían vacíos y sus valores se colaban en la celda de "Inicio del
// período de prueba".
//
// Dentro de cada celda tampoco se puede reemplazar el texto completo con
// setText(): la etiqueta ("NOMBRE Y APELLIDO") y el token ("{{Nombre del
// empleado}}") son dos "runs" con formato distinto (el token está en
// cursiva en la plantilla, para marcarlo como casillero a completar), y
// setText() aplana toda la celda a un solo estilo — eso era lo que hacía
// que el valor completado se viera con una letra distinta a la del resto
// del documento. Por eso acá se borra e inserta solo el texto del token en
// su lugar (sin tocar la etiqueta) y se le saca la cursiva al valor ya
// completado.
function fillHeaderTokens(body, data) {
  var values = {
    'Inicio del período de prueba': formatDateEs(data.fechaInicio),
    'Nombre del empleado': data.nombre || '',
    'Puesto': data.puesto || '',
    'Evaluador': data.evaluador || '',
    'Fecha de evaluación': formatDateEs(data.fechaEvaluacion)
  };
  var tokenRegex = /\{\{([^}]+)\}\}/;
  body.getTables().forEach(function(table){
    for (var r = 0; r < table.getNumRows(); r++) {
      var row = table.getRow(r);
      for (var c = 0; c < row.getNumCells(); c++) {
        var cell = row.getCell(c);
        var text = cell.editAsText();
        var cellText = text.getText();
        if (cellText.indexOf('{{') === -1) continue;
        var match;
        while ((match = tokenRegex.exec(cellText)) !== null) {
          var key = match[1].trim();
          var value = Object.prototype.hasOwnProperty.call(values, key) ? values[key] : '';
          var start = match.index;
          var end = start + match[0].length - 1;

          // Se guarda la fuente/tamaño/color del propio token ANTES de
          // borrarlo: si no queda ningún carácter pegado al lado después de
          // borrar, el texto nuevo hereda la fuente del párrafo (Times New
          // Roman, el respaldo de la plantilla) en vez del Arial que usa el
          // token, y se nota distinto al resto del documento.
          var fontFamily = text.getFontFamily(start);
          var fontSize = text.getFontSize(start);
          var color = text.getForegroundColor(start);

          text.deleteText(start, end);
          if (value) {
            text.insertText(start, value);
            var newEnd = start + value.length - 1;
            text.setItalic(start, newEnd, false);
            if (fontFamily) text.setFontFamily(start, newEnd, fontFamily);
            if (fontSize) text.setFontSize(start, newEnd, fontSize);
            if (color) text.setForegroundColor(start, newEnd, color);
          }
          cellText = text.getText();
        }
      }
    }
  });
}

// ---------- generación del PDF: se copia el documento original y solo se completan los valores ----------

function generarPdf(data) {
  var folder = getOrCreatePdfFolder();
  var criteria = data.criteria || {};

  var copyFile = DriveApp.getFileById(TEMPLATE_DOC_ID).makeCopy('tmp_evaluacion_' + new Date().getTime(), folder);
  var doc = DocumentApp.openById(copyFile.getId());
  var body = doc.getBody();

  // La plantilla usa tokens {{...}} dentro de celdas de tabla (ver
  // fillHeaderTokens más abajo para por qué no se usa body.replaceText()).
  fillHeaderTokens(body, data);

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
  var checkedPrefix = '';
  if (decision.indexOf('Aprobado') === 0) {
    checkedPrefix = 'APROBADO:';
  } else if (decision.indexOf('Extensión') === 0) {
    checkedPrefix = 'EXTENSIÓN DEL PERIODO DE PRUEBA:';
  } else if (decision.indexOf('No aprobado') === 0) {
    checkedPrefix = 'NO APROBADO:';
  }
  convertResultadoChecklist(body, checkedPrefix);

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
        // escalarla manteniendo proporción dentro de un tamaño fijo. El
        // límite queda apenas por debajo del espacio disponible en el
        // renglón para que no empuje el bloque de firma a la hoja siguiente.
        var maxW = 160, maxH = 50;
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
