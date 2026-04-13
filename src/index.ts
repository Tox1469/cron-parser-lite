// 5-field cron: minute hour day-of-month month day-of-week
// Supports: * , - / and numeric ranges. No names.

export interface ParsedCron {
  minute: Set<number>;
  hour: Set<number>;
  dom: Set<number>;
  month: Set<number>;
  dow: Set<number>;
}

const RANGES: [number, number][] = [
  [0, 59], // minute
  [0, 23], // hour
  [1, 31], // dom
  [1, 12], // month
  [0, 6], // dow (0 = Sunday)
];

function expandField(field: string, [lo, hi]: [number, number]): Set<number> {
  const out = new Set<number>();
  for (const part of field.split(",")) {
    const [rangePart, stepPart] = part.split("/");
    const step = stepPart ? parseInt(stepPart, 10) : 1;
    let a = lo;
    let b = hi;
    if (rangePart !== "*") {
      if (rangePart.includes("-")) {
        const [x, y] = rangePart.split("-").map((n) => parseInt(n, 10));
        a = x;
        b = y;
      } else {
        a = parseInt(rangePart, 10);
        b = stepPart ? hi : a;
      }
    }
    if (isNaN(a) || isNaN(b) || a < lo || b > hi || step <= 0) {
      throw new Error(`Invalid cron field: ${field}`);
    }
    for (let v = a; v <= b; v += step) out.add(v);
  }
  return out;
}

export function parse(expr: string): ParsedCron {
  const fields = expr.trim().split(/\s+/);
  if (fields.length !== 5) throw new Error("Cron must have 5 fields");
  const [mi, h, dom, mo, dow] = fields;
  return {
    minute: expandField(mi, RANGES[0]),
    hour: expandField(h, RANGES[1]),
    dom: expandField(dom, RANGES[2]),
    month: expandField(mo, RANGES[3]),
    dow: expandField(dow, RANGES[4]),
  };
}

export function nextRun(expr: string, from: Date = new Date()): Date {
  const p = parse(expr);
  const d = new Date(from.getTime());
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() + 1);
  for (let i = 0; i < 366 * 24 * 60; i++) {
    if (
      p.month.has(d.getMonth() + 1) &&
      p.dom.has(d.getDate()) &&
      p.dow.has(d.getDay()) &&
      p.hour.has(d.getHours()) &&
      p.minute.has(d.getMinutes())
    ) {
      return d;
    }
    d.setMinutes(d.getMinutes() + 1);
  }
  throw new Error("No matching run within one year");
}

export function matches(expr: string, date: Date): boolean {
  const p = parse(expr);
  return (
    p.minute.has(date.getMinutes()) &&
    p.hour.has(date.getHours()) &&
    p.dom.has(date.getDate()) &&
    p.month.has(date.getMonth() + 1) &&
    p.dow.has(date.getDay())
  );
}
