CREATE TYPE "public"."curriculum_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."curriculum_type" AS ENUM('national', 'school');--> statement-breakpoint
ALTER TYPE "public"."attachable_type" ADD VALUE 'curriculum';--> statement-breakpoint
ALTER TYPE "public"."attachment_category" ADD VALUE 'curriculum' BEFORE 'other';--> statement-breakpoint
CREATE TABLE "curricula" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sub_school_id" uuid NOT NULL,
	"title" varchar(150) NOT NULL,
	"description" text,
	"type" "curriculum_type" NOT NULL,
	"course_id" uuid,
	"school_year" varchar(9) NOT NULL,
	"status" "curriculum_status" DEFAULT 'draft' NOT NULL,
	"created_by" uuid,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curriculum_classes" (
	"curriculum_id" uuid NOT NULL,
	"class_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "curricula" ADD CONSTRAINT "curricula_sub_school_id_sub_schools_id_fk" FOREIGN KEY ("sub_school_id") REFERENCES "public"."sub_schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curricula" ADD CONSTRAINT "curricula_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curricula" ADD CONSTRAINT "curricula_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_classes" ADD CONSTRAINT "curriculum_classes_curriculum_id_curricula_id_fk" FOREIGN KEY ("curriculum_id") REFERENCES "public"."curricula"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_classes" ADD CONSTRAINT "curriculum_classes_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_curricula_sub_school_year" ON "curricula" USING btree ("sub_school_id","school_year");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_curriculum_classes_unique" ON "curriculum_classes" USING btree ("curriculum_id","class_id");--> statement-breakpoint
CREATE INDEX "idx_curriculum_classes_class" ON "curriculum_classes" USING btree ("class_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_attachments_curriculum_key" ON "attachments" USING btree ("key") WHERE "attachments"."key" LIKE 'schools/%/curriculums/%';