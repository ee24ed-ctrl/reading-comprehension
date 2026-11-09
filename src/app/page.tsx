"use client";

import dynamic from "next/dynamic";
import { useAppStore } from "@/lib/store";
import { SplashScreen } from "@/components/screens/SplashScreen";
import { HomeScreen } from "@/components/screens/HomeScreen";

// مكون تحميل سريع وخفيف للتحميل الكسول
const ScreenLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-white">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-emerald-800 font-medium font-cairo">جاري التحميل...</p>
    </div>
  </div>
);

// تقسيم الحزم ديناميكياً (Code Splitting) لتسريع تحميل الصفحة الأولى بأقصى سرعة
const AuthScreen = dynamic(
  () => import("@/components/screens/AuthScreen").then((m) => m.AuthScreen),
  { loading: () => <ScreenLoading />, ssr: false }
);
const PlacementTestScreen = dynamic(
  () => import("@/components/screens/PlacementTestScreen").then((m) => m.PlacementTestScreen),
  { loading: () => <ScreenLoading />, ssr: false }
);
const TestResultScreen = dynamic(
  () => import("@/components/screens/TestResultScreen").then((m) => m.TestResultScreen),
  { loading: () => <ScreenLoading />, ssr: false }
);
const ImprovementPlanScreen = dynamic(
  () => import("@/components/screens/ImprovementPlanScreen").then((m) => m.ImprovementPlanScreen),
  { loading: () => <ScreenLoading />, ssr: false }
);
const StudentDashboard = dynamic(
  () => import("@/components/screens/StudentDashboard").then((m) => m.StudentDashboard),
  { loading: () => <ScreenLoading />, ssr: false }
);
const TeacherDashboard = dynamic(
  () => import("@/components/screens/TeacherDashboard").then((m) => m.TeacherDashboard),
  { loading: () => <ScreenLoading />, ssr: false }
);
const AdminDashboard = dynamic(
  () => import("@/components/screens/AdminDashboard").then((m) => m.AdminDashboard),
  { loading: () => <ScreenLoading />, ssr: false }
);
const TrainingsListScreen = dynamic(
  () => import("@/components/screens/TrainingsListScreen").then((m) => m.TrainingsListScreen),
  { loading: () => <ScreenLoading />, ssr: false }
);
const TrainingExerciseScreen = dynamic(
  () => import("@/components/screens/TrainingExerciseScreen").then((m) => m.TrainingExerciseScreen),
  { loading: () => <ScreenLoading />, ssr: false }
);
const TrainingResultScreen = dynamic(
  () => import("@/components/screens/TrainingResultScreen").then((m) => m.TrainingResultScreen),
  { loading: () => <ScreenLoading />, ssr: false }
);
const PostTestScreen = dynamic(
  () => import("@/components/screens/PostTestScreen").then((m) => m.PostTestScreen),
  { loading: () => <ScreenLoading />, ssr: false }
);
const PostTestResultScreen = dynamic(
  () => import("@/components/screens/PostTestResultScreen").then((m) => m.PostTestResultScreen),
  { loading: () => <ScreenLoading />, ssr: false }
);
const DailyReadingScreen = dynamic(
  () => import("@/components/screens/DailyReadingScreen").then((m) => m.DailyReadingScreen),
  { loading: () => <ScreenLoading />, ssr: false }
);

export default function Home() {
  const currentScreen = useAppStore((s) => s.currentScreen);
  const currentUser = useAppStore((s) => s.currentUser);

  // التحقق من تسجيل الدخول للوصول للوحات والشاشات التدريبية
  const needsAuth = [
    "student_dashboard",
    "teacher_dashboard",
    "admin_dashboard",
    "trainings_list",
    "training_exercise",
    "training_result",
    "post_test",
    "post_test_result",
    "improvement_plan",
  ].includes(currentScreen);
  if (needsAuth && !currentUser) {
    return <AuthScreen mode="login" />;
  }

  switch (currentScreen) {
    case "splash_app":
      return <SplashScreen type="app" />;
    case "splash_school":
      return <SplashScreen type="school" />;
    case "home":
      return <HomeScreen />;
    case "auth_login":
      return <AuthScreen mode="login" />;
    case "auth_register":
      return <AuthScreen mode="register" />;
    case "placement_test":
      return <PlacementTestScreen />;
    case "test_result":
      return <TestResultScreen />;
    case "improvement_plan":
      return <ImprovementPlanScreen />;
    case "student_dashboard":
      return <StudentDashboard />;
    case "teacher_dashboard":
      return <TeacherDashboard />;
    case "admin_dashboard":
      return <AdminDashboard />;
    case "trainings_list":
      return <TrainingsListScreen />;
    case "training_exercise":
      return <TrainingExerciseScreen />;
    case "training_result":
      return <TrainingResultScreen />;
    case "post_test":
      return <PostTestScreen />;
    case "post_test_result":
      return <PostTestResultScreen />;
    case "daily_reading":
      return <DailyReadingScreen />;
    default:
      return <HomeScreen />;
  }
}
