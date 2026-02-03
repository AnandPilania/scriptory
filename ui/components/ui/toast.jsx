import * as React from 'react';
import { cn } from '@/lib/utils';

const Toast = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
    const variants = {
        default: 'bg-white dark:bg-gray-800 border',
        success: 'bg-green-500 text-white border-green-600',
        error: 'bg-red-500 text-white border-red-600',
        info: 'bg-blue-500 text-white border-blue-600',
    };

    return (
        <div
            ref={ref}
            className={cn(
                'animate-slide-up fixed right-4 bottom-4 z-50 rounded-lg px-6 py-3 shadow-2xl',
                variants[variant],
                className,
            )}
            {...props}
        />
    );
});
Toast.displayName = 'Toast';

export { Toast };
