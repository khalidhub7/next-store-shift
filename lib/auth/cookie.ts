import { cookies } from "next/headers";

const cookieOptions: Parameters<Awaited<ReturnType<typeof cookies>>["set"]>[2] =
  {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    // maxAge: 60 * 60 * 24 * 3,
    maxAge: 60,
  };

export { cookieOptions };
