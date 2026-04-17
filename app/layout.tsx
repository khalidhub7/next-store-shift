import "./globals.css";
import { Roboto } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/sonner";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"] });

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={`min-h-screen flex flex-col ${roboto.className}`}>
        <Header />
        <main className="flex-1">{children}</main>

        <footer className="flex h-14 border border-gray-200 items-center justify-center relative bottom-0 w-full mt-10">
          <p>learn next js</p>
        </footer>
        <Toaster richColors theme="light" />
      </body>
    </html>
  );
};

export default RootLayout;
