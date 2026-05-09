<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Milestone;
use Carbon\Carbon;

class MilestoneController extends Controller
{
    public function patientMilestones(Request $request)
    {
        $milestones = Milestone::where('patient_id', $request->user()->id)
            ->orderBy('target_date', 'asc')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $milestones,
            'message' => 'Milestones retrieved successfully'
        ]);
    }

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
            'category' => 'required|in:mobility,strength,daily_task',
            'target_date' => 'required|date',
        ]);

        $milestone = Milestone::create([
            'patient_id' => $id,
            'assigned_by' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category,
            'target_date' => $request->target_date,
            'status' => 'pending',
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
