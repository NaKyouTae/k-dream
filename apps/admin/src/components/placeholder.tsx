export function Placeholder({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-sm text-muted">
        준비 중입니다.
      </div>
    </div>
  );
}
