<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'title',
        'scheduled_at',
        'duration_minutes',
        'status',
        'location',
        'session_notes',
        'notes_visible_at',
        'cancel_reason',
        'cancelled_by',
        'cancelled_at',
        'reminder_24h_sent',
        'reminder_2h_sent',
        'reminder_30m_sent',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'notes_visible_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'reminder_24h_sent' => 'boolean',
        'reminder_2h_sent' => 'boolean',
        'reminder_30m_sent' => 'boolean',
    ];

    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function cancelledBy()
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }
}
