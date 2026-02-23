"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ForceDiagram } from "@/components/visual/ForceDiagram";
import { MotionGraph } from "@/components/visual/MotionGraph";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const ALL_LABELS: Record<string, string> = {
    v: "m/s", v0: "m/s", a: "m/s²", t: "s", d: "m", x: "m", x0: "m",
    F: "N", m: "kg", W: "J", mu: "μ", N: "N", f: "N",
    P: "Pa", V: "m³", n: "mol", T: "K", Q: "J", c: "J/kg·K", dT: "K", L: "J",
    tau: "N·m", I: "kg·m²", omega: "rad/s", alpha: "rad/s²", theta: "rad",
    H: "J", E: "J"
};

interface SolutionDisplayProps {
    result: number | null;
    solveFor: string;
    steps: Array<{ description: string; formula?: string; isMath?: boolean }>;
    inputValues?: Record<string, number>;
    category?: string;
    equationId?: string;
}

export function SolutionDisplay({ result, solveFor, steps, inputValues, category, equationId }: SolutionDisplayProps) {
    if (result === null) return null;

    return (
        <Card className="bg-muted/30 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Solution
                    <Badge variant="outline" className="text-primary border-primary">
                        Solved
                    </Badge>
                </CardTitle>
                <CardDescription>Step-by-step breakdown of the problem.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 bg-background rounded-lg border shadow-sm">
                    <div className="text-sm text-muted-foreground mb-1">Final Answer</div>
                    <div className="text-2xl font-bold font-mono text-primary flex items-baseline gap-2">
                        <InlineMath math={`${solveFor} = ${result.toPrecision(5)} \\text{ ${ALL_LABELS[solveFor as keyof typeof ALL_LABELS] || ''}}`} />
                    </div>
                </div>

                {/* Visualizations */}
                {(category === 'dynamics' || category === 'kinematics' || category === 'waves') && inputValues && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
                        {category === 'dynamics' && (
                            <ForceDiagram forces={inputValues} />
                        )}
                        {(category === 'kinematics' || category === 'waves') && (
                            <MotionGraph data={inputValues} type={category as any} />
                        )}
                    </div>
                )}

                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Steps</h3>
                    {steps.map((step, index) => (
                        <div key={index} className="flex gap-4">
                            <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                {index + 1}
                            </div>
                            <div className="py-1 flex-1">
                                <p className="text-sm leading-relaxed mb-1 font-medium">{step.description}</p>
                                {step.formula && (
                                    <div className="bg-background/50 p-3 rounded-lg border overflow-x-auto">
                                        {step.isMath === false ? (
                                            <p className="text-sm text-muted-foreground italic leading-relaxed">
                                                {step.formula}
                                            </p>
                                        ) : (
                                            <BlockMath math={step.formula} />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
