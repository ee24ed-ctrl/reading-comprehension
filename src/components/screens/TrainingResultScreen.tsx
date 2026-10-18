"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Target,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Clock,
  Sparkles,
  Play,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { SKILL_LABELS, SKILL_ICONS } from "@/lib/stages";

export function TrainingResultScreen() {
  const setScreen = useAppStore((s) => s.setScreen);
  const currentUser = useAppStore((s) => s.currentUser);
  const trainingResults = useAppStore((s) => s.trainingResults);
  const startPostTest = useAppStore((s) => s.startPostTest);
  const testResults = useAppStore((s) => s.testResults);

  if (!currentUser) return null;

  // آخر نتيجة تدريب للطالب
  const myTrainings = trainingResults
    .filter((r) => r.studentId === currentUser.id)
    .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
  const latest = myTrainings[0];

  if (!latest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-sea p-4">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">لا توجد نتيجة تدريب متاحة</p>
            <Button onClick={() => setScreen("trainings_list")}>العودة للتدريبات</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // الحصول على نسبة الاختبار القبلي للمهارة
  const myResults = testResults
    .filter((r) => r.studentId === currentUser.id)
    .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
  const latestPlacement = myResults[0];
  const preScore = latestPlacement?.skillScores[latest.skill];
  const prePercentage = preScore && preScore.total > 0
    ? Math.round((preScore.correct / preScore.total) * 100)
    : 0;

  const skillLabel = SKILL_LABELS[latest.skill];
  const skillIcon = SKILL_ICONS[latest.skill];
  const passed = latest.passed;

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m} دقيقة و ${s} ثانية` : `${s} ثانية`;
  };

  return (
    <div className="min-h-screen bg-gradient-sea py-6 md:py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* رأس النتيجة */}
        <div className="text-center mb-8 animate-slide-up">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-lg ${
              passed
                ? "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-200"
                : "bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-200"
            }`}
          >
            {passed ? (
              <Trophy className="w-10 h-10 text-white" />
            ) : (
              <Sparkles className="w-10 h-10 text-white" />
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {passed ? "🎉 نجحت في التدريب!" : "أكملت التدريب"}
          </h1>
          <p className="text-muted-foreground">
            {passed
              ? "أحسنت! يمكنك الآن إجراء الاختبار البعدي"
              : "تحتاج إلى 70% على الأقل للنجاح. أعد المحاولة!"}
          </p>
        </div>

        {/* النتيجة الرئيسية */}
        <Card className={`mb-6 overflow-hidden border-2 ${
          passed ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"
        }`}>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-right">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="text-3xl">{skillIcon}</span>
                  <h2 className="text-2xl font-bold">{skillLabel}</h2>
                </div>
                <Badge variant="outline" className="text-xs">
                  المستوى {latest.level === 1 ? "الأساسي" : latest.level === 2 ? "المتوسط" : "المتقدم"}
                </Badge>
              </div>

              <div className="text-center">
                <div className={`text-6xl md:text-7xl font-bold leading-none ${
                  passed ? "text-emerald-600" : "text-amber-600"
                }`}>
                  {latest.percentage}%
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {latest.correctCount} من {latest.totalQuestions} إجابة صحيحة
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* إحصائيات */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">إجابات صحيحة</div>
                <div className="font-bold">{latest.correctCount}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">إجابات خاطئة</div>
                <div className="font-bold">{latest.totalQuestions - latest.correctCount}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">الوقت المستغرق</div>
                <div className="font-bold text-sm">{formatDuration(latest.timeSpentSec)}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* مقارنة بالقبلي */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
              مقارنة بالاختبار القبلي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm">الاختبار القبلي ({skillLabel})</span>
                <Badge variant="outline" className="text-xs">{prePercentage}%</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                <span className="text-sm font-medium">التدريب الحالي</span>
                <Badge className="text-xs">{latest.percentage}%</Badge>
              </div>
              {latest.percentage > prePercentage && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-emerald-700">
                    تحسّنت {latest.percentage - prePercentage}% عن الاختبار القبلي! 🎉
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* الأزرار */}
        <div className="flex flex-col sm:flex-row gap-3">
          {passed && (
            <Button
              onClick={() => startPostTest(latest.skill, currentUser.id, prePercentage)}
              className="flex-1 h-12 gap-2"
              size="lg"
            >
              <Play className="w-4 h-4" />
              إجراء الاختبار البعدي
            </Button>
          )}
          <Button
            onClick={() => setScreen("trainings_list")}
            variant={passed ? "outline" : "default"}
            className="flex-1 h-12"
            size="lg"
          >
            {!passed && <BookOpen className="w-4 h-4 ml-2" />}
            {passed ? "العودة للتدريبات" : "إعادة التدريب"}
          </Button>
          <Button
            onClick={() => setScreen("student_dashboard")}
            variant="outline"
            className="flex-1 h-12"
            size="lg"
          >
            لوحة الطالب
          </Button>
        </div>
      </div>
    </div>
  );
}
