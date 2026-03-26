import ClientNav from "./ClientNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => (
  <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
    <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
      {/* Brand / Avatar */}
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 ring-2 ring-primary/20 ring-offset-2">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
            av
          </AvatarFallback>
        </Avatar>
        <span className="font-semibold text-gray-800 text-sm hidden sm:block">
          store
        </span>
      </div>

      {/* Nav */}
      <ClientNav />
    </div>
  </header>
);

export default Header;
