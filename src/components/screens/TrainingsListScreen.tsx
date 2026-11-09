"use client";

import { useAppStore } from "@/lib/store";
import { ASSETS } from "@/lib/assets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Circle,
  Play,
  Lock,
  Trophy,
  Target,
  TrendingUp,
  Award,
  Sparkles,
  Clock,
  Lightbulb,
  ChevronLeft,
} from "lucide-react";
import { SKILL_LABELS, SKILL_ICONS, STAGES, GRADES, CLASSIFICATION_INFO } from "@/lib/stages";
import type { SkillKey, StageKey } from "@/lib/types";
import { getTrainingsBySkill } from "@/lib/trainings";
import { toast } from "sonner";

export function TrainingsListScreen() {
  const setScreen = useAppStore((s) => s.setScreen);
  const currentUser = useAppStore((s) => s.currentUser);
  const testResults = useAppStore((s) => s.testResults);
  const startTraining = useAppStore((s) => s.startTraining);
  const startPostTest = useAppStore((s) => s.startPostTest);
  const trainingResults = useAppStore((s) => s.trainingResults);
  const postTests = useAppStore((s) => s.postTests);

  if (!currentUser) return null;

  // النتائج القبلية للطالب
  const myResults = testResults
    .filter((r) => r.studentId === currentUser.id)
    .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
  const latest = myResults[0];

  if (!latest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-sea p-4">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">يجب إجراء اختبار تحديد المستوى أولاً</p>
            <Button onClick={() => setScreen("student_dashboard")}>العودة للوحة الطالب</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // تحديد المرحلة من الصف
  const stage: StageKey = currentUser.gradeKey
    ? GRADES[currentUser.gradeKey as keyof typeof GRADES]?.stage
    : "primary_lower";

  // المهارات الخمس
  const ALL_SKILLS: SkillKey[] = ["main_idea", "inference", "vocabulary", "details", "sequencing"];

  // تصنيف المهارات حسب الأداء في الاختبار القبلي
  const skillData = ALL_SKILLS.map((skill) => {
    const score = latest.skillScores[skill];
    const percentage = score && score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    const trainings = getTrainingsBySkill(stage, skill);
    // نتائج التدريب للطالب في هذه المهارة
    const myTrainingResults = trainingResults.filter(
      (r) => r.studentId === currentUser.id && r.skill === skill
    );
    // نتائج الاختبار البعدي للطالب في هذه المهارة
    const myPostTests = postTests.filter(
      (p) => p.studentId === currentUser.id && p.skill === skill
    );
    // ترتيب المهارات: الأضعف أولاً
    return {
      skill,
      percentage,
      isWeak: percentage < 50,
      isMedium: percentage >= 50 && percentage < 80,
      isStrong: percentage >= 80,
      trainings,
      myTrainingResults,
      myPostTests,
      completedTrainings: myTrainingResults.length,
      totalTrainings: trainings.length,
      latestPostTest: myPostTests[myPostTests.length - 1],
    };
  }).sort((a, b) => a.percentage - b.percentage);

  // تحديد ما إذا كان يمكن للطالب إجراء الاختبار البعدي
  // يجب أن يكمل تدريباً واحداً على الأقل
  const canTakePostTest = (skillInfo: typeof skillData[0]) =>
    skillInfo.completedTrainings > 0;

  // الحصول على نسبة الاختبار القبلي للمهارة
  const getPreTestPercentage = (skill: SkillKey) => {
    const score = latest.skillScores[skill];
    return score && score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-sea">
      {/* الرأس */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setScreen("student_dashboard")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            لوحة الطالب
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src={ASSETS.schoolLogo}
                onError={(e) => { e.currentTarget.src = ASSETS.fallbackLogo; }}
                alt="شعار المدرسة"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-bold text-sm">تدريبات تحسين المهارات</h1>
              <p className="text-xs text-muted-foreground">
                {STAGES[stage].label}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* بطاقة معلومات */}
        <Card className="mb-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold mb-1">خطة علاج المهارات الضعيفة</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  بناءً على نتيجة اختبار تحديد المستوى، تم ترتيب المهارات من الأضعف إلى الأقوى.
                  ابدأ بالتدريبات لتحسين المهارة الضعيفة، ثم اختبر نفسك في الاختبار البعدي لقياس التحسّن.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* قائمة المهارات */}
        <div className="space-y-4">
          {skillData.map((skillInfo, idx) => {
            const skillLabel = SKILL_LABELS[skillInfo.skill];
            const skillIcon = SKILL_ICONS[skillInfo.skill];
            const isWeak = skillInfo.isWeak;
            const isStrong = skillInfo.isStrong;

            return (
              <Card
                key={skillInfo.skill}
                className={`overflow-hidden border-2 ${
                  isWeak ? "border-rose-200 bg-rose-50/30" : isStrong ? "border-emerald-200 bg-emerald-50/30" : "border-amber-200 bg-amber-50/30"
                }`}
              >
                {/* رأس المهارة */}
                <div className={`p-4 border-b ${isWeak ? "bg-rose-50/50" : isStrong ? "bg-emerald-50/50" : "bg-amber-50/50"}`}>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{idx + 1}
                        </Badge>
                        <span className="text-2xl">{skillIcon}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-base">{skillLabel}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              isWeak
                                ? "text-rose-700 border-rose-300"
                                : isStrong
                                ? "text-emerald-700 border-emerald-300"
                                : "text-amber-700 border-amber-300"
                            }`}
                          >
                            {isWeak ? "🔴 مهارة ضعيفة" : isStrong ? "🟢 مهارة قوية" : "🟡 مهارة متوسطة"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            القبلي: {skillInfo.percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={skillInfo.percentage} className="h-2 w-24" />
                      <span className="text-sm font-bold">{skillInfo.percentage}%</span>
                    </div>
                  </div>
                </div>

                {/* محتوى المهارة */}
                <CardContent className="p-4">
                  {/* التدريبات المتاحة */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        التدريبات ({skillInfo.completedTrainings}/{skillInfo.totalTrainings})
                      </h4>
                      {skillInfo.completedTrainings > 0 && (
                        <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 ml-1" />
                          {skillInfo.completedTrainings} مكتملة
                        </Badge>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-3 gap-2">
                      {skillInfo.trainings.map((training, tIdx) => {
                        const isCompleted = skillInfo.myTrainingResults.some(
                          (r) => r.exerciseId === training.id
                        );
                        const isLocked = tIdx > 0 && !skillInfo.myTrainingResults.some(
                          (r) => r.exerciseId === skillInfo.trainings[tIdx - 1].id && r.passed
                        );
                        const levelLabels = ["أساسي", "متوسط", "متقدم"];
                        const levelColors = ["bg-emerald-500", "bg-amber-500", "bg-rose-500"];

                        return (
                          <button
                            key={training.id}
                            onClick={() => {
                              if (isLocked) {
                                toast.error("أكمل المستوى السابق أولاً");
                                return;
                              }
                              startTraining(stage, skillInfo.skill, training.level);
                            }}
                            disabled={isLocked}
                            className={`relative p-3 rounded-xl border-2 text-right transition-all ${
                              isCompleted
                                ? "border-emerald-300 bg-emerald-50"
                                : isLocked
                                ? "border-border bg-muted/30 opacity-60 cursor-not-allowed"
                                : "border-border bg-card hover:border-primary/30 hover:bg-muted/30"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <Badge className={`text-xs ${levelColors[training.level - 1]} text-white`}>
                                {levelLabels[training.level - 1]}
                              </Badge>
                              {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                              {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                            </div>
                            <h5 className="text-xs font-medium line-clamp-2">{training.title}</h5>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {training.estimatedMinutes} د
                              <span>•</span>
                              <span>{training.questions.length} أسئلة</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* الاختبار البعدي */}
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium">الاختبار البعدي</span>
                        {skillInfo.latestPostTest && (
                          <Badge variant="outline" className="text-xs">
                            آخر نتيجة: {skillInfo.latestPostTest.percentage}%
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant={canTakePostTest(skillInfo) ? "default" : "outline"}
                        disabled={!canTakePostTest(skillInfo)}
                        onClick={() => {
                          if (!canTakePostTest(skillInfo)) {
                            toast.error("أكمل تدريباً واحداً على الأقل قبل الاختبار البعدي");
                            return;
                          }
                          startPostTest(skillInfo.skill, currentUser.id, getPreTestPercentage(skillInfo.skill));
                        }}
                        className="gap-2"
                      >
                        <Play className="w-3 h-3" />
                        {skillInfo.latestPostTest ? "إعادة الاختبار" : "ابدأ الاختبار البعدي"}
                      </Button>
                    </div>
                    {!canTakePostTest(skillInfo) && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        أكمل تدريباً واحداً على الأقل لفتح الاختبار البعدي
                      </p>
                    )}
                    {skillInfo.latestPostTest && (
                      <div className="mt-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Trophy className={`w-4 h-4 ${skillInfo.latestPostTest.improvedFromPre >= 0 ? "text-emerald-600" : "text-rose-600"}`} />
                            <span className="text-xs font-medium">
                              {skillInfo.latestPostTest.improvedFromPre >= 0
                                ? `تحسّنت ${skillInfo.latestPostTest.improvedFromPre}% عن القبلي`
                                : `تراجعت ${Math.abs(skillInfo.latestPostTest.improvedFromPre)}% عن القبلي`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">القبلي: {getPreTestPercentage(skillInfo.skill)}%</span>
                            <span>←</span>
                            <span className="font-bold text-emerald-700">البعدي: {skillInfo.latestPostTest.percentage}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
