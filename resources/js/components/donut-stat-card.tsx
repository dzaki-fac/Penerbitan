import { Label, Pie, PieChart } from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

export type LegendItem = {
    label: string;
    value: number;
    dot: string;
    icon: React.ComponentType<{ className?: string }>;
};

export function DonutStatCard({
    title,
    description,
    config,
    data,
    centerValue,
    centerLabel,
    legend,
}: {
    title: string;
    description: string;
    config: ChartConfig;
    data: Array<{ key: string; value: number; fill: string }>;
    centerValue: number;
    centerLabel: string;
    legend: LegendItem[];
}) {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col items-center gap-5 lg:flex-row lg:items-center lg:justify-center lg:gap-10">
                <ChartContainer
                    config={config}
                    className="mx-auto shrink-0"
                    style={{ width: 220, height: 220 }}
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="key"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (
                                        viewBox &&
                                        'cx' in viewBox &&
                                        'cy' in viewBox
                                    ) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {centerValue.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    {centerLabel}
                                                </tspan>
                                            </text>
                                        );
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
                <div className="grid w-full gap-3 lg:w-64 lg:shrink-0">
                    {legend.map((item) => (
                        <div
                            key={item.label}
                            className="flex items-center gap-3 rounded-md border p-3"
                        >
                            <span
                                className="size-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: item.dot }}
                                aria-hidden
                            />
                            <item.icon className="size-5 shrink-0 text-muted-foreground" />
                            <div>
                                <p className="text-lg leading-tight font-bold tabular-nums">
                                    {item.value}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {item.label}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
