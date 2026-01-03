# IELTS Vocabulary Study App

A minimal full‑stack web application for studying IELTS vocabulary using an interactive **Study Mode**, keyboard shortcuts, and progress tracking.

This project is designed as a **portfolio / MVP app** focusing on clean state management, UX clarity, and fast iteration — suitable for early user testing.

---

## 🌐 Demo

> (Links will be added after deployment)

* Frontend: *TBD*
* Backend API: *TBD*

---

## ✨ Features

* 📚 Vocabulary list with topic filter and search
* 🎯 Study Mode with flashcard-style learning
* ⌨️ Keyboard-driven interactions for fast study flow
* 📊 Progress tracking (learned / total + progress bar)
* 💾 Local persistence (resume study after page refresh)
* 🧩 List Mode & Study Mode separation
* 🪶 Minimal, distraction-free UI

---

## ⌨️ Study Mode Shortcuts

| Key   | Action                  |
| ----- | ----------------------- |
| Space | Show answer             |
| 1     | Mark as **Remembered**  |
| 2     | Mark as **Forgot**      |
| Enter | Restart after finishing |

---

## 🧠 Design Decisions

* **No authentication in MVP**
  → Reduce friction for early users and user testing.

* **Shared vocabulary dataset**
  → Simplifies onboarding; users can start studying immediately.

* **LocalStorage-based progress**
  → Allows study sessions to resume after refresh without backend complexity.

* **Derived state for progress**
  → Learned count and progress percentage are computed, not stored, to avoid desync bugs.

* **Keyboard-first UX**
  → Optimized for focused study and fast repetition.

---

## 🏗️ Architecture Overview

```
Frontend (React)
│
├── List Mode
│   └── View / search / edit vocab
│
├── Study Mode
│   ├── Study queue (shuffled)
│   ├── Progress calculation
│   └── Keyboard handling
│
└── LocalStorage
    └── Persist study progress

Backend (Flask)
└── REST API
    └── Vocabulary CRUD
```

---

## 🛠️ Tech Stack

### Frontend

* React (functional components, hooks)
* useState & derived state (no external state library)
* Keyboard event handling
* Conditional rendering by mode

### Backend

* Python Flask (REST API)
* Simple JSON-based data source (no database for MVP)

### Deployment (planned)

* Frontend: Vercel / Netlify
* Backend: Render / Railway

---

## 🚀 Roadmap

* User authentication
* Per-user vocabulary lists
* Spaced repetition algorithm (SM-2)
* Progress sync to backend
* Mobile-first UI improvements
* Sound & animation feedback in Study Mode

---

## 🧪 Local Development

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## 🎯 Project Goals

* Practice full‑stack development with a real, usable product
* Focus on UX, state correctness, and iteration speed
* Build a deployable MVP suitable for user testing and portfolio use

---

## 📄 License

This project is for learning and portfolio purposes.
