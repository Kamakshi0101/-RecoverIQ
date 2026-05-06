<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\ExerciseController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\MilestoneController;
use App\Http\Controllers\FeedbackController;

// Public
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Patient Routes
    Route::middleware('role:patient')->prefix('patient')->group(function () {
        Route::get('/dashboard', [PatientController::class, 'dashboard']);
        Route::get('/progress', [ProgressController::class, 'index']); // Paginated
        Route::post('/progress', [ProgressController::class, 'store']);
        Route::get('/exercises', [ExerciseController::class, 'patientExercises']);
        Route::post('/exercises/{id}/log', [ExerciseController::class, 'logExercise']);
        Route::get('/milestones', [MilestoneController::class, 'patientMilestones']);
        Route::get('/feedback', [FeedbackController::class, 'index']); // Smart feedback
        Route::get('/timeline', [PatientController::class, 'timeline']);
        Route::get('/export-pdf', [PatientController::class, 'exportPdf']);
    });

    // Doctor Routes
    Route::middleware('role:doctor')->prefix('doctor')->group(function () {
        Route::get('/dashboard', [DoctorController::class, 'dashboard']);
        Route::get('/patients', [DoctorController::class, 'patients']); // Search + Paginate
        Route::get('/patients/{id}', [DoctorController::class, 'patientDetail']);
        Route::get('/patients/{id}/progress', [DoctorController::class, 'patientProgress']);
        Route::post('/patients/{id}/exercises', [ExerciseController::class, 'store']); // Assign exercise
        Route::post('/patients/{id}/milestones', [MilestoneController::class, 'store']); // Assign milestone
        Route::post('/patients/{id}/comment', [DoctorController::class, 'addComment']); // Leave feedback
        Route::put('/exercises/{id}', [ExerciseController::class, 'update']);
        Route::put('/milestones/{id}', [MilestoneController::class, 'update']);
    });
});
