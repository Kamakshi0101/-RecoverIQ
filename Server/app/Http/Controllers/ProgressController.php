<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ProgressLog;
use App\Models\Patient;
use App\Http\Requests\ProgressLogRequest;
use Carbon\Carbon;

class ProgressController extends Controller
{
    public function index(Request $request)
    {
        $logs = ProgressLog::where('patient_id', $request->user()->id)
            ->orderBy('logged_at', 'desc')
            ->paginate(15);
            
        return response()->json([
            'success' => true,
            'data' => $logs,
            'message' => 'Progress logs retrieved successfully'
        ]);
    }

    public function store(ProgressLogRequest $request)
    {
        $userId = $request->user()->id;
        
        $log = ProgressLog::create([
            'patient_id' => $userId,
            'pain_level' => $request->pain_level,
            'mobility_score' => $request->mobility_score,
            'energy_level' => $request->energy_level,
            'notes' => $request->notes,
            'logged_at' => Carbon::now(),
        ]);

        // Update patient current stats and streak
        $patient = Patient::where('user_id', $userId)->first();
        if ($patient) {
            $patient->current_pain_level = $request->pain_level;
            $patient->mobility_score = $request->mobility_score;
            
            // Streak logic
            if ($patient->last_log_date) {
                $lastLog = Carbon::parse($patient->last_log_date);
                if ($lastLog->isYesterday()) {
                    $patient->streak_count += 1;
                } elseif (!$lastLog->isToday()) {
                    $patient->streak_count = 1;
                }
            } else {
                $patient->streak_count = 1;
            }
            
            $patient->last_log_date = Carbon::today();
            $patient->save();
        }

        // Calculate prediction
        $prediction = $this->predictProgress($userId);

        return response()->json([
            'success' => true,
            'data' => [
                'log' => $log,
                'prediction' => $prediction
            ],
            'message' => 'Progress logged successfully'
        ], 201);
    }

    private function predictProgress($patientId)
    {
        // Simple linear trend: compare last 7 days vs previous 7 days
        $last7Days = ProgressLog::where('patient_id', $patientId)
            ->where('logged_at', '>=', now()->subDays(7))
            ->get();
            
        $previous7Days = ProgressLog::where('patient_id', $patientId)
            ->whereBetween('logged_at', [now()->subDays(14), now()->subDays(7)])
            ->get();

        if ($last7Days->isEmpty() || $previous7Days->isEmpty()) {
            return null;
        }

        $avgPainLast = $last7Days->avg('pain_level');
        $avgPainPrev = $previous7Days->avg('pain_level');
        $painDiff = $avgPainLast - $avgPainPrev;
        
        $avgMobilityLast = $last7Days->avg('mobility_score');
        $avgMobilityPrev = $previous7Days->avg('mobility_score');
        $mobilityDiff = $avgMobilityLast - $avgMobilityPrev;

        $predictedPain = max(0, min(10, round($avgPainLast + $painDiff, 1)));
        $predictedMobility = max(0, min(100, round($avgMobilityLast + $mobilityDiff, 1)));

        return [
            'predicted_pain' => $predictedPain,
            'predicted_mobility' => $predictedMobility
        ];
    }
}
