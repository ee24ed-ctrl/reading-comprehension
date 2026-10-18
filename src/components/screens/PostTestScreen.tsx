"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  Circle,
  Target,
  AlertTriangle,
} from "lucide-react";
import { SKILL_LABELS, SKILL_ICONS, QUESTION_TYPE_LABELS } from "@/lib/stages";
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
import { toast } from "sonner";

export function PostTestScreen() {
  const test = useAppStore((s) => s.currentPostTest);
  const setScreen = useAppStore((s) => s.setScreen);
  const answerPostTestQuestion = useAppStore((s) => s.answerPostTestQuestion);
  const nextPostTestQuestion = useAppStore((s) => s.nextPostTestQuestion);
  const previousPostTestQuestion = useAppStore((s) => s.previousPostTestQuestion);
  const finishPostTest = useAppStore((s) => s.finishPostTest);

  const [timeLeft, setTimeLeft] = useState(() =>
    test ? test.questions.length * 60 : 0
  );

  useEffect(() => {
    if (!test) {
      setScreen("trainings_list");
    }
  }, [test, setScreen]);

  // إعادة تعيين المؤقت عند بدء اختبار جديد
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (test) setTimeLeft(test.questions.length * 60);
  }, [test?.startedAt]);

  useEffect(() => {
    if (!test || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          toast.error("انتهى الوقت! سيتم تسليم الاختبار تلقائياً.");
          setTimeout(() => {
            const result = finishPostTest();
            if (result) {
              setScreen("post_test_result");
            }
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [test, timeLeft, finishPostTest, setScreen]);

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

  const handleFinish = () => {
    if (answeredCount < test.questions.length) {
      toast.warning(`لديك ${test.questions.length - answeredCount} سؤال بدون إجابة.`);
    }
    const result = finishPostTest();
    if (result) {
      setScreen("post_test_result");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-sea">
      {/* الرأس */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border/60 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 mb-2">
            <button
              onClick={() => {
                if (confirm("هل تريد إنهاء الاختبار؟ لن يتم حفظ تقدمك.")) {
                  setScreen("trainings_list");
                }
              }}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowRight className="w-3 h-3" />
              خروج
            </button>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {SKILL_ICONS[test.skill]} {SKILL_LABELS[test.skill]}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Target className="w-3 h-3 ml-1" />
                اختبار بعدي
              </Badge>
            </div>

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-sm ${
                timeLeft < 60
                  ? "bg-rose-100 text-rose-700 animate-pulse"
                  : timeLeft < 180
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>السؤال {test.currentQuestionIndex + 1} من {test.questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>
      </header>

      {/* شبكة الإجابات السريعة */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
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
                    for (let i = 0; i < diff; i++) nextPostTestQuestion();
                  } else {
                    for (let i = 0; i < -diff; i++) previousPostTestQuestion();
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

      {/* السؤال */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <Card className="shadow-sm">
          <CardContent className="p-5 md:p-8">
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
              <h3 className="text-sm font-medium text-muted-foreground mb-2">اقرأ النص التالي:</h3>
              <div className="bg-muted/50 rounded-xl p-4 leading-relaxed text-base md:text-lg">
                {currentQuestion.passage}
              </div>
            </div>

            {/* السؤال */}
            <h3 className="font-bold mb-4 text-base md:text-lg">
              {currentQuestion.questionText}
            </h3>

            {/* الإجابات */}
            <div className="space-y-2">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = userAnswer?.selectedAnswer === option;
                const optionLetter = String.fromCharCode(1571 + idx);
                return (
                  <button
                    key={option}
                    onClick={() => answerPostTestQuestion(currentQuestion.id, option)}
                    className={`w-full flex items-center gap-3 p-3 md:p-4 rounded-xl border-2 transition-all text-right ${
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
                    <span className="flex-1 text-sm md:text-base">{option}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* أزرار التنقل */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={previousPostTestQuestion}
            disabled={test.currentQuestionIndex === 0}
            className="flex items-center gap-2"
          >
            <ChevronRight className="w-4 h-4" />
            السابق
          </Button>

          <div className="text-xs text-muted-foreground">
            {answeredCount === test.questions.length ? (
              <Badge variant="default" className="bg-emerald-600">
                <CheckCircle2 className="w-3 h-3 ml-1" />
                تمت الإجابة على جميع الأسئلة
              </Badge>
            ) : (
              <span>{answeredCount} من {test.questions.length} مجاب عنها</span>
            )}
          </div>

          {test.currentQuestionIndex < test.questions.length - 1 ? (
            <Button onClick={nextPostTestQuestion} className="flex items-center gap-2">
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
