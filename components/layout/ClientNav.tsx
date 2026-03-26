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
      <ul className="flex w-3/4 justify-end gap-4">
        {links.map(({ href, label }) => {
          const isActive =
            href === "/" ? currentPath === "/" : currentPath.startsWith(href);

          return (
            <li key={href}>
              <Button
                asChild
                variant="outline"
                className={isActive ? styles.active : ""}
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
