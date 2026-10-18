"use client";

import { ReactNode } from "react";
import { DirectionProvider as RadixDirectionProvider } from "@radix-ui/react-direction";

/**
 * مزوّد الاتجاه - يستخدم DirectionProvider الرسمي من @radix-ui/react-direction
 * لضمان أن جميع مكونات Radix UI (Tabs, Select, Dialog, Menu, etc.)
 * تعمل باتجاه RTL الصحيح.
 *
 * بدون هذا المزوّد، تستخدم مكونات Radix اتجاه LTR افتراضياً حتى لو كان
 * <html dir="rtl"> مما يسبب مشاكل في ترتيب التبويبات والقوائم.
 */
export function DirectionProvider({ children }: { children: ReactNode }) {
  return <RadixDirectionProvider dir="rtl">{children}</RadixDirectionProvider>;
}
