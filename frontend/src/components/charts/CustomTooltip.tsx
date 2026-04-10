export function CustomTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      padding: '10px 14px',
      boxShadow: 'var(--shadow-md)',
    }}>
      {label && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
          {label}
        </div>
      )}
      {payload.map((entry: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color || entry.fill }} />
          <span style={{ color: 'var(--text-secondary)' }}>{entry.name}:</span>
          <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
            {formatter ? formatter(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}
