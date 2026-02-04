import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google"; // Using a similar font to current google font
import "./globals.css";
import { TrackerProvider } from "@/context/TrackerContext";
import AppShell from "@/components/layout/AppShell";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Issue Tracker",
  description: "Internal Issue Tracker Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.className}>
        <TrackerProvider>
          <AppShell>
            {children}
          </AppShell>
        </TrackerProvider>
      </body>
    </html>
  );
}
