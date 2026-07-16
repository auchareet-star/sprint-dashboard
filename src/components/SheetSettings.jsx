import { useState } from 'react';
import { getSheetId, setSheetId, isCustomSheetId } from '../data/googleSheets';

export default function SheetSettings() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const handleOpen = () => {
    setValue(getSheetId());
    setOpen(true);
  };

  const handleSave = () => {
    setSheetId(value);
    window.location.reload();
  };

  const handleReset = () => {
    setSheetId('');
    window.location.reload();
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleOpen}
        className="cursor-pointer flex items-center justify-center"
        title="Sheet Settings"
        style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#475569' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: 6, zIndex: 99, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', padding: 14, width: 340 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 8 }}>Google Sheet Source</div>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="วาง Sheet ID หรือ URL ที่นี่"
              style={{ width: '100%', fontSize: 12, padding: '8px 10px', borderRadius: 6, border: '1px solid #E2E8F0', marginBottom: 10, boxSizing: 'border-box' }}
              autoFocus
            />
            <div className="flex items-center" style={{ justifyContent: isCustomSheetId() ? 'space-between' : 'flex-end' }}>
              {isCustomSheetId() && (
                <button
                  onClick={handleReset}
                  className="cursor-pointer"
                  style={{ fontSize: 11, fontWeight: 600, padding: '6px 4px', border: 'none', background: 'transparent', color: '#94A3B8' }}
                >
                  ใช้ Sheet เริ่มต้น
                </button>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="cursor-pointer"
                  style={{ fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 6, border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#475569' }}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSave}
                  disabled={!value.trim()}
                  className="cursor-pointer"
                  style={{ fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 6, border: 'none', background: value.trim() ? 'linear-gradient(135deg, #1E3A5F, #6366F1)' : '#CBD5E1', color: '#FFFFFF' }}
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
