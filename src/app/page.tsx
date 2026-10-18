"use client";

import { useAppStore } from "@/lib/store";
import { SplashScreen } from "@/components/screens/SplashScreen";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { AuthScreen } from "@/components/screens/AuthScreen";
import { PlacementTestScreen } from "@/components/screens/PlacementTestScreen";
import { TestResultScreen } from "@/components/screens/TestResultScreen";
import { ImprovementPlanScreen } from "@/components/screens/ImprovementPlanScreen";
import { StudentDashboard } from "@/components/screens/StudentDashboard";
import { TeacherDashboard } from "@/components/screens/TeacherDashboard";
import { AdminDashboard } from "@/components/screens/AdminDashboard";

export default function Home() {
  const currentScreen = useAppStore((s) => s.currentScreen);
  const currentUser = useAppStore((s) => s.currentUser);

  // التحقق من تسجيل الدخول للوصول للوحات
  const needsAuth = ["student_dashboard", "teacher_dashboard", "admin_dashboard"].includes(currentScreen);
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
    default:
      return <HomeScreen />;
  }
}
