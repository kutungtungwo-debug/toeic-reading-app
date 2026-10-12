import React, { useState } from 'react';
import { apiService } from '../services/api';

export default function Header({ onOpenAdmin, isMock, onToggleMock, onGoHome }) {
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(apiService.baseUrl);

  const handleSaveApiUrl = () => {
    localStorage.setItem('toeic_api_base_url', customApiUrl);
    apiService.baseUrl = customApiUrl;
    setShowApiConfig(false);
    window.location.reload();
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="brand-wrapper" onClick={onGoHome} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>auto_stories</span>
          </div>
          <div className="brand-text">
            <span>TOEIC Reading ETS</span>
            <h1>Luyện Thi Đọc</h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Mode Badge (Live API vs Demo Mode) */}
          <button
            onClick={onToggleMock}
            title={isMock ? "Đang ở chế độ Mock Data - Bấm để chuyển sang kết nối Backend API" : "Đang kết nối Backend Live - Bấm để dùng Mock Data"}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 12px',
              borderRadius: '9999px',
              fontSize: 12,
              fontWeight: 600,
              background: isMock ? 'var(--surface-container-high)' : 'var(--secondary-container)',
              color: isMock ? 'var(--on-surface-variant)' : 'var(--on-secondary-container)',
              border: '1px solid rgba(0,0,0,0.06)'
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: isMock ? '#f59e0b' : '#10b981',
                display: 'inline-block'
              }}
            />
            <span>{isMock ? 'Demo Mode' : 'Backend Live'}</span>
          </button>

          {/* Settings API button */}
          <button
            aria-label="Cài đặt API"
            onClick={() => setShowApiConfig(!showApiConfig)}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--surface-container)',
              color: 'var(--on-surface-variant)'
            }}
            title="Cấu hình kết nối API"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>settings</span>
          </button>

          {/* Admin Import button */}
          <button
            aria-label="Import Đề Word"
            onClick={onOpenAdmin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: 13,
              fontWeight: 600,
              background: 'var(--primary)',
              color: '#fff',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>upload_file</span>
            <span className="hidden-mobile">Import .docx</span>
          </button>
        </div>
      </div>

      {/* Config Dropdown/Sheet */}
      {showApiConfig && (
        <div style={{
          position: 'absolute',
          top: 64,
          right: 16,
          background: 'var(--surface-container-lowest)',
          borderRadius: 16,
          padding: 16,
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--surface-container-high)',
          width: 300,
          zIndex: 60
        }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>
            Cấu hình Backend API
          </h4>
          <p style={{ fontSize: 12, color: 'var(--outline)', marginBottom: 10 }}>
            Địa chỉ ASP.NET Core Web Host:
          </p>
          <input
            type="text"
            value={customApiUrl}
            onChange={(e) => setCustomApiUrl(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid var(--outline-variant)',
              fontSize: 13,
              marginBottom: 10
            }}
            placeholder="https://localhost:44311"
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowApiConfig(false)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                background: 'var(--surface-container)'
              }}
            >
              Đóng
            </button>
            <button
              onClick={handleSaveApiUrl}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                background: 'var(--secondary)',
                color: '#fff'
              }}
            >
              Lưu & Thử lại
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
