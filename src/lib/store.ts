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
  TrainingExercise,
  TrainingResult,
  PostTest,
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
import { getTrainingsBySkill, getTrainingsByLevel } from "./trainings";

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
  | "admin_dashboard"
  | "trainings_list"      // قائمة التدريبات للمهارة الضعيفة
  | "training_exercise"    // تنفيذ تدريب محدد
  | "training_result"      // نتيجة التدريب
  | "post_test"            // الاختبار البعدي بعد التدريب
  | "post_test_result";    // نتيجة الاختبار البعدي

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

  // ====== التدريبات والاختبار البعدي ======
  // نتائج التدريبات لكل الطلاب
  trainingResults: TrainingResult[];
  // نتائج الاختبارات البعدية
  postTests: PostTest[];
  // التدريب الحالي قيد التنفيذ
  currentTraining: {
    exercise: TrainingExercise;
    currentQuestionIndex: number;
    answers: { questionId: string; selectedAnswer: string; isCorrect: boolean }[];
    startedAt: number;
    showHint: boolean;
    showExplanation: boolean;
  } | null;
  // الاختبار البعدي الحالي
  currentPostTest: {
    questions: Question[];
    currentQuestionIndex: number;
    answers: { questionId: string; selectedAnswer: string; timeSpentSec: number }[];
    startedAt: number;
    skill: SkillKey;
    studentId: string;
    preTestPercentage: number;
  } | null;

  // إجراءات التدريبات
  startTraining: (stage: StageKey, skill: SkillKey, level: 1 | 2 | 3) => void;
  answerTrainingQuestion: (questionId: string, selectedAnswer: string) => void;
  nextTrainingQuestion: () => void;
  toggleTrainingHint: () => void;
  showTrainingExplanation: () => void;
  finishTraining: () => TrainingResult | null;

  // إجراءات الاختبار البعدي
  startPostTest: (skill: SkillKey, studentId: string, preTestPercentage: number) => void;
  answerPostTestQuestion: (questionId: string, selectedAnswer: string) => void;
  nextPostTestQuestion: () => void;
  previousPostTestQuestion: () => void;
  finishPostTest: () => PostTest | null;

  // مساعدات التدريبات
  getTrainingsBySkillForStudent: (studentId: string, skill: SkillKey) => TrainingResult[];
  getPostTestsForStudent: (studentId: string) => PostTest[];
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
    // حقول التدريبات والاختبارات البعدية
    trainingResults: [] as TrainingResult[],
    postTests: [] as PostTest[],
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
        // حقول التدريبات والاختبارات البعدية
        trainingResults: initial.trainingResults,
        postTests: initial.postTests,
        currentTraining: null,
        currentPostTest: null,

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
            // تخزين نسخة من الأسئلة مع النتيجة لعرضها في مراجعة الإجابات
            // حتى بعد مسح currentTest
            questions: [...test.questions],
          };

          set({
            testResults: [...get().testResults, result],
            currentTest: null,
            currentScreen: "test_result",
          });

          // توليد خطة تحسين تلقائياً
          const weakSkill = (Object.entries(skillScores) as [SkillKey, { correct: number; total: number }][])
            .sort(([, a], [, b]) => a.correct / Math.max(1, a.total) - b.correct / Math.max(1, b.total))[0][0];

          const newPlan = generatePlanForStudent(user.id, classification, weakSkill);

          // استبدال الخطة القديمة (إن وُجدت) بالخطة الجديدة
          // هذا يضمن أن المعلم يرى آخر خطة بناءً على آخر اختبار
          const existingPlanIndex = get().improvementPlans.findIndex(
            (p) => p.studentId === user.id
          );
          if (existingPlanIndex >= 0) {
            // حفظ ملاحظات المعلم من الخطة القديمة (إن وُجدت)
            const oldPlan = get().improvementPlans[existingPlanIndex];
            const preservedNotes = oldPlan.teacherNotes && oldPlan.status === "approved"
              ? oldPlan.teacherNotes
              : newPlan.teacherNotes;
            const preservedStatus = oldPlan.status === "approved" ? "draft" : newPlan.status;

            const updatedPlans = [...get().improvementPlans];
            updatedPlans[existingPlanIndex] = {
              ...newPlan,
              id: oldPlan.id, // الإبقاء على نفس ID للخطة
              teacherNotes: preservedNotes,
              status: preservedStatus as any,
              createdAt: oldPlan.createdAt, // الإبقاء على تاريخ الإنشاء الأصلي
              updatedAt: new Date().toISOString(),
            };
            set({ improvementPlans: updatedPlans });
          } else {
            // لا توجد خطة قديمة - أضف الجديدة
            set({ improvementPlans: [...get().improvementPlans, newPlan] });
          }

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

        // ====== دوال التدريبات ======
        startTraining: (stage, skill, level) => {
          const exercise = getTrainingsByLevel(stage, skill, level);
          if (!exercise) return;
          set({
            currentTraining: {
              exercise,
              currentQuestionIndex: 0,
              answers: [],
              startedAt: Date.now(),
              showHint: false,
              showExplanation: false,
            },
            currentScreen: "training_exercise",
          });
        },

        answerTrainingQuestion: (questionId, selectedAnswer) => {
          const training = get().currentTraining;
          if (!training) return;
          const question = training.exercise.questions.find((q) => q.id === questionId);
          if (!question) return;
          const isCorrect = selectedAnswer === question.correctAnswer;
          // تحديث أو إضافة الإجابة
          const existing = training.answers.findIndex((a) => a.questionId === questionId);
          const newAnswers = [...training.answers];
          if (existing >= 0) {
            newAnswers[existing] = { questionId, selectedAnswer, isCorrect };
          } else {
            newAnswers.push({ questionId, selectedAnswer, isCorrect });
          }
          // عرض الشرح بعد الإجابة
          set({
            currentTraining: {
              ...training,
              answers: newAnswers,
              showExplanation: true,
              showHint: false,
            },
          });
        },

        nextTrainingQuestion: () => {
          const training = get().currentTraining;
          if (!training) return;
          if (training.currentQuestionIndex < training.exercise.questions.length - 1) {
            set({
              currentTraining: {
                ...training,
                currentQuestionIndex: training.currentQuestionIndex + 1,
                showExplanation: false,
                showHint: false,
              },
            });
          }
        },

        toggleTrainingHint: () => {
          const training = get().currentTraining;
          if (!training) return;
          set({
            currentTraining: {
              ...training,
              showHint: !training.showHint,
            },
          });
        },

        showTrainingExplanation: () => {
          const training = get().currentTraining;
          if (!training) return;
          set({
            currentTraining: {
              ...training,
              showExplanation: true,
            },
          });
        },

        finishTraining: () => {
          const training = get().currentTraining;
          const user = get().currentUser;
          if (!training || !user) return null;

          const correctCount = training.answers.filter((a) => a.isCorrect).length;
          const totalQuestions = training.exercise.questions.length;
          const percentage = Math.round((correctCount / totalQuestions) * 100);
          const passed = percentage >= 70;
          const timeSpentSec = Math.round((Date.now() - training.startedAt) / 1000);

          const result: TrainingResult = {
            id: `training_result_${user.id}_${Date.now()}`,
            studentId: user.id,
            exerciseId: training.exercise.id,
            skill: training.exercise.skill,
            level: training.exercise.level,
            takenAt: new Date().toISOString(),
            totalQuestions,
            correctCount,
            percentage,
            passed,
            timeSpentSec,
          };

          set({
            trainingResults: [...get().trainingResults, result],
            currentTraining: null,
            currentScreen: "training_result",
          });

          return result;
        },

        // ====== دوال الاختبار البعدي ======
        startPostTest: (skill, studentId, preTestPercentage) => {
          // استخدم أسئلة الاختبار القبلي لنفس المهارة
          const user = get().users.find((u) => u.id === studentId);
          if (!user || !user.gradeKey) return;
          const stage = getStageFromGrade(user.gradeKey);
          // خذ أسئلة من بنك الأسئلة للمهارة المختارة
          const stageQuestions = getPlacementTestQuestions(stage, 5);
          // فلترة للمهارة المحددة
          const skillQuestions = stageQuestions.filter((q) => q.skill === skill);
          // إذا لم تكن كافية، خذ أي أسئلة من المرحلة
          const questions = skillQuestions.length >= 5 ? skillQuestions.slice(0, 5) : stageQuestions.slice(0, 5);

          set({
            currentPostTest: {
              questions,
              currentQuestionIndex: 0,
              answers: [],
              startedAt: Date.now(),
              skill,
              studentId,
              preTestPercentage,
            },
            currentScreen: "post_test",
          });
        },

        answerPostTestQuestion: (questionId, selectedAnswer) => {
          const test = get().currentPostTest;
          if (!test) return;
          const existing = test.answers.findIndex((a) => a.questionId === questionId);
          const newAnswers = [...test.answers];
          if (existing >= 0) {
            newAnswers[existing] = { questionId, selectedAnswer, timeSpentSec: 0 };
          } else {
            newAnswers.push({ questionId, selectedAnswer, timeSpentSec: 0 });
          }
          set({ currentPostTest: { ...test, answers: newAnswers } });
        },

        nextPostTestQuestion: () => {
          const test = get().currentPostTest;
          if (!test) return;
          if (test.currentQuestionIndex < test.questions.length - 1) {
            set({
              currentPostTest: { ...test, currentQuestionIndex: test.currentQuestionIndex + 1 },
            });
          }
        },

        previousPostTestQuestion: () => {
          const test = get().currentPostTest;
          if (!test) return;
          if (test.currentQuestionIndex > 0) {
            set({
              currentPostTest: { ...test, currentQuestionIndex: test.currentQuestionIndex - 1 },
            });
          }
        },

        finishPostTest: () => {
          const test = get().currentPostTest;
          if (!test) return null;

          let correctCount = 0;
          const detailedAnswers = test.questions.map((q) => {
            const ans = test.answers.find((a) => a.questionId === q.id);
            const isCorrect = ans?.selectedAnswer === q.correctAnswer;
            if (isCorrect) correctCount++;
            return {
              questionId: q.id,
              selectedAnswer: ans?.selectedAnswer || "",
              isCorrect,
              skill: q.skill,
              timeSpentSec: ans?.timeSpentSec || 0,
            };
          });

          const percentage = Math.round((correctCount / test.questions.length) * 100);
          const durationSec = Math.round((Date.now() - test.startedAt) / 1000);
          const improvedFromPre = percentage - test.preTestPercentage;

          const result: PostTest = {
            id: `post_test_${test.studentId}_${Date.now()}`,
            studentId: test.studentId,
            skill: test.skill,
            takenAt: new Date().toISOString(),
            totalQuestions: test.questions.length,
            correctCount,
            percentage,
            improvedFromPre,
            durationSec,
            answers: detailedAnswers,
            questions: [...test.questions],
          };

          set({
            postTests: [...get().postTests, result],
            currentPostTest: null,
            currentScreen: "post_test_result",
          });

          return result;
        },

        getTrainingsBySkillForStudent: (studentId, skill) => {
          return get().trainingResults.filter((r) => r.studentId === studentId && r.skill === skill);
        },

        getPostTestsForStudent: (studentId) => {
          return get().postTests.filter((p) => p.studentId === studentId);
        },
      };
    },
    {
      name: "saahil-reading-platform",
      version: 8, // رفع الإصدار لإضافة نظام التدريبات والاختبارات البعدية
      // تجنّب تخزين currentUser و currentTest و currentScreen للحفاظ على بداية نظيفة
      partialize: (state) => ({
        users: state.users,
        classrooms: state.classrooms,
        testResults: state.testResults,
        improvementPlans: state.improvementPlans,
        customQuestions: state.customQuestions,
        settings: state.settings,
        // إضافة نتائج التدريبات والاختبارات البعدية للتخزين
        trainingResults: state.trainingResults,
        postTests: state.postTests,
      }),
      // ترحيل آمن: عند تغيّر الإصدار أو وجود بيانات تالفة، أعد بناء البيانات
      migrate: (persistedState: any, version: number) => {
        try {
          // أي إصدار أقل من 8، أو بيانات تالفة، نعيد بناءها بالكامل
          if (version < 8 || !persistedState || typeof persistedState !== "object") {
            const fresh = getInitialData();
            return {
              ...persistedState,
              users: fresh.users,
              classrooms: fresh.classrooms,
              testResults: fresh.testResults,
              improvementPlans: fresh.improvementPlans,
              customQuestions: fresh.customQuestions,
              settings: fresh.settings,
            };
          }
          // تحقق من صحة البيانات الموجودة - يجب أن تحتوي على بيانات فعلية وليست فارغة
          const requiredArrays = ["users", "classrooms", "testResults", "improvementPlans", "customQuestions"];
          let needsRebuild = false;
          for (const key of requiredArrays) {
            if (!Array.isArray(persistedState[key])) {
              needsRebuild = true;
              break;
            }
          }
          // إذا كانت users فارغة، أعد بناء البيانات التجريبية
          if (Array.isArray(persistedState.users) && persistedState.users.length === 0) {
            needsRebuild = true;
          }
          if (needsRebuild) {
            const fresh = getInitialData();
            return {
              ...persistedState,
              users: fresh.users,
              classrooms: fresh.classrooms,
              testResults: fresh.testResults,
              improvementPlans: fresh.improvementPlans,
              customQuestions: fresh.customQuestions,
              settings: fresh.settings,
            };
          }
          // تحقق من وجود settings
          if (!persistedState.settings || typeof persistedState.settings !== "object") {
            persistedState.settings = DEFAULT_SYSTEM_SETTINGS;
          }
          return persistedState;
        } catch (e) {
          // في حالة أي خطأ، أعد بناء البيانات بالكامل
          console.warn("خطأ في ترحيل البيانات، إعادة بناء البيانات:", e);
          return getInitialData();
        }
      },
      // تخطي أخطاء hydration
      skipHydration: false,
      // ملاحظة: لا نستخدم onRehydrateStorage لأنه يُسبب infinite loop
      // عندما يُعدّل الـ state مباشرة بدون set().
      // migrate يتكفّل بإعادة بناء البيانات عند الحاجة.
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
// تولّد خطة شاملة لمدة 4 أسابيع، كل أسبوع يحتوي على عدة مهام
// تغطي جميع مهارات الفهم القرائي الخمس
function generatePlanForStudent(studentId: string, classification: ClassificationLevel, weakSkill: SkillKey) {
  // المهارات الخمس الرئيسية
  const ALL_SKILLS: SkillKey[] = ["main_idea", "inference", "vocabulary", "details", "sequencing"];

  // تكوين الجدول الأسبوعي - 4 أسابيع، كل أسبوع فيه 5 مهام (مهمة لكل مهارة)
  const weeklySchedule = [1, 2, 3, 4].flatMap((weekNumber) => {
    return ALL_SKILLS.map((skill) => {
      // تركيز على المهارة الأضعف بمزيد من الوقت
      const isWeakSkill = skill === weakSkill;
      const isStrongSkill = skill !== weakSkill;

      // وقت المهمة حسب الأهمية والمرحلة
      let minutes = 10;
      if (isWeakSkill) minutes = classification === "support" ? 20 : 15;
      else if (classification === "excellent") minutes = 15;
      else minutes = 10;

      // عنوان المهمة حسب المهارة والأسبوع
      const skillTasks: Record<SkillKey, { title: string; desc: string }> = {
        main_idea: {
          title: "استخراج الفكرة الرئيسية",
          desc: "اقرأ النص ثم حدّد الفكرة المحورية التي يدور حولها النص",
        },
        inference: {
          title: "تمارين الاستنتاج",
          desc: "استنتج الإجابات من سياق النص دون ذكرها صراحة",
        },
        vocabulary: {
          title: "تمارين المفردات",
          desc: "استخرج معاني المفردات من السياق",
        },
        details: {
          title: "استخراج التفاصيل",
          desc: "تعرّف على التفاصيل الدقيقة في النص",
        },
        sequencing: {
          title: "ترتيب الأحداث",
          desc: "رتب الأحداث حسب ورودها في النص",
        },
      };

      const taskInfo = skillTasks[skill];

      // وصف المهمة حسب التصنيف
      let description = "";
      if (classification === "support") {
        // للمستوى الذي يحتاج دعم: تركيز على المهارة الأضعف
        if (isWeakSkill) {
          description = `الأسبوع ${weekNumber}: ${taskInfo.title} - 🔴 مهم جداً (مهارتك الأضعف). ${taskInfo.desc}. ابدأ بنص قصير ومبسّط، مع تغذية راجعة فورية بعد كل سؤال. كرّر التمرين حتى تتقنه.`;
        } else {
          description = `الأسبوع ${weekNumber}: ${taskInfo.title} - ${taskInfo.desc}. تدريب أساسي بمستوى مناسب.`;
        }
      } else if (classification === "medium") {
        // للمستوى المتوسط: تدرّج في الصعوبة
        if (isWeakSkill) {
          description = `الأسبوع ${weekNumber}: ${taskInfo.title} - ⚠️ مهارة تحتاج تعزيز. ${taskInfo.desc}. تدريبات متدرّجة الصعوبة، ابدأ من المستوى الأساسي وانتقل تدريجياً للمتوسط.`;
        } else {
          description = `الأسبوع ${weekNumber}: ${taskInfo.title} - ${taskInfo.desc}. تدريبات متنوعة على نصوص أدبية ومعلوماتية.`;
        }
      } else {
        // للمستوى المتفوق: تحديات وعمق
        if (isWeakSkill) {
          description = `الأسبوع ${weekNumber}: ${taskInfo.title} - 💪 تحدٍّ إضافي. ${taskInfo.desc}. نصوص أعمق وأسئلة استنتاجية متقدمة لتحقيق التميّز.`;
        } else {
          description = `الأسبوع ${weekNumber}: ${taskInfo.title} - ${taskInfo.desc}. نصوص معلوماتية وأدبية متنوعة مع أسئلة تحليلية.`;
        }
      }

      return {
        id: `task_${Date.now()}_${weekNumber}_${skill}`,
        weekNumber,
        title: `${taskInfo.title}${isWeakSkill ? " (تركيز)" : ""}`,
        description,
        skill: skill as any,
        estimatedMinutes: minutes,
        completed: false,
      };
    });
  });

  // ملاحظات المعلم حسب المستوى
  const teacherNotesByClassification: Record<ClassificationLevel, string> = {
    support:
      "📌 خطة مركّزة للمستوى الذي يحتاج دعماً:\n" +
      "• تركيز يومي على المهارة الأضعف (مظللة بالأحمر)\n" +
      "• نصوص قصيرة ومبسّطة مناسبة للمستوى\n" +
      "• تغذية راجعة فورية بعد كل سؤال\n" +
      "• إعادة تقييم بعد 4 أسابيع لقياس التقدّم\n" +
      "• يُنصح بالتواصل مع ولي الأمر لمتابعة التقدّم في المنزل",
    medium:
      "📌 خطة متوازنة للمستوى المتوسط:\n" +
      "• تدريبات متنوعة على جميع المهارات الخمس\n" +
      "• تدرّج في الصعوبة من السهل إلى المتوسط\n" +
      "• نصوص أدبية ومعلوماتية متنوعة\n" +
      "• تركيز إضافي على المهارة الأضعف (مظللة بالأصفر)\n" +
      "• إعادة تقييم بعد 4 أسابيع للانتقال لمستوى متفوّق",
    excellent:
      "📌 خطة متقدمة للمستوى المتفوق:\n" +
      "• نصوص أعمق وأطول من المستوى العادي\n" +
      "• أسئلة استنتاجية وتحليلية متقدمة\n" +
      "• تحديات لغوية وبلاغية\n" +
      "• تشجيع الإبداع في التعبير\n" +
      "• إعداد للقدرات اللفظية للمرحلة الجامعية\n" +
      "• تحديات إضافية على المهارات (مظللة بالبنفسجي)",
  };

  return {
    id: `plan_${studentId}_${Date.now()}`,
    studentId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "draft" as const,
    classification,
    weeklySchedule,
    teacherNotes: teacherNotesByClassification[classification],
    nextAssessmentDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
  };
}
