import { T } from '../utils/typography';

const LOGO_URL = import.meta.env.BASE_URL + 'ayodia-logo-dark.png';

export default function CoverPage({ data, slideRef }) {
  const meta = data.sprintGoals?.meta || {};
  const sprintName = meta.sprint || 'Sprint';
  const sprintNum = sprintName.replace(/\D/g, '') || '';
  const duration =
    meta.startDate && meta.endDate
      ? `${meta.startDate} - ${meta.endDate}`
      : '';

  return (
    <div
      ref={slideRef}
      className="slide"
      style={{
        background: 'radial-gradient(ellipse at 70% 50%, #1a1a2e 0%, #0f0f1a 60%, #0a0a12 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative grid lines */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#FFFFFF" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Decorative dots */}
      <div style={{ position: 'absolute', top: 80, right: 160, width: 200, height: 200, opacity: 0.05 }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          {Array.from({ length: 8 }).map((_, row) =>
            Array.from({ length: 8 }).map((_, col) => (
              <circle key={`${row}-${col}`} cx={col * 25 + 12} cy={row * 25 + 12} r="2" fill="#FFFFFF" />
            ))
          )}
        </svg>
      </div>

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '0 120px',
          gap: 80,
        }}
      >
        {/* Logo */}
        <div style={{ flexShrink: 0 }}>
          <img
            src={LOGO_URL}
            alt="Ayodia"
            style={{ width: 320, height: 320, objectFit: 'contain' }}
          />
        </div>

        {/* Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h1
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: '#F59E0B',
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            HA.OS
            <br />
            Sprint review (SP.{sprintNum})
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
            <span style={{ fontSize: T.body, color: '#D1D5DB', fontWeight: 500 }}>
              Ayodia Co.,Ltd
            </span>
            <span style={{ fontSize: T.body, color: '#D1D5DB', fontWeight: 500 }}>
              บริษัท อโยเดีย จำกัด
            </span>
          </div>

          {duration && (
            <span style={{ fontSize: T.label, color: '#9CA3AF', fontWeight: 400, marginTop: 4 }}>
              {duration}
            </span>
          )}
        </div>
      </div>

      {/* Bottom certification badges area */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 120,
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            padding: '6px 16px',
            background: '#FFFFFF',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            color: '#1E3A5F',
            letterSpacing: '0.02em',
          }}
        >
          CMMI DEV ML3 APPRAISED
        </div>
        <div
          style={{
            padding: '6px 16px',
            background: '#FFFFFF',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            color: '#1E3A5F',
            letterSpacing: '0.02em',
          }}
        >
          ISO/IEC 29110
        </div>
      </div>
    </div>
  );
}
