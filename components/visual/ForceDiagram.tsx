"use client";

import { useEffect, useRef } from 'react';

interface ForceDiagramProps {
    forces: {
        F?: number;
        N?: number;
        f?: number;
        W?: number; // Weight
        mg?: number;
        m?: number;  // Mass (implied gravity)
        mu?: number; // Friction coeff
    };
    objectLabel?: string;
}

export function ForceDiagram({ forces, objectLabel = "Object" }: ForceDiagramProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const boxSize = 60;

        // Draw Object (Box)
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.strokeRect(centerX - boxSize / 2, centerY - boxSize / 2, boxSize, boxSize);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
        ctx.fillRect(centerX - boxSize / 2, centerY - boxSize / 2, boxSize, boxSize);

        // Object Label (below box to avoid overlap)
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(objectLabel, centerX, centerY + (boxSize / 2) + 12);

        // Helper to draw arrows
        const drawArrow = (angle: number, length: number, label: string, color: string) => {
            if (length === 0) return;

            // Normalize length for visual representation (max 100px)
            const visualLength = Math.min(Math.max(length * 5, 40), 100);

            const startX = centerX + (Math.cos(angle) * boxSize / 2);
            const startY = centerY + (Math.sin(angle) * boxSize / 2);

            const endX = startX + Math.cos(angle) * visualLength;
            const endY = startY + Math.sin(angle) * visualLength;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Arrow head
            const headSize = 10;
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(
                endX - headSize * Math.cos(angle - Math.PI / 6),
                endY - headSize * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
                endX - headSize * Math.cos(angle + Math.PI / 6),
                endY - headSize * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            // Label
            ctx.fillStyle = color;
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.fillText(label, endX + Math.cos(angle) * 15, endY + Math.sin(angle) * 15 + 5);
        };

        // Resolve Forces (Calculated Implied Forces)
        const g = 9.81;
        const m = forces.m ?? 0;
        const calcWeight = forces.W ?? forces.mg ?? (m > 0 ? m * g : 0);
        const calcNormal = forces.N ?? calcWeight; // Simplified: N = W for horizontal
        const calcFriction = forces.f ?? (forces.mu && calcNormal ? forces.mu * calcNormal : 0);

        // Draw Forces
        if (calcWeight > 0) drawArrow(Math.PI / 2, calcWeight, "W (mg)", "#ef4444"); // Down
        if (calcNormal > 0) drawArrow(-Math.PI / 2, calcNormal, "N", "#22c55e"); // Up
        if (forces.F && forces.F > 0) drawArrow(0, forces.F, "F", "#3b82f6"); // Right
        if (calcFriction > 0) drawArrow(Math.PI, calcFriction, "f", "#f59e0b"); // Left

    }, [forces, objectLabel]);

    return (
        <div className="flex flex-col items-center bg-muted/20 rounded-lg p-4 border border-dashed border-muted-foreground/30">
            <p className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Free Body Diagram</p>
            <canvas
                ref={canvasRef}
                width={300}
                height={250}
                className="max-w-full"
            />
            <p className="text-[10px] text-muted-foreground mt-2 italic">* Arrow lengths are scaled for visualization</p>
        </div>
    );
}
