import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/app/lib/utils';

type CardProps = HTMLAttributes<HTMLDivElement>;

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('glass-card p-8', className)}
                {...props}
            />
        );
    }
);

Card.displayName = 'Card';

export { Card };
