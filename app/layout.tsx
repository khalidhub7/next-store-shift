import "./globals.css";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className="">{children}</body>
    </html>
  );
};

export default RootLayout;