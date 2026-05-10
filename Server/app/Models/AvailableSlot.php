<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AvailableSlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id',
        'slot_date',
        'slot_time',
        'duration_minutes',
        'is_booked',
    ];

    protected $casts = [
        'slot_date' => 'date',
        'is_booked' => 'boolean',
    ];

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }
}
