import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
        per_page: string;
    };
    statuses: Array<{ value: string; label: string }>;
    fakultasOptions: string[];
};

export default function NaskahIndex({
    naskahs,
    filters,
    statuses,
    fakultasOptions,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);
    const [fakultas, setFakultas] = useState(filters.fakultas);
    const [perPage, setPerPage] = useState(filters.per_page);
    const applied = useRef({
        search: filters.search,
        status: filters.status,
        stage: filters.stage,
        fakultas: filters.fakultas,
        per_page: filters.per_page,
    });

    function apply(next: {
        search?: string;
        status?: string;
        fakultas?: string;
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
        applied.current = {
            search: '',
            status: '',
            stage: '',
            fakultas: '',
            per_page: perPage,
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
            router.delete(destroy(id));
        }
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
                    <Button asChild>
                        <Link href={create()}>
                            <Plus />
                            Tambah Naskah
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter</CardTitle>
                        <CardDescription>
                            {naskahs.total} naskah ditemukan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="grid min-w-56 flex-1 gap-2">
                                <Label htmlFor="search">Cari</Label>
                                <Input
                                    id="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Judul, nama penulis, atau nomor identitas"
                                />
                            </div>
                            <div className="grid min-w-40 gap-2">
                                <Label>Fakultas / Sekolah</Label>
                                <Select
                                    value={fakultas || 'all'}
                                    onValueChange={(v) => {
                                        const value = v === 'all' ? '' : v;
                                        setFakultas(value);
                                        apply({ fakultas: value });
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Semua fakultas/sekolah" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua fakultas/sekolah
                                        </SelectItem>
                                        {fakultasOptions.map((f) => (
                                            <SelectItem key={f} value={f}>
                                                {f}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid min-w-40 gap-2">
                                <Label>Status</Label>
                                <Select
                                    value={status || 'all'}
                                    onValueChange={(v) => {
                                        const value = v === 'all' ? '' : v;
                                        setStatus(value);
                                        apply({ status: value });
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Semua status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua status
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
                            </div>
                            <Button variant="ghost" onClick={resetFilters}>
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
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