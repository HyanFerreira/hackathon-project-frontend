import type { Metadata } from "next";
import { AppProviders } from "@/contexts/AppProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acessar sistema",
  description: "Tela de login do sistema",
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
