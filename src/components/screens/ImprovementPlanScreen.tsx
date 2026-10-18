"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Calendar,
  Clock,
  Flame,
  Award,
  BookOpen,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { CLASSIFICATION_INFO, SKILL_LABELS, SKILL_ICONS } from "@/lib/stages";

export function ImprovementPlanScreen() {
  const setScreen = useAppStore((s) => s.setScreen);
  const currentUser = useAppStore((s) => s.currentUser);
  const improvementPlans = useAppStore((s) => s.improvementPlans);
  const testResults = useAppStore((s) => s.testResults);

  if (!currentUser) return null;

  const plan = improvementPlans.find((p) => p.studentId === currentUser.id);
  const latest = testResults
    .filter((r) => r.studentId === currentUser.id)
    .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime())[0];

  if (!plan || !latest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-sea">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">لا توجد خطة تحسين متاحة حالياً</p>
            <Button onClick={() => setScreen("student_dashboard")}>العودة للوحة الطالب</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const classification = CLASSIFICATION_INFO[plan.classification];
  const completedTasks = plan.weeklySchedule.filter((t) => t.completed).length;
  const planProgress = (completedTasks / plan.weeklySchedule.length) * 100;

  const nextAssessmentDate = new Date(plan.nextAssessmentDate);
  const daysUntilReassessment = Math.ceil(
    (nextAssessmentDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
  );

  // الأهداف حسب التصنيف
  const goals = getGoalsForClassification(plan.classification);

  return (
    <div className="min-h-screen bg-gradient-sea py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* الرأس */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setScreen("student_dashboard")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            لوحة الطالب
          </button>
          <Badge variant="outline" className={`text-xs ${classification.color}`}>
            {classification.icon} {classification.label}
          </Badge>
        </div>

        {/* رأس الخطة */}
        <Card className="mb-6 overflow-hidden">
          <div className={`bg-gradient-to-br ${classification.bgColor} p-6 md:p-8`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-white/70 flex items-center justify-center">
                <Trophy className={`w-6 h-6 ${classification.color}`} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">خطة التحسين</h1>
                <p className="text-sm text-muted-foreground">المستوى الحالي: {classification.label}</p>
              </div>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{plan.teacherNotes}</p>
          </div>
          <CardContent className="p-6">
            {/* تقدم الخطة */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">تقدم الخطة الكلي</span>
                <span className="text-sm font-mono">{Math.round(planProgress)}%</span>
              </div>
              <Progress value={planProgress} className="h-2.5" />
              <div className="mt-2 text-xs text-muted-foreground">
                {completedTasks} من {plan.weeklySchedule.length} مهام مكتملة
              </div>
            </div>

            {/* إحصائيات */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-primary/5 rounded-xl p-3 text-center">
                <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
                <div className="text-xs text-muted-foreground">إعادة التقييم بعد</div>
                <div className="font-bold text-sm">{daysUntilReassessment} يوم</div>
              </div>
              <div className="bg-accent/5 rounded-xl p-3 text-center">
                <Flame className="w-5 h-5 text-accent mx-auto mb-1" />
                <div className="text-xs text-muted-foreground">أيام متتالية</div>
                <div className="font-bold text-sm">{currentUser.streakDays || 0} يوم</div>
              </div>
              <div className="bg-emerald-5 rounded-xl p-3 text-center bg-emerald-50">
                <Award className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <div className="text-xs text-muted-foreground">النقاط</div>
                <div className="font-bold text-sm">{currentUser.points || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* الأهداف */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-accent" />
              أهداف الخطة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {goals.map((goal, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-accent">{idx + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{goal.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{goal.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* الجدول الأسبوعي */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-primary" />
              الجدول الأسبوعي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {plan.weeklySchedule.map((task) => {
              const skillInfo = SKILL_LABELS[task.skill];
              const skillIcon = SKILL_ICONS[task.skill];
              return (
                <div
                  key={task.id}
                  className={`rounded-xl border-2 p-4 transition-all ${
                    task.completed
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {task.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              الأسبوع {task.weekNumber}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {skillIcon} {skillInfo}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 ml-1" />
                              {task.estimatedMinutes} دقيقة
                            </Badge>
                          </div>
                          <h4 className={`font-bold mt-2 ${task.completed ? "line-through opacity-70" : ""}`}>
                            {task.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* ملاحظات المعلم */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5 text-primary" />
              ملاحظات المعلم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 rounded-xl p-4">
              <p className="text-sm leading-relaxed">{plan.teacherNotes}</p>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              آخر تحديث: {new Date(plan.updatedAt).toLocaleDateString("ar-SA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </CardContent>
        </Card>

        {/* الشارات والإنجازات */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-accent" />
              إنجازاتك
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <BadgeCard
                icon="🎯"
                title="أول اختبار"
                description="أكملت اختبار تحديد المستوى"
                unlocked={true}
              />
              <BadgeCard
                icon="📚"
                title="مجتهد"
                description="أكملت 5 تدريبات"
                unlocked={true}
              />
              <BadgeCard
                icon="🔥"
                title="مثابر"
                description="7 أيام متتالية"
                unlocked={(currentUser.streakDays || 0) >= 7}
              />
              <BadgeCard
                icon="🏆"
                title="متفوق"
                description="حقق نسبة 80%+"
                unlocked={latest.percentage >= 80}
              />
            </div>
          </CardContent>
        </Card>

        {/* إعادة التقييم */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-1">إعادة تقييم المستوى</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  سيُعاد قياس مستواك تلقائياً كل {useAppStore.getState().settings.reassessmentIntervalWeeks} أسابيع لمراقبة تقدمك.
                  الموعد القادم: {nextAssessmentDate.toLocaleDateString("ar-SA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <Button variant="outline" size="sm" className="gap-2">
                  عرض منحنى تقدمي
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BadgeCard({
  icon,
  title,
  description,
  unlocked,
}: {
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
}) {
  return (
    <div
      className={`text-center p-3 rounded-xl border-2 transition-all ${
        unlocked
          ? "border-accent/30 bg-accent/5"
          : "border-border bg-muted/30 opacity-60 grayscale"
      }`}
    >
      <div className="text-3xl mb-1">{icon}</div>
      <div className="font-bold text-xs">{title}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
    </div>
  );
}

function getGoalsForClassification(classification: string) {
  if (classification === "support") {
    return [
      { title: "تطوير المهارة الأضعف", description: "تركيز يومي على المهارة الأكثر ضعفاً مع تدرّج بسيط" },
      { title: "قراءة يومية منتظمة", description: "10-15 دقيقة يومياً من النصوص القصيرة المناسبة لمستواك" },
      { title: "تغذية راجعة فورية", description: "مراجعة الإجابات بعد كل تمرين لتحسين الفهم" },
      { title: "إعادة التقييم بعد 4 أسابيع", description: "لقياس أثر الخطة على تطوّر المستوى" },
    ];
  }
  if (classification === "medium") {
    return [
      { title: "تنمية المهارات الأساسية", description: "تدريبات متنوعة على جميع المهارات الخمس" },
      { title: "تدرّج في الصعوبة", description: "الانتقال التدريجي من النصوص السهلة إلى المتوسطة" },
      { title: "قراءة متنوعة", description: "نصوص أدبية ومعلوماتية لتوسيع المدارك" },
      { title: "إعادة التقييم بعد 4 أسابيع", description: "للتأكد من الانتقال لمستوى متفوّق" },
    ];
  }
  return [
    { title: "نصوص أعمق وتحديات", description: "تحدّي القدرات الاستنتاجية والتحليلية" },
    { title: "مهارات تفكير ناقد", description: "تحليل النصوص واكتشاف المغالطات" },
    { title: "قراءة مكثفة ومنوّعة", description: "نصوص علمية وأدبية وقديمة" },
    { title: "إعداد للقدرات", description: "تدريب على القدرات اللفظية للمرحلة الجامعية" },
  ];
}
