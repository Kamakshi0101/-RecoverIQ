<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgressLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'pain_level',
        'mobility_score',
        'energy_level',
        'notes',
        'logged_at',
    ];

    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }
}
