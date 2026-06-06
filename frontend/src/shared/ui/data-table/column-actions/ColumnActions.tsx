import React from 'react'
import type { ReactNode } from 'react'

import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/shared/ui"
import { MoreHorizontal } from "lucide-react"
import type {Row} from "@tanstack/react-table";

interface ColumnActionsProps<TData> {
    row: Row<TData>
    children: ReactNode
}

export function ColumnActions<TData>({ row, children }: ColumnActionsProps<TData>) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[9999]">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {React.Children.map(children, (child) =>
                    React.isValidElement(child)
                        ? React.cloneElement(child as React.ReactElement<any>, { row })
                        : child
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}