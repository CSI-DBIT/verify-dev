import { jwt } from "@elysiajs/jwt";

// Organization JWT Configs
export const jwtOrgAccessTokenConfig = jwt({
  name: "jwt_org_access_token",
  secret: Bun.env.ORG_ACCESS_TOKEN_SECRET as string,
  exp: "8h",
});

export const jwtOrgRefreshTokenConfig = jwt({
  name: "jwt_org_refresh_token",
  secret: Bun.env.ORG_REFRESH_TOKEN_SECRET as string,
  exp: "30d",
});

// Member JWT Configs
export const jwtMemberAccessTokenConfig = jwt({
  name: "jwt_member_access_token",
  secret: Bun.env.MEMBER_ACCESS_TOKEN_SECRET as string,
  exp: "8h",
});

export const jwtMemberRefreshTokenConfig = jwt({
  name: "jwt_member_refresh_token",
  secret: Bun.env.MEMBER_REFRESH_TOKEN_SECRET as string,
  exp: "30d",
});

// Password Reset Token (short-lived for security)
export const jwtPasswordResetTokenConfig = jwt({
  name: "jwt_password_reset_token",
  secret: Bun.env.PASSWORD_RESET_TOKEN_SECRET as string,
  exp: "15m",
});
