import "./globals.css";
import Header from "./components/Header";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={`min-h-screen flex flex-col ${roboto.className}`}>
        <Header />
        <main className="flex-1">{children}</main>

        <footer className="flex h-14 border border-gray-200 items-center justify-center relative bottom-0 w-full mt-10">
          <p>learn next js</p>
        </footer>
      </body>
    </html>
  );
};

export default RootLayout;
