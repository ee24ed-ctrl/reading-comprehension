"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Target,
  TrendingUp,
  Flame,
  Award,
  BookOpen,
  Clock,
  Calendar,
  ChevronLeft,
  LogOut,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  CLASSIFICATION_INFO,
  SKILL_LABELS,
  SKILL_ICONS,
  STAGES,
  GRADES,
} from "@/lib/stages";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";

export function StudentDashboard() {
  const currentUser = useAppStore((s) => s.currentUser);
  const setScreen = useAppStore((s) => s.setScreen);
  const logout = useAppStore((s) => s.logout);
  const testResults = useAppStore((s) => s.testResults);
  const improvementPlans = useAppStore((s) => s.improvementPlans);
  const startPlacementTest = useAppStore((s) => s.startPlacementTest);
  const settings = useAppStore((s) => s.settings);

  if (!currentUser) return null;

  const myResults = testResults
    .filter((r) => r.studentId === currentUser.id)
    .sort((a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime());

  const latest = myResults[myResults.length - 1];
  const plan = improvementPlans.find((p) => p.studentId === currentUser.id);
  const stage = currentUser.gradeKey ? STAGES[GRADES[currentUser.gradeKey].stage] : null;

  const handleRetakeTest = () => {
    if (!stage) return;
    startPlacementTest(stage.key);
    setScreen("placement_test");
  };

  const completedTasks = plan?.weeklySchedule.filter((t) => t.completed).length || 0;
  const planProgress = plan ? (completedTasks / plan.weeklySchedule.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-sea">
      {/* الرأس */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm">لوحة الطالب</h1>
              <p className="text-xs text-muted-foreground">{settings.appName} — {settings.schoolName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
              <Flame className="w-4 h-4 text-accent" />
              <span className="text-xs font-medium">{currentUser.streakDays || 0} يوم</span>
              <div className="w-px h-3 bg-border mx-1" />
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium">{currentUser.points || 0} نقطة</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground">
              <LogOut className="w-4 h-4 ml-1" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* بطاقة الترحيب */}
        <div className="mb-6 bg-gradient-to-l from-primary/5 to-accent/5 rounded-2xl p-5 border border-border/60">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md"
                style={{ background: currentUser.avatarColor || "var(--primary)" }}
              >
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold">أهلاً، {currentUser.name}</h2>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  {currentUser.gradeKey && (
                    <>
                      <Badge variant="outline" className="text-xs">{GRADES[currentUser.gradeKey].label}</Badge>
                      <span>•</span>
                    </>
                  )}
                  {currentUser.academicNumber && (
                    <span className="font-mono text-xs">#{currentUser.academicNumber}</span>
                  )}
                </div>
              </div>
            </div>
            {latest && (
              <div className={`px-4 py-2 rounded-xl border ${CLASSIFICATION_INFO[latest.classification].bgColor}`}>
                <div className="text-xs text-muted-foreground">مستواك الحالي</div>
                <div className={`font-bold flex items-center gap-1.5 ${CLASSIFICATION_INFO[latest.classification].color}`}>
                  <span>{CLASSIFICATION_INFO[latest.classification].icon}</span>
                  {CLASSIFICATION_INFO[latest.classification].label}
                </div>
              </div>
            )}
          </div>
        </div>

        {!latest ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="font-bold mb-2">لم تخضع لاختبار تحديد المستوى بعد</h3>
              <p className="text-sm text-muted-foreground mb-4">
                يجب إجراء اختبار تحديد المستوى أولاً لتصنيفك وإنشاء خطة تحسين مناسبة.
              </p>
              <Button onClick={handleRetakeTest} size="lg" className="gap-2">
                <Target className="w-4 h-4" />
                ابدأ اختبار تحديد المستوى
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="overview" className="text-xs md:text-sm">نظرة عامة</TabsTrigger>
              <TabsTrigger value="skills" className="text-xs md:text-sm">تحليل المهارات</TabsTrigger>
              <TabsTrigger value="progress" className="text-xs md:text-sm">منحنى التقدم</TabsTrigger>
              <TabsTrigger value="achievements" className="text-xs md:text-sm">إنجازاتي</TabsTrigger>
            </TabsList>

            {/* نظرة عامة */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                {/* النتيجة */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="w-5 h-5 text-primary" />
                      نتيجتك الأخيرة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <div className="text-5xl font-bold text-primary mb-1">
                          {latest.percentage}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {latest.correctCount} من {latest.totalQuestions} إجابة صحيحة
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(latest.takenAt).toLocaleDateString("ar-SA")}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button onClick={() => setScreen("test_result")} variant="outline" size="sm">
                          عرض التفاصيل
                          <ChevronLeft className="w-4 h-4 mr-1" />
                        </Button>
                        <Button onClick={handleRetakeTest} size="sm" variant="ghost">
                          إعادة التقييم
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* خطة التحسين */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Trophy className="w-5 h-5 text-accent" />
                      خطة التحسين
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {plan ? (
                      <>
                        <div className="text-3xl font-bold text-accent mb-1">{Math.round(planProgress)}%</div>
                        <Progress value={planProgress} className="h-2 mb-2" />
                        <div className="text-xs text-muted-foreground mb-3">
                          {completedTasks} من {plan.weeklySchedule.length} مهام مكتملة
                        </div>
                        <Button
                          onClick={() => setScreen("improvement_plan")}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          عرض الخطة الكاملة
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">لا توجد خطة متاحة</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* المهام الأسبوعية الحالية */}
              {plan && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="w-5 h-5 text-primary" />
                      مهام هذا الأسبوع
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {plan.weeklySchedule.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          task.completed
                            ? "border-emerald-200 bg-emerald-50/50"
                            : "border-border bg-card"
                        }`}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-medium text-sm ${task.completed ? "line-through opacity-70" : ""}`}>
                              {task.title}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {SKILL_ICONS[task.skill]} {SKILL_LABELS[task.skill]}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            الأسبوع {task.weekNumber} • {task.estimatedMinutes} دقيقة
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* تحليل المهارات */}
            <TabsContent value="skills" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5 text-primary" />
                    تحليل مهارات الفهم القرائي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    {/* رسم الرادار */}
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={getRadarData(latest.skillScores)}>
                          <PolarGrid stroke="var(--border)" />
                          <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                          <Radar
                            name="نسبتك"
                            dataKey="value"
                            stroke="var(--primary)"
                            fill="var(--primary)"
                            fillOpacity={0.4}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "var(--card)",
                              border: "1px solid var(--border)",
                              borderRadius: "0.5rem",
                              direction: "rtl",
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* قائمة المهارات */}
                    <div className="space-y-3">
                      {Object.entries(latest.skillScores)
                        .sort(([, a], [, b]) => b.correct / Math.max(1, b.total) - a.correct / Math.max(1, a.total))
                        .map(([skill, scores]) => {
                          const pct = Math.round((scores.correct / Math.max(1, scores.total)) * 100);
                          return (
                            <div key={skill}>
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span>{SKILL_ICONS[skill as keyof typeof SKILL_ICONS]}</span>
                                  <span className="text-sm font-medium">
                                    {SKILL_LABELS[skill as keyof typeof SKILL_LABELS]}
                                  </span>
                                </div>
                                <span className="text-sm font-mono">{pct}%</span>
                              </div>
                              <Progress
                                value={pct}
                                className={`h-1.5 ${
                                  pct >= 80 ? "[&_>div]:bg-emerald-500" : pct >= 50 ? "[&_>div]:bg-amber-500" : "[&_>div]:bg-rose-500"
                                }`}
                              />
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* منحنى التقدم */}
            <TabsContent value="progress" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    منحنى التقدم الزمني
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {myResults.length < 2 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">
                        سيظهر منحنى تقدمك بعد إجراء اختبارين أو أكثر.
                      </p>
                      <Button onClick={handleRetakeTest} variant="outline" size="sm" className="mt-3">
                        أجرِ اختباراً الآن
                      </Button>
                    </div>
                  ) : (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getProgressData(myResults)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                            tickFormatter={(v) => new Date(v).toLocaleDateString("ar-SA", { day: "numeric", month: "short" })}
                          />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                          <Tooltip
                            contentStyle={{
                              background: "var(--card)",
                              border: "1px solid var(--border)",
                              borderRadius: "0.5rem",
                              direction: "rtl",
                            }}
                            labelFormatter={(v) => new Date(v).toLocaleDateString("ar-SA")}
                          />
                          <Line
                            type="monotone"
                            dataKey="percentage"
                            name="النسبة المئوية"
                            stroke="var(--primary)"
                            strokeWidth={2}
                            dot={{ fill: "var(--primary)", r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* الإنجازات */}
            <TabsContent value="achievements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="w-5 h-5 text-accent" />
                    الشارات والإنجازات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <BadgeCard
                      icon="🎯"
                      title="البداية"
                      description="أكملت أول اختبار"
                      unlocked={myResults.length > 0}
                    />
                    <BadgeCard
                      icon="📚"
                      title="مجتهد"
                      description="أكملت التدريبات الأولى"
                      unlocked={completedTasks > 0}
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
                    <BadgeCard
                      icon="📈"
                      title="في تطور"
                      description="5 اختبارات مكتملة"
                      unlocked={myResults.length >= 5}
                    />
                    <BadgeCard
                      icon="💡"
                      title="مفكر"
                      description="أتقنت مهارة الاستنتاج"
                      unlocked={
                        latest.skillScores.inference &&
                        latest.skillScores.inference.correct / latest.skillScores.inference.total >= 0.8
                      }
                    />
                    <BadgeCard
                      icon="📖"
                      title="قارئ نشط"
                      description="أتقنت مهارة الفكرة الرئيسية"
                      unlocked={
                        latest.skillScores.main_idea &&
                        latest.skillScores.main_idea.correct / latest.skillScores.main_idea.total >= 0.8
                      }
                    />
                    <BadgeCard
                      icon="⭐"
                      title="نجم الفصل"
                      description="كنت من أفضل 3 في فصلك"
                      unlocked={false}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
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
      className={`text-center p-4 rounded-xl border-2 transition-all ${
        unlocked
          ? "border-accent/30 bg-accent/5"
          : "border-border bg-muted/30 opacity-50 grayscale"
      }`}
    >
      <div className="text-4xl mb-2">{icon}</div>
      <div className="font-bold text-sm">{title}</div>
      <div className="text-xs text-muted-foreground mt-1">{description}</div>
    </div>
  );
}

function getRadarData(skillScores: any) {
  return Object.entries(skillScores).map(([skill, scores]: any) => ({
    skill: SKILL_LABELS[skill as keyof typeof SKILL_LABELS],
    value: Math.round((scores.correct / Math.max(1, scores.total)) * 100),
  }));
}

function getProgressData(results: any[]) {
  return results.map((r) => ({
    date: r.takenAt,
    percentage: r.percentage,
    classification: r.classification,
  }));
}
