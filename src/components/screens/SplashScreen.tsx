"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BookOpen, GraduationCap, Waves } from "lucide-react";

export function SplashScreen({ type }: { type: "app" | "school" }) {
  const setScreen = useAppStore((s) => s.setScreen);
  const [phase, setPhase] = useState<"fade-in" | "show" | "fade-out">("fade-in");

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase("show"), 100);
    const timer2 = setTimeout(() => setPhase("fade-out"), type === "app" ? 2200 : 4800);
    const timer3 = setTimeout(() => {
      setScreen(type === "app" ? "splash_school" : "home");
    }, type === "app" ? 2700 : 5300);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [type, setScreen]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-sea overflow-hidden"
      style={{
        opacity: phase === "fade-out" ? 0 : 1,
        transition: "opacity 0.6s ease-out",
      }}
    >
      {/* موجات خلفية متحركة */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <svg
          className="w-full h-full"
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <path
            d="M0,300 Q200,250 400,300 T800,300 L800,600 L0,600 Z"
            fill="currentColor"
            className="text-primary"
          >
            <animate
              attributeName="d"
              dur="6s"
              repeatCount="indefinite"
              values="M0,300 Q200,250 400,300 T800,300 L800,600 L0,600 Z;
                      M0,300 Q200,350 400,300 T800,300 L800,600 L0,600 Z;
                      M0,300 Q200,250 400,300 T800,300 L800,600 L0,600 Z"
            />
          </path>
        </svg>
      </div>

      <div
        className="relative z-10 flex flex-col items-center text-center"
        style={{
          opacity: phase === "fade-in" ? 0 : 1,
          transform: phase === "fade-in" ? "scale(0.85)" : "scale(1)",
          transition: "all 1.2s ease-out",
        }}
      >
        {type === "app" ? (
          <>
            {/* شعار التطبيق - دائرة مع كتاب وموجة */}
            <div className="relative w-32 h-32 md:w-44 md:h-44 mb-8">
              <div className="absolute inset-0 rounded-3xl bg-gradient-primary shadow-2xl shadow-primary/30 flex items-center justify-center">
                <BookOpen className="w-16 h-16 md:w-24 md:h-24 text-white" strokeWidth={1.5} />
              </div>
              <div className="absolute -bottom-2 -left-2 -right-2 h-6 bg-gradient-accent rounded-2xl opacity-90 flex items-center justify-center">
                <Waves className="w-4 h-4 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-primary mb-3 tracking-tight">
              اقرأ
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-medium">
              منصة الفهم القرائي
            </p>
            <div className="mt-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: "0.3s" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: "0.6s" }} />
            </div>
          </>
        ) : (
          <>
            {/* شعار المدرسة - واجهة مع قبة */}
            <div className="relative w-36 h-36 md:w-52 md:h-52 mb-8">
              <div className="absolute inset-0 rounded-full bg-white shadow-2xl shadow-primary/20 flex items-center justify-center border-4 border-primary/10">
                <GraduationCap className="w-20 h-20 md:w-28 md:h-28 text-primary" strokeWidth={1.5} />
              </div>
              {/* تأثير دائرة خارجية */}
              <div className="absolute inset-0 rounded-full border-2 border-accent/30 animate-ping" style={{ animationDuration: "2.5s" }} />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-primary mb-2">
              مدرسة الساحل الأهلية
            </h2>
            <p className="text-lg md:text-2xl text-accent font-bold">بنين</p>
            <div className="mt-6 text-sm text-muted-foreground">
              <p>بسم الله الرحمن الرحيم</p>
              <p className="mt-1 font-medium">"اقرأ باسم ربك الذي خلق"</p>
            </div>
          </>
        )}
      </div>

      {/* ملاحظة: يمكن استبدال الشعارين برفع ملف صورة */}
      <div className="absolute bottom-6 text-xs text-muted-foreground/60">
        {type === "app" ? "منصة تعليمية تفاعلية" : "السنة الدراسية 1447هـ - 2025/2026م"}
      </div>
    </div>
  );
}
