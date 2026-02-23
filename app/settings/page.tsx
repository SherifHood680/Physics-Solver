"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/db/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Save, User, Settings as SettingsIcon, Globe, Palette } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "next-themes";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [displayName, setDisplayName] = useState("");
    const [unitSystem, setUnitSystem] = useState("SI");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            setUser(user);

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setDisplayName(profile.display_name || "");
                setUnitSystem(profile.default_unit_system || "SI");
            }
            setLoading(false);
        };

        fetchProfile();
    }, [router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    display_name: displayName,
                    default_unit_system: unitSystem,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (updateError) throw updateError;

            // Also update auth metadata for good measure
            await supabase.auth.updateUser({
                data: { display_name: displayName }
            });

            setSuccess("Settings saved successfully!");
            setTimeout(() => setSuccess(null), 3000);
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading your settings...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <SettingsIcon className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                    <p className="text-muted-foreground">Manage your profile and application preferences.</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {success && (
                    <Alert className="bg-green-500/10 text-green-500 border-green-500/20">
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Profile Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                <CardTitle>Profile Information</CardTitle>
                            </div>
                            <CardDescription>
                                Update your public name and identity.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="displayName">Display Name</Label>
                                <Input
                                    id="displayName"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
                                <p className="text-xs text-muted-foreground italic">Email cannot be changed here.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Physics Settings */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-primary" />
                                <CardTitle>Physics Preferences</CardTitle>
                            </div>
                            <CardDescription>
                                Set your default calculation units.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label>Default Unit System</Label>
                                <RadioGroup value={unitSystem} onValueChange={setUnitSystem}>
                                    <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent transition-colors">
                                        <RadioGroupItem value="SI" id="si" />
                                        <Label htmlFor="si" className="flex-1 cursor-pointer">
                                            <span className="font-bold">SI (Metric)</span>
                                            <p className="text-xs text-muted-foreground">Meters, Kilograms, Seconds, Newtons</p>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent transition-colors">
                                        <RadioGroupItem value="Imperial" id="imperial" />
                                        <Label htmlFor="imperial" className="flex-1 cursor-pointer">
                                            <span className="font-bold">Imperial</span>
                                            <p className="text-xs text-muted-foreground">Feet, Pounds, Slugs, Seconds</p>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appearance */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Palette className="h-5 w-5 text-primary" />
                                <CardTitle>Appearance</CardTitle>
                            </div>
                            <CardDescription>
                                Customize the look and feel of the application.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <Label>Theme</Label>
                                <RadioGroup value={theme} onValueChange={(val: string) => setTheme(val)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent transition-colors">
                                        <RadioGroupItem value="light" id="light" />
                                        <Label htmlFor="light" className="flex-1 cursor-pointer">Light</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent transition-colors">
                                        <RadioGroupItem value="dark" id="dark" />
                                        <Label htmlFor="dark" className="flex-1 cursor-pointer">Dark</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent transition-colors">
                                        <RadioGroupItem value="system" id="system" />
                                        <Label htmlFor="system" className="flex-1 cursor-pointer">System</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={saving} className="gap-2 px-8">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}
