// Biblioteca Calibre → Kindle. Se ejecuta con TU cuenta de Google.
const KINDLE_EMAIL = 'PON_AQUI_TU_DIRECCION@kindle.com';
const SECRET = 'PON_AQUI_UNA_CLAVE_LARGA_INVENTADA';

function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.t !== SECRET) return salida({ ok: false, error: 'clave incorrecta' });
    if (!p.id) return salida({ ok: false, error: 'falta el identificador del archivo' });
    const file = DriveApp.getFileById(p.id);
    const name = String(p.name || file.getName()).replace(/[\\/:*?"<>|]/g, '_');
    const ext = name.split('.').pop().toLowerCase();
    const tipos = { epub: 'application/epub+zip', pdf: 'application/pdf', txt: 'text/plain', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', doc: 'application/msword', rtf: 'application/rtf', htm: 'text/html', html: 'text/html' };
    if (!tipos[ext]) return salida({ ok: false, error: 'formato no admitido: ' + ext });
    if (file.getSize() > 25 * 1024 * 1024) return salida({ ok: false, error: 'archivo demasiado grande (máximo 25 MB)' });
    const blob = file.getBlob().setName(name).setContentType(tipos[ext]);
    MailApp.sendEmail({ to: KINDLE_EMAIL, subject: name, body: 'Enviado desde Biblioteca Calibre.', attachments: [blob] });
    return salida({ ok: true, name: name });
  } catch (err) {
    return salida({ ok: false, error: String(err) });
  }
}

function salida(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Ejecuta esta función una vez desde el editor para dar los permisos.
function autorizar() {
  DriveApp.getRootFolder();
  MailApp.getRemainingDailyQuota();
}
