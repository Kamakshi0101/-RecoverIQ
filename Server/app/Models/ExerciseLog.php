<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExerciseLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'exercise_id',
        'patient_id',
        'actual_reps',
        'actual_duration_minutes',
        'difficulty_rating',
        'notes',
        'logged_at',
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
