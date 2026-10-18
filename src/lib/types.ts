// أنواع البيانات لمنصة الفهم القرائي - مدرسة الساحل الأهلية (بنين)

// الأدوار
export type UserRole = "student" | "teacher" | "admin";

// المراحل الدراسية
export type StageKey =
  | "primary_lower" // الصفوف الأولية (1-3)
  | "primary_upper" // الصفوف العليا (4-6)
  | "intermediate" // المرحلة المتوسطة (1-3 متوسط)
  | "secondary"; // المرحلة الثانوية (1-3 ثانوي)

// مستويات التصنيف
export type ClassificationLevel = "support" | "medium" | "excellent";

// المهارات الفرعية للفهم القرائي
export type SkillKey =
  | "main_idea" // الفكرة الرئيسية
  | "inference" // الاستنتاج
  | "vocabulary" // المفردات
  | "details" // التفاصيل
  | "sequencing"; // الترتيب

// أنواع الأسئلة
export type QuestionType =
  | "mcq" // اختيار من متعدد
  | "true_false" // صح وخطأ
  | "ordering" // ترتيب أحداث
  | "inference" // استنتاج
  | "vocab_context" // معنى مفردة من السياق
  | "main_idea"; // فكرة رئيسية

// الصفوف الدراسية المتاحة
export type GradeKey =
  // الصفوف الأولية
  | "g1" | "g2" | "g3"
  // الصفوف العليا
  | "g4" | "g5" | "g6"
  // المتوسط
  | "m1" | "m2" | "m3"
  // الثانوي
  | "s1" | "s2" | "s3";

// وصف المرحلة
export interface StageInfo {
  key: StageKey;
  label: string;
  shortLabel: string;
  grades: GradeKey[];
  notes: string;
  playful?: boolean; // واجهة مرحّة للصفوف الأولية
}

// تعريف الصف
export interface GradeInfo {
  key: GradeKey;
  label: string;
  stage: StageKey;
}

// تعريف الفصل
export interface Classroom {
  id: string;
  name: string; // مثال: "1/أ"
  gradeKey: GradeKey;
  teacherId?: string;
  createdAt: string;
}

// سؤال اختبار
export interface Question {
  id: string;
  stage: StageKey;
  type: QuestionType;
  skill: SkillKey;
  difficulty: 1 | 2 | 3; // 1 سهل، 2 متوسط، 3 صعب
  passage: string; // نص القطعة
  questionText: string;
  options: string[]; // الخيارات (لـ MCQ و True/False)
  correctAnswer: string; // الإجابة الصحيحة
  orderingEvents?: string[]; // لأسئلة الترتيب - الترتيب الصحيح
  explanation?: string;
}

// إجابة طالب على سؤال
export interface StudentAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  skill: SkillKey;
  timeSpentSec?: number;
}

// نتيجة اختبار تحديد مستوى
export interface PlacementTestResult {
  id: string;
  studentId: string;
  takenAt: string;
  isInitial: boolean; // أول اختبار أم إعادة قياس
  totalQuestions: number;
  correctCount: number;
  percentage: number;
  classification: ClassificationLevel;
  skillScores: Record<SkillKey, { correct: number; total: number }>;
  durationSec: number;
  answers: StudentAnswer[];
  // تخزين الأسئلة الكاملة مع النتيجة لعرضها في مراجعة الإجابات
  // حتى بعد مسح currentTest
  questions?: Question[];
}

// خطة تحسين
export interface ImprovementPlan {
  id: string;
  studentId: string;
  createdAt: string;
  updatedAt: string;
  status: "draft" | "approved" | "in_progress";
  classification: ClassificationLevel;
  weeklySchedule: WeeklyTask[];
  teacherNotes: string;
  nextAssessmentDate: string;
}

// مهمة أسبوعية في الخطة
export interface WeeklyTask {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  skill: SkillKey;
  estimatedMinutes: number;
  completed: boolean;
}

// تدريب لعلاج مهارة معينة (يتكون من مستويات متدرجة)
export interface TrainingExercise {
  id: string;
  stage: StageKey; // المرحلة الدراسية
  skill: SkillKey; // المهارة المستهدفة
  level: 1 | 2 | 3; // المستوى: 1 أساسي، 2 متوسط، 3 متقدم
  title: string;
  description: string;
  // نص التدريب أو التعليمات
  passage: string;
  // الأسئلة التدريبية (مع شرح الحل لكل سؤال)
  questions: TrainingQuestion[];
  // تلميحات للمساعدة
  hints?: string[];
  estimatedMinutes: number;
}

// سؤال في التدريب (يحتوي على شرح للإجابة الصحيحة)
export interface TrainingQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string; // شرح لماذا الإجابة الصحيحة هي الصحيحة
  hint?: string; // تلميح عند الحاجة
}

// نتيجة تدريب طالب
export interface TrainingResult {
  id: string;
  studentId: string;
  exerciseId: string;
  skill: SkillKey;
  level: 1 | 2 | 3;
  takenAt: string;
  totalQuestions: number;
  correctCount: number;
  percentage: number;
  passed: boolean; // >= 70% للنجاح
  timeSpentSec: number;
}

// اختبار بعدي (يُجرى بعد إكمال التدريبات لقياس التحسّن)
export interface PostTest {
  id: string;
  studentId: string;
  skill: SkillKey; // المهارة المُختبَرة
  takenAt: string;
  totalQuestions: number;
  correctCount: number;
  percentage: number;
  improvedFromPre: number; // الفرق عن الاختبار القبلي
  durationSec: number;
  answers: StudentAnswer[];
  questions?: Question[];
}

// مستخدم في النظام
export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  passwordHash: string; // مبسط - ليس تشفير حقيقي
  createdAt: string;
  // حقول الطالب
  gradeKey?: GradeKey;
  classroomId?: string;
  academicNumber?: string;
  // حقول المعلم
  approved?: boolean; // الأدمن يعتمد المعلمين
  classroomIds?: string[]; // الفصول التي يدرّسها
  // حقول مشتركة
  avatarColor?: string;
  points?: number;
  badges?: string[];
  streakDays?: number;
}

// شريط تقدم الطالب
export interface StudentProgress {
  studentId: string;
  totalTests: number;
  classificationsHistory: { date: string; classification: ClassificationLevel; percentage: number }[];
  skillTrends: Record<SkillKey, number[]>; // نسب عبر الزمن
}

// إعدادات النظام
export interface SystemSettings {
  classificationThresholds: {
    supportMax: number; // أقل من هذه النسبة = دعم (افتراضي 50)
    excellentMin: number; // أعلى من هذه النسبة = متفوق (افتراضي 80)
  };
  placementTestQuestionCount: number; // 20
  reassessmentIntervalWeeks: number; // 4
  testTimeLimitMin: number; // 30
  appName: string;
  schoolName: string;
}

// إحصائيات للوحة الأدمن
export interface SchoolStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  byClassification: Record<ClassificationLevel, number>;
  byStage: Record<StageKey, { total: number; support: number; medium: number; excellent: number }>;
  byGrade: Record<string, { total: number; avgScore: number }>;
  byClass: Record<string, { total: number; avgScore: number; support: number; medium: number; excellent: number }>;
  skillAverages: Record<SkillKey, number>;
  strongestSkill: SkillKey;
  weakestSkill: SkillKey;
  educationGap: {
    betweenClasses: { classA: string; classB: string; gap: number }[];
    trend: { date: string; gap: number }[];
  };
  prePostComparison: { pre: number; post: number; improvement: number };
  topStudentsNeedingSupport: { studentId: string; name: string; score: number; classId: string }[];
  mostAdvancedClasses: { classId: string; avgScore: number }[];
  planCompletionRate: number;
  teacherActivity: { teacherId: string; name: string; studentsCount: number; plansApproved: number; lastActive: string }[];
}

// تنبيهات المعلم
export interface TeacherAlert {
  id: string;
  type: "performance_drop" | "plan_overdue" | "low_engagement";
  studentId: string;
  studentName: string;
  message: string;
  severity: "info" | "warning" | "critical";
  createdAt: string;
}
