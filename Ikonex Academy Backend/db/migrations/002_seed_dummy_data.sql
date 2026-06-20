-- =============================================
-- Ikonex Academy - Dummy Data Seed
-- =============================================

-- 1. Insert Streams
INSERT INTO streams (name, year) VALUES 
('Form 1A', 2026),
('Form 1B', 2026),
('Form 2A', 2026),
('Form 2B', 2026)
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Subjects
INSERT INTO subjects (name, code, description) VALUES 
('Mathematics', 'MATH01', 'Core Mathematics'),
('English Language', 'ENG01', 'Core English Language'),
('Integrated Science', 'SCI01', 'Core Science'),
('Social Studies', 'SOC01', 'Core Social Studies'),
('Computer Science', 'COMP01', 'Elective Computer Science')
ON CONFLICT (code) DO NOTHING;
-- Since name is also unique, ON CONFLICT (name) or (code) might fail if the constraints don't match exactly.
-- The schema has UNIQUE(name) and UNIQUE(code).

-- 3. Assign Subjects to Streams
-- Let's assign all subjects to Form 1A and Form 1B
INSERT INTO stream_subjects (stream_id, subject_id)
SELECT st.id, su.id
FROM streams st, subjects su
WHERE st.name IN ('Form 1A', 'Form 1B')
ON CONFLICT DO NOTHING;

-- 4. Insert Students
INSERT INTO students (first_name, last_name, admission_number, date_of_birth, gender, stream_id) VALUES 
('John', 'Doe', 'ADM-001', '2010-05-14', 'Male', (SELECT id FROM streams WHERE name = 'Form 1A')),
('Jane', 'Smith', 'ADM-002', '2010-08-22', 'Female', (SELECT id FROM streams WHERE name = 'Form 1A')),
('Michael', 'Johnson', 'ADM-003', '2010-01-30', 'Male', (SELECT id FROM streams WHERE name = 'Form 1A')),
('Emily', 'Davis', 'ADM-004', '2010-11-05', 'Female', (SELECT id FROM streams WHERE name = 'Form 1A')),
('David', 'Wilson', 'ADM-005', '2009-03-12', 'Male', (SELECT id FROM streams WHERE name = 'Form 1B')),
('Sarah', 'Brown', 'ADM-006', '2009-07-19', 'Female', (SELECT id FROM streams WHERE name = 'Form 1B')),
('Chris', 'Taylor', 'ADM-007', '2009-12-01', 'Male', (SELECT id FROM streams WHERE name = 'Form 1B')),
('Amanda', 'Anderson', 'ADM-008', '2009-09-25', 'Female', (SELECT id FROM streams WHERE name = 'Form 1B'))
ON CONFLICT (admission_number) DO NOTHING;

-- 5. Insert Scores
-- Term 1, 2026 for all students in Form 1A and 1B for Mathematics and English
INSERT INTO scores (student_id, subject_id, ca_score, exam_score, term, year)
SELECT 
    st.id as student_id,
    su.id as subject_id,
    floor(random() * 20 + 15) as ca_score, -- Random CA score between 15 and 35
    floor(random() * 30 + 20) as exam_score, -- Random Exam score between 20 and 50
    'Term 1',
    2026
FROM students st
CROSS JOIN subjects su
WHERE su.code IN ('MATH01', 'ENG01', 'SCI01', 'SOC01')
ON CONFLICT (student_id, subject_id, term, year) DO NOTHING;
