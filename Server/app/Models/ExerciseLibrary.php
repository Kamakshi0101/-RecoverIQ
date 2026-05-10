<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExerciseLibrary extends Model
{
    use HasFactory;

    protected $table = 'exercise_library';

    protected $fillable = [
        'name',
        'description',
        'category',
        'default_sets',
        'default_reps',
        'default_duration_minutes',
    ];
}
