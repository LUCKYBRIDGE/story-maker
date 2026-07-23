import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "이야기별 · 스토리게임 스튜디오",
  description:
    "토끼와 자라, 옹고집전의 캐릭터와 배경을 골라 나만의 스토리게임을 만드세요.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
