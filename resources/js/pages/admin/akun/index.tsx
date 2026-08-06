import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, ShieldCheck, Trash2, UserRoundCog } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
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
import { Spinner } from '@/components/ui/spinner';
import admin from '@/routes/admin';
import { destroy, store, update } from '@/routes/admin/akun';

type AkunUser = {
    id: number;
    name: string;
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
        name: '',
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
                <Button>
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
                        <Label htmlFor="name">Nama</Label>
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            placeholder="Nama lengkap"
                            required
                        />
                        <InputError message={form.errors.name} />
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
                        <InputError message={form.errors.password_confirmation} />
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
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
    });

    function openForEdit() {
        form.setData({
            name: user.name,
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
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Edit" onClick={openForEdit}>
                    <Pencil />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Akun Admin</DialogTitle>
                    <DialogDescription>
                        Perbarui data akun "{user.name}". Kosongkan kata sandi
                        jika tidak ingin mengubahnya.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor={`name-${user.id}`}>Nama</Label>
                        <Input
                            id={`name-${user.id}`}
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            required
                        />
                        <InputError message={form.errors.name} />
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

export default function AkunIndex({ users, currentUserId }: Props) {
    function remove(user: AkunUser) {
        if (confirm(`Hapus akun admin "${user.name}"?`)) {
            router.delete(destroy(user.id), { preserveScroll: true });
        }
    }

    return (
        <>
            <Head title="Akun Admin" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-lg font-semibold">Akun Admin</h1>
                        <p className="text-sm text-muted-foreground">
                            Akun tidak bisa didaftarkan sendiri; buat akun baru
                            melalui halaman ini.
                        </p>
                    </div>
                    <CreateAkunDialog />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserRoundCog className="size-4 text-muted-foreground" />
                            Daftar Akun
                        </CardTitle>
                        <CardDescription>
                            {users.length} akun admin terdaftar.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                                        <th className="px-4 py-3 font-medium">
                                            Nama
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Dibuat
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {user.name}
                                                    </span>
                                                    {user.id ===
                                                        currentUserId && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-[10px]"
                                                        >
                                                            Anda
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {user.email}
                                            </td>
                                            <td className="px-4 py-3">
                                                {user.verified ? (
                                                    <Badge
                                                        variant="secondary"
                                                        className="gap-1"
                                                    >
                                                        <ShieldCheck className="size-3" />
                                                        Terverifikasi
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="gap-1"
                                                    >
                                                        Belum verifikasi
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                                {user.created_at}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1">
                                                    <EditAkunDialog
                                                        user={user}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Hapus"
                                                        onClick={() =>
                                                            remove(user)
                                                        }
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
