import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => (
  <header className="flex h-14 border border-gray-200 items-center justify-between px-4">
    <Avatar size="lg">
      <AvatarImage src="https://github.com/shadcn.png" />
      <AvatarFallback>avatar</AvatarFallback>
    </Avatar>
    {/* nav */}

    <nav className="">
      <ul className="flex w-3/4 justify-end gap-4">
        <li>
          <Button asChild size="sm" variant="outline">
            <Link href="/">home</Link>
          </Button>
        </li>
        <li>
          <Button asChild size="sm" variant="outline">
            <Link href="/login">sign(in/up)</Link>
          </Button>
        </li>
        <li>
          <Button asChild size="sm" variant="outline">
            <Link href="/about">about</Link>
          </Button>
        </li>
        <li>
          <Button asChild size="sm" variant="outline">
            <Link href="/products">products</Link>
          </Button>
        </li>
      </ul>
    </nav>
  </header>
);

export default Header;
