import { Router } from 'express';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import { validate } from '@/shared/utils/validate';
import { DocumentsController } from './documents.controller';
import {
  activateSchema,
  createFolderSchema,
  createTemplateSchema,
  moveFolderSchema,
  moveTemplateSchema,
  renameSchema,
  idParamsSchema,
  issueSchema,
  listIssuedQuerySchema,
  previewSchema,
  publishSchema,
  revokeSchema,
  saveDraftSchema,
  typeParamsSchema,
} from './documents.schema';

const router = Router();
const controller = new DocumentsController();

/** Who designs templates and revokes documents. */
const manage = authorize('super_admin', 'director');
/** Who sees templates, issues and downloads documents. */
const staff = authorize('super_admin', 'director', 'admin');
const byId = validate({ params: idParamsSchema });

// Public: the QR code printed on every document opens this.
router.get('/verify/:id', byId, controller.verify);

router.use(authenticate);

router.get('/starters', staff, controller.listStarters);
router.get('/types/:type', staff, validate({ params: typeParamsSchema }), controller.describeType);

router.get('/templates', staff, controller.listTemplates);
// Before /templates/:id, so "library" is not read as an id.
router.get('/templates/library', staff, controller.library);

router.post('/folders', manage, validate({ body: createFolderSchema }), controller.createFolder);
router.patch(
  '/folders/:id',
  manage,
  byId,
  validate({ body: renameSchema }),
  controller.renameFolder,
);
router.post(
  '/folders/:id/move',
  manage,
  byId,
  validate({ body: moveFolderSchema }),
  controller.moveFolder,
);
router.delete('/folders/:id', manage, byId, controller.deleteFolder);

router.patch(
  '/templates/:id',
  manage,
  byId,
  validate({ body: renameSchema }),
  controller.renameTemplate,
);
router.post(
  '/templates/:id/move',
  manage,
  byId,
  validate({ body: moveTemplateSchema }),
  controller.moveTemplate,
);
router.post(
  '/templates/:id/duplicate',
  manage,
  byId,
  validate({ body: renameSchema }),
  controller.duplicateTemplate,
);
router.delete('/templates/:id', manage, byId, controller.removeTemplate);
router.post(
  '/templates',
  manage,
  validate({ body: createTemplateSchema }),
  controller.createTemplate,
);
router.get('/templates/:id', staff, byId, controller.getTemplate);
router.get('/templates/:id/versions', staff, byId, controller.listVersions);
router.put(
  '/templates/:id/draft',
  manage,
  byId,
  validate({ body: saveDraftSchema }),
  controller.saveDraft,
);
router.post(
  '/templates/:id/preview',
  staff,
  byId,
  validate({ body: previewSchema }),
  controller.preview,
);
router.post(
  '/templates/:id/publish',
  manage,
  byId,
  validate({ body: publishSchema }),
  controller.publish,
);
router.post(
  '/templates/:id/activate',
  manage,
  byId,
  validate({ body: activateSchema }),
  controller.activate,
);
router.post('/templates/:id/archive', manage, byId, controller.archive);

router.post('/issued', staff, validate({ body: issueSchema }), controller.issue);
router.get('/issued', staff, validate({ query: listIssuedQuerySchema }), controller.listIssued);
router.get('/issued/:id', staff, byId, controller.getIssued);
router.get('/issued/:id/pdf', staff, byId, controller.download);
router.post(
  '/issued/:id/revoke',
  manage,
  byId,
  validate({ body: revokeSchema }),
  controller.revoke,
);

export { router as documentsRouter };
