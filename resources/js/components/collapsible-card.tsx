import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type CollapsibleCardProps = {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    defaultOpen?: boolean;
    className?: string;
    contentClassName?: string;
    children: React.ReactNode;
};

export default function CollapsibleCard({
    title,
    description,
    icon,
    defaultOpen = true,
    className,
    contentClassName,
    children,
}: CollapsibleCardProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <Card className={className}>
            <div className="flex items-start justify-between gap-2 px-6">
                <div className="flex flex-col gap-1.5">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        {icon}
                        {title}
                    </CardTitle>
                    {description && (
                        <CardDescription>{description}</CardDescription>
                    )}
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="-mr-1 size-7 shrink-0"
                    onClick={() => setOpen((o) => !o)}
                    aria-expanded={open}
                    aria-label={open ? `Sembunyikan ${title}` : `Tampilkan ${title}`}
                >
                    <ChevronDown
                        className={cn(
                            'size-4 transition-transform duration-200',
                            !open && '-rotate-90',
                        )}
                    />
                </Button>
            </div>
            {open && (
                <CardContent className={cn(contentClassName)}>
                    {children}
                </CardContent>
            )}
        </Card>
    );
}
