<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Patient;
use App\Models\User;
use App\Models\ProgressLog;
use App\Models\DoctorComment;
use App\Models\Appointment;

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

        $todaysAppointments = Appointment::where('doctor_id', $doctorId)
            ->whereDate('scheduled_at', today())
            ->where('status', 'confirmed')
            ->count();
            
        $upcomingAppointments = Appointment::with('patient:id,name,avatar')
            ->where('doctor_id', $doctorId)
            ->where('scheduled_at', '>=', now())
            ->whereIn('status', ['pending', 'confirmed'])
            ->orderBy('scheduled_at', 'asc')
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_patients' => $totalPatients,
                'active_today' => $activeToday,
                'avg_pain' => round($avgPain, 1),
                'avg_mobility' => round($avgMobility, 1),
                'todays_appointments' => $todaysAppointments,
                'upcoming_appointments' => $upcomingAppointments,
            ],
            'message' => 'Doctor dashboard data loaded successfully'
        ]);
    }

    public function patients(Request $request)
    {
        $doctorId = $request->user()->id;
        $query = Patient::with('user:id,name,email,avatar')->where('doctor_id', $doctorId);
        
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

    public function patientDetail(Request $request, $id)
    {
        $doctorId = $request->user()->id;
        $patient = Patient::with(['user:id,name,email,avatar', 'doctor:id,name'])
            ->where('user_id', $id)
            ->where('doctor_id', $doctorId)
            ->firstOrFail();
        
        return response()->json([
            'success' => true,
            'data' => $patient,
            'message' => 'Patient detail retrieved successfully'
        ]);
    }

    public function patientProgress(Request $request, $id)
    {
        $doctorId = $request->user()->id;

        // Security: ensure this patient belongs to the requesting doctor
        $patient = Patient::where('user_id', $id)->where('doctor_id', $doctorId)->first();
        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. This patient is not assigned to you.',
            ], 403);
        }

        $progress = ProgressLog::where('patient_id', $id)->orderBy('logged_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data'    => $progress,
            'message' => 'Patient progress retrieved successfully',
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
