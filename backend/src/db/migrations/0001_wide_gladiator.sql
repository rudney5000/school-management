ALTER TABLE "live_sessions" ADD CONSTRAINT "check_live_session_at_most_one_target" CHECK ((
        ("live_sessions"."course_id" IS NOT NULL)::int +
        ("live_sessions"."schedule_id" IS NOT NULL)::int +
        ("live_sessions"."event_id" IS NOT NULL)::int +
        ("live_sessions"."exam_id" IS NOT NULL)::int +
        ("live_sessions"."conversation_id" IS NOT NULL)::int
    ) <= 1);