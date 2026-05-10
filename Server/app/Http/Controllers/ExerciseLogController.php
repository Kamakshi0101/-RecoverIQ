<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Exercise;
use App\Models\ExerciseLibrary;
use App\Models\ExerciseLog;
use App\Models\Patient;
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
        $this->streakService   = $streakService;
    }

    // GET /api/patient/today-exercises
    public function todayExercises(Request $request)
    {
        $patientId = $request->user()->id;

        $assigned = Exercise::where('patient_id', $patientId)
            ->where('status', 'active')
            ->get();

        $todayLoggedIds = ExerciseLog::where('patient_id', $patientId)
            ->whereDate('logged_at', today())
            ->pluck('exercise_id')
            ->filter()
            ->toArray();

        $result = $assigned->map(fn($ex) => [
            'id'                      => $ex->id,
            'name'                    => $ex->name,
            'category'                => $ex->category,
            'target_sets'             => $ex->target_sets ?? null,
            'target_reps'             => $ex->target_reps,
            'target_duration_minutes' => $ex->target_duration_minutes,
            'already_logged'          => in_array($ex->id, $todayLoggedIds),
        ]);

        return response()->json([
            'success' => true,
            'data'    => $result,
            'message' => 'Today\'s exercises retrieved',
        ]);
    }

    // GET /api/patient/exercise-library
    public function library(Request $request)
    {
        $query = ExerciseLibrary::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $library = $query->orderBy('category')->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data'    => $library,
            'message' => 'Exercise library retrieved',
        ]);
    }

    // POST /api/patient/exercise-logs
    public function store(Request $request)
    {
        $request->validate([
            'exercise_id'      => 'nullable|exists:exercises,id',
            'exercise_name'    => 'required_without:exercise_id|string|max:255',
            'sets_completed'   => 'nullable|integer|min:0|max:100',
            'reps_completed'   => 'nullable|integer|min:0|max:1000',
            'duration_seconds' => 'nullable|integer|min:0|max:86400',
            'pain_level'       => 'required|integer|between:1,10',
            'rpe_level'        => 'required|integer|between:1,10',
            'mood'             => 'required|in:great,good,neutral,tired,struggling',
            'notes'            => 'nullable|string|max:1000',
            'is_incomplete'    => 'boolean',
        ]);

        $patientId     = $request->user()->id;
        $name          = $request->exercise_name;
        $repsPrescribed = null;
        $setsPrescribed = null;

        if ($request->exercise_id) {
            $ex = Exercise::find($request->exercise_id);
            if ($ex) {
                $name           = $ex->name;
                $repsPrescribed = $ex->target_reps;
                $setsPrescribed = $ex->target_sets ?? null;
            }
        }

        $log = ExerciseLog::create([
            'patient_id'       => $patientId,
            'exercise_id'      => $request->exercise_id,
            'exercise_name'    => $name,
            'sets_prescribed'  => $setsPrescribed,
            'reps_prescribed'  => $repsPrescribed,
            'sets_completed'   => $request->sets_completed,
            'reps_completed'   => $request->reps_completed,
            'duration_seconds' => $request->duration_seconds,
            'pain_level'       => $request->pain_level,
            'rpe_level'        => $request->rpe_level,
            'mood'             => $request->mood,
            'notes'            => $request->notes,
            'is_incomplete'    => $request->is_incomplete ?? false,
            'logged_at'        => now(),
        ]);

        // Update streak
        $this->streakService->updateStreak($patientId);

        // Fetch updated streak count
        $patient = Patient::where('user_id', $patientId)->first();
        $currentStreak = $patient ? $patient->streak_count : 0;

        // Pain alert — writes to DB if pain >= 7
        $warningTriggered = $this->feedbackService->checkPainAlert($patientId, $request->pain_level);

        return response()->json([
            'success' => true,
            'data'    => [
                'log'            => $log,
                'streak_updated' => true,
                'current_streak' => $currentStreak,
            ],
            'message' => 'Exercise logged successfully.',
        ], 201);
    }

    // GET /api/patient/exercise-logs
    public function history(Request $request)
    {
        $query = ExerciseLog::where('patient_id', $request->user()->id)
            ->orderBy('logged_at', 'desc');

        if ($request->filled('exercise_id')) {
            $query->where('exercise_id', $request->exercise_id);
        }
        if ($request->filled('date')) {
            $query->whereDate('logged_at', $request->date);
        }

        $logs = $query->paginate(10);

        return response()->json([
            'success' => true,
            'data'    => $logs,
            'message' => 'Exercise history retrieved',
        ]);
    }
}
