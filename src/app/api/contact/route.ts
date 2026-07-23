import { NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }

    const rl = rateLimit(`contact:${email}`, 3, 300_000);
    if (!rl.allowed) return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });

    const safeName = escapeHtml(String(name).slice(0, 100));
    const safeEmail = escapeHtml(String(email).slice(0, 200));
    const safeSubject = escapeHtml(String(subject || "No subject").slice(0, 200));
    const safeMessage = escapeHtml(String(message).slice(0, 5000)).replace(/\n/g, "<br/>");

    await resend.emails.send({
      from: "ShaadiSheet Contact <onboarding@resend.dev>",
      to: "theshaadisheet@gmail.com",
      replyTo: email,
      subject: `[Contact] ${safeSubject} - ${safeName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #8B0000; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #8B0000;">
            ${safeMessage}
          </div>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #888; font-size: 12px;">Reply directly to this email to respond to ${safeName}.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
