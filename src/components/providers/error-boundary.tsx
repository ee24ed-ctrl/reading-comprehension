"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary - يلتقط أخطاء JavaScript runtime في مكونات الأبناء
 * ويمنع تحطم التطبيق بالكامل، بدلاً من شاشة "Application error" البيضاء.
 *
 * عندما يحدث خطأ، يعرض زراً لإعادة التحميل مسح البيانات المحلية.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // تسجيل الخطأ في الـ console للتصحيح
    console.error("Application error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    // مسح localStorage وإعادة تحميل الصفحة
    try {
      localStorage.removeItem("saahil-reading-platform");
    } catch (e) {
      // تجاهل الأخطاء
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          dir="rtl"
          className="min-h-screen flex items-center justify-center bg-gradient-sea p-6"
          style={{ fontFamily: "var(--font-cairo), Cairo, sans-serif" }}
        >
          <div className="max-w-md w-full bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.7-3L13.7 4a2 2 0 00-3.4 0L3.3 16A2 2 0 005 19z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">
              حدث خطأ غير متوقع
            </h1>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              نعتذر، حدث خطأ أثناء تحميل المنصة. قد تكون البيانات المحفوظة قديمة أو غير متوافقة.
              <br />
              يمكنك إعادة الضغط على الزر أدناه لإعادة التحميل ومسح البيانات القديمة.
            </p>
            {this.state.error && (
              <details className="mb-4 text-right">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  تفاصيل الخطأ (للتشخيص)
                </summary>
                <pre className="mt-2 p-3 bg-muted rounded-lg text-xs text-muted-foreground overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReload}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              إعادة تحميل المنصة
            </button>
            <p className="text-xs text-muted-foreground mt-4">
              مدرسة الساحل الأهلية (بنين) — منصة الفهم القرائي
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
