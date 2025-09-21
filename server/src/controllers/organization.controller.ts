import { Elysia } from "elysia";
import { prisma } from "../configs/prisma.config";
import { jwtOrgAccessTokenConfig } from "../configs/jwt.config";
import {
  addEventCategorySchema,
  addEventSchema,
  addSocialUrlSchema,
  updatedOrganizationSchema,
  updateEventCategorySchema,
  updateEventSchema,
  updateMembershipSchema,
  updateSocialUrlSchema,
} from "../configs/schemas";
import { unlinkSync } from "node:fs";
import { EventType, MembershipStatus, OrgType } from "@prisma/client";
import path from "node:path";

export const organizationController = (app: Elysia) =>
  app.group("/organizations", (app) =>
    app
      .use(jwtOrgAccessTokenConfig)
      .derive(async ({ headers, jwt_org_access_token }) => {
        const auth_header = headers["authorization"];
        const bearer_token =
          auth_header && auth_header.startsWith("Bearer ")
            ? auth_header.slice(7)
            : null;
        if (!bearer_token) return { organization: null };
        const organization = await jwt_org_access_token.verify(bearer_token);
        return { organization };
      })
      .guard(
        {
          beforeHandle({ organization, set }) {
            if (!organization) return (set.status = "Unauthorized");
          },
        },
        (app) =>
          app
            .get("/", async ({ set }) => {
              try {
                const organizations = await prisma.organization.findMany({
                  where: {
                    isDeleted: false,
                  },
                  include: {
                    members: true,
                    events: true,
                    socialUrls: true,
                    eventCategories: true,
                    _count: {
                      select: {
                        members: true,
                        events: true,
                      },
                    },
                  },
                });

                set.status = 200;
                return {
                  message: "Organizations retrieved successfully",
                  organizations,
                };
              } catch (error) {
                set.status = 500;
                return {
                  message: "Unable to retrieve organizations",
                  error: error,
                };
              }
            })
            // Fetch organization information by orgId
            .group("/:orgId", (app) =>
              app
                .get("", async ({ set, params }) => {
                  try {
                    const { orgId } = params;
                    if (!orgId) {
                      set.status = 422;
                      return {
                        message: "Required params not found",
                        status: 422,
                      };
                    }

                    const organization = await prisma.organization.findUnique({
                      where: { orgId, isDeleted: false },
                      include: {
                        events: true,
                        members: true,
                        socialUrls: true,
                        eventCategories: true,
                        _count: {
                          select: {
                            members: true,
                            events: true,
                          },
                        },
                      },
                    });

                    if (!organization) {
                      set.status = 404;
                      return {
                        message: `Organization with id: ${orgId} was not found`,
                        status: 404,
                      };
                    }
                    set.status = 200;
                    return organization;
                  } catch (e) {
                    set.status = 500;
                    return {
                      message: "Unable to retrieve the resource!",
                      status: 500,
                    };
                  }
                })

                // Update organization information by id
                .guard(
                  {
                    body: updatedOrganizationSchema,
                  },
                  (app) =>
                    app.patch("", async ({ params, body, set }) => {
                      try {
                        const { orgId } = params;
                        let orgLogoUrl = "";

                        // Fetch the existing organization to get the current logo path
                        const existingOrganization =
                          await prisma.organization.findUnique({
                            where: { orgId },
                            select: { logo: true },
                          });

                        if (!existingOrganization) {
                          set.status = 404;
                          return {
                            message: "Organization not found!",
                            status: 404,
                          };
                        }

                        // Check if a new logo file is uploaded
                        if (body.logo) {
                          const baseDir = path.join(process.cwd(), "public/images/profile-pics/");
                          const extension = path.extname(body.logo.name);
                          const newFileName = `${baseDir}${crypto.randomUUID()}${extension}`;

                          // Delete the existing logo file from the server if it exists
                          if (existingOrganization.logo) {
                            unlinkSync(path.join(baseDir, existingOrganization.logo));
                          }

                          // Save the new logo file to the server
                          await Bun.write(newFileName, body.logo);
                          orgLogoUrl = newFileName;
                        }

                        // Update the organization with the new logo URL
                        const updatedOrganization =
                          await prisma.organization.update({
                            where: { orgId },
                            data: {
                              ...body,
                              logo: orgLogoUrl,
                              type: body.type as OrgType,
                            },
                          });

                        set.status = 200;
                        return updatedOrganization;
                      } catch (e) {
                        console.error(e);
                        set.status = 500;
                        return {
                          message: "Unable to update resource!",
                          status: 500,
                        };
                      }
                    })
                )

                // Membership Routes
                .group("/memberships", (app) =>
                  app
                    // Get all memberships of an organization
                    .get("", async ({ set, params }) => {
                      try {
                        const { orgId } = params;

                        const memberships = await prisma.membership.findMany({
                          where: { organizationId: orgId, isDeleted: false },
                          include: {
                            member: true, // Include member details if needed
                          },
                        });

                        set.status = 200;
                        return memberships;
                      } catch (e) {
                        set.status = 500;
                        return {
                          message: "Unable to retrieve memberships!",
                          status: 500,
                        };
                      }
                    })

                    // Update a membership
                    .guard(
                      {
                        body: updateMembershipSchema, // Schema for validating membership update
                      },
                      (app) =>
                        app.patch(
                          "/:membershipId",
                          async ({ params, body, set }) => {
                            try {
                              const { membershipId } = params;
                              const { status, role, startDate } = body; // Example field that can be updated

                              const updatedMembership =
                                await prisma.membership.update({
                                  where: { id: membershipId },
                                  data: {
                                    status,
                                    role,
                                    startDate,
                                  },
                                });

                              set.status = 200;
                              return updatedMembership;
                            } catch (e) {
                              set.status = 500;
                              return {
                                message: "Unable to update membership!",
                                status: 500,
                              };
                            }
                          }
                        )
                    )
                )

                // Event Routes
                .group("/events", (app) =>
                  app
                    // Get all events of an organization
                    .get("", async ({ set, params }) => {
                      try {
                        const { orgId } = params;

                        const events = await prisma.event.findMany({
                          where: { organizationId: orgId, isDeleted: false },
                          include: {
                            organization: true,
                            participants: {
                              include: {
                                certificate: true,
                              },
                            },
                          },
                        });

                        set.status = 200;
                        return events;
                      } catch (e) {
                        console.error(e); // Log error
                        set.status = 500;
                        return {
                          message: "Unable to retrieve events!",
                          status: 500,
                        };
                      }
                    })

                    // Create a new event for an organization
                    .guard(
                      {
                        body: addEventSchema,
                      },
                      (app) =>
                        app.post("", async ({ params, body, set }) => {
                          try {
                            const { orgId } = params;
                            const {
                              eventName,
                              description,
                              eventPoster,
                              categoryId,
                              eventDate,
                              type,
                            } = body;
                            const baseDir = "public/images/event-poster/";
                            // Check if a file was uploaded
                            let eventPosterUrl = `${baseDir}verifydev-default-poster.png`;
                            if (eventPoster) {
                              const newFileName = `${baseDir}${crypto.randomUUID()}.png`;
                              // Save the file to the server
                              await Bun.write(newFileName, eventPoster);
                              // Set the event poster URL
                              eventPosterUrl = newFileName;
                            }

                            // Create the new event in the database with the poster URL
                            const newEvent = await prisma.event.create({
                              data: {
                                eventName,
                                description,
                                eventPoster: eventPosterUrl,
                                category: categoryId,
                                eventDate,
                                organizationId: orgId,
                                type: type as EventType,
                              },
                            });

                            set.status = 201;
                            return newEvent;
                          } catch (e) {
                            console.error(e); // Log error
                            set.status = 500;
                            return {
                              message: "Unable to add new event!",
                              status: 500,
                            };
                          }
                        })
                    )

                    // Update an existing event
                    .guard(
                      {
                        body: updateEventSchema,
                      },
                      (app) =>
                        app.patch(
                          "/:eventId",
                          async ({ params, body, set }) => {
                            try {
                              const { eventId } = params;
                              const {
                                eventName,
                                description,
                                eventPoster,
                                categoryId,
                                isMemberOnly,
                                eventDate,
                              } = body;

                              // Check if the event exists
                              const eventExists = await prisma.event.findUnique(
                                {
                                  where: { eventId, deletedAt: null },
                                }
                              );
                              if (!eventExists) {
                                set.status = 404;
                                return {
                                  message: "Event not found!",
                                  status: 404,
                                };
                              }
                              const baseDir = "public/images/event-poster/";
                              let eventPosterUrl = "";
                              if (eventPoster) {
                                const newFileName = `${baseDir}${crypto.randomUUID()}.png`;
                                // Save the file to the server
                                await Bun.write(newFileName, eventPoster);
                                // Set the event poster URL
                                eventPosterUrl = newFileName;
                              }

                              const updatedEvent = await prisma.event.update({
                                where: { eventId },
                                data: {
                                  eventName,
                                  description,
                                  eventPoster: eventPosterUrl,
                                  categoryId,
                                  isMemberOnly,
                                  eventDate,
                                },
                              });

                              set.status = 200;
                              return updatedEvent;
                            } catch (e) {
                              console.error(e); // Log error
                              set.status = 500;
                              return {
                                message: "Unable to update event!",
                                status: 500,
                              };
                            }
                          }
                        )
                    )

                    // Delete an event by ID
                    .delete("/:eventId", async ({ params, set }) => {
                      try {
                        const { eventId } = params;

                        // Check if the event exists
                        const eventExists = await prisma.event.findUnique({
                          where: { eventId, deletedAt: null },
                        });
                        if (!eventExists) {
                          set.status = 404;
                          return {
                            message: "Event not found!",
                            status: 404,
                          };
                        }

                        await prisma.event.update({
                          where: { eventId },
                          data: { deletedAt: new Date() },
                        });

                        set.status = 200;
                        return {
                          message: "Event deleted successfully",
                          status: 200,
                        };
                      } catch (e) {
                        console.error(e); // Log error
                        set.status = 500;
                        return {
                          message: "Unable to delete event!",
                          status: 500,
                        };
                      }
                    })
                )

                // Event categories Routes
                .group("/event-categories", (app) =>
                  app
                    // Get event categories of an organization
                    .get("", async ({ set, params }) => {
                      try {
                        const { orgId } = params;

                        const eventCategories =
                          await prisma.eventCategory.findMany({
                            where: { organizationId: orgId, deletedAt: null },
                          });

                        set.status = 200;
                        return eventCategories;
                      } catch (e) {
                        console.error(e); // Log error
                        set.status = 500;
                        return {
                          message: "Unable to retrieve event categories!",
                          status: 500,
                        };
                      }
                    })

                    // Add new event categories
                    .guard(
                      {
                        body: addEventCategorySchema,
                      },
                      (app) =>
                        app.post("", async ({ params, body, set }) => {
                          try {
                            const { orgId } = params;
                            const { names } = body;

                            const newCategories = await Promise.all(
                              names.map(async (name) => {
                                return await prisma.eventCategory.create({
                                  data: {
                                    name,
                                    organizationId: orgId,
                                  },
                                });
                              })
                            );

                            set.status = 201;
                            return newCategories;
                          } catch (e) {
                            console.error(e); // Log error
                            set.status = 500;
                            return {
                              message: "Unable to add new event categories!",
                              status: 500,
                            };
                          }
                        })
                    )

                    // Update existing event categories
                    .guard(
                      {
                        body: updateEventCategorySchema,
                      },
                      (app) =>
                        app.patch("", async ({ body, set }) => {
                          try {
                            const { categories } = body;

                            const updatedCategories = await Promise.all(
                              categories.map(async (category) => {
                                return await prisma.eventCategory.update({
                                  where: {
                                    categoryId: category.categoryId,
                                    deletedAt: null,
                                  }, // Check for deletedAt
                                  data: { name: category.name },
                                });
                              })
                            );

                            set.status = 200;
                            return updatedCategories;
                          } catch (e) {
                            console.error(e); // Log error
                            set.status = 500;
                            return {
                              message: "Unable to update event categories!",
                              status: 500,
                            };
                          }
                        })
                    )

                    // Delete an event category by ID
                    .delete("/:categoryId", async ({ params, set }) => {
                      try {
                        const { categoryId } = params;

                        await prisma.eventCategory.update({
                          where: { categoryId, deletedAt: null }, // Ensure not already deleted
                          data: { deletedAt: new Date() },
                        });

                        set.status = 200;
                        return {
                          message: "Event Category deleted successfully",
                          status: 200,
                        };
                      } catch (e) {
                        console.error(e); // Log error
                        set.status = 500;
                        return {
                          message: "Unable to delete event category!",
                          status: 500,
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
                        const { orgId } = params;

                        const socialUrls = await prisma.socialUrl.findMany({
                          where: { organizationId: orgId, deletedAt: null },
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
                            const { orgId } = params;
                            const { urls } = body; // Array of { platform, url }

                            const newSocialUrls = await Promise.all(
                              urls.map(async ({ platform, url }) => {
                                return await prisma.socialUrl.create({
                                  data: {
                                    platform,
                                    url,
                                    organizationId: orgId,
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
                                  where: { urlId, deletedAt: null }, // Ensure URL isn't deleted
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
                          where: { urlId, deletedAt: null }, // Ensure URL isn't already deleted
                          data: { deletedAt: new Date() },
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
            )
      )
  );
