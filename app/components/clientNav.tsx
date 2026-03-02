import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ClientNav = () => {
  return (
    <nav className="">
      <ul className="flex w-3/4 justify-end gap-4">
        <li>
          <Button asChild size="lg" variant="outline">
            <Link href="/">home</Link>
          </Button>
        </li>
        <li>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">sign(in/up)</Link>
          </Button>
        </li>
        <li>
          <Button asChild size="lg" variant="outline">
            <Link href="/about">about</Link>
          </Button>
        </li>
        <li>
          <Button asChild size="lg" variant="outline">
            <Link href="/products">products</Link>
          </Button>
        </li>
      </ul>
    </nav>
  );
};

export default ClientNav;
