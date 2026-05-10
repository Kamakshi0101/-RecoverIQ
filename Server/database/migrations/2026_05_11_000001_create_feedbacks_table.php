<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── feedbacks table (for pain alerts & smart tips) ──────────
        if (!Schema::hasTable('feedbacks')) {
            Schema::create('feedbacks', function (Blueprint $table) {
                $table->id();
                $table->foreignId('patient_id')->constrained('users')->cascadeOnDelete();
                $table->enum('type', ['warning', 'info', 'success']);
                $table->string('message');
                $table->boolean('is_read')->default(false);
                $table->timestamps();
            });
        }

        // ── notes field on feedback (already done above) ─────────────
    }

    public function down(): void
    {
        Schema::dropIfExists('feedbacks');
    }
};
