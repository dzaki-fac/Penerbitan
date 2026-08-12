import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    BookOpen,
    CalendarDays,
    ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { needsAuthorAction, statusBadgeClass } from '@/lib/status';
import { tracking } from '@/routes';
import { detail } from '@/routes/tracking';
import type { AuthorCard, NaskahCard } from '@/types';

type Props = {
    author: AuthorCard;
    naskahs: NaskahCard[];
};

export default function TrackingResult({ author, naskahs }: Props) {
    const perluTindakan = naskahs.filter((n) =>
        needsAuthorAction(n.status.value),
    );

    return (
        <>
            <Head title="Hasil Pencarian" />

            <div className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="flex flex-col gap-1">
                        <p className="text-sm text-muted-foreground">
                            Penulis teridentifikasi
                        </p>
                        <h1 className="text-2xl font-semibold tracking-[0.008em]">
                            {author.nama}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {author.jenis_identitas}: {author.nomor_identitas}
                        </p>
                    </div>
                    <div className="mt-4">
                        <Button asChild variant="outline" size="sm">
                            <Link href={tracking()}>Telusuri kembali</Link>
                        </Button>
                    </div>
                </div>

                {perluTindakan.length > 0 && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
                        <p className="text-sm text-amber-800">
                            Ada{' '}
                            <span className="font-semibold">
                                {perluTindakan.length}
                            </span>{' '}
                            naskah yang menunggu tindakan Anda.
                        </p>
                    </div>
                )}

                <div className="-mx-4 rounded-xl bg-lavender-wash px-4 py-10 sm:-mx-6 sm:px-6">
                    <div className="mx-auto max-w-3xl space-y-4">
                        <h2 className="text-xl font-semibold tracking-[0.008em]">
                            Naskah Anda ({naskahs.length})
                        </h2>

                        {naskahs.length === 0 ? (
                            <Card className="border-border">
                                <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                                    <BookOpen className="size-10 text-muted-foreground/50" />
                                    <p className="text-muted-foreground">
                                        Belum ada naskah yang terdaftar untuk
                                        penulis ini.
                                    </p>
                                    <p className="max-w-sm text-xs text-muted-foreground">
                                        Jika Anda baru saja mengajukan naskah,
                                        data biasanya muncul dalam 1-2 hari
                                        kerja setelah diverifikasi admin.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {naskahs.map((naskah) => {
                                    const perluAksi = needsAuthorAction(
                                        naskah.status.value,
                                    );

                                    return (
                                        <Card
                                            key={naskah.id}
                                            className={`gap-4 border-border ${
                                                perluAksi
                                                    ? 'ring-1 ring-amber-300'
                                                    : ''
                                            }`}
                                        >
                                            <CardHeader className="gap-2">
                                                <div className="flex items-start justify-between gap-3">
                                                    <CardTitle className="text-base leading-snug">
                                                        {naskah.judul}
                                                    </CardTitle>
                                                    <Badge
                                                        className={`shrink-0 ${statusBadgeClass(naskah.status.value)}`}
                                                    >
                                                        {naskah.status.label}
                                                    </Badge>
                                                </div>
                                                {perluAksi && (
                                                    <p className="flex items-center gap-1 text-xs font-medium text-amber-700">
                                                        <AlertCircle className="size-3.5" />
                                                        Perlu tindakan Anda
                                                    </p>
                                                )}
                                            </CardHeader>
                                            <CardContent className="flex flex-col gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground">
                                                            Progress
                                                        </span>
                                                        <span className="font-medium">
                                                            {naskah.progress}%
                                                        </span>
                                                    </div>
                                                    <div className="h-2 w-full overflow-hidden rounded-full bg-border/60">
                                                        <div
                                                            className="h-full rounded-full bg-primary transition-all"
                                                            style={{
                                                                width: `${naskah.progress}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <CalendarDays className="size-4" />
                                                    Pengajuan:{' '}
                                                    {naskah.tanggal_pengajuan}
                                                </div>
                                                <Button
                                                    asChild
                                                    className="w-full"
                                                >
                                                    <Link
                                                        href={detail(naskah.id)}
                                                    >
                                                        Lihat Detail
                                                        <ChevronRight />
                                                    </Link>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
