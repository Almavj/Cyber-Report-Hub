CREATE TABLE "writeups" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"summary" text,
	"content" text NOT NULL,
	"severity" text DEFAULT 'medium' NOT NULL,
	"platform" text NOT NULL,
	"bounty_amount" numeric,
	"cve_id" text,
	"tags" json DEFAULT '[]'::json NOT NULL,
	"attachments" json DEFAULT '[]'::json NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "writeups_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"target" text NOT NULL,
	"vulnerability" text NOT NULL,
	"severity" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"reward" numeric,
	"description" text,
	"steps_to_reproduce" text,
	"impact" text,
	"attachments" json DEFAULT '[]'::json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#00ff88' NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
