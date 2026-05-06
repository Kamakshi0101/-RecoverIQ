<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Patient;
use App\Models\ProgressLog;
use App\Models\ExerciseLog;
use App\Models\Milestone;
use App\Models\DoctorComment;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class PatientController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $patient = Patient::where('user_id', $user->id)->first();
        
        $exercisesToday = \App\Models\Exercise::where('patient_id', $user->id)
            ->where('status', 'active')
            ->count();

        // Trend charts data (last 14 days)
        $painTrend = ProgressLog::where('patient_id', $user->id)
            ->where('logged_at', '>=', now()->subDays(14))
            ->orderBy('logged_at', 'asc')
            ->get(['pain_level', 'logged_at']);
            
        $mobilityTrend = ProgressLog::where('patient_id', $user->id)
            ->where('logged_at', '>=', now()->subDays(14))
            ->orderBy('logged_at', 'asc')
            ->get(['mobility_score', 'logged_at']);

        $recentComments = DoctorComment::where('patient_id', $user->id)
            ->with('doctor:id,name,avatar')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'current_pain_level' => $patient->current_pain_level ?? 0,
                    'mobility_score' => $patient->mobility_score ?? 0,
                    'streak_count' => $patient->streak_count ?? 0,
                    'exercises_today' => $exercisesToday,
                ],
                'pain_trend' => $painTrend,
                'mobility_trend' => $mobilityTrend,
                'recent_comments' => $recentComments,
            ],
            'message' => 'Dashboard data loaded successfully'
        ]);
    }

    public function timeline(Request $request)
    {
        $userId = $request->user()->id;

        $progressLogs = ProgressLog::where('patient_id', $userId)->get()->map(function($log) {
            return [
                'type' => 'progress_log',
                'date' => $log->logged_at,
                'title' => 'Logged Progress',
                'description' => "Pain: {$log->pain_level}, Mobility: {$log->mobility_score}"
            ];
        });

        $exerciseLogs = ExerciseLog::where('patient_id', $userId)->with('exercise')->get()->map(function($log) {
            return [
                'type' => 'exercise_log',
                'date' => $log->logged_at,
                'title' => 'Completed Exercise: ' . ($log->exercise->name ?? 'Unknown'),
                'description' => "Reps: {$log->actual_reps}, Duration: {$log->actual_duration_minutes}m"
            ];
        });

        $milestones = Milestone::where('patient_id', $userId)->where('status', 'completed')->get()->map(function($log) {
            return [
                'type' => 'milestone',
                'date' => $log->completed_at,
                'title' => 'Milestone Achieved: ' . $log->title,
                'description' => $log->description
            ];
        });

        $timeline = $progressLogs->concat($exerciseLogs)->concat($milestones)->sortByDesc('date')->values();

        return response()->json([
            'success' => true,
            'data' => $timeline,
            'message' => 'Timeline loaded successfully'
        ]);
    }

    public function exportPdf(Request $request)
    {
        $user = $request->user();
        $patient = Patient::where('user_id', $user->id)->with('doctor')->first();

        $painData = ProgressLog::where('patient_id', $user->id)
            ->where('logged_at', '>=', now()->subDays(30))
            ->orderBy('logged_at', 'asc')
            ->get();

        $milestones = Milestone::where('patient_id', $user->id)->get();

        // We can pass data to a blade view to generate PDF
        // Create resources/views/pdf/report.blade.php if we want actual HTML rendering
        $pdf = Pdf::loadHTML('<h1>RehabTrack Progress Report</h1><p>Patient: ' . $user->name . '</p><p>Current Pain: ' . ($patient->current_pain_level ?? 0) . '</p><p>Mobility Score: ' . ($patient->mobility_score ?? 0) . '</p>');

        // Usually we would return the PDF file directly, but for API we might return a base64 string or a download link.
        // Returning as base64 for API usage
        $pdfBase64 = base64_encode($pdf->output());

        return response()->json([
            'success' => true,
            'data' => [
                'pdf_base64' => $pdfBase64,
                'filename' => 'RehabTrack_Report_' . Carbon::now()->format('Ymd') . '.pdf'
            ],
            'message' => 'PDF generated successfully'
        ]);
    }
}
