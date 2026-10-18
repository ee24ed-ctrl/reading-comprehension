"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  School,
  GraduationCap,
  UserCheck,
  UserX,
  LogOut,
  BarChart3,
  Settings,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Award,
  FileText,
  Download,
  Plus,
  Shield,
  Target,
} from "lucide-react";
import {
  CLASSIFICATION_INFO,
  SKILL_LABELS,
  STAGES,
  GRADES,
  STAGE_ORDER,
  DEFAULT_SETTINGS,
} from "@/lib/stages";
import type { StageKey, SkillKey } from "@/lib/types";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const CLASSIFICATION_COLORS = {
  support: "#f43f5e",
  medium: "#f59e0b",
  excellent: "#10b981",
};

export function AdminDashboard() {
  const currentUser = useAppStore((s) => s.currentUser);
  const logout = useAppStore((s) => s.logout);
  const users = useAppStore((s) => s.users);
  const classrooms = useAppStore((s) => s.classrooms);
  const testResults = useAppStore((s) => s.testResults);
  const improvementPlans = useAppStore((s) => s.improvementPlans);
  const settings = useAppStore((s) => s.settings);
  const approveTeacher = useAppStore((s) => s.approveTeacher);
  const rejectTeacher = useAppStore((s) => s.rejectTeacher);
  const addClassroom = useAppStore((s) => s.addClassroom);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const [newClassName, setNewClassName] = useState("");
  const [newClassGrade, setNewClassGrade] = useState("g1");
  const [supportMax, setSupportMax] = useState(settings.classificationThresholds.supportMax);
  const [excellentMin, setExcellentMin] = useState(settings.classificationThresholds.excellentMin);
  const [testCount, setTestCount] = useState(settings.placementTestQuestionCount);

  if (!currentUser) return null;

  // إحصائيات عامة
  const students = users.filter((u) => u.role === "student");
  const teachers = users.filter((u) => u.role === "teacher");
  const pendingTeachers = teachers.filter((t) => !t.approved);

  // إحصائيات حسب التصنيف
  const byClassification = { support: 0, medium: 0, excellent: 0 };
  students.forEach((s) => {
    const r = testResults
      .filter((res) => res.studentId === s.id && res.isInitial)
      .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime())[0];
    if (r) byClassification[r.classification]++;
  });

  // إحصائيات حسب المرحلة
  const byStage = STAGE_ORDER.reduce((acc, stage) => {
    const stageStudents = students.filter((s) =>
      STAGES[stage].grades.includes(s.gradeKey as any)
    );
    const stageStats = { total: stageStudents.length, support: 0, medium: 0, excellent: 0 };
    stageStudents.forEach((s) => {
      const r = testResults
        .filter((res) => res.studentId === s.id && res.isInitial)
        .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime())[0];
      if (r) stageStats[r.classification]++;
    });
    acc[stage] = stageStats;
    return acc;
  }, {} as Record<StageKey, any>);

  // متوسطات المهارات
  const skillAggregates: Record<SkillKey, { correct: number; total: number }> = {
    main_idea: { correct: 0, total: 0 },
    inference: { correct: 0, total: 0 },
    vocabulary: { correct: 0, total: 0 },
    details: { correct: 0, total: 0 },
    sequencing: { correct: 0, total: 0 },
  };
  testResults.forEach((r) => {
    Object.entries(r.skillScores).forEach(([skill, scores]) => {
      skillAggregates[skill as SkillKey].correct += scores.correct;
      skillAggregates[skill as SkillKey].total += scores.total;
    });
  });

  const skillAverages = Object.entries(skillAggregates).map(([skill, { correct, total }]) => ({
    skill: SKILL_LABELS[skill as SkillKey],
    shortSkill: skill,
    percentage: Math.round((correct / Math.max(1, total)) * 100),
    correct,
    total,
  }));

  const weakestSkill = [...skillAverages].sort((a, b) => a.percentage - b.percentage)[0];
  const strongestSkill = [...skillAverages].sort((a, b) => b.percentage - a.percentage)[0];

  // متوسط الدرجات حسب المرحلة
  const avgByStage = STAGE_ORDER.map((stage) => {
    const stageStudents = students.filter((s) =>
      STAGES[stage].grades.includes(s.gradeKey as any)
    );
    const scores = stageStudents
      .map((s) => {
        const r = testResults
          .filter((res) => res.studentId === s.id && res.isInitial)
          .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime())[0];
        return r?.percentage;
      })
      .filter((p): p is number => p !== undefined);
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return { stage: STAGES[stage].label, avg, count: stageStudents.length };
  });

  // متوسط الدرجات حسب الفصل
  const avgByClass = classrooms
    .map((c) => {
      const classStudents = students.filter((s) => s.classroomId === c.id);
      const scores = classStudents
        .map((s) => {
          const r = testResults
            .filter((res) => res.studentId === s.id && res.isInitial)
            .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime())[0];
          return r?.percentage;
        })
        .filter((p): p is number => p !== undefined);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      return {
        class: c.name,
        avg,
        count: classStudents.length,
        grade: GRADES[c.gradeKey as keyof typeof GRADES]?.label || c.gradeKey,
      };
    })
    .filter((c) => c.count > 0)
    .sort((a, b) => b.avg - a.avg);

  // أعلى/أدنى الفصول (الفجوة)
  const topClass = avgByClass[0];
  const bottomClass = avgByClass[avgByClass.length - 1];
  const classGap = topClass && bottomClass ? topClass.avg - bottomClass.avg : 0;

  // مقارنة القبلي والبعدي
  const prePostComparison = (() => {
    const initialResults = testResults.filter((r) => r.isInitial);
    const followUpResults = testResults.filter((r) => !r.isInitial);
    const preAvg =
      initialResults.length > 0
        ? Math.round(initialResults.reduce((a, b) => a + b.percentage, 0) / initialResults.length)
        : 0;
    const postAvg =
      followUpResults.length > 0
        ? Math.round(followUpResults.reduce((a, b) => a + b.percentage, 0) / followUpResults.length)
        : 0;
    return {
      pre: preAvg,
      post: postAvg,
      improvement: postAvg - preAvg,
    };
  })();

  // نسبة إنجاز الخطط
  const planCompletion = (() => {
    if (improvementPlans.length === 0) return 0;
    const totalTasks = improvementPlans.reduce((acc, p) => acc + p.weeklySchedule.length, 0);
    const completedTasks = improvementPlans.reduce(
      (acc, p) => acc + p.weeklySchedule.filter((t) => t.completed).length,
      0
    );
    return Math.round((completedTasks / Math.max(1, totalTasks)) * 100);
  })();

  // نشاط المعلمين
  const teacherActivity = teachers
    .filter((t) => t.approved)
    .map((t) => {
      const myStudents = students.filter((s) => t.classroomIds?.includes(s.classroomId || ""));
      const myPlans = improvementPlans.filter((p) =>
        myStudents.some((s) => s.id === p.studentId)
      );
      const approvedPlans = myPlans.filter((p) => p.status === "approved").length;
      return {
        teacher: t,
        studentsCount: myStudents.length,
        plansApproved: approvedPlans,
      };
    });

  // الطلاب الأكثر حاجة للدعم
  const topStudentsNeedingSupport = students
    .map((s) => {
      const r = testResults
        .filter((res) => res.studentId === s.id && res.isInitial)
        .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime())[0];
      return { student: s, latest: r };
    })
    .filter(({ latest }) => latest && latest.classification === "support")
    .sort((a, b) => (a.latest?.percentage || 0) - (b.latest?.percentage || 0))
    .slice(0, 10);

  // بيانات الرسم البياني للتصنيفات
  const classificationData = [
    { name: "يحتاج دعم", value: byClassification.support, color: CLASSIFICATION_COLORS.support },
    { name: "متوسط", value: byClassification.medium, color: CLASSIFICATION_COLORS.medium },
    { name: "متفوق", value: byClassification.excellent, color: CLASSIFICATION_COLORS.excellent },
  ];

  const handleAddClass = () => {
    if (!newClassName.trim()) {
      toast.error("يرجى إدخال اسم الفصل");
      return;
    }
    addClassroom(newClassName.trim(), newClassGrade);
    toast.success(`تمت إضافة الفصل: ${newClassName}`);
    setNewClassName("");
  };

  const handleSaveSettings = () => {
    updateSettings({
      classificationThresholds: { supportMax, excellentMin },
      placementTestQuestionCount: testCount,
    });
    toast.success("تم حفظ الإعدادات بنجاح");
  };

  return (
    <div className="min-h-screen bg-gradient-sea">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm">لوحة مدير النظام</h1>
              <p className="text-xs text-muted-foreground">{settings.schoolName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.success("سيتم تصدير التقرير قريباً")}>
              <Download className="w-4 h-4 ml-1" />
              تصدير PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground">
              <LogOut className="w-4 h-4 ml-1" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard icon={Users} label="إجمالي الطلاب" value={students.length} color="text-sky-700 bg-sky-50" />
          <StatCard icon={GraduationCap} label="المعلمون" value={teachers.length} color="text-amber-700 bg-amber-50" />
          <StatCard icon={School} label="الفصول" value={classrooms.length} color="text-purple-700 bg-purple-50" />
          <StatCard icon={FileText} label="الاختبارات" value={testResults.length} color="text-emerald-700 bg-emerald-50" />
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 overflow-x-auto">
            <TabsTrigger value="overview" className="text-xs md:text-sm">نظرة عامة</TabsTrigger>
            <TabsTrigger value="skills" className="text-xs md:text-sm">تحليل المهارات</TabsTrigger>
            <TabsTrigger value="classes" className="text-xs md:text-sm">الفصول والفجوة</TabsTrigger>
            <TabsTrigger value="users" className="text-xs md:text-sm">إدارة المستخدمين</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs md:text-sm">الإعدادات</TabsTrigger>
          </TabsList>

          {/* نظرة عامة */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* رسم دائري للتصنيفات */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    توزيع الطلاب حسب التصنيف
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={classificationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                          label={(entry: any) => `${entry.name}: ${entry.value}`}
                        >
                          {classificationData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "0.5rem",
                            direction: "rtl",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {classificationData.map((c) => (
                      <div key={c.name} className="text-center p-2 rounded-lg" style={{ background: `${c.color}15` }}>
                        <div className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</div>
                        <div className="text-xs text-muted-foreground">{c.name}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* متوسط الدرجات حسب المرحلة */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    متوسط الدرجات حسب المرحلة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={avgByStage}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                        <Tooltip
                          contentStyle={{
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "0.5rem",
                            direction: "rtl",
                          }}
                        />
                        <Bar dataKey="avg" name="المتوسط" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* مقارنة القبلي والبعدي + نسبة إنجاز الخطط */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5 text-primary" />
                    مقارنة الاختبار القبلي بالبعدي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-amber-600 mb-1">{prePostComparison.pre}%</div>
                      <div className="text-xs text-muted-foreground">الاختبار القبلي</div>
                      <div className="text-xs text-muted-foreground mt-1">متوسط تحديد المستوى</div>
                    </div>
                    <div className="text-center border-x">
                      <div className={`text-3xl font-bold mb-1 ${
                        prePostComparison.improvement > 0 ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {prePostComparison.improvement > 0 ? "+" : ""}{prePostComparison.improvement}%
                      </div>
                      <div className="text-xs text-muted-foreground">الفارق</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {prePostComparison.improvement > 0 ? "تحسّن" : prePostComparison.improvement < 0 ? "تراجع" : "ثابت"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600 mb-1">{prePostComparison.post}%</div>
                      <div className="text-xs text-muted-foreground">الاختبارات اللاحقة</div>
                      <div className="text-xs text-muted-foreground mt-1">بعد تنفيذ الخطط</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="w-5 h-5 text-accent" />
                    نسبة إنجاز الخطط
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <div className="relative inline-flex items-center justify-center w-32 h-32">
                      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--muted)" strokeWidth="8" />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="var(--accent)"
                          strokeWidth="8"
                          strokeDasharray={`${planCompletion * 2.83} 283`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute">
                        <div className="text-3xl font-bold">{planCompletion}%</div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">من إجمالي مهام جميع الخطط</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* أكثر الطلاب حاجة للدعم */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  الطلاب الأكثر حاجة إلى دعم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الطالب</TableHead>
                        <TableHead>الفصل</TableHead>
                        <TableHead>النسبة</TableHead>
                        <TableHead>المستوى</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topStudentsNeedingSupport.map(({ student, latest }) => {
                        const classroom = classrooms.find((c) => c.id === student.classroomId);
                        return (
                          <TableRow key={student.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                  style={{ background: student.avatarColor }}
                                >
                                  {student.name.charAt(0)}
                                </div>
                                <span className="text-sm font-medium">{student.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{classroom?.name || "—"}</TableCell>
                            <TableCell className="font-mono text-sm">{latest?.percentage}%</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs text-rose-700">
                                {CLASSIFICATION_INFO.support.icon} دعم
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {topStudentsNeedingSupport.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-sm text-muted-foreground">
                            لا يوجد طلاب في فئة الدعم حالياً
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تحليل المهارات */}
          <TabsContent value="skills" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5 text-primary" />
                    متوسطات مهارات الفهم القرائي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={skillAverages} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                        <YAxis dataKey="skill" type="category" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} width={100} />
                        <Tooltip
                          contentStyle={{
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "0.5rem",
                            direction: "rtl",
                          }}
                        />
                        <Bar dataKey="percentage" name="النسبة" fill="var(--primary)" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">أقوى وأضعف المهارات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs text-emerald-700 font-medium">أقوى مهارة</span>
                    </div>
                    <div className="font-bold text-emerald-800">{strongestSkill.skill}</div>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">{strongestSkill.percentage}%</div>
                  </div>
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="w-4 h-4 text-rose-600" />
                      <span className="text-xs text-rose-700 font-medium">أضعف مهارة</span>
                    </div>
                    <div className="font-bold text-rose-800">{weakestSkill.skill}</div>
                    <div className="text-2xl font-bold text-rose-600 mt-1">{weakestSkill.percentage}%</div>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="text-xs text-muted-foreground">توصية:</div>
                    <p className="text-sm mt-1">
                      يُوصى بتركيز خطط التحسين على مهارة <strong>{weakestSkill.skill}</strong> من خلال تدريبات إضافية ودعم مركّز.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* الفصول والفجوة */}
          <TabsContent value="classes" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">الفجوة التعليمية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <div className={`text-4xl font-bold mb-2 ${
                      classGap < 10 ? "text-emerald-600" : classGap < 25 ? "text-amber-600" : "text-rose-600"
                    }`}>
                      {classGap}%
                    </div>
                    <div className="text-sm text-muted-foreground">الفرق بين أعلى وأدنى فصل</div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-emerald-700 font-medium">{topClass?.class || "—"}</div>
                        <div className="text-muted-foreground">{topClass?.avg}%</div>
                      </div>
                      <Arrow left={bottomClass?.class} right={topClass?.class} />
                      <div className="text-left">
                        <div className="text-rose-700 font-medium">{bottomClass?.class || "—"}</div>
                        <div className="text-muted-foreground">{bottomClass?.avg}%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">متوسط الدرجات حسب الفصل</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={avgByClass.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="class" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} angle={-15} height={50} textAnchor="end" />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                        <Tooltip
                          contentStyle={{
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "0.5rem",
                            direction: "rtl",
                          }}
                        />
                        <Bar dataKey="avg" name="المتوسط" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">تفصيل الفصول</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الفصل</TableHead>
                        <TableHead>المرحلة</TableHead>
                        <TableHead>عدد الطلاب</TableHead>
                        <TableHead>المتوسط</TableHead>
                        <TableHead>الترتيب</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {avgByClass.map((c, idx) => (
                        <TableRow key={c.class}>
                          <TableCell className="font-medium">{c.class}</TableCell>
                          <TableCell className="text-sm">{c.grade}</TableCell>
                          <TableCell>{c.count}</TableCell>
                          <TableCell>
                            <span className={`font-mono font-bold ${
                              c.avg >= 80 ? "text-emerald-600" : c.avg >= 50 ? "text-amber-600" : "text-rose-600"
                            }`}>
                              {c.avg}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              #{idx + 1}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* إدارة المستخدمين */}
          <TabsContent value="users" className="space-y-4">
            {/* المعلمون بانتظار الاعتماد */}
            {pendingTeachers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <UserCheck className="w-5 h-5 text-amber-500" />
                    معلمون بانتظار الاعتماد ({pendingTeachers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pendingTeachers.map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg bg-amber-50/50">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ background: t.avatarColor }}
                          >
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{t.name}</div>
                            <div className="text-xs text-muted-foreground">{t.email}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              تاريخ التسجيل: {new Date(t.createdAt).toLocaleDateString("ar-SA")}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              approveTeacher(t.id);
                              toast.success(`تم اعتماد المعلم: ${t.name}`);
                            }}
                          >
                            <CheckCircle2 className="w-4 h-4 ml-1" />
                            اعتماد
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              rejectTeacher(t.id);
                              toast.success(`تم رفض المعلم: ${t.name}`);
                            }}
                          >
                            <UserX className="w-4 h-4 ml-1" />
                            رفض
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* إدارة الفصول */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <School className="w-5 h-5 text-primary" />
                  إدارة الفصول ({classrooms.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Input
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="اسم الفصل الجديد"
                    className="flex-1 min-w-[200px]"
                  />
                  <select
                    value={newClassGrade}
                    onChange={(e) => setNewClassGrade(e.target.value)}
                    className="px-3 py-2 border rounded-lg bg-card text-sm"
                  >
                    {Object.entries(GRADES).map(([key, g]) => (
                      <option key={key} value={key}>{g.label}</option>
                    ))}
                  </select>
                  <Button onClick={handleAddClass}>
                    <Plus className="w-4 h-4 ml-1" />
                    إضافة
                  </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto custom-scroll">
                  {classrooms.map((c) => {
                    const classStudents = students.filter((s) => s.classroomId === c.id);
                    return (
                      <div key={c.id} className="p-3 border rounded-lg bg-card">
                        <div className="font-medium text-sm">{c.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {GRADES[c.gradeKey as keyof typeof GRADES]?.label}
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs">
                          <Users className="w-3 h-3" />
                          <span>{classStudents.length} طالب</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* نشاط المعلمين */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5 text-primary" />
                  نشاط المعلمين المعتمدين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المعلم</TableHead>
                        <TableHead>الفصول</TableHead>
                        <TableHead>عدد الطلاب</TableHead>
                        <TableHead>الخطط المعتمدة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teacherActivity.map(({ teacher, studentsCount, plansApproved }) => (
                        <TableRow key={teacher.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{ background: teacher.avatarColor }}
                              >
                                {teacher.name.charAt(0)}
                              </div>
                              <span className="text-sm font-medium">{teacher.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {teacher.classroomIds?.length || 0} فصول
                          </TableCell>
                          <TableCell className="text-sm">{studentsCount}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {plansApproved} معتمدة
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* الإعدادات */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="w-5 h-5 text-primary" />
                  إعدادات التصنيف والاختبارات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-w-xl">
                <div>
                  <Label className="text-sm font-medium">الحد الأعلى لمستوى "يحتاج دعم" (%)</Label>
                  <Input
                    type="number"
                    value={supportMax}
                    onChange={(e) => setSupportMax(Number(e.target.value))}
                    min={0}
                    max={100}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    الطلاب الذين يحصلون على أقل من هذه النسبة يصنفون في فئة "يحتاج دعم"
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">الحد الأدنى لمستوى "متفوق" (%)</Label>
                  <Input
                    type="number"
                    value={excellentMin}
                    onChange={(e) => setExcellentMin(Number(e.target.value))}
                    min={0}
                    max={100}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    الطلاب الذين يحصلون على هذه النسبة أو أعلى يصنفون في فئة "متفوق"
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">عدد أسئلة اختبار تحديد المستوى</Label>
                  <Input
                    type="number"
                    value={testCount}
                    onChange={(e) => setTestCount(Number(e.target.value))}
                    min={5}
                    max={50}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button onClick={handleSaveSettings}>
                    حفظ الإعدادات
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSupportMax(DEFAULT_SETTINGS.classificationThresholds.supportMax);
                      setExcellentMin(DEFAULT_SETTINGS.classificationThresholds.excellentMin);
                      setTestCount(DEFAULT_SETTINGS.placementTestQuestionCount);
                      toast.success("تمت استعادة الإعدادات الافتراضية");
                    }}
                  >
                    استعادة الافتراضي
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="font-bold text-lg">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Arrow({ left, right }: { left?: string; right?: string }) {
  return (
    <div className="flex-1 mx-2 text-center">
      <div className="text-xs text-muted-foreground">
        {left && right ? `${left} ← → ${right}` : ""}
      </div>
    </div>
  );
}
