"use client";

import Link from 'next/link';
import { Atom, User, LogOut, History, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db/supabase';
import { useRouter } from 'next/navigation';

export function Header() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };

        checkUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <header className="border-b bg-background sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                        <Atom className="h-6 w-6" />
                    </div>
                    <span>Physics Solver</span>
                </Link>
                <nav className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Button variant="ghost" asChild className="gap-2">
                                <Link href="/history">
                                    <History className="h-4 w-4" />
                                    History
                                </Link>
                            </Button>
                            <Button variant="ghost" asChild className="gap-2">
                                <Link href="/settings">
                                    <Settings className="h-4 w-4" />
                                    Settings
                                </Link>
                            </Button>
                            <div className="h-8 w-[1px] bg-border mx-1" />
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-muted-foreground hidden md:inline-block">
                                    {user.user_metadata?.display_name || user.email}
                                </span>
                                <Button variant="outline" size="icon" onClick={handleSignOut} title="Sign Out">
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" asChild>
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/register">Get Started</Link>
                            </Button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
