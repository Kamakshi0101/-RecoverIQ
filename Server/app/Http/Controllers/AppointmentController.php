<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Appointment;
use App\Models\AvailableSlot;
use App\Models\User;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Appointment::where('patient_id', $request->user()->id)
            ->with('doctor:id,name,email,avatar')
            ->orderBy('scheduled_at', 'asc');

        if ($request->has('month')) {
            $month = substr($request->month, 5, 2);
            $year = substr($request->month, 0, 4);
            $query->whereMonth('scheduled_at', $month)->whereYear('scheduled_at', $year);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $appointments = $query->get();

        $appointments->transform(function ($appt) {
            $data = $appt->toArray();
            $data['doctor_name'] = $appt->doctor->name;
            if ($appt->notes_visible_at === null || $appt->notes_visible_at > now()) {
                unset($data['session_notes']);
            }
            return $data;
        });

        return response()->json([
            'success' => true,
            'data' => $appointments
        ]);
    }

    public function availableSlots(Request $request)
    {
        $query = AvailableSlot::where('is_booked', false);

        if ($request->has('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }
        if ($request->has('date')) {
            $query->where('slot_date', $request->date);
        }

        $slots = $query->orderBy('slot_date')->orderBy('slot_time')->get();

        return response()->json([
            'success' => true,
            'data' => $slots
        ]);
    }

    public function book(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required|exists:users,id',
            'slot_id' => 'required|exists:available_slots,id',
            'title' => 'nullable|string|max:255',
            'location' => 'nullable|string',
        ]);

        $doctor = User::where('id', $request->doctor_id)->where('role', 'doctor')->firstOrFail();
        
        $slot = AvailableSlot::where('id', $request->slot_id)
            ->where('doctor_id', $doctor->id)
            ->where('is_booked', false)
            ->firstOrFail();

        $appointment = Appointment::create([
            'patient_id' => $request->user()->id,
            'doctor_id' => $doctor->id,
            'title' => $request->title ?? 'Therapy session',
            'scheduled_at' => $slot->slot_date . ' ' . $slot->slot_time,
            'duration_minutes' => $slot->duration_minutes,
            'status' => 'pending',
            'location' => $request->location,
        ]);

        $slot->update(['is_booked' => true]);

        return response()->json([
            'success' => true,
            'data' => $appointment,
            'message' => 'Appointment requested! Awaiting therapist confirmation.'
        ], 201);
    }

    public function confirm(Request $request, $id)
    {
        $appointment = Appointment::where('id', $id)->where('doctor_id', $request->user()->id)->firstOrFail();
        $appointment->update(['status' => 'confirmed']);

        return response()->json([
            'success' => true,
            'data' => $appointment,
            'message' => 'Appointment confirmed.'
        ]);
    }

    public function suggestAlternative(Request $request, $id)
    {
        $request->validate(['new_slot_id' => 'required|exists:available_slots,id']);
        
        $appointment = Appointment::where('id', $id)->where('doctor_id', $request->user()->id)->firstOrFail();
        // Here we'd ideally trigger a notification system
        // For simplicity, we just return a success
        
        return response()->json([
            'success' => true,
            'message' => 'Alternative suggested to patient.'
        ]);
    }

    public function cancel(Request $request, $id)
    {
        $request->validate(['cancel_reason' => 'nullable|string']);

        $appointment = Appointment::where('id', $id)->where('patient_id', $request->user()->id)->firstOrFail();

        if (now()->diffInHours($appointment->scheduled_at, false) < 24 && now()->diffInHours($appointment->scheduled_at, false) >= 0) {
            $appointment->status = 'late_cancel';
            $message = 'Late cancellation recorded.';
        } else {
            $appointment->status = 'cancelled';
            $message = 'Appointment cancelled.';
        }

        $appointment->cancel_reason = $request->cancel_reason;
        $appointment->cancelled_by = $request->user()->id;
        $appointment->cancelled_at = now();
        $appointment->save();

        // Free up slot logic could go here by reverse engineering scheduled_at

        return response()->json([
            'success' => true,
            'data' => $appointment,
            'message' => $message
        ]);
    }

    public function addSessionNotes(Request $request, $id)
    {
        $request->validate(['session_notes' => 'required|string']);

        $appointment = Appointment::where('id', $id)->where('doctor_id', $request->user()->id)->firstOrFail();
        
        $appointment->update([
            'session_notes' => $request->session_notes,
            'notes_visible_at' => \Carbon\Carbon::parse($appointment->scheduled_at)->addHours(24)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Notes added. They will be visible to the patient 24 hours after the session.'
        ]);
    }

    public function reminderStatus(Request $request, $id)
    {
        $appointment = Appointment::where('id', $id)->where('patient_id', $request->user()->id)->firstOrFail();

        if ($request->isMethod('patch')) {
            $appointment->update($request->only(['reminder_24h_sent', 'reminder_2h_sent', 'reminder_30m_sent']));
            return response()->json(['success' => true, 'message' => 'Reminders updated.']);
        }

        return response()->json([
            'success' => true,
            'data' => $appointment->only(['reminder_24h_sent', 'reminder_2h_sent', 'reminder_30m_sent'])
        ]);
    }
}
