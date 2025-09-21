import * as React from "react";
import { Tailwind, Section, Text, Button, Img, Html, Head, Preview, Body, Container } from "@react-email/components";
import { FooterSection } from "./FooterSection";

interface OrganizationDetails {
  name: string;
  id: string;
}

interface UserDetails {
  name: string;
}

interface JoinedOrganizationEmailProps {
  organizationDetails: OrganizationDetails;
  userDetails: UserDetails;
  serverUrl: string;
  clientUrl: string;
}

const JoinedOrganizationEmail: React.FC<JoinedOrganizationEmailProps> = ({
  organizationDetails,
  userDetails,
  serverUrl,
  clientUrl,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to {organizationDetails.name}! You're now a member.</Preview>
      <Tailwind>
        <Body className="bg-zinc-800 font-sans">
          <Container className="mx-auto pt-8 pb-8">
            <Section className="max-w-md w-full bg-zinc-900 rounded-lg shadow-lg p-6">
              <Section className="flex justify-center mb-6">
                <Img
                  src={`${serverUrl}/public/images/verifydev_light_name_logo.png`}
                  alt="Verify@Dev Logo"
                  width="240"
                  height="96"
                />
              </Section>
              
              <Text className="text-2xl font-bold text-white capitalize mb-4 text-center">
                Welcome to {organizationDetails.name}!
              </Text>
              
              <Text className="text-zinc-300 mb-4">Dear {userDetails.name},</Text>
              
              <Text className="text-zinc-400 mb-4">
                You have successfully joined <strong className="text-white">{organizationDetails.name}</strong>. 
                We're excited to have you as a member and look forward to your contributions.
              </Text>

              <Section className="text-center">
                <Button
                  href={`${clientUrl}/organization/${organizationDetails.id}`}
                  className="bg-blue-600 rounded-lg text-center px-6 py-3 font-medium text-white"
                >
                  View Organization
                </Button>
              </Section>

              <Text className="text-zinc-400 mt-6 text-sm">
                You can now participate in events, earn certificates, and connect with other members.
              </Text>

              <FooterSection serverUrl={serverUrl} />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

(JoinedOrganizationEmail as any).PreviewProps = {
  organizationDetails: {
    name: "Tech Innovators",
    id: "org123"
  },
  userDetails: {
    name: "John Doe"
  },
  serverUrl: "http://localhost:4000",
  clientUrl: "http://localhost:3000"
};

export default JoinedOrganizationEmail;
