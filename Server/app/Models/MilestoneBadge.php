<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MilestoneBadge extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'milestone_id',
        'badge_name',
        'badge_icon',
        'badge_color',
        'unlocked_at',
    ];

    protected $casts = [
        'unlocked_at' => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function milestone()
    {
        return $this->belongsTo(Milestone::class);
    }
}
