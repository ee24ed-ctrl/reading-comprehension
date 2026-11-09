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
  Target,
  Play,
} from "lucide-react";
import { CLASSIFICATION_INFO, SKILL_LABELS, SKILL_ICONS } from "@/lib/stages";

export function ImprovementPlanScreen() {
  const setScreen = useAppStore((s) => s.setScreen);
  const currentUser = useAppStore((s) => s.currentUser);
  const improvementPlans = useAppStore((s) => s.improvementPlans);
  const testResults = useAppStore((s) => s.testResults);
  const trainingResults = useAppStore((s) => s.trainingResults);
  const postTests = useAppStore((s) => s.postTests);

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

        {/* الجدول الأسبوعي - مرتبط بالتدريبات */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-primary" />
              الجدول الأسبوعي - تدريبات تفاعلية
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              اضغط على أي مهمة للبدء في التدريب المرتبط بها. كل مهمة تتضمن تدريباً تفاعلياً يليه اختبار بعدي لقياس التحسّن.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* تجميع المهام حسب الأسبوع */}
            {[1, 2, 3, 4].map((weekNum) => {
              const weekTasks = plan.weeklySchedule.filter((t) => t.weekNumber === weekNum);
              if (weekTasks.length === 0) return null;
              const weekCompleted = weekTasks.filter((t) => t.completed).length;
              return (
                <div key={weekNum} className="border-2 border-border/60 rounded-xl overflow-hidden">
                  {/* عنوان الأسبوع */}
                  <div className="bg-muted/40 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">الأسبوع {weekNum}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {weekCompleted}/{weekTasks.length} مكتملة
                      </span>
                    </div>
                    <Progress
                      value={(weekCompleted / weekTasks.length) * 100}
                      className="h-1.5 w-20 sm:w-32 flex-shrink-0"
                    />
                  </div>
                  {/* قائمة مهام الأسبوع - قابلة للنقر */}
                  <div className="divide-y divide-border/50">
                    {weekTasks.map((task) => {
                      const skillInfo = SKILL_LABELS[task.skill];
                      const skillIcon = SKILL_ICONS[task.skill];
                      // هل هذه المهمة تركّز على المهارة الأضعف؟
                      const isFocusTask = task.title.includes("(تركيز)");
                      // التحقق من حالة الطالب في هذه المهارة
                      const hasTraining = trainingResults.some(
                        (r) => r.studentId === currentUser.id && r.skill === task.skill
                      );
                      const hasPostTest = postTests.some(
                        (p) => p.studentId === currentUser.id && p.skill === task.skill
                      );
                      const trainingResult = trainingResults.find(
                        (r) => r.studentId === currentUser.id && r.skill === task.skill
                      );
                      const postTest = postTests.find(
                        (p) => p.studentId === currentUser.id && p.skill === task.skill
                      );
                      const taskDone = hasPostTest;

                      return (
                        <button
                          key={task.id}
                          onClick={() => setScreen("trainings_list")}
                          className={`w-full text-right p-3 transition-all cursor-pointer hover:bg-primary/5 ${
                            taskDone
                              ? "bg-emerald-50/30"
                              : hasTraining
                              ? "bg-amber-50/30"
                              : isFocusTask
                              ? "bg-rose-50/30"
                              : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {taskDone ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                              ) : hasTraining ? (
                                <Play className="w-5 h-5 text-amber-600" />
                              ) : isFocusTask ? (
                                <BookOpen className="w-5 h-5 text-rose-600" />
                              ) : (
                                <BookOpen className="w-5 h-5 text-muted-foreground/60" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <Badge variant="secondary" className="text-xs">
                                  {skillIcon} {skillInfo}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="w-3 h-3 ml-1" />
                                  {task.estimatedMinutes} دقيقة
                                </Badge>
                                {isFocusTask && (
                                  <Badge className="text-xs bg-rose-500 hover:bg-rose-500">
                                    ⚡ تركيز
                                  </Badge>
                                )}
                                {taskDone && (
                                  <Badge className="text-xs bg-emerald-500 hover:bg-emerald-500">
                                    ✓ مكتملة
                                  </Badge>
                                )}
                                {hasTraining && !taskDone && (
                                  <Badge className="text-xs bg-amber-500 hover:bg-amber-500">
                                    ⏳ بانتظار الاختبار البعدي
                                  </Badge>
                                )}
                                {!hasTraining && (
                                  <Badge variant="outline" className="text-xs">
                                    ابدأ التدريب ←
                                  </Badge>
                                )}
                              </div>
                              <h4 className={`font-bold text-sm ${taskDone ? "line-through opacity-60" : ""}`}>
                                {task.title}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{task.description}</p>
                              {/* عرض النتائج إن وجدت */}
                              {(trainingResult || postTest) && (
                                <div className="mt-2 flex items-center gap-2 text-xs">
                                  {trainingResult && (
                                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                                      التدريب: {trainingResult.percentage}%
                                    </span>
                                  )}
                                  {postTest && (
                                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                                      الاختبار البعدي: {postTest.percentage}%
                                      {postTest.improvedFromPre >= 0
                                        ? ` (+${postTest.improvedFromPre}%)`
                                        : ` (${postTest.improvedFromPre}%)`}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <ChevronLeft className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* بطاقة الإجراءات السريعة - تدريبات واختبارات */}
        <Card className="mb-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="font-bold">الوصول السريع</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setScreen("trainings_list")}
                className="gap-2 h-auto py-3 flex-col items-center"
              >
                <BookOpen className="w-5 h-5" />
                <span className="text-sm font-bold">التدريبات</span>
                <span className="text-xs opacity-90">
                  {trainingResults.filter((r) => r.studentId === currentUser.id).length} مكتملة
                </span>
              </Button>
              <Button
                onClick={() => setScreen("trainings_list")}
                variant="outline"
                className="gap-2 h-auto py-3 flex-col items-center"
                disabled={trainingResults.filter((r) => r.studentId === currentUser.id).length === 0}
              >
                <Target className="w-5 h-5" />
                <span className="text-sm font-bold">الاختبار البعدي</span>
                <span className="text-xs opacity-90">
                  {postTests.filter((p) => p.studentId === currentUser.id).length} مكتملة
                </span>
              </Button>
            </div>
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
