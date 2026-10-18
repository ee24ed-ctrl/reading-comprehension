"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, BookOpen, GraduationCap, ShieldCheck, Mail, Lock, User as UserIcon, Hash, RotateCcw } from "lucide-react";
import { GRADES, STAGES, STAGE_ORDER, DEFAULT_SETTINGS } from "@/lib/stages";
import type { UserRole, GradeKey } from "@/lib/types";
import { toast } from "sonner";

export function AuthScreen({ mode }: { mode: "login" | "register" }) {
  const setScreen = useAppStore((s) => s.setScreen);
  const login = useAppStore((s) => s.login);
  const register = useAppStore((s) => s.register);
  const classrooms = useAppStore((s) => s.classrooms);

  const [role, setRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [gradeKey, setGradeKey] = useState<GradeKey>("g1");
  const [classroomId, setClassroomId] = useState<string>("");
  const [academicNumber, setAcademicNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      const result = login(email, password, role);
      if (!result.success) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
      }
    } else {
      if (!name || !email || !password) {
        toast.error("يرجى تعبئة جميع الحقول المطلوبة");
        return;
      }
      const result = register({
        role,
        name,
        email,
        password,
        gradeKey: role === "student" ? gradeKey : undefined,
        classroomId: role === "student" ? classroomId : undefined,
        academicNumber: role === "student" ? academicNumber : undefined,
      });
      if (!result.success) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
        if (role === "student") {
          // الطالب سيتم توجيهه تلقائياً للاختبار
        } else {
          setScreen("home");
        }
      }
    }
  };

  // تعبئة بيانات تجريبية سريعة
  const fillDemo = (demoRole: UserRole) => {
    if (demoRole === "student") {
      setEmail("student1@saahil.edu");
      setPassword("demo123");
      setRole("student");
    } else if (demoRole === "teacher") {
      setEmail("teacher1@saahil.edu");
      setPassword("demo123");
      setRole("teacher");
    } else {
      setEmail("admin@saahil.edu");
      setPassword("admin123");
      setRole("admin");
    }
  };

  const filteredClassrooms = classrooms.filter((c) => c.gradeKey === gradeKey);

  const roleOptions: { value: UserRole; label: string; icon: any; color: string }[] = [
    { value: "student", label: "طالب", icon: BookOpen, color: "from-sky-500 to-teal-500" },
    { value: "teacher", label: "معلم", icon: GraduationCap, color: "from-amber-500 to-orange-500" },
    { value: "admin", label: "مدير", icon: ShieldCheck, color: "from-slate-600 to-slate-800" },
  ];

  return (
    <div className="min-h-screen bg-gradient-sea flex flex-col">
      {/* الرأس */}
      <header className="px-6 py-6">
        <button
          onClick={() => setScreen("home")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للرئيسية
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4 shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              منصة الفهم القرائي — {DEFAULT_SETTINGS.schoolName}
            </p>
          </div>

          <Card className="shadow-xl border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-center">اختر نوع الحساب</CardTitle>
            </CardHeader>
            <CardContent>
              {/* اختيار الدور */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {roleOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = role === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setRole(opt.value)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        isActive
                          ? `border-primary bg-gradient-to-br ${opt.color} text-white shadow-md`
                          : "border-border bg-card hover:border-primary/30"
                      }`}
                      type="button"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      الاسم الكامل <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="مثال: محمد العتيبي"
                        className="pr-9"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    البريد الإلكتروني <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@saahil.edu"
                      className="pr-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    كلمة المرور <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-9"
                      required
                    />
                  </div>
                </div>

                {/* حقول خاصة بالطالب عند التسجيل */}
                {mode === "register" && role === "student" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">المرحلة الدراسية</Label>
                      <Select
                        value={STAGES[GRADES[gradeKey].stage].key}
                        onValueChange={(stage) => {
                          // عند تغيير المرحلة، اختر أول صف منها
                          const firstGrade = STAGES[stage as keyof typeof STAGES].grades[0];
                          setGradeKey(firstGrade);
                          setClassroomId("");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STAGE_ORDER.map((stageKey) => (
                            <SelectItem key={stageKey} value={stageKey}>
                              {STAGES[stageKey].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">الصف</Label>
                      <Select value={gradeKey} onValueChange={(v) => { setGradeKey(v as GradeKey); setClassroomId(""); }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STAGES[GRADES[gradeKey].stage].grades.map((g) => (
                            <SelectItem key={g} value={g}>
                              {GRADES[g].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">الفصل</Label>
                      <Select value={classroomId} onValueChange={setClassroomId}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الفصل" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredClassrooms.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {filteredClassrooms.length === 0 && (
                        <p className="text-xs text-muted-foreground">لا توجد فصول لهذا الصف بعد</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="academicNumber" className="text-sm font-medium">
                        الرقم الأكاديمي / رمز المدرسة
                      </Label>
                      <div className="relative">
                        <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="academicNumber"
                          value={academicNumber}
                          onChange={(e) => setAcademicNumber(e.target.value)}
                          placeholder="2025-0001"
                          className="pr-9"
                        />
                      </div>
                    </div>
                  </>
                )}

                <Button type="submit" className="w-full h-11 text-base" size="lg">
                  {mode === "login" ? "دخول" : "إنشاء الحساب"}
                </Button>
              </form>

              {/* تبديل بين الدخول والتسجيل */}
              <div className="mt-6 text-center text-sm">
                {mode === "login" ? (
                  <>
                    ليس لديك حساب؟{" "}
                    <button
                      onClick={() => setScreen("auth_register")}
                      className="text-primary hover:underline font-medium"
                    >
                      أنشئ حساباً جديداً
                    </button>
                  </>
                ) : (
                  <>
                    لديك حساب بالفعل؟{" "}
                    <button
                      onClick={() => setScreen("auth_login")}
                      className="text-primary hover:underline font-medium"
                    >
                      سجّل دخولك
                    </button>
                  </>
                )}
              </div>

              {/* روابط الدخول السريع التجريبي */}
              {mode === "login" && (
                <div className="mt-6 pt-6 border-t border-border/50">
                  <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                    <RotateCcw className="w-3 h-3" />
                    <span>دخول سريع تجريبي:</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fillDemo("student")}
                      className="text-xs"
                    >
                      طالب
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fillDemo("teacher")}
                      className="text-xs"
                    >
                      معلم
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fillDemo("admin")}
                      className="text-xs"
                    >
                      أدمن
                    </Button>
                  </div>
                </div>
              )}

              {mode === "register" && role === "teacher" && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  ملاحظة: سيتم اعتماد حسابك من قبل مدير النظام قبل أن تتمكن من الدخول.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
