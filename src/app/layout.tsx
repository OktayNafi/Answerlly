import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Answerly - AI Phone Receptionist",
  description:
    "Never miss a call again. Answerly answers every call, collects caller details, and notifies you instantly.",
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
