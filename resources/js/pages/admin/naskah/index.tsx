import { Head, Link, router } from '@inertiajs/react';
import { Download, Eye, FilterIcon, Pencil, Plus, Trash2, Upload, XIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { DateRangePicker, dateToQueryString, queryStringToDate } from '@/components/ui/date-range-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FAKULTAS_OPTIONS } from '@/lib/fakultas';
import { statusBadgeClass } from '@/lib/status';
import { cn } from '@/lib/utils';
import admin from '@/routes/admin';
import { create, destroy, edit, show } from '@/routes/admin/naskah';
import type { NaskahCard } from '@/types';

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean } | null>;
};

type Props = {
    naskahs: Paginated<NaskahCard>;
    filters: {
        search: string;
        status: string;
        stage: string;
        fakultas: string;
        date_from: string;
        date_to: string;
        per_page: string;
        sort_by: string;
        sort_dir: string;
    };
    statuses: Array<{ value: string; label: string }>;
};

const SORT_OPTIONS = [
    { value: 'tanggal', label: 'Tanggal' },
    { value: 'judul', label: 'Judul' },
    { value: 'penulis', label: 'Penulis' },
    { value: 'status', label: 'Status' },
];

type FilterPanelProps = {
    fakultas: string;
    onFakultasChange: (v: string) => void;
    status: string;
    onStatusChange: (v: string) => void;
    sortBy: string;
    onSortByChange: (v: string) => void;
    sortDir: string;
    onSortDirChange: (v: string) => void;
    fakultasOptions: string[];
    statuses: Array<{ value: string; label: string }>;
};

function FilterPanel({
    fakultas,
    onFakultasChange,
    status,
    onStatusChange,
    sortBy,
    onSortByChange,
    sortDir,
    onSortDirChange,
    fakultasOptions,
    statuses,
}: FilterPanelProps) {
    const [open, setOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<string[]>(() => {
        const filters: string[] = [];

        if (fakultas) {
filters.push('fakultas');
}

        if (status) {
filters.push('status');
}

        if (sortBy) {
filters.push('sort');
}

        return filters;
    });

    const availableFilters = [
        { key: 'fakultas', label: 'Fakultas / Sekolah' },
        { key: 'status', label: 'Status' },
        { key: 'sort', label: 'Urutkan' },
    ].filter((f) => !activeFilters.includes(f.key));

    function addFilter(key: string) {
        setActiveFilters((prev) => [...prev, key]);
    }

    function removeFilter(key: string) {
        setActiveFilters((prev) => prev.filter((f) => f !== key));

        if (key === 'fakultas') {
onFakultasChange('');
}

        if (key === 'status') {
onStatusChange('');
}

        if (key === 'sort') {
            onSortByChange('');
            onSortDirChange('desc');
        }
    }

    const activeCount = activeFilters.filter(
        (f) =>
            (f === 'fakultas' && fakultas) ||
            (f === 'status' && status) ||
            (f === 'sort' && sortBy),
    ).length;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        'h-9 gap-2 text-sm font-normal',
                        activeCount > 0 && 'border-primary/50 text-primary',
                    )}
                >
                    <FilterIcon className="size-4" />
                    Filter
                    {activeCount > 0 && (
                        <Badge
                            variant="secondary"
                            className="ml-0.5 size-5 rounded-full p-0 text-xs"
                        >
                            {activeCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
                <div className="p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Filter aktif
                    </p>
                    {activeFilters.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                            Belum ada filter aktif.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {activeFilters.includes('fakultas') && (
                                <FilterRow
                                    label="Fakultas / Sekolah"
                                    onRemove={() => removeFilter('fakultas')}
                                >
                                    <Select
                                        value={fakultas || 'all'}
                                        onValueChange={(v) => {
                                            const val = v === 'all' ? '' : v;
                                            onFakultasChange(val);
                                        }}
                                    >
                                        <SelectTrigger className="h-8 w-full text-xs">
                                            <SelectValue placeholder="Semua" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua
                                            </SelectItem>
                                            {fakultasOptions.map((f) => (
                                                <SelectItem key={f} value={f}>
                                                    {f}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FilterRow>
                            )}
                            {activeFilters.includes('status') && (
                                <FilterRow
                                    label="Status"
                                    onRemove={() => removeFilter('status')}
                                >
                                    <Select
                                        value={status || 'all'}
                                        onValueChange={(v) => {
                                            const val = v === 'all' ? '' : v;
                                            onStatusChange(val);
                                        }}
                                    >
                                        <SelectTrigger className="h-8 w-full text-xs">
                                            <SelectValue placeholder="Semua" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua
                                            </SelectItem>
                                            {statuses.map((s) => (
                                                <SelectItem
                                                    key={s.value}
                                                    value={s.value}
                                                >
                                                    {s.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FilterRow>
                            )}
                            {activeFilters.includes('sort') && (
                                <FilterRow
                                    label="Urutkan"
                                    onRemove={() => removeFilter('sort')}
                                >
                                    <div className="flex gap-1.5">
                                        <Select
                                            value={sortBy || 'all'}
                                            onValueChange={(v) => {
                                                const val = v === 'all' ? '' : v;
                                                onSortByChange(val);

                                                if (val && !sortDir) {
onSortDirChange('asc');
}
                                            }}
                                        >
                                            <SelectTrigger className="h-8 flex-1 text-xs">
                                                <SelectValue placeholder="Pilih kolom" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    Default
                                                </SelectItem>
                                                {SORT_OPTIONS.map((o) => (
                                                    <SelectItem
                                                        key={o.value}
                                                        value={o.value}
                                                    >
                                                        {o.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 shrink-0 px-0"
                                            disabled={!sortBy}
                                            onClick={() =>
                                                onSortDirChange(
                                                    sortDir === 'asc' ? 'desc' : 'asc',
                                                )
                                            }
                                        >
                                            {sortDir === 'asc' ? '↑' : '↓'}
                                        </Button>
                                    </div>
                                </FilterRow>
                            )}
                        </div>
                    )}
                </div>

                {availableFilters.length > 0 && (
                    <div className="border-t p-3">
                        <Select
                            value=""
                            onValueChange={addFilter}
                        >
                            <SelectTrigger className="h-8 w-full border-dashed text-xs">
                                <SelectValue placeholder="+ Tambah filter" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableFilters.map((f) => (
                                    <SelectItem key={f.key} value={f.key}>
                                        {f.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}

function FilterRow({
    label,
    onRemove,
    children,
}: {
    label: string;
    onRemove: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{label}</span>
                <button
                    type="button"
                    onClick={onRemove}
                    className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
                >
                    <XIcon className="size-3" />
                </button>
            </div>
            {children}
        </div>
    );
}

export default function NaskahIndex({
    naskahs,
    filters,
    statuses,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);
    const [fakultas, setFakultas] = useState(filters.fakultas);
    const [dateRange, setDateRange] = useState<{
        start: Date | null;
        end: Date | null;
    }>({
        start: queryStringToDate(filters.date_from),
        end: queryStringToDate(filters.date_to),
    });
    const [perPage, setPerPage] = useState(filters.per_page);
    const [sortBy, setSortBy] = useState(filters.sort_by);
    const [sortDir, setSortDir] = useState(filters.sort_dir);
    const fakultasOptions = FAKULTAS_OPTIONS.map((f) => f.value);
    const applied = useRef({
        search: filters.search,
        status: filters.status,
        stage: filters.stage,
        fakultas: filters.fakultas,
        date_from: filters.date_from,
        date_to: filters.date_to,
        per_page: filters.per_page,
        sort_by: filters.sort_by,
        sort_dir: filters.sort_dir,
    });

    function apply(next: {
        search?: string;
        status?: string;
        fakultas?: string;
        date_from?: string;
        date_to?: string;
        sort_by?: string;
        sort_dir?: string;
    }) {
        applied.current = { ...applied.current, ...next };
        router.get(admin.naskah.index(), applied.current, {
            preserveState: true,
            replace: true,
        });
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== applied.current.search) {
                apply({ search });
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    function resetFilters() {
        setSearch('');
        setStatus('');
        setFakultas('');
        setSortBy('');
        setSortDir('desc');
        setDateRange({ start: null, end: null });
        applied.current = {
            search: '',
            status: '',
            stage: '',
            fakultas: '',
            date_from: '',
            date_to: '',
            per_page: perPage,
            sort_by: '',
            sort_dir: 'desc',
        };
        router.get(admin.naskah.index(), applied.current, {
            preserveState: true,
            replace: true,
        });
    }

    function goTo(url: string) {
        router.get(url, {}, { preserveState: true });
    }

    function changePerPage(value: string) {
        setPerPage(value);
        applied.current = { ...applied.current, per_page: value };
        router.get(admin.naskah.index(), applied.current, {
            preserveState: true,
            replace: true,
        });
    }

    function remove(id: number) {
        if (confirm('Hapus naskah ini?')) {
            router.delete(destroy(id), {
                data: { ...applied.current },
                preserveState: true,
                replace: true,
            });
        }
    }

    const importRef = useRef<HTMLInputElement>(null);

    function exportCsv() {
        const params = new URLSearchParams();
        Object.entries(applied.current).forEach(([k, v]) => {
            if (v && v !== 'all') {
params.set(k, String(v));
}
        });
        const qs = params.toString();
        window.location.href = admin.naskah.export.url() + (qs ? `?${qs}` : '');
    }

    function importCsv(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        if (!file) {
return;
}

        const formData = new FormData();
        formData.append('file', file);
        router.post(admin.naskah.import(), formData, {
            preserveState: true,
            onFinish: () => {
                if (importRef.current) {
importRef.current.value = '';
}
            },
        });
    }

    const paginationBar = (border: string) => (
        <div
            className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${border}`}
        >
            <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                    Menampilkan {naskahs.data.length} dari {naskahs.total}{' '}
                    naskah
                </p>
                <Select value={perPage} onValueChange={changePerPage}>
                    <SelectTrigger className="h-7 w-24 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10 </SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="all">Semua</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {naskahs.last_page > 1 && (
                <div className="flex gap-1">
                    {naskahs.links
                        .filter(
                            (link): link is NonNullable<typeof link> =>
                                link !== null,
                        )
                        .map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                className={cn(
                                    'min-w-8 px-2',
                                    link.active && 'disabled:opacity-100',
                                )}
                                disabled={!link.url || link.active}
                                onClick={() => link.url && goTo(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                </div>
            )}
        </div>
    );

    return (
        <>
            <Head title="Data Naskah" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-lg font-semibold">Data Naskah</h1>
                        <p className="text-sm text-muted-foreground">
                            Naskah berasal dari Google Form yang diimpor oleh
                            admin.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={exportCsv}>
                            <Download className="size-4" />
                        </Button>
                        <input
                            ref={importRef}
                            type="file"
                            accept=".csv,.txt"
                            className="hidden"
                            onChange={importCsv}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => importRef.current?.click()}
                        >
                            <Upload className="size-4" />
                        </Button>
                        <Button asChild size="sm">
                            <Link href={create()}>
                                <Plus />
                                Tambah Naskah
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card className="py-4">
                    <CardContent className="px-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="search" className="shrink-0">
                                    Cari
                                </Label>
                                <Input
                                    id="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Judul, nama penulis, atau nomor identitas"
                                    className="w-72"
                                />
                            </div>
                            <FilterPanel
                                fakultas={fakultas}
                                onFakultasChange={(v) => {
                                    setFakultas(v);
                                    apply({ fakultas: v });
                                }}
                                status={status}
                                onStatusChange={(v) => {
                                    setStatus(v);
                                    apply({ status: v });
                                }}
                                sortBy={sortBy}
                                onSortByChange={(v) => {
                                    setSortBy(v);
                                    apply({ sort_by: v, sort_dir: sortDir });
                                }}
                                sortDir={sortDir}
                                onSortDirChange={(v) => {
                                    setSortDir(v);
                                    apply({ sort_by: sortBy, sort_dir: v });
                                }}
                                fakultasOptions={fakultasOptions}
                                statuses={statuses}
                            />
                            <div className="flex items-center gap-2">
                                <DateRangePicker
                                    value={dateRange}
                                    onChange={(range) => {
                                        setDateRange(range);
                                        apply({
                                            date_from: range.start
                                                ? dateToQueryString(range.start)
                                                : '',
                                            date_to: range.end
                                                ? dateToQueryString(range.end)
                                                : '',
                                        });
                                    }}
                                />
                            </div>
                            <Button
                                variant="ghost"
                                onClick={resetFilters}
                                className="ml-auto h-9 px-3"
                            >
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="pt-0">
                    <CardContent className="p-0">
                        {naskahs.data.length > 0 && paginationBar('border-b')}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                                        <th className="px-4 py-3 font-medium">
                                            Judul
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Penulis
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Tanggal
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Progress
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {naskahs.data.map((naskah) => (
                                        <tr
                                            key={naskah.id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="max-w-60 px-4 py-3">
                                                <p className="truncate font-medium">
                                                    {naskah.judul}
                                                </p>
                                                {naskah.link_cover && (
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {naskah.link_cover}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p>{naskah.penulis}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {naskah.identitas}
                                                </p>
                                                {(naskah.penulis_status ||
                                                    naskah.fakultas_sekolah) && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {[
                                                            naskah.penulis_status,
                                                            naskah.fakultas_sekolah,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' · ')}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {naskah.tanggal_pengajuan}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    className={statusBadgeClass(
                                                        naskah.status.value,
                                                    )}
                                                >
                                                    {naskah.status.label}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className="h-full rounded-full bg-primary"
                                                            style={{
                                                                width: `${naskah.progress}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {naskah.progress}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        asChild
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Detail"
                                                    >
                                                        <Link
                                                            href={show(
                                                                naskah.id,
                                                            )}
                                                        >
                                                            <Eye />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        asChild
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Edit"
                                                    >
                                                        <Link
                                                            href={edit(
                                                                naskah.id,
                                                            )}
                                                        >
                                                            <Pencil />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Hapus"
                                                        onClick={() =>
                                                            remove(naskah.id)
                                                        }
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {naskahs.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-10 text-center text-muted-foreground"
                                            >
                                                Tidak ada naskah ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

NaskahIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: admin.dashboard(),
        },
        {
            title: 'Data Naskah',
            href: admin.naskah.index(),
        },
    ],
};
