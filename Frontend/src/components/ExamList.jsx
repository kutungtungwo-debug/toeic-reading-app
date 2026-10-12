import React, { useState } from 'react';

export default function ExamList({
  exams,
  onSelectExam,
  onStartExam,
  onViewResult,
  onPreviewExam,
  onRefresh
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all | todo | in-progress | done | high-score
  const [selectedPart, setSelectedPart] = useState('full'); // full | part5 | part6 | part7

  // Thống kê bento tổng quan
  const completedCount = exams.filter(e => e.status === 'done').length;
  const totalCount = exams.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const bestScore = exams.reduce((highest, exam) => Math.max(highest, Number(exam.score) || 0), 0);
  const accuracyStats = exams.reduce((stats, exam) => {
    const correctCount = Number(exam.correctCount);
    const questionCount = Number(exam.totalQuestions);
    if (Number.isFinite(correctCount) && questionCount > 0) {
      stats.correct += correctCount;
      stats.total += questionCount;
    }
    return stats;
  }, { correct: 0, total: 0 });
  const accuracyPercent = accuracyStats.total > 0
    ? `${Math.round((accuracyStats.correct / accuracyStats.total) * 100)}%`
    : '—';

  // Lọc danh sách
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (exam.description && exam.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (activeFilter === 'all') return true;
    if (activeFilter === 'todo') return exam.status === 'todo';
    if (activeFilter === 'in-progress') return exam.status === 'in-progress';
    if (activeFilter === 'done') return exam.status === 'done';
    if (activeFilter === 'high-score') return (exam.score || 0) >= 400;
    return true;
  });

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      {/* 1. Header Overview Stats Bento */}
      <section className="bento-overview">
        <div className="bento-header">
          <div>
            <span className="bento-title-sub">Lộ trình rèn luyện</span>
            <h2 className="bento-title-main">Đề thi TOEIC Reading</h2>
          </div>
          <div className="bento-badge-icon">
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>verified</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: 'var(--on-surface-variant)' }}>
          <span>Tiến độ tổng quan</span>
          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
            {totalCount > 0 ? `Đã hoàn thành ${completedCount}/${totalCount} đề` : 'Chưa có đề công khai'}
          </span>
        </div>

        {/* Progress bar */}
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* 3 Metrics Grid */}
        <div className="bento-stats-grid">
          <div className="bento-stat-item">
            <span className="bento-stat-label">Điểm cao nhất</span>
            <span className="bento-stat-val">{bestScore > 0 ? bestScore : '—'}</span>
          </div>
          <div className="bento-stat-item">
            <span className="bento-stat-label">Độ chính xác</span>
            <span className="bento-stat-val" style={{ color: 'var(--secondary)' }}>{accuracyPercent}</span>
          </div>
          <div className="bento-stat-item">
            <span className="bento-stat-label">Thời gian TB</span>
            <span className="bento-stat-val" style={{ color: 'var(--on-surface)' }}>—</span>
          </div>
        </div>
      </section>

      {/* 2. Controls: Search Bar & Filters */}
      <section className="controls-section">
        {/* Search input */}
        <div className="search-bar-wrapper">
          <span className="material-symbols-outlined search-icon-left" style={{ fontSize: 22 }}>search</span>
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm đề thi, mã đề ETS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchTerm('')}
              aria-label="Xóa tìm kiếm"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
            </button>
          )}
        </div>

        {/* Quick Filter Chips */}
        <div className="chips-scroll">
          <button
            className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>checklist</span>
            <span>Tất cả</span>
          </button>
          <button
            className={`filter-chip ${activeFilter === 'todo' ? 'active' : ''}`}
            onClick={() => setActiveFilter('todo')}
          >
            <span>Chưa làm</span>
          </button>
          <button
            className={`filter-chip ${activeFilter === 'in-progress' ? 'active' : ''}`}
            onClick={() => setActiveFilter('in-progress')}
          >
            <span>Đang dở</span>
          </button>
          <button
            className={`filter-chip ${activeFilter === 'done' ? 'active' : ''}`}
            onClick={() => setActiveFilter('done')}
          >
            <span>Đã làm</span>
          </button>
          <button
            className={`filter-chip ${activeFilter === 'high-score' ? 'active' : ''}`}
            onClick={() => setActiveFilter('high-score')}
          >
            <span>Điểm cao nhất</span>
          </button>
        </div>

        {/* Part Quick Filter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', fontSize: 12, color: 'var(--outline)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--secondary)' }}>tune</span>
            Phân loại Part:
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {['full', 'part5', 'part6', 'part7'].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPart(p)}
                style={{
                  padding: '3px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: selectedPart === p ? 600 : 400,
                  background: selectedPart === p ? 'var(--surface-container-highest)' : 'var(--surface-container)',
                  color: selectedPart === p ? 'var(--primary)' : 'var(--on-surface-variant)'
                }}
              >
                {p === 'full' ? 'Full Test' : p === 'part5' ? 'Part 5' : p === 'part6' ? 'Part 6' : 'Part 7'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Exam Cards List */}
      <section className="exam-cards-list">
        {filteredExams.length === 0 && (
          <div role="status" style={{
            padding: '28px 20px',
            borderRadius: 16,
            background: 'var(--surface-container-lowest)',
            color: 'var(--on-surface-variant)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span className="material-symbols-outlined" style={{ display: 'block', fontSize: 32, marginBottom: 8, color: 'var(--secondary)' }}>
              {exams.length === 0 ? 'menu_book' : 'search_off'}
            </span>
            <strong style={{ display: 'block', color: 'var(--primary)', marginBottom: 4 }}>
              {exams.length === 0 ? 'Chưa có đề thi được xuất bản' : 'Không tìm thấy đề thi phù hợp'}
            </strong>
            <span style={{ fontSize: 13 }}>
              {exams.length === 0
                ? 'Đề thi sẽ xuất hiện tại đây sau khi giảng viên rà soát và xuất bản.'
                : 'Hãy thử thay đổi từ khóa hoặc bộ lọc.'}
            </span>
            {exams.length === 0 && onRefresh && (
              <div style={{ marginTop: 12 }}>
                <button className="btn-cta btn-outline" onClick={onRefresh}>Tải lại danh sách</button>
              </div>
            )}
          </div>
        )}
        {filteredExams.map((exam) => {
          const isDone = exam.status === 'done';
          const isInProgress = exam.status === 'in-progress';
          const isTodo = !isDone && !isInProgress;

          return (
            <article key={exam.id} className="exam-card">
              <div>
                <div className="exam-card-top">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`tag-badge ${isDone ? 'tag-done' : isInProgress ? 'tag-in-progress' : 'tag-new'}`}>
                        {isDone ? 'Đã hoàn thành' : isInProgress ? 'Đang làm dở' : exam.tag || 'Mới nhất'}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>bolt</span>
                        {exam.badge || 'ETS Format'}
                      </span>
                    </div>
                    <h3 className="exam-title">{exam.title}</h3>
                    {exam.description && (
                      <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4 }}>
                        {exam.description}
                      </p>
                    )}
                  </div>

                  {isDone && exam.score && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--secondary)' }}>
                        {exam.score}
                        <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--outline)' }}>/495</span>
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--on-surface-variant)', display: 'block' }}>
                        {exam.correctCount ? `${exam.correctCount}/100 câu đúng` : 'Đã có kết quả'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Score bar for Done cards */}
                {isDone && (
                  <div style={{ width: '100%', height: 6, background: 'var(--surface-container-high)', borderRadius: 9999, margin: '8px 0 12px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--secondary)', width: `${Math.round(((exam.score || 400) / 495) * 100)}%` }} />
                  </div>
                )}

                {/* Progress bar for In-progress cards */}
                {isInProgress && (
                  <div style={{ width: '100%', height: 6, background: 'var(--surface-container-high)', borderRadius: 9999, margin: '8px 0 12px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--on-tertiary-container)', width: '32%' }} />
                  </div>
                )}

                {/* Meta details */}
                <div className="exam-meta-row">
                  <div className="meta-item">
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--outline)' }}>help_center</span>
                    <span>{exam.totalQuestions || 100} câu</span>
                  </div>
                  <div className="meta-item">
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--outline)' }}>schedule</span>
                    <span>{exam.durationMinutes || 75} phút</span>
                  </div>
                  <div className="meta-item">
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: isDone ? 'var(--primary)' : isInProgress ? 'var(--tertiary)' : 'var(--secondary)' }}>
                      {isDone ? 'task_alt' : isInProgress ? 'pending' : 'radio_button_unchecked'}
                    </span>
                    <span style={{ fontWeight: 500, color: isDone ? 'var(--primary)' : isInProgress ? 'var(--tertiary)' : 'var(--secondary)' }}>
                      {isDone ? (exam.lastAttemptDate || 'Đã nộp') : isInProgress ? 'Còn 48 phút' : 'Chưa làm'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: 12 }}>
                {isTodo && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
                    <button
                      className="btn-cta btn-primary"
                      onClick={() => onSelectExam(exam)}
                    >
                      <span>Bắt đầu làm bài</span>
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
                    </button>
                    {onPreviewExam && (
                      <button
                        className="btn-cta btn-outline"
                        onClick={() => onPreviewExam(exam)}
                        title="Giảng viên: Rà soát đề thi"
                        style={{ padding: '0 12px' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>rate_review</span>
                      </button>
                    )}
                  </div>
                )}

                {isInProgress && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
                    <button
                      className="btn-cta btn-navy"
                      onClick={() => onStartExam(exam)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>play_arrow</span>
                      <span>Tiếp tục làm bài</span>
                    </button>
                    {onPreviewExam && (
                      <button
                        className="btn-cta btn-outline"
                        onClick={() => onPreviewExam(exam)}
                        title="Giảng viên: Rà soát đề thi"
                        style={{ padding: '0 12px' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>rate_review</span>
                      </button>
                    )}
                  </div>
                )}

                {isDone && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr auto', gap: 8 }}>
                    <button
                      className="btn-cta btn-outline"
                      onClick={() => onSelectExam(exam)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>replay</span>
                      <span>Làm lại</span>
                    </button>
                    <button
                      className="btn-cta btn-navy"
                      onClick={() => onViewResult(exam)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>query_stats</span>
                      <span>Xem kết quả</span>
                    </button>
                    {onPreviewExam && (
                      <button
                        className="btn-cta btn-outline"
                        onClick={() => onPreviewExam(exam)}
                        title="Giảng viên: Rà soát đề thi"
                        style={{ padding: '0 12px' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>rate_review</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
