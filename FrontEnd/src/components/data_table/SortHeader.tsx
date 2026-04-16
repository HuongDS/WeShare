import { type HeaderContext } from "@tanstack/react-table";
import { ArrowDownAZ, ArrowUpZA, ArrowDownUp } from "lucide-react";

interface SortHeaderProps<TData, TValue> {
    info: HeaderContext<TData, TValue>;
    title: string;
}
export default function SortHeader<TData, TValue>({
                                                      info,
                                                      title,
                                                  }: SortHeaderProps<TData, TValue>) {
    const currentSorted = info.column.getIsSorted();

    const handleSorted = () => {
        if (currentSorted === "asc") {
            info.column.toggleSorting(true);
        } else if (currentSorted === "desc") {
            info.column.clearSorting();
        } else {
            info.column.toggleSorting(false);
        }
    };

    return (
        <div
            onPointerDown={(e) => {
                e.preventDefault();
                handleSorted();
            }}
            className="w-full h-full flex justify-start items-center gap-2"
        >
            {title}
            {currentSorted === "asc" ? (
                <ArrowDownAZ size={14} className="text-muted-foreground" />
            ) : currentSorted === "desc" ? (
                <ArrowUpZA size={14} className="text-muted-foreground" />
            ) : (
                <ArrowDownUp size={14} className="text-muted-foreground" />
            )}
        </div>
    );
}
