CREATE TABLE IF NOT EXISTS "course_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"title" varchar(150) NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "icon" varchar(30) DEFAULT 'book-open' NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "color" varchar(20) DEFAULT 'blue' NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "thumbnail_url" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "teacher_id" uuid;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "total_lessons" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "total_hours" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "status" varchar(20) DEFAULT 'active' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_resources" ADD CONSTRAINT "course_resources_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "courses" ADD CONSTRAINT "courses_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
