<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\ExerciseController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ExerciseLogController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\MilestoneController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\AvailabilityController;

// Public
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // ── Admin Routes ──────────────────────────────────────────────
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard',                    [AdminController::class, 'dashboard']);

        Route::get('/doctors',                      [AdminController::class, 'getDoctors']);
        Route::post('/doctors',                     [AdminController::class, 'createDoctor']);
        Route::delete('/doctors/{id}',              [AdminController::class, 'deleteDoctor']);
        Route::get('/doctors/{doctorId}/patients',  [AdminController::class, 'getDoctorPatients']);

        Route::get('/patients/unassigned',          [AdminController::class, 'getUnassignedPatients']);
        Route::get('/patients',                     [AdminController::class, 'getPatients']);

        Route::post('/assign',                      [AdminController::class, 'assignPatient']);
        Route::post('/unassign',                    [AdminController::class, 'unassignPatient']);
        Route::post('/reassign',                    [AdminController::class, 'reassignPatient']);

        Route::get('/history',                      [AdminController::class, 'getHistory']);
    });

    // ── Patient Routes ────────────────────────────────────────────
    Route::middleware('role:patient')->prefix('patient')->group(function () {
        Route::get('/dashboard', [PatientController::class, 'dashboard']);
        Route::get('/progress',  [ProgressController::class, 'index']);
        Route::post('/progress', [ProgressController::class, 'store']);

        // Exercise Logger
        Route::get('/today-exercises',   [ExerciseLogController::class, 'todayExercises']);
        Route::get('/exercise-library',  [ExerciseLogController::class, 'library']);
        Route::post('/exercise-logs',    [ExerciseLogController::class, 'store']);
        Route::get('/exercise-logs',     [ExerciseLogController::class, 'history']);

        // Milestones & Badges
        Route::get('/milestones',                     [MilestoneController::class, 'patientMilestones']);
        Route::patch('/milestones/{id}/complete',     [MilestoneController::class, 'complete']);
        Route::get('/badges',                         [MilestoneController::class, 'getBadges']);

        // Appointments
        Route::get('/appointments',                          [AppointmentController::class, 'index']);
        Route::get('/appointments/available-slots',          [AppointmentController::class, 'availableSlots']);
        Route::post('/appointments',                         [AppointmentController::class, 'book']);
        Route::patch('/appointments/{id}/cancel',            [AppointmentController::class, 'cancel']);
        Route::get('/appointments/{id}/reminders',           [AppointmentController::class, 'reminderStatus']);
        Route::patch('/appointments/{id}/reminders',         [AppointmentController::class, 'reminderStatus']);

        // Feedback
        Route::get('/feedback',                      [FeedbackController::class, 'index']);
        Route::patch('/feedback/{id}/read',          [FeedbackController::class, 'markRead']);

        // Misc
        Route::get('/timeline',    [PatientController::class, 'timeline']);
        Route::get('/export-pdf',  [PatientController::class, 'exportPdf']);
    });

    // ── Doctor Routes ─────────────────────────────────────────────
    Route::middleware('role:doctor')->prefix('doctor')->group(function () {
        Route::get('/dashboard', [DoctorController::class, 'dashboard']);

        // Patients
        Route::get('/patients',                        [DoctorController::class, 'patients']);
        Route::get('/patients/{id}',                   [DoctorController::class, 'patientDetail']);
        Route::get('/patients/{id}/progress',          [DoctorController::class, 'patientProgress']);
        Route::get('/patients/{id}/milestones',        [MilestoneController::class, 'forPatient']);
        Route::post('/patients/{id}/exercises',        [ExerciseController::class, 'store']);
        Route::post('/patients/{id}/milestones',       [MilestoneController::class, 'store']);
        Route::post('/patients/{id}/comment',          [DoctorController::class, 'addComment']);

        // Milestones & Exercises
        Route::patch('/milestones/{id}/progress',      [MilestoneController::class, 'updateProgress']);
        Route::put('/exercises/{id}',                  [ExerciseController::class, 'update']);
        Route::put('/milestones/{id}',                 [MilestoneController::class, 'update']);

        // Appointments — ORDER MATTERS: static paths before dynamic
        Route::get('/appointments/pending',            [AppointmentController::class, 'getPendingRequests']);
        Route::get('/appointments',                    [AppointmentController::class, 'getSchedule']);
        Route::patch('/appointments/{id}/confirm',     [AppointmentController::class, 'confirm']);
        Route::patch('/appointments/{id}/suggest',     [AppointmentController::class, 'suggestAlternative']);
        Route::patch('/appointments/{id}/notes',       [AppointmentController::class, 'addSessionNotes']);
        Route::get('/appointments/{id}/prep',          [AppointmentController::class, 'getSessionPrep']);

        // Availability
        Route::get('/availability',                    [AvailabilityController::class, 'index']);
        Route::post('/availability',                   [AvailabilityController::class, 'setAvailability']);
        Route::post('/availability/generate',          [AvailabilityController::class, 'generate']);
        Route::post('/availability/block',             [AvailabilityController::class, 'block']);
        Route::delete('/availability/{id}',            [AvailabilityController::class, 'destroy']);
    });
});
