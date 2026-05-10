<?php

namespace App\Services;

use App\Models\Milestone;
use App\Models\MilestoneBadge;

class BadgeService
{
    public function unlock($patientUserId, $milestoneId)
    {
        $milestone = Milestone::find($milestoneId);
        if (!$milestone) return null;

        // Check if already earned
        $existing = MilestoneBadge::where('patient_id', $patientUserId)
            ->where('milestone_id', $milestoneId)
            ->first();
            
        if ($existing) return $existing;

        $badgeName = 'Achievement';
        $badgeIcon = 'star';
        $badgeColor = '#6366f1'; // indigo

        switch ($milestone->category) {
            case 'mobility':
                $badgeName = 'First Steps';
                $badgeIcon = 'star';
                $badgeColor = '#3b82f6'; // blue
                break;
            case 'strength':
                $badgeName = 'Iron Will';
                $badgeIcon = 'bolt';
                $badgeColor = '#f59e0b'; // amber
                break;
            case 'daily_task':
                $badgeName = 'Back to Life';
                $badgeIcon = 'heart';
                $badgeColor = '#22c55e'; // green
                break;
            case 'pain':
                $badgeName = 'Pain Warrior';
                $badgeIcon = 'shield';
                $badgeColor = '#ef4444'; // red
                break;
            case 'endurance':
                $badgeName = 'Marathon Mind';
                $badgeIcon = 'trophy';
                $badgeColor = '#a855f7'; // purple
                break;
        }

        return MilestoneBadge::create([
            'patient_id' => $patientUserId,
            'milestone_id' => $milestoneId,
            'badge_name' => $badgeName,
            'badge_icon' => $badgeIcon,
            'badge_color' => $badgeColor,
            'unlocked_at' => now(),
        ]);
    }
}
