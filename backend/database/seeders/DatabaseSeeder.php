<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Safe, idempotent creation of Test User
        User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'preferences' => [
                    'theme' => 'light',
                    'fontSize' => 'medium',
                    'noteColor' => 'default'
                ]
            ]
        );

        // Safe, idempotent creation of Admin User
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'preferences' => [
                    'theme' => 'dark',
                    'fontSize' => 'medium',
                    'noteColor' => 'default'
                ]
            ]
        );
    }
}
