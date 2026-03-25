export default function KPICard({ label, value, subtitle, color = '#1E3A5F', large = false, delay = 0 }) {
  return (
    <div
      className={`card flex flex-col justify-center items-center animate-slide-up ${delay ? `animate-delay-${delay}` : ''}`}
      style={{
        padding: large ? '28px 24px' : '20px 16px',
        minHeight: large ? 150 : 110,
      }}
    >
      <div
        className="font-extrabold"
        style={{
          fontSize: large ? 52 : 40,
          color,
          lineHeight: 1,
          letterSpacing: '-0.03em',
        }}
      >
        {value}
      </div>
      <div
        className="font-medium mt-3 text-center"
        style={{
          fontSize: large ? 16 : 14,
          color: '#64748B',
          letterSpacing: '0.01em',
        }}
      >
        {label}
      </div>
      {subtitle && (
        <div
          className="mt-1.5 text-center"
          style={{
            fontSize: 13,
            color: '#94A3B8',
            fontWeight: 500,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}
