CREATE TYPE "public"."identifier_type" AS ENUM('email', 'phone', 'username');--> statement-breakpoint
CREATE TABLE "user_identifiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "identifier_type" NOT NULL,
	"value" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_identifiers_value_unique" UNIQUE("value")
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" varchar(50);--> statement-breakpoint
ALTER TABLE "user_identifiers" ADD CONSTRAINT "user_identifiers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- Backfill: login now resolves accounts through user_identifiers only, so every
-- existing email must get its row or that account can no longer log in.
-- Deliberately no ON CONFLICT: two accounts whose emails differ only by case
-- must stop the migration instead of silently locking one of them out.
INSERT INTO "user_identifiers" ("user_id", "type", "value")
SELECT "users"."id", 'email', lower(trim("users"."email"))
FROM "users"
WHERE "users"."email" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "user_identifiers"
    WHERE "user_identifiers"."user_id" = "users"."id" AND "user_identifiers"."type" = 'email'
  );
