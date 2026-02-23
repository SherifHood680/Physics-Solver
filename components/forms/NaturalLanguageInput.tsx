"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";

interface NaturalLanguageInputProps {
    onParse: (interpretation: any) => void;
}

export function NaturalLanguageInput({ onParse }: NaturalLanguageInputProps) {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleParse = async () => {
        if (!text.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/parse-nl", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ problemText: text }),
            });

            const data = await response.json();

            if (!response.ok) {
                const message = data.details ? `${data.error}: ${data.details}` : (data.error || "Failed to parse problem");
                throw new Error(message);
            }

            onParse(data.interpretation);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Problem Parser
                </CardTitle>
                <CardDescription>
                    Describe your physics problem in plain English.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    placeholder="Example: A car accelerates from rest at 3 m/s² for 5 seconds. What is its final velocity?"
                    className="min-h-[120px] resize-none"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button
                    onClick={handleParse}
                    disabled={loading || !text.trim()}
                    className="w-full"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Parsing Problem...
                        </>
                    ) : (
                        "Parse with AI"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
