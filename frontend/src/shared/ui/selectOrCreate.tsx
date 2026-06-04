import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@//shared/lib/utils"
import {
    Button,
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    Icons,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/ui/"

interface Props {
    handleCreate: (label: string) => void,
    handleSelect?: (Value: string) => void,
    items: { value: string, label: string }[]
}

export function SelectOrCreate({ items, handleCreate, handleSelect }: Props) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")
    const [search, setSearch] = React.useState("")

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between border-gray-200 hover:text-foreground text-foreground"
                >
                    {value
                        ? items.find((item) => item.value.toLowerCase() === value)?.label
                        : "Select..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput
                        value={search}
                        placeholder="Search item..."
                        onValueChange={(search) => {
                            setSearch(search)
                        }}
                    />
                    <CommandEmpty className="p-4">
                        <Button
                            onClick={() =>{
                                handleCreate(search)
                                setSearch("")
                                setValue("")
                            }}
                            variant="secondary"
                            size="sm"
                            className="w-full border-muted"
                        >
                            <Icons.plus className="size-4 mr-2" />
                            {search}
                        </Button>
                    </CommandEmpty>
                    <CommandGroup>
                        {items.map((item) => (
                            <CommandItem
                                key={item.value}
                                value={item.value}
                                onSelect={(currentValue) => {
                                    setValue(currentValue === value ? "" : currentValue)
                                    if(handleSelect) handleSelect(currentValue === value ? "" : currentValue)
                                    setOpen(false)
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === item.value ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {item.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
