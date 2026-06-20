-- =============================================
-- Ikonex Academy - Comprehensive Kenyan Dummy Data Seed
-- =============================================

-- 1. Insert Streams (Forms 1 through 4)
INSERT INTO streams (name, year) VALUES 
('Form 1A', 2026), ('Form 1B', 2026),
('Form 2A', 2026), ('Form 2B', 2026),
('Form 3A', 2026), ('Form 3B', 2026),
('Form 4A', 2026), ('Form 4B', 2026)
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Subjects
INSERT INTO subjects (name, code, description) VALUES 
('Mathematics', 'MATH01', 'Core Mathematics'),
('English Language', 'ENG01', 'Core English Language'),
('Kiswahili', 'KISW01', 'Core Kiswahili'),
('Chemistry', 'CHEM01', 'Science - Chemistry'),
('Biology', 'BIO01', 'Science - Biology'),
('Physics', 'PHY01', 'Science - Physics'),
('History and Government', 'HIST01', 'Humanities - History'),
('Geography', 'GEO01', 'Humanities - Geography'),
('Business Studies', 'BUS01', 'Technical - Business Studies'),
('Agriculture', 'AGR01', 'Technical - Agriculture')
ON CONFLICT (code) DO NOTHING;

-- 3. Assign Subjects to Streams (All streams get all subjects for simplicity)
INSERT INTO stream_subjects (stream_id, subject_id)
SELECT st.id, su.id
FROM streams st
CROSS JOIN subjects su
ON CONFLICT DO NOTHING;

-- 4. Insert Students (Kenyan Names, distributed across streams)
INSERT INTO students (first_name, last_name, admission_number, date_of_birth, gender, stream_id) VALUES 
-- Form 1A
('Brian', 'Mwangi', 'ADM-1001', '2012-04-12', 'Male', (SELECT id FROM streams WHERE name = 'Form 1A')),
('Faith', 'Wanjiku', 'ADM-1002', '2012-07-21', 'Female', (SELECT id FROM streams WHERE name = 'Form 1A')),
('Kevin', 'Ochieng', 'ADM-1003', '2012-01-30', 'Male', (SELECT id FROM streams WHERE name = 'Form 1A')),
('Joy', 'Achieng', 'ADM-1004', '2012-11-05', 'Female', (SELECT id FROM streams WHERE name = 'Form 1A')),
('Victor', 'Kipkorir', 'ADM-1005', '2012-03-18', 'Male', (SELECT id FROM streams WHERE name = 'Form 1A')),
-- Form 1B
('Mercy', 'Njeri', 'ADM-1006', '2012-09-22', 'Female', (SELECT id FROM streams WHERE name = 'Form 1B')),
('Dennis', 'Mutua', 'ADM-1007', '2012-12-01', 'Male', (SELECT id FROM streams WHERE name = 'Form 1B')),
('Grace', 'Atieno', 'ADM-1008', '2012-08-14', 'Female', (SELECT id FROM streams WHERE name = 'Form 1B')),
('Ian', 'Njoroge', 'ADM-1009', '2012-02-19', 'Male', (SELECT id FROM streams WHERE name = 'Form 1B')),
('Cynthia', 'Makena', 'ADM-1010', '2012-10-10', 'Female', (SELECT id FROM streams WHERE name = 'Form 1B')),
-- Form 2A
('Samuel', 'Odhiambo', 'ADM-2001', '2011-05-14', 'Male', (SELECT id FROM streams WHERE name = 'Form 2A')),
('Mary', 'Nyongesa', 'ADM-2002', '2011-08-22', 'Female', (SELECT id FROM streams WHERE name = 'Form 2A')),
('David', 'Kariuki', 'ADM-2003', '2011-01-15', 'Male', (SELECT id FROM streams WHERE name = 'Form 2A')),
('Lillian', 'Nakhumicha', 'ADM-2004', '2011-12-05', 'Female', (SELECT id FROM streams WHERE name = 'Form 2A')),
('Erick', 'Otieno', 'ADM-2005', '2011-03-25', 'Male', (SELECT id FROM streams WHERE name = 'Form 2A')),
-- Form 2B
('Diana', 'Wambui', 'ADM-2006', '2011-07-19', 'Female', (SELECT id FROM streams WHERE name = 'Form 2B')),
('Collins', 'Kipchoge', 'ADM-2007', '2011-11-02', 'Male', (SELECT id FROM streams WHERE name = 'Form 2B')),
('Alice', 'Moraa', 'ADM-2008', '2011-09-28', 'Female', (SELECT id FROM streams WHERE name = 'Form 2B')),
('Felix', 'Kamau', 'ADM-2009', '2011-04-11', 'Male', (SELECT id FROM streams WHERE name = 'Form 2B')),
('Christine', 'Anyango', 'ADM-2010', '2011-06-30', 'Female', (SELECT id FROM streams WHERE name = 'Form 2B')),
-- Form 3A
('Alex', 'Wamalwa', 'ADM-3001', '2010-02-14', 'Male', (SELECT id FROM streams WHERE name = 'Form 3A')),
('Stella', 'Chebet', 'ADM-3002', '2010-05-22', 'Female', (SELECT id FROM streams WHERE name = 'Form 3A')),
('Martin', 'Kimani', 'ADM-3003', '2010-09-10', 'Male', (SELECT id FROM streams WHERE name = 'Form 3A')),
('Joan', 'Awino', 'ADM-3004', '2010-12-05', 'Female', (SELECT id FROM streams WHERE name = 'Form 3A')),
('Paul', 'Kiprono', 'ADM-3005', '2010-08-15', 'Male', (SELECT id FROM streams WHERE name = 'Form 3A')),
-- Form 3B
('Caroline', 'Mumbua', 'ADM-3006', '2010-07-19', 'Female', (SELECT id FROM streams WHERE name = 'Form 3B')),
('Edwin', 'Ooko', 'ADM-3007', '2010-11-02', 'Male', (SELECT id FROM streams WHERE name = 'Form 3B')),
('Sharon', 'Nasimiyu', 'ADM-3008', '2010-03-28', 'Female', (SELECT id FROM streams WHERE name = 'Form 3B')),
('Kelvin', 'Maina', 'ADM-3009', '2010-04-11', 'Male', (SELECT id FROM streams WHERE name = 'Form 3B')),
('Beatrice', 'Akinyi', 'ADM-3010', '2010-06-30', 'Female', (SELECT id FROM streams WHERE name = 'Form 3B')),
-- Form 4A
('Simon', 'Gichuru', 'ADM-4001', '2009-02-14', 'Male', (SELECT id FROM streams WHERE name = 'Form 4A')),
('Brenda', 'Nekesa', 'ADM-4002', '2009-05-22', 'Female', (SELECT id FROM streams WHERE name = 'Form 4A')),
('Peter', 'Onyango', 'ADM-4003', '2009-09-10', 'Male', (SELECT id FROM streams WHERE name = 'Form 4A')),
('Gladys', 'Wangari', 'ADM-4004', '2009-12-05', 'Female', (SELECT id FROM streams WHERE name = 'Form 4A')),
('Amos', 'Kiptoo', 'ADM-4005', '2009-08-15', 'Male', (SELECT id FROM streams WHERE name = 'Form 4A')),
-- Form 4B
('Maureen', 'Muthoni', 'ADM-4006', '2009-07-19', 'Female', (SELECT id FROM streams WHERE name = 'Form 4B')),
('Joseph', 'Omondi', 'ADM-4007', '2009-11-02', 'Male', (SELECT id FROM streams WHERE name = 'Form 4B')),
('Janet', 'Nafula', 'ADM-4008', '2009-03-28', 'Female', (SELECT id FROM streams WHERE name = 'Form 4B')),
('Evans', 'Ndungu', 'ADM-4009', '2009-04-11', 'Male', (SELECT id FROM streams WHERE name = 'Form 4B')),
('Irene', 'Awiti', 'ADM-4010', '2009-06-30', 'Female', (SELECT id FROM streams WHERE name = 'Form 4B'))
ON CONFLICT (admission_number) DO NOTHING;

-- 5. Insert Scores (Massive generation)
-- Generate scores for all students, across all 10 subjects, for Term 1, 2026
-- We use a CROSS JOIN to give every student a score for every subject.
INSERT INTO scores (student_id, subject_id, ca_score, exam_score, term, year)
SELECT 
    st.id as student_id,
    su.id as subject_id,
    floor(random() * 25 + 10) as ca_score,   -- Random CA score between 10 and 35 (max 40)
    floor(random() * 35 + 20) as exam_score, -- Random Exam score between 20 and 55 (max 60)
    'Term 1',
    2026
FROM students st
CROSS JOIN subjects su
ON CONFLICT (student_id, subject_id, term, year) DO NOTHING;

-- Generate scores for Term 2, 2026 to show progression
INSERT INTO scores (student_id, subject_id, ca_score, exam_score, term, year)
SELECT 
    st.id as student_id,
    su.id as subject_id,
    floor(random() * 25 + 12) as ca_score,   -- Slight improvement
    floor(random() * 35 + 22) as exam_score, -- Slight improvement
    'Term 2',
    2026
FROM students st
CROSS JOIN subjects su
ON CONFLICT (student_id, subject_id, term, year) DO NOTHING;
