const STATS = [
  { label: "상담문의", value: "—" },
  { label: "진행중 유학생", value: "—" },
  { label: "제휴기관", value: "—" },
  { label: "정주 연계", value: "—" },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-bold">대시보드</h1>
      <p className="mt-1 text-sm text-muted">
        서버 API 연동 전 스켈레톤 화면입니다.
      </p>

      <div className="mt-6 grid grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <div className="text-sm text-muted">{stat.label}</div>
            <div className="mt-2 text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
