import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, UserPlus } from "lucide-react";

import { getCurrentUser, signUp } from "../services/auth.service";

import AuthLayout from "../components/auth/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Signup() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function check() {
            const user = await getCurrentUser();

            if (user) {
                navigate("/dashboard");
            }
        }

        check();
    }, [navigate]);

    async function handleSignup() {
        setError("");
        setLoading(true);

        try {
            await signUp(email, password);

            navigate("/");
        } catch (err: any) {
            setError(err.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout>
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111827] p-8 shadow-2xl">

                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
                    <UserPlus className="text-amber-400" size={28} />
                </div>

                <p className="mb-2 text-sm font-medium uppercase tracking-wider text-amber-400">
                    Get Started
                </p>

                <h2 className="mb-2 text-3xl font-bold text-white">
                    Create your account
                </h2>

                <p className="mb-8 text-gray-400">
                    Join SystemIQ and start mastering system design interviews.
                </p>

                <div className="space-y-5">

                    <Input
                        icon={Mail}
                        placeholder="Email"
                        value={email}
                        autoComplete="email"
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <Input
                        icon={Lock}
                        type="password"
                        placeholder="Password"
                        value={password}
                        autoComplete="new-password"
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    <Button
                        loading={loading}
                        disabled={!email || !password}
                        onClick={handleSignup}
                    >
                        Create Account
                    </Button>

                    <p className="text-center text-sm text-gray-400">
                        Already have an account?{" "}
                        <Link
                            to="/"
                            className="font-medium text-amber-400 transition hover:text-amber-300"
                        >
                            Sign In
                        </Link>
                    </p>

                </div>
            </div>
        </AuthLayout>
    );
}