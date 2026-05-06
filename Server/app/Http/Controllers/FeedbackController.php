<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\FeedbackService;

class FeedbackController extends Controller
{
    protected $feedbackService;

    public function __construct(FeedbackService $feedbackService)
    {
        $this->feedbackService = $feedbackService;
    }

    public function index(Request $request)
    {
        $feedback = $this->feedbackService->generateFeedback($request->user()->id);
        
        return response()->json([
            'success' => true,
            'data' => $feedback,
            'message' => 'Smart feedback generated successfully'
        ]);
    }
}
