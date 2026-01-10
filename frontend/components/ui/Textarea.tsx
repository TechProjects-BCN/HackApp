import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/app/lib/utils';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
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

Textarea.displayName = 'Textarea';

export { Textarea };
