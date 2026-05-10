<?php

namespace App\Services;

use App\Models\Patient;
use Carbon\Carbon;

class StreakService
{
    public function updateStreak($patientUserId)
    {
        $patient = Patient::where('user_id', $patientUserId)->first();
        if (!$patient) return;

        $today = now()->startOfDay();
        $lastLogDate = $patient->last_log_date ? Carbon::parse($patient->last_log_date)->startOfDay() : null;

        if (!$lastLogDate) {
            // First time logging
            $patient->streak_count = 1;
        } elseif ($lastLogDate->equalTo($today)) {
            // Already logged today, streak remains same
        } elseif ($lastLogDate->equalTo($today->copy()->subDay())) {
            // Logged yesterday, increment streak
            $patient->streak_count += 1;
        } else {
            // Missed a day, reset streak
            $patient->streak_count = 1;
        }

        $patient->last_log_date = now();
        $patient->save();
    }
}
