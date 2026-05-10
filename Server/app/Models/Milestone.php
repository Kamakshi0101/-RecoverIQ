<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Milestone extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'assigned_by',
        'title',
        'description',
        'therapist_notes',
        'sub_progress',
        'category',
        'target_date',
        'completed_at',
        'status',
    ];

    protected $casts = [
        'target_date'   => 'date',
        'completed_at'  => 'datetime',
        'sub_progress'  => 'integer',
    ];

    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function badge()
    {
        return $this->hasOne(MilestoneBadge::class);
    }
}
