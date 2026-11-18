CREATE TABLE project (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL
);

CREATE TABLE cable (
    id                   BIGSERIAL PRIMARY KEY,
    project_id           BIGINT       NOT NULL REFERENCES project (id),
    code                 VARCHAR(60)  NOT NULL,
    cable_type           VARCHAR(60),
    origin_location      VARCHAR(120) NOT NULL,
    origin_detail        VARCHAR(120),
    destination_location VARCHAR(120) NOT NULL,
    destination_detail   VARCHAR(120),
    CONSTRAINT uq_cable_project_code UNIQUE (project_id, code)
);
