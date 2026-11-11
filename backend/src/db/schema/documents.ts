import {
  assetKindEnum,
  documentTables,
  documentTypeEnum,
  issuedStatusEnum,
  subjectTypeEnum,
} from '@school-hub/documents';
import { schools } from './school';
import { subSchools } from './subSchool';
import { users } from './users';

// Re-exported so drizzle-kit sees the enums and puts them in the migration.
export { assetKindEnum, documentTypeEnum, issuedStatusEnum, subjectTypeEnum };

export const {
  documentFolders,
  documentTemplates,
  documentTemplateVersions,
  templateAssets,
  issuedDocuments,
  documentNumberSequences,
} = documentTables({ schools, subSchools, users });
