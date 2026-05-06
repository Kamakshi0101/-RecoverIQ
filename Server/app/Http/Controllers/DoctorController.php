<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Patient;
use App\Models\User;
use App\Models\ProgressLog;
use App\Models\DoctorComment;

class DoctorController extends Controller
{
    public function dashboard(Request $request)
    {
        $doctorId = $request->user()->id;
        
        $totalPatients = Patient::where('doctor_id', $doctorId)->count();
        $activeToday = Patient::where('doctor_id', $doctorId)
            ->whereDate('last_log_date', today())
            ->count();
            
        $avgPain = Patient::where('doctor_id', $doctorId)->avg('current_pain_level') ?? 0;
        $avgMobility = Patient::where('doctor_id', $doctorId)->avg('mobility_score') ?? 0;

        return response()->json([
            'success' => true,
            'data' => [
                'total_patients' => $totalPatients,
                'active_today' => $activeToday,
                'avg_pain' => round($avgPain, 1),
                'avg_mobility' => round($avgMobility, 1),
            ],
            'message' => 'Doctor dashboard data loaded successfully'
        ]);
    }

    public function patients(Request $request)
    {
        $doctorId = $request->user()->id;
        $query = Patient::where('doctor_id', $doctorId)->with('user:id,name,email,avatar');
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $patients = $query->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $patients,
            'message' => 'Patients retrieved successfully'
        ]);
    }

    public function patientDetail($id)
    {
        $patient = Patient::with(['user:id,name,email,avatar', 'doctor:id,name'])->where('user_id', $id)->firstOrFail();
        
        return response()->json([
            'success' => true,
            'data' => $patient,
            'message' => 'Patient detail retrieved successfully'
        ]);
    }

    public function patientProgress($id)
    {
        $progress = ProgressLog::where('patient_id', $id)->orderBy('logged_at', 'desc')->paginate(15);
        
        return response()->json([
            'success' => true,
            'data' => $progress,
            'message' => 'Patient progress retrieved successfully'
        ]);
    }

    public function addComment(Request $request, $id)
    {
        $request->validate([
            'comment' => 'required|string',
            'type' => 'required|in:feedback,warning,encouragement'
        ]);

        $comment = DoctorComment::create([
            'patient_id' => $id,
            'doctor_id' => $request->user()->id,
            'comment' => $request->comment,
            'type' => $request->type
        ]);

        return response()->json([
            'success' => true,
            'data' => $comment,
            'message' => 'Comment added successfully'
        ], 201);
    }
}
