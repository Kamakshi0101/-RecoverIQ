<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Patient;
use App\Models\Exercise;
use App\Models\ExerciseLog;
use App\Models\ProgressLog;
use App\Models\Milestone;
use App\Models\DoctorComment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Doctors
        $doctor1 = User::create([
            'name' => 'Dr. John Doe',
            'email' => 'john.doctor@rehab.com',
            'password' => Hash::make('password'),
            'role' => 'doctor',
        ]);
        
        $doctor2 = User::create([
            'name' => 'Dr. Jane Smith',
            'email' => 'jane.doctor@rehab.com',
            'password' => Hash::make('password'),
            'role' => 'doctor',
        ]);

        // Create 5 Patients
        $patients = [
            ['name' => 'Sara Patient', 'email' => 'sara.patient@rehab.com'],
            ['name' => 'Mike Johnson', 'email' => 'mike.patient@rehab.com'],
            ['name' => 'Emily Davis', 'email' => 'emily.patient@rehab.com'],
            ['name' => 'Chris Wilson', 'email' => 'chris.patient@rehab.com'],
            ['name' => 'Anna Brown', 'email' => 'anna.patient@rehab.com'],
        ];

        foreach ($patients as $index => $patientData) {
            $user = User::create([
                'name' => $patientData['name'],
                'email' => $patientData['email'],
                'password' => Hash::make('password'),
                'role' => 'patient',
            ]);

            $assignedDoctor = $index % 2 === 0 ? $doctor1 : $doctor2;

            $patient = Patient::create([
                'user_id' => $user->id,
                'doctor_id' => $assignedDoctor->id,
                'injury_type' => 'Knee Surgery',
                'injury_date' => Carbon::now()->subMonths(2),
                'target_recovery_date' => Carbon::now()->addMonths(4),
                'current_pain_level' => rand(2, 6),
                'mobility_score' => rand(40, 80),
                'streak_count' => rand(1, 14),
                'last_log_date' => Carbon::today(),
                'status' => 'active',
            ]);

            // Assign Exercises
            $exercise1 = Exercise::create([
                'patient_id' => $user->id,
                'assigned_by' => $assignedDoctor->id,
                'name' => 'Leg Raises',
                'description' => 'Lift your leg straight up to 45 degrees.',
                'category' => 'strength',
                'target_reps' => 15,
                'target_duration_minutes' => 10,
                'frequency_per_week' => 7,
                'status' => 'active'
            ]);

            // 30 days of progress logs and exercise logs
            for ($i = 30; $i >= 0; $i--) {
                $date = Carbon::today()->subDays($i);
                
                // Progress Log
                ProgressLog::create([
                    'patient_id' => $user->id,
                    'pain_level' => max(0, 8 - floor((30 - $i) / 4) + rand(-1, 1)), // trend downward
                    'mobility_score' => min(100, 30 + floor((30 - $i) * 1.5) + rand(-5, 5)), // trend upward
                    'energy_level' => rand(5, 9),
                    'notes' => 'Feeling okay today.',
                    'logged_at' => $date
                ]);

                // Exercise Log (80% chance they did it)
                if (rand(1, 100) <= 80) {
                    ExerciseLog::create([
                        'exercise_id' => $exercise1->id,
                        'patient_id' => $user->id,
                        'actual_reps' => rand(10, 15),
                        'actual_duration_minutes' => rand(8, 12),
                        'difficulty_rating' => rand(2, 4),
                        'notes' => 'Completed routine.',
                        'logged_at' => $date->copy()->addHours(10)
                    ]);
                }
            }

            // Assign Milestones
            Milestone::create([
                'patient_id' => $user->id,
                'assigned_by' => $assignedDoctor->id,
                'title' => 'Walk Without Crutches',
                'description' => 'Able to walk 100 meters without assistance.',
                'category' => 'mobility',
                'target_date' => Carbon::now()->addDays(15),
                'status' => 'in_progress'
            ]);

            // Doctor Comments
            DoctorComment::create([
                'patient_id' => $user->id,
                'doctor_id' => $assignedDoctor->id,
                'comment' => 'Great progress this week! Keep it up.',
                'type' => 'encouragement'
            ]);
        }
    }
}
