const STATUS_MAP: Record<string, string> = {
  Low: 'Zu niedrig',
  High: 'Zu hoch',
  Ok: 'Okay',
  OK: 'Okay',
  ok: 'Okay',
  Normal: 'Okay',
};

export function fmt(value: unknown): string {
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return n.toLocaleString('de-DE', { maximumFractionDigits: 1 });
}

export function translateStatus(status: string | undefined | null): string {
  if (!status) return 'Unbekannt';
  return STATUS_MAP[status] ?? status;
}

export function statusCls(status: string | undefined | null): 'ok' | 'warning' | 'problem' {
  if (!status) return 'warning';
  return status === 'Low' || status === 'High' ? 'problem' : 'ok';
}
