import type { Column } from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";

interface FilterHeaderProps<TData, TValue = unknown> {
    column: Column<TData, TValue>;
    title: string;
    onFilterChange?: (value: string) => void;
    selectedValue?: string;
}

export default function FilterHeader<TData, TValue>({
                                                        column,
                                                        title,
                                                        onFilterChange,
                                                        selectedValue,
                                                    }: FilterHeaderProps<TData, TValue>) {
    const filterOptions =
        (column.columnDef.meta?.filterOptions as string[]) ?? [];
    const labelOptions =
        (column.columnDef.meta?.labelOptions as Record<string, string>) ?? {};

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                    {title}
                    <Filter size={14} className="text-muted-foreground" />
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
                <DropdownMenuRadioGroup
                    value={selectedValue}
                    onValueChange={onFilterChange}
                    className="max-h-80"
                >
                    <DropdownMenuRadioItem key="all" value="">
                        All
                    </DropdownMenuRadioItem>

                    {filterOptions.map((option) => (
                        <DropdownMenuRadioItem key={option} value={option}>
                            {labelOptions[option] ?? option}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}