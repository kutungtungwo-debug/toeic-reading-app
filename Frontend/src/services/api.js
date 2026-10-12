import { MOCK_EXAMS_LIST, MOCK_EXAM_DETAILS } from './mockData';

// Cấu hình URL Backend ASP.NET Core
const DEFAULT_API_BASE_URL = 'https://localhost:44311';

class ApiService {
  constructor() {
    this.baseUrl = localStorage.getItem('toeic_api_base_url') || DEFAULT_API_BASE_URL;
    this.token = localStorage.getItem('toeic_auth_token') || null;
    const savedMode = localStorage.getItem('toeic_use_mock');
    this.useMock = savedMode === 'true';
    this.attemptsCache = JSON.parse(localStorage.getItem('toeic_local_attempts') || '{}');
  }

  setUseMock(val) {
    this.useMock = val;
    localStorage.setItem('toeic_use_mock', String(val));
  }

  isMockMode() {
    return this.useMock;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('toeic_auth_token', token);
    } else {
      localStorage.removeItem('toeic_auth_token');
    }
  }

  async request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...(options.headers || {})
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      return json.result !== undefined ? json.result : json;
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn(`[API] Request to ${path} failed:`, err.message);
      throw err;
    }
  }

  // 1. Danh sách đề thi
  async getPublishedExams() {
    if (this.useMock) {
      return MOCK_EXAMS_LIST.map(exam => {
        const local = this.attemptsCache[exam.id];
        if (local) {
          return {
            ...exam,
            status: local.status,
            score: local.score,
            correctCount: local.correctCount,
            lastAttemptDate: local.lastAttemptDate || exam.lastAttemptDate
          };
        }
        return exam;
      });
    }

    const liveExams = await this.request('/api/services/app/Exam/GetPublishedList');
    if (!Array.isArray(liveExams)) {
      throw new Error('Backend trả về danh sách đề thi không hợp lệ.');
    }

    return liveExams.map(exam => ({
      ...exam,
      status: this.attemptsCache[exam.id]?.status || 'todo',
      score: this.attemptsCache[exam.id]?.score || null,
      tag: 'Live Server',
      badge: 'ETS Format'
    }));
  }

  // 2. Lấy nội dung đề thi để làm bài
  async getExamForTaking(examId) {
    if (!this.useMock) {
      try {
        const data = await this.request(`/api/services/app/Exam/GetForTaking?id=${examId}`);
        if (data && data.parts) {
          return data;
        }
      } catch {
        // Fall back to mock
      }
    }

    const mock = MOCK_EXAM_DETAILS[examId] || MOCK_EXAM_DETAILS[1];
    return mock;
  }

  // 3. Bắt đầu phiên thi (Start Attempt)
  async startAttempt(examId) {
    if (!this.useMock && this.token) {
      try {
        return await this.request('/api/services/app/Exam/StartAttempt', {
          method: 'POST',
          body: JSON.stringify({ id: examId })
        });
      } catch {
        // Fall back to mock
      }
    }

    const attemptId = Date.now();
    const startTime = new Date().toISOString();
    const deadline = new Date(Date.now() + 75 * 60 * 1000).toISOString();

    const attempt = {
      attemptId,
      examId,
      startTime,
      deadline,
      status: 'in-progress',
      answers: {}
    };

    this.attemptsCache[examId] = {
      ...this.attemptsCache[examId],
      status: 'in-progress',
      attemptId,
      startTime,
      deadline
    };
    localStorage.setItem('toeic_local_attempts', JSON.stringify(this.attemptsCache));

    return { attemptId, startTime, deadline };
  }

  // 4. Lưu câu trả lời từng câu
  async saveAnswer(attemptId, questionId, selectedAnswer) {
    if (!this.useMock && this.token) {
      try {
        return await this.request('/api/services/app/Exam/SaveAnswer', {
          method: 'POST',
          body: JSON.stringify({ attemptId, questionId, selectedAnswer })
        });
      } catch {
        // Fall back to mock
      }
    }

    // Local storage persistence
    const key = `attempt_answers_${attemptId}`;
    const answers = JSON.parse(localStorage.getItem(key) || '{}');
    answers[questionId] = selectedAnswer;
    localStorage.setItem(key, JSON.stringify(answers));
    return { success: true };
  }

  // 5. Nộp bài (Submit)
  async submitAttempt(attemptId, examId, answers, examData) {
    if (!this.useMock && this.token) {
      try {
        return await this.request('/api/services/app/Exam/Submit', {
          method: 'POST',
          body: JSON.stringify({ attemptId })
        });
      } catch {
        // Fall back to mock
      }
    }

    // Tự động chấm điểm trên client mock
    let allQuestions = [];
    if (examData?.parts) {
      examData.parts.forEach(part => {
        if (part.questions) allQuestions.push(...part.questions);
        if (part.groups) {
          part.groups.forEach(group => {
            if (group.questions) allQuestions.push(...group.questions);
          });
        }
      });
    }

    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;
    const answerResults = [];

    allQuestions.forEach(q => {
      const selected = answers[q.id] || null;
      const isCorrect = selected === q.correctAnswer;
      if (!selected) {
        skippedCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      answerResults.push({
        questionId: q.id,
        questionNo: q.questionNo,
        content: q.content,
        options: q.options,
        selectedAnswer: selected,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation || 'Đáp án chính xác theo quy chuẩn ETS Reading.'
      });
    });

    // Tính điểm TOEIC Reading ước tính (thang 495)
    // Thông thường 80-90 câu đúng ~ 400-450 điểm
    const total = allQuestions.length || 100;
    const ratio = correctCount / total;
    const estimatedScore = Math.min(495, Math.max(5, Math.round((ratio * 490) / 5) * 5));

    const result = {
      attemptId,
      examId,
      examTitle: examData?.title || 'ETS 2024 Test 01 - Reading',
      totalQuestions: total,
      correctCount,
      wrongCount,
      skippedCount,
      estimatedScore,
      answers: answerResults,
      submitTime: new Date().toISOString()
    };

    // Lưu vào cache
    this.attemptsCache[examId] = {
      status: 'done',
      score: estimatedScore,
      correctCount,
      lastAttemptDate: new Date().toLocaleDateString('vi-VN'),
      result
    };
    localStorage.setItem('toeic_local_attempts', JSON.stringify(this.attemptsCache));
    localStorage.setItem(`result_${attemptId}`, JSON.stringify(result));

    return result;
  }

  // 6. Lấy kết quả bài thi
  async getResult(attemptId, examId) {
    if (!this.useMock && this.token) {
      try {
        return await this.request(`/api/services/app/Exam/GetResult?id=${attemptId}`);
      } catch {
        // Fall back to mock
      }
    }

    const saved = localStorage.getItem(`result_${attemptId}`);
    if (saved) {
      return JSON.parse(saved);
    }
    if (examId && this.attemptsCache[examId]?.result) {
      return this.attemptsCache[examId].result;
    }
    return null;
  }

  // 7. Upload file Word .docx (Admin)
  async importWordExam(file, title, durationMinutes = 75) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('durationMinutes', durationMinutes);

    const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {};
    const res = await fetch(`${this.baseUrl}/api/exams/import`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.errors?.join('\n') || `Import thất bại (HTTP ${res.status})`);
    }
    return await res.json();
  }

  // 8. Lấy toàn bộ đề thi để Giảng viên rà soát lỗi chính tả & hình ảnh (Preview / Edit)
  async getExamForEdit(examId) {
    if (!this.useMock && this.token) {
      try {
        const data = await this.request(`/api/services/app/Exam/GetForEdit?id=${examId}`);
        if (data && data.parts) {
          return data;
        }
      } catch (err) {
        console.warn("[API] GetForEdit failed, falling back to mock:", err.message);
      }
    }

    // Kiểm tra bản lưu tạm trong localStorage
    const saved = localStorage.getItem(`exam_edit_${examId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }

    const mock = MOCK_EXAM_DETAILS[examId] || MOCK_EXAM_DETAILS[1];
    return JSON.parse(JSON.stringify(mock)); // Deep clone
  }

  // 9. Cập nhật sửa lỗi chính tả / nội dung đề thi (Giảng viên)
  async updateExam(input) {
    if (!this.useMock && this.token) {
      try {
        return await this.request('/api/services/app/Exam/Update', {
          method: 'POST',
          body: JSON.stringify(input)
        });
      } catch (err) {
        console.warn("[API] Update exam failed, saving locally:", err.message);
      }
    }

    // Lưu vào localStorage
    localStorage.setItem(`exam_edit_${input.id}`, JSON.stringify(input));
    return input;
  }

  // 10. Xuất bản / Gỡ xuất bản đề thi
  async setPublished(examId, isPublished) {
    if (!this.useMock && this.token) {
      try {
        return await this.request('/api/services/app/Exam/SetPublished', {
          method: 'POST',
          body: JSON.stringify({ id: examId, isPublished })
        });
      } catch (err) {
        console.warn("[API] SetPublished failed, toggling locally:", err.message);
      }
    }

    return { id: examId, isPublished };
  }
}

export const apiService = new ApiService();
