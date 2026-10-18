"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, BookOpen, ShieldCheck, ArrowLeft } from "lucide-react";
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
      {/* الشعار في أعلى الصفحة - بحجم كبير بدون إطار */}
      <div className="pt-6 pb-2 px-6 flex justify-center">
        <button
          onClick={() => setShowAdminLink(!showAdminLink)}
          className="w-28 h-28 md:w-36 md:h-36 transition-transform hover:scale-105"
          title="للإدارة"
          aria-label="مدرسة الساحل الأهلية (بنين)"
        >
          <img
            src="/school-logo.png"
            alt="شعار مدرسة الساحل الأهلية (بنين)"
            className="w-full h-full object-contain drop-shadow-md"
          />
        </button>
      </div>

      {/* الرأس */}
      <header className="px-6 pt-2 pb-4 md:pb-6">
        <div className="max-w-6xl mx-auto text-center">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-primary leading-tight mb-1">
              {DEFAULT_SETTINGS.appName}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">منصة الفهم القرائي</p>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="flex flex-col px-6 pb-2">
        <div className="w-full max-w-5xl mx-auto">
          {/* بطاقة الترحيب */}
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-primary font-medium">مدرسة الساحل الأهلية (بنين)</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-2 leading-tight">
              أهلاً بك في رحلة
              <span className="block text-gradient bg-gradient-primary bg-clip-text text-transparent mt-1">
                الفهم القرائي
              </span>
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              منصة تعليمية لقياس وتنمية مهارات الفهم القرائي لدى طلابنا من الصف الأول الابتدائي حتى الثالث الثانوي،
              مع متابعة دقيقة من المعلمين والإدارة.
            </p>
          </div>

          {/* بطاقات الدخول */}
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Card
                  key={role.key}
                  onMouseEnter={() => setHoveredRole(role.key)}
                  onMouseLeave={() => setHoveredRole(null)}
                  className="relative overflow-hidden p-5 md:p-7 cursor-pointer border-2 hover:border-primary/30 hover-lift transition-all duration-300 group"
                  onClick={role.onClick}
                >
                  {/* تأثير خلفية عند الـ hover */}
                  <div
                    className={`absolute -top-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`}
                  />

                  <div className="relative">
                    <div
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                      {role.label}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-4 text-sm md:text-base">{role.description}</p>
                    <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                      <span className="text-sm">ادخل الآن</span>
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* روابط إضافية */}
          <div className="mt-4 flex flex-col md:flex-row items-center justify-center gap-3">
            <p className="text-sm text-muted-foreground">ليس لديك حساب؟</p>
            <Button
              variant="outline"
              onClick={() => setScreen("auth_register")}
              className="rounded-full"
              size="sm"
            >
              أنشئ حساباً جديداً
            </Button>
          </div>

          {/* رابط دخول الأدمن - يظهر بعد الضغط على الشعار */}
          {showAdminLink && (
            <div className="mt-3 text-center animate-slide-up">
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
          <div className="mt-4 md:mt-6 grid grid-cols-3 gap-3 md:gap-4 max-w-2xl mx-auto">
            <StatCard number="12" label="صف دراسي" />
            <StatCard number="128+" label="سؤالاً تفاعلياً" />
            <StatCard number="4" label="مراحل دراسية" />
          </div>
        </div>
      </main>

      {/* التذييل */}
      <footer className="mt-3 py-3 px-6 text-center text-xs md:text-sm text-muted-foreground border-t border-border/40">
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
