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
	"fileSize" integer,
	"seller_id" integer
);

CREATE TABLE buyer
(
	id serial PRIMARY KEY,
	"createdAt" timestamp with time zone,
	"updatedAt" timestamp with time zone,
	"createdBy" integer,
	"updatedBy" integer,
	buyer_id integer,
	buyer_name character varying
);

CREATE TABLE seller
(
	id serial PRIMARY KEY,
	"createdAt" timestamp with time zone,
	"updatedAt" timestamp with time zone,
	"createdBy" integer,
	"updatedBy" integer,
	seller_id integer,
	seller_name character varying,
	thumbnail character varying
);

CREATE TABLE transaction
(
	id serial PRIMARY KEY,
	"createdAt" timestamp with time zone,
	"updatedAt" timestamp with time zone,
	"createdBy" integer,
	"updatedBy" integer,
	buyer_id integer,
	application_uid character varying
);

CREATE TABLE seller_address
(
	id serial PRIMARY KEY,
	"seller_id" integer,
	"seller_address" varchar,
	"createdAt" timestamp with time zone,
	"updatedAt" timestamp with time zone,
	"createdBy" integer,
	"updatedBy" integer
);
