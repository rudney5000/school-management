import React from 'react';
import { Icons } from '../icons';
import { ColumnActions, DropdownMenuItem } from "@shared/ui";
import type { Row } from "@tanstack/react-table";
import { useTranslation } from "@shared/lib";

interface ActionsComponentProps<TData> {
    row: Row<TData>,
    children?: React.ReactNode,
    onDeleteAction: (original: TData) => void,
    onEditAction: (original: TData) => void
}

export function ActionsComponent<TData>(props: ActionsComponentProps<TData>) {
    const { row, children, onEditAction, onDeleteAction } = props;
    const { t } = useTranslation()

    return (
        <div>
            <ColumnActions row={row}>
                {children}
                <DropdownMenuItem
                    className="space-x-4"
                    onClick={() => onEditAction(row.original)}
                >
                    <Icons.pencil className="h-4 w-4" />
                    <p>{t('dashboard.common.actions.edit')}</p>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="space-x-4"
                    onClick={() => onDeleteAction(row.original)}
                >
                    <Icons.trash2 className="h-4 w-4" />
                    <p>{t('dashboard.common.actions.delete')}</p>
                </DropdownMenuItem>
            </ColumnActions>
        </div>
    )
}