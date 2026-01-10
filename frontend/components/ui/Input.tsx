import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/app/lib/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={cn(
                    'w-full px-4 py-3 rounded-xl bg-surface border border-surface-border text-input-text placeholder:text-input-placeholder focus:outline-none focus:ring-2 focus:ring-input-ring focus:border-input-ring transition-all',
                    className
                )}
                {...props}
            />
        );
    }
);

Input.displayName = 'Input';

export { Input };
