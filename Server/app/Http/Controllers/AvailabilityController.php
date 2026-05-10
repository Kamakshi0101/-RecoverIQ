<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AvailableSlot;
use Carbon\Carbon;

class AvailabilityController extends Controller
{
    /**
     * Get all available slots for the authenticated doctor
     */
    public function index(Request $request)
    {
        $slots = AvailableSlot::where('doctor_id', $request->user()->id)
            ->orderBy('slot_date')
            ->orderBy('slot_time')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $slots
        ]);
    }

    /**
     * Generate recurring availability for a date range
     */
    public function generate(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'schedule' => 'required|array', // e.g. ['Monday' => ['09:00', '10:00'], ...]
            'duration_minutes' => 'required|integer|min:15',
        ]);

        $doctor_id = $request->user()->id;
        $start = Carbon::parse($request->start_date);
        $end = Carbon::parse($request->end_date);
        $schedule = $request->schedule;
        $duration = $request->duration_minutes;

        $createdSlots = [];

        // Loop through each day in the range
        for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
            $dayName = $date->format('l'); // 'Monday', 'Tuesday', etc.

            if (isset($schedule[$dayName])) {
                foreach ($schedule[$dayName] as $time) {
                    // Check if slot already exists
                    $exists = AvailableSlot::where('doctor_id', $doctor_id)
                        ->where('slot_date', $date->format('Y-m-d'))
                        ->where('slot_time', $time . ':00')
                        ->exists();

                    if (!$exists) {
                        $createdSlots[] = AvailableSlot::create([
                            'doctor_id' => $doctor_id,
                            'slot_date' => $date->format('Y-m-d'),
                            'slot_time' => $time . ':00',
                            'duration_minutes' => $duration,
                            'is_booked' => false,
                        ]);
                    }
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => count($createdSlots) . ' slots generated successfully.',
            'data' => $createdSlots
        ], 201);
    }

    /**
     * Block out specific dates (delete available slots that aren't booked yet)
     */
    public function block(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $doctor_id = $request->user()->id;
        
        $deleted = AvailableSlot::where('doctor_id', $doctor_id)
            ->whereBetween('slot_date', [$request->start_date, $request->end_date])
            ->where('is_booked', false)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => "Blocked dates successfully. $deleted empty slots removed."
        ]);
    }

    /**
     * Bulk-create slots from an array — POST /api/doctor/availability
     */
    public function setAvailability(Request $request)
    {
        $request->validate([
            'slots'                     => 'required|array|min:1',
            'slots.*.slot_date'         => 'required|date|after:today',
            'slots.*.slot_time'         => 'required|date_format:H:i',
            'slots.*.duration_minutes'  => 'nullable|integer|min:15|max:180',
        ]);

        $doctorId = $request->user()->id;
        $created  = 0;

        foreach ($request->slots as $slot) {
            $time = $slot['slot_time'] . ':00';

            $exists = AvailableSlot::where('doctor_id', $doctorId)
                ->where('slot_date', $slot['slot_date'])
                ->where('slot_time', $time)
                ->exists();

            if (!$exists) {
                AvailableSlot::create([
                    'doctor_id'        => $doctorId,
                    'slot_date'        => $slot['slot_date'],
                    'slot_time'        => $time,
                    'duration_minutes' => $slot['duration_minutes'] ?? 60,
                    'is_booked'        => false,
                ]);
                $created++;
            }
        }

        return response()->json([
            'success' => true,
            'data'    => ['slots_created' => $created],
            'message' => "{$created} slot(s) created successfully.",
        ], 201);
    }

    /**
     * Delete a specific unbooked slot — DELETE /api/doctor/availability/{id}
     */
    public function destroy(Request $request, $id)
    {
        $slot = AvailableSlot::where('id', $id)
            ->where('doctor_id', $request->user()->id)
            ->first();

        if (!$slot) {
            return response()->json(['success' => false, 'message' => 'Slot not found.'], 404);
        }

        if ($slot->is_booked) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete a booked slot. Cancel the appointment first.',
            ], 422);
        }

        $slot->delete();

        return response()->json([
            'success' => true,
            'data'    => null,
            'message' => 'Slot removed.',
        ]);
    }
}
