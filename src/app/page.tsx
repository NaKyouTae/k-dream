"use client";

import { useState, useEffect } from "react";
import { LanguageProvider, useLanguage } from "@/lib/LanguageContext";

function useActiveSection(sectionIds: string[]) {
  const [active, setActive] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sectionIds]);

  return active;
}

function LanguageToggle() {
  const { locale, toggleLocale } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 h-9 px-4 text-sm text-gray-600 hover:text-blue-600 transition-colors rounded-full border border-gray-200 hover:border-blue-300"
        aria-label="언어 변경"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.264.26-2.466.733-3.559"
          />
        </svg>
        <span className="text-xs font-medium">
          {locale === "ko" ? "KO" : "EN"}
        </span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
            <button
              onClick={() => {
                if (locale !== "ko") toggleLocale();
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm ${locale === "ko" ? "text-blue-600 font-medium bg-blue-50" : "text-gray-600 hover:bg-gray-50"}`}
            >
              한국어
            </button>
            <button
              onClick={() => {
                if (locale !== "en") toggleLocale();
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm ${locale === "en" ? "text-blue-600 font-medium bg-blue-50" : "text-gray-600 hover:bg-gray-50"}`}
            >
              English
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const SECTION_IDS = ["about", "services", "countries", "partners", "strengths", "contact"];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLanguage();
  const activeSection = useActiveSection(SECTION_IDS);

  const links = [
    { href: "#about", id: "about", label: t("nav.about") },
    { href: "#services", id: "services", label: t("nav.services") },
    { href: "#countries", id: "countries", label: t("nav.countries") },
    { href: "#partners", id: "partners", label: t("nav.partners") },
    { href: "#strengths", id: "strengths", label: t("nav.strengths") },
    { href: "#contact", id: "contact", label: t("nav.contact") },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-sm">
              K
            </div>
            <span className="font-bold text-lg text-gray-900">K-DREAM</span>
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  activeSection === link.id
                    ? "text-blue-600 font-semibold"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#contact"
              className="h-9 px-5 inline-flex items-center bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors"
            >
              {t("header.contact")}
            </a>
            <LanguageToggle />
          </div>
          <div className="md:hidden flex items-center gap-2">
            <button
              className="p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={t("header.menuOpen")}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
            <LanguageToggle />
          </div>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`block py-3 border-b border-gray-50 ${
                activeSection === link.id
                  ? "text-blue-600 font-semibold"
                  : "text-gray-600 hover:text-blue-600"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className="mt-3 block text-center px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-full"
            onClick={() => setMenuOpen(false)}
          >
            {t("header.contact")}
          </a>
        </div>
      )}
    </header>
  );
}

function Hero() {
  const { t } = useLanguage();
  return (
    <section className="relative pt-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f2345] to-[#162d50]" />
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 rounded-full mb-6">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-blue-300 text-sm font-medium">
              {t("hero.badge")}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {t("hero.title1")}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              {t("hero.title2")}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-200/80 max-w-2xl mx-auto mb-10">
            {t("hero.desc")}
            <br className="hidden sm:block" />
            {t("hero.desc2")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#services"
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full transition-colors"
            >
              {t("hero.cta1")}
            </a>
            <a
              href="#contact"
              className="px-8 py-3 border border-blue-400/30 text-blue-300 hover:bg-blue-500/10 font-medium rounded-full transition-colors"
            >
              {t("hero.cta2")}
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
          {[
            { icon: "\u{1F3DB}", label: t("hero.stat1.label"), value: t("hero.stat1.value") },
            { icon: "\u{1F30F}", label: t("hero.stat2.label"), value: t("hero.stat2.value") },
            { icon: "\u{1F4C8}", label: t("hero.stat3.label"), value: t("hero.stat3.value") },
            { icon: "\u2705", label: t("hero.stat4.label"), value: t("hero.stat4.value") },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-xs text-blue-300/70 mb-1">{item.label}</p>
              <p className="text-sm font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  const { t } = useLanguage();
  return (
    <section id="about" className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold text-sm mb-2">
            {t("about.tag")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t("about.title")}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            {t("about.desc")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl">{"\u{1F52D}"}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t("about.vision")}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {t("about.vision.sub")}
            </p>
            <p className="text-gray-700 leading-relaxed">
              {t("about.vision.desc")}
              <strong>{t("about.vision.bold")}</strong>
              {t("about.vision.desc2")}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-green-600 text-xl">{"\u{1F3AF}"}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t("about.mission")}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {t("about.mission.sub")}
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">{"\u2022"}</span>
                <span>
                  <strong>{t("about.mission.item1.title")}</strong>
                  {t("about.mission.item1.desc")}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">{"\u2022"}</span>
                <span>
                  <strong>{t("about.mission.item2.title")}</strong>
                  {t("about.mission.item2.desc")}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">{"\u2022"}</span>
                <span>
                  <strong>{t("about.mission.item3.title")}</strong>
                  {t("about.mission.item3.desc")}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: "\u{1F6E1}", title: t("about.value1.title"), desc: t("about.value1.desc"), color: "bg-blue-50 text-blue-600" },
            { icon: "\u{1F393}", title: t("about.value2.title"), desc: t("about.value2.desc"), color: "bg-amber-50 text-amber-600" },
            { icon: "\u{1F91D}", title: t("about.value3.title"), desc: t("about.value3.desc"), color: "bg-green-50 text-green-600" },
            { icon: "\u{1F4CA}", title: t("about.value4.title"), desc: t("about.value4.desc"), color: "bg-purple-50 text-purple-600" },
          ].map((v) => (
            <div
              key={v.title}
              className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100"
            >
              <div
                className={`w-12 h-12 ${v.color} rounded-xl flex items-center justify-center mx-auto mb-3`}
              >
                <span className="text-xl">{v.icon}</span>
              </div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">
                {v.title}
              </h4>
              <p className="text-xs text-gray-500">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  const { t } = useLanguage();
  const steps = [
    {
      num: "01",
      title: t("services.step1.title"),
      subtitle: t("services.step1.subtitle"),
      color: "from-blue-500 to-blue-600",
      items: [t("services.step1.item1"), t("services.step1.item2"), t("services.step1.item3"), t("services.step1.item4")],
      stats: [
        { label: t("services.step1.stat1.label"), value: t("services.step1.stat1.value") },
        { label: t("services.step1.stat2.label"), value: t("services.step1.stat2.value") },
      ],
    },
    {
      num: "02",
      title: t("services.step2.title"),
      subtitle: t("services.step2.subtitle"),
      color: "from-cyan-500 to-cyan-600",
      items: [t("services.step2.item1"), t("services.step2.item2"), t("services.step2.item3"), t("services.step2.item4")],
      stats: [
        { label: t("services.step2.stat1.label"), value: t("services.step2.stat1.value") },
        { label: t("services.step2.stat2.label"), value: t("services.step2.stat2.value") },
      ],
    },
    {
      num: "03",
      title: t("services.step3.title"),
      subtitle: t("services.step3.subtitle"),
      color: "from-indigo-500 to-indigo-600",
      items: [t("services.step3.item1"), t("services.step3.item2"), t("services.step3.item3"), t("services.step3.item4")],
      stats: [
        { label: t("services.step3.stat1.label"), value: t("services.step3.stat1.value") },
        { label: t("services.step3.stat2.label"), value: t("services.step3.stat2.value") },
      ],
    },
    {
      num: "04",
      title: t("services.step4.title"),
      subtitle: t("services.step4.subtitle"),
      color: "from-violet-500 to-violet-600",
      items: [t("services.step4.item1"), t("services.step4.item2"), t("services.step4.item3"), t("services.step4.item4")],
      stats: [
        { label: t("services.step4.stat1.label"), value: t("services.step4.stat1.value") },
        { label: t("services.step4.stat2.label"), value: t("services.step4.stat2.value") },
      ],
    },
    {
      num: "05",
      title: t("services.step5.title"),
      subtitle: t("services.step5.subtitle"),
      color: "from-pink-500 to-pink-600",
      items: [t("services.step5.item1"), t("services.step5.item2"), t("services.step5.item3"), t("services.step5.item4")],
      stats: [
        { label: t("services.step5.stat1.label"), value: t("services.step5.stat1.value") },
        { label: t("services.step5.stat2.label"), value: t("services.step5.stat2.value") },
      ],
    },
  ];

  return (
    <section id="services" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold text-sm mb-2">
            {t("services.tag")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t("services.title")}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            {t("services.desc")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className={`rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden ${step.num === "05" ? "md:col-span-2 lg:col-span-1" : ""}`}
            >
              <div
                className={`bg-gradient-to-r ${step.color} px-6 py-4 flex items-center gap-3`}
              >
                <span className="text-2xl font-bold text-white/40">
                  {step.num}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  <p className="text-xs text-white/70">{step.subtitle}</p>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-2.5 mb-5">
                  {step.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <svg
                        className="w-4 h-4 text-green-500 mt-0.5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-4 pt-4 border-t border-gray-100">
                  {step.stats.map((stat) => (
                    <div key={stat.label}>
                      <p className="text-lg font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-400">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const { t } = useLanguage();
  return (
    <section className="py-20 bg-gradient-to-br from-[#0a1628] via-[#0f2345] to-[#162d50]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t("stats.title")}
          </h2>
          <p className="text-blue-200/70">
            {t("stats.desc")}
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { value: t("stats.item1.value"), unit: t("stats.item1.unit"), label: t("stats.item1.label"), sub: t("stats.item1.sub") },
            { value: t("stats.item2.value"), unit: t("stats.item2.unit"), label: t("stats.item2.label"), sub: t("stats.item2.sub") },
            { value: t("stats.item3.value"), unit: t("stats.item3.unit"), label: t("stats.item3.label"), sub: t("stats.item3.sub") },
            { value: t("stats.item4.value"), unit: t("stats.item4.unit"), label: t("stats.item4.label"), sub: t("stats.item4.sub") },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center"
            >
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl sm:text-4xl font-bold text-white">
                  {s.value}
                </span>
                {s.unit && <span className="text-lg text-blue-300">{s.unit}</span>}
              </div>
              <p className="text-white/80 text-sm mt-2">{s.label}</p>
              <p className="text-blue-400 text-xs mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Countries() {
  const { t } = useLanguage();
  const countries = [
    {
      code: "UZ",
      name: t("countries.uz.name"),
      tag: t("countries.uz.tag"),
      color: "bg-blue-500",
      stats: { y2024: "12,025", y2025: "15,786", growth: "+31%" },
      strategy: t("countries.uz.strategy"),
      items: [t("countries.uz.item1"), t("countries.uz.item2"), t("countries.uz.item3")],
      channels: [t("countries.uz.ch1"), t("countries.uz.ch2")],
    },
    {
      code: "MN",
      name: t("countries.mn.name"),
      tag: t("countries.mn.tag"),
      color: "bg-amber-500",
      stats: { y2024: "12,317", y2025: "15,270", growth: "+24%" },
      strategy: t("countries.mn.strategy"),
      items: [t("countries.mn.item1"), t("countries.mn.item2"), t("countries.mn.item3")],
      channels: [t("countries.mn.ch1"), t("countries.mn.ch2")],
    },
    {
      code: "VN",
      name: t("countries.vn.name"),
      tag: t("countries.vn.tag"),
      color: "bg-green-500",
      stats: { y2024: "56,003", y2025: "75,144", growth: "+34%" },
      strategy: t("countries.vn.strategy"),
      items: [t("countries.vn.item1"), t("countries.vn.item2"), t("countries.vn.item3")],
      channels: [t("countries.vn.ch1"), t("countries.vn.ch2")],
    },
    {
      code: "CN",
      name: t("countries.cn.name"),
      tag: t("countries.cn.tag"),
      color: "bg-purple-500",
      stats: { y2024: "72,020", y2025: "76,541", growth: "+6%" },
      strategy: t("countries.cn.strategy"),
      items: [t("countries.cn.item1"), t("countries.cn.item2"), t("countries.cn.item3")],
      channels: [t("countries.cn.ch1"), t("countries.cn.ch2")],
    },
  ];

  return (
    <section id="countries" className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold text-sm mb-2">
            {t("countries.tag")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t("countries.title")}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            {t("countries.desc")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {countries.map((c) => (
            <div
              key={c.code}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 ${c.color} rounded-xl flex items-center justify-center text-white font-bold text-sm`}
                    >
                      {c.code}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{c.name}</h3>
                      <p className="text-xs text-gray-400">{c.strategy}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                    {c.tag}
                  </span>
                </div>

                <div className="flex items-end gap-4 mb-5 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-400">{t("countries.year2024")}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {c.stats.y2024}
                    </p>
                  </div>
                  <div className="text-gray-300 pb-1">{"\u2192"}</div>
                  <div>
                    <p className="text-xs text-gray-400">{t("countries.year2025")}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {c.stats.y2025}
                    </p>
                  </div>
                  <span className="text-green-600 font-bold text-sm ml-auto">
                    {c.stats.growth}
                  </span>
                </div>

                <ul className="space-y-2 mb-4">
                  {c.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <span className="text-blue-500 mt-0.5">{"\u2022"}</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex gap-2">
                  {c.channels.map((ch) => (
                    <span
                      key={ch}
                      className={`text-xs px-3 py-1 rounded-full ${c.color} text-white`}
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Partners() {
  const { t } = useLanguage();
  return (
    <section id="partners" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold text-sm mb-2">
            {t("partners.tag")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t("partners.title")}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            {t("partners.desc")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: "\u{1F393}",
              title: t("partners.college.title"),
              sub: t("partners.college.sub"),
              stat1: { label: t("partners.college.stat1.label"), value: t("partners.college.stat1.value") },
              stat2: { label: t("partners.college.stat2.label"), value: t("partners.college.stat2.value") },
              growth: "+53%",
              items: [t("partners.college.item1"), t("partners.college.item2")],
              ratio: t("partners.college.ratio"),
            },
            {
              icon: "\u2699\uFE0F",
              title: t("partners.engineering.title"),
              sub: t("partners.engineering.sub"),
              stat1: { label: t("partners.engineering.stat1.label"), value: t("partners.engineering.stat1.value") },
              stat2: { label: t("partners.engineering.stat2.label"), value: t("partners.engineering.stat2.value") },
              growth: "",
              items: [t("partners.engineering.item1"), t("partners.engineering.item2")],
              ratio: t("partners.engineering.ratio"),
            },
            {
              icon: "\u{1F37D}",
              title: t("partners.tourism.title"),
              sub: t("partners.tourism.sub"),
              stat1: { label: t("partners.tourism.stat1.label"), value: t("partners.tourism.stat1.value") },
              stat2: { label: t("partners.tourism.stat2.label"), value: t("partners.tourism.stat2.value") },
              growth: "",
              items: [t("partners.tourism.item1"), t("partners.tourism.item2")],
              ratio: t("partners.tourism.ratio"),
            },
          ].map((p) => (
            <div
              key={p.title}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900">{p.title}</h3>
                  <p className="text-xs text-gray-400">{p.sub}</p>
                </div>
                <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                  {p.ratio}
                </span>
              </div>

              <div className="flex gap-4 p-3 bg-gray-50 rounded-xl mb-4">
                <div>
                  <p className="text-xs text-gray-400">{p.stat1.label}</p>
                  <p className="font-bold text-gray-900">{p.stat1.value}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">{p.stat2.label}</p>
                  <p className="font-bold text-green-600">{p.stat2.value}</p>
                </div>
              </div>

              <ul className="space-y-2">
                {p.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="text-blue-500 mt-0.5">{"\u2022"}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="font-bold text-lg text-gray-900 mb-6">
            {t("partners.pipeline.title")}
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { step: "1", title: t("partners.pipeline.step1"), sub: t("partners.pipeline.step1.sub") },
              { step: "2", title: t("partners.pipeline.step2"), sub: t("partners.pipeline.step2.sub") },
              { step: "3", title: t("partners.pipeline.step3"), sub: t("partners.pipeline.step3.sub") },
              { step: "4", title: t("partners.pipeline.step4"), sub: t("partners.pipeline.step4.sub") },
              { step: "5", title: t("partners.pipeline.step5"), sub: t("partners.pipeline.step5.sub") },
            ].map((s, i) => (
              <div key={s.step} className="flex items-center gap-3">
                <div className="bg-blue-50 rounded-xl p-4 text-center flex-1">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mx-auto mb-2">
                    {s.step}
                  </div>
                  <p className="font-semibold text-sm text-gray-900">
                    {s.title}
                  </p>
                  <p className="text-xs text-gray-400">{s.sub}</p>
                </div>
                {i < 4 && (
                  <span className="text-gray-300 hidden lg:block">{"\u2192"}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StudentManagement() {
  const { t } = useLanguage();
  const stages = [
    {
      icon: "\u{1F4CB}",
      title: t("mgmt.stage1.title"),
      period: t("mgmt.stage1.period"),
      color: "from-blue-500 to-blue-600",
      items: [t("mgmt.stage1.item1"), t("mgmt.stage1.item2"), t("mgmt.stage1.item3")],
    },
    {
      icon: "\u{1F4DA}",
      title: t("mgmt.stage2.title"),
      period: t("mgmt.stage2.period"),
      color: "from-green-500 to-green-600",
      items: [t("mgmt.stage2.item1"), t("mgmt.stage2.item2"), t("mgmt.stage2.item3")],
    },
    {
      icon: "\u{1F9ED}",
      title: t("mgmt.stage3.title"),
      period: t("mgmt.stage3.period"),
      color: "from-amber-500 to-amber-600",
      items: [t("mgmt.stage3.item1"), t("mgmt.stage3.item2"), t("mgmt.stage3.item3")],
    },
    {
      icon: "\u{1F4BC}",
      title: t("mgmt.stage4.title"),
      period: t("mgmt.stage4.period"),
      color: "from-violet-500 to-violet-600",
      items: [t("mgmt.stage4.item1"), t("mgmt.stage4.item2"), t("mgmt.stage4.item3")],
    },
    {
      icon: "\u{1F3E0}",
      title: t("mgmt.stage5.title"),
      period: t("mgmt.stage5.period"),
      color: "from-pink-500 to-pink-600",
      items: [t("mgmt.stage5.item1"), t("mgmt.stage5.item2"), t("mgmt.stage5.item3")],
    },
  ];

  return (
    <section id="management" className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold text-sm mb-2">
            {t("mgmt.tag")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t("mgmt.title")}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            {t("mgmt.desc")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stages.map((stage, i) => (
            <div key={stage.title} className="flex items-stretch gap-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 hover:shadow-md transition-shadow">
                <div
                  className={`bg-gradient-to-r ${stage.color} px-4 py-3 flex items-center gap-2`}
                >
                  <span className="text-lg">{stage.icon}</span>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      {stage.title}
                    </h3>
                    <p className="text-xs text-white/70">{stage.period}</p>
                  </div>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {stage.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-1.5 text-xs text-gray-600"
                      >
                        <span className="text-blue-500 mt-0.5">{"\u2022"}</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {i < stages.length - 1 && (
                <span className="hidden lg:flex items-center text-gray-300 text-lg">
                  {"\u2192"}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Differentiation1() {
  const { t } = useLanguage();
  return (
    <section id="strengths" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold text-sm mb-2">
            {t("diff1.tag")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t("diff1.title")}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            {t("diff1.desc")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-lg">{"\u{1F393}"}</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{t("diff1.dept.title")}</h3>
                <p className="text-xs text-gray-400">{t("diff1.dept.sub")}</p>
              </div>
            </div>
            <ul className="space-y-2 mb-5">
              {[t("diff1.dept.item1"), t("diff1.dept.item2"), t("diff1.dept.item3")].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-blue-500 mt-0.5">{"\u2022"}</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex gap-6 pt-4 border-t border-gray-100">
              <div>
                <p className="text-2xl font-bold text-gray-900">{t("diff1.dept.stat1.value")}</p>
                <p className="text-xs text-gray-400">{t("diff1.dept.stat1.label")}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{t("diff1.dept.stat2.value")}</p>
                <p className="text-xs text-gray-400">{t("diff1.dept.stat2.label")}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <span className="text-amber-600 text-lg">{"\u{1F3ED}"}</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{t("diff1.company.title")}</h3>
                <p className="text-xs text-gray-400">{t("diff1.company.sub")}</p>
              </div>
            </div>
            <ul className="space-y-2 mb-5">
              {[t("diff1.company.item1"), t("diff1.company.item2"), t("diff1.company.item3")].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-blue-500 mt-0.5">{"\u2022"}</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex gap-6 pt-4 border-t border-gray-100">
              <div>
                <p className="text-2xl font-bold text-gray-900">{t("diff1.company.stat1.value")}</p>
                <p className="text-xs text-gray-400">{t("diff1.company.stat1.label")}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{t("diff1.company.stat2.value")}</p>
                <p className="text-xs text-gray-400">{t("diff1.company.stat2.label")}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-lg">{"\u{1F4BC}"}</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{t("diff1.employment.title")}</h3>
                <p className="text-xs text-gray-400">{t("diff1.employment.sub")}</p>
              </div>
            </div>
            <ul className="space-y-2 mb-5">
              {[t("diff1.employment.item1"), t("diff1.employment.item2"), t("diff1.employment.item3")].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-blue-500 mt-0.5">{"\u2022"}</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex gap-6 pt-4 border-t border-gray-100">
              <div>
                <p className="text-2xl font-bold text-gray-900">{t("diff1.employment.stat1.value")}</p>
                <p className="text-xs text-gray-400">{t("diff1.employment.stat1.label")}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{t("diff1.employment.stat2.value")}</p>
                <p className="text-xs text-gray-400">{t("diff1.employment.stat2.label")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col">
            <h3 className="font-bold text-lg text-gray-900 mb-6">
              {t("diff1.process.title")}
            </h3>
            <div className="grid grid-cols-5 gap-3 flex-1 items-center">
              {[
                { step: "1", title: t("diff1.process.step1") },
                { step: "2", title: t("diff1.process.step2") },
                { step: "3", title: t("diff1.process.step3") },
                { step: "4", title: t("diff1.process.step4") },
                { step: "5", title: t("diff1.process.step5") },
              ].map((s, i) => (
                <div key={s.step} className="flex items-center gap-2">
                  <div className="bg-blue-50 rounded-xl p-3 text-center flex-1">
                    <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mx-auto mb-1.5">
                      {s.step}
                    </div>
                    <p className="font-semibold text-xs text-gray-900">
                      {s.title}
                    </p>
                  </div>
                  {i < 4 && (
                    <span className="text-gray-300 hidden md:block">{"\u2192"}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col">
            <h3 className="font-bold text-lg text-gray-900 mb-6">{t("diff1.kpi.title")}</h3>
            <div className="grid grid-cols-3 gap-4 flex-1 items-center">
              {[
                { label: t("diff1.kpi.employment"), value: "85%", color: "text-blue-600" },
                { label: t("diff1.kpi.settlement"), value: "65%", color: "text-green-600" },
                { label: t("diff1.kpi.satisfaction"), value: "95%", color: "text-amber-600" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="bg-gray-50 rounded-xl p-4 text-center"
                >
                  <p className={`text-3xl font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Differentiation2() {
  const { t } = useLanguage();
  return (
    <section className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold text-sm mb-2">
            {t("diff2.tag")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t("diff2.title")}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            {t("diff2.desc")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-lg">{"\u{1F393}"}</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{t("diff2.univ.title")}</h3>
                <p className="text-xs text-gray-400">{t("diff2.univ.sub")}</p>
              </div>
            </div>
            <ul className="space-y-2 mb-5">
              {[t("diff2.univ.item1"), t("diff2.univ.item2"), t("diff2.univ.item3")].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-blue-500 mt-0.5">{"\u2022"}</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex gap-6 pt-4 border-t border-gray-100">
              <div>
                <p className="text-2xl font-bold text-gray-900">{t("diff2.univ.stat1.value")}</p>
                <p className="text-xs text-gray-400">{t("diff2.univ.stat1.label")}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{t("diff2.univ.stat2.value")}</p>
                <p className="text-xs text-gray-400">{t("diff2.univ.stat2.label")}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <span className="text-amber-600 text-lg">{"\u2699\uFE0F"}</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{t("diff2.vocational.title")}</h3>
                <p className="text-xs text-gray-400">{t("diff2.vocational.sub")}</p>
              </div>
            </div>
            <ul className="space-y-2 mb-5">
              {[t("diff2.vocational.item1"), t("diff2.vocational.item2"), t("diff2.vocational.item3")].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-blue-500 mt-0.5">{"\u2022"}</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex gap-6 pt-4 border-t border-gray-100">
              <div>
                <p className="text-2xl font-bold text-gray-900">{t("diff2.vocational.stat1.value")}</p>
                <p className="text-xs text-gray-400">{t("diff2.vocational.stat1.label")}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{t("diff2.vocational.stat2.value")}</p>
                <p className="text-xs text-gray-400">{t("diff2.vocational.stat2.label")}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-lg">{"\u{1F4BC}"}</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{t("diff2.career.title")}</h3>
                <p className="text-xs text-gray-400">{t("diff2.career.sub")}</p>
              </div>
            </div>
            <ul className="space-y-2 mb-5">
              {[t("diff2.career.item1"), t("diff2.career.item2"), t("diff2.career.item3")].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-blue-500 mt-0.5">{"\u2022"}</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex gap-6 pt-4 border-t border-gray-100">
              <div>
                <p className="text-2xl font-bold text-gray-900">{t("diff2.career.stat1.value")}</p>
                <p className="text-xs text-gray-400">{t("diff2.career.stat1.label")}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{t("diff2.career.stat2.value")}</p>
                <p className="text-xs text-gray-400">{t("diff2.career.stat2.label")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col" style={{ wordBreak: "break-all" }}>
            <h3 className="font-bold text-lg text-gray-900 mb-6" style={{ wordBreak: "keep-all" }}>
              {t("diff2.process.title")}
            </h3>
            <div className="grid grid-cols-5 gap-3 flex-1 items-center">
              {[
                { step: "1", title: t("diff2.process.step1") },
                { step: "2", title: t("diff2.process.step2") },
                { step: "3", title: t("diff2.process.step3") },
                { step: "4", title: t("diff2.process.step4") },
                { step: "5", title: t("diff2.process.step5") },
              ].map((s, i) => (
                <div key={s.step} className="flex items-center gap-2">
                  <div className="bg-blue-50 rounded-xl p-3 text-center flex-1">
                    <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mx-auto mb-1.5">
                      {s.step}
                    </div>
                    <p className="font-semibold text-xs text-gray-900">
                      {s.title}
                    </p>
                  </div>
                  {i < 4 && (
                    <span className="text-gray-300 hidden md:block">{"\u2192"}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col">
            <h3 className="font-bold text-lg text-gray-900 mb-6">{t("diff2.kpi.title")}</h3>
            <div className="grid grid-cols-3 gap-4 flex-1 items-center">
              {[
                { label: t("diff1.kpi.employment"), value: "85%", color: "text-blue-600" },
                { label: t("diff1.kpi.settlement"), value: "65%", color: "text-green-600" },
                { label: t("diff1.kpi.satisfaction"), value: "95%", color: "text-amber-600" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="bg-gray-50 rounded-xl p-4 text-center"
                >
                  <p className={`text-3xl font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const { t } = useLanguage();
  return (
    <section id="contact" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold text-sm mb-2">
            {t("contact.tag")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t("contact.title")}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            {t("contact.desc")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: "\u{1F3DB}",
              title: t("contact.univ.title"),
              sub: t("contact.univ.sub"),
              items: [t("contact.univ.item1"), t("contact.univ.item2"), t("contact.univ.item3"), t("contact.univ.item4"), t("contact.univ.item5")],
            },
            {
              icon: "\u{1F3E2}",
              title: t("contact.gov.title"),
              sub: t("contact.gov.sub"),
              items: [t("contact.gov.item1"), t("contact.gov.item2"), t("contact.gov.item3"), t("contact.gov.item4"), t("contact.gov.item5")],
            },
            {
              icon: "\u{1F3ED}",
              title: t("contact.company.title"),
              sub: t("contact.company.sub"),
              items: [t("contact.company.item1"), t("contact.company.item2"), t("contact.company.item3"), t("contact.company.item4"), t("contact.company.item5")],
            },
          ].map((p) => (
            <div
              key={p.title}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900">{p.title}</h3>
                  <p className="text-xs text-gray-400">{p.sub}</p>
                </div>
              </div>
              <ul className="space-y-2.5 mb-6">
                {p.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <svg
                      className="w-4 h-4 text-blue-500 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:contact@k-dream.co.kr"
                className="block text-center w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors text-sm"
              >
                {t("contact.cta")}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-[#0a1628] text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            {t("footer.headline")}
            <br />
            {t("footer.headline2")}
          </h2>
          <p className="text-blue-200/70 max-w-2xl mx-auto">
            {t("footer.desc")}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: "\u{1F393}", title: t("footer.item1.title"), sub: t("footer.item1.sub") },
            { icon: "\u{1F4BC}", title: t("footer.item2.title"), sub: t("footer.item2.sub") },
            { icon: "\u{1F3E0}", title: t("footer.item3.title"), sub: t("footer.item3.sub") },
            { icon: "\u{1F3ED}", title: t("footer.item4.title"), sub: t("footer.item4.sub") },
          ].map((item) => (
            <div
              key={item.title}
              className="text-center bg-white/5 rounded-2xl p-6 border border-white/10"
            >
              <span className="text-2xl">{item.icon}</span>
              <p className="font-semibold mt-2">{item.title}</p>
              <p className="text-sm text-blue-200/60">{item.sub}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-xs">
              K
            </div>
            <span className="font-bold">K-DREAM Study Abroad Agency</span>
          </div>
          <p className="text-sm text-blue-200/50">
            &copy; 2026 K-DREAM. All rights reserved.
          </p>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-xs text-blue-200/40 leading-relaxed">
          <p>{t("footer.company")}</p>
          <p className="mt-1">{t("footer.address")}</p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <Header />
      <Hero />
      <About />
      <Services />
      <Stats />
      <Countries />
      <Partners />
      <StudentManagement />
      <Differentiation1 />
      <Differentiation2 />
      <Contact />
      <Footer />
    </LanguageProvider>
  );
}
