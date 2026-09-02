import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { readStaffFromToken } from "@/lib/staff-token";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 첫 렌더부터 역할을 알아야 메뉴가 2개 → 6개로 늘어나며 깜빡이지 않는다.
  // 실제 권한 검사는 API 서버가 한다.
  const token = (await cookies()).get("admin_token")?.value;

  return <AppShell initialStaff={readStaffFromToken(token)}>{children}</AppShell>;
}
