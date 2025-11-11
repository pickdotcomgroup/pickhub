import { NextResponse } from "next/server";
import { auth } from "~/server/auth";

interface RequestBody {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  message: string;
  projectTitle: string;
  applicationId: string;
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as RequestBody;
    const { recipientEmail, recipientName, subject, message, projectTitle, applicationId } = body;

    // Validate required fields
    if (!recipientEmail || !recipientName || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // In a production environment, you would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Resend
    // - Nodemailer with SMTP
    
    // For now, we'll simulate the email sending and log it
    console.log("=== INTERVIEW EMAIL ===");
    console.log("From:", session.user.email);
    console.log("To:", recipientEmail);
    console.log("Subject:", subject);
    console.log("Message:", message);
    console.log("Project:", projectTitle);
    console.log("Application ID:", applicationId);
    console.log("=====================");

    // TODO: Integrate with actual email service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to: recipientEmail,
    //   from: process.env.VERIFIED_SENDER_EMAIL,
    //   subject: subject,
    //   html: message,
    // });

    return NextResponse.json({
      success: true,
      message: "Interview invitation sent successfully",
      data: {
        recipientEmail,
        recipientName,
        subject,
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error sending interview invitation:", error);
    return NextResponse.json(
      { error: "Failed to send interview invitation" },
      { status: 500 }
    );
  }
}
