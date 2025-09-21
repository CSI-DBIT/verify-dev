import { MembershipRole, MembershipStatus } from "@prisma/client";
import { t } from "elysia";

export const signupOrganizationSchema = t.Object({
  orgName: t.String({ maxLength: 60, minLength: 3 }),
  description: t.String({ maxLength: 200, minLength: 1 }),
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8 }),
  type: t.String(),
  category: t.String(),
  startDate: t.Date(),
  logo: t.Optional(t.File({
    type: ["image/png", "image/jpeg", "image/jpg"],
  })),
});
export const loginOrganizationSchema = t.Object({
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8 }),
});

export const updatedOrganizationSchema = t.Partial(
  t.Object({
    orgName: t.String({ maxLength: 60, minLength: 3 }),
    description: t.String({ maxLength: 200, minLength: 1 }),
    type: t.String(),
    logo: t.File({
      type: ["image/png", "image/jpeg", "image/jpg"],
    }),
    address: t.String({ maxLength: 200 }),
    phoneNo: t.String({ maxLength: 20 }),
    startDate: t.Date(),
  })
);

export const signupMemberSchema = t.Object({
  memberName: t.String({ maxLength: 60, minLength: 3 }),
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8 }),
  gender: t.Enum({ male: "MALE", female: "FEMALE", other: "OTHER" }),
  address: t.Optional(t.String({ maxLength: 200 })),
  phoneNo: t.Optional(t.String({ maxLength: 20 })),
  memberImg: t.Optional(t.File({ type: ["image/png", "image/jpeg", "image/jpg"] })),
});

export const loginMemberSchema = t.Object({
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8 }),
});

export const updateMemberSchema = t.Partial(
  t.Object({
    memberName: t.String({ maxLength: 60, minLength: 3 }),
    gender: t.Enum({ male: "MALE", female: "FEMALE", other: "OTHER" }),
    address: t.String({ maxLength: 200 }),
    phoneNo: t.String({ maxLength: 20 }),
    memberImg: t.File({ type: ["image/png", "image/jpeg", "image/jpg"] }),
  })
);

export const addEventCategorySchema = t.Object({
  names: t.Array(t.String()),
});

export const updateEventCategorySchema = t.Object({
  categories: t.Array(
    t.Object({
      categoryId: t.String(),
      name: t.String(),
    })
  ),
});

export const addSocialUrlSchema = t.Object({
  urls: t.Array(
    t.Object({
      platform: t.String(),
      url: t.String(),
    })
  ),
});

export const updateSocialUrlSchema = t.Object({
  urls: t.Array(
    t.Object({
      urlId: t.String(),
      url: t.String(),
    })
  ),
});

export const addEventSchema = t.Object({
  eventName: t.String(),
  description: t.String({ maxLength: 150, minLength: 1 }),
  eventPoster: t.Optional(
    t.File({
      type: ["image/png", "image/jpeg", "image/jpg"],
    })
  ),
  categoryId: t.String(),
  isMemberOnly: t.Boolean(),
  eventDate: t.Date(),
  type: t.String(),
});

export const updateEventSchema = t.Partial(addEventSchema);

export const createMembershipSchema = t.Object({
  organizationId: t.Optional(t.String()),
  memberId: t.Optional(t.String()),
});
export const updateMembershipSchema = t.Partial(t.Object({
  status: t.Enum(MembershipStatus),
  role: t.Enum(MembershipRole),
  isFavourite: t.Boolean(),
  startDate: t.Date(),
}));

export const forgotPasswordSchema = t.Object({
  email: t.String({ format: "email" }),
});

export const resetPasswordSchema = t.Object({
  resetToken: t.String(),
  newPassword: t.String({ minLength: 8 }),
});


export const eventFeedbackSchema = t.Object({
  rating: t.Number(),
  feedback: t.Optional(t.String()),
  participantId: t.String()
});