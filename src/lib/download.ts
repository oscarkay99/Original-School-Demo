export function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const escapeCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  const content = [headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\n");
  downloadBlob(filename, content, "text/csv;charset=utf-8;");
}

export function openPrintWindow(title: string, bodyHtml: string) {
  const win = window.open("", "_blank");
  if (!win) return;

  win.document.write(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 32px; color: #0f172a; }
      h1 { margin: 0 0 8px; font-size: 24px; }
      p { color: #475569; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; font-size: 12px; }
      th { background: #f8fafc; text-transform: uppercase; letter-spacing: .04em; color: #64748b; }
      .meta { margin-bottom: 20px; font-size: 12px; color: #64748b; }
    </style>
  </head>
  <body>${bodyHtml}</body>
</html>`);
  win.document.close();
  win.focus();
  win.print();
}
