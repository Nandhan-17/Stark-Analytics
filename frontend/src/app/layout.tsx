import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stark Analytics",
  description: "Automated Full-Stack Data Engineering, ML Analytics & Visualization Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
