import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowUpDown,
    ChevronDown,
    ChevronUp,
    Pencil,
    Plus,
    Search,
    ShieldCheck,
    Trash2,
    UserRoundCog,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useInitials } from '@/hooks/use-initials';
import admin from '@/routes/admin';
import { destroy, store, update } from '@/routes/admin/akun';

type AkunUser = {
    id: number;
    nama_lengkap: string;
    nickname: string;
    email: string;
    verified: boolean;
    created_at: string;
};

type Props = {
    users: AkunUser[];
    currentUserId: number;
};

function CreateAkunDialog() {
    const [open, setOpen] = useState(false);
    const form = useForm({
        nama_lengkap: '',
        nickname: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(store().url, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setOpen(false);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus />
                    Tambah Akun
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tambah Akun Admin</DialogTitle>
                    <DialogDescription>
                        Akun baru langsung terverifikasi dan dapat login
                        menggunakan email serta kata sandi ini.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
                        <Input
                            id="nama_lengkap"
                            value={form.data.nama_lengkap}
                            onChange={(e) =>
                                form.setData('nama_lengkap', e.target.value)
                            }
                            placeholder="Nama lengkap"
                            required
                        />
                        <InputError message={form.errors.nama_lengkap} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="nickname">
                            Nama Panggilan/Singkatan
                        </Label>
                        <Input
                            id="nickname"
                            value={form.data.nickname}
                            onChange={(e) =>
                                form.setData('nickname', e.target.value)
                            }
                            placeholder="Contoh: Budi / BS"
                            required
                        />
                        <InputError message={form.errors.nickname} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={form.data.email}
                            onChange={(e) =>
                                form.setData('email', e.target.value)
                            }
                            placeholder="email@example.com"
                            required
                        />
                        <InputError message={form.errors.email} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Kata Sandi</Label>
                        <Input
                            id="password"
                            type="password"
                            value={form.data.password}
                            onChange={(e) =>
                                form.setData('password', e.target.value)
                            }
                            placeholder="Minimal 8 karakter"
                            required
                        />
                        <InputError message={form.errors.password} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Konfirmasi Kata Sandi
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={form.data.password_confirmation}
                            onChange={(e) =>
                                form.setData(
                                    'password_confirmation',
                                    e.target.value,
                                )
                            }
                            placeholder="Ulangi kata sandi"
                            required
                        />
                        <InputError
                            message={form.errors.password_confirmation}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Spinner />}
                            Simpan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditAkunDialog({ user }: { user: AkunUser }) {
    const [open, setOpen] = useState(false);
    const form = useForm({
        nama_lengkap: user.nama_lengkap,
        nickname: user.nickname,
        email: user.email,
        password: '',
        password_confirmation: '',
    });

    function openForEdit() {
        form.setData({
            nama_lengkap: user.nama_lengkap,
            nickname: user.nickname,
            email: user.email,
            password: '',
            password_confirmation: '',
        });
        setOpen(true);
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.patch(update(user.id).url, {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={openForEdit}
                        >
                            <Pencil />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Akun Admin</DialogTitle>
                    <DialogDescription>
                        Perbarui data akun "{user.nama_lengkap}". Kosongkan kata
                        sandi jika tidak ingin mengubahnya.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor={`nama_lengkap-${user.id}`}>
                            Nama Lengkap
                        </Label>
                        <Input
                            id={`nama_lengkap-${user.id}`}
                            value={form.data.nama_lengkap}
                            onChange={(e) =>
                                form.setData('nama_lengkap', e.target.value)
                            }
                            required
                        />
                        <InputError message={form.errors.nama_lengkap} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`nickname-${user.id}`}>
                            Nama Panggilan/Singkatan
                        </Label>
                        <Input
                            id={`nickname-${user.id}`}
                            value={form.data.nickname}
                            onChange={(e) =>
                                form.setData('nickname', e.target.value)
                            }
                            placeholder="Contoh: Budi / BS"
                            required
                        />
                        <InputError message={form.errors.nickname} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`email-${user.id}`}>Email</Label>
                        <Input
                            id={`email-${user.id}`}
                            type="email"
                            value={form.data.email}
                            onChange={(e) =>
                                form.setData('email', e.target.value)
                            }
                            required
                        />
                        <InputError message={form.errors.email} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`password-${user.id}`}>
                            Kata Sandi Baru
                        </Label>
                        <Input
                            id={`password-${user.id}`}
                            type="password"
                            value={form.data.password}
                            onChange={(e) =>
                                form.setData('password', e.target.value)
                            }
                            placeholder="Kosongkan jika tidak diubah"
                            autoComplete="new-password"
                        />
                        <InputError message={form.errors.password} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`password_confirmation-${user.id}`}>
                            Konfirmasi Kata Sandi
                        </Label>
                        <Input
                            id={`password_confirmation-${user.id}`}
                            type="password"
                            value={form.data.password_confirmation}
                            onChange={(e) =>
                                form.setData(
                                    'password_confirmation',
                                    e.target.value,
                                )
                            }
                            placeholder="Ulangi kata sandi baru"
                            autoComplete="new-password"
                        />
                        <InputError
                            message={form.errors.password_confirmation}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Spinner />}
                            Simpan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DeleteAkunDialog({
    user,
    disabled,
    disabledReason,
}: {
    user: AkunUser;
    disabled: boolean;
    disabledReason: string;
}) {
    const [open, setOpen] = useState(false);

    function onDelete() {
        router.delete(destroy(user.id), { preserveScroll: true });
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="inline-flex">
                    <AlertDialog open={open} onOpenChange={setOpen}>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={disabled}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Hapus akun ini?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Akun "{user.nama_lengkap}" ({user.email})
                                    akan dihapus permanen dari daftar. Tindakan
                                    ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={onDelete}
                                    className="bg-destructive text-white hover:bg-destructive/90"
                                >
                                    Hapus
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </span>
            </TooltipTrigger>
            <TooltipContent>
                {disabled ? disabledReason : 'Hapus'}
            </TooltipContent>
        </Tooltip>
    );
}

function StatusBadge({ verified }: { verified: boolean }) {
    if (verified) {
        return (
            <Badge variant="secondary" className="gap-1">
                <ShieldCheck className="size-3" />
                Terverifikasi
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className="gap-1">
            Belum verifikasi
        </Badge>
    );
}

type SortKey = 'name' | 'created_at';

function SortableTh({
    label,
    sortKey,
    activeKey,
    sortDir,
    onToggle,
    className,
}: {
    label: string;
    sortKey: SortKey;
    activeKey: SortKey | null;
    sortDir: 'asc' | 'desc';
    onToggle: (key: SortKey) => void;
    className?: string;
}) {
    const active = activeKey === sortKey;

    return (
        <th className={className}>
            <button
                type="button"
                onClick={() => onToggle(sortKey)}
                className={`inline-flex cursor-pointer items-center gap-1 font-medium transition-colors ${
                    active
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                }`}
            >
                {label}
                {active ? (
                    sortDir === 'asc' ? (
                        <ChevronUp className="size-3.5" />
                    ) : (
                        <ChevronDown className="size-3.5" />
                    )
                ) : (
                    <ArrowUpDown className="size-3.5 opacity-40" />
                )}
            </button>
        </th>
    );
}

export default function AkunIndex({ users, currentUserId }: Props) {
    const getInitials = useInitials();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [sortKey, setSortKey] = useState<SortKey | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const visibleUsers = useMemo(() => {
        const query = search.trim().toLowerCase();

        let result = users.filter((user) => {
            const matchesSearch =
                !query ||
                user.nama_lengkap.toLowerCase().startsWith(query) ||
                user.email.toLowerCase().startsWith(query);
            const matchesStatus =
                status === 'all' ||
                (status === 'verified' ? user.verified : !user.verified);

            return matchesSearch && matchesStatus;
        });

        if (sortKey) {
            result = [...result].sort((a, b) => {
                let comparison = 0;

                if (sortKey === 'name') {
                    comparison = a.nama_lengkap.localeCompare(b.nama_lengkap);
                } else {
                    comparison =
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime();
                }

                return sortDir === 'asc' ? comparison : -comparison;
            });
        }

        return result;
    }, [users, search, status, sortKey, sortDir]);

    function toggleSort(key: SortKey) {
        if (sortKey === key) {
            setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    }

    function resetFilters() {
        setSearch('');
        setStatus('all');
    }

    return (
        <>
            <Head title="Akun Admin" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-3">
                            <h1 className="text-lg leading-none font-semibold">
                                Akun Admin
                            </h1>
                            <CreateAkunDialog />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Akun tidak bisa didaftarkan sendiri, buat akun baru
                            melalui halaman ini.
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter</CardTitle>
                        <CardDescription>
                            {visibleUsers.length} dari {users.length} akun
                            ditampilkan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                            <div className="grid min-w-56 flex-1 gap-2">
                                <Label htmlFor="search">Cari</Label>
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder="Nama atau email..."
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="grid min-w-40 gap-2">
                                <Label>Status</Label>
                                <Select
                                    value={status}
                                    onValueChange={setStatus}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua
                                        </SelectItem>
                                        <SelectItem value="verified">
                                            Terverifikasi
                                        </SelectItem>
                                        <SelectItem value="unverified">
                                            Belum verifikasi
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                variant="ghost"
                                onClick={resetFilters}
                                disabled={!search && status === 'all'}
                                className="self-start sm:self-auto"
                            >
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="gap-1">
                    <CardHeader>
                        <div className="flex items-center justify-between gap-2">
                            <CardTitle className="flex items-center gap-2">
                                <UserRoundCog className="size-4 text-muted-foreground" />
                                Daftar Akun
                                <Badge variant="secondary">
                                    {users.length}
                                </Badge>
                            </CardTitle>
                            <Select
                                value={sortKey ?? undefined}
                                onValueChange={(value) =>
                                    toggleSort(value as SortKey)
                                }
                            >
                                <SelectTrigger
                                    size="sm"
                                    className="w-28 text-xs sm:hidden"
                                >
                                    <SelectValue placeholder="Urutkan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">Nama</SelectItem>
                                    <SelectItem value="created_at">
                                        Tanggal
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <CardDescription>
                            {users.length} akun admin terdaftar.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="hidden overflow-x-auto sm:block">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                                        <SortableTh
                                            label="Nama"
                                            sortKey="name"
                                            activeKey={sortKey}
                                            sortDir={sortDir}
                                            onToggle={toggleSort}
                                            className="px-4 py-3 font-medium"
                                        />
                                        <th className="px-4 py-3 font-medium">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Status
                                        </th>
                                        <SortableTh
                                            label="Dibuat"
                                            sortKey="created_at"
                                            activeKey={sortKey}
                                            sortDir={sortDir}
                                            onToggle={toggleSort}
                                            className="px-4 py-3 font-medium"
                                        />
                                        <th className="px-4 py-3 text-right font-medium">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleUsers.map((user) => {
                                        const isCurrentUser =
                                            user.id === currentUserId;
                                        const isLastAccount =
                                            users.length === 1;
                                        const canDelete =
                                            !isCurrentUser && !isLastAccount;
                                        const deleteDisabledReason =
                                            isCurrentUser
                                                ? 'Akun yang sedang login tidak dapat dihapus.'
                                                : 'Akun terakhir tidak dapat dihapus.';

                                        return (
                                            <tr
                                                key={user.id}
                                                className="border-b transition-colors duration-150 last:border-0 hover:bg-muted/70"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="size-8 rounded-full">
                                                            <AvatarFallback className="rounded-full bg-primary/10 text-foreground">
                                                                {getInitials(
                                                                    user.nama_lengkap,
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">
                                                                    {
                                                                        user.nama_lengkap
                                                                    }
                                                                </span>
                                                                {isCurrentUser && (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="text-[10px]"
                                                                    >
                                                                        Anda
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="truncate text-xs text-muted-foreground">
                                                                {user.nickname}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {user.email}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge
                                                        verified={user.verified}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                                    {user.created_at}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-1">
                                                        <EditAkunDialog
                                                            user={user}
                                                        />
                                                        <DeleteAkunDialog
                                                            user={user}
                                                            disabled={
                                                                !canDelete
                                                            }
                                                            disabledReason={
                                                                deleteDisabledReason
                                                            }
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {visibleUsers.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-4 py-10 text-center text-muted-foreground"
                                            >
                                                Tidak ada akun ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="block space-y-3 p-4 sm:hidden">
                            {visibleUsers.map((user) => {
                                const isCurrentUser = user.id === currentUserId;
                                const isLastAccount = users.length === 1;
                                const canDelete =
                                    !isCurrentUser && !isLastAccount;
                                const deleteDisabledReason = isCurrentUser
                                    ? 'Akun yang sedang login tidak dapat dihapus.'
                                    : 'Akun terakhir tidak dapat dihapus.';

                                return (
                                    <div
                                        key={user.id}
                                        className="rounded-lg border p-4"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <Avatar className="size-8 rounded-full">
                                                    <AvatarFallback className="rounded-full bg-primary/10 text-foreground">
                                                        {getInitials(
                                                            user.nama_lengkap,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <span className="truncate font-medium">
                                                            {user.nama_lengkap}
                                                        </span>
                                                        {isCurrentUser && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-[10px]"
                                                            >
                                                                Anda
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {user.nickname}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 gap-1">
                                                <EditAkunDialog user={user} />
                                                <DeleteAkunDialog
                                                    user={user}
                                                    disabled={!canDelete}
                                                    disabledReason={
                                                        deleteDisabledReason
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <p className="mt-2 text-sm break-words text-muted-foreground">
                                            {user.email}
                                        </p>
                                        <div className="mt-2 flex items-center justify-between gap-2">
                                            <StatusBadge
                                                verified={user.verified}
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                {user.created_at}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            {visibleUsers.length === 0 && (
                                <div className="py-10 text-center text-muted-foreground">
                                    Tidak ada akun ditemukan.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AkunIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: admin.dashboard(),
        },
        {
            title: 'Akun Admin',
            href: admin.akun.index(),
        },
    ],
};
