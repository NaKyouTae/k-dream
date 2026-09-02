"use client";

import { useRouter } from "next/navigation";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  /** 모바일 카드의 제목으로 쓴다 */
  primary?: boolean;
  /** 모바일 카드에서는 숨긴다 */
  hideOnMobile?: boolean;
  /** 데스크톱 셀에 붙일 클래스 */
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  empty: string;
  actions?: (row: T) => React.ReactNode;
  /** 값을 주면 행(모바일은 카드) 전체가 클릭 가능해진다 */
  rowHref?: (row: T) => string;
}

/**
 * 데스크톱은 표, 모바일은 카드로 같은 데이터를 보여준다.
 * 좁은 화면에서 8열짜리 표를 가로 스크롤로 보는 것보다 읽기 쉽다.
 */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  loading,
  empty,
  actions,
  rowHref,
}: Props<T>) {
  const router = useRouter();
  const colSpan = columns.length + (actions ? 1 : 0);
  const primary = columns.find((c) => c.primary) ?? columns[0];
  const rest = columns.filter((c) => c !== primary && !c.hideOnMobile);

  /** 행 안의 링크·버튼을 눌렀을 때는 그쪽 동작을 그대로 둔다 */
  function handleRowClick(row: T, e: React.MouseEvent) {
    if (!rowHref) return;
    if ((e.target as HTMLElement).closest("a, button, input, select")) return;
    router.push(rowHref(row));
  }

  const rowClass = rowHref
    ? "cursor-pointer transition-colors hover:bg-[#2F6BFF]/[0.045]"
    : "transition-colors hover:bg-black/[0.02]";

  return (
    <>
      {/* 데스크톱 */}
      <div className="hidden overflow-x-auto rounded-2xl border border-border bg-surface md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 font-medium whitespace-nowrap">
                  {c.header}
                </th>
              ))}
              {actions && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {loading && <Message colSpan={colSpan} text="불러오는 중…" />}
            {!loading && rows.length === 0 && (
              <Message colSpan={colSpan} text={empty} />
            )}
            {!loading &&
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={(e) => handleRowClick(row, e)}
                  className={`border-b border-border last:border-0 ${rowClass}`}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3 ${c.className ?? ""}`}>
                      {c.cell(row)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* 모바일 */}
      <div className="space-y-3 md:hidden">
        {loading && <CardMessage text="불러오는 중…" />}
        {!loading && rows.length === 0 && <CardMessage text={empty} />}
        {!loading &&
          rows.map((row) => (
            <div
              key={row.id}
              onClick={(e) => handleRowClick(row, e)}
              className={`rounded-2xl border border-border bg-surface p-4 ${
                rowHref ? "cursor-pointer active:bg-black/[0.02]" : ""
              }`}
            >
              <div className="text-sm font-semibold break-all">
                {primary.cell(row)}
              </div>
              <dl className="mt-3 space-y-1.5">
                {rest.map((c) => (
                  <div key={c.key} className="flex gap-3 text-sm">
                    <dt className="w-24 shrink-0 text-muted">{c.header}</dt>
                    <dd className="min-w-0 break-words">{c.cell(row)}</dd>
                  </div>
                ))}
              </dl>
              {actions && (
                <div className="mt-3 flex justify-end border-t border-border pt-3">
                  {actions(row)}
                </div>
              )}
            </div>
          ))}
      </div>
    </>
  );
}

function Message({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-muted">
        {text}
      </td>
    </tr>
  );
}

function CardMessage({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-4 py-12 text-center text-sm text-muted">
      {text}
    </div>
  );
}
