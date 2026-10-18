"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Sparkles,
  Calendar,
  Lightbulb,
  ChevronDown,
} from "lucide-react";
import { CLASSIFICATION_INFO, SKILL_LABELS, SKILL_ICONS } from "@/lib/stages";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

export function TestResultScreen() {
  const setScreen = useAppStore((s) => s.setScreen);
  const currentUser = useAppStore((s) => s.currentUser);
  const testResults = useAppStore((s) => s.testResults);
  const improvementPlans = useAppStore((s) => s.improvementPlans);

  if (!currentUser) return null;

  const myResults = testResults
    .filter((r) => r.studentId === currentUser.id)
    .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());

  const latest = myResults[0];
  if (!latest) return null;

  const plan = improvementPlans.find((p) => p.studentId === currentUser.id);
  const classification = CLASSIFICATION_INFO[latest.classification];

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m} دقيقة و ${s} ثانية`;
  };

  const sortedSkills = Object.entries(latest.skillScores).sort(
    ([, a], [, b]) => b.correct / Math.max(1, b.total) - a.correct / Math.max(1, a.total)
  );

  const weakestSkill = sortedSkills[sortedSkills.length - 1];
  const strongestSkill = sortedSkills[0];

  return (
    <div className="min-h-screen bg-gradient-sea py-6 md:py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* رأس النتيجة */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 mb-4 shadow-lg shadow-emerald-200">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            تمَّ اختبار تحديد المستوى!
          </h1>
          <p className="text-muted-foreground">
            {latest.isInitial
              ? "تم تقييم مستواك لأول مرة وإنشاء خطة تحسين مناسبة"
              : "تمت إعادة تقييم مستواك"}
          </p>
        </div>

        {/* النتيجة الرئيسية */}
        <Card className={`mb-6 overflow-hidden border-2 ${classification.bgColor}`}>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-right">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="text-4xl">{classification.icon}</span>
                  <h2 className={`text-2xl md:text-3xl font-bold ${classification.color}`}>
                    {classification.label}
                  </h2>
                </div>
                <p className={`text-sm md:text-base ${classification.color} opacity-90`}>
                  {classification.description}
                </p>
              </div>

              <div className="text-center">
                <div className={`text-6xl md:text-7xl font-bold ${classification.color} leading-none`}>
                  {latest.percentage}%
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {latest.correctCount} من {latest.totalQuestions} إجابة صحيحة
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <StatCard
            icon={Clock}
            label="زمن الإجمالي"
            value={formatDuration(latest.durationSec)}
            color="text-sky-700 bg-sky-50"
          />
          <StatCard
            icon={CheckCircle2}
            label="إجابات صحيحة"
            value={`${latest.correctCount}`}
            color="text-emerald-700 bg-emerald-50"
          />
          <StatCard
            icon={XCircle}
            label="إجابات خاطئة"
            value={`${latest.totalQuestions - latest.correctCount}`}
            color="text-rose-700 bg-rose-50"
          />
        </div>

        {/* تفصيل المهارات */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              تحليل المهارات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedSkills.map(([skill, scores]) => {
              const skillKey = skill as keyof typeof SKILL_LABELS;
              const percentage = Math.round((scores.correct / Math.max(1, scores.total)) * 100);
              const isWeak = skill === weakestSkill[0];
              const isStrong = skill === strongestSkill[0];
              return (
                <div key={skill}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{SKILL_ICONS[skillKey]}</span>
                      <span className="font-medium">{SKILL_LABELS[skillKey]}</span>
                      {isStrong && (
                        <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-300">
                          <TrendingUp className="w-3 h-3 ml-1" />
                          أقوى مهارة
                        </Badge>
                      )}
                      {isWeak && (
                        <Badge variant="outline" className="text-xs text-rose-700 border-rose-300">
                          <Lightbulb className="w-3 h-3 ml-1" />
                          مهارة تحتاج تطوير
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm font-mono">
                      {scores.correct}/{scores.total} ({percentage}%)
                    </span>
                  </div>
                  <Progress
                    value={percentage}
                    className={`h-2 ${
                      percentage >= 80 ? "[&_>div]:bg-emerald-500" : percentage >= 50 ? "[&_>div]:bg-amber-500" : "[&_>div]:bg-rose-500"
                    }`}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* خطة التحسين */}
        {plan && <ImprovementPlanPreview plan={plan} weakestSkill={weakestSkill[0] as any} />}

        {/* الأزرار */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            onClick={() => setScreen("improvement_plan")}
            className="flex-1 h-12"
            size="lg"
          >
            عرض خطة التحسين الكاملة
          </Button>
          <Button
            onClick={() => setScreen("student_dashboard")}
            variant="outline"
            className="flex-1 h-12"
            size="lg"
          >
            الذهاب للوحة الرئيسية
          </Button>
        </div>

        {/* مراجعة الإجابات (قابل للطي) */}
        <AnswerReview result={latest} />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="font-bold text-sm md:text-base">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ImprovementPlanPreview({ plan, weakestSkill }: { plan: any; weakestSkill: string }) {
  const setScreen = useAppStore((s) => s.setScreen);

  return (
    <Card className="mb-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-accent" />
          <h3 className="font-bold">خطة التحسين المقترحة</h3>
          <Badge variant="outline" className="text-xs">
            {plan.status === "approved" ? "معتمدة" : plan.status === "in_progress" ? "قيد التنفيذ" : "مسودة"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{plan.teacherNotes}</p>

        <div className="space-y-2">
          {plan.weeklySchedule.slice(0, 2).map((task: any) => (
            <div key={task.id} className="flex items-center gap-3 bg-card/70 rounded-lg p-3 border border-border/60">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">الأسبوع {task.weekNumber}: {task.title}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
              </div>
              <Badge variant="secondary" className="text-xs">{task.estimatedMinutes} د</Badge>
            </div>
          ))}
        </div>

        <Button
          onClick={() => setScreen("improvement_plan")}
          variant="ghost"
          className="w-full mt-3"
          size="sm"
        >
          عرض الخطة الكاملة ({plan.weeklySchedule.length} أسابيع)
          <ArrowLeft className="w-4 h-4 mr-1" />
        </Button>
      </CardContent>
    </Card>
  );
}

function AnswerReview({ result }: { result: any }) {
  const [isOpen, setIsOpen] = useState(false);
  // نعتمد فقط على الأسئلة المخزّنة في النتيجة نفسها (result.questions)
  // لأنها تُخزّن عند إنهاء الاختبار (finishTest)
  // هذا يتجنب تماماً الحاجة لقراءة customQuestions من المتجر وتجنب infinite loop
  const questions = result.questions;

  if (!questions || questions.length === 0 || result.answers.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-6">
      <Card>
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
            <span className="font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              مراجعة الإجابات التفصيلية
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3 max-h-96 overflow-y-auto custom-scroll">
            {result.answers.map((ans: any, idx: number) => {
              const q = questions.find((q) => q.id === ans.questionId);
              return (
                <div
                  key={idx}
                  className={`rounded-lg p-3 border ${
                    ans.isCorrect
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-rose-50 border-rose-200"
                  }`}
                >
                  <div className="flex items-start gap-2 mb-1">
                    {ans.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        السؤال {idx + 1} — {SKILL_LABELS[ans.skill as keyof typeof SKILL_LABELS]}
                      </p>
                      {q && <p className="text-xs text-muted-foreground mt-1">{q.questionText}</p>}
                      <div className="mt-2 text-xs space-y-0.5">
                        {!ans.isCorrect && (
                          <div className="text-rose-700">
                            إجابتك: {ans.selectedAnswer || "لم تتم الإجابة"}
                          </div>
                        )}
                        {q && (
                          <div className="text-emerald-700">
                            الإجابة الصحيحة: {q.correctAnswer}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
