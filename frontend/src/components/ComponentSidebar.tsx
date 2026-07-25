import { useMemo, useState } from "react";
import { Search } from "lucide-react";

const onDragStart = (
    event: React.DragEvent,
    nodeType: string
) => {

    event.dataTransfer.setData(
        "application/reactflow",
        nodeType
    );

    event.dataTransfer.effectAllowed = "move";

};

const NODES = [

    {

        label: "API Gateway",

        icon: "🌐",

        type: "api",

    },

    {

        label: "Database",

        icon: "🗄️",

        type: "db",

    },

    {

        label: "Cache",

        icon: "⚡",

        type: "cache",

    },

    {

        label: "Load Balancer",

        icon: "⚖️",

        type: "lb",

    },

    {

        label: "CDN",

        icon: "📦",

        type: "cdn",

    },

    {

        label: "Message Queue",

        icon: "📨",

        type: "queue",

    },

];

export default function Sidebar() {

    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {

        return NODES.filter((node) =>

            node.label

                .toLowerCase()

                .includes(

                    search.toLowerCase()

                )

        );

    }, [

        search

    ]);

    return (

        <aside
            className="
                w-48
                shrink-0
                border-r
                border-white/10
                bg-[#0F1013]
                flex
                flex-col
            "
        >

            {/* Search */}

            <div className="border-b border-white/10 p-3">

                <div className="relative">

                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />

                    <input

                        value={search}

                        onChange={(e) =>

                            setSearch(

                                e.target.value

                            )

                        }

                        placeholder="Search..."

                        className="
                            h-8
                            w-full
                            rounded-lg
                            border
                            border-white/10
                            bg-[#16181D]
                            pl-9
                            pr-3
                            text-xs
                            text-white
                            outline-none
                            placeholder:text-gray-500
                            focus:border-[#F5B301]
                        "

                    />

                </div>

            </div>

            {/* Components */}

            <div
                className="
                    flex-1
                    overflow-y-auto
                    overflow-x-hidden
                    p-2
                    space-y-1
                "
            >

                {

                    filtered.map(

                        ({

                            label,

                            icon,

                            type,

                        }) => (

                            <button

                                key={type}

                                draggable

                                onDragStart={(e) =>

                                    onDragStart(

                                        e,

                                        type

                                    )

                                }

                                className="
                                    flex
                                    h-9
                                    w-full
                                    items-center
                                    gap-2
                                    rounded-lg
                                    border
                                    border-transparent
                                    bg-[#17191D]
                                    px-3
                                    text-left
                                    text-xs
                                    text-gray-300
                                    transition-all
                                    hover:border-[#F5B301]/40
                                    hover:bg-[#202228]
                                    active:scale-[0.98]
                                    cursor-grab
                                "
                            >

                                <span className="text-sm">

                                    {icon}

                                </span>

                                <span className="truncate">

                                    {label}

                                </span>

                            </button>

                        )

                    )

                }

            </div>

        </aside>

    );

}