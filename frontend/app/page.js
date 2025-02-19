"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar.js";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Always redirect to login page
    router.replace("/auth/login");
  }, [router]);

  return null;
}
