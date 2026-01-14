import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { Providers } from "@/components/providers/Providers";

// Styles
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Muninn",
  description: "TTRPG Combat Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <Providers>
          <MantineProvider>
            <Notifications
              position="top-center"
              limit={10}
              zIndex={1000}
              styles={{
                notification: {
                  backgroundColor: 'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-6))',
                },
              }}
            />
            {children}
          </MantineProvider>
        </Providers>
      </body>
    </html>
  );
}
