CREATE TABLE "reading" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_id" text NOT NULL,
	"reading_type" varchar(32) NOT NULL,
	"value" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reading" ADD CONSTRAINT "reading_device_id_device_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."device"("id") ON DELETE cascade ON UPDATE no action;