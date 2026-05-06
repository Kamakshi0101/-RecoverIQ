<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Exercise;
use App\Models\ExerciseLog;
use Carbon\Carbon;

class ExerciseController extends Controller
{
    public function patientExercises(Request $request)
    {
        $exercises = Exercise::where('patient_id', $request->user()->id)
            ->where('status', 'active')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $exercises,
            'message' => 'Exercises retrieved successfully'
        ]);
    }

    public function logExercise(Request $request, $id)
    {
        $request->validate([
            'actual_reps' => 'required|integer',
            'actual_duration_minutes' => 'required|integer',
            'difficulty_rating' => 'required|integer|min:1|max:5',
            'notes' => 'nullable|string'
        ]);

        $log = ExerciseLog::create([
            'exercise_id' => $id,
            'patient_id' => $request->user()->id,
            'actual_reps' => $request->actual_reps,
            'actual_duration_minutes' => $request->actual_duration_minutes,
            'difficulty_rating' => $request->difficulty_rating,
            'notes' => $request->notes,
            'logged_at' => Carbon::now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $log,
            'message' => 'Exercise logged successfully'
        ], 201);
    }

    public function store(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'category' => 'required|in:strength,mobility,cardio,balance',
            'target_reps' => 'nullable|integer',
            'target_duration_minutes' => 'nullable|integer',
            'frequency_per_week' => 'required|integer',
        ]);

        $exercise = Exercise::create([
            'patient_id' => $id,
            'assigned_by' => $request->user()->id,
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'target_reps' => $request->target_reps,
            'target_duration_minutes' => $request->target_duration_minutes,
            'frequency_per_week' => $request->frequency_per_week,
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'data' => $exercise,
            'message' => 'Exercise assigned successfully'
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $exercise = Exercise::findOrFail($id);
        $exercise->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $exercise,
            'message' => 'Exercise updated successfully'
        ]);
    }
}
