import type { ReactNode } from 'react';
import { parseNoteSegments } from '@/lib/notes';

type Props = {
    text: string;
};

/**
 * Merender teks catatan dengan URL yang dapat diklik.
 * Aman: tidak memakai dangerouslySetInnerHTML dan hanya http/https yang
 * menjadi link; teks lainnya dirender sebagai teks biasa oleh React.
 */
export default function NoteText({ text }: Props) {
    const nodes: ReactNode[] = [];

    for (const segment of parseNoteSegments(text)) {
        if (segment.type === 'link') {
            nodes.push(
                <a
                    key={segment.url}
                    href={segment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-4"
                >
                    {segment.label}
                </a>,
            );
        } else {
            nodes.push(segment.text);
        }
    }

    return <>{nodes}</>;
}
