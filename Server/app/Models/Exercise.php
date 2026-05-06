<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exercise extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'assigned_by',
        'name',
        'description',
        'category',
        'target_reps',
        'target_duration_minutes',
        'frequency_per_week',
        'status',
    ];

    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function logs()
    {
        return $this->hasMany(ExerciseLog::class);
    }
}
