import { WhatsAppButton } from '@/components/whatsapp-button';

export default function TrackingLayout({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <main className={`flex-1 ${className}`}>{children}</main>
            <WhatsAppButton />
        </div>
    );
}
