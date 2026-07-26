import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "놀퀴즈 스토리 스튜디오",
  description:
    "대사와 해설을 쓰고 캐릭터와 배경을 골라 나만의 스토리게임을 만드는 놀퀴즈 창작 도구입니다.",
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
