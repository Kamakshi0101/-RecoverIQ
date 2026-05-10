<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExerciseLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'exercise_id',
        'exercise_name',
        'sets_prescribed',
        'reps_prescribed',
        'sets_completed',
        'reps_completed',
        'duration_seconds',
        'pain_level',
        'rpe_level',
        'mood',
        'notes',
        'is_incomplete',
        'logged_at',
    ];

    protected $casts = [
        'logged_at' => 'datetime',
        'is_incomplete' => 'boolean',
    ];

    public function exercise()
    {
        return $this->belongsTo(Exercise::class);
    }

    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }
}
