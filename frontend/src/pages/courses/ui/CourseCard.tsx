import React from "react";
import {
    BookOpen,
    Ruler,
    Palette,
    Lightbulb,
    Smartphone,
    Pencil,
    Zap,
    GraduationCap,
    Clock,
    BookMarked,
    MoreHorizontal,
    Edit2,
    Trash2,
    CheckCircle2,
} from 'lucide-react';

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Badge,
    Button,
    Card,
    CardContent,
    CardFooter,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Separator
} from '@/shared/ui';
import type {
    Course,
    CourseColor,
    CourseIcon
} from "@entities/courses";
import {useTranslation} from "@shared/lib";

const iconMap: Record<CourseIcon, React.ReactNode> = {
    'book-open': <BookOpen size={20} />,
    'ruler': <Ruler size={20} />,
    'palette': <Palette size={20} />,
    'lightbulb': <Lightbulb size={20} />,
    'smartphone': <Smartphone size={20} />,
    'pencil': <Pencil size={20} />,
    'zap': <Zap size={20} />,
    'graduation-cap': <GraduationCap size={20} />,
};

const colorMap: Record<CourseColor, { bg: string; text: string }> = {
    orange:  { bg: 'bg-orange-100',  text: 'text-orange-600' },
    violet:  { bg: 'bg-violet-100',  text: 'text-violet-600' },
    blue:    { bg: 'bg-blue-100',    text: 'text-blue-600' },
    green:   { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    purple:  { bg: 'bg-purple-100',  text: 'text-purple-600' },
    pink:    { bg: 'bg-pink-100',    text: 'text-pink-600' },
    teal:    { bg: 'bg-teal-100',    text: 'text-teal-600' },
    amber:   { bg: 'bg-amber-100',   text: 'text-amber-600' },
};

interface Props {
    course: Course;
    onEdit: (course: Course) => void;
    onDelete: (id: string) => void;
}

export default function CourseCard({ course, onEdit, onDelete }: Props) {
    const colors = colorMap[course.color];
    const { t } = useTranslation();

    return (
        <Card className="flex flex-col hover:shadow-md transition-shadow duration-200">
            <CardContent className="flex flex-col gap-4 p-5 flex-1">
                <div className="flex items-start justify-between">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colors.bg} ${colors.text}`}>
                        {iconMap[course.icon]}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <MoreHorizontal size={16} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuLabel>
                                {t('dashboard.courses.actions.title')}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onEdit(course)}
                                className="gap-2 cursor-pointer"
                            >
                                <Edit2 size={13} />
                                {t('dashboard.courses.actions.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(course.id)}
                                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                            >
                                <Trash2 size={13} />
                                {t('dashboard.courses.actions.delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-foreground text-sm leading-tight">
                            {course.name}
                        </h3>
                        <Badge variant="secondary" className="text-[11px] px-2 py-0">
                            {course.code}
                        </Badge>
                    </div>
                    {course.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {course.description}
                        </p>
                    )}
                </div>

                {course.teacher && (
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={course.teacher.image} alt={`${course.teacher.firstName} ${course.teacher.lastName}`} />
                            <AvatarFallback className="text-[10px]">
                                {course.teacher.firstName[0]}{course.teacher.lastName[0]}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                            {course.teacher.firstName} {course.teacher.lastName}
                        </span>
                    </div>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <BookMarked size={12} />
                      {t('dashboard.courses.stats.lessons', { count: course.totalLessons })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} />
                      {course.totalHours}h
                  </span>
                  <span className="ml-auto text-xs font-semibold text-foreground">
                    {course.credits}
                      {t('dashboard.courses.stats.creditsShort')}.
                  </span>
                </div>
            </CardContent>

            <Separator />

            <CardFooter className="px-5 py-3">
                {course.status === 'completed' ? (
                    <Badge variant="success" className="gap-1.5">
                        <CheckCircle2 size={11} />
                        {t('dashboard.courses.status.completed')}
                    </Badge>
                ) : course.status === 'archived' ? (
                    <Badge variant="muted">
                        {t('dashboard.courses.status.archived')}
                    </Badge>
                ) : (
                    <Badge variant="blue" className="gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                        {t('dashboard.courses.status.active')}
                    </Badge>
                )}
            </CardFooter>
        </Card>
    );
}
