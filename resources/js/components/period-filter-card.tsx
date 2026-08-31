import { router } from '@inertiajs/react';
import {
    DateRangePicker,
    dateToQueryString,
    queryStringToDate,
} from '@/components/ui/date-range-picker';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const PERIOD_OPTIONS = [
    { key: 'all', label: 'Semua Data' },
    { key: 'today', label: 'Hari Ini', days: 0 },
    { key: '7d', label: '7 Hari Terakhir', days: 6 },
    { key: '30d', label: '30 Hari Terakhir', days: 29 },
    { key: '1y', label: '1 Tahun Terakhir', days: 364 },
    { key: 'custom', label: 'Custom Range' },
] as const;

function toDateString(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function prettyDate(value: string | null): string {
    if (!value) {
        return '…';
    }

    const [year, month, day] = value.split('-').map(Number);

    return new Date(year, month - 1, day).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function PeriodFilterCard({
    route,
    from,
    to,
}: {
    route: string;
    from: string | null;
    to: string | null;
}) {
    function go(from: string | null, to: string | null) {
        const params: Record<string, string> = {};

        if (from) {
            params.from = from;
        }

        if (to) {
            params.to = to;
        }

        router.get(route, params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    function applyPeriod(key: string) {
        if (key === 'all') {
            go(null, null);

            return;
        }

        if (key === 'custom') {
            return;
        }

        const preset = PERIOD_OPTIONS.find((option) => option.key === key);

        if (!preset || !('days' in preset)) {
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const from = new Date(today);
        from.setDate(from.getDate() - preset.days);

        go(toDateString(from), toDateString(today));
    }

    const activePeriodKey = (() => {
        if (!from && !to) {
            return 'all';
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = toDateString(today);

        for (const preset of PERIOD_OPTIONS) {
            if (!('days' in preset)) {
                continue;
            }

            const fromDate = new Date(today);

            fromDate.setDate(fromDate.getDate() - preset.days);

            if (from === toDateString(fromDate) && to === todayStr) {
                return preset.key;
            }
        }

        return 'custom';
    })();

    const periodText =
        from || to
            ? `Periode: ${prettyDate(from)} – ${prettyDate(to)}`
            : 'Periode: Semua data';

    return (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card px-4 py-2.5 text-card-foreground shadow-sm">
            <Select value={activePeriodKey} onValueChange={applyPeriod}>
                <SelectTrigger className="w-44">
                    <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                    {PERIOD_OPTIONS.map((option) => (
                        <SelectItem key={option.key} value={option.key}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <DateRangePicker
                key={`${from ?? ''}-${to ?? ''}`}
                value={{
                    start: queryStringToDate(from ?? ''),
                    end: queryStringToDate(to ?? ''),
                }}
                onChange={(range) =>
                    go(
                        range.start ? dateToQueryString(range.start) : null,
                        range.end ? dateToQueryString(range.end) : null,
                    )
                }
            />
            <p className="ml-auto text-sm text-muted-foreground">
                {periodText}
            </p>
        </div>
    );
}
