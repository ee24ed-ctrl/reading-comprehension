"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  BookOpen,
  ShieldCheck,
  ArrowLeft,
  LogOut,
  Sparkles,
  School,
  Layers,
  Award,
  LogIn,
  UserPlus,
  Lock,
  Flame,
} from "lucide-react";
import { DEFAULT_SETTINGS, GRADES, STAGES } from "@/lib/stages";
import { ASSETS } from "@/lib/assets";
import { toast } from "sonner";
import type { StageKey } from "@/lib/types";

export function HomeScreen() {
  const setScreen = useAppStore((s) => s.setScreen);
  const currentUser = useAppStore((s) => s.currentUser);
  const logout = useAppStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    toast.success("تم تسجيل الخروج بنجاح");
  };

  const goToDashboard = () => {
    if (!currentUser) return;
    if (currentUser.role === "student") setScreen("student_dashboard");
    else if (currentUser.role === "teacher") setScreen("teacher_dashboard");
    else if (currentUser.role === "admin") setScreen("admin_dashboard");
  };

  // المراحل الدراسية الأربع للطلاب مع اختبارات نافس والكتب الوزارية
  const stageCards: {
    key: StageKey;
    title: string;
    sub: string;
    grades: string;
    notes: string;
    badge: string;
    nafesBadge: string;
    color: string;
    gradient: string;
  }[] = [
    {
      key: "primary_lower",
      title: "الصفوف الأولية",
      sub: "الأول — الثاني — الثالث الابتدائي",
      grades: "الأعمار 6 - 8 سنوات",
      notes: "نصوص لغتي 1448 المشكولة، و3 نماذج مقننة لاختبار نافس الوطني للصف الثالث الابتدائي لقياس الفهم والاستنتاج.",
      badge: "لغتي 1448",
      nafesBadge: "نافس 3 ابتدائي",
      color: "border-sky-300 hover:border-sky-500",
      gradient: "from-sky-500 to-cyan-500",
    },
    {
      key: "primary_upper",
      title: "الصفوف العليا",
      sub: "الرابع — الخامس — السادس الابتدائي",
      grades: "الأعمار 9 - 11 سنة",
      notes: "نصوص لغتي الجميلة الوطنية، و3 نماذج مقننة لاختبار نافس الوطني للصف السادس الابتدائي لقياس النصوص المعلوماتية والأدبية.",
      badge: "لغتي الجميلة 1448",
      nafesBadge: "نافس 6 ابتدائي",
      color: "border-emerald-300 hover:border-emerald-500",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      key: "intermediate",
      title: "المرحلة المتوسطة",
      sub: "الأول — الثاني — الثالث المتوسط",
      grades: "الأعمار 12 - 14 سنة",
      notes: "نصوص لغتي الخالدة الفكرية، و3 نماذج مقننة لاختبار نافس الوطني للصف الثالث المتوسط لتحليل الأدلة ونقد الأفكار.",
      badge: "لغتي الخالدة 1448",
      nafesBadge: "نافس 3 متوسط",
      color: "border-purple-300 hover:border-purple-500",
      gradient: "from-purple-500 to-indigo-500",
    },
    {
      key: "secondary",
      title: "المرحلة الثانوية",
      sub: "الأول — الثاني — الثالث الثانوي",
      grades: "الأعمار 15 - 17 سنة",
      notes: "كفايات مسارات الثانوية، و3 نماذج مقننة تجمع بين استيعاب المقروء واختبارات القدرات اللفظية لقياس (التناظر، الخطأ السياقي، إكمال الجمل).",
      badge: "كفايات مسارات 1448",
      nafesBadge: "نافس والقدرات (قياس)",
      color: "border-amber-300 hover:border-amber-500",
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-sea flex flex-col">
      {/* شريط المستخدم المسجل حالياً */}
      {currentUser && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2.5 backdrop-blur-sm sticky top-0 z-50 animate-slide-up">
          <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                style={{ background: currentUser.avatarColor || "var(--primary)" }}
              >
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-sm">
                <span className="font-bold text-foreground">{currentUser.name}</span>
                <span className="text-muted-foreground mx-1.5">•</span>
                <Badge variant="secondary" className="text-xs">
                  {currentUser.role === "student"
                    ? (currentUser.gradeKey ? GRADES[currentUser.gradeKey].label : "طالب")
                    : currentUser.role === "teacher"
                    ? "معلم"
                    : "مدير النظام"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" onClick={goToDashboard} className="h-8 gap-1.5 text-xs shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                الانتقال إلى لوحتي
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleLogout}
                className="h-8 gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* الشعار في أعلى الصفحة */}
      <div className="pt-6 pb-2 px-6 flex justify-center">
        <button
          onClick={() => setScreen("auth_login")}
          className="w-28 h-28 md:w-36 md:h-36 transition-transform hover:scale-105"
          title="تسجيل الدخول"
          aria-label="مدرسة الساحل الأهلية (بنين)"
        >
          <img
            src={ASSETS.schoolLogo}
            onError={(e) => { e.currentTarget.src = ASSETS.fallbackLogo; }}
            alt="شعار مدرسة الساحل الأهلية (بنين)"
            className="w-full h-full object-contain drop-shadow-md"
          />
        </button>
      </div>

      {/* الرأس */}
      <header className="px-6 pt-2 pb-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl md:text-4xl font-extrabold text-primary leading-tight mb-1">
            {DEFAULT_SETTINGS.appName}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium">
            منصة الفهم القرائي المتوافقة مع المنهج السعودي الحديث 1448
          </p>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 px-4 md:px-6 pb-8">
        <div className="w-full max-w-6xl mx-auto">
          {/* بطاقة الترحيب */}
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-primary font-semibold">مدرسة الساحل الأهلية (بنين)</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 leading-tight">
              بوابة قياس وتنمية مهارات الفهم القرائي
              <span className="block text-gradient bg-gradient-primary bg-clip-text text-transparent mt-1">
                لجميع المراحل الدراسية (1448 هـ)
              </span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              اختر مرحلتك التعليمية للدخول المباشر إلى اختبارات وتدريبات الفهم القرائي المصممة خصيصاً لكل فئة عمرية.
            </p>
          </div>

          {/* بانر قسم القراءة اليومية والقصص المصورة */}
          <div className="mb-8">
            <Card className="rounded-3xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl overflow-hidden relative">
              <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-white/5 rounded-r-full pointer-events-none" />
              <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="space-y-3 text-center md:text-right">
                  <div className="inline-flex items-center gap-2 bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-xs font-black shadow-sm">
                    <Flame className="w-4 h-4 fill-amber-950 text-amber-950 animate-bounce" />
                    جديد: تحدي القراءة اليومية للطلاب
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    حكايات الساحل — قصص مصورة وقراءة يومية
                  </h3>
                  <p className="text-emerald-100 text-sm sm:text-base max-w-xl leading-relaxed">
                    قصص قصيرة يومية مصورة برسومات جميلة تناسب كل مرحلة دراسية، تنتهي بـ 3 أسئلة فهم قرائي ذكية ونقاط وشارات فورية!
                  </p>
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <Button
                    onClick={() => setScreen("daily_reading")}
                    size="lg"
                    className="bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-base py-6 px-8 rounded-2xl shadow-lg shadow-black/10 gap-2 w-full sm:w-auto"
                  >
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    ابدأ قراءة قصة اليوم الآن
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* قسم بطاقات المراحل الدراسية الأربع */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
              <School className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg text-foreground">
                المراحل الدراسية للطلاب (المنهج السعودي 1448)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stageCards.map((stage) => (
                <Card
                  key={stage.key}
                  className={`overflow-hidden border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between ${stage.color}`}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-1 flex-wrap mb-3">
                      <Badge className="text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                        {stage.nafesBadge}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-medium bg-primary/5 text-primary border-primary/20">
                        {stage.badge}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2.5 mb-2">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${stage.gradient}`} />
                      <h4 className="font-bold text-lg text-foreground">{stage.title}</h4>
                    </div>

                    <p className="text-xs font-semibold text-primary/80 mb-2">{stage.sub}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">{stage.notes}</p>
                  </div>

                  <div className="p-4 pt-0 space-y-2 border-t border-border/40 mt-auto bg-muted/20">
                    <Button
                      className="w-full text-xs h-9 font-bold gap-1.5 shadow-sm"
                      onClick={() => setScreen("auth_login")}
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      تسجيل الدخول للمرحلة
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8 text-muted-foreground hover:text-foreground border-border/60"
                      onClick={() => setScreen("auth_register")}
                    >
                      <UserPlus className="w-3.5 h-3.5 ml-1" />
                      إنشاء حساب طالب جديد
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* بوابات المعلمين والإدارة */}
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
            {/* بوابة المعلم */}
            <Card
              onClick={() => setScreen("auth_login")}
              className="p-5 cursor-pointer border-2 hover:border-amber-400 transition-all hover:shadow-md group relative overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md text-white flex-shrink-0 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-base md:text-lg text-foreground mb-1">
                    بوابة المعلمين والمعلمات
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                    متابعة الطلاب لجميع المراحل، اعتماد خطط التحسين، وتصفح بنك أسئلة 1448.
                  </p>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    دخول المعلم <ArrowLeft className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Card>

            {/* بوابة مدير النظام */}
            <Card
              onClick={() => setScreen("auth_login")}
              className="p-5 cursor-pointer border-2 hover:border-slate-500 transition-all hover:shadow-md group relative overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-md text-white flex-shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-base md:text-lg text-foreground mb-1">
                    بوابة مدير النظام والإدارة
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                    التحليلات الشاملة، مؤشرات الفجوة التعليمية، وإدارة حسابات الفصول والمراحل.
                  </p>
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1 group-hover:gap-2 transition-all">
                    دخول الإدارة <ArrowLeft className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* روابط سريعة إضافية */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 bg-card/60 backdrop-blur rounded-2xl border border-border/60 max-w-xl mx-auto text-center">
            <span className="text-xs text-muted-foreground">طالب جديد وترغب في الانضمام؟</span>
            <Button
              variant="default"
              size="sm"
              onClick={() => setScreen("auth_register")}
              className="rounded-full text-xs font-bold"
            >
              إنشاء حساب جديد لجميع المراحل
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScreen("auth_login")}
              className="rounded-full text-xs"
            >
              تسجيل الدخول بالبيانات
            </Button>
          </div>

          {/* إحصائيات سريعة */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <StatCard number="4" label="مراحل دراسية كاملة" />
            <StatCard number="12" label="صفاً دراسياً (ابتدائي/متوسط/ثانوي)" />
            <StatCard number="128+" label="سؤالاً من المنهج السعودي 1448" />
            <StatCard number="60" label="تدريباً علاجياً متدرج الصعوبة" />
          </div>
        </div>
      </main>

      {/* التذييل */}
      <footer className="py-4 px-6 text-center text-xs text-muted-foreground border-t border-border/40 bg-card/40">
        <p>منصة الفهم القرائي — مدرسة الساحل الأهلية (بنين) — متوافقة مع معايير وزارة التعليم وهيئة تقويم التعليم 1448 هـ</p>
      </footer>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-card/70 border border-border/60 rounded-xl p-3 text-center shadow-xs">
      <div className="text-lg md:text-xl font-extrabold text-primary">{number}</div>
      <div className="text-[11px] md:text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
