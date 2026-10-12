import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ExamList from './components/ExamList';
import ExamStartModal from './components/ExamStartModal';
import ReadingTest from './components/ReadingTest';
import TestResults from './components/TestResults';
import AdminImportModal from './components/AdminImportModal';
import ExamPreview from './components/ExamPreview';
import { apiService } from './services/api';

export default function App() {
  // Navigation State: 'list' | 'test' | 'results' | 'preview'
  const [currentView, setCurrentView] = useState('list');
  const [exams, setExams] = useState([]);
  const [selectedExamForModal, setSelectedExamForModal] = useState(null);
  const [activeExamData, setActiveExamData] = useState(null);
  const [activeAttemptId, setActiveAttemptId] = useState(null);
  const [activeResult, setActiveResult] = useState(null);
  const [previewExamData, setPreviewExamData] = useState(null);
  const [showAdminImport, setShowAdminImport] = useState(false);
  const [isMockMode, setIsMockMode] = useState(apiService.isMockMode());
  const [loading, setLoading] = useState(false);
  const [examLoadError, setExamLoadError] = useState(null);

  // Load danh sách đề thi
  const loadExams = async () => {
    setLoading(true);
    try {
      const list = await apiService.getPublishedExams();
      setExams(list);
      setExamLoadError(null);
    } catch (err) {
      console.error("Failed to load exams:", err);
      setExams([]);
      setExamLoadError(err.message || "Không thể tải danh sách đề thi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, [isMockMode]);

  // Toggle Live API vs Mock Mode
  const handleToggleMock = () => {
    const nextVal = !isMockMode;
    apiService.setUseMock(nextVal);
    setIsMockMode(nextVal);
  };

  // Chọn đề từ danh sách để xem thông tin trước khi bắt đầu
  const handleSelectExam = (exam) => {
    setSelectedExamForModal(exam);
  };

  // Bắt đầu làm bài thi (Start Attempt)
  const handleConfirmStart = async (exam) => {
    setSelectedExamForModal(null);
    setLoading(true);

    try {
      // 1. Lấy dữ liệu câu hỏi đề thi
      const fullExam = await apiService.getExamForTaking(exam.id);
      setActiveExamData(fullExam);

      // 2. Tạo phiên thi (attempt)
      const attemptRes = await apiService.startAttempt(exam.id);
      setActiveAttemptId(attemptRes.attemptId);

      // 3. Chuyển sang màn hình thi
      setCurrentView('test');
    } catch (err) {
      alert(`Không thể bắt đầu bài thi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Lưu câu trả lời
  const handleSaveAnswer = async (attemptId, questionId, selectedAnswer) => {
    try {
      await apiService.saveAnswer(attemptId, questionId, selectedAnswer);
    } catch (err) {
      console.warn("Save answer warning:", err.message);
    }
  };

  // Nộp bài thi
  const handleSubmitExam = async (finalAnswers) => {
    setLoading(true);
    try {
      const res = await apiService.submitAttempt(
        activeAttemptId,
        activeExamData?.id || 1,
        finalAnswers,
        activeExamData
      );
      setActiveResult(res);
      setCurrentView('results');
      loadExams(); // cập nhật trạng thái danh sách
    } catch (err) {
      alert(`Lỗi khi nộp bài: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Xem kết quả đề đã thi
  const handleViewResult = async (exam) => {
    setLoading(true);
    try {
      const res = await apiService.getResult(exam.attemptId, exam.id);
      if (res) {
        setActiveResult(res);
        setCurrentView('results');
      } else {
        alert("Chưa có kết quả lưu trữ cho đề này.");
      }
    } catch (err) {
      alert(`Lỗi khi tải kết quả: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Rời khỏi bài thi đang làm
  const handleQuitTest = () => {
    if (window.confirm("Bạn có chắc chắn muốn thoát khỏi màn hình làm bài? Tiến độ câu trả lời đã được tự động lưu.")) {
      setCurrentView('list');
      loadExams();
    }
  };

  // ========== Giảng viên: Preview / Rà soát đề thi ==========
  const handleOpenPreview = async (exam) => {
    setLoading(true);
    try {
      const data = await apiService.getExamForEdit(exam.id);
      setPreviewExamData(data);
      setCurrentView('preview');
    } catch (err) {
      alert(`Không thể tải dữ liệu đề thi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExamEdits = async (updatedData) => {
    await apiService.updateExam(updatedData);
    setPreviewExamData(updatedData);
    loadExams();
  };

  const handlePublishToggle = async (examId, newState) => {
    try {
      await apiService.setPublished(examId, newState);
      setPreviewExamData(prev => prev ? { ...prev, isPublished: newState } : prev);
      loadExams();
    } catch (err) {
      alert(`Lỗi khi cập nhật trạng thái xuất bản: ${err.message}`);
    }
  };

  return (
    <div className="app-container">
      {/* Global Header */}
      <Header
        isMock={isMockMode}
        onToggleMock={handleToggleMock}
        onOpenAdmin={() => setShowAdminImport(true)}
        onGoHome={() => {
          if (currentView === 'test') {
            handleQuitTest();
          } else {
            setCurrentView('list');
          }
        }}
      />

      {/* Main View Router */}
      <main className="app-main">
        {loading && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              padding: 24,
              borderRadius: 16,
              background: '#fff',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'var(--secondary)', animation: 'spin 1s linear infinite' }}>
                progress_activity
              </span>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>Đang tải dữ liệu...</p>
            </div>
          </div>
        )}

        {currentView === 'list' && (
          <>
            {examLoadError && (
              <div role="alert" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: 14,
                marginBottom: 16,
                borderRadius: 12,
                background: 'var(--error-container)',
                color: 'var(--on-error-container)'
              }}>
                <span>Không kết nối được Backend để tải đề đã xuất bản: {examLoadError}</span>
                <button className="btn-cta btn-outline" onClick={loadExams}>Thử lại</button>
              </div>
            )}
            <ExamList
              exams={exams}
              onSelectExam={handleSelectExam}
              onStartExam={handleConfirmStart}
              onViewResult={handleViewResult}
              onPreviewExam={handleOpenPreview}
              onRefresh={loadExams}
            />
          </>
        )}

        {currentView === 'preview' && previewExamData && (
          <ExamPreview
            examData={previewExamData}
            onSaveExam={handleSaveExamEdits}
            onPublishToggle={handlePublishToggle}
            onBack={() => {
              setCurrentView('list');
              setPreviewExamData(null);
            }}
          />
        )}

        {currentView === 'test' && activeExamData && (
          <ReadingTest
            examData={activeExamData}
            attemptId={activeAttemptId}
            initialDurationMinutes={activeExamData.durationMinutes || 75}
            onSaveAnswer={handleSaveAnswer}
            onSubmitExam={handleSubmitExam}
            onQuit={handleQuitTest}
          />
        )}

        {currentView === 'results' && (
          <TestResults
            resultData={activeResult}
            onRetakeExam={() => {
              const exam = exams.find(e => e.id === activeResult?.examId) || { id: 1, title: activeResult?.examTitle };
              handleConfirmStart(exam);
            }}
            onBackToList={() => setCurrentView('list')}
          />
        )}
      </main>

      {/* Modal 1: Xác nhận bắt đầu làm bài */}
      {selectedExamForModal && (
        <ExamStartModal
          exam={selectedExamForModal}
          onClose={() => setSelectedExamForModal(null)}
          onConfirmStart={handleConfirmStart}
        />
      )}

      {/* Modal 2: Admin Import file Word .docx */}
      <AdminImportModal
        isOpen={showAdminImport}
        onClose={() => setShowAdminImport(false)}
        onSuccess={loadExams}
      />
    </div>
  );
}
