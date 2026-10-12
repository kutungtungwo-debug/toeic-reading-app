// Dữ liệu mẫu (Mock Data) chuẩn định dạng TOEIC Reading ETS 2024
// Được sử dụng khi Backend chưa bật hoặc chế độ Demo Mode

export const MOCK_EXAMS_LIST = [
  {
    id: 1,
    title: "ETS 2024 Test 01 - Reading",
    durationMinutes: 75,
    totalQuestions: 100,
    status: "todo", // todo | in-progress | done
    score: null,
    correctCount: null,
    lastAttemptDate: null,
    tag: "Mới nhất",
    badge: "ETS Format",
    description: "Bộ đề luyện thi TOEIC cập nhật sát ma trận đề thi thực tế tại IIG Vietnam."
  },
  {
    id: 2,
    title: "ETS 2024 Test 02 - Reading",
    durationMinutes: 75,
    totalQuestions: 100,
    status: "done",
    score: 415,
    maxScore: 495,
    correctCount: 84,
    usedMinutes: 64,
    lastAttemptDate: "18/04/2024",
    tag: "Phổ biến",
    badge: "ETS Format",
    description: "Đề thi thử TOEIC Reading chuẩn độ khó thực tế của Viện Khảo thí Giáo dục Hoa Kỳ."
  },
  {
    id: 3,
    title: "Economy TOEIC Test 05",
    durationMinutes: 75,
    totalQuestions: 100,
    status: "in-progress",
    currentQuestion: 32,
    remainingMinutes: 48,
    lastSaved: "2 phút trước",
    tag: "Đang làm dở",
    badge: "Economy Series",
    description: "Tập trung rèn luyện phản xạ Part 5 và bẫy ngữ pháp thường gặp."
  },
  {
    id: 4,
    title: "Hacker TOEIC 3 - Test 08",
    durationMinutes: 75,
    totalQuestions: 100,
    status: "todo",
    score: null,
    correctCount: null,
    lastAttemptDate: null,
    tag: "Nâng cao",
    badge: "Target 850+",
    description: "Bộ đề bứt phá điểm số với các đoạn văn đôi và đoạn ba Part 7 nhiều từ vựng chuyên ngành."
  }
];

export const MOCK_EXAM_DETAILS = {
  1: {
    id: 1,
    title: "ETS 2024 Test 01 - Reading",
    durationMinutes: 75,
    totalQuestions: 100,
    parts: [
      {
        id: 101,
        partNumber: 5,
        title: "Part 5: Incomplete Sentences",
        startNo: 101,
        endNo: 130,
        directions: "A word or phrase is missing in each of the sentences below. Four answer choices are given. Select the best answer to complete the sentence.",
        groups: [],
        questions: [
          {
            id: 1001,
            questionNo: 101,
            content: "Ms. Patel will present the quarterly earnings report ______ the board meeting on Friday.",
            correctAnswer: "A",
            explanation: "Giới từ 'during' (trong suốt) dùng để chỉ hành động diễn ra trong khoảng thời gian diễn ra sự kiện 'the board meeting'.",
            options: [
              { id: 1, label: "A", content: "during" },
              { id: 2, label: "B", content: "while" },
              { id: 3, label: "C", content: "between" },
              { id: 4, label: "D", content: "inside" }
            ]
          },
          {
            id: 1002,
            questionNo: 102,
            content: "Customers are advised to inspect their purchased items ______ leaving the electronics store.",
            correctAnswer: "B",
            explanation: "'before' + V-ing: trước khi rời khỏi cửa hàng.",
            options: [
              { id: 5, label: "A", content: "almost" },
              { id: 6, label: "B", content: "before" },
              { id: 7, label: "C", content: "often" },
              { id: 8, label: "D", content: "already" }
            ]
          },
          {
            id: 1003,
            questionNo: 103,
            content: "The new software update makes it much ______ for employees to generate financial reports.",
            correctAnswer: "C",
            explanation: "'much' bổ nghĩa cho tính từ so sánh hơn 'easier'. Cấu trúc: make it + adj + for sb to do sth.",
            options: [
              { id: 9, label: "A", content: "easy" },
              { id: 10, label: "B", content: "easily" },
              { id: 11, label: "C", content: "easier" },
              { id: 12, label: "D", content: "easiness" }
            ]
          },
          {
            id: 1004,
            questionNo: 104,
            content: "Please ensure that your contact information is ______ entered into the employee portal.",
            correctAnswer: "D",
            explanation: "Cần trạng từ 'accurately' để bổ nghĩa cho động từ phân từ hai 'entered'.",
            options: [
              { id: 13, label: "A", content: "accurate" },
              { id: 14, label: "B", content: "accuracy" },
              { id: 15, label: "C", content: "accuratenesses" },
              { id: 16, label: "D", content: "accurately" }
            ]
          },
          {
            id: 1005,
            questionNo: 105,
            content: "All technical support inquiries will be processed in the order in which they ______.",
            correctAnswer: "B",
            explanation: "Thì hiện tại đơn thể bị động: 'are received' (được tiếp nhận).",
            options: [
              { id: 17, label: "A", content: "receive" },
              { id: 18, label: "B", content: "are received" },
              { id: 19, label: "C", content: "have receiving" },
              { id: 20, label: "D", content: "to receive" }
            ]
          },
          {
            id: 1006,
            questionNo: 106,
            content: "Dr. Gomez received an award for her ______ contributions to pediatric cardiology research.",
            correctAnswer: "C",
            explanation: "Cần tính từ 'exceptional' (xuất sắc, kiệt xuất) để bổ nghĩa cho danh từ 'contributions'.",
            options: [
              { id: 21, label: "A", content: "exception" },
              { id: 22, label: "B", content: "except" },
              { id: 23, label: "C", content: "exceptional" },
              { id: 24, label: "D", content: "exceptionally" }
            ]
          },
          {
            id: 1007,
            questionNo: 107,
            content: "The marketing director suggested that we ______ the advertising budget for social media channels.",
            correctAnswer: "A",
            explanation: "Cấu trúc giả định thức: suggest that + S + (should) + V nguyên thể không 'to' ('increase').",
            options: [
              { id: 25, label: "A", content: "increase" },
              { id: 26, label: "B", content: "increased" },
              { id: 27, label: "C", content: "increasing" },
              { id: 28, label: "D", content: "to increase" }
            ]
          },
          {
            id: 1008,
            questionNo: 108,
            content: "The board agreed that the project manager should complete the audit ______ before submitting the budget proposal.",
            correctAnswer: "C",
            explanation: "Vị trí sau ngoại động từ 'complete' và tân ngữ 'the audit' cần một trạng từ (thoroughly - một cách kỹ lưỡng) để bổ nghĩa cho hành động.",
            options: [
              { id: 29, label: "A", content: "thorough" },
              { id: 30, label: "B", content: "thoroughness" },
              { id: 31, label: "C", content: "thoroughly" },
              { id: 32, label: "D", content: "most thorough" }
            ]
          },
          {
            id: 1009,
            questionNo: 109,
            content: "Registration for the annual leadership summit will remain open ______ midnight on November 15.",
            correctAnswer: "B",
            explanation: "Giới từ 'until' chỉ mốc thời gian hành động kéo dài liên tục cho tới thời điểm đó.",
            options: [
              { id: 33, label: "A", content: "since" },
              { id: 34, label: "B", content: "until" },
              { id: 35, label: "C", content: "toward" },
              { id: 36, label: "D", content: "behind" }
            ]
          },
          {
            id: 1010,
            questionNo: 110,
            content: "The catering team prepared ______ refreshments for over three hundred attendees at the ceremony.",
            correctAnswer: "A",
            explanation: "'complimentary' (miễn phí): các món đồ ăn nhẹ miễn phí dành cho khách tham dự.",
            options: [
              { id: 37, label: "A", content: "complimentary" },
              { id: 38, label: "B", content: "submissive" },
              { id: 39, label: "C", content: "reluctant" },
              { id: 40, label: "D", content: "hesitant" }
            ]
          }
        ]
      },
      {
        id: 102,
        partNumber: 6,
        title: "Part 6: Text Completion",
        startNo: 131,
        endNo: 146,
        directions: "Read the texts that follow. A word, phrase, or sentence is missing in parts of each text. Select the best answer for each missing part.",
        questions: [],
        groups: [
          {
            id: 201,
            startNo: 131,
            endNo: 134,
            orderIndex: 1,
            passages: [
              {
                id: 301,
                orderIndex: 1,
                content: `To: All Staff Members <staff@nexustech.com>
From: Human Resources Department <hr@nexustech.com>
Date: October 14
Subject: Office Modernization Schedule

We are thrilled to announce that Nexus Technology will begin the renovation of our third-floor collaborative workspace starting next Monday. ---[131]--- will be upgraded with ergonomic standing desks, smart acoustic dividers, and high-speed wireless charging stations.

During this period, all staff normally assigned to Floor 3 are requested to work either remotely or from the temporary conference pods on Floor 2. We understand that this temporary relocation may cause some inconvenience, and we sincerely appreciate your ---[132]---.

The construction team anticipates completing the primary installations within two weeks. Once finished, we will host a brief orientation on how to reserve the newly installed creative pods. If you have special workplace equipment needs, please notify your team lead ---[133]---.

---[134]---. Thank you for your continued dedication to making Nexus Technology a vibrant and innovative community.`,
                imageUrl: null
              }
            ],
            questions: [
              {
                id: 1031,
                questionNo: 131,
                content: "Select the best choice for blank [131].",
                correctAnswer: "B",
                explanation: "'The facility' (Cơ sở vật chất) là danh từ phù hợp làm chủ ngữ được nâng cấp với các trang thiết bị mới.",
                options: [
                  { id: 41, label: "A", content: "The competitors" },
                  { id: 42, label: "B", content: "The facility" },
                  { id: 43, label: "C", content: "A transaction" },
                  { id: 44, label: "D", content: "An agreement" }
                ]
              },
              {
                id: 1032,
                questionNo: 132,
                content: "Select the best choice for blank [132].",
                correctAnswer: "C",
                explanation: "'cooperation' (sự hợp tác): trân trọng sự hợp tác của các bạn trong thời gian tạm chuyển chỗ.",
                options: [
                  { id: 45, label: "A", content: "distraction" },
                  { id: 46, label: "B", content: "hesitation" },
                  { id: 47, label: "C", content: "cooperation" },
                  { id: 48, label: "D", content: "objection" }
                ]
              },
              {
                id: 1033,
                questionNo: 133,
                content: "Select the best choice for blank [133].",
                correctAnswer: "A",
                explanation: "'promptly' (ngay lập tức/kịp thời): thông báo kịp thời cho trưởng nhóm nếu có nhu cầu thiết bị đặc biệt.",
                options: [
                  { id: 49, label: "A", content: "promptly" },
                  { id: 50, label: "B", content: "rarely" },
                  { id: 51, label: "C", content: "barely" },
                  { id: 52, label: "D", content: "roughly" }
                ]
              },
              {
                id: 1034,
                questionNo: 134,
                content: "Select the best sentence to fill in blank [134].",
                correctAnswer: "D",
                explanation: "Câu kết phù hợp với bối cảnh hoàn thành công trình và chào đón nhân viên trở lại không gian mới.",
                options: [
                  { id: 53, label: "A", content: "Floor 3 will be permanently closed for the remainder of the fiscal year." },
                  { id: 54, label: "B", content: "Unfortunately, parking spaces will no longer be available." },
                  { id: 55, label: "C", content: "Your paychecks will be delayed until the renovation is signed off." },
                  { id: 56, label: "D", content: "We look forward to welcoming you to the upgraded workspace soon." }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 103,
        partNumber: 7,
        title: "Part 7: Reading Comprehension",
        startNo: 147,
        endNo: 200,
        directions: "In this part you will read a selection of texts, such as notices, letters, and emails. Each text or set of texts is followed by several questions. Select the best answer for each question.",
        questions: [],
        groups: [
          {
            id: 202,
            startNo: 147,
            endNo: 149,
            orderIndex: 1,
            passages: [
              {
                id: 302,
                orderIndex: 1,
                content: `APEX DESIGN STUDIO - MEMORANDUM

DATE: September 28
TO: Senior Project Architects & Design Associates
FROM: Elena Rostova, Managing Director
SUBJECT: Grand Opening of Downtown Innovation Hub

I am delighted to share that our newest client project, the Downtown Innovation Hub on Lexington Avenue, will celebrate its official ribbon-cutting ceremony on Friday, October 18 at 10:00 AM.

This five-story complex features sustainable timber construction, passive solar cooling systems, and an open-atrium gallery for public exhibitions. Apex Design Studio has been recognized with the Annual Urban Architecture Citation for our innovative structural solutions on this development.

All team members who contributed to this milestone are warmly invited to attend the VIP reception following the ceremony. Transportation will be provided via shuttle bus from our main headquarters at 8:30 AM. Please confirm your attendance with Marcus Lee in administration no later than October 10.`,
                imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
              }
            ],
            questions: [
              {
                id: 1047,
                questionNo: 147,
                content: "What is the primary purpose of the memorandum?",
                correctAnswer: "B",
                explanation: "Bản ghi nhớ thông báo về lễ khánh thành (ribbon-cutting ceremony) của dự án Downtown Innovation Hub.",
                options: [
                  { id: 57, label: "A", content: "To announce the hiring of a new managing director" },
                  { id: 58, label: "B", content: "To notify staff of an upcoming project opening ceremony" },
                  { id: 59, label: "C", content: "To introduce changes to the employee commute schedule" },
                  { id: 60, label: "D", content: "To solicit ideas for an architecture competition" }
                ]
              },
              {
                id: 1048,
                questionNo: 148,
                content: "What is mentioned about the Downtown Innovation Hub?",
                correctAnswer: "C",
                explanation: "Đoạn văn nêu: 'Apex Design Studio has been recognized with the Annual Urban Architecture Citation' -> Dự án đã mang về giải thưởng kiến trúc cho công ty.",
                options: [
                  { id: 61, label: "A", content: "It is located next to a train station" },
                  { id: 62, label: "B", content: "It will be solely financed by public donations" },
                  { id: 63, label: "C", content: "It earned an architectural design recognition" },
                  { id: 64, label: "D", content: "It was built entirely using recycled metals" }
                ]
              },
              {
                id: 1049,
                questionNo: 149,
                content: "What should employees do by October 10?",
                correctAnswer: "D",
                explanation: "'Please confirm your attendance with Marcus Lee in administration no later than October 10.' -> Xác nhận việc tham dự lễ tiếp đón.",
                options: [
                  { id: 65, label: "A", content: "Submit their final design revisions" },
                  { id: 66, label: "B", content: "Book a hotel room in downtown" },
                  { id: 67, label: "C", content: "Inspect the solar cooling mechanism" },
                  { id: 68, label: "D", content: "RSVP for the reception with administration" }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
};
