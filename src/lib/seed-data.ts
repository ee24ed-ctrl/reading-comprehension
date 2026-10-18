import type { User, Classroom, ImprovementPlan, PlacementTestResult, SystemSettings, StudentProgress } from "./types";
import { DEFAULT_SETTINGS } from "./stages";

// إعدادات النظام الافتراضية
export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = DEFAULT_SETTINGS;

// فصول تجريبية
export const SEED_CLASSROOMS: Classroom[] = [
  // الصفوف الأولية
  { id: "c_g1_a", name: "الأول ابتدائي / أ", gradeKey: "g1", createdAt: "2025-09-01T00:00:00Z" },
  { id: "c_g1_b", name: "الأول ابتدائي / ب", gradeKey: "g1", createdAt: "2025-09-01T00:00:00Z" },
  { id: "c_g2_a", name: "الثاني ابتدائي / أ", gradeKey: "g2", createdAt: "2025-09-01T00:00:00Z" },
  { id: "c_g2_b", name: "الثاني ابتدائي / ب", gradeKey: "g2", createdAt: "2025-09-01T00:00:00Z" },
  { id: "c_g3_a", name: "الثالث ابتدائي / أ", gradeKey: "g3", createdAt: "2025-09-01T00:00:00Z" },
  { id: "c_g3_b", name: "الثالث ابتدائي / ب", gradeKey: "g3", createdAt: "2025-09-01T00:00:00Z" },
  { id: "c_g3_c", name: "الثالث ابتدائي / ج", gradeKey: "g3", createdAt: "2025-09-01T00:00:00Z" },
  // الصفوف العليا
  { id: "c_g4_a", name: "الرابع ابتدائي / أ", gradeKey: "g4", createdAt: "2025-09-01T00:00:00Z" },
  { id: "c_g4_b", name: "الرابع ابتدائي / ب", gradeKey: "g4", createdAt: "2025-09-01T00:00:00Z" },
  { id: "c_g4_c", name: "الرابع ابتدائي / ج", gradeKey: "g4", createdAt: "2025-09-01T00:00:00Z" },
  { id: "c_g5_a", name: "الخامس ابتدائي / أ", gradeKey: "g5", createdAt: "2025-09-01T00:00:00Z" },
  { id: "c_g5_b", name: "الخامس ابتدائي / ب", gradeKey: "g5", createdAt: "2025-09-01T00:00:00Z" },
  { id: "c_g5_c", name: "الخامس ابتدائي / ج", gradeKey: "g5", createdAt: "2025-09-01T00:00:00Z" },
  { id: "c_g6_a", name: "السادس ابتدائي / أ", gradeKey: "g6", createdAt: "2025-09-01T00:00:00Z" },
  { id: "c_g6_b", name: "السادس ابتدائي / ب", gradeKey: "g6", createdAt: "2025-09-01T00:00:00Z" },
  { id: "c_g6_c", name: "السادس ابتدائي / ج", gradeKey: "g6", createdAt: "2025-09-01T00:00:00Z" },
  // المتوسط
  { id: "c_m1_a", name: "الأول متوسط / أ", gradeKey: "m1", createdAt: "2025-09-01T00:00:00Z" },
  { id: "c_m2_a", name: "الثاني متوسط / أ", gradeKey: "m2", createdAt: "2025-09-01T00:00:00Z" },
  { id: "c_m3_a", name: "الثالث متوسط / أ", gradeKey: "m3", createdAt: "2025-09-01T00:00:00Z" },
  // الثانوي
  { id: "c_s1_a", name: "الأول ثانوي / أ", gradeKey: "s1", createdAt: "2025-09-01T00:00:00Z" },
  { id: "c_s2_a", name: "الثاني ثانوي / أ", gradeKey: "s2", createdAt: "2025-09-01T00:00:00Z" },
  { id: "c_s3_a", name: "الثالث ثانوي / أ", gradeKey: "s3", createdAt: "2025-09-01T00:00:00Z" },
];

// ألوان للصور الرمزية
const AVATAR_COLORS = ["#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

// معلمون تجريبيون - حسب توزيع إدارة المدرسة
export const SEED_TEACHERS: User[] = [
  {
    id: "t_1",
    role: "teacher",
    name: "أ. إسلام السعيد",
    email: "teacher1@saahil.edu",
    passwordHash: "demo123",
    createdAt: "2025-08-20T00:00:00Z",
    approved: true,
    classroomIds: ["c_g1_a"], // الصف الأول / أ
    avatarColor: "#0EA5E9",
  },
  {
    id: "t_2",
    role: "teacher",
    name: "أ. أحمد السيد",
    email: "teacher2@saahil.edu",
    passwordHash: "demo123",
    createdAt: "2025-08-20T00:00:00Z",
    approved: true,
    classroomIds: ["c_g1_b"], // الصف الأول / ب
    avatarColor: "#10B981",
  },
  {
    id: "t_3",
    role: "teacher",
    name: "أ. أحمد فهمي",
    email: "teacher3@saahil.edu",
    passwordHash: "demo123",
    createdAt: "2025-08-20T00:00:00Z",
    approved: true,
    classroomIds: ["c_g2_a"], // الصف الثاني / أ
    avatarColor: "#F59E0B",
  },
  {
    id: "t_4",
    role: "teacher",
    name: "أ. محمود عوني",
    email: "teacher4@saahil.edu",
    passwordHash: "demo123",
    createdAt: "2025-08-20T00:00:00Z",
    approved: true,
    classroomIds: ["c_g2_b"], // الصف الثاني / ب
    avatarColor: "#8B5CF6",
  },
  {
    id: "t_5",
    role: "teacher",
    name: "أ. ناصر عبدالرحمن أحمد",
    email: "teacher5@saahil.edu",
    passwordHash: "demo123",
    createdAt: "2025-08-20T00:00:00Z",
    approved: true,
    classroomIds: ["c_g3_a"], // الصف الثالث / أ
    avatarColor: "#EC4899",
  },
  {
    id: "t_6",
    role: "teacher",
    name: "أ. محمد المصيلحي",
    email: "teacher6@saahil.edu",
    passwordHash: "demo123",
    createdAt: "2025-08-20T00:00:00Z",
    approved: true,
    classroomIds: ["c_g3_b"], // الصف الثالث / ب
    avatarColor: "#14B8A6",
  },
  {
    id: "t_7",
    role: "teacher",
    name: "أ. أحمد إسماعيل",
    email: "teacher7@saahil.edu",
    passwordHash: "demo123",
    createdAt: "2025-08-20T00:00:00Z",
    approved: true,
    classroomIds: ["c_g3_c"], // الصف الثالث / ج
    avatarColor: "#F97316",
  },
  {
    id: "t_8",
    role: "teacher",
    name: "أ. محمد لطفي",
    email: "teacher8@saahil.edu",
    passwordHash: "demo123",
    createdAt: "2025-08-20T00:00:00Z",
    approved: true,
    classroomIds: ["c_g4_a", "c_g4_b", "c_g4_c"], // الصف الرابع (أ، ب، ج)
    avatarColor: "#0EA5E9",
  },
  {
    id: "t_9",
    role: "teacher",
    name: "أ. أحمد عبدالله",
    email: "teacher9@saahil.edu",
    passwordHash: "demo123",
    createdAt: "2025-08-20T00:00:00Z",
    approved: true,
    classroomIds: [
      "c_g5_a", "c_g5_b", "c_g5_c", // الصف الخامس (أ، ب، ج)
      "c_g6_a", "c_g6_b", "c_g6_c",  // الصف السادس (أ، ب، ج)
    ],
    avatarColor: "#10B981",
  },
];

// مدير النظام
export const SEED_ADMIN: User = {
  id: "admin_1",
  role: "admin",
  name: "مدير النظام",
  email: "admin@saahil.edu",
  passwordHash: "admin123",
  createdAt: "2025-08-01T00:00:00Z",
  approved: true,
  avatarColor: "#0F172A",
};

// أسماء طلاب تجريبية
const STUDENT_NAMES = [
  "محمد العتيبي", "أحمد الشهري", "عبدالله القحطاني", "سعد الغامدي", "فهد الدوسري",
  "ناصر الحربي", "تركي السبيعي", "ماجد المطيري", "بدر الزهراني", "يوسف البقمي",
  "ريان القرني", "إبراهيم المالكي", "خلاد الجهني", "عمر الأنصاري", "رامي الحازمي",
  "ثامر الشمري", "وليد العنزي", "سلمان الرشيدي", "حمد المطيري", "زياد القرشي",
  "أنس الصاعدي", "نواف العنزي", "سعود الحربي", "مشاري البدراني", "راكان الدوسري",
  "عبدالرحمن اليامي", "ناصر الغامدي", "طلال العتيبي", "مروان الشهري", "إياد القحطاني",
];

// توليد طلاب تجريبيين
function generateSeedStudents(): User[] {
  const students: User[] = [];
  const classroomsPerGrade = [
    // الصفوف الأولية
    { classroomId: "c_g1_a", gradeKey: "g1" as const, count: 8 },
    { classroomId: "c_g1_b", gradeKey: "g1" as const, count: 7 },
    { classroomId: "c_g2_a", gradeKey: "g2" as const, count: 8 },
    { classroomId: "c_g2_b", gradeKey: "g2" as const, count: 7 },
    { classroomId: "c_g3_a", gradeKey: "g3" as const, count: 7 },
    { classroomId: "c_g3_b", gradeKey: "g3" as const, count: 7 },
    { classroomId: "c_g3_c", gradeKey: "g3" as const, count: 7 },
    // الصفوف العليا
    { classroomId: "c_g4_a", gradeKey: "g4" as const, count: 7 },
    { classroomId: "c_g4_b", gradeKey: "g4" as const, count: 7 },
    { classroomId: "c_g4_c", gradeKey: "g4" as const, count: 7 },
    { classroomId: "c_g5_a", gradeKey: "g5" as const, count: 7 },
    { classroomId: "c_g5_b", gradeKey: "g5" as const, count: 7 },
    { classroomId: "c_g5_c", gradeKey: "g5" as const, count: 7 },
    { classroomId: "c_g6_a", gradeKey: "g6" as const, count: 7 },
    { classroomId: "c_g6_b", gradeKey: "g6" as const, count: 7 },
    { classroomId: "c_g6_c", gradeKey: "g6" as const, count: 7 },
    // المتوسط
    { classroomId: "c_m1_a", gradeKey: "m1" as const, count: 8 },
    { classroomId: "c_m2_a", gradeKey: "m2" as const, count: 8 },
    { classroomId: "c_m3_a", gradeKey: "m3" as const, count: 7 },
    // الثانوي
    { classroomId: "c_s1_a", gradeKey: "s1" as const, count: 8 },
    { classroomId: "c_s2_a", gradeKey: "s2" as const, count: 7 },
    { classroomId: "c_s3_a", gradeKey: "s3" as const, count: 7 },
  ];
  let nameIdx = 0;
  let studentCounter = 1;
  classroomsPerGrade.forEach(({ classroomId, gradeKey, count }) => {
    for (let i = 0; i < count; i++) {
      students.push({
        id: `s_${studentCounter}`,
        role: "student",
        name: STUDENT_NAMES[nameIdx % STUDENT_NAMES.length] + ` ${i + 1}`,
        email: `student${studentCounter}@saahil.edu`,
        passwordHash: "demo123",
        createdAt: "2025-09-01T00:00:00Z",
        gradeKey,
        classroomId,
        academicNumber: `2025-${String(studentCounter).padStart(4, "0")}`,
        avatarColor: AVATAR_COLORS[studentCounter % AVATAR_COLORS.length],
        points: Math.floor(Math.random() * 500) + 100,
        badges: ["أول اختبار", "مجتهد"],
        streakDays: Math.floor(Math.random() * 10) + 1,
      });
      nameIdx++;
      studentCounter++;
    }
  });
  return students;
}

export const SEED_STUDENTS: User[] = generateSeedStudents();

// توليد نتائج اختبارات تجريبية (توزيع واقعي)
export function generateSeedTestResults(students: User[]): PlacementTestResult[] {
  const results: PlacementTestResult[] = [];
  const SKILLS: SkillKeyArr = ["main_idea", "inference", "vocabulary", "details", "sequencing"];
  students.forEach((student, idx) => {
    // توزيع: 25% دعم، 50% متوسط، 25% متفوق - مع تباين بين الفصول
    const seedRand = (idx * 7 + 3) % 100;
    let baseScore: number;
    if (seedRand < 25) baseScore = Math.floor(Math.random() * 25) + 25; // دعم
    else if (seedRand < 75) baseScore = Math.floor(Math.random() * 30) + 50; // متوسط
    else baseScore = Math.floor(Math.random() * 18) + 82; // متفوق

    const totalQuestions = 20;
    const correctCount = Math.min(20, Math.max(0, Math.round((baseScore / 100) * totalQuestions)));
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    // توزيع الإجابات على المهارات
    const skillScores: Record<string, { correct: number; total: number }> = {};
    const skillTotals: Record<string, number> = {
      main_idea: 5, inference: 4, vocabulary: 4, details: 4, sequencing: 3,
    };
    Object.entries(skillTotals).forEach(([skill, total]) => {
      const skillBaseScore = baseScore + (Math.floor(Math.random() * 30) - 15);
      const skillCorrect = Math.min(total, Math.max(0, Math.round((skillBaseScore / 100) * total)));
      skillScores[skill] = { correct: skillCorrect, total };
    });

    const classification = percentage < 50 ? "support" : percentage < 80 ? "medium" : "excellent";

    results.push({
      id: `result_${student.id}`,
      studentId: student.id,
      takenAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      isInitial: true,
      totalQuestions,
      correctCount,
      percentage,
      classification,
      skillScores: skillScores as PlacementTestResult["skillScores"],
      durationSec: Math.floor(Math.random() * 600) + 600,
      answers: [],
    });
  });
  return results;
}

type SkillKeyArr = ("main_idea" | "inference" | "vocabulary" | "details" | "sequencing")[];

// توليد خطط تحسين تجريبية
export function generateSeedPlans(students: User[], results: PlacementTestResult[]): ImprovementPlan[] {
  const plans: ImprovementPlan[] = [];
  students.forEach((student) => {
    const result = results.find((r) => r.studentId === student.id);
    if (!result) return;
    const classification = result.classification;
    const weakSkill = findWeakestSkill(result.skillScores);

    const weeklySchedule = generateWeeklyTasks(classification, weakSkill);

    plans.push({
      id: `plan_${student.id}`,
      studentId: student.id,
      createdAt: "2025-09-15T00:00:00Z",
      updatedAt: "2025-10-01T00:00:00Z",
      status: classification === "support" ? "in_progress" : "approved",
      classification,
      weeklySchedule,
      teacherNotes:
        classification === "support"
          ? "الطالب يحتاج إلى دعم إضافي في المهارة الأضعف، يرجى متابعة التزامِه يومياً."
          : classification === "medium"
          ? "خطة متوازنة لتطوير المهارات الأساسية والاستعداد للمرحلة التالية."
          : "خطة متقدمة لإثراء قدرات الطالب وتوسيع مداركه.",
      nextAssessmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  });
  return plans;
}

function findWeakestSkill(skills: PlacementTestResult["skillScores"]): keyof PlacementTestResult["skillScores"] {
  let weakest = "main_idea" as keyof PlacementTestResult["skillScores"];
  let lowestRatio = 1;
  Object.entries(skills).forEach(([skill, { correct, total }]) => {
    const ratio = total > 0 ? correct / total : 0;
    if (ratio < lowestRatio) {
      lowestRatio = ratio;
      weakest = skill as keyof PlacementTestResult["skillScores"];
    }
  });
  return weakest;
}

function generateWeeklyTasks(classification: string, weakSkill: string) {
  const baseTasks = [
    { title: "قراءة نص قصير", skill: weakSkill, minutes: 15 },
    { title: "تمارين المفردات", skill: "vocabulary", minutes: 10 },
    { title: "أسئلة الفكرة الرئيسية", skill: "main_idea", minutes: 15 },
    { title: "تمارين الاستنتاج", skill: "inference", minutes: 15 },
    { title: "ترتيب الأحداث", skill: "sequencing", minutes: 10 },
  ];
  return [1, 2, 3, 4].map((weekNumber) => {
    const task = baseTasks[weekNumber - 1] || baseTasks[0];
    return {
      id: `task_${weekNumber}_${Math.random().toString(36).substr(2, 9)}`,
      weekNumber,
      title: task.title,
      description:
        classification === "support"
          ? `${task.title} - تركيز على المهارة الأضعف (${weakSkill}). نص قصير ومناسب لمستوى الطالب.`
          : classification === "medium"
          ? `${task.title} - تدرج في الصعوبة مع تنوع النصوص.`
          : `${task.title} - نص عميق وتحديات استنتاجية متقدمة.`,
      skill: task.skill as ImprovementPlan["weeklySchedule"][0]["skill"],
      estimatedMinutes: task.minutes,
      completed: weekNumber < 3 ? Math.random() > 0.4 : false,
    };
  });
}

// حساب تقدم الطالب
export function generateStudentProgress(studentId: string, results: PlacementTestResult[]): StudentProgress {
  const studentResults = results.filter((r) => r.studentId === studentId);
  const classificationsHistory = studentResults.map((r) => ({
    date: r.takenAt,
    classification: r.classification,
    percentage: r.percentage,
  }));

  const skillTrends = {
    main_idea: [] as number[],
    inference: [] as number[],
    vocabulary: [] as number[],
    details: [] as number[],
    sequencing: [] as number[],
  };
  studentResults.forEach((r) => {
    Object.entries(r.skillScores).forEach(([skill, { correct, total }]) => {
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      skillTrends[skill as keyof typeof skillTrends].push(pct);
    });
  });

  return {
    studentId,
    totalTests: studentResults.length,
    classificationsHistory,
    skillTrends,
  };
}
