export const COURSE_ICONS = ['book-open', 'ruler', 'palette', 'lightbulb', 'smartphone', 'pencil', 'zap', 'graduation-cap'] as const;
export const COURSE_COLORS = ['orange', 'violet', 'blue', 'green', 'purple', 'pink', 'teal', 'amber'] as const;
export const COURSE_STATUSES = ['active', 'completed', 'archived'] as const;
export const COURSE_RESOURCE_TYPES = ['video', 'pdf', 'other'] as const;

export type CourseIcon = typeof COURSE_ICONS[number];
export type CourseColor = typeof COURSE_COLORS[number];
export type CourseStatus = typeof COURSE_STATUSES[number];