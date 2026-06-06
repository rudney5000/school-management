import * as React from 'react'
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/shared/store/hooks'
import { cn } from '@/shared/lib/utils'
import { useTranslation } from '@/shared/lib/useTranslation'

import {useSubSchools} from "@entities/sub-school/lib/useSubSchools.ts";
import type {SubSchool} from "@entities/sub-school/model/types";
import {setSelectedSubSchoolId} from "@entities/sub-school/model/slice";
import {
    Button,
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    Dialog,
    DialogTrigger,
    DialogContent,
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/shared/ui'
import {SchoolAvatar} from "@features/school/ui/SchoolAvatar";

export function SchoolSwitcher() {
    const { t } = useTranslation()
    const [open, setOpen] = React.useState(false)
    const [showCreateDialog, setShowCreateDialog] = React.useState(false)

    const dispatch = useAppDispatch()
    const selectedSubSchoolId = useAppSelector(state => state.subSchool.selectedSubSchoolId)

    const auth = useAppSelector(state => state.auth)
    const userSchoolId = auth.schoolId

    const { data: subSchools, isLoading } = useSubSchools(userSchoolId || '')

    const selectedSubSchool = React.useMemo<SubSchool | null>(() => {
        if (!selectedSubSchoolId || !subSchools) return null;
        return subSchools.find(sub => sub.id === selectedSubSchoolId) ?? null;
    }, [selectedSubSchoolId, subSchools]);

    React.useEffect(() => {
        if (subSchools?.length && !selectedSubSchoolId) {
            dispatch(setSelectedSubSchoolId(subSchools[0].id))
        }
    }, [subSchools, selectedSubSchool, dispatch])

    const groupedSubSchools = React.useMemo(() => {
        if (!subSchools) return new Map<string, SubSchool[]>();

        const groups = new Map<string, SubSchool[]>();
        subSchools.forEach(sub => {
            const existing = groups.get(sub.schoolId) || [];
            existing.push(sub);
            groups.set(sub.schoolId, existing);
        });
        return groups;
    }, [subSchools]);

    if (!userSchoolId || isLoading) {
        return <div className="w-[260px] h-9 animate-pulse bg-zinc-100 rounded" />
    }

    return (
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        aria-label={t('school.selectSchool')}
                        className="w-[260px] justify-between border-zinc-200 hover:bg-zinc-50 shadow-sm"
                    >
                        {selectedSubSchool ? (
                            <>
                                <SchoolAvatar name={selectedSubSchool.name} logoUrl={selectedSubSchool.logo} className="mr-2" />
                                <span className="truncate">{selectedSubSchool.name}</span>
                            </>
                        ) : (
                            <span className="text-zinc-400 truncate">{t('school.selectSchool')}</span>
                        )}
                        <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[260px] p-0 bg-white text-zinc-900 ">
                    <Command>
                        <CommandList>
                            <CommandInput placeholder={t('school.searchSchool')} />
                            <CommandEmpty>{t('school.noSchoolFound')}</CommandEmpty>

                            {Array.from(groupedSubSchools.entries()).map(([schoolId, subs]) => (
                                <CommandGroup key={schoolId} heading={`École ${schoolId.slice(0, 8)}...`}>
                                    {subs.map((subSchool) => {
                                        const isSelected = selectedSubSchoolId === subSchool.id;

                                        return (
                                            <CommandItem
                                                key={subSchool.id}
                                                onSelect={() => {
                                                    dispatch(setSelectedSubSchoolId(subSchool.id));
                                                    setOpen(false);
                                                }}
                                                className="text-sm"
                                            >
                                                <SchoolAvatar name={subSchool.name} logoUrl={subSchool.logo} className="mr-2" />
                                                <span className="truncate">{subSchool.name}</span>
                                                <Check
                                                    className={cn(
                                                        'ml-auto h-4 w-4 shrink-0',
                                                        isSelected ? 'opacity-100' : 'opacity-0'
                                                    )}
                                                />
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            ))}
                        </CommandList>

                        <CommandSeparator />

                        <CommandList>
                            <CommandGroup>
                                <DialogTrigger asChild>
                                    <CommandItem
                                        onSelect={() => setOpen(false)}
                                        className="cursor-pointer"
                                    >
                                        <PlusCircle className="mr-2 h-5 w-5" />
                                        {t('school.createSchool')}
                                    </CommandItem>
                                </DialogTrigger>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <DialogContent className="sm:max-w-[425px] bg-white text-zinc-900">
                <CreateSchoolForm onSuccess={() => setShowCreateDialog(false)} />
            </DialogContent>
        </Dialog>
    );
}

function CreateSchoolForm({ onSuccess }: { onSuccess: () => void }) {
    const { t } = useTranslation()

    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-zinc-900">
                {t('school.createSchool')}
            </h2>
            <Button onClick={onSuccess} className="w-full">
                {t('common.create')}
            </Button>
        </div>
    )
}