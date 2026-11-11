import { z } from 'zod';
import type { DocumentTypeDefinition } from '../document-types/define';
import type { LayoutIssue } from '../errors';
import { FORMATTERS, parseVariables } from './variables';
import {
  BLOCK_TYPES,
  assetIdOf,
  blockAssets,
  blockFieldRefs,
  blockTexts,
  layoutSchema,
  type Layout,
} from './layout';

/** `document.*` is added by the engine to every payload. */
const documentMetaSchema = z.object({
  number: z.string(),
  issuedAt: z.string(),
  verifyUrl: z.string(),
});

function unwrap(schema: z.ZodTypeAny): z.ZodTypeAny {
  let current = schema;
  for (;;) {
    if (current instanceof z.ZodOptional || current instanceof z.ZodNullable)
      current = current.unwrap();
    else if (current instanceof z.ZodDefault) current = current.removeDefault();
    else if (current instanceof z.ZodEffects) current = current.innerType();
    else return current;
  }
}

type PathCheck = { ok: true } | { ok: false; reason: string };

/** A variable must point to a single value: not a list, not a whole object. */
function checkPath(payload: z.ZodTypeAny, path: string): PathCheck {
  const keys = path.split('.');
  let node: z.ZodTypeAny = z.object({ document: documentMetaSchema, payload: unwrap(payload) });
  // Payload fields live at the root of the variables, next to `document`.
  const offset = keys[0] === 'document' ? 0 : 1;
  if (offset) keys.unshift('payload');
  const shown = (end: number) => keys.slice(offset, end).join('.');
  for (let i = 0; i < keys.length; i++) {
    if (!(node instanceof z.ZodObject)) {
      return { ok: false, reason: `${shown(i)} has no field ${keys[i]}` };
    }
    const next = (node.shape as Record<string, z.ZodTypeAny>)[keys[i]!];
    if (!next) return { ok: false, reason: `no field ${shown(i + 1)}` };
    node = unwrap(next);
  }
  if (node instanceof z.ZodArray)
    return { ok: false, reason: `${path} is a list, use a dedicated block` };
  if (node instanceof z.ZodRecord)
    return { ok: false, reason: `${path} holds the typed values, insert a field instead` };
  if (node instanceof z.ZodObject)
    return { ok: false, reason: `${path} is an object, pick one of its fields` };
  return { ok: true };
}

export interface VariableInfo {
  /** As written in a template: `student.fullName`, `document.issuedAt`. */
  path: string;
  /** Picks the formatters an editor offers: date, money, words… */
  kind: 'text' | 'number' | 'date';
  nullable: boolean;
}

/**
 * Every variable a template of this type may use: the single values of the
 * payload, plus `document.*`. Lists are left out, they need a dedicated block.
 */
export function variablesOf(type: DocumentTypeDefinition): VariableInfo[] {
  const result: VariableInfo[] = [];
  const walk = (schema: z.ZodTypeAny, prefix: string, nullable: boolean) => {
    const inner = unwrap(schema);
    const isNullable = nullable || inner !== schema;
    if (inner instanceof z.ZodObject) {
      for (const [key, child] of Object.entries(inner.shape as Record<string, z.ZodTypeAny>)) {
        walk(child, prefix ? `${prefix}.${key}` : key, false);
      }
      return;
    }
    // Lists need a dedicated block; the typed values of fields are inserted as fields.
    if (inner instanceof z.ZodArray || inner instanceof z.ZodRecord) return;
    const name = prefix.split('.').pop()!;
    const kind =
      inner instanceof z.ZodNumber ? 'number' : /date|issuedAt/i.test(name) ? 'date' : 'text';
    result.push({ path: prefix, kind, nullable: isNullable });
  };
  walk(unwrap(type.payload), '', false);
  walk(documentMetaSchema, 'document', false);
  return result;
}

export interface ValidateOptions {
  /** Ids of the assets the template's school may use. Omit to skip the check. */
  assetIds?: ReadonlySet<string>;
}

export type ValidationResult =
  | { ok: true; layout: Layout; issues: [] }
  | { ok: false; issues: LayoutIssue[] };

/**
 * Checks a template before it is saved or published: known blocks with valid
 * properties, blocks allowed for the type, variables that exist in the
 * payload, known formatters, assets that belong to the school, required blocks.
 * Returns every issue at once, so the back-office can show them all.
 */
export function validateLayout(
  input: unknown,
  type: DocumentTypeDefinition,
  options: ValidateOptions = {},
): ValidationResult {
  const issues: LayoutIssue[] = [];

  // Unknown block types first: zod would only report a vague union error.
  const rawBlocks = (input as { blocks?: unknown })?.blocks;
  if (Array.isArray(rawBlocks)) {
    rawBlocks.forEach((block, i) => {
      const blockType = (block as { type?: unknown })?.type;
      if (typeof blockType !== 'string' || !BLOCK_TYPES.includes(blockType as never)) {
        issues.push({
          code: 'UNKNOWN_BLOCK',
          path: `blocks.${i}.type`,
          message: `Unknown block ${JSON.stringify(blockType)}`,
        });
      }
    });
  }

  const parsed = layoutSchema.safeParse(input);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      if (issue.code === 'invalid_union_discriminator') continue;
      issues.push({ code: 'INVALID_LAYOUT', path: issue.path.join('.'), message: issue.message });
    }
    return { ok: false, issues };
  }
  const layout = parsed.data;

  if (layout.fields.length > 0 && !type.manualFields) {
    issues.push({
      code: 'FIELDS_NOT_ALLOWED',
      path: 'fields',
      message: `A ${type.key} is filled from the modules, it takes no typed fields`,
    });
  }

  const fieldKeys = new Set<string>();
  layout.fields.forEach((field, i) => {
    if (fieldKeys.has(field.key)) {
      issues.push({
        code: 'DUPLICATE_FIELD',
        path: `fields.${i}.key`,
        message: `Two fields are named ${field.key}`,
      });
    }
    fieldKeys.add(field.key);
  });

  layout.blocks.forEach((block, i) => {
    const at = `blocks.${i}`;
    if (!type.blocks.includes(block.type)) {
      issues.push({
        code: 'BLOCK_NOT_ALLOWED',
        path: `${at}.type`,
        message: `Block ${block.type} is not allowed in a ${type.key}`,
      });
    }
    for (const { path, text } of blockTexts(block)) {
      for (const ref of parseVariables(text)) {
        const check = checkPath(type.payload, ref.path);
        if (!check.ok) {
          issues.push({
            code: 'UNKNOWN_VARIABLE',
            path: `${at}.${path}`,
            message: `${ref.raw}: ${check.reason}`,
          });
        }
        for (const { name } of ref.formatters) {
          if (!FORMATTERS[name]) {
            issues.push({
              code: 'UNKNOWN_FORMATTER',
              path: `${at}.${path}`,
              message: `${ref.raw}: unknown formatter |${name}`,
            });
          }
        }
      }
    }
    for (const { path, key } of blockFieldRefs(block)) {
      if (!fieldKeys.has(key)) {
        issues.push({
          code: 'UNKNOWN_FIELD',
          path: `${at}.${path}`,
          message: `The field ${key} is not defined in this template`,
        });
      }
    }
    if (options.assetIds) {
      for (const { path, ref } of blockAssets(block)) {
        if (!options.assetIds.has(assetIdOf(ref))) {
          issues.push({
            code: 'UNKNOWN_ASSET',
            path: `${at}.${path}`,
            message: `${ref} does not exist for this school`,
          });
        }
      }
    }
  });

  for (const required of type.requiredBlocks) {
    if (!layout.blocks.some((block) => block.type === required)) {
      issues.push({
        code: 'REQUIRED_BLOCK_MISSING',
        path: 'blocks',
        message: `A ${type.key} needs a ${required} block`,
      });
    }
  }

  return issues.length === 0 ? { ok: true, layout, issues: [] } : { ok: false, issues };
}
