import type {Row} from "@tanstack/react-table";
import {Checkbox} from "@shared/ui";

export function SelectionCheckbox<TData>({row}: { row: Row<TData> }) {
    return (
        <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            onClick={(e) => e.stopPropagation()}
            aria-label="Sélectionner la ligne"
            className="border-zinc-300 data-checked:bg-[#1755EC] data-checked:border-[#1755EC]"
        />
    )
}