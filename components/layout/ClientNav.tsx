"use client";

import Link from "next/link";
import styles from "./Header.module.css";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "home" },
  { href: "/products", label: "products" },
  { href: "/about", label: "about" },
  { href: "/login", label: "sign(in/up)" },
];

const ClientNav = () => {
  const currentPath = usePathname();

  return (
    <nav>
      <ul className="flex w-3/4 justify-end gap-2 items-center">
        {links.map(({ href, label }) => {
          const isActive =
            href === "/" ? currentPath === "/" : currentPath.startsWith(href);

          return (
            <li key={href}>
              <Button
                asChild
                variant="outline"
                className={`
                  text-sm capitalize tracking-wide transition-all duration-200
                  hover:scale-105
                  ${isActive ? styles.active : "text-muted-foreground hover:text-foreground"}
                `}
              >
                <Link href={href}>{label}</Link>
              </Button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default ClientNav;
