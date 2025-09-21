import { Elysia } from "elysia";
import { comparePassword, handleFileUpload, hashPassword } from "../configs/utils";
import {
  jwtOrgAccessTokenConfig,
  jwtOrgRefreshTokenConfig,
} from "../configs/jwt.config";
import { loginOrganizationSchema, signupOrganizationSchema } from "../configs/schemas";
import { prisma } from "../configs/prisma.config";
import { OrgType } from "@prisma/client";

export const organizationAuthController = (app: Elysia) =>
  app.group("/organization-auth", (app) =>
    app
      .use(jwtOrgAccessTokenConfig)
      .use(jwtOrgRefreshTokenConfig)
      .guard(
        {
          body: signupOrganizationSchema,
        },
        (app) =>
          app.post(
            "/signup",
            async ({
              set,
              body,
              jwt_org_access_token,
              jwt_org_refresh_token,
              cookie: { refresh_token },
            }) => {
              try {
                const { orgName, email, password, type, category, startDate, logo } = body;

                // Check if organization already exists
                const existingOrganization = await prisma.organization.findUnique({
                  where: { email },
                });

                if (existingOrganization) {
                  set.status = 422;
                  return {
                    message: "Organization with the email already exists!",
                    status: 422,
                  };
                }

                let logoPath = "images/profile-pics/verifydev-default-organization-profile.png";

                // Handle logo upload if provided
                if (logo) {
                  try {
                    logoPath = await handleFileUpload({
                      file: logo,
                      directory: "images/profile-pics",
                    });
                  } catch (error) {
                    console.error("Logo upload failed:", error);
                    // Continue with default logo
                  }
                }

                const hashedPassword = await hashPassword(password);
                const newOrganization = await prisma.organization.create({
                  data: {
                    orgName,
                    email,
                    password: hashedPassword,
                    type: type as OrgType,
                    category,
                    startDate,
                    logo: logoPath,
                  },
                });

                // Define default event categories
                const defaultCategories = [
                  { name: "Conference" },
                  { name: "Workshop" },
                  { name: "Seminar" },
                  { name: "Networking" },
                  { name: "Webinar" },
                ];

                // Create default event categories for the new organization
                await prisma.eventCategory.createMany({
                  data: defaultCategories.map((category) => ({
                    name: category.name,
                    organizationId: newOrganization.orgId,
                  })),
                });

                // Create chatroom for the organization
                await prisma.chatRoom.create({
                  data: {
                    organizationId: newOrganization.orgId,
                  },
                  include: {
                    messages: true,
                  },
                });

                const accessToken = await jwt_org_access_token.sign({
                  orgId: newOrganization.orgId,
                  email: newOrganization.email,
                });
                const refreshToken = await jwt_org_refresh_token.sign({
                  orgId: newOrganization.orgId,
                  email: newOrganization.email,
                });

                // Store refresh token
                await prisma.refreshToken.upsert({
                  where: { organizationId: newOrganization.orgId },
                  update: { token: refreshToken, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) },
                  create: { token: refreshToken, organizationId: newOrganization.orgId, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) },
                });

                refresh_token.set({
                  value: refreshToken,
                  httpOnly: true,
                  sameSite: "strict",
                  secure: true,
                  maxAge: 1000 * 60 * 60 * 24 * 30,
                });

                set.status = 201;
                return {
                  message: "Organization registered successfully",
                  status: 201,
                  accessToken,
                };
              } catch (error) {
                set.status = 500;
                return {
                  message: "Unable to register organization!",
                  status: 500,
                  error
                };
              }
            }
          )
      )
      .guard(
        {
          body: loginOrganizationSchema,
        },
        (app) =>
          app.post(
            "/login",
            async ({
              set,
              body,
              jwt_org_access_token,
              jwt_org_refresh_token,
              cookie: { refresh_token },
            }) => {
              try {
                const { email, password } = body;

                // Fetch organization from database
                const organization = await prisma.organization.findUnique({
                  where: { email, isDeleted: false },
                });

                if (
                  !organization ||
                  !(await comparePassword(password, organization.password))
                ) {
                  set.status = 401;
                  return { status: 401, message: "Invalid credentials" };
                }

                // Generate tokens
                const accessToken = await jwt_org_access_token.sign({
                  orgId: organization.orgId,
                  email: organization.email,
                });
                const refreshToken = await jwt_org_refresh_token.sign({
                  orgId: organization.orgId,
                  email: organization.email,
                });

                // Update organization refresh token
                await prisma.refreshToken.upsert({
                  where: { organizationId: organization.orgId },
                  update: { token: refreshToken, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) },
                  create: { token: refreshToken, organizationId: organization.orgId, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) },
                });

                refresh_token.set({
                  value: refreshToken,
                  httpOnly: true,
                  sameSite: "strict",
                  secure: true,
                  maxAge: 1000 * 60 * 60 * 24 * 30,
                });

                set.status = 200;
                return {
                  message: "Organization Login successful!",
                  status: 200,
                  accessToken,
                };
              } catch (error) {
                set.status = 500;
                return { message: "Error logging in", status: 500, error };
              }
            }
          )
      )
      .post(
        "/refresh-token",
        async ({
          cookie: { refresh_token },
          set,
          jwt_org_refresh_token,
          jwt_org_access_token,
        }) => {
          try {
            const refreshToken = refresh_token.value;

            if (!refreshToken) {
              set.status = 403;
              return { status: 403, message: "No refresh token provided" };
            }

            const organizationData = await jwt_org_refresh_token.verify(
              refreshToken
            );
            if (!organizationData || typeof organizationData !== "object") {
              set.status = 403;
              return { status: 403, message: "Invalid refresh token" };
            }

            const organization = await prisma.organization.findUnique({
              where: { orgId: organizationData.orgId as string, isDeleted: false },
            });

            const refreshTokenData = await prisma.refreshToken.findFirst({
              where: { token: refreshToken, organizationId: organizationData.orgId as string },
            });

            if (!organization || !refreshTokenData || refreshTokenData.token !== refreshToken) {
              set.status = 403;
              return {
                status: 403,
                message: "Refresh token invalid or expired",
              };
            }

            const newAccessToken = await jwt_org_access_token.sign({
              orgId: organization.orgId,
              email: organization.email,
            });

            const newRefreshToken = await jwt_org_refresh_token.sign({
              orgId: organization.orgId,
              email: organization.email,
            });

            await prisma.refreshToken.upsert({
              where: { organizationId: organization.orgId },
              update: { token: newRefreshToken, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) },
              create: { token: newRefreshToken, organizationId: organization.orgId, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) },
            });

            refresh_token.set({
              value: newRefreshToken,
              httpOnly: true,
              sameSite: "strict",
              secure: true,
              maxAge: 1000 * 60 * 60 * 24 * 30,
            });

            return { status: 200, accessToken: newAccessToken };
          } catch (error) {
            set.status = 500;
            return { status: 500, message: "Error refreshing token", error };
          }
        }
      )
      .post(
        "/logout",
        async ({ cookie: { refresh_token }, jwt_org_refresh_token }) => {
          try {
            const refreshToken = refresh_token.value;

            if (!refreshToken)
              return { status: 400, message: "No refresh token provided" };

            const organizationData = await jwt_org_refresh_token.verify(
              refreshToken
            );
            if (!organizationData || typeof organizationData !== "object") {
              return { status: 403, message: "Invalid refresh token" };
            }

            await prisma.refreshToken.delete({
              where: { token: refreshToken, organizationId: organizationData.orgId as string },
            });

            refresh_token.set({ value: null, httpOnly: true, sameSite: "strict", secure: true, maxAge: 0 });

            return { status: 200, message: "Logged out successfully" };
          } catch (error) {
            return { status: 500, message: "Error logging out", error };
          }
        }
      )
  );
