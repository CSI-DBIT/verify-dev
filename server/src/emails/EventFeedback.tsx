import * as React from "react";
import { Tailwind, Section, Text, Button, Img, Html, Head, Preview, Body, Container } from "@react-email/components";
import { FooterSection } from "./FooterSection";

interface EventDetails {
  name: string;
  // Add other event details properties as needed
}

interface UserDetails {
  name: string;
  // Add other user details properties as needed
}

interface EventFeedbackEmailProps {
  eventDetails: EventDetails;
  userDetails: UserDetails;
  feedbackUrl: string;
  serverUrl: string;
}

const EventFeedbackEmail: React.FC<EventFeedbackEmailProps> = ({
  eventDetails,
  userDetails,
  feedbackUrl,
  serverUrl,
}) => {
  return (
    <Html>
      <Head />
      <Preview>
        Share your thoughts about {eventDetails.name} - Your feedback matters!
      </Preview>
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
                We'd Love Your Feedback
              </Text>
              
              <Text className="text-zinc-300 mb-4">Dear {userDetails.name},</Text>
              
              <Text className="text-zinc-400 mb-4">
                Thank you for joining us at <strong className="text-white">{eventDetails.name}</strong>! We hope you found the event valuable and engaging.
              </Text>
              
              <Text className="text-zinc-400 mb-4">
                Your feedback is crucial in helping us improve and create better experiences. Please take a moment to share your thoughts:
              </Text>
              
              <Section className="text-center">
                <Button
                  href={feedbackUrl}
                  className="bg-green-600 rounded-lg text-center px-6 py-3 font-medium text-white"
                >
                  Give Feedback
                </Button>
              </Section>

              <Text className="text-zinc-400 mt-6 text-sm">
                This feedback form will take only a few minutes to complete. Your insights will help shape our future events.
              </Text>

              <FooterSection serverUrl={serverUrl} />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

(EventFeedbackEmail as any).PreviewProps = {
  eventDetails: {
    name: "Web Development Bootcamp"
  },
  userDetails: {
    name: "John Doe"
  },
  feedbackUrl: "http://localhost:3000/feedback",
  serverUrl: "http://localhost:4000"
};

export default EventFeedbackEmail;
