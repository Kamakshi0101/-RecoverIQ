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
        // 1. Update users.role ENUM
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('patient', 'doctor', 'admin') DEFAULT 'patient'");

        // 2. Add columns to patients table
        Schema::table('patients', function (Blueprint $table) {
            $table->timestamp('assigned_at')->nullable();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
        });

        // 3. Create doctor_patient_history table
        Schema::create('doctor_patient_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('doctor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('assigned_at');
            $table->timestamp('unassigned_at')->nullable();
            $table->string('reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctor_patient_history');

        Schema::table('patients', function (Blueprint $table) {
            $table->dropForeign(['assigned_by']);
            $table->dropColumn(['assigned_at', 'assigned_by']);
        });

        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('patient', 'doctor') DEFAULT 'patient'");
    }
};
