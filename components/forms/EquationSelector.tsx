"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { KINEMATIC_EQUATIONS } from "@/lib/physics/equations/kinematics";
import { DYNAMICS_EQUATIONS } from "@/lib/physics/equations/dynamics";
import { ENERGY_EQUATIONS } from "@/lib/physics/equations/energy";
import { MOMENTUM_EQUATIONS } from "@/lib/physics/equations/momentum";
import { THERMO_EQUATIONS } from "@/lib/physics/equations/thermodynamics";
import { ROTATIONAL_EQUATIONS } from "@/lib/physics/equations/rotational";
import { WAVE_EQUATIONS } from "@/lib/physics/equations/waves";
import { ADVANCED_EQUATIONS } from "@/lib/physics/equations/advanced";
import clsx from "clsx";
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

interface EquationSelectorProps {
    onSelect: (equationId: string) => void;
    selectedId?: string;
    category: "kinematics" | "dynamics" | "energy" | "momentum" | "thermodynamics" | "rotational" | "waves" | "advanced";
}

export function EquationSelector({
    onSelect,
    selectedId,
    category,
}: EquationSelectorProps) {
    const equations =
        category === "kinematics" ? KINEMATIC_EQUATIONS :
            category === "dynamics" ? DYNAMICS_EQUATIONS :
                category === "energy" ? ENERGY_EQUATIONS :
                    category === "momentum" ? MOMENTUM_EQUATIONS :
                        category === "thermodynamics" ? THERMO_EQUATIONS :
                            category === "rotational" ? ROTATIONAL_EQUATIONS :
                                category === "waves" ? WAVE_EQUATIONS :
                                    ADVANCED_EQUATIONS;

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Select Equation</CardTitle>
                <CardDescription>
                    Choose the physics equation that matches your problem.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {equations.map((eq) => (
                    <div
                        key={eq.id}
                        onClick={() => onSelect(eq.id)}
                        className={clsx(
                            "cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted",
                            selectedId === eq.id
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "bg-card"
                        )}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{eq.name}</span>
                        </div>
                        <div className="text-center py-2 bg-background rounded border border-dashed text-primary">
                            <InlineMath math={eq.latex} />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
