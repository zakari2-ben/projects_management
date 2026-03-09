# Backend

Laravel API for the Project Management System.

## Commands

```bash
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
php artisan test
```

## Responsibilities

- Authentication with Sanctum
- Project membership and invite code workflows
- Task lifecycle (create/update/status/assignment)
- API validation and policy-based authorization
- Resource transformers for stable client contracts

## API Notes

- Protected routes use `auth:sanctum`
- Task listing supports query filters:
  - `search`
  - `status`
  - `priority`
  - `assigned_user_id`
  - `due_after`
  - `due_before`
  - `sort_by` (`id|created_at|due_date|priority|status`)
  - `sort_direction` (`asc|desc`)
