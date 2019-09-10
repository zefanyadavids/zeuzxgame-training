CREATE TABLE seller_uploadedfile (
	"id" serial PRIMARY KEY,
	"createdAt" timestamp with time zone,
	"updatedAt" timestamp with time zone,
	"createdBy" integer,	
	"updatedBy" integer,

	"UUID" varchar,
	"sourceNum" integer,
	"sourceName" varchar,
	"filePath" varchar,
	"fileType" varchar,
	"fileName" varchar,
	"fileSize" integer
);