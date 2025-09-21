import { Elysia } from "elysia";
import { prisma } from "../configs/prisma.config";
import {
  addSocialUrlSchema,
  createMembershipSchema,
  updateMemberSchema,
  updateSocialUrlSchema,
} from "../configs/schemas";
import { jwtMemberAccessTokenConfig } from "../configs/jwt.config";
import { handleFileUpload } from "../configs/utils";

export const membersController = (app: Elysia) =>
  app.group("/members", (app) =>
    app
      .use(jwtMemberAccessTokenConfig)
      .derive(async ({ headers, jwt_member_access_token }) => {
        const auth_header = headers["authorization"];
        const bearers_token =
          auth_header && auth_header.startsWith("Bearer ")
            ? auth_header.slice(7)
            : null;
        if (!bearers_token) return { member: null };
        const member = await jwt_member_access_token.verify(bearers_token);
        return { member };
      })
      .guard(
        {
          beforeHandle({ member, set }) {
            if (!member) return (set.status = "Unauthorized");
          },
        },
        (app) =>
          app.group("/:memberId", (app) =>
            app
              .get("", async ({ params, set }) => {
                const { memberId } = params;

                try {
                  // Fetch the member details
                  const member = await prisma.member.findUnique({
                    where: { memberId, isDeleted: false },
                    include: {
                      memberships: {
                        include: {
                          organization: true,
                        },
                      },
                    },
                  });

                  if (!member) {
                    return {
                      message: "Member not found!",
                      status: 404,
                    };
                  }

                  // Fetch events attended by the member
                  const eventsAttended = await prisma.event.findMany({
                    where: {
                      participants: {
                        some: {
                          email: member.email,
                        },
                      },
                    },
                    include: {
                      organization: true,
                    },
                  });

                  // Fetch certificates received by the member
                  const certificates = await prisma.certificate.findMany({
                    where: {
                      Member: {
                        some: {
                          memberId: member.memberId
                        }
                      },
                      isDeleted: false,
                    },
                  });

                  // Extract organization details from memberships
                  const organizations = member.memberships.map(
                    (membership) => membership.organization
                  );

                  return {
                    member,
                    eventsAttended,
                    certificates,
                    organizations,
                  };
                } catch (error) {
                  set.status = 500;
                  return {
                    message: "Unable to fetch member details!",
                    status: 500,
                  };
                }
              })
              .guard(
                {
                  body: updateMemberSchema,
                },
                (app) =>
                  app.patch("", async ({ set, params, body }) => {
                    const { memberId } = params;
                    try {
                      let memberImgPath;

                      // Handle profile image upload if provided
                      if (body.memberImg) {
                        try {
                          memberImgPath = await handleFileUpload({
                            file: body.memberImg,
                            directory: "images/profile-pics",
                          });
                        } catch (uploadError: any) {
                          console.error("Profile image upload failed:", uploadError);
                          set.status = 400;
                          return {
                            message: "Profile image upload failed",
                            error: uploadError.message,
                          };
                        }
                      }

                      // Update member data
                      const updatedMember = await prisma.member.update({
                        where: { memberId },
                        data: {
                          ...(body.memberName && { memberName: body.memberName }),
                          ...(body.gender && { gender: body.gender }),
                          ...(body.address && { address: body.address }),
                          ...(body.phoneNo && { phoneNo: body.phoneNo }),
                          ...(memberImgPath && { memberImg: memberImgPath }),
                        },
                      });

                      set.status = 200;
                      return {
                        message: "Member updated successfully",
                        member: updatedMember,
                      };
                    } catch (updateError: any) {
                      console.error("Member update error:", updateError);
                      set.status = 500;
                      return {
                        message: "Unable to update member!",
                        error: updateError.message,
                      };
                    }
                  })
              )
              // Social URL Routes
              .group("/social-urls", (app) =>
                app
                  // Get social URLs of an organization
                  .get("", async ({ set, params }) => {
                    try {
                      const { memberId } = params;

                      const socialUrls = await prisma.socialUrl.findMany({
                        where: { memberId: memberId, isDeleted: false },
                      });

                      set.status = 200;
                      return socialUrls;
                    } catch (e) {
                      console.error(e); // Log error
                      set.status = 500;
                      return {
                        message: "Unable to retrieve social URLs!",
                        status: 500,
                      };
                    }
                  })

                  // Add new social URLs
                  .guard(
                    {
                      body: addSocialUrlSchema,
                    },
                    (app) =>
                      app.post("", async ({ params, body, set }) => {
                        try {
                          const { memberId } = params;
                          const { urls } = body; // Array of { urlId, url }

                          const newSocialUrls = await Promise.all(
                            urls.map(async ({ platform, url }) => {
                              return await prisma.socialUrl.create({
                                data: {
                                  platform,
                                  url,
                                  memberId: memberId,
                                },
                              });
                            })
                          );

                          set.status = 201;
                          return newSocialUrls;
                        } catch (e) {
                          console.error(e); // Log error
                          set.status = 500;
                          return {
                            message: "Unable to add new social URLs!",
                            status: 500,
                          };
                        }
                      })
                  )

                  // Update existing social URLs
                  .guard(
                    {
                      body: updateSocialUrlSchema,
                    },
                    (app) =>
                      app.patch("", async ({ body, set }) => {
                        try {
                          const { urls } = body; // Array of { urlId, url }

                          const updatedUrls = await Promise.all(
                            urls.map(async ({ urlId, url }) => {
                              return await prisma.socialUrl.update({
                                where: { urlId, isDeleted: false },
                                data: { url },
                              });
                            })
                          );

                          set.status = 200;
                          return updatedUrls;
                        } catch (e) {
                          console.error(e); // Log error
                          set.status = 500;
                          return {
                            message: "Unable to update social URLs!",
                            status: 500,
                          };
                        }
                      })
                  )

                  // Delete a social URL by ID
                  .delete("/:urlId", async ({ params, set }) => {
                    try {
                      const { urlId } = params;

                      await prisma.socialUrl.update({
                        where: { urlId, isDeleted: false },
                        data: { isDeleted: true },
                      });

                      set.status = 200;
                      return {
                        message: "Social URL deleted successfully",
                        status: 200,
                      };
                    } catch (e) {
                      console.error(e); // Log error
                      set.status = 500;
                      return {
                        message: "Unable to delete social URL!",
                        status: 500,
                      };
                    }
                  })
              )
              .guard(
                {
                  body: createMembershipSchema,
                },
                (app) =>
                  app.post("/join", async ({ body, set, params }) => {
                    const { memberId } = params;
                    const { organizationId } = body;

                    try {
                      const existingOrganization =
                        await prisma.organization.findUnique({
                          where: {
                            orgId: organizationId,
                          },
                        });

                      if (!existingOrganization) {
                        set.status = 409; // not found
                        return {
                          message: "Organization not found!",
                        };
                      }

                      // Check if the member is already a member of the organization
                      const existingMembership =
                        await prisma.membership.findFirst({
                          where: {
                            memberId,
                            organizationId: existingOrganization.orgId,
                          },
                        });

                      if (existingMembership) {
                        set.status = 409; // Conflict
                        return {
                          message: "Already a member of this organization!",
                        };
                      }

                      // Create the new membership
                      const newMembership = await prisma.membership.create({
                        data: {
                          memberId: memberId, // Use the correct member ID
                          organizationId: existingOrganization.orgId,
                        },
                      });

                      set.status = 201; // Created
                      return {
                        message: "Membership created successfully!",
                        membership: newMembership,
                      };
                    } catch (error) {
                      console.error(error);
                      set.status = 500;
                      return {
                        message: "Unable to join organization!",
                      };
                    }
                  })
              )
          )
      )
  );
