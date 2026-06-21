import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up / Register",
  description: "Create your Mi Tutora account to access top tutors or start teaching across India.",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
