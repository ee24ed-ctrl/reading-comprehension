"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  User,
  UserRole,
  Classroom,
  PlacementTestResult,
  ImprovementPlan,
  Question,
  SystemSettings,
  StageKey,
  ClassificationLevel,
  SkillKey,
} from "./types";
import {
  SEED_CLASSROOMS,
  SEED_TEACHERS,
  SEED_ADMIN,
  SEED_STUDENTS,
  generateSeedTestResults,
  generateSeedPlans,
  DEFAULT_SYSTEM_SETTINGS,
} from "./seed-data";
import { getPlacementTestQuestions } from "./questions";

// شاشات التطبيق
export type Screen =
  | "splash_app"
  | "splash_school"
  | "home"
  | "auth_login"
  | "auth_register"
  | "student_dashboard"
  | "placement_test"
  | "test_result"
  | "improvement_plan"
  | "teacher_dashboard"
  | "admin_dashboard";

interface AppState {
  // التنقل
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;

  // المستخدم الحالي
  currentUser: User | null;
  login: (email: string, password: string, role: UserRole) => { success: boolean; message: string };
  register: (data: RegisterData) => { success: boolean; message: string };
  logout: () => void;

  // البيانات
  users: User[];
  classrooms: Classroom[];
  testResults: PlacementTestResult[];
  improvementPlans: ImprovementPlan[];
  customQuestions: Question[];
  settings: SystemSettings;

  // حالة الاختبار
  currentTest: {
    questions: Question[];
    currentQuestionIndex: number;
    answers: { questionId: string; selectedAnswer: string; timeSpentSec: number }[];
    startedAt: number;
    timeLimitSec: number;
  } | null;
  startPlacementTest: (stage: StageKey) => void;
  answerQuestion: (questionId: string, selectedAnswer: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  finishTest: () => PlacementTestResult | null;

  // إدارة المعلم
  addQuestion: (question: Omit<Question, "id">) => void;
  updatePlan: (planId: string, updates: Partial<ImprovementPlan>) => void;
  approvePlan: (planId: string) => void;

  // إدارة الأدمن
  approveTeacher: (teacherId: string) => void;
  rejectTeacher: (teacherId: string) => void;
  addClassroom: (name: string, gradeKey: string) => void;
  updateSettings: (settings: Partial<SystemSettings>) => void;

  // إعادة تعيين البيانات
  resetAllData: () => void;

  // مساعدات
  getStudentsByClassroom: (classroomId: string) => User[];
  getStudentResults: (studentId: string) => PlacementTestResult[];
  getStudentPlan: (studentId: string) => ImprovementPlan | null;
  getClassificationsByClassroom: (classroomId: string) => Record<ClassificationLevel, number>;
  getTeachersByClassroom: (classroomId: string) => User[];
}

interface RegisterData {
  role: UserRole;
  name: string;
  email: string;
  password: string;
  gradeKey?: string;
  classroomId?: string;
  academicNumber?: string;
}

// توليد بيانات أولية
function getInitialData() {
  const allUsers = [SEED_ADMIN, ...SEED_TEACHERS, ...SEED_STUDENTS];
  const testResults = generateSeedTestResults(SEED_STUDENTS);
  const improvementPlans = generateSeedPlans(SEED_STUDENTS, testResults);
  return {
    users: allUsers,
    classrooms: SEED_CLASSROOMS,
    testResults,
    improvementPlans,
    customQuestions: [],
    settings: DEFAULT_SYSTEM_SETTINGS,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      const initial = getInitialData();
      return {
        currentScreen: "splash_app",
        setScreen: (screen) => set({ currentScreen: screen }),

        currentUser: null,
        login: (email, password, role) => {
          const user = get().users.find(
            (u) => u.email === email && u.passwordHash === password && u.role === role
          );
          if (!user) {
            return { success: false, message: "بيانات الدخول غير صحيحة. تأكد من البريد وكلمة المرور والدور." };
          }
          if (user.role === "teacher" && !user.approved) {
            return {
              success: false,
              message: "حسابك بانتظار اعتماد مدير النظام. سيتم إعلامك عند تفعيله.",
            };
          }
          set({ currentUser: user });
          // توجيه حسب الدور
          if (user.role === "student") {
            // الطالب: تحقق إن كان قد أجرى اختبار تحديد المستوى
            const hasInitial = get().testResults.some(
              (r) => r.studentId === user.id && r.isInitial
            );
            if (!hasInitial && user.gradeKey) {
              const stage = getStageFromGrade(user.gradeKey);
              get().startPlacementTest(stage);
              set({ currentScreen: "placement_test" });
            } else {
              set({ currentScreen: "student_dashboard" });
            }
          } else if (user.role === "teacher") {
            set({ currentScreen: "teacher_dashboard" });
          } else if (user.role === "admin") {
            set({ currentScreen: "admin_dashboard" });
          }
          return { success: true, message: "تم تسجيل الدخول بنجاح" };
        },

        register: (data) => {
          const existing = get().users.find((u) => u.email === data.email);
          if (existing) {
            return { success: false, message: "البريد الإلكتروني مسجّل مسبقاً" };
          }
          const newUser: User = {
            id: `${data.role}_${Date.now()}`,
            role: data.role,
            name: data.name,
            email: data.email,
            passwordHash: data.password,
            createdAt: new Date().toISOString(),
            gradeKey: data.gradeKey,
            classroomId: data.classroomId,
            academicNumber: data.academicNumber,
            approved: data.role === "teacher" ? false : true, // المعلم يحتاج اعتماد
            classroomIds: data.role === "teacher" ? [] : undefined,
            avatarColor: ["#0EA5E9", "#10B981", "#F59E0B", "#8B5CF6"][Math.floor(Math.random() * 4)],
            points: 0,
            badges: [],
            streakDays: 0,
          };
          set({ users: [...get().users, newUser] });
          if (data.role === "teacher") {
            return {
              success: true,
              message: "تم إنشاء حسابك. سيتم تفعيله بعد اعتماد مدير النظام.",
            };
          }
          // تسجيل دخول تلقائي للطالب وتوجيهه للاختبار
          set({ currentUser: newUser });
          if (data.gradeKey) {
            const stage = getStageFromGrade(data.gradeKey);
            get().startPlacementTest(stage);
            set({ currentScreen: "placement_test" });
          }
          return { success: true, message: "تم إنشاء الحساب بنجاح" };
        },

        logout: () => {
          set({ currentUser: null, currentScreen: "home", currentTest: null });
        },

        users: initial.users,
        classrooms: initial.classrooms,
        testResults: initial.testResults,
        improvementPlans: initial.improvementPlans,
        customQuestions: initial.customQuestions,
        settings: initial.settings,

        currentTest: null,
        startPlacementTest: (stage) => {
          const count = get().settings.placementTestQuestionCount;
          const questions = getPlacementTestQuestions(stage, count);
          // دمج الأسئلة الافتراضية مع المخصصة
          const customStageQs = get().customQuestions.filter((q) => q.stage === stage);
          const allQuestions = [...questions, ...customStageQs].slice(0, count);
          set({
            currentTest: {
              questions: allQuestions,
              currentQuestionIndex: 0,
              answers: [],
              startedAt: Date.now(),
              timeLimitSec: get().settings.testTimeLimitMin * 60,
            },
          });
        },

        answerQuestion: (questionId, selectedAnswer) => {
          const test = get().currentTest;
          if (!test) return;
          const existing = test.answers.findIndex((a) => a.questionId === questionId);
          const newAnswers = [...test.answers];
          if (existing >= 0) {
            newAnswers[existing] = { questionId, selectedAnswer, timeSpentSec: 0 };
          } else {
            newAnswers.push({ questionId, selectedAnswer, timeSpentSec: 0 });
          }
          set({ currentTest: { ...test, answers: newAnswers } });
        },

        nextQuestion: () => {
          const test = get().currentTest;
          if (!test) return;
          if (test.currentQuestionIndex < test.questions.length - 1) {
            set({ currentTest: { ...test, currentQuestionIndex: test.currentQuestionIndex + 1 } });
          }
        },

        previousQuestion: () => {
          const test = get().currentTest;
          if (!test) return;
          if (test.currentQuestionIndex > 0) {
            set({ currentTest: { ...test, currentQuestionIndex: test.currentQuestionIndex - 1 } });
          }
        },

        finishTest: () => {
          const test = get().currentTest;
          const user = get().currentUser;
          if (!test || !user) return null;

          // حساب النتيجة
          const skillScores: Record<SkillKey, { correct: number; total: number }> = {
            main_idea: { correct: 0, total: 0 },
            inference: { correct: 0, total: 0 },
            vocabulary: { correct: 0, total: 0 },
            details: { correct: 0, total: 0 },
            sequencing: { correct: 0, total: 0 },
          };
          let correctCount = 0;
          const detailedAnswers = test.questions.map((q) => {
            const ans = test.answers.find((a) => a.questionId === q.id);
            const isCorrect = ans?.selectedAnswer === q.correctAnswer;
            if (isCorrect) correctCount++;
            skillScores[q.skill].total++;
            if (isCorrect) skillScores[q.skill].correct++;
            return {
              questionId: q.id,
              selectedAnswer: ans?.selectedAnswer || "",
              isCorrect,
              skill: q.skill,
              timeSpentSec: ans?.timeSpentSec || 0,
            };
          });

          const percentage = Math.round((correctCount / test.questions.length) * 100);
          const classification: ClassificationLevel =
            percentage < get().settings.classificationThresholds.supportMax
              ? "support"
              : percentage < get().settings.classificationThresholds.excellentMin
              ? "medium"
              : "excellent";

          const durationSec = Math.round((Date.now() - test.startedAt) / 1000);

          const hasInitial = get().testResults.some(
            (r) => r.studentId === user.id && r.isInitial
          );

          const result: PlacementTestResult = {
            id: `result_${user.id}_${Date.now()}`,
            studentId: user.id,
            takenAt: new Date().toISOString(),
            isInitial: !hasInitial,
            totalQuestions: test.questions.length,
            correctCount,
            percentage,
            classification,
            skillScores,
            durationSec,
            answers: detailedAnswers,
          };

          set({
            testResults: [...get().testResults, result],
            currentTest: null,
            currentScreen: "test_result",
          });

          // توليد خطة تحسين تلقائياً
          const weakSkill = (Object.entries(skillScores) as [SkillKey, { correct: number; total: number }][])
            .sort(([, a], [, b]) => a.correct / Math.max(1, a.total) - b.correct / Math.max(1, b.total))[0][0];

          const plan = generatePlanForStudent(user.id, classification, weakSkill);
          set({ improvementPlans: [...get().improvementPlans, plan] });

          return result;
        },

        addQuestion: (question) => {
          const newQ: Question = { ...question, id: `q_custom_${Date.now()}` };
          set({ customQuestions: [...get().customQuestions, newQ] });
        },

        updatePlan: (planId, updates) => {
          set({
            improvementPlans: get().improvementPlans.map((p) =>
              p.id === planId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
            ),
          });
        },

        approvePlan: (planId) => {
          set({
            improvementPlans: get().improvementPlans.map((p) =>
              p.id === planId ? { ...p, status: "approved", updatedAt: new Date().toISOString() } : p
            ),
          });
        },

        approveTeacher: (teacherId) => {
          set({
            users: get().users.map((u) =>
              u.id === teacherId ? { ...u, approved: true } : u
            ),
          });
        },

        rejectTeacher: (teacherId) => {
          set({ users: get().users.filter((u) => u.id !== teacherId) });
        },

        addClassroom: (name, gradeKey) => {
          const newClassroom: Classroom = {
            id: `c_${Date.now()}`,
            name,
            gradeKey: gradeKey as any,
            createdAt: new Date().toISOString(),
          };
          set({ classrooms: [...get().classrooms, newClassroom] });
        },

        updateSettings: (newSettings) => {
          set({ settings: { ...get().settings, ...newSettings } });
        },

        resetAllData: () => {
          const fresh = getInitialData();
          set({
            users: fresh.users,
            classrooms: fresh.classrooms,
            testResults: fresh.testResults,
            improvementPlans: fresh.improvementPlans,
            customQuestions: [],
            settings: fresh.settings,
            currentUser: null,
            currentScreen: "splash_app",
            currentTest: null,
          });
        },

        getStudentsByClassroom: (classroomId) => {
          return get().users.filter((u) => u.role === "student" && u.classroomId === classroomId);
        },

        getStudentResults: (studentId) => {
          return get().testResults.filter((r) => r.studentId === studentId);
        },

        getStudentPlan: (studentId) => {
          return get().improvementPlans.find((p) => p.studentId === studentId) || null;
        },

        getClassificationsByClassroom: (classroomId) => {
          const students = get().getStudentsByClassroom(classroomId);
          const result: Record<ClassificationLevel, number> = { support: 0, medium: 0, excellent: 0 };
          students.forEach((s) => {
            const r = get().testResults
              .filter((res) => res.studentId === s.id && res.isInitial)
              .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime())[0];
            if (r) result[r.classification]++;
          });
          return result;
        },

        getTeachersByClassroom: (classroomId) => {
          return get().users.filter(
            (u) => u.role === "teacher" && u.approved && u.classroomIds?.includes(classroomId)
          );
        },
      };
    },
    {
      name: "saahil-reading-platform",
      // تجنّب تخزين currentUser و currentTest و currentScreen للحفاظ على بداية نظيفة
      partialize: (state) => ({
        users: state.users,
        classrooms: state.classrooms,
        testResults: state.testResults,
        improvementPlans: state.improvementPlans,
        customQuestions: state.customQuestions,
        settings: state.settings,
      }),
    }
  )
);

// مساعد: تحديد المرحلة من الصف
function getStageFromGrade(grade: string): StageKey {
  const STAGE_MAP: Record<string, StageKey> = {
    g1: "primary_lower", g2: "primary_lower", g3: "primary_lower",
    g4: "primary_upper", g5: "primary_upper", g6: "primary_upper",
    m1: "intermediate", m2: "intermediate", m3: "intermediate",
    s1: "secondary", s2: "secondary", s3: "secondary",
  };
  return STAGE_MAP[grade] || "primary_lower";
}

// مساعد: توليد خطة لطالب
function generatePlanForStudent(studentId: string, classification: ClassificationLevel, weakSkill: SkillKey) {
  const weeklySchedule = [1, 2, 3, 4].map((weekNumber) => {
    const tasks = [
      { title: "قراءة نص قصير", skill: weakSkill, minutes: classification === "support" ? 10 : 20 },
      { title: "تمارين المفردات", skill: "vocabulary", minutes: 10 },
      { title: "أسئلة الفكرة الرئيسية", skill: "main_idea", minutes: 15 },
      { title: "تمارين الاستنتاج", skill: "inference", minutes: 15 },
    ];
    const task = tasks[weekNumber - 1] || tasks[0];
    return {
      id: `task_${Date.now()}_${weekNumber}`,
      weekNumber,
      title: task.title,
      description:
        classification === "support"
          ? `${task.title} - تركيز على المهارة الأضعف. نص قصير مع تغذية راجعة فورية.`
          : classification === "medium"
          ? `${task.title} - تدرج في الصعوبة مع تنوع النصوص.`
          : `${task.title} - نص عميق وتحديات استنتاجية متقدمة.`,
      skill: task.skill as any,
      estimatedMinutes: task.minutes,
      completed: false,
    };
  });

  return {
    id: `plan_${studentId}_${Date.now()}`,
    studentId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "draft" as const,
    classification,
    weeklySchedule,
    teacherNotes:
      classification === "support"
        ? "خطة مركّزة على المهارة الأضعف. نصوص قصيرة وتدريبات يومية مع تغذية راجعة فورية."
        : classification === "medium"
        ? "تدريبات متنوعة ومتدرجة الصعوبة."
        : "نصوص أعمق وأسئلة استنتاجية وتحديات.",
    nextAssessmentDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
  };
}
