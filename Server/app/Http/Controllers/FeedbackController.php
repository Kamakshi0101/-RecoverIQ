<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Feedback;
use App\Services\FeedbackService;

class FeedbackController extends Controller
{
    protected $feedbackService;

    public function __construct(FeedbackService $feedbackService)
    {
        $this->feedbackService = $feedbackService;
    }

    // GET /api/patient/feedback
    public function index(Request $request)
    {
        $patientId = $request->user()->id;

        // Generate / refresh smart feedback then return all unread
        $feedback = $this->feedbackService->generateFeedback($patientId);

        return response()->json([
            'success' => true,
            'data'    => $feedback,
            'message' => 'Feedback retrieved successfully',
        ]);
    }

    // PATCH /api/patient/feedback/{id}/read  (mark as read)
    public function markRead(Request $request, $id)
    {
        $item = Feedback::where('id', $id)
            ->where('patient_id', $request->user()->id)
            ->first();

        if (!$item) {
            return response()->json(['success' => false, 'message' => 'Not found.'], 404);
        }

        $item->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'data'    => null,
            'message' => 'Feedback marked as read.',
        ]);
    }
}
