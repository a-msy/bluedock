<?php
namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as ResetPasswordNotification;
use Illuminate\Notifications\Messages\MailMessage;

class AdminPasswordResetNotification extends ResetPasswordNotification
{
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->line('You are receiving this email because we received a password reset request for your account.')
            ->action('Reset Password', url(config('url').route('admin.password.reset', $this->token, false)))
            ->line('If you did not request a password reset, no further action is required.');
    }
}
