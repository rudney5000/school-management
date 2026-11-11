import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import {
  DocumentError,
  getDocumentType,
  STARTERS,
  variablesOf,
  type Actor,
  type IssuedDocument,
} from '@school-hub/documents';
import { db } from '@/db';
import { subSchools } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import {
  assertSubSchoolAllowed,
  resolveSchoolId,
} from '@/shared/utils/resolvers/subSchoolId/subSchool.resolver';
import { getDocuments } from './documents.module';
import type { z } from 'zod';
import type {
  activateSchema,
  createFolderSchema,
  moveFolderSchema,
  moveTemplateSchema,
  renameSchema,
  createTemplateSchema,
  issueSchema,
  listIssuedQuerySchema,
  previewSchema,
  publishSchema,
  revokeSchema,
  saveDraftSchema,
} from './documents.schema';

/** super_admin is the platform team: it reaches every school. */
function actorOf(req: Request): Actor {
  const user = req.user!;
  return { userId: user.id, schoolId: user.role === 'super_admin' ? null : user.schoolId };
}

function sendPdf(res: Response, pdf: Uint8Array, filename: string, inline = false) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `${inline ? 'inline' : 'attachment'}; filename="${filename.replace(/[^\w.-]/g, '_')}"`,
  );
  res.send(Buffer.from(pdf));
}

/** The sub-school a request acts on, checked against the token. */
async function subSchoolOf(req: Request, requested: string | undefined) {
  const subSchoolId = requested ?? req.user!.subSchoolId;
  if (!subSchoolId) throw new AppError('BAD_REQUEST', 'subSchoolId is required', 400);
  await assertSubSchoolAllowed(req, subSchoolId);
  const [row] = await db
    .select({ id: subSchools.id, schoolId: subSchools.schoolId, code: subSchools.code })
    .from(subSchools)
    .where(eq(subSchools.id, subSchoolId));
  if (!row) throw new AppError('FORBIDDEN', 'Accès refusé à cette sous-école', 403);
  return row;
}

/**
 * The group a request acts on. `?subSchoolId=` names it through one of its
 * sub-schools (checked against the token), so super_admin needs no ?schoolId=.
 */
async function schoolOf(req: Request): Promise<string> {
  const requested = (req.query as { subSchoolId?: unknown }).subSchoolId;
  if (typeof requested === 'string' && requested) {
    return (await subSchoolOf(req, requested)).schoolId;
  }
  return resolveSchoolId(req);
}

/**
 * The package isolates schools; a user whose token names one sub-school is
 * further confined to it, like everywhere else in the app.
 */
async function ownDocument(req: Request, id: string): Promise<IssuedDocument> {
  const doc = await getDocuments().issuing.find(actorOf(req), id);
  const own = req.user!.subSchoolId;
  if (own && req.user!.role !== 'super_admin' && doc.subSchoolId !== own) {
    throw new DocumentError('NOT_FOUND', `Document ${id} not found`);
  }
  return doc;
}

export class DocumentsController {
  listStarters = asyncHandler(async (_req, res) => {
    respond(
      res,
      STARTERS.map(({ key, name, documentType }) => ({ key, name, documentType })),
    );
  });

  /** What a template of this type may contain: its variables and its blocks. */
  describeType = asyncHandler(async (req, res) => {
    const type = getDocumentType(req.params.type!);
    respond(res, {
      key: type.key,
      variables: variablesOf(type),
      blocks: type.blocks,
      requiredBlocks: type.requiredBlocks,
      sample: type.sample,
    });
  });

  listTemplates = asyncHandler(async (req, res) => {
    respond(res, await getDocuments().templates.list(actorOf(req), await schoolOf(req)));
  });

  createTemplate = asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof createTemplateSchema>;
    const schoolId = await schoolOf(req);
    const subSchoolId = body.subSchoolId ?? null;
    if (subSchoolId) {
      const subSchool = await subSchoolOf(req, subSchoolId);
      if (subSchool.schoolId !== schoolId) {
        throw new AppError('FORBIDDEN', 'Accès refusé à cette sous-école', 403);
      }
    }
    const starter = STARTERS.find((s) => s.key === body.starter);
    if (starter && starter.documentType !== body.documentType) {
      throw new AppError('BAD_REQUEST', `${starter.key} is a ${starter.documentType} design`, 400);
    }
    const template = await getDocuments().templates.create(actorOf(req), {
      scope: { schoolId, subSchoolId },
      documentType: body.documentType,
      name: body.name,
      layout: (starter?.layout ?? body.layout) as never,
      folderId: body.folderId ?? null,
    });
    respond(res, template, 201);
  });

  /** The template page: folders and live templates of the school. */
  library = asyncHandler(async (req, res) => {
    respond(res, await getDocuments().templates.library(actorOf(req), await schoolOf(req)));
  });

  createFolder = asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof createFolderSchema>;
    const folder = await getDocuments().templates.createFolder(actorOf(req), {
      schoolId: await schoolOf(req),
      parentId: body.parentId,
      name: body.name,
    });
    respond(res, folder, 201);
  });

  renameFolder = asyncHandler(async (req, res) => {
    const { name } = req.body as z.infer<typeof renameSchema>;
    await getDocuments().templates.renameFolder(actorOf(req), req.params.id!, name);
    res.status(204).end();
  });

  moveFolder = asyncHandler(async (req, res) => {
    const { parentId, index } = req.body as z.infer<typeof moveFolderSchema>;
    await getDocuments().templates.moveFolder(actorOf(req), req.params.id!, parentId, index);
    res.status(204).end();
  });

  deleteFolder = asyncHandler(async (req, res) => {
    await getDocuments().templates.deleteFolder(actorOf(req), req.params.id!);
    res.status(204).end();
  });

  renameTemplate = asyncHandler(async (req, res) => {
    const { name } = req.body as z.infer<typeof renameSchema>;
    await getDocuments().templates.renameTemplate(actorOf(req), req.params.id!, name);
    respond(res, await getDocuments().templates.find(actorOf(req), req.params.id!));
  });

  moveTemplate = asyncHandler(async (req, res) => {
    const { folderId, index } = req.body as z.infer<typeof moveTemplateSchema>;
    await getDocuments().templates.moveTemplate(actorOf(req), req.params.id!, folderId, index);
    res.status(204).end();
  });

  duplicateTemplate = asyncHandler(async (req, res) => {
    const { name } = req.body as z.infer<typeof renameSchema>;
    respond(res, await getDocuments().templates.duplicate(actorOf(req), req.params.id!, name), 201);
  });

  /** Deleted when never published, archived otherwise. */
  removeTemplate = asyncHandler(async (req, res) => {
    respond(res, { result: await getDocuments().templates.remove(actorOf(req), req.params.id!) });
  });

  getTemplate = asyncHandler(async (req, res) => {
    respond(res, await getDocuments().templates.find(actorOf(req), req.params.id!));
  });

  listVersions = asyncHandler(async (req, res) => {
    respond(res, await getDocuments().templates.versions(actorOf(req), req.params.id!));
  });

  saveDraft = asyncHandler(async (req, res) => {
    const { layout } = req.body as z.infer<typeof saveDraftSchema>;
    await getDocuments().templates.saveDraft(actorOf(req), req.params.id!, layout as never);
    respond(res, await getDocuments().templates.find(actorOf(req), req.params.id!));
  });

  preview = asyncHandler(async (req, res) => {
    const { version, layout } = req.body as z.infer<typeof previewSchema>;
    const pdf = await getDocuments().templates.preview(actorOf(req), req.params.id!, {
      version,
      layout,
    });
    sendPdf(res, pdf, 'apercu.pdf', true);
  });

  publish = asyncHandler(async (req, res) => {
    const { note } = req.body as z.infer<typeof publishSchema>;
    const version = await getDocuments().templates.publish(
      actorOf(req),
      req.params.id!,
      note ?? null,
    );
    respond(res, version, 201);
  });

  activate = asyncHandler(async (req, res) => {
    const { version } = req.body as z.infer<typeof activateSchema>;
    await getDocuments().templates.activate(actorOf(req), req.params.id!, version);
    respond(res, await getDocuments().templates.find(actorOf(req), req.params.id!));
  });

  archive = asyncHandler(async (req, res) => {
    await getDocuments().templates.archive(actorOf(req), req.params.id!);
    respond(res, await getDocuments().templates.find(actorOf(req), req.params.id!));
  });

  issue = asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof issueSchema>;
    const subSchool = await subSchoolOf(req, body.subSchoolId);
    const doc = await getDocuments().issuing.issue({
      type: body.type,
      scope: {
        schoolId: subSchool.schoolId,
        subSchoolId: subSchool.id,
        subSchoolCode: subSchool.code,
      },
      params: body.params,
      actor: actorOf(req),
      locale: body.locale,
      replaces: body.replaces,
      templateId: body.templateId,
      fields: body.fields,
    });
    respond(res, doc, 201);
  });

  listIssued = asyncHandler(async (req, res) => {
    const query = req.query as unknown as z.infer<typeof listIssuedQuerySchema>;
    const requested = query.subSchoolId ?? req.user!.subSchoolId;
    // A sub-school names its group: super_admin needs no ?schoolId= then.
    const subSchool = requested ? await subSchoolOf(req, requested) : null;
    const schoolId = subSchool?.schoolId ?? resolveSchoolId(req);
    const subSchoolId = subSchool?.id;
    const docs = await getDocuments().issuing.list(actorOf(req), schoolId, {
      subSchoolId,
      documentType: query.documentType,
      subjectId: query.subjectId,
      limit: query.limit,
    });
    respond(res, docs);
  });

  getIssued = asyncHandler(async (req, res) => {
    respond(res, await ownDocument(req, req.params.id!));
  });

  download = asyncHandler(async (req, res) => {
    const doc = await ownDocument(req, req.params.id!);
    const { pdf } = await getDocuments().issuing.download(actorOf(req), doc.id);
    sendPdf(res, pdf, `${doc.number}.pdf`);
  });

  revoke = asyncHandler(async (req, res) => {
    const { reason } = req.body as z.infer<typeof revokeSchema>;
    const doc = await ownDocument(req, req.params.id!);
    respond(res, await getDocuments().issuing.revoke(actorOf(req), doc.id, reason));
  });

  /** Public: what the QR code opens. No grades, no amounts. */
  verify = asyncHandler(async (req, res) => {
    respond(res, await getDocuments().issuing.verify(req.params.id!));
  });
}
