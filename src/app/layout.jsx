import "./globals.css";

export const metadata = {
  title: "Greenhouse Monitor",
  description: "Sistem Monitoring & Kontrol Otomatis Greenhouse",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-slate-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}