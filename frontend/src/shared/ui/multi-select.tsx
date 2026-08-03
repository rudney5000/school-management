import * as React from "react"
import {
    Check,
    ChevronsUpDown
} from "lucide-react"
import { cn } from "@/shared/lib/utils"
import {
    Button,
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/shared/ui"

interface MultiSelectProps {
    items: { value: string, label: string }[]
    selected: string[]
    onChange: (values: string[]) => void
    placeholder?: string
    emptyText?: string
}

export function MultiSelect({
                                items,
                                selected,
                                onChange,
                                placeholder = "Select...",
                                emptyText = "Aucun résultat"
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false)

    const selectedLabels = items
        .filter(item => selected.includes(item.value))
        .map(item => item.label)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between border-gray-200 hover:text-foreground text-foreground font-normal"
                >
                    <span className="truncate">
                        {selectedLabels.length ? selectedLabels.join(", ") : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0">
                <Command>
                    <CommandInput placeholder="Rechercher..." />
                    <CommandEmpty className="p-4 text-sm text-muted-foreground text-center">
                        {emptyText}
                    </CommandEmpty>
                    <CommandGroup>
                        {items.map((item) => (
                            <CommandItem
                                key={item.value}
                                value={item.label}
                                onSelect={() => {
                                    const newValues = selected.includes(item.value)
                                        ? selected.filter(v => v !== item.value)
                                        : [...selected, item.value]
                                    onChange(newValues)
                                }}
                            >
                                <Check className={cn("mr-2 h-4 w-4", selected.includes(item.value) ? "opacity-100" : "opacity-0")} />
                                {item.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}