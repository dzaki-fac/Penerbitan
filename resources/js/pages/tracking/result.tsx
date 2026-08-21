import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    BookOpen,
    CalendarDays,
    ChevronRight,
    Image as ImageIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    needsAuthorAction,
    progressBarClass,
    statusBadgeClass,
    statusBorderClass,
} from '@/lib/status';
import { tracking } from '@/routes';
import { detail } from '@/routes/tracking';
import type { AuthorCard, NaskahCard } from '@/types';

type Props = {
    author: AuthorCard;
    naskahs: NaskahCard[];
};

function CoverThumbnail({
    src,
    title,
}: {
    src?: string | null;
    title: string;
}) {
    const [broken, setBroken] = useState(false);

    if (!src) {
        return (
            <div className="flex aspect-[15.5/23] w-full shrink-0 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-muted px-3 text-center text-sm text-muted-foreground sm:w-40">
                <BookOpen className="size-6" />
                Belum ada cover
            </div>
        );
    }

    return (
        <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="block w-full shrink-0 overflow-hidden rounded-lg border border-border sm:w-40"
        >
            {broken ? (
                <div className="flex aspect-[15.5/23] w-full items-center justify-center gap-2 bg-muted text-sm text-muted-foreground">
                    <ImageIcon className="size-5" />
                    Buka Cover
                </div>
            ) : (
                <img
                    src={src}
                    alt={title}
                    onError={() => setBroken(true)}
                    className="aspect-[15.5/23] w-full bg-muted object-cover"
                />
            )}
        </a>
    );
}

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
                        <p className="text-sm text-amber-900">
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
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-1 sm:gap-4">
                                {naskahs.map((naskah) => {
                                    const perluAksi = needsAuthorAction(
                                        naskah.status.value,
                                    );

                                    return (
                                        <Card
                                            key={naskah.id}
                                            className={`flex h-full flex-col gap-2 p-3 sm:gap-4 sm:p-4 sm:flex-row sm:items-center ${statusBorderClass(naskah.status.value)}`}
                                        >
                                            <CoverThumbnail
                                                src={naskah.link_cover}
                                                title={naskah.judul}
                                            />
                                            <div className="flex min-w-0 flex-1 flex-col justify-between gap-2.5 sm:gap-4">
                                                <CardHeader className="gap-1.5 px-0 sm:gap-2">
                                                    <CardTitle className="text-xs leading-snug sm:text-base">
                                                        {naskah.judul}
                                                    </CardTitle>
                                                    <Badge
                                                        className={`h-auto w-fit max-w-full text-left whitespace-normal text-[10px] sm:text-xs ${statusBadgeClass(naskah.status.value)}`}
                                                    >
                                                        {naskah.status.label}
                                                    </Badge>
                                                    <div className="min-h-[26px] sm:min-h-[30px]">
                                                        {perluAksi && (
                                                            <p className="flex w-fit items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-800 sm:text-xs">
                                                                <AlertCircle className="size-3.5 shrink-0" />
                                                                Perlu tindakan Anda
                                                            </p>
                                                        )}
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="flex flex-1 flex-col justify-between gap-2.5 px-0 sm:gap-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-[11px] sm:text-sm">
                                                            <span className="text-muted-foreground">
                                                                Progress
                                                            </span>
                                                            <span className="font-medium">
                                                                {
                                                                    naskah.progress
                                                                }
                                                                %
                                                            </span>
                                                        </div>
                                                        <div className="h-2 w-full overflow-hidden rounded-full bg-border/60">
                                                            <div
                                                                className={`h-full rounded-full transition-all ${progressBarClass(naskah.progress)}`}
                                                                style={{
                                                                    width: `${naskah.progress}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground sm:gap-2 sm:text-sm">
                                                        <CalendarDays className="size-4" />
                                                        Pengajuan:{' '}
                                                        {
                                                            naskah.tanggal_pengajuan
                                                        }
                                                    </div>
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        className="w-full gap-1 whitespace-nowrap text-xs sm:w-fit sm:self-end sm:text-sm"
                                                    >
                                                        <Link
                                                            href={detail(
                                                                naskah.id,
                                                            )}
                                                        >
                                                            Lihat Detail
                                                            <ChevronRight className="size-3.5 shrink-0" />
                                                        </Link>
                                                    </Button>
                                                </CardContent>
                                            </div>
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