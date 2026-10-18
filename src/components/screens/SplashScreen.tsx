"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BookOpen, SkipForward } from "lucide-react";

export function SplashScreen({ type }: { type: "app" | "school" }) {
  const setScreen = useAppStore((s) => s.setScreen);
  const [phase, setPhase] = useState<"fade-in" | "show" | "fade-out">("fade-in");
  const videoRef = useRef<HTMLVideoElement>(null);

  // لأجل شاشة الفلاش الخاصة بالتطبيق: نعرض الفيديو بملء الشاشة
  // ولأجل شاشة المدرسة: نعرض شعار المدرسة كالمعتاد
  useEffect(() => {
    if (type === "app") {
      // شاشة الفيديو - تستمر حتى نهاية الفيديو أو 6 ثوانٍ كحد أقصى
      const timer1 = setTimeout(() => setPhase("show"), 100);
      const timer2 = setTimeout(() => setPhase("fade-out"), 5500);
      const timer3 = setTimeout(() => {
        setScreen("splash_school");
      }, 6000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }

    // شاشة شعار المدرسة
    const timer1 = setTimeout(() => setPhase("show"), 100);
    const timer2 = setTimeout(() => setPhase("fade-out"), 2600);
    const timer3 = setTimeout(() => {
      setScreen("home");
    }, 3100);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [type, setScreen]);

  const handleSkip = () => {
    setPhase("fade-out");
    setTimeout(() => {
      setScreen(type === "app" ? "splash_school" : "home");
    }, 400);
  };

  const handleVideoEnded = () => {
    setPhase("fade-out");
    setTimeout(() => {
      setScreen("splash_school");
    }, 400);
  };

  // ============ شاشة الفيديو (للتطبيق) ============
  if (type === "app") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
        style={{
          opacity: phase === "fade-out" ? 0 : 1,
          transition: "opacity 0.6s ease-out",
        }}
      >
        {/* الفيديو يملأ الشاشة بالكامل */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src="/app-intro.mp4"
          autoPlay
          muted
          playsInline
          //loop={false}
          onEnded={handleVideoEnded}
          // التحكم في حجم الفيديو للحفاظ على النسبة
          style={{
            opacity: phase === "fade-in" ? 0 : 1,
            transition: "opacity 0.8s ease-out",
          }}
        />

        {/* تدرج خفيف في الأسفل لتحسين وضوح النص */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* اسم التطبيق فوق الفيديو في الأسفل */}
        <div
          className="absolute bottom-12 left-0 right-0 flex flex-col items-center text-center px-6 pointer-events-none z-10"
          style={{
            opacity: phase === "fade-in" ? 0 : 1,
            transform: phase === "fade-in" ? "translateY(20px)" : "translateY(0)",
            transition: "all 1s ease-out 0.5s",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-2xl shadow-primary/40">
              <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-0 tracking-tight drop-shadow-lg">
              اقرأ
            </h1>
          </div>
          <p className="text-base md:text-xl text-white/90 font-medium drop-shadow-md">
            منصة الفهم القرائي
          </p>
          <p className="mt-1 text-xs md:text-sm text-white/70">
            مدرسة الساحل الأهلية (بنين)
          </p>
        </div>

        {/* زر التخطي في الأعلى يمين */}
        <button
          onClick={handleSkip}
          className="absolute top-6 left-6 z-20 flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-sm font-medium hover:bg-white/25 transition-all"
          aria-label="تخطي المقدمة"
        >
          <span>تخطي</span>
          <SkipForward className="w-4 h-4" />
        </button>

        {/* شريط تقدم الفيديو في الأسفل */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
          <div
            className="h-full bg-gradient-to-l from-accent to-primary"
            style={{
              animation: "progressBar 6s linear forwards",
            }}
          />
        </div>

        <style>{`
          @keyframes progressBar {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  // ============ شاشة شعار المدرسة ============
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
        {/* شعار المدرسة - الصورة الفعلية */}
        <div className="relative w-40 h-40 md:w-56 md:h-56 mb-8">
          <div className="absolute inset-0 rounded-full bg-white shadow-2xl shadow-primary/20 flex items-center justify-center border-4 border-primary/10 overflow-hidden p-3">
            { }
            <img
              src="/school-logo.png"
              alt="شعار مدرسة الساحل الأهلية (بنين)"
              className="w-full h-full object-contain"
            />
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
          <p className="mt-1 font-medium">&ldquo;اقرأ باسم ربك الذي خلق&rdquo;</p>
        </div>
      </div>

      {/* ملاحظة: يمكن استبدال الشعارين برفع ملف صورة */}
      <div className="absolute bottom-6 text-xs text-muted-foreground/60">
        {type === "app" ? "منصة تعليمية تفاعلية" : "السنة الدراسية 1447هـ - 2025/2026م"}
      </div>
    </div>
  );
}
