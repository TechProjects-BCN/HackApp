import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/app/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', ...props }, ref) => {
        const variants = {
            primary: 'btn-primary',
            secondary: 'btn-secondary',
            danger: 'btn-danger',
        };

        return (
            <button
                ref={ref}
                className={cn(variants[variant], className)}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';

export { Button };
