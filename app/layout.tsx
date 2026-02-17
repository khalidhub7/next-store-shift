import "./globals.css";
import Header from "./Header";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>

        <footer className="flex h-14 border border-gray-200 items-center justify-center realtive bottom-0 w-full mt-10">
          <p>learn next js</p>
        </footer>
      </body>
    </html>
  );
};

export default RootLayout;
