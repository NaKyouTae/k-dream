"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  LOCALES,
  LOCALE_HTML_LANG,
  translations,
  type Locale,
  type TranslationKey,
} from "./translations";

export const DEFAULT_LOCALE: Locale = "ko";

/** 주소가 바뀌었을 때 알리는 자체 이벤트 (history.replaceState 는 이벤트를 안 쏜다) */
const LOCALE_EVENT = "kdream:locale";

/** ?lang=uz 처럼 들어온 값을 지원 언어로 좁힌다 */
export function parseLocale(value: string | null | undefined): Locale | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase().split("-")[0];
  return (LOCALES as readonly string[]).includes(normalized)
    ? (normalized as Locale)
    : null;
}

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(LOCALE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(LOCALE_EVENT, onChange);
  };
}

type LanguageContextType = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  /**
   * 언어는 주소(?lang=)로 정해진다. QR 링크가 곧 언어 설정이다.
   *
   * useSearchParams 대신 location 을 직접 구독한다 — 정적 export 에서
   * useSearchParams 는 Suspense 를 요구하고, 그러면 내보낸 HTML 이
   * 폴백으로 바뀌어 본문이 사라진다. 이 방식은 정적 HTML(한국어)을 그대로 두고
   * 하이드레이션 이후 해당 언어로 바꾼다.
   */
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => "",
  );
  const locale =
    parseLocale(new URLSearchParams(search).get("lang")) ?? DEFAULT_LOCALE;

  const setLocale = useCallback((next: Locale) => {
    const params = new URLSearchParams(window.location.search);
    if (next === DEFAULT_LOCALE) params.delete("lang");
    else params.set("lang", next);

    const query = params.toString();
    // 주소가 곧 언어라서 새로고침하거나 링크를 공유해도 같은 언어로 열린다
    window.history.replaceState(
      null,
      "",
      query ? `?${query}` : window.location.pathname,
    );
    window.dispatchEvent(new Event(LOCALE_EVENT));
  }, []);

  // 정적 export 라 <html lang> 은 클라이언트에서 맞춘다 (스크린리더·번역기용)
  useEffect(() => {
    document.documentElement.lang = LOCALE_HTML_LANG[locale];
  }, [locale]);

  const t = useCallback(
    (key: TranslationKey) => translations[key][locale],
    [locale],
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
