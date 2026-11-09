"use client";

import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { DAILY_STORIES, getStoriesByStage, getTodayStoryForUser, type DailyStory } from "@/lib/daily-stories";
import { StoryIllustration } from "@/components/illustrations/StoryIllustration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  ArrowRight,
  Flame,
  Award,
  Sparkles,
  Volume2,
  VolumeX,
  Type,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  Star,
  ChevronLeft,
  Calendar,
  Layers,
  Heart,
  Lightbulb,
} from "lucide-react";
import { STAGES } from "@/lib/stages";
import type { StageKey } from "@/lib/types";
import { toast } from "sonner";

export function DailyReadingScreen() {
  const currentUser = useAppStore((s) => s.currentUser);
  const setScreen = useAppStore((s) => s.setScreen);
  const dailyReadingLogs = useAppStore((s) => s.dailyReadingLogs);
  const activeDailyStoryId = useAppStore((s) => s.activeDailyStoryId);
  const selectDailyStory = useAppStore((s) => s.selectDailyStory);
  const completeDailyStory = useAppStore((s) => s.completeDailyStory);
  const getDailyReadingStatus = useAppStore((s) => s.getDailyReadingStatus);

  // تحديد المرحلة الافتراضية بناءً على صف الطالب
  const defaultStage: StageKey = currentUser?.gradeKey?.startsWith("g")
    ? (["g1", "g2", "g3"].includes(currentUser.gradeKey) ? "primary_lower" : "primary_upper")
    : currentUser?.gradeKey?.startsWith("m")
    ? "intermediate"
    : currentUser?.gradeKey?.startsWith("s")
    ? "secondary"
    : "primary_lower";

  const [selectedStage, setSelectedStage] = useState<StageKey>(defaultStage);
  const [selectedStory, setSelectedStory] = useState<DailyStory>(() => {
    if (activeDailyStoryId) {
      const found = DAILY_STORIES.find((s) => s.id === activeDailyStoryId);
      if (found) return found;
    }
    return getTodayStoryForUser(defaultStage);
  });

  // حالة القراءة
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("large");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [readingSeconds, setReadingSeconds] = useState(0);
  const [isQuizMode, setIsQuizMode] = useState(false);

  // حالة الاختبار (3 أسئلة)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [earnedSummary, setEarnedSummary] = useState<{ points: number; streak: number } | null>(null);

  // مؤقت القراءة
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isQuizMode && !quizCompleted) {
      timer = setInterval(() => {
        setReadingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isQuizMode, quizCompleted]);

  // إيقاف الصوت عند تبديل القصة أو الخروج
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedStory]);

  // تحديث القصة عند تغيير المرحلة
  const handleStageChange = (stage: StageKey) => {
    setSelectedStage(stage);
    const story = getTodayStoryForUser(stage);
    setSelectedStory(story);
    resetStoryState();
  };

  const handleSelectSpecificStory = (story: DailyStory) => {
    setSelectedStory(story);
    resetStoryState();
  };

  const resetStoryState = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsQuizMode(false);
    setCurrentQuestionIdx(0);
    setSelectedAnswers([]);
    setShowExplanation(false);
    setQuizCompleted(false);
    setEarnedSummary(null);
    setReadingSeconds(0);
  };

  // القراءة الصوتية عبر المتصفح
  const toggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("ميزة القراءة الصوتية غير مدعومة في متصفحك الحالي");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(selectedStory.passage);
      utterance.lang = "ar-SA";
      utterance.rate = 0.85; // وتيرة هادئة تناسب الطلاب
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      toast.info("جاري الاستماع للقصة بصوت نقي...");
    }
  };

  // الإجابة على السؤال
  const handleAnswerSelect = (optionIdx: number) => {
    if (showExplanation) return; // تم الرد بالفعل

    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIdx] = optionIdx;
    setSelectedAnswers(newAnswers);
    setShowExplanation(true);
  };

  // الانتقال للسؤال التالي
  const handleNextQuestion = () => {
    if (currentQuestionIdx < selectedStory.questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setShowExplanation(false);
    } else {
      // إنهاء الأسئلة وحساب النتيجة
      let correctCount = 0;
      selectedStory.questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctIndex) {
          correctCount += 1;
        }
      });

      const res = completeDailyStory(selectedStory.id, correctCount, readingSeconds, selectedAnswers);
      setEarnedSummary({ points: res.pointsEarned, streak: res.newStreak });
      setQuizCompleted(true);
      toast.success(`رائع جداً! تم إكمال قصة اليوم وكسب ${res.pointsEarned} نقطة ⭐`);
    }
  };

  // إحصائيات الطالب الحالية
  const status = getDailyReadingStatus();
  const currentStoryLog = dailyReadingLogs.find(
    (l) => l.storyId === selectedStory.id && (currentUser ? l.studentId === currentUser.id : true)
  );

  const stageStories = getStoriesByStage(selectedStage);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-teal-50/40 to-slate-50 font-cairo py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* الشريط العلوي وملاحة العودة */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl shadow-sm border border-emerald-100">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (currentUser?.role === "student") setScreen("student_dashboard");
                else setScreen("home");
              }}
              className="rounded-xl border-emerald-200 text-emerald-800 hover:bg-emerald-50 gap-1.5"
            >
              <ArrowRight className="w-4 h-4" />
              العودة للرئيسية
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-emerald-600" />
                حكايات الساحل — القراءة اليومية
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                قصة يومية مصورة مع 3 أسئلة فهم قرائي تنمي الحصيلة اللغوية والذكاء
              </p>
            </div>
          </div>

          {/* شارات الإنجاز والستريك */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 text-xs sm:text-sm rounded-xl gap-1.5 font-bold">
              <Flame className="w-4 h-4 text-amber-600 fill-amber-500 animate-pulse" />
              الالتزام اليومي: {status.streak} {status.streak === 1 ? "يوم" : "أيام"}
            </Badge>

            {currentUser && (
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 text-xs sm:text-sm rounded-xl gap-1.5 font-bold">
                <Award className="w-4 h-4 text-emerald-600" />
                {currentUser.points || 0} نقطة
              </Badge>
            )}
          </div>
        </div>

        {/* مبدل المراحل التعليمية */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {(Object.keys(STAGES) as StageKey[]).map((stgKey) => {
            const stg = STAGES[stgKey];
            const isSelected = selectedStage === stgKey;
            return (
              <button
                key={stgKey}
                onClick={() => handleStageChange(stgKey)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]"
                    : "bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200/80"
                }`}
              >
                <Layers className={`w-4 h-4 ${isSelected ? "text-white" : "text-emerald-600"}`} />
                {stg.label}
              </button>
            );
          })}
        </div>

        {/* المحتوى الرئيسي للقصة أو الاختبار */}
        {!isQuizMode && !quizCompleted ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* بطاقة القراءة الكبرى */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="rounded-3xl border-emerald-100 shadow-md overflow-hidden bg-white">
                {/* الرسمة التوضيحية المصورة */}
                <div className="p-3 bg-slate-50">
                  <StoryIllustration theme={selectedStory.theme} className="w-full h-56 sm:h-64 rounded-2xl shadow-inner" />
                </div>

                <CardContent className="p-5 sm:p-7 space-y-6">
                  {/* شارات وتفاصيل العنوان */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs px-2.5 py-1 rounded-lg">
                          {selectedStory.category}
                        </Badge>
                        <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 text-xs px-2.5 py-1 rounded-lg">
                          {selectedStory.gradeLevelLabel}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          دقيقتان قراءة
                        </span>
                        <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
                          وقتك: {Math.floor(readingSeconds / 60)}:{(readingSeconds % 60).toString().padStart(2, "0")}
                        </span>
                      </div>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                      {selectedStory.title}
                    </h2>
                  </div>

                  {/* شريط أدوات القارئ (تكبير الخط + القراءة الصوتية) */}
                  <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <Type className="w-4 h-4 text-emerald-600 ml-1" />
                      حجم الخط:
                      <button
                        onClick={() => setFontSize("normal")}
                        className={`px-2 py-1 rounded ${fontSize === "normal" ? "bg-emerald-600 text-white font-bold" : "hover:bg-slate-200 text-slate-700"}`}
                      >
                        عادي
                      </button>
                      <button
                        onClick={() => setFontSize("large")}
                        className={`px-2 py-1 rounded ${fontSize === "large" ? "bg-emerald-600 text-white font-bold" : "hover:bg-slate-200 text-slate-700"}`}
                      >
                        كبير
                      </button>
                      <button
                        onClick={() => setFontSize("xlarge")}
                        className={`px-2 py-1 rounded ${fontSize === "xlarge" ? "bg-emerald-600 text-white font-bold" : "hover:bg-slate-200 text-slate-700"}`}
                      >
                        أكبر
                      </button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleSpeech}
                      className={`gap-1.5 text-xs rounded-lg ${isSpeaking ? "bg-red-50 text-red-600 hover:bg-red-100" : "text-emerald-700 hover:bg-emerald-50"}`}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-4 h-4" />
                          إيقاف الصوت
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 text-emerald-600" />
                          استمع للقصة
                        </>
                      )}
                    </Button>
                  </div>

                  {/* نص القصة */}
                  <div
                    className={`leading-relaxed text-slate-800 whitespace-pre-line tracking-wide select-text ${
                      fontSize === "normal"
                        ? "text-base sm:text-lg leading-8"
                        : fontSize === "large"
                        ? "text-lg sm:text-xl leading-9 font-medium"
                        : "text-xl sm:text-2xl leading-10 font-medium"
                    }`}
                  >
                    {selectedStory.passage}
                  </div>

                  {/* حكمة اليوم */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-r-4 border-amber-500 p-4 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs sm:text-sm">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      حكمة القصة والعبرة المستفادة:
                    </div>
                    <p className="text-slate-700 text-xs sm:text-sm italic">
                      "{selectedStory.moral}"
                    </p>
                  </div>

                  {/* زر الانتقال لأسئلة الفهم القرائي */}
                  <div className="pt-2">
                    <Button
                      onClick={() => setIsQuizMode(true)}
                      size="lg"
                      className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base sm:text-lg py-6 shadow-lg shadow-emerald-600/25 gap-2"
                    >
                      <Sparkles className="w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: "3s" }} />
                      أكملت القراءة! انتقل لأسئلة الفهم (3 أسئلة)
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* الشريط الجانبي: سجل اليوم وقائمة قصص المرحلة */}
            <div className="space-y-4">
              {/* بطاقة إنجاز اليوم */}
              <Card className="rounded-2xl border-emerald-200 bg-white shadow-sm overflow-hidden">
                <CardHeader className="bg-emerald-50/70 p-4 border-b border-emerald-100">
                  <CardTitle className="text-sm font-bold text-emerald-900 flex items-center justify-between">
                    <span>حالة قراءة اليوم</span>
                    <Calendar className="w-4 h-4 text-emerald-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {status.completedToday ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-emerald-900">
                          أحسنت! أتممت قراءة اليوم بنجاح 🎉
                        </div>
                        <div className="text-xs text-emerald-700 mt-0.5">
                          سلسلة التزامك مستمرة لـ {status.streak} {status.streak === 1 ? "يوم" : "أيام"}.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
                      <Flame className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-amber-900">
                          لم تكمل قراءة اليوم بعد!
                        </div>
                        <div className="text-xs text-amber-700 mt-0.5">
                          اقرأ القصة وأجب عن الأسئلة لكسب 50 نقطة وحفظ الـ Streak 🔥
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-center pt-1">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="text-xl font-bold text-emerald-700">{status.totalCompleted}</div>
                      <div className="text-[11px] text-slate-500">قصة مكتملة</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="text-xl font-bold text-amber-600">{status.streak} 🔥</div>
                      <div className="text-[11px] text-slate-500">أيام متتالية</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* مكتبة قصص هذه المرحلة */}
              <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                <CardHeader className="p-4 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center justify-between">
                    <span>قصص مرحلة ({STAGES[selectedStage].shortLabel})</span>
                    <Badge variant="secondary" className="text-xs">
                      {stageStories.length} قصص
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2 max-h-[380px] overflow-y-auto">
                  {stageStories.map((story) => {
                    const isCurrent = story.id === selectedStory.id;
                    const log = dailyReadingLogs.find(
                      (l) => l.storyId === story.id && (currentUser ? l.studentId === currentUser.id : true)
                    );
                    return (
                      <div
                        key={story.id}
                        onClick={() => handleSelectSpecificStory(story)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between gap-2.5 ${
                          isCurrent
                            ? "border-emerald-500 bg-emerald-50/80 shadow-sm"
                            : "border-slate-100 hover:border-slate-300 hover:bg-slate-50/70"
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-800 truncate">
                              {story.title}
                            </span>
                            {log && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span>{story.category}</span>
                            <span>•</span>
                            <span>اليوم {story.dayNumber}</span>
                          </div>
                        </div>

                        {log ? (
                          <Badge className="bg-emerald-100 text-emerald-800 text-[10px] shrink-0">
                            {log.score}/3 ⭐
                          </Badge>
                        ) : (
                          <ChevronLeft className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : isQuizMode && !quizCompleted ? (
          /* واجهة أسئلة الفهم القرائي الثلاثة */
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="rounded-3xl border-emerald-200 shadow-xl bg-white overflow-hidden">
              {/* شريط التقدم بين الأسئلة الثلاثة */}
              <div className="bg-slate-50 p-4 border-b border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-emerald-600" />
                    أسئلة الفهم القرائي لقصة: «{selectedStory.title}»
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    السؤال {currentQuestionIdx + 1} من {selectedStory.questions.length}
                  </span>
                </div>
                <Progress
                  value={((currentQuestionIdx + 1) / selectedStory.questions.length) * 100}
                  className="h-2 bg-slate-200"
                />
              </div>

              <CardContent className="p-6 sm:p-8 space-y-6">
                {/* رأس السؤال والمهارة المستهدفة */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-xs">
                      المهارة: {selectedStory.questions[currentQuestionIdx].skill}
                    </Badge>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                    {selectedStory.questions[currentQuestionIdx].questionText}
                  </h3>
                </div>

                {/* خيارات الإجابة */}
                <div className="space-y-3">
                  {selectedStory.questions[currentQuestionIdx].options.map((option, idx) => {
                    const isSelected = selectedAnswers[currentQuestionIdx] === idx;
                    const isCorrect = idx === selectedStory.questions[currentQuestionIdx].correctIndex;

                    let btnStyle = "border-slate-200 bg-white hover:bg-slate-50 text-slate-800";
                    if (showExplanation) {
                      if (isCorrect) {
                        btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/30";
                      } else if (isSelected && !isCorrect) {
                        btnStyle = "border-red-400 bg-red-50 text-red-900 font-medium";
                      } else {
                        btnStyle = "border-slate-200 opacity-60 bg-white text-slate-500";
                      }
                    } else if (isSelected) {
                      btnStyle = "border-emerald-600 bg-emerald-50/70 text-emerald-900 font-bold";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswerSelect(idx)}
                        disabled={showExplanation}
                        className={`w-full text-right p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between gap-3 ${btnStyle}`}
                      >
                        <span className="text-sm sm:text-base leading-relaxed">{option}</span>
                        {showExplanation && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                        {showExplanation && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* الشرح التوضيحي للإجابة الصحيحة */}
                {showExplanation && (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      التوضيح القرائي:
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {selectedStory.questions[currentQuestionIdx].explanation}
                    </p>
                  </div>
                )}

                {/* زر المتابعة */}
                {showExplanation && (
                  <div className="pt-2">
                    <Button
                      onClick={handleNextQuestion}
                      className="w-full py-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md gap-2"
                    >
                      {currentQuestionIdx < selectedStory.questions.length - 1 ? (
                        <>
                          السؤال التالي
                          <ChevronLeft className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 text-amber-300" />
                          إتمام التحدي واحتساب النقاط!
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* زر مراجعة النص في حال نسيان تفصيلة */}
                <div className="text-center pt-2">
                  <button
                    onClick={() => setIsQuizMode(false)}
                    className="text-xs text-slate-500 hover:text-emerald-700 underline underline-offset-4"
                  >
                    العودة لقراءة النص للتأكد
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* شاشة الاحتفال بالإنجاز والتتويج اليومي */
          <div className="max-w-xl mx-auto py-8">
            <Card className="rounded-3xl border-emerald-200 shadow-2xl bg-white text-center p-6 sm:p-10 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-amber-200 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Star className="w-10 h-10 text-amber-800 fill-amber-700 animate-bounce" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  مبارك يا بطل! أتممت تحدي اليوم 🎉
                </h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  قرأت قصة «{selectedStory.title}» وأجبت عن أسئلة الفهم بنجاح. استمرارك اليومي يصنع الفارق!
                </p>
              </div>

              {/* بطاقات المكافأة المكتسبة */}
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                    +{earnedSummary?.points || 50}
                  </div>
                  <div className="text-xs text-emerald-800 font-bold mt-1">نقطة مكتسبة ⭐</div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                  <div className="text-2xl sm:text-3xl font-black text-amber-600 flex items-center justify-center gap-1">
                    {earnedSummary?.streak || status.streak} <Flame className="w-6 h-6 fill-amber-500 text-amber-500" />
                  </div>
                  <div className="text-xs text-amber-800 font-bold mt-1">أيام متتالية 🔥</div>
                </div>
              </div>

              {/* أزرار الإجراءات بعد الإنجاز */}
              <div className="space-y-2.5 pt-2">
                <Button
                  onClick={() => {
                    resetStoryState();
                  }}
                  className="w-full py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  استكشاف وقراءة قصة أخرى
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    if (currentUser?.role === "student") setScreen("student_dashboard");
                    else setScreen("home");
                  }}
                  className="w-full py-5 rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm sm:text-base"
                >
                  العودة للوحة التحكم
                </Button>
              </div>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
