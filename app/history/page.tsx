"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/db/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calculator, History as HistoryIcon, Calendar, ArrowRight, X, Trash2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SolutionDisplay } from "@/components/solution/SolutionDisplay";

export default function HistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [selectedSolution, setSelectedSolution] = useState<any>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('problems')
                .select(`
                    id,
                    problem_text,
                    problem_type,
                    input_method,
                    created_at,
                    solutions (
                        final_answer,
                        solution_steps,
                        input_values
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching history:", error);
            } else {
                setHistory(data || []);
            }
            setLoading(false);
        };

        fetchHistory();
    }, []);

    const deleteProblem = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this history item?")) return;

        setDeletingId(id);
        const { error } = await supabase.from('problems').delete().eq('id', id);

        if (error) {
            console.error("Error deleting problem:", error);
            alert("Failed to delete item.");
        } else {
            setHistory(history.filter(h => h.id !== id));
        }
        setDeletingId(null);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading your history...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
                <div className="bg-muted p-4 rounded-full">
                    <HistoryIcon className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold">Sign in to view history</h2>
                <p className="text-muted-foreground max-w-sm">
                    Your solved problems will be saved here so you can review them later.
                </p>
                <Button asChild>
                    <Link href="/login">Sign In</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Solution History</h1>
                    <p className="text-muted-foreground mt-1">
                        A record of all the physics problems you've solved.
                    </p>
                </div>
                <Badge variant="outline" className="px-3 py-1 text-sm">
                    {history.length} Problems Saved
                </Badge>
            </div>

            {history.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                    <div className="bg-muted p-4 rounded-full mb-4">
                        <Calculator className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="mb-2">No problems solved yet</CardTitle>
                    <CardDescription className="mb-6">
                        Start by solving a problem via the manual form or using natural language.
                    </CardDescription>
                    <Button asChild>
                        <Link href="/">Solve First Problem</Link>
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {history.map((item) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow group relative">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="flex items-center gap-2">
                                    <Badge className="capitalize">
                                        {item.problem_type}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {format(new Date(item.created_at), 'PPPp')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                                        {item.input_method === 'nl' ? 'AI Parsed' : 'Manual'}
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors"
                                        onClick={(e) => deleteProblem(item.id, e)}
                                        disabled={deletingId === item.id}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <p className="text-sm font-medium line-clamp-2 italic text-muted-foreground border-l-2 pl-3 py-1">
                                        "{item.problem_text}"
                                    </p>
                                    <div className="flex items-center justify-between pt-2">
                                        {item.solutions?.[0]?.final_answer && (
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Answer: </span>
                                                <span className="font-bold text-primary">
                                                    {(item.solutions[0].final_answer as any).solveFor} = {(item.solutions[0].final_answer as any).result?.toFixed(3) ?? 'N/A'}
                                                </span>
                                            </div>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="group-hover:translate-x-1 transition-transform gap-1 ml-auto"
                                            onClick={() => {
                                                if (item.solutions?.[0]) {
                                                    setSelectedSolution({
                                                        ...item.solutions[0].final_answer,
                                                        steps: item.solutions[0].solution_steps,
                                                        inputValues: item.solutions[0].input_values,
                                                        category: item.problem_type
                                                    });
                                                }
                                            }}
                                        >
                                            View Solution <ArrowRight className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            {/* Solution Viewer Modal */}
            {selectedSolution && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-background w-full max-w-3xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border">
                        <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                            <h3 className="font-bold flex items-center gap-2">
                                <Calculator className="h-4 w-4 text-primary" />
                                Detailed Solution
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedSolution(null)} className="h-8 w-8">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 max-h-[calc(90vh-8rem)]">
                            <SolutionDisplay
                                result={selectedSolution.result}
                                solveFor={selectedSolution.solveFor}
                                steps={selectedSolution.steps}
                                inputValues={selectedSolution.inputValues}
                                category={selectedSolution.category}
                            />
                        </div>
                        <div className="p-4 border-t bg-muted/30 flex justify-end">
                            <Button onClick={() => setSelectedSolution(null)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
