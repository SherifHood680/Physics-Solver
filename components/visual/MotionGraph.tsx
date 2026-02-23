"use client";

import { useEffect, useRef, useState } from 'react';

interface MotionGraphProps {
    data: {
        x0?: number;
        v0?: number;
        a?: number;
        t?: number;
    };
    type: 'kinematics' | 'waves';
}

export function MotionGraph({ data, type }: MotionGraphProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [graphType, setGraphType] = useState<'x' | 'v' | 'a'>('x');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;
        const graphWidth = width - padding * 2;
        const graphHeight = height - padding * 2;

        // Generate points
        const points: { t: number, val: number }[] = [];
        const numPoints = 100;

        if (type === 'waves') {
            const f = (data as any).f ?? 1;
            const A = (data as any).A ?? 1;
            const lambda = (data as any).lambda ?? 1;

            for (let i = 0; i <= numPoints; i++) {
                const x = (i / numPoints) * 5; // Horizontal axis as space (m)
                const val = A * Math.sin((2 * Math.PI / (lambda || 1)) * x);
                points.push({ t: x, val });
            }
        } else {
            const x0 = data.x0 ?? 0;
            const v0 = data.v0 ?? 0;
            const a = data.a ?? 0;
            const tMax = data.t ?? 10;

            for (let i = 0; i <= numPoints; i++) {
                const t = (i / numPoints) * tMax;
                let val = 0;
                if (graphType === 'x') {
                    val = x0 + v0 * t + 0.5 * a * t * t;
                } else if (graphType === 'v') {
                    val = v0 + a * t;
                } else if (graphType === 'a') {
                    val = a;
                }
                points.push({ t, val });
            }
        }

        // Scaling
        const tMaxScale = type === 'waves' ? 5 : (data.t ?? 10);
        const maxVal = Math.max(...points.map(p => Math.abs(p.val)), 1);
        const minVal = Math.min(...points.map(p => p.val), 0);
        const yRange = maxVal - minVal;

        const scaleX = graphWidth / tMaxScale;
        const scaleY = graphHeight / (yRange || 1);

        // Draw Axes
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // X-axis
        const xAxisY = height - padding - (0 - minVal) * scaleY;
        ctx.moveTo(padding, xAxisY);
        ctx.lineTo(width - padding, xAxisY);
        // Y-axis
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.stroke();

        // Draw Curve
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        points.forEach((p, i) => {
            const px = padding + p.t * scaleX;
            const py = height - padding - (p.val - minVal) * scaleY;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        });
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(type === 'waves' ? 'Distance (m)' : 'Time (s)', width / 2, height - 10);

        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        const label = graphType === 'x' ? 'Position (m)' : graphType === 'v' ? 'Velocity (m/s)' : 'Accel (m/s²)';
        ctx.fillText(label, 0, 0);
        ctx.restore();

    }, [data, graphType]);

    return (
        <div className="bg-background border rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Motion Graph</span>
                <div className="flex bg-muted p-1 rounded-lg">
                    {(['x', 'v', 'a'] as const).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setGraphType(mode)}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${graphType === mode ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {mode.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>
            <canvas
                ref={canvasRef}
                width={400}
                height={250}
                className="w-full h-auto"
            />
        </div>
    );
}
