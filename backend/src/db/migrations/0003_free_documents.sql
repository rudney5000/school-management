ALTER TYPE "public"."document_type" ADD VALUE 'free';--> statement-breakpoint
DROP INDEX "uniq_document_template_group";--> statement-breakpoint
DROP INDEX "uniq_document_template_sub_school";--> statement-breakpoint
ALTER TABLE "issued_documents" ALTER COLUMN "subject_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "issued_documents" ALTER COLUMN "subject_id" DROP NOT NULL;