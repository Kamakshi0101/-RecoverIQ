<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use App\Models\User;
use App\Models\Patient;
use App\Models\ExerciseLog;
use App\Models\ProgressLog;
use App\Models\DoctorPatientHistory;
use Carbon\Carbon;

class AdminController extends Controller
{
    // ─── HELPER ────────────────────────────────────────────────────
    private function errorResponse(string $message, int $status = 422, array $errors = [])
    {
        $body = ['success' => false, 'message' => $message];
        if (!empty($errors)) $body['errors'] = $errors;
        return response()->json($body, $status);
    }

    // ─── METHOD 1: dashboard() ──────────────────────────────────────
    // GET /api/admin/dashboard
    public function dashboard()
    {
        $today = Carbon::today();
        $weekAgo = Carbon::now()->subDays(7);
        $monthStart = Carbon::now()->startOfMonth();

        // Core counts
        $totalDoctors  = User::where('role', 'doctor')->count();
        $totalPatients = User::where('role', 'patient')->count();
        $unassignedCount = Patient::whereNull('doctor_id')->count();
        $newPatientsMonth = User::where('role', 'patient')->where('created_at', '>=', $monthStart)->count();

        // Active today (patient logged exercise or progress today)
        $activeToday = DB::table('patients')
            ->where(function ($q) use ($today) {
                $q->whereExists(function ($sub) use ($today) {
                    $sub->select(DB::raw(1))
                        ->from('exercise_logs')
                        ->whereColumn('exercise_logs.patient_id', 'patients.user_id')
                        ->whereDate('logged_at', $today);
                })->orWhereExists(function ($sub) use ($today) {
                    $sub->select(DB::raw(1))
                        ->from('progress_logs')
                        ->whereColumn('progress_logs.patient_id', 'patients.user_id')
                        ->whereDate('logged_at', $today);
                });
            })->count();

        // High pain alerts today (distinct patients with pain >= 7)
        $highPainToday = ExerciseLog::where('pain_level', '>=', 7)
            ->whereDate('logged_at', $today)
            ->distinct('patient_id')
            ->count('patient_id');

        // Avg pain & mobility (last 7 days from progress_logs)
        $avgPainWeek     = round(ProgressLog::where('logged_at', '>=', $weekAgo)->avg('pain_level') ?? 0, 1);
        $avgMobilityWeek = round(ProgressLog::where('logged_at', '>=', $weekAgo)->avg('mobility_score') ?? 0, 1);

        // Recent assignments (last 5)
        $recentAssignments = DB::table('doctor_patient_history as dph')
            ->join('users as p', 'dph.patient_id', '=', 'p.id')
            ->join('users as d', 'dph.doctor_id', '=', 'd.id')
            ->join('users as a', 'dph.assigned_by', '=', 'a.id')
            ->select(
                'dph.id', 'dph.assigned_at', 'dph.unassigned_at', 'dph.reason',
                'p.name as patient_name',
                'd.name as doctor_name',
                'a.name as assigned_by_name'
            )
            ->orderBy('dph.assigned_at', 'desc')
            ->limit(5)
            ->get();

        // Doctors summary
        $doctorsSummary = DB::table('users as u')
            ->leftJoin('patients as pat', function ($join) {
                $join->on('pat.doctor_id', '=', 'u.id')->where('pat.status', 'active');
            })
            ->where('u.role', 'doctor')
            ->groupBy('u.id', 'u.name', 'u.email', 'u.created_at')
            ->select('u.id', 'u.name', 'u.email', 'u.created_at', DB::raw('COUNT(pat.id) as patient_count'))
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_doctors'        => $totalDoctors,
                'total_patients'       => $totalPatients,
                'unassigned_patients'  => $unassignedCount,
                'new_patients_month'   => $newPatientsMonth,
                'active_today'         => $activeToday,
                'high_pain_today'      => $highPainToday,
                'avg_pain_week'        => $avgPainWeek,
                'avg_mobility_week'    => $avgMobilityWeek,
                'recent_assignments'   => $recentAssignments,
                'doctors_summary'      => $doctorsSummary,
            ],
            'message' => 'Admin dashboard loaded successfully',
        ]);
    }

    // ─── METHOD 2: getDoctors() ─────────────────────────────────────
    // GET /api/admin/doctors?search=&page=
    public function getDoctors(Request $request)
    {
        $search = $request->input('search', '');

        $doctors = DB::table('users as u')
            ->leftJoin('patients as p', 'p.doctor_id', '=', 'u.id')
            ->where('u.role', 'doctor')
            ->where(function ($q) use ($search) {
                $q->where('u.name', 'like', "%{$search}%")
                  ->orWhere('u.email', 'like', "%{$search}%");
            })
            ->groupBy('u.id', 'u.name', 'u.email', 'u.phone', 'u.created_at')
            ->orderBy('u.name')
            ->select(
                'u.id', 'u.name', 'u.email', 'u.phone', 'u.created_at',
                DB::raw('COUNT(p.id) as total_patients'),
                DB::raw("SUM(CASE WHEN p.status = 'active' THEN 1 ELSE 0 END) as active_patients")
            )
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data'    => $doctors,
            'message' => 'Doctors retrieved successfully',
        ]);
    }

    // ─── METHOD 3: createDoctor() ───────────────────────────────────
    // POST /api/admin/doctors
    public function createDoctor(Request $request)
    {
        $validated = $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|unique:users,email',
            'password'              => 'required|string|min:8|confirmed',
            'phone'                 => 'nullable|string|max:20',
        ]);

        $doctor = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone'    => $validated['phone'] ?? null,
            'role'     => 'doctor',
        ]);

        return response()->json([
            'success' => true,
            'data'    => $doctor->makeHidden(['password', 'remember_token']),
            'message' => 'Doctor created successfully',
        ], 201);
    }

    // ─── METHOD 4: deleteDoctor() ───────────────────────────────────
    // DELETE /api/admin/doctors/{id}
    public function deleteDoctor(Request $request, $id)
    {
        $doctor = User::where('id', $id)->where('role', 'doctor')->first();

        if (!$doctor) {
            return $this->errorResponse('Doctor not found.', 404);
        }

        $activePatients = Patient::where('doctor_id', $id)->where('status', 'active')->count();
        if ($activePatients > 0) {
            return $this->errorResponse(
                'Cannot delete doctor with active patients. Reassign their patients first.',
                422
            );
        }

        // Unassign any remaining (inactive) patients
        Patient::where('doctor_id', $id)->update([
            'doctor_id'   => null,
            'assigned_at' => null,
            'assigned_by' => null,
        ]);

        $doctor->delete();

        return response()->json([
            'success' => true,
            'data'    => null,
            'message' => 'Doctor deleted successfully',
        ]);
    }

    // ─── METHOD 5: getPatients() ────────────────────────────────────
    // GET /api/admin/patients?search=&status=all|assigned|unassigned&page=
    public function getPatients(Request $request)
    {
        $search       = $request->input('search', '');
        $statusFilter = $request->input('status', 'all');

        $query = DB::table('users as u')
            ->join('patients as p', 'p.user_id', '=', 'u.id')
            ->leftJoin('users as d', 'd.id', '=', 'p.doctor_id')
            ->leftJoin(DB::raw(
                '(SELECT patient_id, MAX(logged_at) as last_log_date FROM progress_logs GROUP BY patient_id) as pl'
            ), 'pl.patient_id', '=', 'p.user_id')
            ->where('u.role', 'patient')
            ->where(function ($q) use ($search) {
                $q->where('u.name', 'like', "%{$search}%")
                  ->orWhere('u.email', 'like', "%{$search}%");
            });

        if ($statusFilter === 'unassigned') {
            $query->whereNull('p.doctor_id');
        } elseif ($statusFilter === 'assigned') {
            $query->whereNotNull('p.doctor_id');
        }

        $patients = $query
            ->orderByRaw('p.doctor_id IS NULL DESC')
            ->orderBy('u.name')
            ->select(
                'u.id', 'u.name', 'u.email',
                'p.id as patient_record_id',
                'p.injury_type', 'p.status',
                'p.doctor_id', 'p.assigned_at',
                'p.streak_count', 'p.current_pain_level',
                'p.user_id',
                'd.name as doctor_name', 'd.email as doctor_email',
                'pl.last_log_date'
            )
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data'    => $patients,
            'message' => 'Patients retrieved successfully',
        ]);
    }

    // ─── METHOD 6: getUnassignedPatients() ─────────────────────────
    // GET /api/admin/patients/unassigned
    public function getUnassignedPatients()
    {
        $patients = DB::table('users as u')
            ->join('patients as p', 'p.user_id', '=', 'u.id')
            ->whereNull('p.doctor_id')
            ->where('u.role', 'patient')
            ->select('u.id', 'u.name', 'u.email', 'p.injury_type', 'u.created_at')
            ->orderBy('u.name')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $patients,
            'message' => 'Unassigned patients retrieved successfully',
        ]);
    }

    // ─── METHOD 7: getDoctorPatients() ─────────────────────────────
    // GET /api/admin/doctors/{doctorId}/patients
    public function getDoctorPatients($doctorId)
    {
        $doctor = User::where('id', $doctorId)->where('role', 'doctor')->first();
        if (!$doctor) {
            return $this->errorResponse('Doctor not found.', 404);
        }

        $patients = DB::table('users as u')
            ->join('patients as p', 'p.user_id', '=', 'u.id')
            ->leftJoin(DB::raw(
                '(SELECT patient_id, MAX(logged_at) as last_log_date FROM progress_logs GROUP BY patient_id) as pl'
            ), 'pl.patient_id', '=', 'p.user_id')
            ->where('p.doctor_id', $doctorId)
            ->select(
                'u.id', 'u.name', 'u.email',
                'p.injury_type', 'p.status',
                'p.assigned_at', 'p.streak_count', 'p.current_pain_level',
                'pl.last_log_date'
            )
            ->orderBy('u.name')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $patients,
            'message' => "Doctor's patients retrieved successfully",
        ]);
    }

    // ─── METHOD 8: assignPatient() ──────────────────────────────────
    // POST /api/admin/assign
    public function assignPatient(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:users,id',
            'doctor_id'  => 'required|exists:users,id',
        ]);

        $patientUser = User::where('id', $request->patient_id)->where('role', 'patient')->first();
        if (!$patientUser) {
            return $this->errorResponse('User is not a patient.', 422);
        }

        $doctor = User::where('id', $request->doctor_id)->where('role', 'doctor')->first();
        if (!$doctor) {
            return $this->errorResponse('User is not a doctor.', 422);
        }

        $patient = Patient::where('user_id', $request->patient_id)->firstOrFail();

        if ($patient->doctor_id) {
            return $this->errorResponse(
                'Patient is already assigned. Use the reassign endpoint instead.',
                422
            );
        }

        DB::transaction(function () use ($patient, $doctor, $request) {
            $patient->update([
                'doctor_id'   => $doctor->id,
                'assigned_at' => now(),
                'assigned_by' => $request->user()->id,
            ]);

            DoctorPatientHistory::create([
                'patient_id'  => $patient->user_id,
                'doctor_id'   => $doctor->id,
                'assigned_by' => $request->user()->id,
                'assigned_at' => now(),
            ]);
        });

        $patient->refresh();
        $patient->load('user:id,name,email');

        return response()->json([
            'success' => true,
            'data'    => [
                'patient'     => $patient,
                'doctor_name' => $doctor->name,
            ],
            'message' => 'Patient assigned to doctor successfully',
        ]);
    }

    // ─── METHOD 9: unassignPatient() ────────────────────────────────
    // POST /api/admin/unassign
    public function unassignPatient(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:users,id',
            'reason'     => 'nullable|string|max:500',
        ]);

        $patient = Patient::where('user_id', $request->patient_id)->firstOrFail();

        if (!$patient->doctor_id) {
            return $this->errorResponse('Patient is not currently assigned to a doctor.', 422);
        }

        $oldDoctorId = $patient->doctor_id;

        DB::transaction(function () use ($patient, $oldDoctorId, $request) {
            DoctorPatientHistory::where('patient_id', $patient->user_id)
                ->where('doctor_id', $oldDoctorId)
                ->whereNull('unassigned_at')
                ->update([
                    'unassigned_at' => now(),
                    'reason'        => $request->reason ?? 'Unassigned by admin',
                ]);

            $patient->update([
                'doctor_id'   => null,
                'assigned_at' => null,
                'assigned_by' => null,
            ]);
        });

        $patient->refresh();

        return response()->json([
            'success' => true,
            'data'    => $patient,
            'message' => 'Patient unassigned successfully',
        ]);
    }

    // ─── METHOD 10: reassignPatient() ───────────────────────────────
    // POST /api/admin/reassign
    public function reassignPatient(Request $request)
    {
        $request->validate([
            'patient_id'    => 'required|exists:users,id',
            'new_doctor_id' => 'required|exists:users,id',
            'reason'        => 'nullable|string|max:500',
        ]);

        $patient = Patient::where('user_id', $request->patient_id)->firstOrFail();

        if (!$patient->doctor_id) {
            return $this->errorResponse(
                'Patient has no current doctor. Use the assign endpoint instead.',
                422
            );
        }

        $newDoctor = User::where('id', $request->new_doctor_id)->where('role', 'doctor')->first();
        if (!$newDoctor) {
            return $this->errorResponse('New doctor not found or is not a doctor.', 422);
        }

        if ($patient->doctor_id == $newDoctor->id) {
            return $this->errorResponse('Patient is already assigned to this doctor.', 422);
        }

        $oldDoctor = User::find($patient->doctor_id);

        DB::transaction(function () use ($patient, $newDoctor, $request) {
            // Close old history record
            DoctorPatientHistory::where('patient_id', $patient->user_id)
                ->whereNull('unassigned_at')
                ->update([
                    'unassigned_at' => now(),
                    'reason'        => $request->reason ?? 'Reassigned by admin',
                ]);

            // Open new history record
            DoctorPatientHistory::create([
                'patient_id'  => $patient->user_id,
                'doctor_id'   => $newDoctor->id,
                'assigned_by' => $request->user()->id,
                'assigned_at' => now(),
            ]);

            // Update patient
            $patient->update([
                'doctor_id'   => $newDoctor->id,
                'assigned_at' => now(),
                'assigned_by' => $request->user()->id,
            ]);
        });

        $patient->refresh()->load('user:id,name,email');

        return response()->json([
            'success' => true,
            'data'    => [
                'patient'         => $patient,
                'old_doctor_name' => $oldDoctor?->name,
                'new_doctor_name' => $newDoctor->name,
            ],
            'message' => 'Patient reassigned successfully',
        ]);
    }

    // ─── METHOD 11: getHistory() ────────────────────────────────────
    // GET /api/admin/history?patient_id=&doctor_id=&page=
    public function getHistory(Request $request)
    {
        $query = DB::table('doctor_patient_history as dph')
            ->join('users as p', 'dph.patient_id', '=', 'p.id')
            ->join('users as d', 'dph.doctor_id', '=', 'd.id')
            ->join('users as a', 'dph.assigned_by', '=', 'a.id')
            ->select(
                'dph.id', 'dph.assigned_at', 'dph.unassigned_at', 'dph.reason', 'dph.created_at',
                'p.name as patient_name',
                'd.name as doctor_name',
                'a.name as assigned_by_name'
            )
            ->orderBy('dph.assigned_at', 'desc');

        if ($request->filled('patient_id')) {
            $query->where('dph.patient_id', $request->patient_id);
        }
        if ($request->filled('doctor_id')) {
            $query->where('dph.doctor_id', $request->doctor_id);
        }

        $history = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $history,
            'message' => 'Assignment history retrieved successfully',
        ]);
    }
}
