"use client";

import { useEffect } from "react";
import clarity from "@microsoft/clarity";

export default function ClarityInit() {
  useEffect(() => {
    clarity.init("vuq8f18lof"); // your clarity project id
  }, []);

  return null;
}