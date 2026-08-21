import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Props = {
    id?: string;
    value: string;
    onValueChange: (value: string) => void;
    className?: string;
};

const HOURS = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, '0'),
);

const MINUTES = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, '0'),
);

export function DatetimeInput({
    id,
    value,
    onValueChange,
    className,
}: Props) {
    const [date = '', time = ''] = String(value).split('T');
    const [hour = '', minute = ''] = time.split(':');

    function update(nextDate: string, nextHour: string, nextMinute: string) {
        onValueChange(`${nextDate}T${nextHour}:${nextMinute}`);
    }

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <Input
                id={id}
                type="date"
                value={date}
                onChange={(e) => update(e.target.value, hour, minute)}
            />
            <div className="flex items-center gap-1">
                <Select
                    value={hour}
                    onValueChange={(v) => update(date, v, minute)}
                >
                    <SelectTrigger
                        aria-label="Jam"
                        className="w-20"
                    >
                        <SelectValue placeholder="--" />
                    </SelectTrigger>
                    <SelectContent>
                        {HOURS.map((h) => (
                            <SelectItem key={h} value={h}>
                                {h}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">:</span>
                <Select
                    value={minute}
                    onValueChange={(v) => update(date, hour, v)}
                >
                    <SelectTrigger
                        aria-label="Menit"
                        className="w-20"
                    >
                        <SelectValue placeholder="--" />
                    </SelectTrigger>
                    <SelectContent>
                        {MINUTES.map((m) => (
                            <SelectItem key={m} value={m}>
                                {m}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
