import React, { useState } from 'react';

export default function TestResults({
  resultData,
  onRetakeExam,
  onBackToList
}) {
  const [filterMode, setFilterMode] = useState('all'); // all | wrong | skipped

  if (!resultData) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <h3>Không tìm thấy dữ liệu kết quả thi.</h3>
        <button className="btn-cta btn-primary" style={{ marginTop: 16 }} onClick={onBackToList}>
          Trở về danh sách đề
        </button>
      </div>
    );
  }

  const {
    examTitle = 'ETS 2024 Test 01 - Reading',
    estimatedScore = 435,
    correctCount = 87,
    wrongCount = 9,
    skippedCount = 4,
    totalQuestions = 100,
    answers = []
  } = resultData;

  const accuracyPercent = Math.round((correctCount / (totalQuestions || 100)) * 100);

  // Filter review questions
  const filteredAnswers = answers.filter(item => {
    if (filterMode === 'all') return true;
    if (filterMode === 'wrong') return !item.isCorrect && item.selectedAnswer !== null;
    if (filterMode === 'skipped') return item.selectedAnswer === null;
    return true;
  });

  return (
    <div className="animate-fade-in" style={{ width: '100%', paddingBottom: 60 }}>
      {/* 1. Score Overview Hero Card */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 20,
        background: 'linear-gradient(135deg, #00236f 0%, #1e3a8a 50%, #006a61 100%)',
        padding: 24,
        color: '#fff',
        boxShadow: 'var(--shadow-xl)',
        marginBottom: 20
      }}>
        {/* Ambient decorative blur circles */}
        <div style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'rgba(137, 245, 231, 0.15)',
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 10 }}>
          {/* Tags */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              borderRadius: 9999,
              background: 'rgba(255,255,255,0.15)',
              fontSize: 12,
              fontWeight: 500
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>timer</span>
              75 phút hoàn thành
            </span>

            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              borderRadius: 9999,
              background: 'rgba(137, 245, 231, 0.25)',
              color: '#89f5e7',
              fontSize: 12,
              fontWeight: 600
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified</span>
              {examTitle}
            </span>
          </div>

          {/* Main Score Display */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#b6c4ff', fontWeight: 600 }}>
                Điểm ước tính Reading
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {estimatedScore}
                </span>
                <span style={{ fontSize: 18, color: '#b6c4ff', fontWeight: 600 }}>/ 495</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 6 }}>
                {correctCount}/{totalQuestions} câu đúng • Tỷ lệ chính xác <strong style={{ color: '#89f5e7' }}>{accuracyPercent}%</strong>
              </p>
            </div>

            {/* Radial Visual SVG */}
            <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 36 36" style={{ width: 80, height: 80, transform: 'rotate(-90deg)' }}>
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#89f5e7"
                  strokeDasharray={`${accuracyPercent}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 26, color: '#89f5e7' }}>military_tech</span>
              </div>
            </div>
          </div>

          {/* Proficiency Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
            marginTop: 16
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#89f5e7' }}>stars</span>
            <p style={{ fontSize: 13, color: '#fff' }}>
              Trình độ tương đương: <strong style={{ color: '#89f5e7' }}>{estimatedScore >= 400 ? 'C1 / B2+ (Advanced)' : estimatedScore >= 300 ? 'B2 (Intermediate)' : 'B1 (Pre-Intermediate)'}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Detailed Metric Cards (3 Columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {/* Correct */}
        <div style={{ background: 'rgba(134, 242, 228, 0.25)', borderRadius: 16, padding: 14, textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--secondary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--secondary)', display: 'block' }}>{correctCount}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)' }}>Câu đúng</span>
        </div>

        {/* Incorrect */}
        <div style={{ background: 'rgba(255, 218, 214, 0.4)', borderRadius: 16, padding: 14, textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--error)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--error)', display: 'block' }}>{wrongCount}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--error)' }}>Câu sai</span>
        </div>

        {/* Skipped */}
        <div style={{ background: 'var(--surface-container)', borderRadius: 16, padding: 14, textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-dim)', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>remove</span>
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--on-surface)', display: 'block' }}>{skippedCount}</span>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Bỏ qua</span>
        </div>
      </div>

      {/* 3. Review Mode Section */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--secondary)' }}>find_in_page</span>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>Xem lại chi tiết bài làm</h3>
          </div>
          <span style={{ fontSize: 12, color: 'var(--outline)' }}>{filteredAnswers.length} câu</span>
        </div>

        {/* Filter Pills */}
        <div className="chips-scroll" style={{ marginBottom: 16 }}>
          <button
            className={`filter-chip ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            Tất cả ({answers.length})
          </button>
          <button
            className={`filter-chip ${filterMode === 'wrong' ? 'active' : ''}`}
            onClick={() => setFilterMode('wrong')}
          >
            Câu sai ({wrongCount})
          </button>
          <button
            className={`filter-chip ${filterMode === 'skipped' ? 'active' : ''}`}
            onClick={() => setFilterMode('skipped')}
          >
            Bỏ qua ({skippedCount})
          </button>
        </div>

        {/* Question Review Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredAnswers.map((item) => {
            const isCorrect = item.isCorrect;
            const isSkipped = item.selectedAnswer === null;

            return (
              <div
                key={item.questionId || item.questionNo}
                style={{
                  background: 'var(--surface-container-lowest)',
                  borderRadius: 16,
                  padding: 16,
                  border: '1px solid var(--surface-container)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Meta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: isCorrect ? 'var(--secondary-container)' : isSkipped ? 'var(--surface-container)' : 'var(--error-container)',
                      color: isCorrect ? 'var(--secondary)' : isSkipped ? 'var(--outline)' : 'var(--error)',
                      fontSize: 13,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.questionNo}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--outline)' }}>
                      Câu hỏi {item.questionNo}
                    </span>
                  </div>

                  <span style={{
                    padding: '3px 8px',
                    borderRadius: 9999,
                    fontSize: 11,
                    fontWeight: 600,
                    background: isCorrect ? 'rgba(134, 242, 228, 0.4)' : isSkipped ? 'var(--surface-container)' : 'var(--error-container)',
                    color: isCorrect ? 'var(--secondary)' : isSkipped ? 'var(--outline)' : 'var(--error)'
                  }}>
                    {isCorrect ? '✓ Đúng (+5đ)' : isSkipped ? 'Chưa trả lời' : '✗ Sai'}
                  </span>
                </div>

                {/* Question content */}
                {item.content && (
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--on-surface)', marginBottom: 12, lineHeight: 1.5 }}>
                    {item.content}
                  </p>
                )}

                {/* Options display */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  {item.options?.map((opt) => {
                    const isUserChoice = item.selectedAnswer === opt.label;
                    const isKey = item.correctAnswer === opt.label;

                    let bg = 'var(--surface-container-low)';
                    let border = 'transparent';
                    let labelBg = 'var(--surface-container-lowest)';
                    let labelColor = 'var(--on-surface-variant)';

                    if (isKey) {
                      bg = 'rgba(134, 242, 228, 0.35)';
                      border = 'var(--secondary)';
                      labelBg = 'var(--secondary)';
                      labelColor = '#fff';
                    } else if (isUserChoice && !isCorrect) {
                      bg = 'rgba(255, 218, 214, 0.5)';
                      border = 'var(--error)';
                      labelBg = 'var(--error)';
                      labelColor = '#fff';
                    }

                    return (
                      <div
                        key={opt.label}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: 10,
                          background: bg,
                          border: `1px solid ${border}`
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            background: labelBg,
                            color: labelColor,
                            fontSize: 12,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {opt.label}
                          </span>
                          <span style={{ fontSize: 13, textDecoration: isUserChoice && !isCorrect ? 'line-through' : 'none' }}>
                            {opt.content}
                          </span>
                        </div>

                        {isKey && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
                            Đáp án đúng
                          </span>
                        )}

                        {isUserChoice && !isCorrect && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--error)', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>cancel</span>
                            Bạn chọn
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {item.explanation && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    padding: 10,
                    borderRadius: 10,
                    background: 'var(--surface-container-low)',
                    fontSize: 12,
                    color: 'var(--on-surface-variant)'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--secondary)', flexShrink: 0 }}>lightbulb</span>
                    <div>
                      <strong style={{ color: 'var(--secondary)' }}>Giải thích: </strong>
                      {item.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
        <button
          className="btn-cta btn-outline"
          onClick={onBackToList}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          <span>Danh sách đề</span>
        </button>
        <button
          className="btn-cta btn-primary"
          onClick={onRetakeExam}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>replay</span>
          <span>Làm lại đề này</span>
        </button>
      </div>
    </div>
  );
}
