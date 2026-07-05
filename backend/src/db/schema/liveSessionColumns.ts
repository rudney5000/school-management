import {boolean, text} from "drizzle-orm/pg-core";

export const liveSessionColumns = {
    isLiveSession: boolean('is_live_session').notNull().default(false),
    liveUrl: text('live_url'),
};