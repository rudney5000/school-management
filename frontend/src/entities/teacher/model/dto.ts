export type TeacherParamsDto = {
  id: string;
};

export type TeacherListQueryDto = {
  subSchoolId: string;
};

export type TeacherDossierStatusDto = {
  isComplete: boolean;
  missing: string[];
};
