"use server";

import { prisma } from "@/lib/prisma";

export async function submitContact(prevState, formData) {
  const fullName = formData.get("fullName")?.trim();
  const email = formData.get("email")?.trim();
  const subject = formData.get("subject")?.trim();
   const companyName = formData.get("companyName")?.trim();

  const message = formData.get("message")?.trim();

  const errors = {};

  // ✅ Required validations
  if (!fullName) errors.fullName = "Full name is required";

  if (!email) {
    errors.email = "Email is required";
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "Enter a valid email address";
  }

  if (!subject) errors.subject = "Subject is required";
  if (!companyName) errors.companyName = "Company name is required";

  // if (!message) errors.message = "Message is required";

  // ❌ Return errors with previous values
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      values: { fullName, email, subject, companyName, message },
    };
  }

  // ✅ Prisma insert
  await prisma.contact_form.create({
    data: {
      fullName,
      email,
      subject,
      message,
        companyName,
    },
  });

  return {
    success: true,
    errors: {},
    values: {},
  };
}
