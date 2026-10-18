"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  FileQuestion,
  ClipboardList,
  LogOut,
  BookOpen,
  Plus,
  Search,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  MessageSquare,
  Save,
  GraduationCap,
} from "lucide-react";
import {
  CLASSIFICATION_INFO,
  SKILL_LABELS,
  QUESTION_TYPE_LABELS,
  STAGES,
  GRADES,
  STAGE_ORDER,
} from "@/lib/stages";
import type { Question, QuestionType, SkillKey, StageKey } from "@/lib/types";
import { toast } from "sonner";

export function TeacherDashboard() {
  const currentUser = useAppStore((s) => s.currentUser);
  const setScreen = useAppStore((s) => s.setScreen);
  const logout = useAppStore((s) => s.logout);
  const classrooms = useAppStore((s) => s.classrooms);
  const users = useAppStore((s) => s.users);
  const testResults = useAppStore((s) => s.testResults);
  const improvementPlans = useAppStore((s) => s.improvementPlans);
  const customQuestions = useAppStore((s) => s.customQuestions);
  const addQuestion = useAppStore((s) => s.addQuestion);
  const approvePlan = useAppStore((s) => s.approvePlan);
  const updatePlan = useAppStore((s) => s.updatePlan);
  const settings = useAppStore((s) => s.settings);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  if (!currentUser) return null;

  // فصول المعلم
  const myClassrooms = classrooms.filter((c) =>
    currentUser.classroomIds?.includes(c.id)
  );

  // طلاب فصول المعلم
  const myStudents = users.filter(
    (u) => u.role === "student" && u.classroomId && currentUser.classroomIds?.includes(u.classroomId)
  );

  // إضافة الطلاب والتصنيفات
  const studentsWithMeta = myStudents.map((s) => {
    const results = testResults
      .filter((r) => r.studentId === s.id)
      .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
    const latest = results[0];
    const plan = improvementPlans.find((p) => p.studentId === s.id);
    const classroom = classrooms.find((c) => c.id === s.classroomId);
    return { student: s, latest, plan, classroom, resultsCount: results.length };
  });

  const filteredStudents = studentsWithMeta.filter(({ student, latest, classroom }) => {
    if (filterClass !== "all" && student.classroomId !== filterClass) return false;
    if (filterLevel !== "all" && latest?.classification !== filterLevel) return false;
    if (searchTerm && !student.name.includes(searchTerm) && !student.email.includes(searchTerm)) return false;
    return true;
  });

  // إحصائيات المعلم
  const totalStudents = myStudents.length;
  const totalSupport = studentsWithMeta.filter((s) => s.latest?.classification === "support").length;
  const totalMedium = studentsWithMeta.filter((s) => s.latest?.classification === "medium").length;
  const totalExcellent = studentsWithMeta.filter((s) => s.latest?.classification === "excellent").length;
  const pendingPlans = studentsWithMeta.filter((s) => s.plan?.status === "draft").length;

  // تنبيهات
  const alerts = studentsWithMeta
    .filter(({ latest, plan }) => {
      if (!latest) return false;
      return latest.classification === "support" || plan?.status === "draft";
    })
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-sea">
      {/* الرأس */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              { }
              <img
                src="/school-logo.png"
                alt="شعار مدرسة الساحل الأهلية (بنين)"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-bold text-sm">لوحة المعلم</h1>
              <p className="text-xs text-muted-foreground">{currentUser.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground">
            <LogOut className="w-4 h-4 ml-1" />
            خروج
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* إحصائيات */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard icon={Users} label="إجمالي الطلاب" value={totalStudents.toString()} color="text-sky-700 bg-sky-50" />
          <StatCard icon={AlertTriangle} label="يحتاجون دعماً" value={totalSupport.toString()} color="text-rose-700 bg-rose-50" />
          <StatCard icon={TrendingUp} label="متوسط" value={totalMedium.toString()} color="text-amber-700 bg-amber-50" />
          <StatCard icon={CheckCircle2} label="متفوقون" value={totalExcellent.toString()} color="text-emerald-700 bg-emerald-50" />
        </div>

        <Tabs defaultValue="students" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="students" className="text-xs md:text-sm">طلابي</TabsTrigger>
            <TabsTrigger value="plans" className="text-xs md:text-sm">خطط التحسين</TabsTrigger>
            <TabsTrigger value="questions" className="text-xs md:text-sm">الأسئلة</TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs md:text-sm">
              التنبيهات
              {alerts.length > 0 && (
                <Badge variant="destructive" className="text-xs mr-1 h-4 px-1.5">
                  {alerts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* قائمة الطلاب */}
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-primary" />
                    طلاب فصولي
                  </CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="بحث..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-9 w-40 text-sm"
                      />
                    </div>
                    <Select value={filterClass} onValueChange={setFilterClass}>
                      <SelectTrigger className="w-40 text-sm">
                        <SelectValue placeholder="كل الفصول" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الفصول</SelectItem>
                        {myClassrooms.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterLevel} onValueChange={setFilterLevel}>
                      <SelectTrigger className="w-40 text-sm">
                        <SelectValue placeholder="كل المستويات" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل المستويات</SelectItem>
                        <SelectItem value="support">يحتاج دعم</SelectItem>
                        <SelectItem value="medium">متوسط</SelectItem>
                        <SelectItem value="excellent">متفوق</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الطالب</TableHead>
                        <TableHead>الفصل</TableHead>
                        <TableHead>آخر نتيجة</TableHead>
                        <TableHead>المستوى</TableHead>
                        <TableHead>الخطة</TableHead>
                        <TableHead>إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map(({ student, latest, plan, classroom }) => (
                        <TableRow key={student.id} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                style={{ background: student.avatarColor }}
                              >
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium text-sm">{student.name}</div>
                                <div className="text-xs text-muted-foreground">{student.academicNumber}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{classroom?.name || "—"}</TableCell>
                          <TableCell>
                            {latest ? (
                              <span className="font-mono text-sm">{latest.percentage}%</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">لم يختبر بعد</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {latest ? (
                              <Badge
                                variant="outline"
                                className={`text-xs ${CLASSIFICATION_INFO[latest.classification].color}`}
                              >
                                {CLASSIFICATION_INFO[latest.classification].icon} {CLASSIFICATION_INFO[latest.classification].shortLabel}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {plan ? (
                              <Badge variant="outline" className="text-xs">
                                {plan.status === "approved" ? "معتمدة" : plan.status === "in_progress" ? "قيد التنفيذ" : "مسودة"}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedStudentId(student.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredStudents.length === 0 && (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      لا يوجد طلاب مطابقون للبحث
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* خطط التحسين */}
          <TabsContent value="plans" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  مراجعة واعتماد خطط التحسين
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto custom-scroll">
                {studentsWithMeta
                  .filter(({ plan }) => plan)
                  .map(({ student, plan, latest }) => {
                    if (!plan) return null;
                    const completedTasks = plan.weeklySchedule.filter((t) => t.completed).length;
                    return (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        student={student}
                        latest={latest}
                        completedTasks={completedTasks}
                        onApprove={() => {
                          approvePlan(plan.id);
                          toast.success(`تم اعتماد خطة ${student.name}`);
                        }}
                        onUpdateNotes={(notes) => {
                          updatePlan(plan.id, { teacherNotes: notes });
                          toast.success("تم تحديث الملاحظات");
                        }}
                      />
                    );
                  })}
                {studentsWithMeta.filter(({ plan }) => plan).length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    لا توجد خطط متاحة للمراجعة
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* إدارة الأسئلة */}
          <TabsContent value="questions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileQuestion className="w-5 h-5 text-primary" />
                    بنك الأسئلة ({customQuestions.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 ml-1" />
                      استيراد من Excel
                    </Button>
                    <Button size="sm" onClick={() => setShowAddQuestion(true)}>
                      <Plus className="w-4 h-4 ml-1" />
                      إضافة سؤال
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {customQuestions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileQuestion className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-sm mb-2">لم تضف أي أسئلة مخصصة بعد</p>
                    <p className="text-xs">النظام يستخدم الآن 80+ سؤالاً افتراضياً موزعة على المراحل الأربع</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scroll">
                    {customQuestions.map((q) => (
                      <div key={q.id} className="p-3 border rounded-lg bg-card">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-medium text-sm">{q.questionText}</span>
                          <div className="flex gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {QUESTION_TYPE_LABELS[q.type]}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {SKILL_LABELS[q.skill]}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{q.passage}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* التنبيهات */}
          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  التنبيهات والمتابعة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {alerts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                    <p className="text-sm">لا توجد تنبيهات حالياً. جميع الطلاب يسيرون على المسار الصحيح.</p>
                  </div>
                ) : (
                  alerts.map(({ student, latest, plan }) => (
                    <div
                      key={student.id}
                      className={`p-3 rounded-lg border ${
                        latest?.classification === "support"
                          ? "border-rose-200 bg-rose-50"
                          : "border-amber-200 bg-amber-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          latest?.classification === "support" ? "text-rose-600" : "text-amber-600"
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {student.name} {latest?.classification === "support" && "يحتاج إلى دعم"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {latest && (
                              <>النتيجة: {latest.percentage}% • </>
                            )}
                            {plan?.status === "draft" && "الخطة بانتظار الاعتماد"}
                            {plan?.status === "in_progress" && "الخطة قيد التنفيذ"}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedStudentId(student.id)}
                        >
                          متابعة
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* نافذة إضافة سؤال */}
      <AddQuestionDialog
        open={showAddQuestion}
        onOpenChange={setShowAddQuestion}
        onAdd={(q) => {
          addQuestion(q);
          toast.success("تمت إضافة السؤال بنجاح");
          setShowAddQuestion(false);
        }}
      />

      {/* نافذة عرض الطالب */}
      <StudentDetailDialog
        studentId={selectedStudentId}
        onClose={() => setSelectedStudentId(null)}
      />
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

function PlanCard({ plan, student, latest, completedTasks, onApprove, onUpdateNotes }: any) {
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(plan.teacherNotes);

  return (
    <div className="border rounded-xl p-4 bg-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: student.avatarColor }}
          >
            {student.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-sm">{student.name}</div>
            {latest && (
              <div className="text-xs text-muted-foreground">
                {latest.percentage}% • {CLASSIFICATION_INFO[latest.classification].label}
              </div>
            )}
          </div>
        </div>
        <Badge variant="outline" className={`text-xs ${CLASSIFICATION_INFO[plan.classification].color}`}>
          {CLASSIFICATION_INFO[plan.classification].icon} {CLASSIFICATION_INFO[plan.classification].shortLabel}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <div className="bg-muted/30 rounded p-2 text-center">
          <div className="text-muted-foreground">المهام</div>
          <div className="font-bold">{plan.weeklySchedule.length}</div>
        </div>
        <div className="bg-muted/30 rounded p-2 text-center">
          <div className="text-muted-foreground">مكتملة</div>
          <div className="font-bold text-emerald-600">{completedTasks}</div>
        </div>
        <div className="bg-muted/30 rounded p-2 text-center">
          <div className="text-muted-foreground">التقدم</div>
          <div className="font-bold">{Math.round((completedTasks / plan.weeklySchedule.length) * 100)}%</div>
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            ملاحظات المعلم
          </span>
          <button
            onClick={() => setEditing(!editing)}
            className="text-xs text-primary hover:underline"
          >
            {editing ? "إلغاء" : "تعديل"}
          </button>
        </div>
        {editing ? (
          <div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-sm min-h-[80px] bg-card"
            />
            <Button
              size="sm"
              className="mt-2"
              onClick={() => {
                onUpdateNotes(notes);
                setEditing(false);
              }}
            >
              <Save className="w-3 h-3 ml-1" />
              حفظ
            </Button>
          </div>
        ) : (
          <p className="text-xs leading-relaxed">{plan.teacherNotes}</p>
        )}
      </div>

      {plan.status === "draft" && (
        <Button size="sm" className="w-full" onClick={onApprove}>
          <CheckCircle2 className="w-4 h-4 ml-1" />
          اعتماد الخطة
        </Button>
      )}
      {plan.status === "approved" && (
        <div className="text-xs text-center text-emerald-700 font-medium">
          ✓ الخطة معتمدة وقيد التنفيذ
        </div>
      )}
    </div>
  );
}

function AddQuestionDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (q: Omit<Question, "id">) => void;
}) {
  const [stage, setStage] = useState<StageKey>("primary_lower");
  const [type, setType] = useState<QuestionType>("mcq");
  const [skill, setSkill] = useState<SkillKey>("main_idea");
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(1);
  const [passage, setPassage] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");

  const handleSubmit = () => {
    if (!passage || !questionText || !correctAnswer) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }
    onAdd({
      stage,
      type,
      skill,
      difficulty,
      passage,
      questionText,
      options: options.filter((o) => o.trim()),
      correctAnswer,
    });
    // إعادة تعيين
    setPassage("");
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إضافة سؤال جديد</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">المرحلة</Label>
              <Select value={stage} onValueChange={(v) => setStage(v as StageKey)}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>{STAGES[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">نوع السؤال</Label>
              <Select value={type} onValueChange={(v) => setType(v as QuestionType)}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(QUESTION_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">المهارة</Label>
              <Select value={skill} onValueChange={(v) => setSkill(v as SkillKey)}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SKILL_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">مستوى الصعوبة</Label>
            <Select value={String(difficulty)} onValueChange={(v) => setDifficulty(Number(v) as 1 | 2 | 3)}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">سهل</SelectItem>
                <SelectItem value="2">متوسط</SelectItem>
                <SelectItem value="3">صعب</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">نص القطعة *</Label>
            <Textarea
              value={passage}
              onChange={(e) => setPassage(e.target.value)}
              className="min-h-[80px]"
              placeholder="اكتب نص القطعة هنا..."
            />
          </div>

          <div>
            <Label className="text-xs">نص السؤال *</Label>
            <Input
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="مثال: ما الفكرة الرئيسية للقطعة؟"
            />
          </div>

          {type !== "ordering" && (
            <div>
              <Label className="text-xs">الخيارات</Label>
              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold w-6">{String.fromCharCode(1571 + idx)}</span>
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[idx] = e.target.value;
                        setOptions(newOpts);
                      }}
                      className="text-sm"
                      placeholder={`الخيار ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label className="text-xs">الإجابة الصحيحة *</Label>
            <Input
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="اكتب الإجابة الصحيحة بالضبط كما وردت في الخيارات"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
            <Button onClick={handleSubmit}>إضافة السؤال</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StudentDetailDialog({ studentId, onClose }: { studentId: string | null; onClose: () => void }) {
  const users = useAppStore((s) => s.users);
  const testResults = useAppStore((s) => s.testResults);
  const improvementPlans = useAppStore((s) => s.improvementPlans);
  const classrooms = useAppStore((s) => s.classrooms);

  if (!studentId) return null;
  const student = users.find((u) => u.id === studentId);
  if (!student) return null;

  const results = testResults
    .filter((r) => r.studentId === studentId)
    .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
  const latest = results[0];
  const plan = improvementPlans.find((p) => p.studentId === studentId);
  const classroom = classrooms.find((c) => c.id === student.classroomId);

  return (
    <Dialog open={!!studentId} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تفاصيل الطالب</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* بطاقة الطالب */}
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
              style={{ background: student.avatarColor }}
            >
              {student.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="font-bold">{student.name}</div>
              <div className="text-sm text-muted-foreground">{student.email}</div>
              <div className="flex gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {classroom?.name || "—"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {student.academicNumber}
                </Badge>
              </div>
            </div>
          </div>

          {/* آخر نتيجة */}
          {latest && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">آخر نتيجة اختبار</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-3xl font-bold text-primary">{latest.percentage}%</div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${CLASSIFICATION_INFO[latest.classification].color}`}
                  >
                    {CLASSIFICATION_INFO[latest.classification].icon} {CLASSIFICATION_INFO[latest.classification].label}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {Object.entries(latest.skillScores).map(([skill, scores]: any) => (
                    <div key={skill} className="flex items-center justify-between text-sm">
                      <span>{SKILL_ICONS[skill as keyof typeof SKILL_ICONS]} {SKILL_LABELS[skill as keyof typeof SKILL_LABELS]}</span>
                      <span className="font-mono">{scores.correct}/{scores.total}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* الخطة */}
          {plan && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">خطة التحسين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground mb-2">حالة الخطة:</div>
                <Badge variant="outline" className="text-xs mb-3">
                  {plan.status === "approved" ? "معتمدة" : plan.status === "in_progress" ? "قيد التنفيذ" : "مسودة"}
                </Badge>
                <div className="text-xs leading-relaxed bg-muted/30 p-3 rounded">
                  {plan.teacherNotes}
                </div>
              </CardContent>
            </Card>
          )}

          {/* تاريخ الاختبارات */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">تاريخ الاختبارات ({results.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.map((r, idx) => (
                  <div key={r.id} className="flex items-center justify-between text-sm p-2 border rounded">
                    <div>
                      <span className="font-medium">{idx === 0 ? "الأحدث" : `اختبار #${results.length - idx}`}</span>
                      <span className="text-xs text-muted-foreground mr-2">
                        {new Date(r.takenAt).toLocaleDateString("ar-SA")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{r.percentage}%</span>
                      <Badge variant="outline" className="text-xs">
                        {CLASSIFICATION_INFO[r.classification].shortLabel}
                      </Badge>
                    </div>
                  </div>
                ))}
                {results.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">لا توجد اختبارات سابقة</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
