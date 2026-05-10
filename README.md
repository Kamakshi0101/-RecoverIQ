# RecoverIQ 🌿

**RecoverIQ** is a premium, clinical-grade rehabilitation and recovery platform designed to bridge the gap between physical therapists and patients. Unlike generic medical software, RecoverIQ prioritizes an emotionally supportive, luxury wellness aesthetic (Ivory & Sage Green) and utilizes intelligent features to assist in the rehabilitation journey.

## 🚀 Tech Stack

- **Backend:** Laravel 11, PHP 8.2, MySQL
- **Frontend:** React, Vite, Tailwind CSS, Framer Motion
- **Libraries:** Recharts (Analytics), React Big Calendar (Scheduling), html2canvas (Exportable Summaries)

---

## 🌟 Key Features

### 1. Role-Based Ecosystem
- **Admin Dashboard:** Centralized control for managing users and assigning specific patients to specific doctors.
- **Therapist (Doctor) Dashboard:** Operationally efficient hub for managing patient loads, tracking adherence, and preparing for sessions.
- **Patient Dashboard:** A calming, gamified, and highly supportive interface to track recovery.

### 2. Intelligent Appointment & Scheduling System
A complete end-to-end appointment ecosystem.
- **For Patients:**
  - Premium calendar view with color-coded appointment states.
  - Guided, step-by-step booking modal to request sessions.
  - Upcoming session widgets with countdowns and preparation checklists.
  - Read-only clinical history timeline visible 24 hours after a session.
- **For Therapists:**
  - Robust Availability Manager to define recurring weekly templates and apply bulk "unavailable" blocks (e.g., holidays).
  - Session Prep Dashboard: An intelligent clinical assistant that surfaces a patient's recent pain trends, adherence stats, and AI-style insights *before* the session begins.
  - Day/Week/Agenda schedule views and Pending Requests confirmation workflow.
  - Appointment Analytics tracking volume and attendance rates.

### 3. Advanced Exercise Logger
- Real-time **Recovery Timer** utilizing animated SVG rings.
- **Exertion Scale (RPE):** Custom segmented slider to accurately track effort intensity.
- **Pain Slider & Mood Picker:** Emotional wellness trackers that issue warnings for high pain detection (>=7).
- "Incomplete Session" tracking for compassionate adherence monitoring.
- Patient-facing **Premium Analytics** visualizing their personal pain and exertion trajectory over time.

### 4. Milestones & Gamification
- Replaced static CRUD lists with a beautiful, vertical **Journey Timeline**.
- Animated **Progress Rings** for tracking sub-tasks within a milestone.
- **Therapeutic Confetti** engine that triggers upon goal completion.
- Automated generation of **Shareable Achievement Cards** via `html2canvas` for patients to celebrate their recovery on social media.

## 📁 Project Architecture

### Backend APIs (`Server/app/Http/Controllers/`)
- `AuthController`: Handles registration and login using Laravel Sanctum.
- `AdminController`: Centralized management of users and doctor-patient assignments.
- `DoctorController` & `PatientController`: Handles role-specific dashboard data aggregation.
- `ExerciseController` & `ExerciseLogController`: Manages the exercise library, assigning exercises to patients, and the daily logging system.
- `AppointmentController`, `AvailabilityController`, & `SessionPrepController`: Powers the comprehensive scheduling ecosystem.
- `MilestoneController`: Manages patient goals and gamified badge achievements.
- `ProgressController`: Tracks overarching recovery metrics.

### Frontend Views (`Client/src/pages/`)
- `Landing.jsx`: Public-facing marketing and information page.
- `Login.jsx` & `Register.jsx`: Secure authentication flows.
- **Patient Interface (`/patient/`)**:
  - `Dashboard.jsx`: Central hub for recovery tracking.
  - `ExerciseLogger.jsx`: Premium tracking with custom sliders and Recharts analytics.
  - `Milestones.jsx`: Vertical journey timeline with confetti celebrations.
  - `Calendar.jsx`: Month/Week booking view powered by `react-big-calendar`.
- **Doctor Interface (`/doctor/`)**:
  - `Dashboard.jsx`: Patient management overview.
  - `PatientList.jsx` & `PatientDetail.jsx`: Deep dive into specific patient progress.
  - `Appointments.jsx` & `AvailabilityManager.jsx`: Full calendar view and schedule configuration.
  - `SessionPrepDashboard.jsx`: Intelligent clinical assistant summarizing patient data before sessions.

---

## 🗄️ Core Database Schema

The platform relies on a heavily relational, clinical-grade MySQL schema:

- `users` (Roles: Admin, Doctor, Patient) & `patients` (Extended demographic data)
- `doctor_patient_assignments`: Strict mapping ensuring patients are tied to a primary therapist.
- `exercise_library`: The centralized catalog of prescribed movements (categorized by strength, mobility, etc.).
- `exercise_logs`: Daily tracking metrics per patient, including completed reps, duration, `pain_level` (1-10), `rpe_level` (1-10), and emotional `mood`.
- `milestones` & `milestone_badges`: Target recovery goals and the gamified achievements unlocked upon completion.
- `appointments` & `available_slots`: The backbone of the scheduling system, tracking status, clinical `session_notes`, and therapist availability constraints.

---

## 🛠️ Installation & Setup

### Prerequisites
- PHP ^8.2
- Composer
- Node.js & npm
- MySQL

### Backend Setup (Laravel)
1. Navigate to the `Server` directory:
   ```bash
   cd Server
   ```
2. Install PHP dependencies:
   ```bash
   composer install
   ```
3. Copy the environment file and generate an application key:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
4. Configure your database settings in the `.env` file.
5. Run migrations and seed the database with synthetic testing data (doctors, patients, exercise library, 30-day mock logs, and appointments):
   ```bash
   php artisan migrate:fresh --seed
   ```
6. Start the local server:
   ```bash
   php artisan serve
   ```

### Frontend Setup (React/Vite)
1. Open a new terminal and navigate to the `Client` directory:
   ```bash
   cd Client
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🎨 Design Philosophy
RecoverIQ actively rejects "dark mode cyberpunk" and "neon SaaS" aesthetics. It strictly adheres to:
- **Colors:** Ivory (`#FDFBF7`), Sage Green (`#8BA888`), Deep Therapeutic Green (`#2A3B2C`), and Soft Sand (`#E7D9C9`).
- **Typography:** Elegant editorial serif headings paired with highly readable sans-serif body text.
- **Interactions:** Heavy usage of `framer-motion` to provide calm micro-interactions, soft page reveals, and smooth modal transitions. 

*Recovery takes time. Every effort matters.*
