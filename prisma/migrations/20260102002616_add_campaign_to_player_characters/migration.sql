-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlayerCharacter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "gameSystem" TEXT NOT NULL,
    "stats" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT,
    CONSTRAINT "PlayerCharacter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlayerCharacter_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PlayerCharacter" ("createdAt", "gameSystem", "id", "imageUrl", "name", "stats", "updatedAt", "userId") SELECT "createdAt", "gameSystem", "id", "imageUrl", "name", "stats", "updatedAt", "userId" FROM "PlayerCharacter";
DROP TABLE "PlayerCharacter";
ALTER TABLE "new_PlayerCharacter" RENAME TO "PlayerCharacter";
CREATE INDEX "PlayerCharacter_userId_gameSystem_idx" ON "PlayerCharacter"("userId", "gameSystem");
CREATE INDEX "PlayerCharacter_campaignId_idx" ON "PlayerCharacter"("campaignId");
CREATE INDEX "PlayerCharacter_name_idx" ON "PlayerCharacter"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
