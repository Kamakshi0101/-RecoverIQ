<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // --- 1. Exercise Logger Module ---
        
        Schema::create('exercise_library', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('category', ['strength', 'mobility', 'cardio', 'balance', 'other']);
            $table->integer('default_sets')->nullable();
            $table->integer('default_reps')->nullable();
            $table->integer('default_duration_minutes')->nullable();
            $table->timestamps();
        });

        // Alter existing exercise_logs table
        Schema::table('exercise_logs', function (Blueprint $table) {
            $table->dropColumn(['actual_reps', 'actual_duration_minutes', 'difficulty_rating']);
        });

        // We also need to make exercise_id nullable and add new columns
        DB::statement('ALTER TABLE exercise_logs MODIFY exercise_id bigint unsigned NULL');

        Schema::table('exercise_logs', function (Blueprint $table) {
            $table->string('exercise_name');
            $table->integer('sets_prescribed')->nullable();
            $table->integer('reps_prescribed')->nullable();
            $table->integer('sets_completed')->nullable();
            $table->integer('reps_completed')->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->tinyInteger('pain_level'); // 1-10
            $table->tinyInteger('rpe_level');  // 1-10
            $table->enum('mood', ['great', 'good', 'neutral', 'tired', 'struggling']);
            $table->boolean('is_incomplete')->default(false);
            // logged_at already exists
        });

        // --- 2. Milestone Timeline Module ---

        // Alter existing milestones table
        // Existing enums might be hard to change using Schema::table, so we use DB::statement
        DB::statement("ALTER TABLE milestones MODIFY COLUMN category ENUM('mobility', 'strength', 'daily_task', 'pain', 'endurance')");
        DB::statement("ALTER TABLE milestones MODIFY COLUMN status ENUM('upcoming', 'in_progress', 'completed', 'missed') DEFAULT 'upcoming'");

        Schema::table('milestones', function (Blueprint $table) {
            $table->text('therapist_notes')->nullable();
            $table->tinyInteger('sub_progress')->default(0);
            $table->date('target_date')->nullable()->change();
        });

        Schema::create('milestone_badges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('milestone_id')->constrained('milestones')->cascadeOnDelete();
            $table->string('badge_name');
            $table->string('badge_icon');
            $table->string('badge_color');
            $table->timestamp('unlocked_at');
            $table->timestamps();
        });

        // --- 3. Appointment Calendar Module ---

        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('doctor_id')->constrained('users')->cascadeOnDelete();
            $table->string('title')->default('Therapy session');
            $table->dateTime('scheduled_at');
            $table->integer('duration_minutes')->default(60);
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed', 'late_cancel'])->default('pending');
            $table->string('location')->nullable();
            $table->text('session_notes')->nullable();
            $table->timestamp('notes_visible_at')->nullable();
            $table->string('cancel_reason')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('cancelled_at')->nullable();
            $table->boolean('reminder_24h_sent')->default(false);
            $table->boolean('reminder_2h_sent')->default(false);
            $table->boolean('reminder_30m_sent')->default(false);
            $table->timestamps();
        });

        Schema::create('available_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained('users')->cascadeOnDelete();
            $table->date('slot_date');
            $table->time('slot_time');
            $table->integer('duration_minutes')->default(60);
            $table->boolean('is_booked')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('available_slots');
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('milestone_badges');
        Schema::dropIfExists('exercise_library');

        // We won't strictly revert the altered tables since we usually do a fresh migrate in dev
        // but if needed we could reverse the DB::statements and drop columns here.
    }
};
