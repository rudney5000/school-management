CREATE TYPE "public"."template_asset_kind" AS ENUM('logo', 'stamp', 'signature', 'background', 'image');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('bulletin', 'receipt', 'certificate', 'diploma', 'enrollment', 'reenrollment', 'supplies');--> statement-breakpoint
CREATE TYPE "public"."issued_document_status" AS ENUM('issued', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."document_subject_type" AS ENUM('student', 'payment', 'class', 'level', 'teacher');--> statement-breakpoint
CREATE TABLE "document_number_sequences" (
	"sub_school_id" uuid NOT NULL,
	"document_type" "document_type" NOT NULL,
	"period" varchar(16) NOT NULL,
	"last_number" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "document_number_sequences_sub_school_id_document_type_period_pk" PRIMARY KEY("sub_school_id","document_type","period")
);
--> statement-breakpoint
CREATE TABLE "document_template_versions" (
	"template_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"layout" jsonb NOT NULL,
	"layout_format" integer DEFAULT 1 NOT NULL,
	"note" text,
	"published_by" uuid NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "document_template_versions_template_id_version_pk" PRIMARY KEY("template_id","version")
);
--> statement-breakpoint
CREATE TABLE "document_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"sub_school_id" uuid,
	"document_type" "document_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"draft_layout" jsonb,
	"active_version" integer,
	"archived_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "issued_documents" (
	"id" uuid PRIMARY KEY NOT NULL,
	"school_id" uuid NOT NULL,
	"sub_school_id" uuid NOT NULL,
	"document_type" "document_type" NOT NULL,
	"number" varchar(64) NOT NULL,
	"subject_type" "document_subject_type" NOT NULL,
	"subject_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"template_version" integer NOT NULL,
	"payload" jsonb NOT NULL,
	"payload_version" integer NOT NULL,
	"content_hash" varchar(64) NOT NULL,
	"pdf_key" text NOT NULL,
	"status" "issued_document_status" DEFAULT 'issued' NOT NULL,
	"revoked_at" timestamp with time zone,
	"revoked_reason" text,
	"replaces_id" uuid,
	"signed_by_user_id" uuid,
	"signed_at" timestamp with time zone,
	"issued_by" uuid NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"sub_school_id" uuid,
	"kind" "template_asset_kind" NOT NULL,
	"s3_key" text NOT NULL,
	"mime" varchar(50) NOT NULL,
	"width" integer,
	"height" integer,
	"size_bytes" integer NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document_number_sequences" ADD CONSTRAINT "document_number_sequences_sub_school_id_sub_schools_id_fk" FOREIGN KEY ("sub_school_id") REFERENCES "public"."sub_schools"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_template_versions" ADD CONSTRAINT "document_template_versions_template_id_document_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."document_templates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_template_versions" ADD CONSTRAINT "document_template_versions_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_sub_school_id_sub_schools_id_fk" FOREIGN KEY ("sub_school_id") REFERENCES "public"."sub_schools"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issued_documents" ADD CONSTRAINT "issued_documents_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issued_documents" ADD CONSTRAINT "issued_documents_sub_school_id_sub_schools_id_fk" FOREIGN KEY ("sub_school_id") REFERENCES "public"."sub_schools"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issued_documents" ADD CONSTRAINT "issued_documents_signed_by_user_id_users_id_fk" FOREIGN KEY ("signed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issued_documents" ADD CONSTRAINT "issued_documents_issued_by_users_id_fk" FOREIGN KEY ("issued_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issued_documents" ADD CONSTRAINT "fk_issued_documents_template_version" FOREIGN KEY ("template_id","template_version") REFERENCES "public"."document_template_versions"("template_id","version") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issued_documents" ADD CONSTRAINT "fk_issued_documents_replaces" FOREIGN KEY ("replaces_id") REFERENCES "public"."issued_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_assets" ADD CONSTRAINT "template_assets_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_assets" ADD CONSTRAINT "template_assets_sub_school_id_sub_schools_id_fk" FOREIGN KEY ("sub_school_id") REFERENCES "public"."sub_schools"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_assets" ADD CONSTRAINT "template_assets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_document_template_group" ON "document_templates" USING btree ("school_id","document_type") WHERE sub_school_id IS NULL AND archived_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_document_template_sub_school" ON "document_templates" USING btree ("sub_school_id","document_type") WHERE sub_school_id IS NOT NULL AND archived_at IS NULL;--> statement-breakpoint
CREATE INDEX "idx_document_templates_school" ON "document_templates" USING btree ("school_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_issued_document_number" ON "issued_documents" USING btree ("sub_school_id","document_type","number");--> statement-breakpoint
CREATE INDEX "idx_issued_documents_subject" ON "issued_documents" USING btree ("subject_type","subject_id");--> statement-breakpoint
CREATE INDEX "idx_issued_documents_sub_school" ON "issued_documents" USING btree ("sub_school_id","document_type","issued_at");--> statement-breakpoint
CREATE INDEX "idx_issued_documents_replaces" ON "issued_documents" USING btree ("replaces_id");--> statement-breakpoint
CREATE INDEX "idx_template_assets_school" ON "template_assets" USING btree ("school_id");