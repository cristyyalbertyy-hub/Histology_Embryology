export function parseCsvRows(text: string): { question: string; answer: string }[] {
  const rows = parseCsv(text);
  const out: { question: string; answer: string }[] = [];
  for (const row of rows) {
    if (row.length >= 2 && (row[0]?.trim() || row[1]?.trim())) {
      out.push({ question: row[0]!.trim(), answer: row[1]!.trim() });
    }
  }
  return out;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let i = 0;
  let inQuotes = false;

  const pushCell = () => {
    row.push(cell);
    cell = "";
  };

  const pushRow = () => {
    if (row.length > 0 || cell.length > 0) {
      pushCell();
      if (row.some((c) => c.length > 0)) rows.push(row);
    }
    row = [];
  };

  while (i < text.length) {
    const c = text[i]!;
    if (inQuotes) {
      if (c === '"') {
        const next = text[i + 1];
        if (next === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      cell += c;
      i += 1;
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (c === ",") {
      pushCell();
      i += 1;
      continue;
    }
    if (c === "\r" || c === "\n") {
      if (c === "\r" && text[i + 1] === "\n") i += 1;
      pushRow();
      i += 1;
      continue;
    }
    cell += c;
    i += 1;
  }
  pushRow();
  return rows;
}
