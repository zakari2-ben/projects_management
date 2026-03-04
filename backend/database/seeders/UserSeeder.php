<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::query()->firstOrCreate(
            ['email' => 'owner@example.com'],
            ['name' => 'Project Owner', 'password' => Hash::make('password123')]
        );

        User::query()->firstOrCreate(
            ['email' => 'member1@example.com'],
            ['name' => 'Member One', 'password' => Hash::make('password123')]
        );

        User::query()->firstOrCreate(
            ['email' => 'member2@example.com'],
            ['name' => 'Member Two', 'password' => Hash::make('password123')]
        );
    }
}
