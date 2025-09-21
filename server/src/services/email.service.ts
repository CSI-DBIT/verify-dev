import { Resend } from "resend";
import React, { ReactNode } from "react";
import ReactDOMServer from "react-dom/server";

// Initialize Resend with the environment variable
const resend = new Resend("re_61ujgSuA_JuC4img8DWTEsB5yCzfbGxbv");

interface EmailOptions {
  from: string;
  to: string | string[];
  subject: string;
  component: ReactNode;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const { from, to, subject, component } = options;
  const html = ReactDOMServer.renderToStaticMarkup(component);
  try {
    await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}
