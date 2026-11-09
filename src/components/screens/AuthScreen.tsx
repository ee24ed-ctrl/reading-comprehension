"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Mail,
  Lock,
  User as UserIcon,
  Hash,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  School,
  LogIn,
} from "lucide-react";
import { GRADES, STAGES, STAGE_ORDER, DEFAULT_SETTINGS } from "@/lib/stages";
import type { UserRole, GradeKey, StageKey } from "@/lib/types";
import { toast } from "sonner";
import { ASSETS } from "@/lib/assets";

export function AuthScreen({ mode }: { mode: "login" | "register" }) {
  const setScreen = useAppStore((s) => s.setScreen);
  const login = useAppStore((s) => s.login);
  const register = useAppStore((s) => s.register);
  const classrooms = useAppStore((s) => s.classrooms);

  const [role, setRole] = useState<UserRole>("student");
  const [identifier, setIdentifier] = useState(""); // Email or Academic Number
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedStage, setSelectedStage] = useState<StageKey>("primary_lower");
  const [gradeKey, setGradeKey] = useState<GradeKey>("g1");
  const [classroomId, setClassroomId] = useState<string>("");
  const [academicNumber, setAcademicNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      if (!identifier.trim() || !password) {
        toast.error("يرجى إدخال البريد الإلكتروني أو الرقم الأكاديمي وكلمة المرور");
        return;
      }
      const result = login(identifier, password, role);
      if (!result.success) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
      }
    } else {
      if (!name || !identifier || !password) {
        toast.error("يرجى تعبئة جميع الحقول المطلوبة");
        return;
      }
      const result = register({
        role,
        name,
        email: identifier,
        password,
        gradeKey: role === "student" ? gradeKey : undefined,
        classroomId: role === "student" ? classroomId : undefined,
        academicNumber: role === "student" ? academicNumber : undefined,
      });
      if (!result.success) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
        if (role !== "student") {
          setScreen("home");
        }
      }
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
      <header className="px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => setScreen("home")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للرئيسية
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-3">
              <img
                src={ASSETS.schoolLogo}
                onError={(e) => { e.currentTarget.src = ASSETS.fallbackLogo; }}
                alt="شعار مدرسة الساحل الأهلية (بنين)"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
              {mode === "login" ? "تسجيل الدخول لمنصة الفهم القرائي" : "إنشاء حساب جديد"}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              مدرسة الساحل الأهلية (بنين) — المنهج السعودي الحديث 1448 هـ
            </p>
          </div>

          <Card className="shadow-2xl border-border/60 backdrop-blur-sm bg-card/95">
            <CardHeader className="pb-3 text-center border-b border-border/40">
              <CardTitle className="text-base font-bold">
                {mode === "login" ? "اختر طريقة الدخول ونوع الحساب" : "بيانات الحساب الجديد"}
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4">
              {/* اختيار نوع الحساب */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {roleOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = role === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setRole(opt.value)}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                        isActive
                          ? `border-primary bg-gradient-to-br ${opt.color} text-white shadow-md font-bold scale-[1.02]`
                          : "border-border bg-card/60 hover:border-primary/40 text-foreground"
                      }`}
                      type="button"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-semibold">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* إذا كان في وضع الدخول */}
              {mode === "login" ? (
                <div className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="identifier" className="text-xs font-semibold">
                        البريد الإلكتروني أو الرقم الأكاديمي <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="identifier"
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder={role === "student" ? "student1@saahil.edu أو 2025-0001" : "name@saahil.edu"}
                          className="pr-9 h-10 text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-xs font-semibold">
                          كلمة المرور <span className="text-destructive">*</span>
                        </Label>
                      </div>
                      <div className="relative">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pr-9 h-10 text-sm"
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-11 text-sm font-bold shadow-md" size="lg">
                      <LogIn className="w-4 h-4 ml-1.5" />
                      تسجيل الدخول إلى المنصة
                    </Button>
                  </form>

                  {/* دليل الحسابات للتجربة (تعبئة الحقول فقط للتحقق من كلمة السر) */}
                  <div className="p-3.5 bg-muted/40 rounded-xl border border-border/60 text-xs space-y-2.5">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        بيانات الحسابات المسجلة للتجربة:
                      </span>
                      <span className="text-[10px] text-muted-foreground">(انقر تعبئة لإدراج البيانات)</span>
                    </div>

                    <div className="space-y-1.5 text-muted-foreground text-[11px]">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/50">
                        <span>🎓 <strong className="text-foreground">طالب:</strong> <code className="text-primary font-mono font-bold">student1@saahil.edu</code> (السر: <code className="font-mono">demo123</code>)</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-[11px] px-2.5 text-primary border-primary/30 hover:bg-primary/10 font-bold"
                          onClick={() => {
                            setRole("student");
                            setIdentifier("student1@saahil.edu");
                            setPassword("demo123");
                          }}
                        >
                          تعبئة الحقول
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/50">
                        <span>👨‍🏫 <strong className="text-foreground">معلم:</strong> <code className="text-primary font-mono font-bold">islam@saahil.edu</code> (السر: <code className="font-mono">demo123</code>)</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-[11px] px-2.5 text-primary border-primary/30 hover:bg-primary/10 font-bold"
                          onClick={() => {
                            setRole("teacher");
                            setIdentifier("islam@saahil.edu");
                            setPassword("demo123");
                          }}
                        >
                          تعبئة الحقول
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/50">
                        <span>🛡️ <strong className="text-foreground">مدير:</strong> <code className="text-primary font-mono font-bold">admin@saahil.edu</code> (السر: <code className="font-mono">admin123</code>)</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-[11px] px-2.5 text-primary border-primary/30 hover:bg-primary/10 font-bold"
                          onClick={() => {
                            setRole("admin");
                            setIdentifier("admin@saahil.edu");
                            setPassword("admin123");
                          }}
                        >
                          تعبئة الحقول
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* وضع إنشاء الحساب (التسجيل لجميع المراحل) */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-semibold">
                      الاسم الكامل <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="مثال: فهد بن سالم العتيبي"
                        className="pr-9 h-10 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold">
                      البريد الإلكتروني <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="name@saahil.edu"
                        className="pr-9 h-10 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-semibold">
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
                        className="pr-9 h-10 text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* حقول خاصة بالطالب */}
                  {role === "student" && (
                    <div className="p-3 bg-muted/40 rounded-xl border border-border/60 space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">المرحلة الدراسية</Label>
                        <Select
                          value={selectedStage}
                          onValueChange={(stage) => {
                            const st = stage as StageKey;
                            setSelectedStage(st);
                            const firstGrade = STAGES[st].grades[0];
                            setGradeKey(firstGrade);
                            setClassroomId("");
                          }}
                        >
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STAGE_ORDER.map((stageKey) => (
                              <SelectItem key={stageKey} value={stageKey}>
                                {STAGES[stageKey].label} ({STAGES[stageKey].shortLabel})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">الصف</Label>
                          <Select
                            value={gradeKey}
                            onValueChange={(v) => {
                              setGradeKey(v as GradeKey);
                              setClassroomId("");
                            }}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STAGES[selectedStage].grades.map((g) => (
                                <SelectItem key={g} value={g}>
                                  {GRADES[g].label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">الفصل</Label>
                          <Select value={classroomId} onValueChange={setClassroomId}>
                            <SelectTrigger className="h-9 text-xs">
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
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="academicNumber" className="text-xs font-semibold">
                          الرقم الأكاديمي / رقم القيد بالمدرسة
                        </Label>
                        <div className="relative">
                          <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="academicNumber"
                            value={academicNumber}
                            onChange={(e) => setAcademicNumber(e.target.value)}
                            placeholder="مثال: 2025-0100"
                            className="pr-9 h-9 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full h-11 text-sm font-bold shadow-md" size="lg">
                    إنشاء الحساب وبدء الاختبار التشخيصي
                  </Button>
                </form>
              )}

              {/* تبديل بين الدخول والتسجيل */}
              <div className="mt-5 text-center text-xs">
                {mode === "login" ? (
                  <>
                    ليس لديك حساب مسجل؟{" "}
                    <button
                      onClick={() => setScreen("auth_register")}
                      className="text-primary hover:underline font-bold"
                    >
                      أنشئ حساباً جديداً لجميع المراحل
                    </button>
                  </>
                ) : (
                  <>
                    لديك حساب بالفعل؟{" "}
                    <button
                      onClick={() => setScreen("auth_login")}
                      className="text-primary hover:underline font-bold"
                    >
                      تسجيل الدخول
                    </button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
