// CREATE TABLE IF NOT EXISTS quiz_sessions (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     title VARCHAR(255),
//     status VARCHAR(20) DEFAULT 'pending', -- pending, live, completed
//     current_question_index INTEGER DEFAULT 0,
//     time_per_question INTEGER DEFAULT 10,
//     total_questions INTEGER,
//     started_at TIMESTAMP,
//     ended_at TIMESTAMP,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );