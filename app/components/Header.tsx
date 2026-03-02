import ClientNav from "./clientNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => (
  <header className="bg-gray-50 flex h-14 border border-gray-200 items-center justify-between px-4">
    {/* avatar */}
    <Avatar size="lg">
      <AvatarImage src="https://github.com/shadcn.png" />
      <AvatarFallback>avatar</AvatarFallback>
    </Avatar>
    {/* client nav */}

    <ClientNav />
  </header>
);

export default Header;
