import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the ShaadiSheet team. Questions, suggestions, partnership inquiries — we'd love to hear from you.",
  openGraph: {
    title: "Contact Us | ShaadiSheet",
    description: "Get in touch with the ShaadiSheet team.",
    url: "https://www.shaadisheet.com/contact",
  },
};

export default function ContactPage() {
  return <ContactForm />;
}
