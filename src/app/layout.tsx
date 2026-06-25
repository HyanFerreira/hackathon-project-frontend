import type { Metadata } from "next";
import { AppProviders } from "@/contexts/AppProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hackathon Project",
  description: "Hackathon project frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
