import * as React from "react";
import { Tailwind, Section, Text, Button, Img } from "@react-email/components";
import { FooterSection } from "./FooterSection";

interface AccountCreationEmailProps {
  userDetails: { name: string };
  accountType: string;
  serverUrl: string;
  clientUrl: string;
}

const AccountCreationEmail: React.FC<AccountCreationEmailProps> = ({
  userDetails,
  accountType,
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
            Welcome to Verify@Dev
          </Text>
          <Text className="text-zinc-300 mb-4">Dear {userDetails.name},</Text>
          <Text className="text-zinc-400 mb-4">
            {accountType === "organization"
              ? "Your organization account has been successfully created! You can now manage events, members, and more."
              : "Your member account has been successfully created! You can now participate in events and verify your certificates."}
          </Text>
          <Button
            href={`${clientUrl}/login`}
            className="bg-blue-600 rounded-lg text-center px-4 py-2 font-medium text-white mt-4"
          >
            Log In to Your Account
          </Button>
          <Text className="text-zinc-400 mt-6">
            Thank you for joining us. If you have any questions, feel free to reach out.
          </Text>
          <FooterSection serverUrl={serverUrl} />
        </Section>
      </Section>
    </Tailwind>
  );
};

(AccountCreationEmail as any).PreviewProps = {
  userDetails: {
    name: "Rahul"
  },
  accountType: "organization",
  serverUrl: "http://localhost:4000",
  clientUrl: "http://localhost:3000"
};

export default AccountCreationEmail;
