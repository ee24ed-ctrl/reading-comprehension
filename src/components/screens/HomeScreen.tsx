"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, BookOpen, ShieldCheck, ArrowLeft, Sparkles } from "lucide-react";
import { useState } from "react";
import { DEFAULT_SETTINGS } from "@/lib/stages";

export function HomeScreen() {
  const setScreen = useAppStore((s) => s.setScreen);
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [showAdminLink, setShowAdminLink] = useState(false);

  const roles = [
    {
      key: "student",
      label: "دخول كطالب",
      description: "اختبارات، تدريبات، ونتائج تفصيلية لتنمية مهاراتك",
      icon: BookOpen,
      gradient: "from-sky-500 to-teal-500",
      onClick: () => setScreen("auth_login"),
    },
    {
      key: "teacher",
      label: "دخول كمعلم",
      description: "إدارة الطلاب، إضافة الأسئلة، ومتابعة خطط التحسين",
      icon: GraduationCap,
      gradient: "from-amber-500 to-orange-500",
      onClick: () => setScreen("auth_login"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-sea flex flex-col">
      {/* الرأس */}
      <header className="px-6 py-8 md:py-12">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* شعار المدرسة الفعلي */}
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white shadow-md border border-border/60 overflow-hidden p-1.5 flex items-center justify-center">
              { }
              <img
                src="/school-logo.png"
                alt="شعار مدرسة الساحل الأهلية (بنين)"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary leading-tight">
                {DEFAULT_SETTINGS.appName}
              </h1>
              <p className="text-sm text-muted-foreground">منصة الفهم القرائي</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>منصة تعليمية متكاملة</span>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-5xl">
          {/* بطاقة الترحيب */}
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-primary font-medium">مدرسة الساحل الأهلية (بنين)</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              أهلاً بك في رحلة
              <span className="block text-gradient bg-gradient-primary bg-clip-text text-transparent mt-1">
                الفهم القرائي
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              منصة تعليمية لقياس وتنمية مهارات الفهم القرائي لدى طلابنا من الصف الأول الابتدائي حتى الثالث الثانوي،
              مع متابعة دقيقة من المعلمين والإدارة.
            </p>
          </div>

          {/* بطاقات الدخول */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Card
                  key={role.key}
                  onMouseEnter={() => setHoveredRole(role.key)}
                  onMouseLeave={() => setHoveredRole(null)}
                  className="relative overflow-hidden p-6 md:p-8 cursor-pointer border-2 hover:border-primary/30 hover-lift transition-all duration-300 group"
                  onClick={role.onClick}
                >
                  {/* تأثير خلفية عند الـ hover */}
                  <div
                    className={`absolute -top-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`}
                  />

                  <div className="relative">
                    <div
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                      {role.label}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-5">{role.description}</p>
                    <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                      <span>ادخل الآن</span>
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* روابط إضافية */}
          <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4">
            <p className="text-sm text-muted-foreground">ليس لديك حساب؟</p>
            <Button
              variant="outline"
              onClick={() => setScreen("auth_register")}
              className="rounded-full"
            >
              أنشئ حساباً جديداً
            </Button>
            {/* رابط خفي لدخول الأدمن - يظهر عند الضغط المطوّل */}
            <button
              onClick={() => setShowAdminLink(!showAdminLink)}
              className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              title="للإدارة"
            >
              •
            </button>
          </div>

          {/* رابط دخول الأدمن - يظهر بعد الضغط على النقطة */}
          {showAdminLink && (
            <div className="mt-6 text-center animate-slide-up">
              <button
                onClick={() => setScreen("auth_login")}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-foreground/60 hover:text-foreground border border-dashed border-muted-foreground/30 rounded-lg hover:border-foreground/30 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                دخول مدير النظام
              </button>
            </div>
          )}

          {/* إحصائيات سريعة */}
          <div className="mt-14 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <StatCard number="12" label="صف دراسي" />
            <StatCard number="80+" label="سؤالاً تفاعلياً" />
            <StatCard number="4" label="مراحل دراسية" />
          </div>
        </div>
      </main>

      {/* التذييل */}
      <footer className="mt-auto py-6 px-6 text-center text-sm text-muted-foreground border-t border-border/40">
        <p>© 2025 مدرسة الساحل الأهلية (بنين) — منصة الفهم القرائي</p>
      </footer>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-primary">{number}</div>
      <div className="text-xs md:text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
