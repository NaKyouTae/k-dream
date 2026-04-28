"use client";

import { useState } from "react";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { href: "#about", label: "소개" },
    { href: "#services", label: "서비스" },
    { href: "#countries", label: "국가별 가이드" },
    { href: "#partners", label: "파트너십" },
    { href: "#contact", label: "문의" },
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
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a
            href="#contact"
            className="hidden md:inline-flex px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors"
          >
            협력 문의
          </a>
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="메뉴 열기"
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
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-3 text-gray-600 hover:text-blue-600 border-b border-gray-50"
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
            협력 문의
          </a>
        </div>
      )}
    </header>
  );
}

function Hero() {
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
              K-DREAM Study Abroad Agency
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
            비수도권 취업·정주 연계형
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              외국인 유학생 풀케어 플랫폼
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-200/80 max-w-2xl mx-auto mb-10">
            우즈베키스탄·몽골·베트남·중국 타깃, 사립 전문대/4년제 공대/관광·외식
            파트너로
            <br className="hidden sm:block" />
            &lsquo;입학~정주&rsquo;까지 원스톱 지원하는 차별화된 유학원
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#services"
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full transition-colors"
            >
              서비스 알아보기
            </a>
            <a
              href="#contact"
              className="px-8 py-3 border border-blue-400/30 text-blue-300 hover:bg-blue-500/10 font-medium rounded-full transition-colors"
            >
              협력 문의하기
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
          {[
            {
              icon: "🏛",
              label: "대상 대학",
              value: "사립 전문대 · 4년제 공대",
            },
            {
              icon: "🌏",
              label: "타깃 국가",
              value: "UZ · MN · VN · CN",
            },
            {
              icon: "📈",
              label: "시장 성장",
              value: "208,962 → 253,434명",
            },
            {
              icon: "✅",
              label: "인증대학",
              value: "158개교 협력",
            },
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
  return (
    <section id="about" className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold text-sm mb-2">
            ABOUT K-DREAM
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            비전 · 미션 · 핵심가치
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            비수도권 지역에서 취업과 정주를 연계하는 글로벌 유학생 유치 및 관리의
            최고 플랫폼
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl">🔭</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              비전 (Vision)
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              비수도권 취업·정주 연계 No.1 글로벌 유학 플랫폼
            </p>
            <p className="text-gray-700 leading-relaxed">
              외국인 유학생의{" "}
              <strong>학업성공 → 취업 → 정주</strong>를 통합 지원하여
              지역과 산업의 인력난을 해결합니다.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-green-600 text-xl">🎯</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              미션 (Mission)
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              학업성공-취업-정주 통합 지원
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>
                  <strong>학업성공:</strong> 한국어·전공 교육 지원, 학업 적응
                  관리
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>
                  <strong>취업연계:</strong> 산업별 맞춤형 현장실습·채용 매칭
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>
                  <strong>정주지원:</strong> 비자·주거·생활 안정화 프로그램
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: "🛡",
              title: "Compliance First",
              desc: "법규 준수 및 비자 관리 강화",
              color: "bg-blue-50 text-blue-600",
            },
            {
              icon: "🎓",
              title: "Student Success",
              desc: "학업 성취 및 취업 연계 지원",
              color: "bg-amber-50 text-amber-600",
            },
            {
              icon: "🤝",
              title: "Partnership Excellence",
              desc: "대학·기업 협력 강화",
              color: "bg-green-50 text-green-600",
            },
            {
              icon: "📊",
              title: "Data-Driven",
              desc: "데이터 기반 의사결정",
              color: "bg-purple-50 text-purple-600",
            },
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
  const steps = [
    {
      num: "01",
      title: "프리입국",
      subtitle: "준비 단계",
      color: "from-blue-500 to-blue-600",
      items: [
        "레벨테스트: 한국어 능력 진단",
        "TOPIK/면접 준비: 시험 대비",
        "비자 서류: D-2, D-4 비자 지원",
        "재정 플랜: 학비·생활비 설계",
      ],
      stats: [
        { label: "준비 기간", value: "2-4주" },
        { label: "비자 승인률", value: "95%" },
      ],
    },
    {
      num: "02",
      title: "입국·정착",
      subtitle: "정착 단계",
      color: "from-cyan-500 to-cyan-600",
      items: [
        "공항 픽업: 24시간 공항 수령",
        "외국인등록: 법무 서류 지원",
        "기숙사·주거: 기숙사 배정",
        "생활 오리엔테이션: 지역 적응",
      ],
      stats: [
        { label: "정착 완료", value: "1-2일" },
        { label: "만족도", value: "98%" },
      ],
    },
    {
      num: "03",
      title: "재학관리",
      subtitle: "학업 단계",
      color: "from-indigo-500 to-indigo-600",
      items: [
        "출결·학사 모니터링: 실시간 확인",
        "한국어 튜터링: TOPIK 4급 목표",
        "멘탈케어: 상담, 정서 지원",
        "중도탈락 예방: 조기 경보",
      ],
      stats: [
        { label: "출석률", value: "92%" },
        { label: "중도탈락률", value: "7%" },
      ],
    },
    {
      num: "04",
      title: "취업연계",
      subtitle: "취업 단계",
      color: "from-violet-500 to-violet-600",
      items: [
        "이력서·면접 코칭: 취업 준비",
        "현장실습·인턴: 기업 매칭",
        "기업탐방: 산업체 방문",
        "채용 매칭: 취업 연결",
      ],
      stats: [
        { label: "취업률", value: "85%" },
        { label: "평균 취업", value: "6개월" },
      ],
    },
    {
      num: "05",
      title: "정주지원",
      subtitle: "정착 단계",
      color: "from-pink-500 to-pink-600",
      items: [
        "비자전환: 취업비자 전환 지원",
        "주거·금융: 정주 지원",
        "커뮤니티: 네트워크 구축",
        "가족초청: 가족 초청 가이드",
      ],
      stats: [
        { label: "정주율", value: "78%" },
        { label: "평균 체류", value: "2년+" },
      ],
    },
  ];

  return (
    <section id="services" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold text-sm mb-2">
            FULL-CARE SYSTEM
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            5단계 풀케어 시스템
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            입학 전부터 정주까지, 외국인 유학생 전 과정을 관리합니다
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
  return (
    <section className="py-20 bg-gradient-to-br from-[#0a1628] via-[#0f2345] to-[#162d50]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            핵심 성과 지표
          </h2>
          <p className="text-blue-200/70">
            K-DREAM이 만들어가는 성과입니다
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              value: "208,962",
              unit: "명",
              label: "2024년 유학생",
              sub: "+14.9% YoY",
            },
            {
              value: "158",
              unit: "개",
              label: "인증대학",
              sub: "+24 전년 대비",
            },
            {
              value: "85",
              unit: "%",
              label: "취업률",
              sub: "졸업 6개월 내",
            },
            {
              value: "65.5",
              unit: "%",
              label: "정주율",
              sub: "졸업 후 체류",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center"
            >
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl sm:text-4xl font-bold text-white">
                  {s.value}
                </span>
                <span className="text-lg text-blue-300">{s.unit}</span>
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
  const countries = [
    {
      code: "UZ",
      name: "우즈베키스탄",
      tag: "1차 핵심 공략국",
      color: "bg-blue-500",
      stats: { y2024: "12,025", y2025: "15,786", growth: "+31%" },
      strategy: "전문대·공대·취업형",
      items: [
        "전문대/공대 중심 학위과정 유치",
        "경북 취업연계 제조·건설업 매칭",
        "파일럿 프로그램 빠른 성과 확인",
      ],
      channels: ["현지 에이전트", "설명회"],
    },
    {
      code: "MN",
      name: "몽골",
      tag: "안정형 확장국",
      color: "bg-amber-500",
      stats: { y2024: "12,317", y2025: "15,270", growth: "+24%" },
      strategy: "전문대+4년제 병행",
      items: [
        "안정적 규모 유지 및 확대",
        "풀케어 모델 생활정착 강화",
        "한국어 적응 지원 프로그램",
      ],
      channels: ["레퍼럴", "동문네트워크"],
    },
    {
      code: "VN",
      name: "베트남",
      tag: "성장형 대량 시장",
      color: "bg-green-500",
      stats: { y2024: "56,003", y2025: "75,144", growth: "+34%" },
      strategy: "어학→진학 전환형",
      items: [
        "대량 모집 어학연수 중심",
        "전환율 관리 진학 파이프라인",
        "지역/학과 세분화 전략",
      ],
      channels: ["디지털 마케팅", "SNS"],
    },
    {
      code: "CN",
      name: "중국",
      tag: "후순위 정밀 공략국",
      color: "bg-purple-500",
      stats: { y2024: "72,020", y2025: "76,541", growth: "+6%" },
      strategy: "틈새 전공·편입",
      items: [
        "관광외식·공대 세그먼트",
        "편입·대학원 연계 프로그램",
        "브랜드 대학 집중 공략",
      ],
      channels: ["중국어 채널", "위챗"],
    },
  ];

  return (
    <section id="countries" className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold text-sm mb-2">
            TARGET COUNTRIES
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            국가별 맞춤 유학 가이드
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            각 나라의 특성에 맞는 최적의 유학 방향을 안내합니다
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
                    <p className="text-xs text-gray-400">2024년</p>
                    <p className="text-lg font-bold text-gray-900">
                      {c.stats.y2024}
                    </p>
                  </div>
                  <div className="text-gray-300 pb-1">→</div>
                  <div>
                    <p className="text-xs text-gray-400">2025년</p>
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
                      <span className="text-blue-500 mt-0.5">•</span>
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
  return (
    <section id="partners" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold text-sm mb-2">
            PARTNERSHIP
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            대학 시장 수요와 파트너십
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            3개 우선 파트너 그룹의 시장 수요 분석 및 선정 기준
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: "🎓",
              title: "사립 전문대",
              sub: "취업·실습 강점",
              stat1: { label: "2024년", value: "24,366명" },
              stat2: { label: "2025년", value: "37,372명" },
              growth: "+53%",
              items: [
                "취업률 85% 이상, 현장실습 중심",
                "전문대 특화 제조·건설·관광 연계",
              ],
              ratio: "50%",
            },
            {
              icon: "⚙️",
              title: "4년제 공대",
              sub: "브랜드·장기가치",
              stat1: { label: "공학 비중", value: "15.6%" },
              stat2: { label: "성장률", value: "+23%" },
              growth: "확대",
              items: [
                "대학원 연계 석사·박사 진학률 65%",
                "산학협력 기업 연계 실습 강화",
              ],
              ratio: "30%",
            },
            {
              icon: "🍽",
              title: "관광·외식",
              sub: "진입장벽 낮음",
              stat1: { label: "전환율", value: "68%" },
              stat2: { label: "성장", value: "+45%" },
              growth: "고성장",
              items: [
                "어학→전공 전환 가능, 진입장벽 낮음",
                "취업 연계 관광·호텔·외식업",
              ],
              ratio: "20%",
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
                  비중 {p.ratio}
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
                    <span className="text-blue-500 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="font-bold text-lg text-gray-900 mb-6">
            경북 산업 맞춤 취업 연계
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { step: "1", title: "학과 선정", sub: "전문대/공대/관광" },
              { step: "2", title: "기업 매칭", sub: "제조/건설/관광" },
              { step: "3", title: "현장실습", sub: "직무 부트캠프" },
              { step: "4", title: "채용 연계", sub: "취업 매칭" },
              { step: "5", title: "정주 지원", sub: "지역 정착" },
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
                  <span className="text-gray-300 hidden lg:block">→</span>
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
  const stages = [
    {
      icon: "📋",
      title: "온보딩",
      period: "1~3개월",
      color: "from-blue-500 to-blue-600",
      items: [
        "입국 지원: 공항픽업, 숙소, 등록",
        "정착 지원: 기숙사·주거, 생활용품",
        "학교 적응: 캠퍼스 오리엔테이션, 버디",
      ],
      risk: "비자 연장",
    },
    {
      icon: "📚",
      title: "학업안착",
      period: "1~6개월",
      color: "from-green-500 to-green-600",
      items: [
        "학업 관리: 출석, 성적 모니터링",
        "한국어 지원: TOPIK 과정",
        "생활 지원: 은행, 보험, 통신",
      ],
      risk: "학업 부적응",
    },
    {
      icon: "🧭",
      title: "진로설계",
      period: "6~12개월",
      color: "from-amber-500 to-amber-600",
      items: [
        "진로 탐색: 적성·기업 탐방",
        "실습 연계: 현장실습 매칭",
        "역량 강화: 자격증, 이력서, 면접",
      ],
      risk: "진로 미결정",
    },
    {
      icon: "💼",
      title: "취업준비",
      period: "6~24개월",
      color: "from-violet-500 to-violet-600",
      items: [
        "기업 매칭: 산업별 취업 연계",
        "취업 지원: 이력서, 면접 코칭",
        "현장실습: 인턴·실습 프로그램",
      ],
      risk: "취업 실패",
    },
    {
      icon: "🏠",
      title: "정주",
      period: "24개월~",
      color: "from-pink-500 to-pink-600",
      items: [
        "비자 전환: 취업비자 전환 지원",
        "생활 안정: 주거·금융 지원",
        "커뮤니티: 지역 네트워크 구축",
      ],
      risk: "정주 실패",
    },
  ];

  return (
    <section id="management" className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold text-sm mb-2">
            STUDENT MANAGEMENT
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            유학생 관리 프로세스
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            온보딩부터 정착까지 체계적인 생애주기 관리 시스템
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
                  <ul className="space-y-2 mb-4">
                    {stage.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-1.5 text-xs text-gray-600"
                      >
                        <span className="text-blue-500 mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-3 border-t border-gray-100">
                    <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
                      <span>⚠️</span> 리스크: {stage.risk}
                    </span>
                  </div>
                </div>
              </div>
              {i < stages.length - 1 && (
                <span className="hidden lg:flex items-center text-gray-300 text-lg">
                  →
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
  return (
    <section id="diff1" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold text-sm mb-2">
            DIFFERENTIATION
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            경북 산업 맞춤 취업 연계
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            학과선정부터 기업매칭, 현장실습, 취업연계까지 지역 산업에 최적화된
            프로그램
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-lg">🎓</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">학과 매칭</h3>
                <p className="text-xs text-gray-400">
                  전문대학 · 공대 · 관광학과
                </p>
              </div>
            </div>
            <ul className="space-y-2 mb-5">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5">•</span>
                전문대학교 → 건설·관광학과
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5">•</span>
                4년제 공대 → 제조·기술
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5">•</span>
                관광학과/호텔 → 호텔·외식업
              </li>
            </ul>
            <div className="flex gap-6 pt-4 border-t border-gray-100">
              <div>
                <p className="text-2xl font-bold text-gray-900">50+</p>
                <p className="text-xs text-gray-400">학과</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">95%</p>
                <p className="text-xs text-gray-400">매칭률</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <span className="text-amber-600 text-lg">🏭</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">기업 매칭</h3>
                <p className="text-xs text-gray-400">
                  제조 · 건설 · 관광학과
                </p>
              </div>
            </div>
            <ul className="space-y-2 mb-5">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5">•</span>
                제조업: 기계·금속·화학
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5">•</span>
                건설업: 건축·토목·설비
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5">•</span>
                관광업: 호텔·외식업
              </li>
            </ul>
            <div className="flex gap-6 pt-4 border-t border-gray-100">
              <div>
                <p className="text-2xl font-bold text-gray-900">200+</p>
                <p className="text-xs text-gray-400">기업</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">78%</p>
                <p className="text-xs text-gray-400">매칭률</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-lg">💼</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">취업 연계</h3>
                <p className="text-xs text-gray-400">현장실습 → 취업</p>
              </div>
            </div>
            <ul className="space-y-2 mb-5">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5">•</span>
                현장실습 프로그램 운영
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5">•</span>
                채용 연계 매칭
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5">•</span>
                정주 지원 프로그램
              </li>
            </ul>
            <div className="flex gap-6 pt-4 border-t border-gray-100">
              <div>
                <p className="text-2xl font-bold text-gray-900">85%</p>
                <p className="text-xs text-gray-400">취업률</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">65%</p>
                <p className="text-xs text-gray-400">정주율</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="font-bold text-lg text-gray-900 mb-6">
              취업 연계 프로세스
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {[
                { step: "1", title: "학과 선정" },
                { step: "2", title: "기업 매칭" },
                { step: "3", title: "현장실습" },
                { step: "4", title: "매칭 연계" },
                { step: "5", title: "정주 지원" },
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
                    <span className="text-gray-300 hidden md:block">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="font-bold text-lg text-gray-900 mb-6">성과 지표</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "취업률", value: "85%", color: "text-blue-600" },
                { label: "정주율", value: "65%", color: "text-green-600" },
                { label: "만족도", value: "95%", color: "text-amber-600" },
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
  return (
    <section id="diff2" className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold text-sm mb-2">
            DUAL TRACK MODEL
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            대학 × 직업전문학교 협업
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            대학(학위)과 직업전문학교(기술)를 결합한 듀얼 트랙 모델
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-lg">🎓</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">대학(학위 과정)</h3>
                <p className="text-xs text-gray-400">
                  1~2년 이론 · 기초 교육
                </p>
              </div>
            </div>
            <ul className="space-y-2 mb-5">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5">•</span>
                학위 취득: 전문학사/학사
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5">•</span>
                기초 이론/전공 기초 교육
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5">•</span>
                한국어/TOPIK 3급 달성
              </li>
            </ul>
            <div className="flex gap-6 pt-4 border-t border-gray-100">
              <div>
                <p className="text-2xl font-bold text-gray-900">2년</p>
                <p className="text-xs text-gray-400">과정 기간</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">95%</p>
                <p className="text-xs text-gray-400">이수율</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <span className="text-amber-600 text-lg">⚙️</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">직업전문학교</h3>
                <p className="text-xs text-gray-400">
                  실무 교육 · 현장 중심 기술
                </p>
              </div>
            </div>
            <ul className="space-y-2 mb-5">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5">•</span>
                실무 교육/현장 중심 기술
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5">•</span>
                산학협력/기업 연계
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5">•</span>
                취업 준비: 이력서·면접
              </li>
            </ul>
            <div className="flex gap-6 pt-4 border-t border-gray-100">
              <div>
                <p className="text-2xl font-bold text-gray-900">1년</p>
                <p className="text-xs text-gray-400">과정 기간</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">90%</p>
                <p className="text-xs text-gray-400">이수율</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-lg">💼</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">취업 · 정주</h3>
                <p className="text-xs text-gray-400">현장실습 → 취업</p>
              </div>
            </div>
            <ul className="space-y-2 mb-5">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5">•</span>
                취업 매칭: 기업 연계
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5">•</span>
                정주 지원: 비자·주거
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5">•</span>
                커뮤니티 네트워크 구축
              </li>
            </ul>
            <div className="flex gap-6 pt-4 border-t border-gray-100">
              <div>
                <p className="text-2xl font-bold text-gray-900">85%</p>
                <p className="text-xs text-gray-400">취업률</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">65%</p>
                <p className="text-xs text-gray-400">정주율</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="font-bold text-lg text-gray-900 mb-6">
              듀얼 트랙 프로세스
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {[
                { step: "1", title: "입학" },
                { step: "2", title: "대학(1~2년)" },
                { step: "3", title: "직업전문학교" },
                { step: "4", title: "현장 실습" },
                { step: "5", title: "취업·정주" },
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
                    <span className="text-gray-300 hidden md:block">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="font-bold text-lg text-gray-900 mb-6">성과 지표</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "취업률", value: "85%", color: "text-blue-600" },
                { label: "정주율", value: "65%", color: "text-green-600" },
                { label: "만족도", value: "95%", color: "text-amber-600" },
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
  return (
    <section id="contact" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold text-sm mb-2">
            PARTNERSHIP
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            제휴 제안 및 협력 요청
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            대학·지자체·기업 맞춤 트랙을 함께 설계합니다
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: "🏛",
              title: "대학",
              sub: "전형쿼터·장학·기숙사·한국어",
              items: [
                "외국인 유학생 전형쿼터 확보",
                "장학금 및 학비 지원",
                "기숙사 우선 배정",
                "TOPIK 준비 과정",
                "현장실습 연계",
              ],
            },
            {
              icon: "🏢",
              title: "지자체",
              sub: "취업박람회·정주·생활행정",
              items: [
                "정기적 취업 박람회 개최",
                "지역 정착 지원",
                "외국인등록 등 지원",
                "주거·금융 지원",
                "동네 활동 지원",
              ],
            },
            {
              icon: "🏭",
              title: "기업",
              sub: "실습·인턴·채용·커리큘럼",
              items: [
                "현장실습 기회 제공",
                "정규직 전환 지원",
                "맞춤형 교육",
                "직무 훈련",
                "최적 인재 추천",
              ],
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
                협력 문의
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0a1628] text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            K-DREAM은 &lsquo;입학~정주&rsquo; 통합 플랫폼으로
            <br />
            지역과 산업, 학생 모두의 성과를 만듭니다.
          </h2>
          <p className="text-blue-200/70 max-w-2xl mx-auto">
            비수도권 취업·정주 연계형 외국인 유학생 풀케어 시스템을 통해 대학의
            인재 다양성, 기업의 적시 인력 확보, 지역 경제 활성화를 동시에
            실현합니다.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: "🎓", title: "학업 성공", sub: "TOPIK 4급 달성" },
            { icon: "💼", title: "취업 연계", sub: "85% 취업률" },
            { icon: "🏠", title: "정주 지원", sub: "지역 정착" },
            { icon: "🏭", title: "산업 협력", sub: "기업 매칭" },
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
          <p>
            주식회사 케이드림유학원 | 대표자: 이현정 | 사업자등록번호:
            603-87-03414
          </p>
          <p className="mt-1">
            사업장 소재지: 경상북도 포항시 남구 대이로63번길 8, 2층(대장동) |
            업태: 교육서비스업 | 종목: 유학알선
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <>
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
    </>
  );
}
