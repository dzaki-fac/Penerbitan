import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';

const logoSize = {
    sm: { img: 'h-8 sm:h-10', gap: 'gap-1.5 sm:gap-2' },
    md: { img: 'h-9 sm:h-11', gap: 'gap-2 sm:gap-2.5' },
    lg: { img: 'h-16 sm:h-24', gap: 'gap-3 sm:gap-4' },
} as const;

type AppLogoProps = {
    size?: keyof typeof logoSize;
    className?: string;
    showName?: boolean;
    /** Adds a thin vertical rule between the UNDIP seal and the DPUPK/Press mark. */
    showDivider?: boolean;
};

export default function AppLogo({
    size = 'sm',
    className,
    showName = true,
    showDivider = false,
}: AppLogoProps) {
    const { name } = usePage().props;
    const { img: imgClass, gap: gapClass } = logoSize[size];

    return (
        <>
            <div className={cn('flex items-center', gapClass, className)}>
                <img
                    src="/assets/logo_undip.png"
                    alt="Logo UNDIP"
                    className={cn(imgClass, 'w-auto shrink-0')}
                />
                {showDivider && (
                    <span className="h-2/3 w-px shrink-0 bg-border" aria-hidden />
                )}
                <img
                    src="/assets/logo-dpupk.png"
                    alt="Logo DPUPK"
                    className={cn(imgClass, 'w-auto shrink-0')}
                />
                <img
                    src="/assets/logo_undip_press.png"
                    alt="Logo UNDIP Press"
                    className={cn(imgClass, 'w-auto shrink-0')}
                />
            </div>
            {showName && (
                <div className="ml-1 grid flex-1 text-left text-sm">
                    <span className="mb-0.5 truncate leading-tight font-semibold">
                        {name}
                    </span>
                </div>
            )}
        </>
    );
}