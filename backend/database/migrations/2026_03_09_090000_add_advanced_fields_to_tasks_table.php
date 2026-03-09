<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium')->after('status');
            $table->json('labels')->nullable()->after('priority');
            $table->json('subtasks')->nullable()->after('labels');
            $table->date('start_date')->nullable()->after('subtasks');
            $table->json('dependency_ids')->nullable()->after('due_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['priority', 'labels', 'subtasks', 'start_date', 'dependency_ids']);
        });
    }
};
