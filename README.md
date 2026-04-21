# STUEDU - Smart Campus Tutoring Platform 🎓

STUEDU is a modern, responsive, and robust **MERN stack** web application designed to connect students with expert tutors seamlessly. Featuring a completely custom **dark-mode, glassmorphic UI**, this platform emphasizes dynamic design, micro-animations, and a highly polished user experience.

## ✨ Key Features

- **Role-Based Dashboards**: Tailored, isolated views and analytics panels for **Students**, **Tutors**, and **Admins**.
- **Smart Session Booking**: View weekly availability, receive algorithmic recommendations on the earliest optimized slots, and handle real-time checkout flows.
- **Tutor Trust Profiles**: An automated "Dynamic Access Profile" that adjusts booking limits and tags based on tutor reliability, perfect attendance, and reviews. 
- **Escrow-Style Wallet System**: Simulate robust monetary transactions with Wallet & Mock Card payment capabilities. Payments sit safely in escrow until the student verifies attendance.
- **My History & Attendance System**: Beautifully integrated past session logging with accurate 'Upcoming', 'Attended', and 'Missed' statistical breakdown grids.
- **Feedback & Reputation**: Direct feedback forms ensuring quality assurance across the platform.

## 🛠️ Technology Stack

- **Frontend**: React (Vite), TailwindCSS, React Router, Lucide Icons, React Toastify.
- **Backend / Database**: Node.js, Express, MongoDB (Mongoose).
- **End-to-End Testing**: Fully automated test suite powered by [Playwright](https://playwright.dev/).

## 🚦 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/) running locally or via Atlas.

### 2. Standard Local Start

**Backend Setup**
```bash
cd backend
npm install
# Make sure to configure your .env file here based on .env.example
npm run dev
```

**Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```
The application will spin up at `http://localhost:5173`.

## 🧪 E2E Testing Suite

A robust Playwright automation suite ensures perfect UI reliability. Tests cover authentication, complex modal interactions, booking flows, and admin verifications.

To execute the entire E2E suite:
```bash
cd frontend
npx playwright test
```
To run the automated tests interactively via the visual UI:
```bash
npx playwright test --ui
```

### Key Test Files:
- `auth.spec.js` - Login and authentication edge-cases
- `booking.spec.js` - Tutor scheduling, modal management, overlay bypass
- `session.spec.js` - Dashboard iteration and history checking
- `admin.spec.js` - Security, route restriction, and analytics verification
- `payment.spec.js` - Testing checkout flow and wallet balance rendering
- `feedback.spec.js` - Form validation, API interception, and Toast verification.

---
*Built for the Information Technology Project Management (ITPM) module.*