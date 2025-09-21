import { Elysia } from "elysia";
import { hashPassword } from "../configs/utils";
import { prisma } from "../configs/prisma.config";
import { jwtPasswordResetTokenConfig } from "../configs/jwt.config";
import { organizationAuthController } from "./organizationAuth.controller";
import { memberAuthController } from "./memberAuth.controller";
import ResetPasswordEmail from "../emails/ResetPassword";
import { forgotPasswordSchema, resetPasswordSchema } from "../configs/schemas";
import { sendEmail } from "../services/email.service";

export const authController = (app: Elysia) =>
  app.group("/auth", (app) =>
    app
      .use(jwtPasswordResetTokenConfig)
      .guard(
        {
          body: forgotPasswordSchema,
        },
        (app) =>
          app.post(
            "/forgot-password",
            async ({ set, body, jwt_password_reset_token }) => {
              const { email } = body;

              // Check if the email belongs to an organization or a member
              const organization = await prisma.organization.findUnique({
                where: { email, isDeleted: false },
              });
              const member = !organization
                ? await prisma.member.findUnique({
                    where: { email, isDeleted: false },
                  })
                : null;

              if (!organization && !member) {
                set.status = 404;
                return {
                  status: 404,
                  message: "Email not associated with any account",
                };
              }

              let resetToken = "";
              // Create reset token
              if (organization) {
                resetToken = await jwt_password_reset_token.sign({
                  id: organization.orgId,
                  role: "organization",
                });
              }
              if (member) {
                resetToken = await jwt_password_reset_token.sign({
                  id: member.memberId,
                  role: "member",
                });
              }
              const resetLink = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;

              if (member) {
                sendEmail({
                  from: "noreply@verifydev.com",
                  to: email,
                  subject: "Password Reset Request",
                  component: await ResetPasswordEmail({
                    userDetails: { name: member.memberName },
                    resetLink,
                      serverUrl: "http://localhost:4000",
                    }),
                  });
                }else if(organization){
                  sendEmail({
                    from: "noreply@verifydev.com",
                    to: email,
                    subject: "Password Reset Request",
                    component: await ResetPasswordEmail({
                      userDetails: { name: organization.orgName },
                      resetLink,
                      serverUrl: "http://localhost:4000",
                    }),
                  });
                }
              return { status: 200, message: "Password reset email sent" };
            }
          )
      )
      .guard(
        {
          body: resetPasswordSchema,
        },
        (app) =>
          app.post(
            "/reset-password",
            async ({ set, body, jwt_password_reset_token }) => {
              const { resetToken, newPassword } = body;

              try {
                // Verify the reset token
                const decoded = await jwt_password_reset_token.verify(
                  resetToken
                );
                if (!decoded || typeof decoded !== "object") {
                  set.status = 403;
                  return {
                    status: 403,
                    message: "Invalid or expired reset token",
                  };
                }

                const { id, role } = decoded;

                // Find user based on role and ID
                const entity =
                  role === "organization"
                    ? await prisma.organization.findUnique({
                        where: { orgId: id as string, isDeleted: false },
                      })
                    : await prisma.member.findUnique({
                        where: { memberId: id as string, isDeleted: false },
                      });

                if (!entity) {
                  set.status = 404;
                  return { status: 404, message: "Account not found" };
                }

                // Update password
                const hashedPassword = await hashPassword(newPassword);
                if (role === "organization") {
                  await prisma.organization.update({
                    where: { orgId: id as string, isDeleted: false },
                    data: { password: hashedPassword },
                  });
                } else if (role === "member") {
                  await prisma.member.update({
                    where: { memberId: id as string, isDeleted: false },
                    data: { password: hashedPassword },
                  });
                }

                return { status: 200, message: "Password reset successful" };
              } catch (error) {
                set.status = 500;
                return {
                  status: 500,
                  message: "Error resetting password",
                  error,
                };
              }
            }
          )
      )
      .use(organizationAuthController)
      .use(memberAuthController)
  );
