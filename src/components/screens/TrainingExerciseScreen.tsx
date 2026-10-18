"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ChevronLeft,
  Send,
  BookOpen,
  Trophy,
  Sparkles,
  Clock,
} from "lucide-react";
import { SKILL_LABELS, SKILL_ICONS } from "@/lib/stages";
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

const LEVEL_LABELS = ["أساسي", "متوسط", "متقدم"];
const LEVEL_COLORS = ["bg-emerald-500", "bg-amber-500", "bg-rose-500"];

export function TrainingExerciseScreen() {
  const training = useAppStore((s) => s.currentTraining);
  const setScreen = useAppStore((s) => s.setScreen);
  const answerTrainingQuestion = useAppStore((s) => s.answerTrainingQuestion);
  const nextTrainingQuestion = useAppStore((s) => s.nextTrainingQuestion);
  const toggleTrainingHint = useAppStore((s) => s.toggleTrainingHint);
  const finishTraining = useAppStore((s) => s.finishTraining);

  if (!training) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-sea p-4">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">لا يوجد تدريب جارٍ</p>
            <Button onClick={() => setScreen("trainings_list")}>العودة للتدريبات</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { exercise, currentQuestionIndex, answers, showHint, showExplanation } = training;
  const currentQuestion = exercise.questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  const userAnswer = answers.find((a) => a.questionId === currentQuestion.id);
  const isAnswered = !!userAnswer;
  const isCorrect = userAnswer?.isCorrect;
  const isLastQuestion = currentQuestionIndex === exercise.questions.length - 1;
  const progress = ((currentQuestionIndex + (isAnswered ? 1 : 0)) / exercise.questions.length) * 100;
  const answeredCount = answers.length;

  const handleAnswer = (option: string) => {
    if (isAnswered) return; // لا يمكن تغيير الإجابة بعد الإجابة
    answerTrainingQuestion(currentQuestion.id, option);
  };

  const handleFinish = () => {
    const result = finishTraining();
    if (result) {
      if (result.passed) {
        toast.success(`🎉 أحسنت! نجحت في التدريب بنسبة ${result.percentage}%`);
      } else {
        toast.error(`حصلت على ${result.percentage}%. أعد المحاولة للنجاح (70%+)`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-sea">
      {/* الرأس */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border/60 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* شريط المعلومات */}
          <div className="flex items-center justify-between gap-3 mb-2">
            <button
              onClick={() => {
                if (confirm("هل تريد إنهاء التدريب؟ لن يتم حفظ تقدمك.")) {
                  setScreen("trainings_list");
                }
              }}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowRight className="w-3 h-3" />
              خروج
            </button>
            <div className="flex items-center gap-2">
              <Badge className={`text-xs ${LEVEL_COLORS[exercise.level - 1]} text-white`}>
                {LEVEL_LABELS[exercise.level - 1]}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {SKILL_ICONS[exercise.skill]} {SKILL_LABELS[exercise.skill]}
              </Badge>
            </div>
          </div>

          {/* عنوان التدريب */}
          <h2 className="font-bold text-sm mb-2 line-clamp-1">{exercise.title}</h2>

          {/* شريط التقدم */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>السؤال {currentQuestionIndex + 1} من {exercise.questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* النص */}
        <Card className="mb-4 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                اقرأ النص التالي:
              </h3>
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 ml-1" />
                {exercise.estimatedMinutes} دقيقة
              </Badge>
            </div>
            <p className="text-base md:text-lg leading-loose">{exercise.passage}</p>
          </CardContent>
        </Card>

        {/* السؤال */}
        <Card className="mb-4 shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-bold mb-4 text-base md:text-lg">
              {currentQuestion.questionText}
            </h3>

            {/* الخيارات */}
            <div className="space-y-2">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = userAnswer?.selectedAnswer === option;
                const isCorrectAnswer = option === currentQuestion.correctAnswer;
                const optionLetter = String.fromCharCode(1571 + idx); // أ، ب، ج، د

                let className = "w-full flex items-center gap-3 p-3 rounded-xl border-2 text-right transition-all ";
                if (!isAnswered) {
                  className += "border-border hover:border-primary/30 hover:bg-muted/30 cursor-pointer";
                } else if (isCorrectAnswer) {
                  className += "border-emerald-500 bg-emerald-50";
                } else if (isSelected) {
                  className += "border-rose-500 bg-rose-50";
                } else {
                  className += "border-border opacity-60";
                }

                return (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className={className}
                    disabled={isAnswered}
                    type="button"
                  >
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        !isAnswered
                          ? "bg-muted text-muted-foreground"
                          : isCorrectAnswer
                          ? "bg-emerald-500 text-white"
                          : isSelected
                          ? "bg-rose-500 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isAnswered && isCorrectAnswer ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isAnswered && isSelected ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        optionLetter
                      )}
                    </span>
                    <span className="flex-1 text-sm md:text-base">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* تلميح */}
            {!isAnswered && currentQuestion.hint && (
              <div className="mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTrainingHint}
                  className="text-xs text-amber-700"
                  type="button"
                >
                  <Lightbulb className="w-3 h-3 ml-1" />
                  {showHint ? "إخفاء التلميح" : "احصل على تلميح"}
                </Button>
                {showHint && (
                  <div className="mt-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="text-xs text-amber-800 flex items-start gap-2">
                      <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {currentQuestion.hint}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* الشرح بعد الإجابة */}
            {isAnswered && showExplanation && (
              <div
                className={`mt-4 p-4 rounded-xl border-2 ${
                  isCorrect
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-rose-50 border-rose-200"
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-bold text-sm ${isCorrect ? "text-emerald-800" : "text-rose-800"}`}>
                      {isCorrect ? "إجابة صحيحة! 🎉" : "إجابة خاطئة"}
                    </p>
                    {!isCorrect && (
                      <p className="text-xs text-rose-700 mt-1">
                        الإجابة الصحيحة: <span className="font-bold">{currentQuestion.correctAnswer}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-current/20">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    الشرح:
                  </p>
                  <p className="text-sm leading-relaxed">{currentQuestion.explanation}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* الأزرار */}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => setScreen("trainings_list")}
          >
            إنهاء التدريب
          </Button>

          <div className="text-xs text-muted-foreground">
            {answeredCount} من {exercise.questions.length} مجاب عنها
          </div>

          {!isLastQuestion ? (
            <Button
              onClick={nextTrainingQuestion}
              disabled={!isAnswered}
              className="gap-2"
            >
              التالي
              <ChevronLeft className="w-4 h-4" />
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={!isAnswered}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Send className="w-4 h-4" />
                  إنهاء التدريب
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>تأكيد إنهاء التدريب</AlertDialogTitle>
                  <AlertDialogDescription>
                    {answeredCount < exercise.questions.length
                      ? `لديك ${exercise.questions.length - answeredCount} سؤال بدون إجابة. سيتم احتسابها كإجابات خاطئة.`
                      : "تمت الإجابة على جميع الأسئلة. هل تريد إنهاء التدريب؟"}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>متابعة التدريب</AlertDialogCancel>
                  <AlertDialogAction onClick={handleFinish}>إنهاء نهائي</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </main>
    </div>
  );
}
