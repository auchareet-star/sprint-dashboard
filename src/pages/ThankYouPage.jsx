const LOGO_URL = import.meta.env.BASE_URL + 'ayodia-logo-dark.png';

export default function ThankYouPage({ data, slideRef }) {
  return (
    <div
      ref={slideRef}
      className="slide"
      style={{
        background: 'radial-gradient(ellipse at 50% 50%, #1a1a2e 0%, #0f0f1a 60%, #0a0a12 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
      }}
    >
      {/* Decorative grid */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid2" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#FFFFFF" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid2)" />
      </svg>

      {/* Logo */}
      <img
        src={LOGO_URL}
        alt="Ayodia"
        style={{ width: 200, height: 200, objectFit: 'contain', position: 'relative', zIndex: 1 }}
      />

      {/* Thank you text */}
      <h1
        style={{
          fontSize: 64,
          fontWeight: 800,
          color: '#F59E0B',
          margin: 0,
          letterSpacing: '-0.02em',
          position: 'relative',
          zIndex: 1,
        }}
      >
        Thank You
      </h1>

      <p
        style={{
          fontSize: 20,
          color: '#9CA3AF',
          fontWeight: 400,
          margin: 0,
          position: 'relative',
          zIndex: 1,
        }}
      >
        Ayodia Co.,Ltd — บริษัท อโยเดีย จำกัด
      </p>
    </div>
  );
}
