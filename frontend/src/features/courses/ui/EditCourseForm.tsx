import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from '@tanstack/react-router'
import {
    BookOpen,
    Ruler,
    Palette,
    Lightbulb,
    Smartphone,
    Pencil,
    Zap,
    GraduationCap,
    Radio,
} from 'lucide-react'
import {
    Button,
    Input,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Checkbox,
} from '@shared/ui'
import {
    updateCourseSchema,
    type UpdateCourseDto,
    type Course,
    useUpdateCourse,
    COURSE_COLORS,
    COURSE_ICONS,
    COURSE_STATUSES,
    type CourseColor,
    type CourseIcon
} from '@entities/courses'
import CustomDrawer from "@shared/ui/custom-drawer/custom-drawer"
import { useTranslation } from "@shared/lib"
import { cn } from '@/shared/lib'

const iconMap: Record<CourseIcon, React.ReactNode> = {
    'book-open': <BookOpen size={15} />,
    'ruler': <Ruler size={15} />,
    'palette': <Palette size={15} />,
    'lightbulb': <Lightbulb size={15} />,
    'smartphone': <Smartphone size={15} />,
    'pencil': <Pencil size={15} />,
    'zap': <Zap size={15} />,
    'graduation-cap': <GraduationCap size={15} />,
};

const colorDots: Record<CourseColor, string> = {
    orange: 'bg-orange-400',
    violet: 'bg-violet-500',
    blue:   'bg-blue-500',
    green:  'bg-emerald-500',
    purple: 'bg-purple-500',
    pink:   'bg-pink-400',
    teal:   'bg-teal-500',
    amber:  'bg-amber-400',
};

type Props = {
    course: Course
    isOpen?: boolean
    handleOpen?: () => void
    handleSuccess?: () => void
    submitButtonLabel?: string
}

export const EditCourseForm: React.FC<Props> = ({
                                                    course,
                                                    isOpen,
                                                    handleOpen,
                                                    handleSuccess,
                                                    submitButtonLabel,
                                                }) => {
    const { t } = useTranslation()
    const { subSchoolId } = useParams({ strict: false })

    const form = useForm<UpdateCourseDto>({
        resolver: zodResolver(updateCourseSchema),
        mode: "onTouched",
        defaultValues: {
            name: course.name,
            code: course.code,
            description: course.description,
            credits: course.credits,
            icon: course.icon,
            color: course.color,
            totalLessons: course.totalLessons,
            totalHours: course.totalHours,
            status: course.status,
            isDistanceCourse: course.isDistanceCourse,
            liveScheduledAt: course.liveScheduledAt,
            liveUrl: course.liveUrl,
        },
    })

    const isDistanceCourse = form.watch('isDistanceCourse')

    const { mutate, isPending } = useUpdateCourse()

    function onSubmit(dto: UpdateCourseDto) {
        mutate({ id: course.id, dto, subSchoolId: subSchoolId! }, {
            onSuccess: () => {
                handleSuccess?.()
            },
        })
    }

    return (
        <CustomDrawer
            isOpen={isOpen}
            handleOpen={handleOpen}
            drawerTitle={t('dashboard.courses.form.editTitle')}
            drawerDescription={t('dashboard.courses.form.editDescription')}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.courses.fields.name')}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.courses.fields.code')}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dashboard.courses.fields.description')}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="credits"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('dashboard.courses.fields.credits')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="totalLessons"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Leçons</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="totalHours"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Heures</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Icône</FormLabel>
                                <FormControl>
                                    <div className="flex flex-wrap gap-2">
                                        {COURSE_ICONS.map(ic => (
                                            <button
                                                key={ic}
                                                type="button"
                                                onClick={() => field.onChange(ic)}
                                                className={cn(
                                                    'w-9 h-9 rounded-lg flex items-center justify-center transition-all border',
                                                    field.value === ic
                                                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                                        : 'bg-secondary text-muted-foreground border-transparent hover:bg-muted'
                                                )}
                                            >
                                                {iconMap[ic]}
                                            </button>
                                        ))}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Couleur</FormLabel>
                                <FormControl>
                                    <div className="flex flex-wrap gap-2.5">
                                        {COURSE_COLORS.map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => field.onChange(c)}
                                                className={cn(
                                                    'w-6 h-6 rounded-full transition-all',
                                                    colorDots[c],
                                                    field.value === c ? 'ring-2 ring-offset-2 ring-muted-foreground scale-110' : 'hover:scale-105'
                                                )}
                                            />
                                        ))}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Statut</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {COURSE_STATUSES.map(s => (
                                            <SelectItem key={s} value={s}>
                                                {s === 'active' ? 'Actif' : s === 'completed' ? 'Terminé' : 'Archivé'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="rounded-lg border p-4 space-y-3">
                        <FormField
                            control={form.control}
                            name="isDistanceCourse"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="flex items-center gap-1.5 cursor-pointer">
                                            <Radio className="w-3.5 h-3.5 text-red-500"/>
                                            Cours à distance (avec live)
                                        </FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {isDistanceCourse && (
                            <div className="space-y-3 pl-6">
                                <FormField
                                    control={form.control}
                                    name="liveScheduledAt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date et heure du live (optionnel)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="datetime-local"
                                                    {...field}
                                                    value={field.value || ''}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="liveUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>URL du live (optionnel)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="https://..."
                                                    value={field.value || ''}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-4 gap-2">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? t('dashboard.common.loading') : (submitButtonLabel ?? t('dashboard.common.confirm'))}
                        </Button>
                    </div>
                </form>
            </Form>
        </CustomDrawer>
    )
}