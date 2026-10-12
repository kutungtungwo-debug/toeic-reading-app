import React, { useState } from 'react';
import { apiService } from '../services/api';

export default function AdminImportModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(75);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Vui lòng chọn file tài liệu Word .docx.');
      return;
    }
    if (!title.trim()) {
      setError('Vui lòng nhập tên đề thi.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await apiService.importWordExam(file, title.trim(), Number(durationMinutes));
      setMessage(`Import đề thi thành công! Đã tạo đề với mã ID: ${res.examId || 'Mới'}.`);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Lỗi khi upload file .docx tới Backend API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="sheet-handle" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>upload_file</span>
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>
                Import Đề Thi Word (.docx)
              </h3>
              <p style={{ fontSize: 12, color: 'var(--outline)' }}>
                Theo chuẩn cấu trúc TOEIC Reading ETS
              </p>
            </div>
          </div>
          <button onClick={onClose}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--outline)' }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* File Picker */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 6 }}>
              Chọn file đề (.docx) *
            </label>
            <input
              type="file"
              accept=".docx"
              onChange={(e) => setFile(e.target.files[0] || null)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 10,
                border: '1px dashed var(--outline)',
                background: 'var(--surface-container-low)',
                fontSize: 13
              }}
            />
            {file && (
              <p style={{ fontSize: 11, color: 'var(--secondary)', fontWeight: 600, marginTop: 4 }}>
                Đã chọn: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 6 }}>
              Tên đề thi *
            </label>
            <input
              type="text"
              placeholder="Ví dụ: ETS TOEIC 2024 - Test 03"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid var(--outline-variant)',
                fontSize: 14,
                color: 'var(--on-surface)'
              }}
            />
          </div>

          {/* Duration */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 6 }}>
              Thời lượng thi (phút)
            </label>
            <input
              type="number"
              min="1"
              max="180"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid var(--outline-variant)',
                fontSize: 14,
                color: 'var(--on-surface)'
              }}
            />
          </div>

          {/* Messages */}
          {error && (
            <div style={{ padding: 10, borderRadius: 8, background: 'var(--error-container)', color: 'var(--on-error-container)', fontSize: 12 }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{ padding: 10, borderRadius: 8, background: 'var(--secondary-container)', color: 'var(--on-secondary-container)', fontSize: 12 }}>
              {message}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn-cta btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-cta btn-primary" disabled={loading}>
              {loading ? 'Đang tải lên...' : 'Bắt đầu Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
