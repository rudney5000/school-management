import { layoutSchema } from '../engine/layout';
import { DocumentError, type LayoutIssue } from '../errors';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value: string): boolean {
  if (!DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

/**
 * Checks the values typed for a template's fields: every required field is
 * filled, dates are real dates (YYYY-MM-DD), numbers are numbers, and no
 * value is given for a field the template does not have. Returns the trimmed
 * values, or null when the template has no fields.
 */
export function checkFieldValues(
  layoutInput: unknown,
  values: Record<string, unknown>,
): Record<string, string> | null {
  const layout = layoutSchema.parse(layoutInput);
  const known = new Set(layout.fields.map((field) => field.key));
  const issues: LayoutIssue[] = [];
  const result: Record<string, string> = {};

  for (const key of Object.keys(values)) {
    if (!known.has(key)) {
      issues.push({
        code: 'INVALID_FIELDS',
        path: key,
        message: 'This template has no such field',
      });
    }
  }

  for (const field of layout.fields) {
    const raw = values[field.key];
    const value = typeof raw === 'number' ? String(raw) : typeof raw === 'string' ? raw.trim() : '';
    if (raw !== undefined && raw !== null && typeof raw !== 'string' && typeof raw !== 'number') {
      issues.push({ code: 'INVALID_FIELDS', path: field.key, message: 'Expected a text value' });
      continue;
    }
    if (!value) {
      if (field.required) {
        issues.push({
          code: 'INVALID_FIELDS',
          path: field.key,
          message: `${field.label} is required`,
        });
      }
      continue;
    }
    if (field.type === 'date' && !isRealDate(value)) {
      issues.push({
        code: 'INVALID_FIELDS',
        path: field.key,
        message: `${field.label}: expected a date`,
      });
      continue;
    }
    if (field.type === 'number' && !Number.isFinite(Number(value.replace(',', '.')))) {
      issues.push({
        code: 'INVALID_FIELDS',
        path: field.key,
        message: `${field.label}: expected a number`,
      });
      continue;
    }
    if (value.length > (field.type === 'longText' ? 2000 : 300)) {
      issues.push({
        code: 'INVALID_FIELDS',
        path: field.key,
        message: `${field.label} is too long`,
      });
      continue;
    }
    result[field.key] = field.type === 'number' ? value.replace(',', '.') : value;
  }

  if (issues.length) {
    throw new DocumentError('INVALID_FIELDS', `${issues.length} field(s) to correct`, issues);
  }
  return layout.fields.length ? result : null;
}
