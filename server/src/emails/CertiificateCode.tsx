import * as React from "react";
import { Tailwind, Section, Text, Button, Img, Html, Head, Preview, Body, Container } from "@react-email/components";
import { FooterSection } from "./FooterSection";

interface CertificateCodeProps {
  eventDetails: {
    name: string;
    startDate: string | Date;
  };
  userDetails: {
    name: string;
    uniqueCertificateCode: string;
  };
  serverUrl: string;
  clientUrl: string;
}

const CertificateCode: React.FC<CertificateCodeProps> = ({
  eventDetails,
  userDetails,
  serverUrl,
  clientUrl
}) => {
  return (
    <Html>
      <Head />
      <Preview>Your certificate for {eventDetails.name} is ready! Access code: {userDetails.uniqueCertificateCode}</Preview>
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
                {eventDetails.name} Certificate
              </Text>
              <Text className="text-zinc-300 mb-4">Dear {userDetails.name},</Text>

              {/* Participation Message */}
              <Text className="text-zinc-400 mb-4">
                Congratulations! You have successfully participated in{" "}
                <strong className="text-white">{eventDetails.name}</strong> held on{" "}
                {new Date(eventDetails.startDate).toLocaleDateString()}.
              </Text>

              {/* Certificate Code Section */}
              <Text className="text-zinc-200 mb-2">
                <strong>Your unique certificate code:</strong>
              </Text>
              <Section className="bg-zinc-700 p-4 rounded-lg text-center text-xl font-bold text-white mb-4">
                {userDetails.uniqueCertificateCode}
              </Section>

              {/* Verification Section */}
              <Text className="text-zinc-300 mb-4">
                To verify your certificate, click the button below:
              </Text>
              <Section className="text-center">
                <Button
                  href={`${clientUrl}/certificate/verify/${userDetails.uniqueCertificateCode}`}
                  className="bg-blue-600 rounded-lg text-center px-6 py-3 font-medium text-white"
                >
                  View Certificate
                </Button>
              </Section>

              {/* Validity Notice */}
              <Text className="text-zinc-400 mt-6 text-sm">
                This certificate code is unique to you and can be used to verify the authenticity of your certificate at any time.
              </Text>

              <FooterSection serverUrl={serverUrl} />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

(CertificateCode as any).PreviewProps = {
  eventDetails: {
    name: "Web Development Bootcamp",
    startDate: "2024-10-01"
  },
  userDetails: {
    name: "John Doe",
    uniqueCertificateCode: "CERT-1234-EFHT-56"
  },
  serverUrl: "http://localhost:4000",
  clientUrl: "http://localhost:3000"
};

export default CertificateCode;
