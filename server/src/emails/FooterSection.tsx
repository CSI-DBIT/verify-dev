import { Img, Section, Text } from "@react-email/components";
import React from "react";

interface FooterSectionProps {
  serverUrl: string;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ serverUrl }) => (
  <Section className="bg-zinc-800 p-4 rounded-lg text-xs text-zinc-400 mt-6">
    <div className="flex justify-center items-center">
      <Img
        src={`${serverUrl}/public/images/verifyInitialLogo.png`}
        alt="Verify Logo"
        className="h-12 mr-2"
      />
      <Text className="text-center">
        <strong>
          Best regards, <br />
          Verify@Dev
        </strong>
      </Text>
    </div>
  </Section>
);
