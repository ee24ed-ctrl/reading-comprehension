-- Complete Database Schema for Reading Comprehension Platform
-- Project: منصة الفهم القرائي - مدرسة الساحل الأهلية (بنين)
-- Target: Supabase (PostgreSQL)

-- 1. الفصول الدراسية (Classrooms)
CREATE TABLE IF NOT EXISTS classrooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  grade_key TEXT NOT NULL,
  teacher_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. المستخدمون (Users: Students, Teachers, Admins)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  grade_key TEXT,
  classroom_id TEXT REFERENCES classrooms(id) ON DELETE SET NULL,
  academic_number TEXT,
  approved BOOLEAN DEFAULT false,
  classroom_ids TEXT[] DEFAULT '{}',
  avatar_color TEXT DEFAULT '#0EA5E9',
  points INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  streak_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. بنك الأسئلة (Questions)
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  stage TEXT NOT NULL,
  type TEXT NOT NULL,
  skill TEXT NOT NULL,
  difficulty SMALLINT NOT NULL DEFAULT 1,
  passage TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  ordering_events JSONB,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. نتائج اختبارات تحديد المستوى (Placement Test Results)
CREATE TABLE IF NOT EXISTS placement_test_results (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  is_initial BOOLEAN DEFAULT true,
  total_questions INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  percentage NUMERIC(5,2) NOT NULL,
  classification TEXT NOT NULL CHECK (classification IN ('support', 'medium', 'excellent')),
  skill_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  duration_sec INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  questions JSONB,
  exam_id TEXT,
  exam_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. خطط التحسين الفردية (Improvement Plans)
CREATE TABLE IF NOT EXISTS improvement_plans (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'approved', 'in_progress')),
  classification TEXT NOT NULL,
  weekly_schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
  teacher_notes TEXT DEFAULT '',
  next_assessment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. تمارين وتدريبات المهارات (Training Exercises)
CREATE TABLE IF NOT EXISTS training_exercises (
  id TEXT PRIMARY KEY,
  stage TEXT NOT NULL,
  skill TEXT NOT NULL,
  level SMALLINT NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  passage TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  hints JSONB DEFAULT '[]'::jsonb,
  estimated_minutes INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. نتائج التدريبات (Training Results)
CREATE TABLE IF NOT EXISTS training_results (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  skill TEXT NOT NULL,
  level SMALLINT NOT NULL DEFAULT 1,
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  total_questions INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  percentage NUMERIC(5,2) NOT NULL,
  passed BOOLEAN DEFAULT false,
  time_spent_sec INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. الاختبارات البعدية (Post Tests)
CREATE TABLE IF NOT EXISTS post_tests (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  total_questions INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  percentage NUMERIC(5,2) NOT NULL,
  improved_from_pre NUMERIC(5,2) DEFAULT 0,
  duration_sec INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  questions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. تنبيهات المعلمين (Teacher Alerts)
CREATE TABLE IF NOT EXISTS teacher_alerts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. إعدادات النظام (System Settings)
CREATE TABLE IF NOT EXISTS system_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  classification_thresholds JSONB NOT NULL DEFAULT '{"supportMax": 50, "excellentMin": 80}'::jsonb,
  placement_test_question_count INTEGER NOT NULL DEFAULT 20,
  reassessment_interval_weeks INTEGER NOT NULL DEFAULT 4,
  test_time_limit_min INTEGER NOT NULL DEFAULT 30,
  app_name TEXT NOT NULL DEFAULT 'منصة الفهم القرائي',
  school_name TEXT NOT NULL DEFAULT 'مدرسة الساحل الأهلية (بنين)',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_classroom ON users(classroom_id);
CREATE INDEX IF NOT EXISTS idx_placement_student ON placement_test_results(student_id);
CREATE INDEX IF NOT EXISTS idx_plans_student ON improvement_plans(student_id);
CREATE INDEX IF NOT EXISTS idx_trainings_student ON training_results(student_id);
CREATE INDEX IF NOT EXISTS idx_post_tests_student ON post_tests(student_id);
CREATE INDEX IF NOT EXISTS idx_questions_stage_skill ON questions(stage, skill);

-- Row Level Security (RLS)
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE improvement_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Default Policies
CREATE POLICY allow_all_classrooms ON classrooms FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY allow_all_users ON users FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY allow_all_questions ON questions FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY allow_all_placement ON placement_test_results FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY allow_all_plans ON improvement_plans FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY allow_all_trainings ON training_exercises FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY allow_all_results ON training_results FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY allow_all_post_tests ON post_tests FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY allow_all_alerts ON teacher_alerts FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY allow_all_settings ON system_settings FOR ALL TO public USING (true) WITH CHECK (true);
