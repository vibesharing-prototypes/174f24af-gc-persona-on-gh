import "./globals.css";

export const metadata = {
  title: "GC Persona - Command Center",
  description: "General Counsel persona dashboard prototype",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
