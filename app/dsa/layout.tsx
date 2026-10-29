import type { Metadata } from "next";
import "./dsa.css";

export const metadata: Metadata = {
  title: { default: "DSA · kartikvyas.in", template: "%s · DSA · kartikvyas.in" },
  description: "Data structures and algorithms, self-paced: one railway line of 30 stations.",
};

export default function DsaLayout({ children }: { children: React.ReactNode }) {
  return <div className="dsa">{children}</div>;
}
