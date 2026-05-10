<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\ExerciseLog;
use App\Models\Milestone;
use App\Models\Appointment;
use Carbon\Carbon;

class SessionPrepController extends Controller
{
    /**
     * Get aggregated data for the therapist's session prep dashboard
     */
    public function getPrepData(Request $request, $patientId)
    {
        // Ensure the doctor is assigned to this patient
        $doctor = $request->user();
        
        $patient = User::where('id', $patientId)
            ->where('role', 'patient')
            ->whereHas('assignedBy', function ($q) use ($doctor) {
                $q->where('doctor_id', $doctor->id);
            })
            ->firstOrFail();

        $sevenDaysAgo = Carbon::now()->subDays(7);

        // 1. Last 7 Days Exercise Logs
        $recentLogs = ExerciseLog::where('patient_id', $patient->id)
            ->where('logged_at', '>=', $sevenDaysAgo)
            ->orderBy('logged_at', 'asc')
            ->get();

        // Calculate trends
        $painAvg = $recentLogs->count() > 0 ? $recentLogs->avg('pain_level') : 0;
        $rpeAvg = $recentLogs->count() > 0 ? $recentLogs->avg('rpe_level') : 0;
        $totalDuration = $recentLogs->sum('duration_seconds');

        // Mood breakdown
        $moods = $recentLogs->groupBy('mood')->map(function ($row) {
            return $row->count();
        });

        // 2. Active Milestones
        $activeMilestones = Milestone::where('patient_id', $patient->id)
            ->whereIn('status', ['upcoming', 'in_progress'])
            ->get();

        // 3. Previous Appointment Notes
        $previousAppointment = Appointment::where('patient_id', $patient->id)
            ->where('doctor_id', $doctor->id)
            ->where('status', 'completed')
            ->orderBy('scheduled_at', 'desc')
            ->first();

        // 4. Generate AI-style insights based on logic
        $insights = [];
        
        if ($painAvg >= 6) {
            $insights[] = "Pain trends are elevated (Avg: " . round($painAvg, 1) . "/10). Consider adjusting intensity.";
        } else if ($painAvg <= 3 && $recentLogs->count() >= 3) {
            $insights[] = "Patient is managing well with low pain levels. Good opportunity for progression.";
        }

        if ($recentLogs->count() == 0) {
            $insights[] = "No exercises logged in the last 7 days. Adherence is a concern.";
        } else if ($recentLogs->count() >= 5) {
            $insights[] = "Excellent adherence this week (" . $recentLogs->count() . " sessions logged).";
        }

        $mostCommonMood = $moods->keys()->first();
        if (in_array($mostCommonMood, ['struggling', 'tired'])) {
            $insights[] = "Patient's most frequent mood is '$mostCommonMood'. Check in on their mental well-being.";
        }

        return response()->json([
            'success' => true,
            'data' => [
                'patient' => [
                    'id' => $patient->id,
                    'name' => $patient->name,
                    'email' => $patient->email,
                    'streak_count' => $patient->patient->streak_count ?? 0,
                ],
                'recent_logs' => $recentLogs,
                'metrics' => [
                    'avg_pain' => round($painAvg, 1),
                    'avg_rpe' => round($rpeAvg, 1),
                    'total_duration_mins' => round($totalDuration / 60),
                    'session_count' => $recentLogs->count(),
                ],
                'active_milestones' => $activeMilestones,
                'previous_notes' => $previousAppointment ? $previousAppointment->session_notes : null,
                'insights' => $insights
            ]
        ]);
    }
}
