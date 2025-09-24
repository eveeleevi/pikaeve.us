import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientShell from "./ClientShell";
import { ImageConfigProvider } from "./ImageConfig";
import { ColorConfigProvider } from "./ColorConfig";
import { LinksConfigProvider } from "./LinksConfig";
import { ProfileConfigProvider } from "./ProfileConfig";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PikaPika",
  description: "PikaPika - Your awesome portfolio site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ImageConfigProvider>
          <ColorConfigProvider>
            <LinksConfigProvider>
              <ProfileConfigProvider>
                <ClientShell>{children}</ClientShell>
              </ProfileConfigProvider>
            </LinksConfigProvider>
          </ColorConfigProvider>
        </ImageConfigProvider>
      </body>
    </html>
  );
}
