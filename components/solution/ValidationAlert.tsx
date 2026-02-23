"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Info, Lightbulb } from "lucide-react";

interface ValidationAlertProps {
    validation: {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        suggestions: string[];
    };
    onDismiss?: () => void;
    onFixManually?: () => void;
}

export function ValidationAlert({ validation, onDismiss, onFixManually }: ValidationAlertProps) {
    if (validation.isValid && validation.warnings.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3 mb-6">
            {/* Errors */}
            {validation.errors.length > 0 && (
                <Alert variant="destructive" className="border-2">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle className="font-bold text-base">Unable to Solve</AlertTitle>
                    <AlertDescription className="mt-2 space-y-2">
                        <ul className="list-disc list-inside space-y-1">
                            {validation.errors.map((error, idx) => (
                                <li key={idx} className="text-sm">{error}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            {/* Suggestions */}
            {validation.suggestions.length > 0 && (
                <Alert className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                    <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="font-bold text-base text-blue-900 dark:text-blue-100">
                        Suggestions
                    </AlertTitle>
                    <AlertDescription className="mt-2 space-y-2">
                        <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                            {validation.suggestions.map((suggestion, idx) => (
                                <li key={idx} className="text-sm">{suggestion}</li>
                            ))}
                        </ul>
                        {onFixManually && (
                            <Button
                                onClick={onFixManually}
                                variant="outline"
                                size="sm"
                                className="mt-3 border-blue-600 text-blue-700 hover:bg-blue-100 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-900/30"
                            >
                                Complete in Manual Form
                            </Button>
                        )}
                    </AlertDescription>
                </Alert>
            )}

            {/* Warnings */}
            {validation.warnings.length > 0 && (
                <Alert className="border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                    <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <AlertTitle className="font-bold text-base text-yellow-900 dark:text-yellow-100">
                        Warnings
                    </AlertTitle>
                    <AlertDescription className="mt-2">
                        <ul className="list-disc list-inside space-y-1 text-yellow-800 dark:text-yellow-200">
                            {validation.warnings.map((warning, idx) => (
                                <li key={idx} className="text-sm">{warning}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            {/* Success with warnings */}
            {validation.isValid && validation.warnings.length > 0 && (
                <Alert className="border-2 border-green-500 bg-green-50 dark:bg-green-950/20">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <AlertTitle className="font-bold text-base text-green-900 dark:text-green-100">
                        Solved Successfully
                    </AlertTitle>
                    <AlertDescription className="text-sm text-green-800 dark:text-green-200">
                        The problem was solved, but please review the warnings above.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
