import "./globals.css";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button"
import Link from "next/link";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className="">
        <header className="flex h-14 border border-gray-200 items-center justify-between px-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          {/* nav */}

          <Button>
            <Link>
            
            </Link>
          </Button>
          
        </header>
        <main>{children}</main>

        <footer></footer>
      </body>
    </html>
  );
};

export default RootLayout;
