import { WhatsAppButton } from '@/components/whatsapp-button';

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
            <WhatsAppButton />
        </>
    );
}
