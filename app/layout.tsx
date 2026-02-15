import "./globals.css";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className="">
        <header>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </header>
        <main>{children}</main>

        <footer></footer>
      </body>
    </html>
  );
};

export default RootLayout;
