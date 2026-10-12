import React from 'react';

export default function ExamStartModal({ exam, onClose, onConfirmStart }) {
  if (!exam) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        {/* Sheet Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            background: 'var(--secondary-container)',
            color: 'var(--on-secondary-container)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 28 }}>timer</span>
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Quy chế thi trực tuyến
            </span>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', marginTop: 2 }}>
              Xác nhận bắt đầu làm bài
            </h3>
          </div>
        </div>

        {/* Exam Title Badge Card */}
        <div style={{
          background: 'var(--surface-container-low)',
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          border: '1px solid var(--surface-container)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              background: 'var(--primary-fixed)',
              color: 'var(--on-primary-fixed)',
              padding: '2px 8px',
              borderRadius: 9999
            }}>
              Bản quyền ETS 2024
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--secondary)', fontWeight: 600 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified</span>
              Chuẩn format mới
            </span>
          </div>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>{exam.title}</h4>
          <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4 }}>
            Bộ đề luyện thi TOEIC cập nhật sát ma trận đề thi thực tế tại IIG Vietnam.
          </p>
        </div>

        {/* 3 Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
          <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 12, padding: 12, textAlign: 'center', border: '1px solid var(--surface-container)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--primary)' }}>assignment</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-surface)', display: 'block', marginTop: 2 }}>100</span>
            <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Câu hỏi</span>
          </div>
          <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 12, padding: 12, textAlign: 'center', border: '1px solid var(--surface-container)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--secondary)' }}>timer</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--secondary)', display: 'block', marginTop: 2 }}>75:00</span>
            <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Thời gian</span>
          </div>
          <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 12, padding: 12, textAlign: 'center', border: '1px solid var(--surface-container)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--on-tertiary-container)' }}>workspace_premium</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-surface)', display: 'block', marginTop: 2 }}>495</span>
            <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Điểm tối đa</span>
          </div>
        </div>

        {/* Section Breakdown List */}
        <div style={{ marginBottom: 18 }}>
          <h5 style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>format_list_bulleted</span>
            Cấu trúc bài thi Reading
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 10, background: 'var(--surface-container-low)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>5</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>Part 5: Hoàn thành câu</p>
                  <p style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Ngữ pháp & từ vựng đơn</p>
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>30 câu</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 10, background: 'var(--surface-container-low)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>6</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>Part 6: Hoàn thành đoạn văn</p>
                  <p style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Từ vựng ngữ cảnh & logic câu</p>
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>16 câu</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 10, background: 'var(--surface-container-low)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>7</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>Part 7: Đọc hiểu văn bản</p>
                  <p style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Đoạn đơn, đoạn đôi & đoạn ba</p>
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>54 câu</span>
            </div>
          </div>
        </div>

        {/* Notice Info Box */}
        <div style={{
          display: 'flex',
          gap: 10,
          padding: 12,
          borderRadius: 12,
          background: 'rgba(255, 219, 202, 0.4)',
          color: 'var(--tertiary-container)',
          fontSize: 12,
          marginBottom: 20
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#ea580c', flexShrink: 0 }}>info</span>
          <div>
            <strong>Lưu ý:</strong> Đồng hồ đếm ngược 75 phút sẽ chạy ngay sau khi bạn bấm Bắt đầu. Hệ thống sẽ tự động lưu từng câu và tự động nộp bài khi hết giờ.
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 10 }}>
          <button
            className="btn-cta btn-outline"
            onClick={onClose}
          >
            Hủy bỏ
          </button>
          <button
            className="btn-cta btn-primary"
            onClick={() => onConfirmStart(exam)}
          >
            <span>Bắt đầu làm bài</span>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
