"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  AlertTriangle,
  BookOpen,
  Send,
  Volume2,
} from "lucide-react";
import { QUESTION_TYPE_LABELS, SKILL_LABELS } from "@/lib/stages";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function PlacementTestScreen() {
  const test = useAppStore((s) => s.currentTest);
  const setScreen = useAppStore((s) => s.setScreen);
  const answerQuestion = useAppStore((s) => s.answerQuestion);
  const nextQuestion = useAppStore((s) => s.nextQuestion);
  const previousQuestion = useAppStore((s) => s.previousQuestion);
  const finishTest = useAppStore((s) => s.finishTest);

  const [timeLeft, setTimeLeft] = useState(() => test?.timeLimitSec ?? 0);
  const [orderingArrangement, setOrderingArrangement] = useState<string[]>([]);
  const testStartedAt = test?.startedAt;

  useEffect(() => {
    if (!test) {
      setScreen("student_dashboard");
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (test) setTimeLeft(test.timeLimitSec);
  }, [testStartedAt, test, setScreen]);

  // مؤقت العد التنازلي
  useEffect(() => {
    if (!test || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          toast.error("انتهى الوقت! سيتم تسليم الاختبار تلقائياً.");
          setTimeout(() => {
            const result = finishTest();
            if (result) {
              setScreen("test_result");
            }
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [test, timeLeft, finishTest, setScreen]);

  if (!test) return null;

  const currentQuestion = test.questions[test.currentQuestionIndex];
  if (!currentQuestion) return null;

  const userAnswer = test.answers.find((a) => a.questionId === currentQuestion.id);
  const answeredCount = test.answers.length;
  const progress = ((test.currentQuestionIndex + 1) / test.questions.length) * 100;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleSelectAnswer = (answer: string) => {
    answerQuestion(currentQuestion.id, answer);
  };

  const handleOrderingToggle = (option: string) => {
    if (orderingArrangement.includes(option)) {
      setOrderingArrangement(orderingArrangement.filter((o) => o !== option));
    } else {
      setOrderingArrangement([...orderingArrangement, option]);
    }
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const newArr = [...orderingArrangement];
    [newArr[idx - 1], newArr[idx]] = [newArr[idx], newArr[idx - 1]];
    setOrderingArrangement(newArr);
  };

  const moveDown = (idx: number) => {
    if (idx === orderingArrangement.length - 1) return;
    const newArr = [...orderingArrangement];
    [newArr[idx + 1], newArr[idx]] = [newArr[idx], newArr[idx + 1]];
    setOrderingArrangement(newArr);
  };

  const submitOrdering = () => {
    if (orderingArrangement.length !== currentQuestion.options.length) {
      toast.error("يرجى ترتيب جميع العناصر");
      return;
    }
    answerQuestion(currentQuestion.id, orderingArrangement.join("، "));
  };

  const handleFinish = () => {
    if (answeredCount < test.questions.length) {
      toast.warning(`لديك ${test.questions.length - answeredCount} سؤال بدون إجابة. سيتم تسليم الاختبار.`);
    }
    const result = finishTest();
    if (result) {
      setScreen("test_result");
    }
  };

  const readAloud = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        `${currentQuestion.passage}. ${currentQuestion.questionText}`
      );
      utterance.lang = "ar-SA";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const isLowStage = currentQuestion.stage === "primary_lower";

  return (
    <div className="min-h-screen bg-gradient-sea">
      {/* الرأس - مؤقت ومؤشر التقدم */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border/60 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-white shadow-sm border border-border/60 overflow-hidden p-1 flex items-center justify-center">
                { }
                <img
                  src="/school-logo.png"
                  alt="شعار مدرسة الساحل الأهلية (بنين)"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="font-bold text-sm">اختبار تحديد المستوى</h2>
                <p className="text-xs text-muted-foreground">
                  السؤال {test.currentQuestionIndex + 1} من {test.questions.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-sm ${
                  timeLeft < 60
                    ? "bg-rose-100 text-rose-700 animate-pulse"
                    : timeLeft < 300
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          {/* مؤشر التقدم */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>التقدم</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>
      </header>

      {/* شبكة الإجابات السريعة */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {test.questions.map((q, idx) => {
            const isAnswered = test.answers.some((a) => a.questionId === q.id);
            const isCurrent = idx === test.currentQuestionIndex;
            return (
              <button
                key={q.id}
                onClick={() => {
                  const diff = idx - test.currentQuestionIndex;
                  if (diff > 0) {
                    for (let i = 0; i < diff; i++) nextQuestion();
                  } else {
                    for (let i = 0; i < -diff; i++) previousQuestion();
                  }
                }}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  isCurrent
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                    : isAnswered
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* السؤال الحالي */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <Card className={`shadow-lg ${isLowStage ? "playful-card" : ""}`}>
          <CardContent className={`p-5 md:p-8 ${isLowStage ? "md:p-8" : ""}`}>
            {/* شارات السؤال */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="secondary" className="text-xs">
                {QUESTION_TYPE_LABELS[currentQuestion.type]}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {SKILL_LABELS[currentQuestion.skill]}
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs ${
                  currentQuestion.difficulty === 1
                    ? "border-emerald-300 text-emerald-700"
                    : currentQuestion.difficulty === 2
                    ? "border-amber-300 text-amber-700"
                    : "border-rose-300 text-rose-700"
                }`}
              >
                {currentQuestion.difficulty === 1 ? "سهل" : currentQuestion.difficulty === 2 ? "متوسط" : "صعب"}
              </Badge>
            </div>

            {/* النص */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">اقرأ النص التالي:</h3>
                {isLowStage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={readAloud}
                    className="text-xs"
                    type="button"
                  >
                    <Volume2 className="w-4 h-4 ml-1" />
                    استمع
                  </Button>
                )}
              </div>
              <div
                className={`bg-muted/50 rounded-xl p-4 md:p-5 leading-relaxed ${
                  isLowStage ? "text-2xl md:text-3xl leading-loose font-medium" : "text-base md:text-lg"
                }`}
                style={{ fontFamily: isLowStage ? "var(--font-cairo)" : undefined }}
              >
                {currentQuestion.passage}
              </div>
            </div>

            {/* السؤال */}
            <div className="mb-4">
              <h3 className={`font-bold mb-4 ${isLowStage ? "text-xl md:text-2xl" : "text-lg md:text-xl"}`}>
                {currentQuestion.questionText}
              </h3>
            </div>

            {/* الإجابات */}
            <div className="space-y-3">
              {currentQuestion.type === "ordering" ? (
                // سؤال الترتيب
                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-xl p-4">
                    <p className="text-sm font-medium mb-3">اختر العناصر بالترتيب الصحيح:</p>
                    <div className="space-y-2">
                      {currentQuestion.options.map((opt) => {
                        const isSelected = orderingArrangement.includes(opt);
                        const order = orderingArrangement.indexOf(opt);
                        return (
                          <button
                            key={opt}
                            onClick={() => handleOrderingToggle(opt)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all text-right ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/30 bg-card"
                            }`}
                            type="button"
                          >
                            <span className="text-sm md:text-base">{opt}</span>
                            {isSelected ? (
                              <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                                {order + 1}
                              </span>
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {orderingArrangement.length > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <p className="text-sm font-medium text-emerald-800 mb-3">الترتيب الذي اخترته:</p>
                      <div className="space-y-1.5">
                        {orderingArrangement.map((item, idx) => (
                          <div
                            key={item}
                            className="flex items-center gap-2 bg-white rounded-lg p-2 border border-emerald-200"
                          >
                            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="flex-1 text-sm">{item}</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => moveUp(idx)}
                                disabled={idx === 0}
                                className="w-6 h-6 rounded hover:bg-emerald-100 disabled:opacity-30"
                                type="button"
                              >
                                <ChevronRight className="w-4 h-4 mx-auto" />
                              </button>
                              <button
                                onClick={() => moveDown(idx)}
                                disabled={idx === orderingArrangement.length - 1}
                                className="w-6 h-6 rounded hover:bg-emerald-100 disabled:opacity-30"
                                type="button"
                              >
                                <ChevronLeft className="w-4 h-4 mx-auto" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={submitOrdering}
                        size="sm"
                        className="mt-3"
                        type="button"
                      >
                        تأكيد الترتيب
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                // أسئلة الاختيار من متعدد وصح/خطأ
                currentQuestion.options.map((option, idx) => {
                  const isSelected = userAnswer?.selectedAnswer === option;
                  const optionLetter = String.fromCharCode(1571 + idx); // أ، ب، ج، د
                  return (
                    <button
                      key={option}
                      onClick={() => handleSelectAnswer(option)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-right ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/30 bg-card hover:bg-muted/30"
                      }`}
                      type="button"
                    >
                      <span
                        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isSelected ? <CheckCircle2 className="w-4 h-4" /> : optionLetter}
                      </span>
                      <span className={`flex-1 ${isLowStage ? "text-lg md:text-xl" : "text-sm md:text-base"}`}>
                        {option}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* أزرار التنقل */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={test.currentQuestionIndex === 0}
            className="flex items-center gap-2"
          >
            <ChevronRight className="w-4 h-4" />
            السابق
          </Button>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {answeredCount === test.questions.length ? (
              <Badge variant="default" className="bg-emerald-600">
                <CheckCircle2 className="w-3 h-3 ml-1" />
                تمت الإجابة على جميع الأسئلة
              </Badge>
            ) : (
              <span>تمت الإجابة على {answeredCount} من {test.questions.length}</span>
            )}
          </div>

          {test.currentQuestionIndex < test.questions.length - 1 ? (
            <Button onClick={nextQuestion} className="flex items-center gap-2">
              التالي
              <ChevronLeft className="w-4 h-4" />
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Send className="w-4 h-4" />
                  تسليم الاختبار
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>تأكيد تسليم الاختبار</AlertDialogTitle>
                  <AlertDialogDescription>
                    {answeredCount < test.questions.length ? (
                      <span className="flex items-start gap-2 text-amber-700">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        لديك {test.questions.length - answeredCount} سؤال بدون إجابة. سيتم احتسابها كإجابات خاطئة.
                      </span>
                    ) : (
                      "تمت الإجابة على جميع الأسئلة. هل أنت متأكد من تسليم الاختبار؟"
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction onClick={handleFinish}>تسليم نهائي</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </main>
    </div>
  );
}
