"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BookOpen, SkipForward } from "lucide-react";
import { ASSETS } from "@/lib/assets";

export function SplashScreen({ type }: { type: "app" | "school" }) {
  const setScreen = useAppStore((s) => s.setScreen);
  const [phase, setPhase] = useState<"fade-in" | "show" | "fade-out">("fade-in");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  // لأجل شاشة الفلاش الخاصة بالتطبيق: نعرض الفيديو بملء الشاشة مع تشغيل فوري
  // ولأجل شاشة المدرسة: نعرض شعار المدرسة
  useEffect(() => {
    if (type === "app") {
      // محاولة تشغيل الفيديو فوراً عند التركيب
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
      // مؤقت أمان فقط في حال لم يعمل الفيديو أو لم يطلق حدث onEnded (مدة الفيديو 10 ثوانٍ)
      const safetyTimer = setTimeout(() => {
        setPhase("fade-out");
        setTimeout(() => setScreen("splash_school"), 400);
      }, 11000);
      return () => clearTimeout(safetyTimer);
    }

    // شاشة شعار المدرسة
    const timer1 = setTimeout(() => setPhase("show"), 50);
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

  // معالجة فشل تحميل الفيديو - الانتقال مباشرة لشاشة المدرسة
  const handleVideoError = () => {
    console.warn("فشل تحميل الفيديو، الانتقال لشاشة المدرسة");
    setVideoFailed(true);
    setTimeout(() => {
      setScreen("splash_school");
    }, 300);
  };

  // ============ شاشة الفيديو (للتطبيق) ============
  if (type === "app") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
        style={{
          opacity: phase === "fade-out" ? 0 : 1,
          transition: "opacity 0.4s ease-out",
        }}
      >
        {/* الفيديو يملأ الشاشة بالكامل - مع تشغيل فوري وتحميل مسبق */}
        {!videoFailed && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src={ASSETS.appIntroVideo}
            autoPlay
            muted
            playsInline
            preload="auto"
            onLoadedData={() => {
              setPhase("show");
              videoRef.current?.play().catch(() => {});
            }}
            onPlaying={() => setPhase("show")}
            onEnded={handleVideoEnded}
            onError={handleVideoError}
            style={{
              opacity: phase === "fade-in" ? 0.4 : 1,
              transition: "opacity 0.3s ease-out",
            }}
          />
        )}

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

        {/* زر التخطي في الأعلى يمين (مناسب لـ RTL) */}
        <button
          onClick={handleSkip}
          className="absolute top-6 right-6 z-20 flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-sm font-medium hover:bg-white/25 transition-all"
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
        {/* شعار المدرسة - الصورة الفعلية بدون إطار */}
        <div className="relative w-48 h-48 md:w-64 md:h-64 mb-8 flex items-center justify-center">
          <img
            src={ASSETS.schoolLogo}
            onError={(e) => { e.currentTarget.src = ASSETS.fallbackLogo; }}
            alt="شعار مدرسة الساحل الأهلية (بنين)"
            className="w-full h-full object-contain drop-shadow-lg"
          />
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
        {getAcademicYear()}
      </div>
    </div>
  );
}

// حساب السنة الدراسية تلقائياً (ميلادي وهجري)
// السنة الدراسية تبدأ في سبتمبر (الشهر 9)
function getAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 0-indexed

  // السنة الدراسية تبدأ من سبتمبر
  // إذا كان الشهر >= 9 (سبتمبر-ديسمبر): السنة الدراسية = year/year+1
  // وإلا (يناير-أغسطس): السنة الدراسية = year-1/year
  const startYear = month >= 9 ? year : year - 1;
  const endYear = startYear + 1;

  // حساب السنة الهجرية تقريبياً (الفرق بين الميلادي والهجري ~578.97 سنة)
  // نستخدم تحويل تقريبي دقيق بما يكفي للعرض
  const hijriYear = Math.floor((startYear - 622) * 1.0307) + 1;

  return `السنة الدراسية ${hijriYear}هـ - ${startYear}/${endYear}م`;
}
