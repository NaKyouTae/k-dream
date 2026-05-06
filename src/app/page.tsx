"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { LanguageProvider, useLanguage } from "@/lib/LanguageContext";

/* ──────────────────────────────────────────
   Hooks
   ────────────────────────────────────────── */
function useActiveSection(sectionIds: string[]) {
  const [active, setActive] = useState("");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sectionIds]);
  return active;
}

/* ──────────────────────────────────────────
   Language Toggle
   ────────────────────────────────────────── */
function LanguageToggle() {
  const { locale, toggleLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer flex items-center gap-1.5 h-9 px-4 text-sm text-gray-600 hover:text-[#2F6BFF] transition-colors rounded-full border border-gray-200 hover:border-[#2F6BFF]/30"
        aria-label="언어 변경"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.264.26-2.466.733-3.559" />
        </svg>
        <span className="text-xs font-medium">{locale === "ko" ? "KO" : "EN"}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
            <button
              onClick={() => { if (locale !== "ko") toggleLocale(); setOpen(false); }}
              className={`cursor-pointer w-full text-left px-4 py-2 text-sm ${locale === "ko" ? "text-[#2F6BFF] font-medium bg-blue-50" : "text-gray-600 hover:bg-gray-50"}`}
            >
              한국어
            </button>
            <button
              onClick={() => { if (locale !== "en") toggleLocale(); setOpen(false); }}
              className={`cursor-pointer w-full text-left px-4 py-2 text-sm ${locale === "en" ? "text-[#2F6BFF] font-medium bg-blue-50" : "text-gray-600 hover:bg-gray-50"}`}
            >
              English
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────
   [1] Header
   ────────────────────────────────────────── */
const SECTION_IDS = ["about", "programs", "process", "settlement", "career", "contact"];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLanguage();
  const activeSection = useActiveSection(SECTION_IDS);

  const links = [
    { href: "#about", id: "about", label: t("nav.about") },
    { href: "#programs", id: "programs", label: t("nav.programs") },
    { href: "#process", id: "process", label: t("nav.process") },
    { href: "#settlement", id: "settlement", label: t("nav.settlement") },
    { href: "#career", id: "career", label: t("nav.career") },
    { href: "#contact", id: "contact", label: t("nav.contact") },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="cursor-pointer flex items-center gap-2">
            <Image src="/images/logo.png" alt="K-DREAM" width={32} height={32} className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg text-gray-900">K-DREAM</span>
          </a>

          <nav className="hidden lg:flex items-center gap-7">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`cursor-pointer text-sm transition-colors ${activeSection === link.id ? "text-[#2F6BFF] font-semibold" : "text-gray-600 hover:text-[#2F6BFF]"}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <a href="#contact" className="cursor-pointer h-9 px-5 inline-flex items-center bg-[#2F6BFF] text-white text-sm font-medium rounded-full hover:bg-[#0A2A5E] transition-colors">
              {t("header.cta")}
            </a>
            <LanguageToggle />
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <button className="cursor-pointer p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label={t("header.menuOpen")}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <LanguageToggle />
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 pb-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`cursor-pointer block py-3 border-b border-gray-50 ${activeSection === link.id ? "text-[#2F6BFF] font-semibold" : "text-gray-600 hover:text-[#2F6BFF]"}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className="mt-3 block text-center px-5 py-2.5 bg-[#2F6BFF] text-white text-sm font-medium rounded-full"
            onClick={() => setMenuOpen(false)}
          >
            {t("header.cta")}
          </a>
        </div>
      )}
    </header>
  );
}

/* ──────────────────────────────────────────
   [2] Hero
   ────────────────────────────────────────── */
function Hero() {
  const { t } = useLanguage();
  const heroPoints = [t("hero.point1"), t("hero.point2"), t("hero.point3")];
  return (
    <section className="relative pt-16 overflow-hidden">
      {/* 배경: 이미지 + 오버레이 */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bg.jpg"
          alt="유학생 캠퍼스 생활"
          fill
          className="object-cover"
          priority
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A2A5E]/90 via-[#0A2A5E]/85 to-[#162d50]/90" />
      </div>

      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#2F6BFF]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#2F6BFF]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {t("hero.title1")}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F6BFF] to-cyan-300">
              {t("hero.title2")}
            </span>
          </h1>
          <div className="max-w-3xl mx-auto mb-10">
            <p className="mb-[20px] text-[20px] text-blue-200/80">
              {t("hero.desc")}
            </p>
            <p className="text-[16px] text-blue-100/85 leading-relaxed">
              {t("hero.desc2")}
            </p>
            <div className="mt-6 grid gap-3 max-w-2xl mx-auto sm:grid-cols-3">
              {heroPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-blue-50/95 backdrop-blur-sm"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-300/15 text-cyan-200">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="leading-snug">{point}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#programs" className="cursor-pointer px-8 py-3 bg-[#2F6BFF] hover:bg-[#0A2A5E] text-white font-medium rounded-full transition-colors">
              {t("hero.cta1")}
            </a>
            <a href="#contact" className="cursor-pointer px-8 py-3 border border-[#2F6BFF]/40 text-blue-300 hover:bg-[#2F6BFF]/10 font-medium rounded-full transition-colors">
              {t("hero.cta2")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   [3] Full Service Flow
   ────────────────────────────────────────── */
function FullServiceFlow() {
  const { t } = useLanguage();
  const steps = [
    { num: "01", label: t("flow.step1") },
    { num: "02", label: t("flow.step2") },
    { num: "03", label: t("flow.step3") },
    { num: "04", label: t("flow.step4") },
    { num: "05", label: t("flow.step5") },
    { num: "06", label: t("flow.step6") },
  ];

  const splitStepLabel = (label: string) => {
    const match = label.match(/^(.*?)(\s*\(.*\))$/);
    if (!match) return { main: label, sub: "" };
    return { main: match[1].trim(), sub: match[2].trim() };
  };

  const renderStepCard = (step: (typeof steps)[number]) => {
    const { main, sub } = splitStepLabel(step.label);
    const isStepFive = step.num === "05";

    return (
      <div className="rounded-[1.75rem] border border-[#EEF2F7] bg-white px-4 py-5 sm:px-5 sm:py-6 text-center shadow-[0_12px_28px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
        <div className="mb-4 flex justify-center">
          <span className="inline-flex h-7 items-center rounded-full bg-[#EAF2FF] px-3 text-[12px] font-semibold tracking-[1px] text-[#2F6BFF]">
            {`STEP ${step.num}`}
          </span>
        </div>
        {isStepFive ? (
          <p className="text-[13px] sm:text-xl font-semibold sm:font-bold leading-snug text-gray-900 whitespace-nowrap tracking-[-0.02em]">
            {step.label}
          </p>
        ) : (
          <div className="space-y-1">
            <p className="text-lg sm:text-xl font-bold leading-snug text-gray-900 break-keep">
              {main}
            </p>
            {sub ? (
              <p className="text-sm font-normal leading-snug text-gray-400 break-keep">
                {sub}
              </p>
            ) : null}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[#2F6BFF] font-semibold text-sm mb-2">{t("flow.tag")}</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t("flow.title")}</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:hidden">
          {steps.map((step, index) => (
            <div key={`mobile-${step.num}`} className="relative">
              {renderStepCard(step)}
              {index < steps.length - 1 ? (
                <div className="absolute top-1/2 right-[-14px] z-10 -translate-y-1/2 text-[#B8C6E3]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-4-4 4 4-4 4" />
                  </svg>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="hidden sm:grid gap-5 xl:grid-cols-3 2xl:grid-cols-6">
          {steps.map((step, index) => (
            <div key={step.num} className="relative">
              {renderStepCard(step)}
              {index < steps.length - 1 && (
                <div className="hidden 2xl:flex absolute top-1/2 -right-4 z-10 -translate-y-1/2 items-center text-[#B8C6E3]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-4-4 4 4-4 4" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   [4] Core Services (3-column cards)
   ────────────────────────────────────────── */
function CoreServices() {
  const { t } = useLanguage();
  const items = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
        </svg>
      ),
      title: t("core.item1.title"),
      desc: t("core.item1.desc"),
      color: "bg-blue-50 text-[#2F6BFF]",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
      title: t("core.item2.title"),
      desc: t("core.item2.desc"),
      color: "bg-green-50 text-green-600",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
        </svg>
      ),
      title: t("core.item3.title"),
      desc: t("core.item3.desc"),
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[#2F6BFF] font-semibold text-sm mb-2">{t("core.tag")}</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t("core.title")}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">{t("core.desc")}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center md:text-left">
              <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center mb-5 mx-auto md:mx-0`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   [5] Introduction (image + text)
   ────────────────────────────────────────── */
function Introduction() {
  const { t } = useLanguage();
  return (
    <section id="about" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* 왼쪽 이미지 */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-[#0A2A5E] to-[#2F6BFF]">
            <Image
              src="/images/intro.jpg"
              alt="K-DREAM 유학 상담"
              fill
              className="object-cover"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </div>

          {/* 오른쪽 텍스트 */}
          <div>
            <p className="text-[#2F6BFF] font-semibold text-sm mb-2">{t("intro.tag")}</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">{t("intro.title")}</h2>
            <p className="text-gray-500 leading-relaxed mb-8 whitespace-pre-line">{t("intro.desc")}</p>
            <ul className="space-y-4">
              {[t("intro.item1"), t("intro.item2"), t("intro.item3")].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#2F6BFF]/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-[#2F6BFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   [6] Programs (4-card)
   ────────────────────────────────────────── */
function Programs() {
  const { t } = useLanguage();
  const programs = [
    {
      title: t("programs.item1.title"),
      desc: t("programs.item1.desc"),
      duration: t("programs.item1.duration"),
      visa: t("programs.item1.visa"),
      details: [t("programs.item1.detail1"), t("programs.item1.detail2"), t("programs.item1.detail3")],
      color: "from-[#2F6BFF] to-blue-500",
      image: "/images/program-language.jpg",
      imageAlt: "어학연수 수업 장면",
    },
    {
      title: t("programs.item2.title"),
      desc: t("programs.item2.desc"),
      duration: t("programs.item2.duration"),
      visa: t("programs.item2.visa"),
      details: [t("programs.item2.detail1"), t("programs.item2.detail2"), t("programs.item2.detail3")],
      color: "from-cyan-500 to-cyan-600",
      image: "/images/program-college.jpg",
      imageAlt: "전문대 실습 장면",
    },
    {
      title: t("programs.item3.title"),
      desc: t("programs.item3.desc"),
      duration: t("programs.item3.duration"),
      visa: t("programs.item3.visa"),
      details: [t("programs.item3.detail1"), t("programs.item3.detail2"), t("programs.item3.detail3")],
      color: "from-indigo-500 to-indigo-600",
      image: "/images/program-university.jpg",
      imageAlt: "4년제 대학 캠퍼스",
    },
    {
      title: t("programs.item4.title"),
      desc: t("programs.item4.desc"),
      duration: t("programs.item4.duration"),
      visa: t("programs.item4.visa"),
      details: [t("programs.item4.detail1"), t("programs.item4.detail2"), t("programs.item4.detail3")],
      color: "from-violet-500 to-violet-600",
      image: "/images/program-masters.jpg",
      imageAlt: "석사 연구 장면",
    },
  ];

  return (
    <section id="programs" className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[#2F6BFF] font-semibold text-sm mb-2">{t("programs.tag")}</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t("programs.title")}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">{t("programs.desc")}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs.map((p) => (
            <div key={p.title} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              {/* 카드 상단 이미지 */}
              <div className={`relative h-40 bg-gradient-to-br ${p.color}`}>
                <Image
                  src={p.image}
                  alt={p.imageAlt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <h3 className="text-lg font-bold text-white">{p.title}</h3>
                </div>
              </div>

              {/* 카드 하단 정보 */}
              <div className="p-5">
                <p className="text-sm text-gray-500 mb-4">{p.desc}</p>

                <div className="flex gap-3 mb-4">
                  <span className="text-xs bg-blue-50 text-[#2F6BFF] px-2.5 py-1 rounded-full font-medium">{p.duration}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{p.visa}</span>
                </div>

                <ul className="space-y-2">
                  {p.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   [7] Admission Process (6-step)
   ────────────────────────────────────────── */
function AdmissionProcess() {
  const { t } = useLanguage();
  const steps = [
    { num: "01", title: t("process.step1"), desc: t("process.step1.desc"), icon: "\uD83D\uDCDE" },
    { num: "02", title: t("process.step2"), desc: t("process.step2.desc"), icon: "\uD83C\uDFEB" },
    { num: "03", title: t("process.step3"), desc: t("process.step3.desc"), icon: "\uD83D\uDCC4" },
    { num: "04", title: t("process.step4"), desc: t("process.step4.desc"), icon: "\u2705" },
    { num: "05", title: t("process.step5"), desc: t("process.step5.desc"), icon: "\uD83D\uDCCB" },
    { num: "06", title: t("process.step6"), desc: t("process.step6.desc"), icon: "\u2708\uFE0F" },
  ];

  return (
    <section id="process" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[#2F6BFF] font-semibold text-sm mb-2">{t("process.tag")}</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t("process.title")}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">{t("process.desc")}</p>
        </div>

        {/* PC: 가로 6단 */}
        <div className="hidden lg:grid grid-cols-6 gap-0 items-start">
          {steps.map((step, i) => (
            <div key={step.num} className="flex items-start">
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-[#2F6BFF] rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-lg shadow-[#2F6BFF]/20">
                  {step.icon}
                </div>
                <p className="font-bold text-gray-900 text-sm mb-1">{step.title}</p>
                <p className="text-xs text-gray-400 px-2">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="flex items-center pt-6 px-1 text-[#2F6BFF]/30">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 모바일: 세로 */}
        <div className="lg:hidden grid grid-cols-2 sm:grid-cols-3 gap-4">
          {steps.map((step) => (
            <div key={step.num} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 bg-[#2F6BFF] rounded-xl flex items-center justify-center text-xl mx-auto mb-3">
                {step.icon}
              </div>
              <p className="font-bold text-gray-900 text-sm mb-1">{step.title}</p>
              <p className="text-xs text-gray-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   [8] Settlement Support
   ────────────────────────────────────────── */
function SettlementSupport() {
  const { t } = useLanguage();
  const items = [
    { title: t("settlement.item1.title"), desc: t("settlement.item1.desc"), icon: "\u2708\uFE0F" },
    { title: t("settlement.item2.title"), desc: t("settlement.item2.desc"), icon: "\uD83C\uDFE0" },
    { title: t("settlement.item3.title"), desc: t("settlement.item3.desc"), icon: "\uD83D\uDCCB" },
    { title: t("settlement.item4.title"), desc: t("settlement.item4.desc"), icon: "\uD83D\uDCF1" },
    { title: t("settlement.item5.title"), desc: t("settlement.item5.desc"), icon: "\uD83D\uDDFA\uFE0F" },
  ];

  return (
    <section id="settlement" className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[#2F6BFF] font-semibold text-sm mb-2">{t("settlement.tag")}</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t("settlement.title")}</h2>
          <p className="text-gray-500 max-w-xl mx-auto whitespace-pre-line">{t("settlement.desc")}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* 왼쪽 이미지 */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600">
            <Image
              src="/images/settlement.jpg"
              alt="한국 생활 정착 지원"
              fill
              className="object-cover"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </div>

          {/* 오른쪽 리스트 */}
          <div className="space-y-5">
            {items.map((item) => (
              <div key={item.title} className="flex items-start gap-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   [9] Visa & Stay Management Support
   ────────────────────────────────────────── */
function VisaSupport() {
  const { t } = useLanguage();
  const items = [
    { num: "01", title: t("visa.item1.title"), desc: t("visa.item1.desc") },
    { num: "02", title: t("visa.item2.title"), desc: t("visa.item2.desc") },
    { num: "03", title: t("visa.item3.title"), desc: t("visa.item3.desc") },
    { num: "04", title: t("visa.item4.title"), desc: t("visa.item4.desc") },
  ];

  return (
    <section className="py-20 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[#2F6BFF] font-semibold text-sm mb-2">{t("visa.tag")}</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t("visa.title")}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">{t("visa.desc")}</p>
        </div>

        <div className="relative">
          <div className="absolute inset-x-10 -top-6 h-24 rounded-full bg-[#2F6BFF]/8 blur-3xl" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {items.map((item) => (
              <div key={item.num} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center">
                <div className="w-14 h-14 bg-[#2F6BFF] rounded-2xl flex items-center justify-center text-white text-sm font-bold mx-auto mb-4 shadow-lg shadow-[#2F6BFF]/20">
                  {item.num}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   [10] Career Support (dark background)
   ────────────────────────────────────────── */
function CareerSupport() {
  const { t } = useLanguage();
  const items = [
    { title: t("career.item1.title"), desc: t("career.item1.desc"), icon: "\uD83D\uDCBC" },
    { title: t("career.item2.title"), desc: t("career.item2.desc"), icon: "\uD83E\uDD1D" },
    { title: t("career.item3.title"), desc: t("career.item3.desc"), icon: "\uD83D\uDCDD" },
    { title: t("career.item4.title"), desc: t("career.item4.desc"), icon: "\uD83D\uDCCB" },
  ];

  return (
    <section id="career" className="py-20 sm:py-28 bg-gradient-to-br from-[#0A2A5E] via-[#0f2345] to-[#162d50]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[#2F6BFF] font-semibold text-sm mb-2">{t("career.tag")}</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t("career.title")}</h2>
          <p className="text-blue-200/70 max-w-xl mx-auto">{t("career.desc")}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* 왼쪽 카드들 */}
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.title} className="flex items-start gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-[#2F6BFF]/20 rounded-xl flex items-center justify-center text-xl shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-blue-200/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 오른쪽 이미지 */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-[#2F6BFF]/30 to-[#0A2A5E]/50">
            <Image
              src="/images/career.jpg"
              alt="취업 지원 및 면접"
              fill
              className="object-cover"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   [11] Partnerships
   ────────────────────────────────────────── */
function PartnerLogos() {
  const { t } = useLanguage();
  const partnerGroups = [
    {
      title: t("partners.item1.title"),
      desc: t("partners.item1.desc"),
      icon: "🎓",
      color: "from-blue-50 to-cyan-50 border-blue-100",
    },
    {
      title: t("partners.item2.title"),
      desc: t("partners.item2.desc"),
      icon: "🌏",
      color: "from-emerald-50 to-teal-50 border-emerald-100",
    },
    {
      title: t("partners.item3.title"),
      desc: t("partners.item3.desc"),
      icon: "🏢",
      color: "from-amber-50 to-orange-50 border-amber-100",
    },
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[#2F6BFF] font-semibold text-sm mb-2">{t("partners.tag")}</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{t("partners.title")}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">{t("partners.desc")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {partnerGroups.map((group) => (
            <div
              key={group.title}
              className={`rounded-2xl border bg-gradient-to-br ${group.color} p-8 text-center shadow-sm`}
            >
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/80 border border-white flex items-center justify-center text-3xl shadow-sm">
                {group.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900">{group.title}</h3>
              <p className="mt-3 text-sm text-gray-500 leading-relaxed">{group.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   [12] Contact CTA (blue background)
   ────────────────────────────────────────── */
function ContactCTA() {
  const { t } = useLanguage();
  return (
    <section id="contact" className="py-20 sm:py-28 bg-gradient-to-br from-[#2F6BFF] to-[#0A2A5E]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-blue-200 font-semibold text-sm mb-2">{t("contact.tag")}</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t("contact.title")}</h2>
        <p className="text-blue-100/80 max-w-xl mx-auto mb-10 whitespace-pre-line">{t("contact.desc")}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="mailto:contact@k-dream.co.kr"
            className="cursor-pointer px-8 py-3.5 bg-white text-[#0A2A5E] font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
          >
            {t("contact.cta1")}
          </a>
          <a
            href="https://pf.kakao.com/_placeholder"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer px-8 py-3.5 bg-[#FEE500] text-[#3C1E1E] font-semibold rounded-full hover:bg-[#FDD835] transition-colors shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.643 1.758 4.965 4.406 6.298-.194.726-.703 2.632-.805 3.04-.124.5.183.493.385.359.158-.105 2.516-1.711 3.543-2.41.486.07.985.107 1.495.107 5.523 0 10-3.463 10-7.394C22 6.463 17.523 3 12 3z" />
            </svg>
            {t("contact.cta2")}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   [13] Footer
   ────────────────────────────────────────── */
function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-[#0A2A5E] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 text-left">
          <div className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="K-DREAM" width={28} height={28} className="w-7 h-7 object-contain" />
            <div>
              <span className="font-bold">K-DREAM Study Abroad Agency</span>
              <p className="text-xs text-blue-200/60 mt-1">{t("footer.tagline")}</p>
            </div>
          </div>
          <p className="text-sm text-blue-200/50 text-left">&copy; 2026 K-DREAM. All rights reserved.</p>
        </div>
        <div className="border-t border-white/10 pt-6 text-xs text-blue-200/40 leading-relaxed">
          <p>{t("footer.company")}</p>
          <p className="mt-1">{t("footer.address")}</p>
        </div>
      </div>
    </footer>
  );
}

/* ──────────────────────────────────────────
   [14] Mobile Bottom CTA (fixed)
   ────────────────────────────────────────── */
function MobileBottomCTA() {
  const { t } = useLanguage();
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-200 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="flex gap-3 max-w-lg mx-auto">
        <a
          href="mailto:contact@k-dream.co.kr"
          className="cursor-pointer flex-1 py-3 bg-[#2F6BFF] text-white text-sm font-semibold rounded-full text-center hover:bg-[#0A2A5E] transition-colors"
        >
          {t("mobile.cta1")}
        </a>
        <a
          href="https://pf.kakao.com/_placeholder"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer flex-1 py-3 bg-[#FEE500] text-[#3C1E1E] text-sm font-semibold rounded-full text-center hover:bg-[#FDD835] transition-colors flex items-center justify-center gap-1.5"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.643 1.758 4.965 4.406 6.298-.194.726-.703 2.632-.805 3.04-.124.5.183.493.385.359.158-.105 2.516-1.711 3.543-2.41.486.07.985.107 1.495.107 5.523 0 10-3.463 10-7.394C22 6.463 17.523 3 12 3z" />
          </svg>
          {t("mobile.cta2")}
        </a>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Home (main)
   ────────────────────────────────────────── */
export default function Home() {
  return (
    <LanguageProvider>
      <Header />
      <Hero />
      <FullServiceFlow />
      <CoreServices />
      <Introduction />
      <Programs />
      <AdmissionProcess />
      <SettlementSupport />
      <VisaSupport />
      <CareerSupport />
      <PartnerLogos />
      <ContactCTA />
      <Footer />
      <MobileBottomCTA />
      {/* 모바일 하단 CTA 영역만큼 여백 */}
      <div className="h-16 lg:hidden" />
    </LanguageProvider>
  );
}
