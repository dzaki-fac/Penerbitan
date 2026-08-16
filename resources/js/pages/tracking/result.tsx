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

function CoverThumbnail({ src, title }: { src?: string | null; title: string }) {
    const [broken, setBroken] = useState(false);

    if (!src || broken) {
        return (
            <div className="flex h-24 items-center justify-center gap-1.5 border-b border-border bg-muted text-[11px] text-muted-foreground sm:h-40 sm:gap-2 sm:text-sm">
                <ImageIcon className="size-4 sm:size-5" />
                Cover tidak tersedia
            </div>
        );
    }

    return (
        <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="block border-b border-border"
        >
            <img
                src={src}
                alt={title}
                onError={() => setBroken(true)}
                className="h-24 w-full bg-muted object-cover sm:h-40"
            />
        </a>
    );
}

export default function TrackingResult({ author, naskahs }: Props) {
    const perluTindakan = naskahs.filter((n) =>
        needsAuthorAction(n.status.value),
    );

    return (
        <>
            <Head title="Hasil Pencarian">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,600&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="space-y-5 sm:space-y-6">
                <div className="rounded-xl border border-[#1B3A6B]/25 bg-card p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Penulis Teridentifikasi
                            </p>
                            <div className="flex items-center gap-3.5">
                                <div
                                    className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#1B3A6B]/15 text-lg font-semibold text-[#1B3A6B] sm:size-14 sm:text-xl"
                                    style={{ fontFamily: "'Source Serif 4', serif" }}
                                >
                                    {author.nama
                                        .split(' ')
                                        .filter(Boolean)
                                        .slice(0, 2)
                                        .map((w) => w[0])
                                        .join('')
                                        .toUpperCase()}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h1
                                        className="text-xl font-semibold leading-tight tracking-[0.008em] sm:text-2xl"
                                        style={{ fontFamily: "'Source Serif 4', serif" }}
                                    >
                                        {author.nama}
                                    </h1>
                                    <span className="text-sm font-medium text-[#1B3A6B]">
                                        {author.jenis_identitas}: {author.nomor_identitas}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="border-[#1B3A6B]/30 text-[#1B3A6B] hover:border-[#1B3A6B] hover:bg-[#1B3A6B] hover:text-white"
                        >
                            <Link href={tracking()}>Telusuri kembali</Link>
                        </Button>
                    </div>
                </div>

                {perluTindakan.length > 0 && (
                    <div className="flex items-start gap-3 rounded-xl border border-[#1B3A6B]/25 bg-[#1B3A6B]/5 p-4">
                        <AlertCircle className="mt-0.5 size-5 shrink-0 text-[#1B3A6B]" />
                        <p className="text-sm text-foreground">
                            Ada{' '}
                            <span className="font-semibold text-[#1B3A6B]">
                                {perluTindakan.length}
                            </span>{' '}
                            naskah yang menunggu tindakan Anda.
                        </p>
                    </div>
                )}

                <div className="rounded-xl bg-slate-50 px-4 py-8 sm:px-6 sm:py-10">
                    <div className="space-y-4">
                        <h2
                            className="text-lg font-semibold tracking-[0.008em] sm:text-xl"
                            style={{ fontFamily: "'Source Serif 4', serif" }}
                        >
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
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                                {naskahs.map((naskah) => {
                                    const perluAksi = needsAuthorAction(
                                        naskah.status.value,
                                    );

                                    return (
                                        <Card
                                            key={naskah.id}
                                            className={`flex h-full flex-col gap-2 py-0 sm:gap-4 sm:py-6 ${statusBorderClass()}`}
                                        >
                                            <CoverThumbnail
                                                src={naskah.link_cover}
                                                title={naskah.judul}
                                            />
                                            <CardHeader className="gap-1.5 px-3 pt-3 sm:gap-2 sm:px-6 sm:pt-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <CardTitle className="text-xs leading-snug sm:text-base">
                                                        {naskah.judul}
                                                    </CardTitle>
                                                    <Badge
                                                        className={`hidden shrink-0 sm:inline-flex ${statusBadgeClass()}`}
                                                    >
                                                        {naskah.status.label}
                                                    </Badge>
                                                </div>
                                                {perluAksi && (
                                                    <p className="flex items-center gap-1 text-[10px] font-medium text-[#1B3A6B] sm:text-xs">
                                                        <AlertCircle className="size-3 sm:size-3.5" />
                                                        Perlu tindakan
                                                    </p>
                                                )}
                                            </CardHeader>
                                            <CardContent className="flex flex-1 flex-col justify-between gap-2.5 px-3 pb-3 sm:gap-4 sm:px-6 sm:pb-6">
                                                <div className="space-y-1.5 sm:space-y-2">
                                                    <div className="flex items-center justify-between text-[11px] sm:text-sm">
                                                        <span className="text-muted-foreground">
                                                            Progress
                                                        </span>
                                                        <span className="font-medium">
                                                            {naskah.progress}%
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60 sm:h-2">
                                                        <div
                                                            className="h-full rounded-full bg-[#1B3A6B] transition-all"
                                                            style={{
                                                                width: `${naskah.progress}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground sm:gap-2 sm:text-sm">
                                                        <CalendarDays className="size-3 sm:size-4" />
                                                        {naskah.tanggal_pengajuan}
                                                    </div>
                                                </div>
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    className="w-full border border-[#1B3A6B]/30 bg-white text-xs text-[#1B3A6B] shadow-none hover:border-[#1B3A6B] hover:bg-[#1B3A6B] hover:text-white active:border-[#1B3A6B] active:bg-[#1B3A6B] active:text-white sm:text-sm"
                                                >
                                                    <Link
                                                        href={detail(naskah.id)}
                                                    >
                                                        Detail
                                                        <ChevronRight size={14} />
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