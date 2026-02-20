import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// 1. Importa tu componente
import ChatBot from "../app/chatbot/chatbot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "X-Learning Online",
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
        {/* Contenido principal de la app */}
        {children}

        {/* 2. El ChatBot cargado globalmente. 
          Si el componente ChatBot ya tiene el "use client" arriba, 
          esto debería funcionar sin problemas.
        */}
        <ChatBot />
      </body>
    </html>
  );
}
