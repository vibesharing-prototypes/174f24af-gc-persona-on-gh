import "./globals.css";

export const metadata = {
  title: "IPO & M&A Readiness",
  description: "CFO journey validation: sell-side M&A and IPO readiness dashboard prototype",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
