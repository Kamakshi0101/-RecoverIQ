<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Milestone;
use App\Models\MilestoneBadge;
use App\Services\BadgeService;
use Carbon\Carbon;

class MilestoneController extends Controller
{
    protected $badgeService;

    public function __construct(BadgeService $badgeService)
    {
        $this->badgeService = $badgeService;
    }

    public function patientMilestones(Request $request)
    {
        $milestones = Milestone::where('patient_id', $request->user()->id)
            ->orderByRaw("FIELD(status, 'in_progress', 'upcoming', 'completed', 'missed')")
            ->orderBy('target_date', 'asc')
            ->get();
            
        // Append badge if completed
        $milestones->transform(function ($milestone) use ($request) {
            $data = $milestone->toArray();
            if ($milestone->status === 'completed') {
                $badge = MilestoneBadge::where('milestone_id', $milestone->id)
                    ->where('patient_id', $request->user()->id)
                    ->first();
                $data['badge'] = $badge;
            }
            return $data;
        });

        return response()->json([
            'success' => true,
            'data' => $milestones,
            'message' => 'Milestones retrieved successfully'
        ]);
    }

    public function complete(Request $request, $id)
    {
        $milestone = Milestone::where('id', $id)
            ->where('patient_id', $request->user()->id)
            ->firstOrFail();

        $milestone->update([
            'status' => 'completed',
            'completed_at' => now()
        ]);

        $badge = $this->badgeService->unlock($request->user()->id, $milestone->id);

        $data = $milestone->toArray();
        $data['newly_unlocked_badge'] = $badge;

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Milestone completed!'
        ]);
    }

    public function updateProgress(Request $request, $id)
    {
        $request->validate([
            'sub_progress' => 'required|integer|min:0|max:100',
            'therapist_notes' => 'nullable|string'
        ]);

        $milestone = Milestone::findOrFail($id);
        
        $milestone->sub_progress = $request->sub_progress;
        if ($request->has('therapist_notes')) {
            $milestone->therapist_notes = $request->therapist_notes;
        }
        
        // Auto-update status if progress is > 0 but not 100
        if ($milestone->sub_progress > 0 && $milestone->sub_progress < 100 && $milestone->status === 'upcoming') {
            $milestone->status = 'in_progress';
        }

        $milestone->save();

        return response()->json([
            'success' => true,
            'data' => $milestone,
            'message' => 'Milestone progress updated'
        ]);
    }

    public function getBadges(Request $request)
    {
        $badges = MilestoneBadge::where('patient_id', $request->user()->id)
            ->orderBy('unlocked_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $badges,
            'message' => 'Badges retrieved'
        ]);
    }

    // Keep existing endpoints
    public function forPatient($id)
    {
        $milestones = Milestone::where('patient_id', $id)
            ->orderBy('target_date', 'asc')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $milestones,
            'message' => 'Patient milestones retrieved successfully'
        ]);
    }

    public function store(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'category' => 'required|in:mobility,strength,daily_task,pain,endurance',
            'target_date' => 'required|date',
            'therapist_notes' => 'nullable|string'
        ]);

        $milestone = Milestone::create([
            'patient_id' => $id,
            'assigned_by' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'therapist_notes' => $request->therapist_notes,
            'category' => $request->category,
            'target_date' => $request->target_date,
            'status' => 'upcoming',
            'sub_progress' => 0,
        ]);

        return response()->json([
            'success' => true,
            'data' => $milestone,
            'message' => 'Milestone assigned successfully'
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $milestone = Milestone::findOrFail($id);
        $milestone->update($request->all());

        if ($request->status === 'completed' && !$milestone->completed_at) {
            $milestone->completed_at = Carbon::now();
            $milestone->save();
        }

        return response()->json([
            'success' => true,
            'data' => $milestone,
            'message' => 'Milestone updated successfully'
        ]);
    }
}
