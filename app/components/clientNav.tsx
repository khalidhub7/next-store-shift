"use client";
import Link from "next/link";
import styles from "./Header.module.css";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const ClientNav = () => {
  const currentPath = usePathname();
  return (
    <nav className="">
      <ul className="flex w-3/4 justify-end gap-4">
        <li>
          <Button
            asChild
            size="lg"
            variant="outline"
            className={currentPath === "/" ? styles.active : undefined}
          >
            <Link href="/">home</Link>
          </Button>
        </li>
        <li>
          <Button
            asChild
            size="lg"
            variant="outline"
            className={currentPath === "/login" ? styles.active : undefined}
          >
            <Link href="/login">sign(in/up)</Link>
          </Button>
        </li>
        <li>
          <Button
            asChild
            size="lg"
            variant="outline"
            className={currentPath === "/about" ? styles.active : undefined}
          >
            <Link href="/about">about</Link>
          </Button>
        </li>
        <li>
          <Button
            asChild
            size="lg"
            variant="outline"
            className={currentPath === "/products" ? styles.active : undefined}
          >
            <Link href="/products">products</Link>
          </Button>
        </li>
      </ul>
    </nav>
  );
};

export default ClientNav;
