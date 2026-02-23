import Link from 'next/link';
import { Home, Calculator, History, BookOpen, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Sidebar({ className }: { className?: string }) {
    return (
        <div className={cn("pb-12 w-64 border-r min-h-screen bg-muted/20 hidden md:block", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Discover
                    </h2>
                    <div className="space-y-1">
                        <Button variant="secondary" className="w-full justify-start" asChild>
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" />
                                Home
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/history">
                                <History className="mr-2 h-4 w-4" />
                                History
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/settings">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Calculators
                    </h2>
                    <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/?category=kinematics">
                                <Calculator className="mr-2 h-4 w-4" />
                                Kinematics
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/?category=dynamics">
                                <Calculator className="mr-2 h-4 w-4" />
                                Dynamics
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/?category=energy">
                                <Calculator className="mr-2 h-4 w-4" />
                                Energy
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/?category=momentum">
                                <Calculator className="mr-2 h-4 w-4" />
                                Momentum
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/?category=thermodynamics">
                                <Calculator className="mr-2 h-4 w-4" />
                                Thermodynamics
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/?category=rotational">
                                <Calculator className="mr-2 h-4 w-4" />
                                Rotational Mechanics
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/?category=waves">
                                <Calculator className="mr-2 h-4 w-4" />
                                Wave Mechanics
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/?category=advanced">
                                <Calculator className="mr-2 h-4 w-4" />
                                Advanced Mechanics
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div >
    );
}
