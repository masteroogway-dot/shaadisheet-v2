import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }

    await resend.emails.send({
      from: "ShaadiSheet Contact <onboarding@resend.dev>",
      to: "theshaadisheet@gmail.com",
      replyTo: email,
      subject: `[Contact] ${subject || "No subject"} - ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #8B0000; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Subject:</strong> ${subject || "No subject"}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #8B0000;">
            ${message.replace(/\n/g, "<br/>")}
          </div>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #888; font-size: 12px;">Reply directly to this email to respond to ${name}.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
