import { CheckCircle2 } from "lucide-react";
import Logo from "../branding/Logo";

interface Props {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: Props) {
    return (
        <div className="min-h-screen bg-[#0B0F19]">
            <div className="mx-auto flex min-h-screen max-w-7xl">

                {/* Left */}

                <div className="hidden w-1/2 flex-col justify-between p-14 lg:flex">

                    <Logo />

                    <div>

                        <h1 className="mb-5 text-5xl font-bold leading-tight text-white">
                            Master
                            <br />
                            System Design
                            <br />
                            Interviews.
                        </h1>

                        <p className="mb-10 max-w-md text-lg leading-relaxed text-gray-400">
                            Practice with an AI interviewer that asks follow-up
                            questions, evaluates architecture, and delivers
                            professional feedback.
                        </p>

                        <div className="space-y-5">

                            {[
                                "Real interview simulation",
                                "AI architecture evaluation",
                                "Detailed feedback reports",
                                "Interview history",
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-3"
                                >
                                    <CheckCircle2
                                        className="text-emerald-400"
                                        size={20}
                                    />

                                    <span className="text-gray-300">
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right */}

                <div className="flex flex-1 items-center justify-center p-8">

                    {children}

                </div>

            </div>
        </div>
    );
}