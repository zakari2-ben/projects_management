<?php

namespace App\Enums;

enum TaskPriority: string
{
    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';
    case Critical = 'critical';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
