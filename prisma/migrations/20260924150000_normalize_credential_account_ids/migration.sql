BEGIN;

-- Better Auth identifies password accounts by the linked user's stable id.
-- Only normalize legacy email-based credential accounts; keep passwords intact.
UPDATE "accounts" AS account
SET "accountId" = account."userId",
    "updatedAt" = CURRENT_TIMESTAMP
FROM "users" AS app_user
WHERE account."userId" = app_user."id"
  AND account."providerId" = 'credential'
  AND account."accountId" = app_user."email"
  AND account."accountId" <> account."userId";

COMMIT;
