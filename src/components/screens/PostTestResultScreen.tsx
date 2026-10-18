"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Clock,
  Sparkles,
  Award,
  BookOpen,
  Lightbulb,
  ChevronDown,
} from "lucide-react";
import { SKILL_LABELS, SKILL_ICONS } from "@/lib/stages";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

export function PostTestResultScreen() {
  const setScreen = useAppStore((s) => s.setScreen);
  const currentUser = useAppStore((s) => s.currentUser);
  const postTests = useAppStore((s) => s.postTests);

  if (!currentUser) return null;

  // آخر اختبار بعدي
  const myPostTests = postTests
    .filter((p) => p.studentId === currentUser.id)
    .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
  const latest = myPostTests[0];

  if (!latest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-sea p-4">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">لا توجد نتيجة اختبار بعدي متاحة</p>
            <Button onClick={() => setScreen("trainings_list")}>العودة للتدريبات</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const skillLabel = SKILL_LABELS[latest.skill];
  const skillIcon = SKILL_ICONS[latest.skill];
  const improved = latest.improvedFromPre >= 0;
  const improvement = latest.improvedFromPre;

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
              improved
                ? "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-200"
                : "bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-200"
            }`}
          >
            {improved ? (
              <TrendingUp className="w-10 h-10 text-white" />
            ) : (
              <TrendingDown className="w-10 h-10 text-white" />
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {improved ? "🎉 تحسّن رائع!" : "نتيجة الاختبار البعدي"}
          </h1>
          <p className="text-muted-foreground">
            {improved
              ? `تحسّنت ${improvement}% عن الاختبار القبلي`
              : `تراجعت ${Math.abs(improvement)}% عن الاختبار القبلي`}
          </p>
        </div>

        {/* النتيجة الرئيسية */}
        <Card className={`mb-6 overflow-hidden border-2 ${
          improved ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"
        }`}>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-right">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="text-3xl">{skillIcon}</span>
                  <h2 className="text-2xl font-bold">{skillLabel}</h2>
                </div>
                <Badge variant="outline" className="text-xs">الاختبار البعدي</Badge>
              </div>

              <div className="text-center">
                <div className={`text-6xl md:text-7xl font-bold leading-none ${
                  improved ? "text-emerald-600" : "text-amber-600"
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

        {/* مقارنة بالقبلي */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-primary" />
              مقارنة قبل/بعد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {/* القبلي */}
              <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="text-xs text-muted-foreground mb-1">القبلي</div>
                <div className="text-3xl font-bold text-amber-600">{latest.improvedFromPre + latest.percentage - latest.improvedFromPre}%</div>
                <div className="text-xs text-muted-foreground mt-1">قبل التدريب</div>
              </div>

              {/* الفرق */}
              <div className="text-center p-4 bg-primary/5 rounded-xl border border-primary/20">
                <div className="text-xs text-muted-foreground mb-1">الفرق</div>
                <div className={`text-3xl font-bold ${
                  improved ? "text-emerald-600" : "text-rose-600"
                }`}>
                  {improved ? "+" : ""}{improvement}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {improved ? "تحسّن" : "تراجع"}
                </div>
              </div>

              {/* البعدي */}
              <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="text-xs text-muted-foreground mb-1">البعدي</div>
                <div className="text-3xl font-bold text-emerald-600">{latest.percentage}%</div>
                <div className="text-xs text-muted-foreground mt-1">بعد التدريب</div>
              </div>
            </div>

            {/* شريط التقدم المقارن */}
            <div className="mt-6 space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">القبلي</span>
                  <span className="font-bold">{latest.improvedFromPre + latest.percentage - latest.improvedFromPre}%</span>
                </div>
                <Progress value={latest.improvedFromPre + latest.percentage - latest.improvedFromPre} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">البعدي</span>
                  <span className="font-bold">{latest.percentage}%</span>
                </div>
                <Progress value={latest.percentage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* إحصائيات */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">صحيحة</div>
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
                <div className="text-xs text-muted-foreground">خاطئة</div>
                <div className="font-bold">{latest.totalQuestions - latest.correctCount}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">الوقت</div>
                <div className="font-bold text-xs">{formatDuration(latest.durationSec)}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* توصية */}
        <Card className={`mb-6 border-2 ${
          improved && latest.percentage >= 80
            ? "border-emerald-200 bg-emerald-50"
            : improved
            ? "border-amber-200 bg-amber-50"
            : "border-rose-200 bg-rose-50"
        }`}>
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                improved && latest.percentage >= 80
                  ? "bg-emerald-100"
                  : improved
                  ? "bg-amber-100"
                  : "bg-rose-100"
              }`}>
                {improved && latest.percentage >= 80 ? (
                  <Award className="w-5 h-5 text-emerald-600" />
                ) : improved ? (
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                ) : (
                  <Lightbulb className="w-5 h-5 text-rose-600" />
                )}
              </div>
              <div>
                <h3 className="font-bold mb-1">توصية المعلم</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {improved && latest.percentage >= 80
                    ? "أحسنت! لقد أتقنت هذه المهارة. يمكنك الانتقال لتدريبات مهارة أخرى."
                    : improved
                    ? "تحسّنت لكنك تحتاج لتركيز أكبر. أعد التدريب مرة أخرى ثم اختبر نفسك."
                    : "لم تتحسن بعد. راجع التدريبات بعناية وكرّرها قبل إعادة الاختبار."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* الأزرار */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => setScreen("trainings_list")}
            className="flex-1 h-12 gap-2"
            size="lg"
          >
            <BookOpen className="w-4 h-4" />
            العودة للتدريبات
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
