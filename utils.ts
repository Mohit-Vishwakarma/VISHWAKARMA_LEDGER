interface CsvExportOptions<T> {
  data: T[];
  headers: { key: keyof T; label: string }[];
  filename?: string;
}

export function exportToCsv<T extends Record<string, any>>({
  data,
  headers,
  filename = 'export.csv',
}: CsvExportOptions<T>): void {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  const csvHeader = headers.map(h => `"${h.label}"`).join(',');

  const csvRows = data.map(row => {
    return headers
      .map(header => {
        const value = row[header.key as keyof T];
        const stringValue = value === null || value === undefined ? '' : String(value);
        // Escape double quotes by doubling them
        const escapedValue = stringValue.replace(/"/g, '""');
        return `"${escapedValue}"`;
      })
      .join(',');
  });

  const csvContent = [csvHeader, ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
