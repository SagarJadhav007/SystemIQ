import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn, getCurrentUser } from "../services/auth.service";
import { Mail, Lock } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Login() {

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

    async function handleLogin() {

        setError("");

        setLoading(true);

        try {

            await signIn(email, password);

            navigate("/dashboard");

        }

        catch (err: any) {

            setError(

                err.message ||

                "Login failed"

            );

        }

        finally {

            setLoading(false);

        }

    }

    return (

        <AuthLayout>
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111827] p-8 shadow-2xl">

                <p className="mb-2 text-sm font-medium text-amber-400">
                    Welcome Back
                </p>

                <h2 className="mb-2 text-3xl font-bold text-white">
                    Sign in
                </h2>

                <p className="mb-8 text-gray-400">
                    Continue your SystemIQ interview journey.
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
                        autoComplete="current-password"
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
                        onClick={handleLogin}
                    >
                        Sign In
                    </Button>

                    <p className="text-center text-sm text-gray-400">
                        Don't have an account?{" "}
                        <Link
                            to="/signup"
                            className="font-medium text-amber-400 hover:text-amber-300"
                        >
                            Create Account
                        </Link>
                    </p>

                </div>

            </div>
        </AuthLayout>

    );

}