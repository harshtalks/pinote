import * as t from "drizzle-orm/sqlite-core";

export const createdAtSchema = t.integer().default(Date.now());
export const updatedAtSchema = t.integer().default(Date.now());
