"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KINEMATIC_EQUATIONS } from "@/lib/physics/equations/kinematics";
import { DYNAMICS_EQUATIONS } from "@/lib/physics/equations/dynamics";
import { ENERGY_EQUATIONS, ENERGY_VARIABLE_LABELS } from "@/lib/physics/equations/energy";
import { MOMENTUM_EQUATIONS, MOMENTUM_VARIABLE_LABELS } from "@/lib/physics/equations/momentum";
import { THERMO_EQUATIONS, THERMO_VARIABLE_LABELS } from "@/lib/physics/equations/thermodynamics";
import { ROTATIONAL_EQUATIONS, ROTATIONAL_VARIABLE_LABELS } from "@/lib/physics/equations/rotational";
import { WAVE_EQUATIONS, WAVE_VARIABLE_LABELS } from "@/lib/physics/equations/waves";
import { ADVANCED_EQUATIONS, ADVANCED_VARIABLE_LABELS } from "@/lib/physics/equations/advanced";
import { UNIT_TYPES, VARIABLE_TO_UNIT_TYPE, Unit } from "@/lib/physics/units";
import { useState } from "react";

const ALL_EQUATIONS = [
    ...KINEMATIC_EQUATIONS,
    ...DYNAMICS_EQUATIONS,
    ...ENERGY_EQUATIONS,
    ...MOMENTUM_EQUATIONS,
    ...THERMO_EQUATIONS,
    ...ROTATIONAL_EQUATIONS,
    ...WAVE_EQUATIONS,
    ...ADVANCED_EQUATIONS,
];

const ALL_LABELS: Record<string, string> = {
    v: "Final Velocity (m/s)",
    v0: "Initial Velocity (m/s)",
    a: "Acceleration (m/s²)",
    t: "Time (s)",
    d: "Distance (m)",
    x: "Final Position (m)",
    x0: "Initial Position (m)",
    F: "Force (N)",
    m: "Mass (kg)",
    W: "Weight/Work (N/J)",
    mu: "Coefficient of Friction (μ)",
    N: "Normal Force (N)",
    f: "Frictional Force (N)",
    ...ENERGY_VARIABLE_LABELS,
    ...MOMENTUM_VARIABLE_LABELS,
    ...THERMO_VARIABLE_LABELS,
    ...ROTATIONAL_VARIABLE_LABELS,
    ...WAVE_VARIABLE_LABELS,
    ...ADVANCED_VARIABLE_LABELS,
};
const ALL_VARIABLES = Array.from(new Set(ALL_EQUATIONS.flatMap(eq => eq.variables)));

interface DynamicFormProps {
    equationId: string;
    onSubmit: (values: Record<string, number>, solveFor: string) => void;
    initialValues?: {
        values?: Record<string, number>;
        solveFor?: string;
    } | null;
}

export function DynamicForm({ equationId, onSubmit, initialValues }: DynamicFormProps) {
    const equation = ALL_EQUATIONS.find((eq) => eq.id === equationId);

    const formSchema = z.object({
        solveFor: z.string().min(1),
        ...Object.fromEntries(
            (equation?.variables || []).map((v) => [v, z.string().optional()])
        ),
    });

    // Generate initial empty values for all variables to avoid uncontrolled warning
    const getInitialValues = () => {
        console.log("DynamicForm: getInitialValues called", { equationId, initialValues });
        const defaults: any = {
            solveFor: initialValues?.solveFor || equation?.variables[0] || "",
        };

        // Initialize EVERY possible variable as an empty string to be bulletproof
        ALL_VARIABLES.forEach(v => {
            defaults[v] = "";
        });

        // Overwrite with initial values if provided
        if (initialValues?.values) {
            console.log("DynamicForm: Mapping AI values:", initialValues.values);
            Object.entries(initialValues.values).forEach(([key, value]) => {
                if (ALL_VARIABLES.includes(key as any)) {
                    defaults[key] = value !== undefined && value !== null ? value.toString() : "";
                }
            });
        }

        console.log("DynamicForm: Final default values:", defaults);
        return defaults;
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: getInitialValues(),
    });

    const [selectedUnits, setSelectedUnits] = useState<Record<string, Unit>>(() => {
        const initialUnits: Record<string, Unit> = {};
        ALL_VARIABLES.forEach(v => {
            const type = VARIABLE_TO_UNIT_TYPE[v] || 'dimensionless';
            initialUnits[v] = UNIT_TYPES[type][0]; // Default to first (SI)
        });
        return initialUnits;
    });

    const handleUnitChange = (varName: string, unitSymbol: string) => {
        const type = VARIABLE_TO_UNIT_TYPE[varName] || 'dimensionless';
        // Handle "none" fallback for empty symbols
        const searchSymbol = unitSymbol === "none" ? "" : unitSymbol;
        const unit = UNIT_TYPES[type].find(u => u.symbol === searchSymbol);
        if (unit) {
            setSelectedUnits(prev => ({ ...prev, [varName]: unit }));
        }
    };

    const solveFor = form.watch("solveFor");

    // Important: Update form when equation or AI data changes
    useEffect(() => {
        if (equation) {
            console.log("DynamicForm: reset() triggered");
            form.reset(getInitialValues());
        }
    }, [equationId, initialValues, equation]);

    useEffect(() => {
        const handleInject = (e: CustomEvent<{ symbol: string, value: number }>) => {
            const { symbol, value } = e.detail;
            if (ALL_VARIABLES.includes(symbol)) {
                form.setValue(symbol as any, value.toString());
            }
        };

        window.addEventListener('tidal:inject-value' as any, handleInject);
        return () => window.removeEventListener('tidal:inject-value' as any, handleInject);
    }, [form]); // Added equation as dependency

    if (!equation) return <div>Select an equation to start</div>;

    const handleSubmit = (data: any) => {
        const values: Record<string, number> = {};
        equation.variables.forEach((v) => {
            if (v !== data.solveFor) {
                const rawVal = parseFloat(data[v]);
                if (!isNaN(rawVal)) {
                    // Convert to SI base unit
                    const unit = selectedUnits[v];
                    values[v] = rawVal * (unit?.factor || 1);
                }
            }
        });
        onSubmit(values, data.solveFor);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Input Values</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="solveFor"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Solve For</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value ?? ""}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select variable to solve" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {equation.variables.map((v) => (
                                                <SelectItem key={v} value={v}>
                                                    {ALL_LABELS[v] ? `${v} - ${ALL_LABELS[v]}` : v}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {equation.variables.map((v) => {
                                // Don't show input for the variable we are solving for
                                if (v === solveFor) return null;

                                return (
                                    <FormField
                                        key={v}
                                        control={form.control}
                                        name={v as any}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{ALL_LABELS[v] || v}</FormLabel>
                                                <div className="flex gap-2">
                                                    <FormControl className="flex-1">
                                                        <Input
                                                            type="number"
                                                            step="any"
                                                            placeholder="0"
                                                            {...field}
                                                            value={field.value ?? ""}
                                                            className="flex-1"
                                                        />
                                                    </FormControl>
                                                    <Select
                                                        value={selectedUnits[v]?.symbol || "none"}
                                                        onValueChange={(val) => handleUnitChange(v, val)}
                                                    >
                                                        <SelectTrigger className="w-[100px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {(UNIT_TYPES[VARIABLE_TO_UNIT_TYPE[v] || 'dimensionless']).map((unit) => (
                                                                <SelectItem key={unit.label} value={unit.symbol || "none"}>
                                                                    {unit.symbol || "none"}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                );
                            })}
                        </div>

                        <Button type="submit" className="w-full">
                            Calculate Solution
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
