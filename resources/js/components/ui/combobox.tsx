import { ChevronDown, Check } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type ComboboxOption = {
    value: string;
    label: string;
};

type Props = {
    id?: string;
    value: string;
    options: ComboboxOption[];
    onValueChange: (value: string) => void;
    placeholder?: string;
    emptyText?: string;
    className?: string;
};

export function Combobox({
    id,
    value,
    options,
    onValueChange,
    placeholder,
    emptyText = 'Tidak ada pilihan.',
    className,
}: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const displayValue = useMemo(() => {
        if (query) {
            return query;
        }
        return options.find((option) => option.value === value)?.label ?? value;
    }, [query, value, options]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) {
            return options;
        }
        return options.filter(
            (option) =>
                option.label.toLowerCase().includes(q) ||
                option.value.toLowerCase().includes(q),
        );
    }, [query, options]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function selectOption(option: ComboboxOption) {
        onValueChange(option.value);
        setQuery('');
        setOpen(false);
    }

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            <div className="relative">
                <input
                    id={id}
                    type="text"
                    value={displayValue}
                    placeholder={placeholder}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onValueChange(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            setOpen(false);
                        }
                        if (
                            e.key === 'Enter' &&
                            filtered.length === 1 &&
                            open
                        ) {
                            e.preventDefault();
                            selectOption(filtered[0]);
                        }
                    }}
                    className="border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 pr-8 text-base transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive"
                />
                <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setOpen((prev) => !prev)}
                    className="absolute top-0 right-0 flex h-full w-8 items-center justify-center text-muted-foreground"
                    aria-label="Buka daftar pilihan"
                >
                    <ChevronDown
                        className={cn(
                            'size-4 transition-transform',
                            open && 'rotate-180',
                        )}
                    />
                </button>
            </div>
            {open && (
                <ul className="bg-popover text-popover-foreground absolute z-50 mt-1 max-h-60 w-full min-w-0 overflow-y-auto rounded-md border p-1 shadow-md">
                    {filtered.length === 0 && (
                        <li className="px-2 py-1.5 text-sm text-muted-foreground">
                            {emptyText}
                        </li>
                    )}
                    {filtered.map((option) => (
                        <li key={option.value}>
                            <button
                                type="button"
                                onClick={() => selectOption(option)}
                                className="focus:bg-accent focus:text-accent-foreground flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                            >
                                <span className="truncate">
                                    {option.label}
                                </span>
                                {option.value === value && (
                                    <Check className="size-4 shrink-0 text-muted-foreground" />
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
