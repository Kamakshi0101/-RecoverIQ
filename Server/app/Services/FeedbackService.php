<?php

namespace App\Services;

use App\Models\ProgressLog;
use App\Models\ExerciseLog;
use App\Models\Patient;
use Carbon\Carbon;

class FeedbackService
{
    public function generateFeedback($patientUserId)
    {
        $feedback = [];
        
        // 1. High Pain Warning
        $recentPainLogs = ProgressLog::where('patient_id', $patientUserId)
            ->orderBy('logged_at', 'desc')
            ->take(3)
            ->pluck('pain_level');
            
        if ($recentPainLogs->count() >= 3 && $recentPainLogs->every(fn($pain) => $pain >= 8)) {
            $feedback[] = [
                'type' => 'warning',
                'message' => 'HIGH PAIN WARNING: Your pain level has been consistently high. Please consult your doctor.',
            ];
        }

        // 2. Missed Exercise Reminder
        $lastExercise = ExerciseLog::where('patient_id', $patientUserId)
            ->orderBy('logged_at', 'desc')
            ->first();
            
        if (!$lastExercise || Carbon::parse($lastExercise->logged_at)->diffInDays(now()) >= 3) {
            $feedback[] = [
                'type' => 'warning',
                'message' => 'MISSED EXERCISE REMINDER: You haven\'t logged any exercises in the last 3 days. Stay consistent!',
            ];
        }

        // 3. Great Consistency (7-day streak)
        $patient = Patient::where('user_id', $patientUserId)->first();
        if ($patient && $patient->streak_count >= 7) {
            $feedback[] = [
                'type' => 'success',
                'message' => 'GREAT CONSISTENCY: You are on a ' . $patient->streak_count . '-day streak! Keep up the good work.',
            ];
        }

        // 4. Excellent Progress (mobility +10 this week)
        $logsThisWeek = ProgressLog::where('patient_id', $patientUserId)
            ->where('logged_at', '>=', now()->subDays(7))
            ->orderBy('logged_at', 'asc')
            ->get();
            
        if ($logsThisWeek->count() >= 2) {
            $firstScore = $logsThisWeek->first()->mobility_score;
            $lastScore = $logsThisWeek->last()->mobility_score;
            if (($lastScore - $firstScore) >= 10) {
                $feedback[] = [
                    'type' => 'success',
                    'message' => 'EXCELLENT PROGRESS: Your mobility has improved significantly this week.',
                ];
            }
        }

        // 5. Pain Reducing
        if ($logsThisWeek->count() >= 3) {
            $painDecreasing = true;
            $previousPain = $logsThisWeek->first()->pain_level;
            
            foreach ($logsThisWeek->skip(1) as $log) {
                if ($log->pain_level >= $previousPain) {
                    $painDecreasing = false;
                    break;
                }
                $previousPain = $log->pain_level;
            }
            
            // Allow if difference is strictly decreasing
            if ($painDecreasing) {
                $feedback[] = [
                    'type' => 'info',
                    'message' => 'PAIN REDUCING - KEEP GOING: Your pain levels are consistently trending down.',
                ];
            }
        }

        return $feedback;
    }

    public function checkPainAlert($patientUserId, $painLevel)
    {
        if ($painLevel >= 7) {
            // Ideally store this in a system_alerts table or send an email/notification to the doctor.
            // For now, we'll log it as a comment if possible or just rely on the frontend banner.
            \Log::warning("High pain alert triggered for patient {$patientUserId} with pain level {$painLevel}.");
            return true;
        }
        return false;
    }
}
