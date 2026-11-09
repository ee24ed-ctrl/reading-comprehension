import type { StageInfo, GradeInfo, StageKey, GradeKey, ClassificationLevel, SkillKey, QuestionType } from "./types";

// تعريف المراحل الدراسية
export const STAGES: Record<StageKey, StageInfo> = {
  primary_lower: {
    key: "primary_lower",
    label: "الصفوف الأولية",
    shortLabel: "أولية",
    grades: ["g1", "g2", "g3"],
    notes: "نصوص قصيرة جداً، صور مصاحبة، خطوط كبيرة، خيار قراءة النص صوتياً، واجهة ملونة مبسطة",
    playful: true,
  },
  primary_upper: {
    key: "primary_upper",
    label: "الصفوف العليا",
    shortLabel: "عليا",
    grades: ["g4", "g5", "g6"],
    notes: "نصوص متوسطة، أسئلة استنتاج مبسطة ومفردات",
  },
  intermediate: {
    key: "intermediate",
    label: "المرحلة المتوسطة",
    shortLabel: "متوسط",
    grades: ["m1", "m2", "m3"],
    notes: "نصوص معلوماتية وأدبية، تحليل واستنتاج",
  },
  secondary: {
    key: "secondary",
    label: "المرحلة الثانوية",
    shortLabel: "ثانوي",
    grades: ["s1", "s2", "s3"],
    notes: "القدرات اللفظية: استيعاب المقروء، التناظر اللفظي، إكمال الجمل، الخطأ السياقي، المفردة الشاذة",
  },
};

export const STAGE_ORDER: StageKey[] = ["primary_lower", "primary_upper", "intermediate", "secondary"];

// تعريف الصفوف
export const GRADES: Record<GradeKey, GradeInfo> = {
  g1: { key: "g1", label: "الأول الابتدائي", stage: "primary_lower" },
  g2: { key: "g2", label: "الثاني الابتدائي", stage: "primary_lower" },
  g3: { key: "g3", label: "الثالث الابتدائي", stage: "primary_lower" },
  g4: { key: "g4", label: "الرابع الابتدائي", stage: "primary_upper" },
  g5: { key: "g5", label: "الخامس الابتدائي", stage: "primary_upper" },
  g6: { key: "g6", label: "السادس الابتدائي", stage: "primary_upper" },
  m1: { key: "m1", label: "الأول المتوسط", stage: "intermediate" },
  m2: { key: "m2", label: "الثاني المتوسط", stage: "intermediate" },
  m3: { key: "m3", label: "الثالث المتوسط", stage: "intermediate" },
  s1: { key: "s1", label: "الأول الثانوي", stage: "secondary" },
  s2: { key: "s2", label: "الثاني الثانوي", stage: "secondary" },
  s3: { key: "s3", label: "الثالث الثانوي", stage: "secondary" },
};

// ترجمة المهارات
export const SKILL_LABELS: Record<SkillKey, string> = {
  main_idea: "الفكرة الرئيسية",
  inference: "الاستنتاج",
  vocabulary: "المفردات",
  details: "التفاصيل",
  sequencing: "الترتيب",
};

export const SKILL_ICONS: Record<SkillKey, string> = {
  main_idea: "🎯",
  inference: "💡",
  vocabulary: "📚",
  details: "🔍",
  sequencing: "📊",
};

// ترجمة أنواع الأسئلة
export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mcq: "اختيار من متعدد",
  true_false: "صح وخطأ",
  ordering: "ترتيب أحداث",
  inference: "استنتاج",
  vocab_context: "معنى مفردة من السياق",
  main_idea: "الفكرة الرئيسية",
  details: "استخراج التفاصيل",
};

// مستويات التصنيف
export const CLASSIFICATION_INFO: Record<
  ClassificationLevel,
  { label: string; shortLabel: string; color: string; bgColor: string; description: string; icon: string }
> = {
  support: {
    label: "يحتاج إلى دعم",
    shortLabel: "دعم",
    color: "text-rose-700",
    bgColor: "bg-rose-100 border-rose-300",
    description: "الطالب بحاجة إلى تركيز على المهارة الأضعف ونصوص أقصر وتدريبات يومية قصيرة",
    icon: "🤝",
  },
  medium: {
    label: "متوسط",
    shortLabel: "متوسط",
    color: "text-amber-700",
    bgColor: "bg-amber-100 border-amber-300",
    description: "الطالب بحاجة إلى تدريبات متنوعة ومتدرجة الصعوبة",
    icon: "📈",
  },
  excellent: {
    label: "متفوق",
    shortLabel: "متفوق",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100 border-emerald-300",
    description: "الطالب مؤهل لنصوص أعمق وأسئلة استنتاجية وتحديات",
    icon: "🏆",
  },
};

// إعدادات افتراضية
export const DEFAULT_SETTINGS = {
  classificationThresholds: {
    supportMax: 50,
    excellentMin: 80,
  },
  placementTestQuestionCount: 20,
  reassessmentIntervalWeeks: 4,
  testTimeLimitMin: 30,
  appName: "اقرأ",
  schoolName: "مدرسة الساحل الأهلية (بنين)",
};
