<?php

namespace App\Services;

use App\Models\Feedback;
use App\Models\ProgressLog;
use App\Models\ExerciseLog;
use App\Models\Patient;
use Carbon\Carbon;

class FeedbackService
{
    /**
     * checkPainAlert — called after every exercise log.
     * Writes a warning to the feedbacks table if pain >= 7
     * and no warning was created in the last 24 hours for this patient.
     */
    public function checkPainAlert(int $patientId, int $painLevel): bool
    {
        if ($painLevel < 7) {
            return false;
        }

        // De-duplicate: skip if a warning was already written in last 24h
        $recentWarning = Feedback::where('patient_id', $patientId)
            ->where('type', 'warning')
            ->where('created_at', '>=', now()->subHours(24))
            ->exists();

        if ($recentWarning) {
            return false;
        }

        Feedback::create([
            'patient_id' => $patientId,
            'type'       => 'warning',
            'message'    => 'High pain detected — consider stopping and contacting your therapist.',
            'is_read'    => false,
        ]);

        return true;
    }

    /**
     * generateSmartFeedback — proactive tips based on recent data.
     * Called by FeedbackController::index().
     * Writes new feedback records for un-read insights; returns all unread.
     */
    public function generateFeedback(int $patientId): array
    {
        $patient = Patient::where('user_id', $patientId)->first();

        // ── 1. 7-day streak tip ──────────────────────────────────────
        if ($patient && $patient->streak_count >= 7) {
            $this->maybeCreate($patientId, 'success',
                'Great consistency! You are on a ' . $patient->streak_count . '-day streak. Keep it up!'
            );
        }

        // ── 2. Missed exercise reminder (no log in 3+ days) ──────────
        $lastExercise = ExerciseLog::where('patient_id', $patientId)
            ->orderBy('logged_at', 'desc')->first();
        if (!$lastExercise || Carbon::parse($lastExercise->logged_at)->diffInDays(now()) >= 3) {
            $this->maybeCreate($patientId, 'warning',
                'You haven\'t logged any exercises in 3 days. Staying consistent speeds your recovery!'
            );
        }

        // ── 3. Mobility improvement tip ──────────────────────────────
        $logsThisWeek = ProgressLog::where('patient_id', $patientId)
            ->where('logged_at', '>=', now()->subDays(7))
            ->orderBy('logged_at', 'asc')
            ->get();

        if ($logsThisWeek->count() >= 2) {
            $firstScore = $logsThisWeek->first()->mobility_score;
            $lastScore  = $logsThisWeek->last()->mobility_score;
            if (($lastScore - $firstScore) >= 10) {
                $this->maybeCreate($patientId, 'success',
                    'Excellent progress! Your mobility score improved significantly this week.'
                );
            }
        }

        // ── 4. High pain trend ───────────────────────────────────────
        $recentPain = ProgressLog::where('patient_id', $patientId)
            ->orderBy('logged_at', 'desc')->take(3)->pluck('pain_level');
        if ($recentPain->count() >= 3 && $recentPain->every(fn($p) => $p >= 8)) {
            $this->maybeCreate($patientId, 'warning',
                'Your pain level has been consistently high for 3 sessions. Please consult your therapist.'
            );
        }

        // Return all unread feedback for this patient
        return Feedback::where('patient_id', $patientId)
            ->where('is_read', false)
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get()
            ->toArray();
    }

    /**
     * Create feedback only if no identical message was created in last 24h.
     */
    private function maybeCreate(int $patientId, string $type, string $message): void
    {
        $exists = Feedback::where('patient_id', $patientId)
            ->where('type', $type)
            ->where('message', $message)
            ->where('created_at', '>=', now()->subHours(24))
            ->exists();

        if (!$exists) {
            Feedback::create([
                'patient_id' => $patientId,
                'type'       => $type,
                'message'    => $message,
                'is_read'    => false,
            ]);
        }
    }
}
