<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Note;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class NotesManagementTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user registration and login.
     */
    public function test_user_registration_and_login(): void
    {
        // 1. Register unverified user
        $registerResponse = $this->postJson('/api/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $registerResponse->assertStatus(201)
            ->assertJsonStructure(['access_token', 'user', 'requires_verification'])
            ->assertJsonFragment(['requires_verification' => true]);

        $this->assertDatabaseHas('users', ['email' => 'john@example.com']);
        $token = $registerResponse->json('access_token');

        // 2. Accessing notes unverified should return 403
        $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson('/api/notes')
            ->assertStatus(403)
            ->assertJsonFragment(['requires_verification' => true]);

        // 3. Verify OTP
        $otp = \Illuminate\Support\Facades\Cache::get('email_verification_otp_john@example.com');
        $this->assertNotNull($otp);

        $verifyResponse = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->postJson('/api/verify-email', ['otp' => (string)$otp]);

        $verifyResponse->assertStatus(200)
            ->assertJsonFragment(['message' => 'Account activated successfully!']);

        // 4. Accessing notes verified should now succeed (returns 200 empty list)
        $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson('/api/notes')
            ->assertStatus(200);

        // 5. Login
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $loginResponse->assertStatus(200)
            ->assertJsonStructure(['access_token', 'user', 'requires_verification'])
            ->assertJsonFragment(['requires_verification' => false]);
    }

    /**
     * Test creating a password-protected locked note.
     */
    public function test_create_password_protected_note(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/notes', [
            'title' => 'My Secret Note',
            'content' => 'Top secret content here',
            'password' => 'secret123',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('notes', [
            'user_id' => $user->id,
            'title' => 'My Secret Note',
        ]);

        $note = Note::where('title', 'My Secret Note')->first();
        $this->assertNotNull($note->password_hash);
        $this->assertTrue(Hash::check('secret123', $note->password_hash));
    }

    /**
     * Test unlocking a note with password.
     */
    public function test_unlock_note(): void
    {
        $user = User::factory()->create();
        $note = Note::create([
            'user_id' => $user->id,
            'title' => 'Locked Note',
            'content' => 'Hidden data',
            'password_hash' => Hash::make('mypass'),
        ]);

        // Wrong password
        $this->actingAs($user, 'sanctum')->postJson("/api/notes/{$note->id}/unlock", [
            'password' => 'wrongpass',
        ])->assertStatus(401);

        // Correct password
        $this->actingAs($user, 'sanctum')->postJson("/api/notes/{$note->id}/unlock", [
            'password' => 'mypass',
        ])->assertStatus(200)
          ->assertJsonFragment(['title' => 'Locked Note']);
    }

    /**
     * Test changing the password of a locked note.
     */
    public function test_change_note_password(): void
    {
        $user = User::factory()->create();
        $note = Note::create([
            'user_id' => $user->id,
            'title' => 'Change Password Note',
            'content' => 'Sensitive data',
            'password_hash' => Hash::make('oldpass'),
        ]);

        // Wrong current password
        $this->actingAs($user, 'sanctum')->postJson("/api/notes/{$note->id}/change-password", [
            'current_password' => 'wrong_old',
            'new_password' => 'newpass123',
        ])->assertStatus(401);

        // Correct current password, success
        $this->actingAs($user, 'sanctum')->postJson("/api/notes/{$note->id}/change-password", [
            'current_password' => 'oldpass',
            'new_password' => 'newpass123',
        ])->assertStatus(200);

        // Check new password works for unlocking
        $note->refresh();
        $this->assertTrue(Hash::check('newpass123', $note->password_hash));

        $this->actingAs($user, 'sanctum')->postJson("/api/notes/{$note->id}/unlock", [
            'password' => 'newpass123',
        ])->assertStatus(200);
    }

    /**
     * Test sharing a note with another user.
     */
    public function test_share_note(): void
    {
        $owner = User::factory()->create();
        $recipient = User::factory()->create();

        $note = Note::create([
            'user_id' => $owner->id,
            'title' => 'Shared Note',
            'content' => 'Let us collaborate',
        ]);

        $this->actingAs($owner, 'sanctum')->postJson("/api/notes/{$note->id}/share", [
            'email' => $recipient->email,
            'permission' => 'edit',
        ])->assertStatus(200);

        $this->assertDatabaseHas('note_shares', [
            'note_id' => $note->id,
            'user_id' => $recipient->id,
            'permission' => 'edit',
        ]);
    }
}
