import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login / Portal Access",
  description: "Login to your Mi Tutora student or teacher account to manage your classes, schedules, and earnings.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
