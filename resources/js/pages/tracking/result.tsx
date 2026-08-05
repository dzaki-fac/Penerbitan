import { Head, Link } from '@inertiajs/react';
import { BookOpen, CalendarDays, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { detail, search } from '@/routes/tracking';
import type { AuthorCard, NaskahCard } from '@/types';

type Props = {
    author: AuthorCard;
    naskahs: NaskahCard[];
};

export default function TrackingResult({ author, naskahs }: Props) {
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
                            <Link href={search()}>Telusuri kembali</Link>
                        </Button>
                    </div>
                </div>

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
                                        Belum ada naskah yang terdaftar untuk penulis ini.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {naskahs.map((naskah) => (
                                    <Card key={naskah.id} className="gap-4 border-border">
                                        <CardHeader className="gap-2">
                                            <div className="flex items-start justify-between gap-3">
                                                <CardTitle className="text-base leading-snug">
                                                    {naskah.judul}
                                                </CardTitle>
                                                <Badge variant="secondary" className="shrink-0">
                                                    {naskah.status.label}
                                                </Badge>
                                            </div>
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
                                                        style={{ width: `${naskah.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <CalendarDays className="size-4" />
                                                Pengajuan: {naskah.tanggal_pengajuan}
                                            </div>
                                            <Button asChild className="w-full">
                                                <Link href={detail(naskah.id)}>
                                                    Lihat Detail
                                                    <ChevronRight />
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
