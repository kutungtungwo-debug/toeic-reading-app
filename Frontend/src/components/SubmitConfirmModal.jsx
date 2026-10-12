import React from 'react';

export default function SubmitConfirmModal({
  isOpen,
  onClose,
  onConfirmSubmit,
  answeredCount,
  totalCount,
  flaggedCount,
  remainingSeconds
}) {
  if (!isOpen) return null;

  const unansweredCount = Math.max(0, totalCount - answeredCount);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const isTimeCritical = remainingSeconds <= 300; // < 5 mins
  const isExpired = remainingSeconds <= 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        {/* Time Critical Warning Banner */}
        {isTimeCritical && !isExpired && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 12,
            background: 'var(--error-container)',
            color: 'var(--on-error-container)',
            marginBottom: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--error)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>alarm</span>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--error)', textTransform: 'uppercase' }}>
                  Sắp hết thời gian!
                </p>
                <p style={{ fontSize: 16, fontWeight: 800 }}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </p>
              </div>
            </div>
          </div>
        )}

        {isExpired && (
          <div style={{
            padding: '12px 14px',
            borderRadius: 12,
            background: 'var(--on-surface)',
            color: '#fff',
            marginBottom: 16
          }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--tertiary-fixed)' }}>
              Đã hết 75 phút làm bài
            </h4>
            <p style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>
              Hệ thống tự động ghi nhận và nộp bài thi. Tất cả lựa chọn đã được khóa an toàn.
            </p>
          </div>
        )}

        {/* Title & Reassurance Context */}
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'var(--surface-container-high)',
            color: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 28 }}>fact_check</span>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
            Bạn có chắc chắn muốn nộp bài?
          </h3>
          <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 4 }}>
            Kiểm tra kỹ các câu chưa điền và câu đang đánh dấu để đạt điểm TOEIC tối đa.
          </p>
        </div>

        {/* Real-time Metrics Bento Card */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          background: 'var(--surface-container-low)',
          padding: 10,
          borderRadius: 16,
          marginBottom: 18
        }}>
          {/* Answered */}
          <div style={{ background: '#fff', padding: 12, borderRadius: 10, textAlign: 'center' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--secondary)', margin: '0 auto 4px' }} />
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--secondary)', display: 'block' }}>
              {answeredCount}
            </span>
            <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Đã trả lời</span>
            <span style={{ fontSize: 11, color: 'var(--secondary)', fontWeight: 600, display: 'block' }}>
              {Math.round((answeredCount / (totalCount || 100)) * 100)}%
            </span>
          </div>

          {/* Unanswered */}
          <div style={{ background: '#fff', padding: 12, borderRadius: 10, textAlign: 'center' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--tertiary-fixed-variant)', margin: '0 auto 4px' }} />
            <span style={{ fontSize: 20, fontWeight: 800, color: unansweredCount > 0 ? '#ea580c' : 'var(--outline)', display: 'block' }}>
              {unansweredCount}
            </span>
            <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Chưa làm</span>
          </div>

          {/* Flagged */}
          <div style={{ background: '#fff', padding: 12, borderRadius: 10, textAlign: 'center' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', margin: '0 auto 4px' }} />
            <span style={{ fontSize: 20, fontWeight: 800, color: '#d97706', display: 'block' }}>
              {flaggedCount}
            </span>
            <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Đã gắn cờ</span>
          </div>
        </div>

        {/* Warning if there are unanswered */}
        {unansweredCount > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: 10,
            borderRadius: 10,
            background: 'rgba(255, 218, 214, 0.5)',
            color: 'var(--on-error-container)',
            fontSize: 12,
            marginBottom: 20
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--error)' }}>warning</span>
            <span>Bạn vẫn còn <strong>{unansweredCount} câu chưa làm</strong>. Các câu này sẽ bị tính 0 điểm nếu nộp ngay!</span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 10 }}>
          <button
            className="btn-cta btn-outline"
            onClick={onClose}
          >
            Làm tiếp
          </button>
          <button
            className="btn-cta btn-navy"
            onClick={onConfirmSubmit}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
            <span>Xác nhận nộp bài</span>
          </button>
        </div>
      </div>
    </div>
  );
}
