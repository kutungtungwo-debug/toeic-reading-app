import React, { useState } from 'react';

export default function ExamPreview({
  examData,
  onSaveExam,
  onPublishToggle,
  onBack
}) {
  const [data, setData] = useState(() => JSON.parse(JSON.stringify(examData)));
  const [activePart, setActivePart] = useState(5);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  if (!data || !data.parts) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <h3>Không có dữ liệu đề thi để xem trước.</h3>
        <button className="btn-cta btn-primary" onClick={onBack} style={{ marginTop: 16 }}>
          Quay lại danh sách đề
        </button>
      </div>
    );
  }

  // Handle title & duration edit
  const handleTitleChange = (val) => {
    setData(prev => ({ ...prev, title: val }));
  };

  const handleDurationChange = (val) => {
    setData(prev => ({ ...prev, durationMinutes: Number(val) || 75 }));
  };

  // Handle question content edit (Part 5 or Groups)
  const handleQuestionContentChange = (qId, newContent) => {
    setData(prev => {
      const next = { ...prev };
      next.parts = next.parts.map(part => {
        // Part 5 questions
        if (part.questions) {
          part.questions = part.questions.map(q => q.id === qId ? { ...q, content: newContent } : q);
        }
        // Part 6 & 7 groups questions
        if (part.groups) {
          part.groups = part.groups.map(group => {
            if (group.questions) {
              group.questions = group.questions.map(q => q.id === qId ? { ...q, content: newContent } : q);
            }
            return group;
          });
        }
        return part;
      });
      return next;
    });
  };

  // Handle option edit
  const handleOptionContentChange = (qId, optId, newContent) => {
    setData(prev => {
      const next = { ...prev };
      next.parts = next.parts.map(part => {
        if (part.questions) {
          part.questions = part.questions.map(q => {
            if (q.id === qId && q.options) {
              q.options = q.options.map(opt => opt.id === optId ? { ...opt, content: newContent } : opt);
            }
            return q;
          });
        }
        if (part.groups) {
          part.groups = part.groups.map(group => {
            if (group.questions) {
              group.questions = group.questions.map(q => {
                if (q.id === qId && q.options) {
                  q.options = q.options.map(opt => opt.id === optId ? { ...opt, content: newContent } : opt);
                }
                return q;
              });
            }
            return group;
          });
        }
        return part;
      });
      return next;
    });
  };

  // Handle passage text edit
  const handlePassageContentChange = (passageId, newContent) => {
    setData(prev => {
      const next = { ...prev };
      next.parts = next.parts.map(part => {
        if (part.groups) {
          part.groups = part.groups.map(group => {
            if (group.passages) {
              group.passages = group.passages.map(p => p.id === passageId ? { ...p, content: newContent } : p);
            }
            return group;
          });
        }
        return part;
      });
      return next;
    });
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await onSaveExam?.(data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(`Lỗi khi lưu đề thi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const currentPart = data.parts.find(p => p.partNumber === activePart) || data.parts[0];

  return (
    <div className="animate-fade-in" style={{ width: '100%', paddingBottom: 80 }}>
      {/* 1. Header Toolbar */}
      <section style={{
        background: 'var(--surface-container-lowest)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--surface-container)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={onBack}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--surface-container)',
                color: 'var(--primary)'
              }}
              title="Quay lại danh sách đề"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
            </button>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Chế độ Giảng viên • Rà soát đề thi
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                Xem Trước & Hiệu Đính Đề Thi
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="btn-cta btn-primary"
              style={{ height: 40, padding: '0 16px', fontSize: 13, gap: 6 }}
              onClick={handleSave}
              disabled={saving}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {saving ? 'sync' : 'save'}
              </span>
              <span>{saving ? 'Đang lưu...' : 'Lưu chỉnh sửa'}</span>
            </button>

            <button
              className="btn-cta btn-outline"
              style={{ height: 40, padding: '0 14px', fontSize: 13, gap: 6 }}
              onClick={() => onPublishToggle?.(data.id, !data.isPublished)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: data.isPublished ? 'var(--primary)' : 'var(--secondary)' }}>
                {data.isPublished ? 'visibility_off' : 'public'}
              </span>
              <span>{data.isPublished ? 'Gỡ xuất bản' : 'Xuất bản'}</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div style={{
            padding: '8px 14px',
            borderRadius: 10,
            background: 'var(--secondary-container)',
            color: 'var(--on-secondary-container)',
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
            <span>Đã lưu thành công các thay đổi chính tả và nội dung vào hệ thống!</span>
          </div>
        )}

        {/* Exam Title & Duration Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginTop: 8 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--outline)', marginBottom: 4 }}>
              Tên đề thi
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--outline-variant)',
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--on-surface)'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--outline)', marginBottom: 4 }}>
              Thời lượng (phút)
            </label>
            <input
              type="number"
              value={data.durationMinutes || 75}
              onChange={(e) => handleDurationChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--outline-variant)',
                fontSize: 14,
                color: 'var(--on-surface)'
              }}
            />
          </div>
        </div>

        {/* Part Selection Tabs */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {[5, 6, 7].map(pNum => {
            const isActive = activePart === pNum;
            const range = pNum === 5 ? '101 - 130' : pNum === 6 ? '131 - 146' : '147 - 200';
            return (
              <button
                key={pNum}
                onClick={() => setActivePart(pNum)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? 'var(--primary)' : 'var(--surface-container)',
                  color: isActive ? '#fff' : 'var(--on-surface)',
                  border: 'none',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Part {pNum} ({range})
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Part Content Review Section */}
      <div className="test-screen-layout">
        {/* PART 5 */}
        {activePart === 5 && currentPart && (
          <div style={{ width: '100%' }}>
            <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 8, background: 'var(--surface-container-low)', fontSize: 12, color: 'var(--outline)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4, color: 'var(--secondary)' }}>info</span>
              Rà soát lỗi chính tả đề bài và 4 lựa chọn. Đáp án đúng chuẩn <strong>[ANS]</strong> được đánh dấu màu xanh.
            </div>

            {currentPart.questions?.map((q) => (
              <div key={q.id} style={{
                background: '#fff',
                borderRadius: 14,
                padding: 16,
                marginBottom: 16,
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--outline-variant)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 9999,
                    background: 'var(--primary-container)',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700
                  }}>
                    Câu {q.questionNo}
                  </span>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 9999,
                    background: 'var(--secondary-container)',
                    color: 'var(--on-secondary-container)',
                    fontSize: 12,
                    fontWeight: 700
                  }}>
                    Đáp án đúng: [{q.correctAnswer}]
                  </span>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--outline)', marginBottom: 4 }}>
                    Nội dung câu hỏi (chỉnh sửa trực tiếp nếu có lỗi chính tả):
                  </label>
                  <textarea
                    rows={2}
                    value={q.content}
                    onChange={(e) => handleQuestionContentChange(q.id, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid var(--outline-variant)',
                      fontSize: 14,
                      lineHeight: 1.4,
                      color: 'var(--on-surface)'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                  {q.options?.map(opt => {
                    const isCorrect = opt.label === q.correctAnswer;
                    return (
                      <div key={opt.id || opt.label} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 8px',
                        borderRadius: 8,
                        background: isCorrect ? 'var(--secondary-container)' : 'var(--surface-container-low)',
                        border: isCorrect ? '1px solid var(--secondary)' : '1px solid var(--outline-variant)'
                      }}>
                        <span style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: isCorrect ? 'var(--secondary)' : 'var(--outline)',
                          color: '#fff',
                          fontSize: 12,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {opt.label}
                        </span>
                        <input
                          type="text"
                          value={opt.content}
                          onChange={(e) => handleOptionContentChange(q.id, opt.id, e.target.value)}
                          style={{
                            flex: 1,
                            padding: '4px 6px',
                            borderRadius: 6,
                            border: '1px solid var(--outline-variant)',
                            fontSize: 13,
                            background: '#fff'
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PART 6 & PART 7 */}
        {(activePart === 6 || activePart === 7) && currentPart && (
          <div style={{ width: '100%' }}>
            <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 8, background: 'var(--surface-container-low)', fontSize: 12, color: 'var(--outline)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4, color: 'var(--secondary)' }}>info</span>
              Rà soát đoạn văn, kiểm tra <strong>hiển thị hình ảnh</strong> và câu hỏi tương ứng của từng nhóm bài đọc.
            </div>

            {currentPart.groups?.map(group => {
              const passage = group.passages?.[0] || null;
              return (
                <div key={group.id} style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: 18,
                  marginBottom: 20,
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--outline-variant)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 9999,
                      background: 'var(--primary-container)',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 700
                    }}>
                      Nhóm câu {group.startNo} - {group.endNo}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--outline)' }}>
                      {group.questions?.length || 0} câu hỏi
                    </span>
                  </div>

                  {/* Passage Review & Image Verification */}
                  {passage && (
                    <div style={{
                      background: 'var(--surface-container-low)',
                      borderRadius: 12,
                      padding: 14,
                      marginBottom: 16,
                      border: '1px solid var(--outline-variant)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>menu_book</span>
                          Đoạn văn bài đọc #{passage.orderIndex || 1}
                        </span>
                        {passage.imageUrl ? (
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>image</span>
                            Có hình ảnh đính kèm
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--outline)' }}>Đoạn văn thuần văn bản</span>
                        )}
                      </div>

                      {/* Image Verification Display */}
                      {passage.imageUrl && (
                        <div style={{
                          border: '2px dashed var(--secondary)',
                          borderRadius: 12,
                          padding: 10,
                          background: '#fff',
                          marginBottom: 12,
                          textAlign: 'center'
                        }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--secondary)', marginBottom: 8 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>verified</span>
                            Rà soát hiển thị hình ảnh đoạn văn (Nhấp vào ảnh để phóng to):
                          </p>
                          <img
                            src={passage.imageUrl}
                            alt="Passage inspection"
                            onClick={() => setSelectedImage(passage.imageUrl)}
                            style={{
                              maxWidth: '100%',
                              maxHeight: 220,
                              borderRadius: 8,
                              cursor: 'zoom-in',
                              objectFit: 'contain',
                              boxShadow: 'var(--shadow-sm)'
                            }}
                          />
                          <p style={{ fontSize: 11, color: 'var(--outline)', marginTop: 6 }}>
                            Đường dẫn: {passage.imageUrl}
                          </p>
                        </div>
                      )}

                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--outline)', marginBottom: 4 }}>
                          Nội dung văn bản đoạn văn (cho phép sửa lỗi chính tả):
                        </label>
                        <textarea
                          rows={6}
                          value={passage.content}
                          onChange={(e) => handlePassageContentChange(passage.id, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: 8,
                            border: '1px solid var(--outline-variant)',
                            fontSize: 13,
                            lineHeight: 1.5,
                            fontFamily: 'inherit',
                            background: '#fff'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Group Questions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {group.questions?.map(q => (
                      <div key={q.id} style={{
                        border: '1px solid var(--outline-variant)',
                        borderRadius: 10,
                        padding: 12,
                        background: 'var(--surface-container-lowest)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                            Câu {q.questionNo}
                          </span>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: 9999,
                            background: 'var(--secondary-container)',
                            color: 'var(--on-secondary-container)',
                            fontSize: 11,
                            fontWeight: 700
                          }}>
                            Đáp án: [{q.correctAnswer}]
                          </span>
                        </div>

                        <textarea
                          rows={2}
                          value={q.content}
                          onChange={(e) => handleQuestionContentChange(q.id, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            borderRadius: 6,
                            border: '1px solid var(--outline-variant)',
                            fontSize: 13,
                            marginBottom: 8
                          }}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 6 }}>
                          {q.options?.map(opt => {
                            const isCorrect = opt.label === q.correctAnswer;
                            return (
                              <div key={opt.id || opt.label} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '4px 6px',
                                borderRadius: 6,
                                background: isCorrect ? 'var(--secondary-container)' : '#fff',
                                border: '1px solid var(--outline-variant)'
                              }}>
                                <span style={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: '50%',
                                  background: isCorrect ? 'var(--secondary)' : 'var(--outline)',
                                  color: '#fff',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  {opt.label}
                                </span>
                                <input
                                  type="text"
                                  value={opt.content}
                                  onChange={(e) => handleOptionContentChange(q.id, opt.id, e.target.value)}
                                  style={{
                                    flex: 1,
                                    padding: '2px 4px',
                                    borderRadius: 4,
                                    border: '1px solid var(--outline-variant)',
                                    fontSize: 12
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Image Full View Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img
              src={selectedImage}
              alt="Enlarged passage preview"
              style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: 8, boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}
            />
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: -16,
                right: -16,
                background: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
