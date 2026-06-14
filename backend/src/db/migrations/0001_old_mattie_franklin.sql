ALTER TABLE "schedules" ADD COLUMN "sub_school_id" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "schedules" ADD CONSTRAINT "schedules_sub_school_id_sub_schools_id_fk" FOREIGN KEY ("sub_school_id") REFERENCES "public"."sub_schools"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
