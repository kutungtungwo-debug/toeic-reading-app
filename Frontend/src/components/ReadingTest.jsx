import React, { useState, useEffect, useMemo } from 'react';
import SubmitConfirmModal from './SubmitConfirmModal';

export default function ReadingTest({
  examData,
  attemptId,
  initialAnswers = {},
  initialDurationMinutes = 75,
  onSaveAnswer,
  onSubmitExam,
  onQuit
}) {
  // Tập hợp danh sách phẳng toàn bộ câu hỏi (100 câu)
  const allQuestions = useMemo(() => {
    const list = [];
    if (!examData?.parts) return list;

    examData.parts.forEach(part => {
      // Câu hỏi lẻ (Part 5)
      if (part.questions && part.questions.length > 0) {
        part.questions.forEach(q => {
          list.push({
            ...q,
            partNumber: part.partNumber,
            partTitle: part.title,
            passage: null
          });
        });
      }

      // Nhóm câu hỏi có đoạn văn (Part 6 & 7)
      if (part.groups && part.groups.length > 0) {
        part.groups.forEach(group => {
          const passage = group.passages?.[0] || null;
          if (group.questions) {
            group.questions.forEach(q => {
              list.push({
                ...q,
                partNumber: part.partNumber,
                partTitle: part.title,
                passageGroup: group,
                passage
              });
            });
          }
        });
      }
    });

    return list.sort((a, b) => a.questionNo - b.questionNo);
  }, [examData]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [passageCollapsed, setPassageCollapsed] = useState(false);

  // Countdown Timer
  const [secondsLeft, setSecondsLeft] = useState(initialDurationMinutes * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleTimeExpired = () => {
    setShowSubmitModal(false);
    onSubmitExam(answers);
  };

  const currentQuestion = allQuestions[currentIndex] || null;

  // Lựa chọn hoặc hủy lựa chọn đáp án
  const handleSelectOption = (label) => {
    if (!currentQuestion) return;
    if (secondsLeft <= 0) return; // Khóa quyền chọn khi hết thời gian thi

    // Cho phép hủy lựa chọn nếu bấm lại đáp án đang chọn
    if (answers[currentQuestion.id] === label) {
      const newAnswers = { ...answers };
      delete newAnswers[currentQuestion.id];
      setAnswers(newAnswers);
      onSaveAnswer(attemptId, currentQuestion.id, null);
      return;
    }

    // Thay đổi lựa chọn
    const newAnswers = { ...answers, [currentQuestion.id]: label };
    setAnswers(newAnswers);
    onSaveAnswer(attemptId, currentQuestion.id, label);
  };

  // Toggle gắn cờ
  const toggleFlag = (qId) => {
    const newSet = new Set(flaggedQuestions);
    if (newSet.has(qId)) {
      newSet.delete(qId);
    } else {
      newSet.add(qId);
    }
    setFlaggedQuestions(newSet);
  };

  // Nhảy tới câu hỏi
  const jumpToQuestion = (index) => {
    if (index >= 0 && index < allQuestions.length) {
      setCurrentIndex(index);
      setShowPalette(false);
    }
  };

  // Chuyển Part
  const jumpToPart = (partNum) => {
    const idx = allQuestions.findIndex(q => q.partNumber === partNum);
    if (idx !== -1) {
      setCurrentIndex(idx);
    }
  };

  // Định dạng thời gian
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isTimeCritical = secondsLeft <= 300;

  const answeredCount = Object.keys(answers).length;
  const totalCount = allQuestions.length || 100;

  return (
    <div className="animate-fade-in" style={{ width: '100%', paddingBottom: 80 }}>
      {/* 1. Header Bar: Timer & Quick Switchers */}
      <section style={{
        background: 'var(--surface-container-lowest)',
        borderRadius: 16,
        padding: 14,
        marginBottom: 16,
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--surface-container)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={onQuit}
              aria-label="Quay lại"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--surface-container-low)',
                color: 'var(--primary)'
              }}
              title="Rời khỏi bài thi"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--secondary)', display: 'inline-block' }} />
              <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {examData?.title || 'ETS 2024 - Test 01'}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Timer countdown pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 9999,
                background: isTimeCritical ? 'var(--error-container)' : 'var(--surface-container)',
                color: isTimeCritical ? 'var(--error)' : 'var(--primary)',
                fontWeight: 700,
                fontSize: 15,
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.3s'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>timer</span>
              <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
            </div>

            {/* Grid Palette Trigger */}
            <button
              onClick={() => setShowPalette(true)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'var(--surface-container)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Bảng 100 câu"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>grid_view</span>
            </button>
          </div>
        </div>

        {/* Quick Part Switcher Tabs */}
        <div style={{ display: 'flex', gap: 6, background: 'var(--surface-container-low)', padding: 4, borderRadius: 10 }}>
          {[5, 6, 7].map((pNum) => {
            const isCurrentPart = currentQuestion?.partNumber === pNum;
            return (
              <button
                key={pNum}
                onClick={() => jumpToPart(pNum)}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: isCurrentPart ? 700 : 500,
                  background: isCurrentPart ? 'var(--primary)' : 'transparent',
                  color: isCurrentPart ? '#fff' : 'var(--on-surface-variant)',
                  transition: 'all 0.2s',
                  boxShadow: isCurrentPart ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Part {pNum} {pNum === 5 ? '(101-130)' : pNum === 6 ? '(131-146)' : '(147-200)'}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Main Test Layout (Responsive 2-column or 1-column) */}
      <div className="test-screen-layout">
        {/* Left Column: Passage (if Part 6 or 7) */}
        {currentQuestion?.passage && (
          <section className="card-passage animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 9999,
                  background: 'var(--primary-fixed)',
                  color: 'var(--on-primary-fixed)',
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  {currentQuestion.partNumber === 6 ? 'Đoạn văn hoàn thành' : 'Đoạn văn đọc hiểu'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--outline)' }}>
                  Câu {currentQuestion.passageGroup?.startNo} - {currentQuestion.passageGroup?.endNo}
                </span>
              </div>

              {/* Collapse/Expand Toggle */}
              <button
                onClick={() => setPassageCollapsed(!passageCollapsed)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--secondary)'
                }}
              >
                <span>{passageCollapsed ? 'Mở rộng' : 'Thu gọn'}</span>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  {passageCollapsed ? 'expand_more' : 'expand_less'}
                </span>
              </button>
            </div>

            {!passageCollapsed && (
              <div>
                {/* Image if available */}
                {currentQuestion.passage.imageUrl && (
                  <div style={{
                    width: '100%',
                    height: 180,
                    borderRadius: 12,
                    overflow: 'hidden',
                    marginBottom: 12,
                    position: 'relative'
                  }}>
                    <img
                      src={currentQuestion.passage.imageUrl}
                      alt="Passage graphic"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}

                <div className="passage-content-text">
                  {currentQuestion.passage.content}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Right Column: Question Card & Options */}
        {currentQuestion && (
          <section className="card-question animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'var(--primary-container)',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {currentQuestion.questionNo}
                </span>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>
                    Part {currentQuestion.partNumber}
                  </span>
                  <p style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
                    Câu {currentIndex + 1} / {totalCount}
                  </p>
                </div>
              </div>

              {/* Flag Bookmark button */}
              <button
                onClick={() => toggleFlag(currentQuestion.id)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: flaggedQuestions.has(currentQuestion.id) ? '#fef3c7' : 'var(--surface-container-low)',
                  color: flaggedQuestions.has(currentQuestion.id) ? '#d97706' : 'var(--outline)'
                }}
                title="Đánh dấu xem lại sau"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  {flaggedQuestions.has(currentQuestion.id) ? 'bookmark' : 'bookmark_border'}
                </span>
              </button>
            </div>

            {/* Question Text */}
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--on-surface)',
              lineHeight: 1.5,
              marginBottom: 20
            }}>
              {currentQuestion.content}
            </h3>

            {/* Answer Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {currentQuestion.options?.map((opt) => {
                const isSelected = answers[currentQuestion.id] === opt.label;
                return (
                  <div
                    key={opt.id || opt.label}
                    className={`option-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectOption(opt.label)}
                  >
                    <div className="option-label-circle">
                      {opt.label}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: isSelected ? 600 : 400, flex: 1 }}>
                      {opt.content}
                    </span>
                    {isSelected && (
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--secondary)' }}>
                        check_circle
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* 3. Sticky Bottom Navigation Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--surface-container-high)',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.04)'
      }}>
        <div style={{
          maxWidth: 1000,
          margin: '0 auto',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}>
          {/* Previous Button */}
          <button
            className="btn-cta btn-outline"
            style={{ width: 'auto', padding: '0 16px', height: 44 }}
            disabled={currentIndex === 0}
            onClick={() => jumpToQuestion(currentIndex - 1)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            <span className="hidden-mobile">Câu trước</span>
          </button>

          {/* Question counter / palette shortcut */}
          <button
            onClick={() => setShowPalette(true)}
            style={{
              padding: '6px 14px',
              borderRadius: 9999,
              background: 'var(--surface-container-high)',
              color: 'var(--primary)',
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>Đã làm: {answeredCount}/{totalCount}</span>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_less</span>
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            {/* Next Button */}
            <button
              className="btn-cta btn-outline"
              style={{ width: 'auto', padding: '0 16px', height: 44 }}
              disabled={currentIndex >= allQuestions.length - 1}
              onClick={() => jumpToQuestion(currentIndex + 1)}
            >
              <span className="hidden-mobile">Câu sau</span>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
            </button>

            {/* Submit CTA */}
            <button
              className="btn-cta btn-navy"
              style={{ width: 'auto', padding: '0 20px', height: 44 }}
              onClick={() => setShowSubmitModal(true)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
              <span>Nộp bài</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Question Palette Modal (Bảng 100 câu) */}
      {showPalette && (
        <div className="modal-overlay" onClick={() => setShowPalette(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>Bảng 100 Câu Hỏi</h3>
                <p style={{ fontSize: 12, color: 'var(--outline)' }}>Chạm vào số câu để chuyển nhanh</p>
              </div>
              <button onClick={() => setShowPalette(false)}>
                <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--outline)' }}>close</span>
              </button>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--on-surface-variant)', marginBottom: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--secondary)' }} />
                Đã trả lời ({answeredCount})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#fef3c7', border: '1px solid #d97706' }} />
                Gắn cờ ({flaggedQuestions.size})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }} />
                Chưa làm ({totalCount - answeredCount})
              </span>
            </div>

            {/* 10x10 Matrix */}
            <div className="palette-grid">
              {allQuestions.map((q, idx) => {
                const isAns = !!answers[q.id];
                const isCur = idx === currentIndex;
                const isFlag = flaggedQuestions.has(q.id);

                return (
                  <button
                    key={q.id}
                    className={`palette-btn ${isCur ? 'current' : ''} ${isAns ? 'answered' : ''} ${isFlag ? 'flagged' : ''}`}
                    onClick={() => jumpToQuestion(idx)}
                  >
                    {q.questionNo}
                  </button>
                );
              })}
            </div>

            <button
              className="btn-cta btn-navy"
              style={{ marginTop: 16 }}
              onClick={() => {
                setShowPalette(false);
                setShowSubmitModal(true);
              }}
            >
              Kiểm tra & Nộp bài
            </button>
          </div>
        </div>
      )}

      {/* 5. Submit Confirmation Modal */}
      <SubmitConfirmModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirmSubmit={() => {
          setShowSubmitModal(false);
          onSubmitExam(answers);
        }}
        answeredCount={answeredCount}
        totalCount={totalCount}
        flaggedCount={flaggedQuestions.size}
        remainingSeconds={secondsLeft}
      />
    </div>
  );
}
