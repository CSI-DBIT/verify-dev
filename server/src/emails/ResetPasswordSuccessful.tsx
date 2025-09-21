import * as React from "react";
import { Tailwind, Section, Text, Button, Img } from "@react-email/components";
import { FooterSection } from "./FooterSection";

interface ResetPasswordSuccessEmailProps {
  userDetails: {
    name: string;
  };
  serverUrl: string;
  clientUrl: string;
}

const ResetPasswordSuccessEmail: React.FC<ResetPasswordSuccessEmailProps> = ({
  userDetails,
  serverUrl,
  clientUrl,
}) => {
  return (
    <Tailwind>
      <Section className="flex justify-center items-center w-full min-h-screen bg-zinc-800 text-white font-sans">
        <Section className="max-w-md w-full bg-zinc-900 rounded-lg shadow-lg p-6">
          <Section className="flex justify-center mb-6">
            <Img
              src={`${serverUrl}/public/images/verifydev_light_name_logo.png`}
              alt="Logo"
              className="h-24 w-auto"
            />
          </Section>
          <Text className="text-2xl font-bold text-white capitalize mb-4 text-center">
            Password Reset Successful
          </Text>
          <Text className="text-zinc-300 mb-4">Dear {userDetails.name},</Text>
          <Text className="text-zinc-400 mb-4">
            Your password has been successfully reset. If you did not request
            this change, please contact our support team immediately.
          </Text>
          <FooterSection serverUrl={serverUrl} />
        </Section>
      </Section>
    </Tailwind>
  );
};

(ResetPasswordSuccessEmail as any).PreviewProps = {
    userDetails: {
      name: "Rahul",
    },
    serverUrl: "http://localhost:4000",
    clientUrl: "http://localhost:3000",
  };
  

export default ResetPasswordSuccessEmail;
