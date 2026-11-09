// Supabase High-Speed CDN Assets Configuration
export const SUPABASE_STORAGE_URL =
  "https://lxhopgrkmzdsjtzxcfuk.supabase.co/storage/v1/object/public/site-assets";

export const ASSETS = {
  // شعار المدرسة عالي الجودة عبر CDN سحابي سريع
  schoolLogo: "/school-logo.png",
  schoolLogoHd: "/school-logo.png",
  logoSvg: "/logo.svg",
  // فيديو المقدمة يتم تقديمه عبر شبكة Vercel Edge CDN المباشرة للسرعة القصوى
  appIntroVideo: "/app-intro.mp4",
  supabaseAppIntroVideo: `${SUPABASE_STORAGE_URL}/app-intro.mp4`,

  // مسار احتياطي محلي في حال انقطاع الاتصال
  fallbackLogo: "/school-logo.png",
};
