import * as React from "react";
import { Tailwind, Section, Text, Button, Img, Html, Head, Preview, Body, Container } from "@react-email/components";
import { FooterSection } from "./FooterSection";

interface ResetPasswordEmailProps {
  userDetails: { name: string };
  resetLink: string;
  serverUrl: string;
}

const ResetPasswordEmail: React.FC<ResetPasswordEmailProps> = ({ userDetails, resetLink, serverUrl }) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your Verify@Dev password - Link expires in 15 minutes</Preview>
      <Tailwind>
        <Body className="bg-zinc-800 font-sans">
          <Container className="mx-auto pt-8 pb-8">
            <Section className="max-w-md w-full bg-zinc-900 rounded-lg shadow-lg p-6">
              {/* Logo Section */}
              <Section className="flex justify-center mb-6">
                <Img
                  src={`${serverUrl}/public/images/verifydev_light_name_logo.png`}
                  alt="Verify@Dev Logo"
                  width="240"
                  height="96"
                />
              </Section>

              {/* Title and Salutation */}
              <Text className="text-2xl font-bold text-white capitalize mb-4 text-center">
                Password Reset Request
              </Text>
              <Text className="text-zinc-300 mb-4">Dear {userDetails.name},</Text>

              {/* Message Body */}
              <Text className="text-zinc-400 mb-4">
                We received a request to reset your password. If this was you,
                please click the button below to reset your password. This link will
                expire in 15 minutes.
              </Text>

              {/* Reset Password Button */}
              <Section className="text-center">
                <Button
                  href={resetLink}
                  className="bg-blue-600 rounded-lg text-center px-4 py-2 font-medium text-white mt-4"
                >
                  Reset Password
                </Button>
              </Section>

              {/* Security Notice */}
              <Text className="text-zinc-400 mt-6 text-sm">
                For security, this request was received from IP address [IP_ADDRESS]. If you did not request a password reset, please ignore this email or contact support if you have any concerns.
              </Text>

              <FooterSection serverUrl={serverUrl} />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

(ResetPasswordEmail as any).PreviewProps = {
  userDetails: {
    name: "John Doe"
  },
  resetLink: "http://localhost:3000/reset-password?token=your_reset_token",
  serverUrl: "http://localhost:4000"
};

export default ResetPasswordEmail;
