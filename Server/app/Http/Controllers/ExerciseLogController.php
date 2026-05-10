<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Exercise;
use App\Models\ExerciseLibrary;
use App\Models\ExerciseLog;
use App\Services\FeedbackService;
use App\Services\StreakService;
use Carbon\Carbon;

class ExerciseLogController extends Controller
{
    protected $feedbackService;
    protected $streakService;

    public function __construct(FeedbackService $feedbackService, StreakService $streakService)
    {
        $this->feedbackService = $feedbackService;
        $this->streakService = $streakService;
    }

    public function todayExercises(Request $request)
    {
        $patientId = $request->user()->id;
        
        // Get assigned exercises that are active
        $assigned = Exercise::where('patient_id', $patientId)
            ->where('status', 'active')
            ->get();

        // Find which ones were already logged today
        $todayLogs = ExerciseLog::where('patient_id', $patientId)
            ->whereDate('logged_at', today())
            ->pluck('exercise_id')
            ->toArray();

        $result = $assigned->map(function ($ex) use ($todayLogs) {
            return [
                'id' => $ex->id,
                'name' => $ex->name,
                'category' => $ex->category,
                'target_sets' => null, // Assuming sets aren't in Exercises yet, or add them? 
                'target_reps' => $ex->target_reps,
                'target_duration_minutes' => $ex->target_duration_minutes,
                'already_logged' => in_array($ex->id, $todayLogs),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }

    public function library()
    {
        $library = ExerciseLibrary::all();
        
        return response()->json([
            'success' => true,
            'data' => $library
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'exercise_id' => 'nullable|exists:exercises,id',
            'exercise_name' => 'required_without:exercise_id|string|max:255',
            'sets_completed' => 'nullable|integer|min:0',
            'reps_completed' => 'nullable|integer|min:0',
            'duration_seconds' => 'nullable|integer|min:0',
            'pain_level' => 'required|integer|between:1,10',
            'rpe_level' => 'required|integer|between:1,10',
            'mood' => 'required|in:great,good,neutral,tired,struggling',
            'notes' => 'nullable|string|max:1000',
            'is_incomplete' => 'boolean',
        ]);

        $patientId = $request->user()->id;

        // Determine name and prescribed
        $name = $request->exercise_name;
        $repsPrescribed = null;
        $setsPrescribed = null;

        if ($request->exercise_id) {
            $ex = Exercise::find($request->exercise_id);
            if ($ex) {
                $name = $ex->name;
                $repsPrescribed = $ex->target_reps;
            }
        }

        $log = ExerciseLog::create([
            'patient_id' => $patientId,
            'exercise_id' => $request->exercise_id,
            'exercise_name' => $name,
            'sets_prescribed' => $setsPrescribed,
            'reps_prescribed' => $repsPrescribed,
            'sets_completed' => $request->sets_completed,
            'reps_completed' => $request->reps_completed,
            'duration_seconds' => $request->duration_seconds,
            'pain_level' => $request->pain_level,
            'rpe_level' => $request->rpe_level,
            'mood' => $request->mood,
            'notes' => $request->notes,
            'is_incomplete' => $request->is_incomplete ?? false,
            'logged_at' => now(),
        ]);

        $this->streakService->updateStreak($patientId);
        
        $warningGenerated = false;
        if ($this->feedbackService->checkPainAlert($patientId, $request->pain_level)) {
            $warningGenerated = true;
        }

        return response()->json([
            'success' => true,
            'data' => $log,
            'warning_generated' => $warningGenerated,
            'message' => 'Exercise logged successfully'
        ], 201);
    }

    public function history(Request $request)
    {
        $query = ExerciseLog::where('patient_id', $request->user()->id)
            ->orderBy('logged_at', 'desc');

        if ($request->has('exercise_id')) {
            $query->where('exercise_id', $request->exercise_id);
        }

        if ($request->has('date')) {
            $query->whereDate('logged_at', $request->date);
        }

        $logs = $query->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }
}
