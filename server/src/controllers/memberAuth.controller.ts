import { Elysia } from "elysia";
import { comparePassword, handleFileUpload, hashPassword } from "../configs/utils";
import {
  jwtMemberAccessTokenConfig,
  jwtMemberRefreshTokenConfig,
} from "../configs/jwt.config";
import { loginMemberSchema, signupMemberSchema } from "../configs/schemas";
import { prisma } from "../configs/prisma.config";

export const memberAuthController = (app: Elysia) =>
  app.group("/member-auth", (app) =>
    app
      .use(jwtMemberAccessTokenConfig)
      .use(jwtMemberRefreshTokenConfig)
      .guard(
        {
          body: signupMemberSchema,
        },
        (app) =>
          app.post(
            "/signup",
            async ({
              set,
              body,
              jwt_member_access_token,
              jwt_member_refresh_token,
              cookie: { refresh_token },
            }) => {
              try {
                const { memberName, email, password, gender, address, phoneNo, memberImg } = body;
                const existingMember = await prisma.member.findUnique({
                  where: { email, isDeleted: false },
                });
                if (existingMember) {
                  set.status = 422;
                  return {
                    message: "Member with the email already exists!",
                    status: 422,
                  };
                }

                const hashedPassword = await hashPassword(password);

                let memberImgPath = "images/profile-pics/verifydev-default-men-profile.jpg";

                if (memberImg) {
                  memberImgPath = await handleFileUpload({
                    file: memberImg,
                    directory: "images/profile-pics",
                  });
                }
                const newMember = await prisma.member.create({
                  data: {
                    memberName,
                    email,
                    gender,
                    password: hashedPassword,
                    phoneNo,
                    memberImg: memberImgPath,
                  },
                });

                const accessToken = await jwt_member_access_token.sign({
                  memberId: newMember.memberId,
                  email: newMember.email,
                });
                const refreshToken = await jwt_member_refresh_token.sign({
                  memberId: newMember.memberId,
                  email: newMember.email,
                });

                await prisma.refreshToken.upsert({
                  where: { memberId: newMember.memberId },
                  update: { token: refreshToken, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) },
                  create: { token: refreshToken, memberId: newMember.memberId, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) },
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
                  message: "Member registered successfully",
                  status: 201,
                  accessToken,
                };
              } catch (error) {
                set.status = 500;
                return {
                  message: "Unable to save member to the database!",
                  status: 500,
                  error,
                };
              }
            }
          )
      )
      .guard(
        {
          body: loginMemberSchema,
        },
        (app) =>
          app.post(
            "/login",
            async ({
              set,
              body,
              jwt_member_access_token,
              jwt_member_refresh_token,
              cookie: { refresh_token },
            }) => {
              try {
                const { email, password } = body;
                const member = await prisma.member.findUnique({
                  where: { email, isDeleted: false },
                });
                if (
                  !member ||
                  !(await comparePassword(password, member.password))
                ) {
                  set.status = 401;
                  return { status: 401, message: "Invalid credentials" };
                }

                const accessToken = await jwt_member_access_token.sign({
                  memberId: member.memberId,
                  email: member.email,
                });
                const refreshToken = await jwt_member_refresh_token.sign({
                  memberId: member.memberId,
                  email: member.email,
                });

                await prisma.refreshToken.upsert({
                  where: { memberId: member.memberId },
                  update: { token: refreshToken, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) },
                  create: { token: refreshToken, memberId: member.memberId, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) },
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
                  message: "Login successful!",
                  status: 200,
                  accessToken,
                };
              } catch (error) {
                set.status = 500;
                return {
                  message: "Error logging in",
                  status: 500,
                  error,
                };
              }
            }
          )
      )
      .post(
        "/refresh-token",
        async ({
          cookie: { refresh_token },
          set,
          jwt_member_refresh_token,
          jwt_member_access_token,
        }) => {
          try {
            const refreshTokenCookie = refresh_token;
            if (!refreshTokenCookie) {
              set.status = 403;
              return { status: 403, message: "No refresh token provided" };
            }

            const memberData = await jwt_member_refresh_token.verify(
              refreshTokenCookie.value
            );

            if (!memberData || typeof memberData !== "object") {
              set.status = 403;
              return {
                status: 403,
                message: "Refresh token invalid or expired",
              };
            }

            const member = await prisma.member.findUnique({
              where: {
                memberId: memberData.memberId as string,
                isDeleted: false,
              },
            });

            const refreshTokenData = await prisma.refreshToken.findFirst({
              where: { token: refreshTokenCookie.value, memberId: memberData.memberId as string },
            });

            if (!member || !refreshTokenData || refreshTokenData.token !== refreshTokenCookie.value) {
              set.status = 403;
              return { status: 403, message: "Invalid refresh token" };
            }

            const newAccessToken = await jwt_member_access_token.sign({
              memberId: member.memberId,
              email: member.email,
            });

            const newRefreshToken = await jwt_member_refresh_token.sign({
              memberId: member.memberId,
              email: member.email,
            });

            await prisma.refreshToken.upsert({
              where: { memberId: member.memberId },
              update: { token: newRefreshToken, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) },
              create: { token: newRefreshToken, memberId: member.memberId, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) },
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
            return {
              status: 500,
              message: "Error refreshing token",
              error,
            };
          }
        }
      )
      .post(
        "/logout",
        async ({ cookie: { refresh_token }, jwt_member_refresh_token }) => {
          try {
            const refreshTokenCookie = refresh_token;

            if (!refreshTokenCookie)
              return { status: 400, message: "No refresh token provided" };

            const memberData = await jwt_member_refresh_token.verify(
              refreshTokenCookie.value
            );

            if (!memberData || typeof memberData !== "object") {
              return { status: 403, message: "Invalid refresh token" };
            }

            const member = await prisma.member.findUnique({
              where: {
                memberId: memberData.memberId as string,
                isDeleted: false,
              },
            });

            if (member) {
              await prisma.refreshToken.delete({
                where: { token: refreshTokenCookie.value, memberId: member.memberId },
              });
            }

            refresh_token.set({
              value: null,
              httpOnly: true,
              sameSite: "strict",
              secure: true,
              maxAge: 0, // Clear the cookie
            });

            return { status: 200, message: "Logged out successfully" };
          } catch (error) {
            return {
              status: 500,
              message: "Error logging out",
              error,
            };
          }
        }
      )
  );
