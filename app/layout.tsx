import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// 1. Importa tu componente (ajusta la ruta según donde lo guardaste)
import ChatBot from "../app/chatbot/chatbot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "X-Learning ONline",
  description: "Plataforma de aprendizaje de inglés con IA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* Aquí va todo el contenido de tus páginas */}
        {children}

        {/* 2. El ChatBot aquí abajo para que flote sobre todo */}
        <ChatBot />
      </body>
    </html>
  );
}