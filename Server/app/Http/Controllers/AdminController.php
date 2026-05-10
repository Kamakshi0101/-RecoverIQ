<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Patient;
use App\Models\DoctorPatientHistory;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function index()
    {
        $totalDoctors = User::where('role', 'doctor')->count();
        $totalPatients = Patient::count();
        $unassignedPatientsCount = Patient::whereNull('doctor_id')->count();
        
        $doctorsWithCount = User::where('role', 'doctor')
            ->withCount('patientsAsDoctor')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_doctors' => $totalDoctors,
                'total_patients' => $totalPatients,
                'unassigned_patients' => $unassignedPatientsCount,
                'doctors_overview' => $doctorsWithCount
            ],
            'message' => 'Admin dashboard data loaded successfully'
        ]);
    }

    public function getDoctors()
    {
        $doctors = User::where('role', 'doctor')
            ->select('id', 'name', 'email', 'created_at')
            ->withCount('patientsAsDoctor as patient_count')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $doctors,
            'message' => 'Doctors retrieved successfully'
        ]);
    }

    public function getPatients(Request $request)
    {
        $query = Patient::with(['user:id,name,email', 'doctor:id,name']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $patients = $query->paginate(15);

        // Map to include doctor name or "Unassigned"
        $patients->getCollection()->transform(function($patient) {
            $patient->doctor_name = $patient->doctor ? $patient->doctor->name : 'Unassigned';
            return $patient;
        });

        return response()->json([
            'success' => true,
            'data' => $patients,
            'message' => 'Patients retrieved successfully'
        ]);
    }

    public function assignPatient(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:users,id',
            'doctor_id' => 'required|exists:users,id',
        ]);

        $patient = Patient::where('user_id', $request->patient_id)->firstOrFail();
        
        // Check if user is a doctor
        $doctor = User::where('id', $request->doctor_id)->where('role', 'doctor')->firstOrFail();

        DB::transaction(function () use ($patient, $doctor, $request) {
            $patient->update([
                'doctor_id' => $doctor->id,
                'assigned_at' => now(),
                'assigned_by' => $request->user()->id,
            ]);

            DoctorPatientHistory::create([
                'patient_id' => $patient->user_id,
                'doctor_id' => $doctor->id,
                'assigned_by' => $request->user()->id,
                'assigned_at' => now(),
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Patient assigned to doctor successfully'
        ]);
    }

    public function unassignPatient(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:users,id',
        ]);

        $patient = Patient::where('user_id', $request->patient_id)->firstOrFail();

        if (!$patient->doctor_id) {
            return response()->json([
                'success' => false,
                'message' => 'Patient is not currently assigned to a doctor'
            ], 400);
        }

        $oldDoctorId = $patient->doctor_id;

        DB::transaction(function () use ($patient, $oldDoctorId) {
            $patient->update([
                'doctor_id' => null,
                'assigned_at' => null,
                'assigned_by' => null,
            ]);

            DoctorPatientHistory::where('patient_id', $patient->user_id)
                ->where('doctor_id', $oldDoctorId)
                ->whereNull('unassigned_at')
                ->update(['unassigned_at' => now(), 'reason' => 'Unassigned by admin']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Patient unassigned successfully'
        ]);
    }

    public function reassignPatient(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:users,id',
            'new_doctor_id' => 'required|exists:users,id',
            'reason' => 'nullable|string',
        ]);

        $patient = Patient::where('user_id', $request->patient_id)->firstOrFail();
        $newDoctor = User::where('id', $request->new_doctor_id)->where('role', 'doctor')->firstOrFail();

        if ($patient->doctor_id == $newDoctor->id) {
             return response()->json([
                'success' => false,
                'message' => 'Patient is already assigned to this doctor'
            ], 400);
        }

        $oldDoctorId = $patient->doctor_id;

        DB::transaction(function () use ($patient, $newDoctor, $oldDoctorId, $request) {
            if ($oldDoctorId) {
                DoctorPatientHistory::where('patient_id', $patient->user_id)
                    ->where('doctor_id', $oldDoctorId)
                    ->whereNull('unassigned_at')
                    ->update([
                        'unassigned_at' => now(), 
                        'reason' => $request->reason ?? 'Reassigned'
                    ]);
            }

            $patient->update([
                'doctor_id' => $newDoctor->id,
                'assigned_at' => now(),
                'assigned_by' => $request->user()->id,
            ]);

            DoctorPatientHistory::create([
                'patient_id' => $patient->user_id,
                'doctor_id' => $newDoctor->id,
                'assigned_by' => $request->user()->id,
                'assigned_at' => now(),
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Patient reassigned successfully'
        ]);
    }

    public function getUnassignedPatients()
    {
        $patients = Patient::with('user:id,name,email')
            ->whereNull('doctor_id')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $patients,
            'message' => 'Unassigned patients retrieved successfully'
        ]);
    }

    public function getDoctorPatients($doctorId)
    {
        $patients = Patient::with('user:id,name,email')
            ->where('doctor_id', $doctorId)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $patients,
            'message' => 'Doctor\'s patients retrieved successfully'
        ]);
    }
}
