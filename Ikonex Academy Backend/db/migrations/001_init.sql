-- =============================================
-- Ikonex Academy - Database Schema
-- Run: psql -d ikonex_academy -f 001_init.sql
-- =============================================

-- Class streams (e.g. Form 1A, Form 2B)
CREATE TABLE IF NOT EXISTS streams (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(50)  NOT NULL UNIQUE,  -- e.g. "Form 1A"
  year        INTEGER      NOT NULL,          -- academic year e.g. 2026
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id               SERIAL PRIMARY KEY,
  first_name       VARCHAR(100) NOT NULL,
  last_name        VARCHAR(100) NOT NULL,
  admission_number VARCHAR(30)  NOT NULL UNIQUE,
  date_of_birth    DATE,
  gender           VARCHAR(10)  CHECK (gender IN ('Male', 'Female', 'Other')),
  stream_id        INTEGER      REFERENCES streams(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  code        VARCHAR(20)  NOT NULL UNIQUE,  -- e.g. "MATH01"
  description TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Subjects assigned to streams (many-to-many)
CREATE TABLE IF NOT EXISTS stream_subjects (
  stream_id   INTEGER NOT NULL REFERENCES streams(id)  ON DELETE CASCADE,
  subject_id  INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  PRIMARY KEY (stream_id, subject_id)
);

-- Scores: one row per student + subject + term + year
CREATE TABLE IF NOT EXISTS scores (
  id          SERIAL PRIMARY KEY,
  student_id  INTEGER      NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id  INTEGER      NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  ca_score    NUMERIC(5,2) NOT NULL CHECK (ca_score    >= 0 AND ca_score    <= 40),
  exam_score  NUMERIC(5,2) NOT NULL CHECK (exam_score  >= 0 AND exam_score  <= 60),
  total_score NUMERIC(5,2) GENERATED ALWAYS AS (ca_score + exam_score) STORED,
  term        VARCHAR(20)  NOT NULL CHECK (term IN ('Term 1', 'Term 2', 'Term 3')),
  year        INTEGER      NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  -- Prevent duplicate score entry for same student+subject+term+year
  UNIQUE (student_id, subject_id, term, year)
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_students_stream    ON students(stream_id);
CREATE INDEX IF NOT EXISTS idx_scores_student     ON scores(student_id);
CREATE INDEX IF NOT EXISTS idx_scores_subject     ON scores(subject_id);
CREATE INDEX IF NOT EXISTS idx_scores_term_year   ON scores(term, year);
