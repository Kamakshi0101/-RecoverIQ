<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Milestone;
use App\Models\MilestoneBadge;
use App\Models\Patient;
use App\Services\BadgeService;
use Carbon\Carbon;

class MilestoneController extends Controller
{
    protected $badgeService;

    public function __construct(BadgeService $badgeService)
    {
        $this->badgeService = $badgeService;
    }

    // GET /api/patient/milestones
    public function patientMilestones(Request $request)
    {
        $patientId = $request->user()->id;

        $milestones = Milestone::where('patient_id', $patientId)
            ->with(['assignedBy:id,name', 'badge'])
            ->orderByRaw("FIELD(status, 'in_progress', 'upcoming', 'completed', 'missed')")
            ->orderBy('target_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $milestones,
            'message' => 'Milestones retrieved successfully',
        ]);
    }

    // PATCH /api/patient/milestones/{id}/complete
    public function complete(Request $request, $id)
    {
        $patientId = $request->user()->id;

        $milestone = Milestone::where('id', $id)->first();

        if (!$milestone) {
            return response()->json(['success' => false, 'message' => 'Milestone not found.'], 404);
        }

        // Security: ensure milestone belongs to authenticated patient
        if ((int)$milestone->patient_id !== (int)$patientId) {
            return response()->json(['success' => false, 'message' => 'Access denied.'], 403);
        }

        // Idempotency: already completed
        if ($milestone->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'This milestone has already been completed.',
            ], 422);
        }

        $milestone->update([
            'status'       => 'completed',
            'completed_at' => now(),
            'sub_progress' => 100,
        ]);

        $badge = $this->badgeService->unlock($patientId, $milestone->id);

        $milestone->refresh()->load('badge');

        return response()->json([
            'success' => true,
            'data'    => array_merge($milestone->toArray(), ['newly_unlocked_badge' => $badge]),
            'message' => 'Milestone completed! Well done!',
        ]);
    }

    // PATCH /api/doctor/milestones/{id}/progress
    public function updateProgress(Request $request, $id)
    {
        $request->validate([
            'sub_progress'    => 'required|integer|min:0|max:100',
            'therapist_notes' => 'nullable|string',
        ]);

        $milestone = Milestone::findOrFail($id);

        // Security: verify doctor is assigned to this patient
        $patient = Patient::where('user_id', $milestone->patient_id)->first();
        if (!$patient || (int)$patient->doctor_id !== (int)$request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. This patient is not assigned to you.',
            ], 403);
        }

        $milestone->sub_progress = $request->sub_progress;
        if ($request->filled('therapist_notes')) {
            $milestone->therapist_notes = $request->therapist_notes;
        }

        // Auto-update status
        if ($milestone->sub_progress > 0 && $milestone->sub_progress < 100 && $milestone->status === 'upcoming') {
            $milestone->status = 'in_progress';
        }

        $milestone->save();

        return response()->json([
            'success' => true,
            'data'    => $milestone,
            'message' => 'Milestone progress updated',
        ]);
    }

    // GET /api/patient/badges
    public function getBadges(Request $request)
    {
        $badges = MilestoneBadge::where('patient_id', $request->user()->id)
            ->with('milestone:id,title,category')
            ->orderBy('unlocked_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $badges,
            'message' => 'Badges retrieved',
        ]);
    }

    // GET /api/doctor/patients/{id}/milestones
    public function forPatient($id)
    {
        $milestones = Milestone::where('patient_id', $id)
            ->with('badge')
            ->orderByRaw("FIELD(status, 'in_progress', 'upcoming', 'completed', 'missed')")
            ->orderBy('target_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $milestones,
            'message' => 'Patient milestones retrieved successfully',
        ]);
    }

    // POST /api/doctor/patients/{id}/milestones
    public function store(Request $request, $id)
    {
        $request->validate([
            'title'           => 'required|string',
            'description'     => 'nullable|string',
            'category'        => 'required|in:mobility,strength,daily_task,pain,endurance',
            'target_date'     => 'required|date',
            'therapist_notes' => 'nullable|string',
        ]);

        $milestone = Milestone::create([
            'patient_id'      => $id,
            'assigned_by'     => $request->user()->id,
            'title'           => $request->title,
            'description'     => $request->description,
            'therapist_notes' => $request->therapist_notes,
            'category'        => $request->category,
            'target_date'     => $request->target_date,
            'status'          => 'upcoming',
            'sub_progress'    => 0,
        ]);

        return response()->json([
            'success' => true,
            'data'    => $milestone,
            'message' => 'Milestone assigned successfully',
        ], 201);
    }

    // PUT /api/doctor/milestones/{id}
    public function update(Request $request, $id)
    {
        $milestone = Milestone::findOrFail($id);
        $milestone->update($request->only([
            'title', 'description', 'therapist_notes', 'category',
            'target_date', 'status', 'sub_progress',
        ]));

        if ($request->status === 'completed' && !$milestone->completed_at) {
            $milestone->completed_at = Carbon::now();
            $milestone->save();
        }

        return response()->json([
            'success' => true,
            'data'    => $milestone,
            'message' => 'Milestone updated successfully',
        ]);
    }
}
