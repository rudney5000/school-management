import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/shared/lib/utils"
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
    PopoverTrigger
} from "@/shared/ui"

interface Props {
    handleCreate: (label: string) => void,
    handleSelect?: (Values: string[]) => void,
    items: { value: string, label: string }[]
}

export function MultiSelectOrCreate({ items, handleCreate, handleSelect }: Props) {
    const [open, setOpen] = React.useState(false)
    const [values, setValues] = React.useState<Array<string>>([])
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
                    {values
                        ? items.filter((item) => values.includes(item.value.toLowerCase())).map(item => item.value).join(", ")
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
                            onClick={() => {
                                handleCreate(search)
                                setSearch("")
                                setValues([])
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
                                    let newValues: string[] = []
                                    if(values.includes(currentValue)) {
                                        newValues = values.filter(value => value !== currentValue)
                                    } else {
                                        newValues = [...values, currentValue]
                                    }
                                    setValues(newValues)
                                    if(handleSelect) handleSelect(newValues)
                                    setOpen(false)
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        values.includes(item.value.toLowerCase()) ? "opacity-100" : "opacity-0"
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
