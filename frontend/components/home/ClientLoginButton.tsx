"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ClientLoginButton() {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("sessionToken");
    if (token) {
      setHasToken(true);
    }
  }, []);

  if (hasToken) return null;

  return (
    <Button asChild className="fixed top-2 right-2" variant="outline" size="sm">
      <Link href="/login">Login</Link>
    </Button>
  );
}
