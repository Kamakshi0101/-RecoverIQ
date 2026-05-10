<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Appointment;
use App\Models\AvailableSlot;
use App\Models\Patient;
use App\Models\ExerciseLog;
use App\Models\ProgressLog;
use App\Models\Milestone;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    // ─── PATIENT ───────────────────────────────────────────────────

    // GET /api/patient/appointments
    public function index(Request $request)
    {
        $query = Appointment::where('patient_id', $request->user()->id)
            ->with('doctor:id,name,email')
            ->orderBy('scheduled_at', 'asc');

        if ($request->filled('month')) {
            [$year, $month] = explode('-', $request->month);
            $query->whereYear('scheduled_at', $year)->whereMonth('scheduled_at', $month);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $appointments = $query->get()->map(function ($appt) {
            $data = $appt->toArray();
            $data['doctor_name']  = $appt->doctor?->name;
            $data['doctor_email'] = $appt->doctor?->email;
            // Hide notes until notes_visible_at has passed
            if (!$appt->notes_visible_at || $appt->notes_visible_at > now()) {
                $data['session_notes'] = null;
            }
            return $data;
        });

        return response()->json([
            'success' => true,
            'data'    => $appointments,
            'message' => 'Appointments retrieved successfully',
        ]);
    }

    // GET /api/patient/appointments/available-slots
    public function availableSlots(Request $request)
    {
        if (!$request->filled('doctor_id') || !$request->filled('date')) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => ['doctor_id' => ['doctor_id and date are required.']],
            ], 422);
        }

        $slots = AvailableSlot::where('doctor_id', $request->doctor_id)
            ->where('slot_date', $request->date)
            ->where('is_booked', false)
            ->orderBy('slot_time')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $slots,
            'message' => 'Available slots retrieved',
        ]);
    }

    // POST /api/patient/appointments
    public function book(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required|exists:users,id',
            'slot_id'   => 'required|exists:available_slots,id',
            'title'     => 'nullable|string|max:255',
            'location'  => 'nullable|string|max:500',
        ]);

        $slot = AvailableSlot::where('id', $request->slot_id)
            ->where('doctor_id', $request->doctor_id)
            ->first();

        if (!$slot || $slot->is_booked) {
            return response()->json([
                'success' => false,
                'message' => 'This slot is no longer available.',
            ], 422);
        }

        $appointment = DB::transaction(function () use ($request, $slot) {
            $appt = Appointment::create([
                'patient_id'      => $request->user()->id,
                'doctor_id'       => $request->doctor_id,
                'title'           => $request->title ?? 'Therapy session',
                'scheduled_at'    => $slot->slot_date . ' ' . $slot->slot_time,
                'duration_minutes' => $slot->duration_minutes,
                'status'          => 'pending',
                'location'        => $request->location,
            ]);
            $slot->update(['is_booked' => true]);
            return $appt;
        });

        $doctor = User::find($request->doctor_id);

        return response()->json([
            'success' => true,
            'data'    => array_merge($appointment->toArray(), [
                'doctor_name'    => $doctor?->name,
                'scheduled_at'   => $appointment->scheduled_at->toDateTimeString(),
            ]),
            'message' => 'Appointment requested! Awaiting therapist confirmation.',
        ], 201);
    }

    // PATCH /api/patient/appointments/{id}/cancel
    public function cancel(Request $request, $id)
    {
        $request->validate(['cancel_reason' => 'nullable|string|max:500']);

        $appointment = Appointment::where('id', $id)
            ->where('patient_id', $request->user()->id)
            ->first();

        if (!$appointment) {
            return response()->json(['success' => false, 'message' => 'Access denied.'], 403);
        }

        if (!in_array($appointment->status, ['pending', 'confirmed'])) {
            return response()->json([
                'success' => false,
                'message' => 'This appointment cannot be cancelled.',
            ], 422);
        }

        $hoursUntil = now()->diffInHours($appointment->scheduled_at, false);

        if ($hoursUntil <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel a past appointment.',
            ], 422);
        }

        $lateCancellation = $hoursUntil < 24;
        $status = $lateCancellation ? 'late_cancel' : 'cancelled';

        $appointment->update([
            'status'        => $status,
            'cancel_reason' => $request->cancel_reason,
            'cancelled_by'  => $request->user()->id,
            'cancelled_at'  => now(),
        ]);

        // Free up the slot
        AvailableSlot::where('doctor_id', $appointment->doctor_id)
            ->where('slot_date', $appointment->scheduled_at->toDateString())
            ->where('slot_time', $appointment->scheduled_at->format('H:i:s'))
            ->update(['is_booked' => false]);

        return response()->json([
            'success' => true,
            'data'    => array_merge($appointment->refresh()->toArray(), [
                'was_late_cancellation' => $lateCancellation,
            ]),
            'message' => $lateCancellation ? 'Late cancellation recorded.' : 'Appointment cancelled.',
        ]);
    }

    // GET|PATCH /api/patient/appointments/{id}/reminders
    public function reminderStatus(Request $request, $id)
    {
        $appointment = Appointment::where('id', $id)
            ->where('patient_id', $request->user()->id)
            ->first();

        if (!$appointment) {
            return response()->json(['success' => false, 'message' => 'Access denied.'], 403);
        }

        if ($request->isMethod('patch')) {
            $request->validate([
                'reminder_24h_sent' => 'boolean',
                'reminder_2h_sent'  => 'boolean',
                'reminder_30m_sent' => 'boolean',
            ]);
            $appointment->update($request->only(['reminder_24h_sent', 'reminder_2h_sent', 'reminder_30m_sent']));
            return response()->json([
                'success' => true,
                'data'    => $appointment->only(['reminder_24h_sent', 'reminder_2h_sent', 'reminder_30m_sent']),
                'message' => 'Reminder settings updated.',
            ]);
        }

        return response()->json([
            'success' => true,
            'data'    => $appointment->only(['reminder_24h_sent', 'reminder_2h_sent', 'reminder_30m_sent']),
            'message' => 'Reminder status retrieved',
        ]);
    }

    // ─── DOCTOR ────────────────────────────────────────────────────

    // GET /api/doctor/appointments
    public function getSchedule(Request $request)
    {
        $doctorId = $request->user()->id;

        $query = Appointment::where('doctor_id', $doctorId)
            ->with('patient:id,name,avatar');

        if ($request->filled('date')) {
            $query->whereDate('scheduled_at', $request->date);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $appointments = $query->orderBy('scheduled_at')->get()->map(function ($appt) {
            $patient = Patient::where('user_id', $appt->patient_id)->first();
            return array_merge($appt->toArray(), [
                'patient_name' => $appt->patient?->name,
                'injury_type'  => $patient?->injury_type,
            ]);
        });

        return response()->json([
            'success' => true,
            'data'    => $appointments,
            'message' => 'Schedule retrieved',
        ]);
    }

    // GET /api/doctor/appointments/pending
    public function getPendingRequests(Request $request)
    {
        $doctorId = $request->user()->id;

        $appointments = Appointment::where('doctor_id', $doctorId)
            ->where('status', 'pending')
            ->with('patient:id,name')
            ->orderBy('scheduled_at')
            ->get()
            ->map(function ($appt) {
                $patient = Patient::where('user_id', $appt->patient_id)->first();
                $latestLog = ProgressLog::where('patient_id', $appt->patient_id)
                    ->orderBy('logged_at', 'desc')
                    ->first();
                return array_merge($appt->toArray(), [
                    'patient_name'      => $appt->patient?->name,
                    'injury_type'       => $patient?->injury_type,
                    'last_pain_level'   => $latestLog?->pain_level,
                ]);
            });

        return response()->json([
            'success' => true,
            'data'    => $appointments,
            'message' => 'Pending requests retrieved',
        ]);
    }

    // PATCH /api/doctor/appointments/{id}/confirm
    public function confirm(Request $request, $id)
    {
        $appointment = Appointment::where('id', $id)->first();

        if (!$appointment || (int)$appointment->doctor_id !== (int)$request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Access denied.'], 403);
        }

        if ($appointment->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending appointments can be confirmed.',
            ], 422);
        }

        $appointment->update(['status' => 'confirmed']);

        return response()->json([
            'success' => true,
            'data'    => $appointment->refresh(),
            'message' => 'Appointment confirmed.',
        ]);
    }

    // PATCH /api/doctor/appointments/{id}/suggest
    public function suggestAlternative(Request $request, $id)
    {
        $request->validate(['new_slot_id' => 'required|exists:available_slots,id']);

        $appointment = Appointment::where('id', $id)->first();

        if (!$appointment || (int)$appointment->doctor_id !== (int)$request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Access denied.'], 403);
        }

        $newSlot = AvailableSlot::find($request->new_slot_id);
        if ($newSlot->is_booked) {
            return response()->json([
                'success' => false,
                'message' => 'Selected slot is already booked.',
            ], 422);
        }

        DB::transaction(function () use ($appointment, $newSlot) {
            // Free old slot
            AvailableSlot::where('doctor_id', $appointment->doctor_id)
                ->where('slot_date', $appointment->scheduled_at->toDateString())
                ->where('slot_time', $appointment->scheduled_at->format('H:i:s'))
                ->update(['is_booked' => false]);

            // Book new slot
            $newSlot->update(['is_booked' => true]);

            // Update appointment
            $appointment->update([
                'scheduled_at' => $newSlot->slot_date . ' ' . $newSlot->slot_time,
                'status'       => 'pending',
            ]);
        });

        return response()->json([
            'success' => true,
            'data'    => array_merge($appointment->refresh()->toArray(), [
                'new_slot' => $newSlot,
            ]),
            'message' => 'Alternative slot suggested to patient.',
        ]);
    }

    // PATCH /api/doctor/appointments/{id}/notes
    public function addSessionNotes(Request $request, $id)
    {
        $request->validate(['session_notes' => 'required|string|min:10']);

        $appointment = Appointment::where('id', $id)->first();

        if (!$appointment || (int)$appointment->doctor_id !== (int)$request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Access denied.'], 403);
        }

        if (!in_array($appointment->status, ['confirmed', 'completed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Session notes can only be added to confirmed or completed appointments.',
            ], 422);
        }

        $appointment->update([
            'session_notes'   => $request->session_notes,
            'notes_visible_at' => Carbon::parse($appointment->scheduled_at)->addHours(24),
        ]);

        return response()->json([
            'success' => true,
            'data'    => $appointment->refresh(),
            'message' => 'Notes saved. They will be visible to the patient 24 hours after the session.',
        ]);
    }

    // GET /api/doctor/appointments/{id}/prep
    public function getSessionPrep(Request $request, $id)
    {
        $appointment = Appointment::where('id', $id)->first();

        if (!$appointment || (int)$appointment->doctor_id !== (int)$request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Access denied.'], 403);
        }

        $patientId = $appointment->patient_id;

        $exerciseLogs = ExerciseLog::where('patient_id', $patientId)
            ->orderBy('logged_at', 'desc')
            ->take(7)
            ->get();

        $progressLogs = ProgressLog::where('patient_id', $patientId)
            ->orderBy('logged_at', 'desc')
            ->take(7)
            ->get();

        $painTrend = $progressLogs->pluck('pain_level');
        $moodTrend = $exerciseLogs->pluck('mood');

        $milestones = Milestone::where('patient_id', $patientId)
            ->whereIn('status', ['in_progress', 'upcoming'])
            ->orderByRaw("FIELD(status, 'in_progress', 'upcoming')")
            ->take(3)
            ->get();

        // Adherence: logs in last 7 days / 7 * 100
        $logsLast7 = ExerciseLog::where('patient_id', $patientId)
            ->where('logged_at', '>=', now()->subDays(7))
            ->count();
        $adherenceScore = (int)round(($logsLast7 / 7) * 100);

        $previousNotes = Appointment::where('patient_id', $patientId)
            ->where('id', '!=', $id)
            ->where('status', 'completed')
            ->whereNotNull('session_notes')
            ->orderBy('scheduled_at', 'desc')
            ->value('session_notes');

        $patient = Patient::where('user_id', $patientId)->first();
        $patientUser = User::find($patientId);

        return response()->json([
            'success' => true,
            'data'    => [
                'patient'                => ['name' => $patientUser?->name, 'streak_count' => $patient?->streak_count],
                'last_7_exercise_logs'   => $exerciseLogs,
                'pain_trend'             => $painTrend,
                'mood_trend'             => $moodTrend,
                'latest_milestones'      => $milestones,
                'adherence_score'        => $adherenceScore,
                'previous_session_notes' => $previousNotes,
            ],
            'message' => 'Session prep data retrieved',
        ]);
    }
}
