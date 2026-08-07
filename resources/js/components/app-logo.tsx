import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <>
            <img src="/assets/logo_undip.png" alt="" className="h-10 w-auto" />
            <img src="/images/logo-upt.png" alt="" className="h-10 w-auto" />
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {name}
                </span>
            </div>
        </>
    );
}
