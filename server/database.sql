CREATE TABLE IF NOT EXISTS public.experience
(
    id serial NOT NULL,
    "startDate" character varying,
    "endDate" character varying,
    "jobTitle" character varying,
    company character varying,
    "companyLogo" character varying,
    "jobDescription" character varying,
    user_id integer,
    PRIMARY KEY (id)
);

ALTER TABLE public.experience
    OWNER to postgres;