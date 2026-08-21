import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, XIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type DateRange = {
    start: Date | null;
    end: Date | null;
};

type DateRangePickerProps = {
    value?: DateRange;
    onChange?: (range: DateRange) => void;
    placeholder?: string;
    className?: string;
};

type View = 'calendar' | 'yearPicker' | 'monthPicker';

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const MONTH_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

const DAY_LABELS = ['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mg'];

const CURRENT_YEAR = new Date().getFullYear();

function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number): Date {
    return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function isBetween(date: Date, start: Date, end: Date): boolean {
    const t = date.getTime();
    return t > start.getTime() && t < end.getTime();
}

function formatDate(date: Date): string {
    return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function toInputValue(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function YearPicker({
    currentYear,
    onSelect,
}: {
    currentYear: number;
    onSelect: (year: number) => void;
}) {
    const [page, setPage] = useState(Math.floor((currentYear - CURRENT_YEAR + 10) / 12));

    const years = useMemo(() => {
        const base = CURRENT_YEAR - 10 + page * 12;
        return Array.from({ length: 12 }, (_, i) => base + i);
    }, [page]);

    return (
        <div className="select-none">
            <div className="flex items-center justify-between px-1 pb-3">
                <Button variant="ghost" size="icon" className="size-7" onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeftIcon className="size-4" />
                </Button>
                <p className="text-sm font-medium">
                    {years[0]} – {years[years.length - 1]}
                </p>
                <Button variant="ghost" size="icon" className="size-7" onClick={() => setPage((p) => p + 1)}>
                    <ChevronRightIcon className="size-4" />
                </Button>
            </div>
            <div className="grid grid-cols-3 gap-1">
                {years.map((year) => (
                    <button
                        key={year}
                        type="button"
                        onClick={() => onSelect(year)}
                        className={cn(
                            'flex h-9 items-center justify-center rounded-md text-sm transition-colors',
                            year === currentYear
                                ? 'bg-primary text-primary-foreground font-medium'
                                : 'hover:bg-accent',
                        )}
                    >
                        {year}
                    </button>
                ))}
            </div>
        </div>
    );
}

function MonthPicker({
    currentMonth,
    onSelect,
}: {
    currentMonth: number;
    onSelect: (month: number) => void;
}) {
    return (
        <div className="grid grid-cols-3 gap-1 select-none">
            {MONTH_SHORT.map((name, i) => (
                <button
                    key={i}
                    type="button"
                    onClick={() => onSelect(i)}
                    className={cn(
                        'flex h-9 items-center justify-center rounded-md text-sm transition-colors',
                        i === currentMonth
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'hover:bg-accent',
                    )}
                >
                    {name}
                </button>
            ))}
        </div>
    );
}

function Calendar({
    viewMonth,
    onPrevMonth,
    onNextMonth,
    selected,
    onSelect,
    onOpenYearPicker,
    onOpenMonthPicker,
}: {
    viewMonth: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    selected: DateRange;
    onSelect: (date: Date) => void;
    onOpenYearPicker: () => void;
    onOpenMonthPicker: () => void;
}) {
    const today = useMemo(() => new Date(), []);

    const cells = useMemo(() => {
        const first = startOfMonth(viewMonth);
        const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
        const startDay = (first.getDay() + 6) % 7;
        const total = last.getDate();

        const result: Array<{ date: Date; currentMonth: boolean }> = [];

        for (let i = 0; i < startDay; i++) {
            const d = new Date(first.getFullYear(), first.getMonth(), -(startDay - i - 1));
            result.push({ date: d, currentMonth: false });
        }
        for (let i = 1; i <= total; i++) {
            result.push({ date: new Date(first.getFullYear(), first.getMonth(), i), currentMonth: true });
        }
        const remaining = 42 - result.length;
        for (let i = 1; i <= remaining; i++) {
            result.push({ date: new Date(first.getFullYear(), first.getMonth() + 1, i), currentMonth: false });
        }

        return result;
    }, [viewMonth]);

    const rangeStart = selected.start;
    const rangeEnd = selected.end;

    return (
        <div className="select-none">
            <div className="flex items-center justify-between px-1 pb-3">
                <Button variant="ghost" size="icon" className="size-7" onClick={onPrevMonth}>
                    <ChevronLeftIcon className="size-4" />
                </Button>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={onOpenMonthPicker}
                        className="rounded px-1.5 py-0.5 text-sm font-medium hover:bg-accent"
                    >
                        {MONTH_NAMES[viewMonth.getMonth()]}
                    </button>
                    <button
                        type="button"
                        onClick={onOpenYearPicker}
                        className="rounded px-1.5 py-0.5 text-sm font-medium hover:bg-accent"
                    >
                        {viewMonth.getFullYear()}
                    </button>
                </div>
                <Button variant="ghost" size="icon" className="size-7" onClick={onNextMonth}>
                    <ChevronRightIcon className="size-4" />
                </Button>
            </div>

            <div className="grid grid-cols-7 gap-0">
                {DAY_LABELS.map((d) => (
                    <div
                        key={d}
                        className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground"
                    >
                        {d}
                    </div>
                ))}

                {cells.map(({ date, currentMonth }, idx) => {
                    const isToday = isSameDay(date, today);
                    const isStart = rangeStart && isSameDay(date, rangeStart);
                    const isEnd = rangeEnd && isSameDay(date, rangeEnd);
                    const inRange =
                        rangeStart &&
                        rangeEnd &&
                        isBetween(date, rangeStart, rangeEnd);
                    const isStartOrEnd = isStart || isEnd;

                    return (
                        <div
                            key={idx}
                            className={cn(
                                'relative flex h-8 items-center justify-center',
                                (inRange || isStartOrEnd) && 'bg-primary/10',
                                isStart && 'rounded-l-md pr-4',
                                isEnd && 'rounded-r-md pl-4',
                            )}
                        >
                            <button
                                type="button"
                                disabled={!currentMonth}
                                onClick={() => onSelect(date)}
                                className={cn(
                                    'flex size-7 items-center justify-center rounded-full text-xs transition-colors',
                                    !currentMonth && 'text-muted-foreground/40',
                                    currentMonth && !isStartOrEnd && 'hover:bg-accent',
                                    isStartOrEnd && 'size-9 bg-primary text-primary-foreground font-semibold',
                                    isToday &&
                                        !isStartOrEnd &&
                                        'font-bold text-primary',
                                )}
                            >
                                {date.getDate()}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function DateRangePicker({
    value,
    onChange,
    placeholder = 'Pilih tanggal',
    className,
}: DateRangePickerProps) {
    const [open, setOpen] = useState(false);
    const [viewMonth, setViewMonth] = useState(() =>
        startOfMonth(value?.start ?? new Date()),
    );
    const [selected, setSelected] = useState<DateRange>(
        value ?? { start: null, end: null },
    );
    const [picking, setPicking] = useState<'start' | 'end'>('start');
    const [view, setView] = useState<View>('calendar');

    function handleSelect(date: Date) {
        if (picking === 'start') {
            setSelected({ start: date, end: null });
            setPicking('end');
            setViewMonth(startOfMonth(date));
        } else {
            const start = selected.start!;
            const next =
                date < start
                    ? { start: date, end: start }
                    : { start, end: date };
            setSelected(next);
            setPicking('start');
            onChange?.(next);
            setTimeout(() => setOpen(false), 500);
        }
    }

    function handleClear(e: React.MouseEvent) {
        e.stopPropagation();
        setSelected({ start: null, end: null });
        setPicking('start');
        onChange?.({ start: null, end: null });
    }

    function handleOpenChange(nextOpen: boolean) {
        setOpen(nextOpen);
        if (nextOpen) {
            setSelected(value ?? { start: null, end: null });
            setPicking('start');
            setViewMonth(startOfMonth(value?.start ?? new Date()));
            setView('calendar');
        }
    }

    const hasValue = selected.start && selected.end;

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        'h-9 gap-2 text-sm font-normal',
                        !hasValue && 'text-muted-foreground',
                        className,
                    )}
                >
                    <CalendarIcon className="size-4" />
                    {hasValue
                        ? `${formatDate(selected.start!)} – ${formatDate(selected.end!)}`
                        : placeholder}
                    {hasValue && (
                        <span
                            role="button"
                            tabIndex={-1}
                            onClick={handleClear}
                            className="ml-1 inline-flex size-3.5 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
                        >
                            <XIcon className="size-3.5" />
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-3" align="start">
                {view === 'calendar' && (
                    <Calendar
                        viewMonth={viewMonth}
                        onPrevMonth={() => setViewMonth((m) => addMonths(m, -1))}
                        onNextMonth={() => setViewMonth((m) => addMonths(m, 1))}
                        selected={selected}
                        onSelect={handleSelect}
                        onOpenYearPicker={() => setView('yearPicker')}
                        onOpenMonthPicker={() => setView('monthPicker')}
                    />
                )}
                {view === 'yearPicker' && (
                    <YearPicker
                        currentYear={viewMonth.getFullYear()}
                        onSelect={(year) => {
                            setViewMonth((m) => new Date(year, m.getMonth(), 1));
                            setView('calendar');
                        }}
                    />
                )}
                {view === 'monthPicker' && (
                    <MonthPicker
                        currentMonth={viewMonth.getMonth()}
                        onSelect={(month) => {
                            setViewMonth(new Date(viewMonth.getFullYear(), month, 1));
                            setView('calendar');
                        }}
                    />
                )}
                <div className="mt-2 flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
                    <span>
                        {picking === 'start'
                            ? 'Klik tanggal awal'
                            : 'Klik tanggal akhir'}
                    </span>
                    <span>
                        {selected.start && selected.end
                            ? `${formatDate(selected.start)} – ${formatDate(selected.end)}`
                            : selected.start
                                ? `${formatDate(selected.start)} – …`
                                : 'Belum dipilih'}
                    </span>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export function dateToQueryString(date: Date): string {
    return toInputValue(date);
}

export function queryStringToDate(s: string): Date | null {
    if (!s) return null;
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
}
