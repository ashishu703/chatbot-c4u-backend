const { parse } = require('csv-parse/sync');

const EXPORT_HEADERS = ['name', 'mobile', 'email', 'tag', 'source'];

function areMobileNumbersFilled(array) {
  return array.every((item) => (item.mobile || item.phone || '').toString().trim());
}

function hasValidCountryCode(array) {
  const re = /^(\+91\d{10}|\d{10})$/;
  return array.every((item) => {
    const m = (item.mobile || item.phone || '').toString().trim().replace(/\s/g, '');
    return m && re.test(m);
  });
}

function parseCSVFile(fileData) {
  try {
    const records = parse(fileData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });
    return records;
  } catch (error) {
    console.error("Error parsing CSV:", error);
    return null;
  }
}

function normalizeImportRow(row) {
  const raw = (row.mobile || row.phone || '').toString().trim().replace(/\s/g, '');
  const mobile = raw.startsWith('+91') ? raw : (raw.length === 10 ? `+91${raw}` : null);
  const name = (row.name || row.Name || '').toString().trim();
  if (!mobile || !name) return null;
  return {
    name,
    mobile,
    email: (row.email || '').toString().trim() || undefined,
    tag: (row.tag || row.phonebook_name || '').toString().trim() || undefined,
    source: (row.source || 'csv_import').toString().trim(),
  };
}

function escapeCSV(val) {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toExportCSV(contacts, phonebookMap = {}) {
  const header = EXPORT_HEADERS.join(',');
  const rows = contacts.map((c) => {
    const tag = phonebookMap[c.phonebook_id] || c.phonebook_name || '';
    const mobile = c.mobile || c.phone || '';
    return [c.name, mobile, c.email || '', tag, c.source || 'manual']
      .map(escapeCSV)
      .join(',');
  });
  return [header, ...rows].join('\n');
}

function toExportJSON(contacts, phonebookMap = {}) {
  return JSON.stringify(
    contacts.map((c) => ({
      name: c.name || '',
      mobile: c.mobile || c.phone || '',
      email: c.email || '',
      tag: phonebookMap[c.phonebook_id] || c.phonebook_name || '',
      source: c.source || 'manual',
    })),
    null,
    2
  );
}

module.exports = {
  areMobileNumbersFilled,
  hasValidCountryCode,
  parseCSVFile,
  normalizeImportRow,
  toExportCSV,
  toExportJSON,
  EXPORT_HEADERS,
};
