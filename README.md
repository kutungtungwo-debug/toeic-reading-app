# toeic-reading-app

## Exam API

The ASP.NET Boilerplate backend exposes the exam application service through its
dynamic API under `/api/services/app/Exam/{method}`. Use the Web Host Swagger
page to inspect the generated request and response contracts. Exam-management
methods require a user granted `Pages.Exams.Manage`; attempt operations require
an authenticated user.

Admin methods:

- `POST /api/exams/import` accepts multipart form fields `file` (`.docx`),
  `title`, and optional `durationMinutes` (defaults to 75). It validates the
  complete TOEIC Reading structure before saving. Validation failures return
  HTTP 400 with `isValid: false` and an `errors` array. Valid imports create a
  draft and return its id; uploaded images are stored under `/exam-images/`.
- `GetAdminListAsync` lists drafts and published exams.
- `GetForEditAsync` returns the full exam, including answer keys, for review.
- `UpdateAsync` saves text, choices, answer keys, title, duration, and passage
  content. It preserves the imported structure; add/remove/reorder operations
  are not supported by this API.
- `SetPublishedAsync` publishes or unpublishes an exam after validating its
  question and answer structure.

Learner methods:

- `GetPublishedListAsync` lists published exams.
- `GetForTakingAsync` returns exam content and choices without correct answers.
- `StartAttemptAsync` starts the server-timed attempt and returns its deadline.
- `GetAttemptAsync` returns the attempt's saved selections and deadline.
- `SaveAnswerAsync` saves, changes, or clears a selection. The server rejects
  changes after submission and automatically submits an expired attempt on the
  next answer, attempt, or submit request.
- `SubmitAsync` submits and scores an attempt; `GetResultAsync` returns its
  score and answer review only after submission.