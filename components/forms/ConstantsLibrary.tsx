"use client";

import { PHYSICAL_CONSTANTS, PhysicalConstant } from "@/lib/physics/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Copy, Info } from "lucide-react";
import { toast } from "sonner";

interface ConstantsLibraryProps {
    onSelectConstant?: (constant: PhysicalConstant) => void;
}

export function ConstantsLibrary({ onSelectConstant }: ConstantsLibraryProps) {
    const injectConstant = (constant: PhysicalConstant) => {
        const event = new CustomEvent('tidal:inject-value', {
            detail: { symbol: constant.symbol, value: constant.value }
        });
        window.dispatchEvent(event);
        toast.success(`Injected ${constant.name} (${constant.symbol})`);
    };

    const copyValue = (constant: PhysicalConstant) => {
        navigator.clipboard.writeText(constant.value.toString());
        toast.success(`Copied ${constant.name} value to clipboard`);
    };

    return (
        <Card className="h-fit">
            <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2 text-primary font-bold">
                    Constants Library
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-2">
                    <TooltipProvider delayDuration={200}>
                        {PHYSICAL_CONSTANTS.map((constant) => (
                            <div
                                key={constant.symbol}
                                className="group flex items-center justify-between p-2 rounded-md border bg-card hover:bg-accent transition-all cursor-pointer"
                                onClick={() => injectConstant(constant)}
                            >
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-primary">{constant.symbol}</span>
                                        <span className="text-sm font-medium line-clamp-1">{constant.name}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground font-mono">
                                        {constant.value.toExponential(4)} {constant.unit}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="p-1 hover:text-primary transition-colors">
                                                <Info className="h-4 w-4" />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[200px]" side="left">
                                            <p>{constant.description}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <div
                                        className="p-1 hover:text-primary transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyValue(constant);
                                        }}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </TooltipProvider>
                </div>
            </CardContent>
        </Card>
    );
}
