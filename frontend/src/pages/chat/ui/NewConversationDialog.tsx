import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Avatar,
    AvatarFallback,
    Spinner
} from '@shared/ui'
import { useContactableStaff } from '@entities/chat'
import { useCreateConversation } from '@entities/chat'
import { useAppSelector } from '@shared/store/hooks'
import { useTranslation } from '@shared/lib'

interface NewConversationDialogProps {
    open: boolean
    onClose: () => void
}

const roleLabels: Record<string, string> = {
    admin: 'dashboard.chat.roleAdmin',
    director: 'dashboard.chat.roleDirector',
    super_admin: 'dashboard.chat.roleSuperAdmin',
    teacher: 'dashboard.chat.roleTeacher',
}

export function NewConversationDialog({ open, onClose }: NewConversationDialogProps) {
    const { t } = useTranslation()
    const { staff, teachers, isLoading } = useContactableStaff()
    const { mutate: createConversation, isPending } = useCreateConversation()
    const subSchoolId = useAppSelector((state) => state.auth.subSchoolId) // à ajuster selon ton vrai sélecteur

    const handleSelect = (userId: string) => {
        if (!subSchoolId) return
        createConversation(
            { memberIds: [userId], subSchoolId },
            { onSuccess: onClose },
        )
    }

    const hasContacts = staff.length > 0 || teachers.length > 0

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('dashboard.chat.newConversation')}</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center py-8"><Spinner /></div>
                ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {staff.length > 0 && (
                            <ContactGroup
                                title={t('dashboard.chat.schoolStaff')}
                                users={staff}
                                onSelect={handleSelect}
                                disabled={isPending}
                            />
                        )}
                        {teachers.length > 0 && (
                            <ContactGroup
                                title={t('dashboard.chat.teachers')}
                                users={teachers}
                                onSelect={handleSelect}
                                disabled={isPending}
                            />
                        )}
                        {!hasContacts && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                {t('dashboard.chat.noContacts')}
                            </p>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

function ContactGroup({
                          title, users, onSelect, disabled
                      }: {
    title: string
    users: { id: string; email: string; role: string }[]
    onSelect: (id: string) => void
    disabled: boolean
}) {
    const { t } = useTranslation()
    return (
        <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">{title}</p>
            {users.map((u) => {
                const label = u.email?.split('@')[0] ?? '??'
                return (
                    <button
                        key={u.id}
                        onClick={() => onSelect(u.id)}
                        disabled={disabled}
                        className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted text-left disabled:opacity-50"
                    >
                        <Avatar size="sm">
                            <AvatarFallback>{label.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground">{t(roleLabels[u.role] ?? u.role)}</p>
                        </div>
                    </button>
                )
            })}
        </div>
    )
}