CREATE TYPE "public"."document_outbox_status" AS ENUM('pending', 'done', 'failed');--> statement-breakpoint
CREATE TYPE "public"."document_policy_event" AS ENUM('beforeIssue', 'afterIssue', 'beforeRevoke', 'afterRevoke');--> statement-breakpoint
CREATE TABLE "document_outbox" (
	"id" uuid PRIMARY KEY NOT NULL,
	"school_id" uuid NOT NULL,
	"issued_document_id" uuid NOT NULL,
	"event" "document_policy_event" NOT NULL,
	"fn" varchar(64) NOT NULL,
	"args" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "document_outbox_status" DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_error" text,
	"done_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_parent_shares" (
	"issued_document_id" uuid NOT NULL,
	"parent_id" uuid NOT NULL,
	"shared_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "document_parent_shares_issued_document_id_parent_id_pk" PRIMARY KEY("issued_document_id","parent_id")
);
--> statement-breakpoint
CREATE TABLE "document_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"sub_school_id" uuid,
	"document_type" "document_type" NOT NULL,
	"draft_steps" jsonb,
	"active_version" integer,
	"archived_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_policy_versions" (
	"policy_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"steps" jsonb NOT NULL,
	"note" text,
	"published_by" uuid NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "document_policy_versions_policy_id_version_pk" PRIMARY KEY("policy_id","version")
);
--> statement-breakpoint
ALTER TABLE "issued_documents" ADD COLUMN "policy_id" uuid;--> statement-breakpoint
ALTER TABLE "issued_documents" ADD COLUMN "policy_version" integer;--> statement-breakpoint
ALTER TABLE "document_outbox" ADD CONSTRAINT "document_outbox_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_outbox" ADD CONSTRAINT "document_outbox_issued_document_id_issued_documents_id_fk" FOREIGN KEY ("issued_document_id") REFERENCES "public"."issued_documents"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_parent_shares" ADD CONSTRAINT "document_parent_shares_issued_document_id_issued_documents_id_fk" FOREIGN KEY ("issued_document_id") REFERENCES "public"."issued_documents"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_parent_shares" ADD CONSTRAINT "document_parent_shares_parent_id_parents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_policies" ADD CONSTRAINT "document_policies_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_policies" ADD CONSTRAINT "document_policies_sub_school_id_sub_schools_id_fk" FOREIGN KEY ("sub_school_id") REFERENCES "public"."sub_schools"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_policies" ADD CONSTRAINT "document_policies_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_policy_versions" ADD CONSTRAINT "document_policy_versions_policy_id_document_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."document_policies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_policy_versions" ADD CONSTRAINT "document_policy_versions_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_document_outbox_due" ON "document_outbox" USING btree ("next_attempt_at") WHERE status = 'pending';--> statement-breakpoint
CREATE INDEX "idx_document_outbox_document" ON "document_outbox" USING btree ("issued_document_id");--> statement-breakpoint
CREATE INDEX "idx_document_outbox_school" ON "document_outbox" USING btree ("school_id","status","created_at");--> statement-breakpoint
CREATE INDEX "idx_document_parent_shares_parent" ON "document_parent_shares" USING btree ("parent_id","shared_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_document_policy_group" ON "document_policies" USING btree ("school_id","document_type") WHERE sub_school_id IS NULL AND archived_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_document_policy_sub_school" ON "document_policies" USING btree ("sub_school_id","document_type") WHERE sub_school_id IS NOT NULL AND archived_at IS NULL;--> statement-breakpoint
CREATE INDEX "idx_document_policies_school" ON "document_policies" USING btree ("school_id");--> statement-breakpoint
ALTER TABLE "issued_documents" ADD CONSTRAINT "fk_issued_documents_policy_version" FOREIGN KEY ("policy_id","policy_version") REFERENCES "public"."document_policy_versions"("policy_id","version") ON DELETE no action ON UPDATE no action;