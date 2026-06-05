// db/seed.js
// Database seeding script to populate the database with realistic mock data.
// Run using: node db/seed.js

require('dotenv').config();
const pool = require('../config/db');

const FIRST_NAMES = [
  'John', 'Grace', 'Mary', 'Amos', 'Kelvin', 'Mercy', 'Kevin', 'Alice', 'Brian', 'Faith', 
  'David', 'Joy', 'Joseph', 'Sharon', 'Emmanuel', 'Florence', 'Peter', 'Esther', 'Daniel', 
  'Sarah', 'Paul', 'Ruth', 'James', 'Naomi', 'Timothy', 'Lydia', 'Stephen', 'Dorcas', 
  'Andrew', 'Hannah', 'Philip', 'Rachel', 'Simon', 'Rebecca', 'Lucas', 'Elizabeth'
];

const LAST_NAMES = [
  'Otieno', 'Kamau', 'Wanjiku', 'Mwangi', 'Ochieng', 'Ndwiga', 'Mutua', 'Kiprop', 'Chebet', 
  'Maina', 'Kariuki', 'Adhiambo', 'Juma', 'Nyambura', 'Njoroge', 'Kiptoo', 'Karanja', 'Onyango', 
  'Ondieki', 'Githinji', 'Cheruiyot', 'Waweru', 'Kipchirchir', 'Ondiek', 'Mugo', 'Wambui',
  'Omwamba', 'Kuria', 'Gichuru', 'Kipruto', 'Chepkemoi', 'Obiero', 'Muthoni', 'Ouma', 'Wekesa'
];

const SUBJECTS = [
  { name: 'Mathematics', code: 'MATH101', description: 'Core subject covering algebra, geometry, calculus and statistics.' },
  { name: 'English Language', code: 'ENG101', description: 'Grammar, comprehension, and creative writing.' },
  { name: 'Kiswahili', code: 'KISW101', description: 'Fasihi na sarufi ya lugha ya Kiswahili.' },
  { name: 'Biology', code: 'BIO101', description: 'Study of living organisms, ecology, and human anatomy.' },
  { name: 'Chemistry', code: 'CHEM101', description: 'Inorganic, physical, and organic chemistry principles.' },
  { name: 'Physics', code: 'PHYS101', description: 'Mechanics, light, electricity, and magnetism.' },
  { name: 'History & Government', code: 'HIST101', description: 'Local history, constitution, and global civilisations.' },
  { name: 'Geography', code: 'GEOG101', description: 'Physical geography, cartography, and human settlements.' },
  { name: 'Business Studies', code: 'BUS101', description: 'Introduction to economics, commerce, and accounting.' }
];

const STREAMS = [
  { name: 'Form 1A', year: 2026, age: 14 },
  { name: 'Form 1B', year: 2026, age: 14 },
  { name: 'Form 2A', year: 2026, age: 15 },
  { name: 'Form 2B', year: 2026, age: 15 },
  { name: 'Form 3A', year: 2026, age: 16 },
  { name: 'Form 3B', year: 2026, age: 16 },
  { name: 'Form 4A', year: 2026, age: 17 },
  { name: 'Form 4B', year: 2026, age: 17 }
];

async function seed() {
  console.log('Starting database seeding...');
  const client = await pool.connect();

  try {
    // 1. Clean existing data
    console.log('Clearing existing tables...');
    await client.query('TRUNCATE TABLE scores, stream_subjects, students, subjects, streams RESTART IDENTITY CASCADE;');

    // 2. Insert class streams
    console.log('Inserting class streams...');
    const streamMap = {};
    for (const stream of STREAMS) {
      const res = await client.query(
        'INSERT INTO streams (name, year) VALUES ($1, $2) RETURNING id, name',
        [stream.name, stream.year]
      );
      const row = res.rows[0];
      streamMap[row.name] = { id: row.id, age: stream.age };
    }

    // 3. Insert subjects
    console.log('Inserting subjects...');
    const subjectIds = [];
    for (const sub of SUBJECTS) {
      const res = await client.query(
        'INSERT INTO subjects (name, code, description) VALUES ($1, $2, $3) RETURNING id',
        [sub.name, sub.code, sub.description]
      );
      subjectIds.push(res.rows[0].id);
    }

    // 4. Assign subjects to streams (all streams take all subjects)
    console.log('Assigning subjects to streams...');
    for (const streamName in streamMap) {
      const streamId = streamMap[streamName].id;
      for (const subjectId of subjectIds) {
        await client.query(
          'INSERT INTO stream_subjects (stream_id, subject_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [streamId, subjectId]
        );
      }
    }

    // 5. Generate and insert students
    console.log('Generating students...');
    const students = [];
    let admCounter = 1001;

    for (const streamName in streamMap) {
      const { id: streamId, age: targetAge } = streamMap[streamName];
      const studentsInStreamCount = 8; // 8 students per class stream (Total: 64 students)

      for (let i = 0; i < studentsInStreamCount; i++) {
        const gender = Math.random() > 0.5 ? 'Male' : 'Female';
        const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
        let lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        
        // Ensure no duplicate full name in this batch iteration
        while (students.some(s => s.first_name === firstName && s.last_name === lastName)) {
          lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        }

        const admNo = `ADM-2026-${admCounter++}`;
        
        // Calculate DOB based on year of study
        const birthYear = 2026 - targetAge;
        const birthMonth = Math.floor(Math.random() * 12);
        const birthDay = Math.floor(Math.random() * 28) + 1;
        const dob = new Date(birthYear, birthMonth, birthDay);

        const res = await client.query(
          'INSERT INTO students (first_name, last_name, admission_number, date_of_birth, gender, stream_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, first_name, last_name, stream_id',
          [firstName, lastName, admNo, dob, gender, streamId]
        );
        
        // Assign a student-specific performance multiplier (aptitude) to keep records consistent/realistic
        const aptitude = 0.45 + Math.random() * 0.5; // range: 0.45 to 0.95
        students.push({
          id: res.rows[0].id,
          first_name: firstName,
          last_name: lastName,
          stream_id: streamId,
          aptitude: aptitude
        });
      }
    }

    // 6. Generate scores for Term 1 and Term 2 of 2026
    console.log('Generating term scores...');
    const terms = ['Term 1', 'Term 2'];
    const year = 2026;
    let scoresCount = 0;

    for (const student of students) {
      for (const term of terms) {
        for (const subjectId of subjectIds) {
          const caMax = 40;
          const examMax = 60;
          
          // Generate score based on student aptitude with a bit of random noise/jitter
          const baseCA = caMax * student.aptitude;
          const baseExam = examMax * student.aptitude;
          
          // Jitter is between -3 and +3 for CA, -5 and +5 for Exam
          const caJitter = Math.floor(Math.random() * 7) - 3;
          const examJitter = Math.floor(Math.random() * 11) - 5;
          
          const caScore = Math.min(caMax, Math.max(0, Math.round(baseCA + caJitter)));
          const examScore = Math.min(examMax, Math.max(0, Math.round(baseExam + examJitter)));

          await client.query(
            `INSERT INTO scores (student_id, subject_id, ca_score, exam_score, term, year) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             ON CONFLICT (student_id, subject_id, term, year) DO NOTHING`,
            [student.id, subjectId, caScore, examScore, term, year]
          );
          scoresCount++;
        }
      }
    }

    console.log(`Database seeded successfully!`);
    console.log(`- Created ${STREAMS.length} streams.`);
    console.log(`- Created ${SUBJECTS.length} subjects.`);
    console.log(`- Assigned all subjects to all streams.`);
    console.log(`- Enrolled ${students.length} students.`);
    console.log(`- Recorded ${scoresCount} subject scores across Term 1 & Term 2.`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
