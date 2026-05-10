<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Patient;
use App\Models\Exercise;
use App\Models\ExerciseLog;
use App\Models\ProgressLog;
use App\Models\Milestone;
use App\Models\DoctorComment;
use App\Models\ExerciseLibrary;
use App\Models\AvailableSlot;
use App\Models\Appointment;
use App\Models\MilestoneBadge;
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
        // 1. Create Exercise Library
        $libraryData = [
            ['name' => 'Squats', 'category' => 'strength', 'sets' => 3, 'reps' => 12],
            ['name' => 'Lunges', 'category' => 'strength', 'sets' => 3, 'reps' => 10],
            ['name' => 'Calf Raises', 'category' => 'strength', 'sets' => 3, 'reps' => 15],
            ['name' => 'Glute Bridges', 'category' => 'strength', 'sets' => 3, 'reps' => 15],
            ['name' => 'Plank', 'category' => 'strength', 'sets' => 3, 'reps' => 1],
            ['name' => 'Push-ups', 'category' => 'strength', 'sets' => 3, 'reps' => 10],
            
            ['name' => 'Ankle Pumps', 'category' => 'mobility', 'sets' => 2, 'reps' => 20],
            ['name' => 'Heel Slides', 'category' => 'mobility', 'sets' => 2, 'reps' => 15],
            ['name' => 'Knee Extensions', 'category' => 'mobility', 'sets' => 2, 'reps' => 15],
            ['name' => 'Shoulder Rolls', 'category' => 'mobility', 'sets' => 2, 'reps' => 15],
            ['name' => 'Neck Stretches', 'category' => 'mobility', 'sets' => 2, 'reps' => 10],
            ['name' => 'Trunk Twists', 'category' => 'mobility', 'sets' => 2, 'reps' => 10],

            ['name' => 'Stationary Bike', 'category' => 'cardio', 'sets' => 1, 'reps' => 1], // duration based usually
            ['name' => 'Brisk Walk', 'category' => 'cardio', 'sets' => 1, 'reps' => 1],
            ['name' => 'Swimming', 'category' => 'cardio', 'sets' => 1, 'reps' => 1],
            ['name' => 'Rowing Machine', 'category' => 'cardio', 'sets' => 1, 'reps' => 1],

            ['name' => 'Single Leg Stand', 'category' => 'balance', 'sets' => 3, 'reps' => 1],
            ['name' => 'Tandem Stance', 'category' => 'balance', 'sets' => 3, 'reps' => 1],
            ['name' => 'Bosu Ball Squats', 'category' => 'balance', 'sets' => 3, 'reps' => 10],
            ['name' => 'Heel-to-Toe Walk', 'category' => 'balance', 'sets' => 3, 'reps' => 10],
        ];

        foreach ($libraryData as $item) {
            ExerciseLibrary::create([
                'name' => $item['name'],
                'category' => $item['category'],
                'default_sets' => $item['sets'],
                'default_reps' => $item['reps'],
                'default_duration_minutes' => 10,
            ]);
        }

        // 2. Create Doctors
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

        $doctors = collect([$doctor1, $doctor2]);

        // 3. Create Admin
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@rehab.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // 4. Create Available Slots for doctors
        foreach ($doctors as $doc) {
            for ($day = 1; $day <= 30; $day++) {
                $date = now()->addDays($day);
                if ($date->isWeekend()) continue;

                $times = ['09:00:00', '10:00:00', '11:00:00', '14:00:00', '15:00:00', '16:00:00'];
                foreach ($times as $time) {
                    AvailableSlot::create([
                        'doctor_id' => $doc->id,
                        'slot_date' => $date->format('Y-m-d'),
                        'slot_time' => $time,
                        'duration_minutes' => 60,
                        'is_booked' => false,
                    ]);
                }
            }
        }

        // 5. Create 5 Patients
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
                'assigned_at' => now()->subMonths(2),
                'assigned_by' => 3, // Admin
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

            $moods = ['great', 'good', 'neutral', 'tired', 'struggling'];

            // 30 days of progress logs and exercise logs
            for ($i = 30; $i >= 0; $i--) {
                $date = Carbon::today()->subDays($i);
                
                // Progress Log
                ProgressLog::create([
                    'patient_id' => $user->id,
                    'pain_level' => max(0, 8 - floor((30 - $i) / 4) + rand(-1, 1)),
                    'mobility_score' => min(100, 30 + floor((30 - $i) * 1.5) + rand(-5, 5)),
                    'energy_level' => rand(5, 9),
                    'notes' => 'Feeling okay today.',
                    'logged_at' => $date
                ]);

                // Exercise Log (80% chance they did it)
                if (rand(1, 100) <= 80) {
                    $incomplete = rand(1, 10) > 8; // 20% chance incomplete
                    ExerciseLog::create([
                        'patient_id' => $user->id,
                        'exercise_id' => $exercise1->id,
                        'exercise_name' => $exercise1->name,
                        'sets_prescribed' => 3,
                        'reps_prescribed' => 15,
                        'sets_completed' => $incomplete ? rand(1, 2) : 3,
                        'reps_completed' => $incomplete ? rand(5, 10) : rand(12, 15),
                        'duration_seconds' => rand(400, 600),
                        'pain_level' => rand(2, 8),
                        'rpe_level' => rand(4, 8),
                        'mood' => $moods[array_rand($moods)],
                        'notes' => rand(1, 10) > 7 ? 'Felt a bit sore.' : null,
                        'is_incomplete' => $incomplete,
                        'logged_at' => $date->copy()->addHours(10)
                    ]);
                }
            }

            // Assign Milestones
            $m1 = Milestone::create([
                'patient_id' => $user->id,
                'assigned_by' => $assignedDoctor->id,
                'title' => 'Walk Without Crutches',
                'description' => 'Able to walk 100 meters without assistance.',
                'therapist_notes' => 'This is critical for your daily independence.',
                'category' => 'mobility',
                'target_date' => Carbon::now()->subDays(5),
                'status' => 'completed',
                'completed_at' => Carbon::now()->subDays(6),
                'sub_progress' => 100,
            ]);

            MilestoneBadge::create([
                'patient_id' => $user->id,
                'milestone_id' => $m1->id,
                'badge_name' => 'First Steps',
                'badge_icon' => 'star',
                'badge_color' => '#3b82f6',
                'unlocked_at' => Carbon::now()->subDays(6),
            ]);

            Milestone::create([
                'patient_id' => $user->id,
                'assigned_by' => $assignedDoctor->id,
                'title' => 'Climb Stairs',
                'description' => 'Climb one flight of stairs without pain.',
                'therapist_notes' => 'Take it one step at a time.',
                'category' => 'strength',
                'target_date' => Carbon::now()->addDays(15),
                'status' => 'in_progress',
                'sub_progress' => 45,
            ]);

            Milestone::create([
                'patient_id' => $user->id,
                'assigned_by' => $assignedDoctor->id,
                'title' => 'Jogging',
                'description' => 'Jog for 5 minutes.',
                'category' => 'endurance',
                'target_date' => Carbon::now()->addDays(30),
                'status' => 'upcoming',
                'sub_progress' => 0,
            ]);

            // Appointments
            // 1 completed
            Appointment::create([
                'patient_id' => $user->id,
                'doctor_id' => $assignedDoctor->id,
                'scheduled_at' => now()->subDays(7)->setHour(10)->setMinute(0),
                'status' => 'completed',
                'session_notes' => 'Patient is progressing well. Decreasing pain.',
                'notes_visible_at' => now()->subDays(6),
            ]);

            // 1 confirmed
            $confSlot = AvailableSlot::where('doctor_id', $assignedDoctor->id)->where('is_booked', false)->first();
            if ($confSlot) {
                $formattedDate = \Carbon\Carbon::parse($confSlot->slot_date)->format('Y-m-d');
                Appointment::create([
                    'patient_id' => $user->id,
                    'doctor_id' => $assignedDoctor->id,
                    'scheduled_at' => $formattedDate . ' ' . $confSlot->slot_time,
                    'status' => 'confirmed',
                ]);
                $confSlot->update(['is_booked' => true]);
            }

            // 1 pending
            $pendSlot = AvailableSlot::where('doctor_id', $assignedDoctor->id)->where('is_booked', false)->first();
            if ($pendSlot) {
                $formattedDate = \Carbon\Carbon::parse($pendSlot->slot_date)->format('Y-m-d');
                Appointment::create([
                    'patient_id' => $user->id,
                    'doctor_id' => $assignedDoctor->id,
                    'scheduled_at' => $formattedDate . ' ' . $pendSlot->slot_time,
                    'status' => 'pending',
                ]);
                $pendSlot->update(['is_booked' => true]);
            }
        }
    }
}
