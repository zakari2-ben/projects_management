<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.email', 'john@example.com');
    }

    public function test_user_can_login_and_logout(): void
    {
        User::factory()->create([
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $login = $this->postJson('/api/login', [
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $login->assertOk()->assertJsonStructure(['message', 'user']);

        $user = User::where('email', 'john@example.com')->firstOrFail();
        $logout = $this->actingAs($user)->postJson('/api/logout');

        $logout->assertOk()->assertJsonPath('message', 'Logged out successfully.');
    }

    public function test_authenticated_user_can_fetch_me(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/me');

        $response->assertOk()->assertJsonPath('data.email', $user->email);
    }
}
