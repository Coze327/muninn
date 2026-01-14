-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "gameSystem" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Campaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Combat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PREP',
    "round" INTEGER NOT NULL DEFAULT 1,
    "turnIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "campaignId" TEXT NOT NULL,
    CONSTRAINT "Combat_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CombatCreature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "identifier" TEXT,
    "initiative" INTEGER NOT NULL,
    "currentHp" INTEGER NOT NULL,
    "maxHp" INTEGER NOT NULL,
    "armorClass" INTEGER NOT NULL,
    "tokenColor" TEXT,
    "statusEffects" TEXT NOT NULL DEFAULT '[]',
    "isConcentrating" BOOLEAN NOT NULL DEFAULT false,
    "concentrationNote" TEXT,
    "spellSlots" TEXT,
    "turnNumber" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "statsSnapshot" TEXT NOT NULL,
    "combatId" TEXT NOT NULL,
    CONSTRAINT "CombatCreature_combatId_fkey" FOREIGN KEY ("combatId") REFERENCES "Combat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Creature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "index" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gameSystem" TEXT NOT NULL,
    "size" TEXT,
    "creatureType" TEXT,
    "challengeRating" REAL,
    "stats" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CustomCreature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "gameSystem" TEXT NOT NULL,
    "stats" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "CustomCreature_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlayerCharacter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "gameSystem" TEXT NOT NULL,
    "stats" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "PlayerCharacter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Spell" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "index" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "school" TEXT NOT NULL,
    "gameSystem" TEXT NOT NULL,
    "stats" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Campaign_userId_idx" ON "Campaign"("userId");

-- CreateIndex
CREATE INDEX "Combat_campaignId_idx" ON "Combat"("campaignId");

-- CreateIndex
CREATE INDEX "CombatCreature_combatId_idx" ON "CombatCreature"("combatId");

-- CreateIndex
CREATE UNIQUE INDEX "Creature_index_key" ON "Creature"("index");

-- CreateIndex
CREATE INDEX "Creature_gameSystem_idx" ON "Creature"("gameSystem");

-- CreateIndex
CREATE INDEX "Creature_name_idx" ON "Creature"("name");

-- CreateIndex
CREATE INDEX "CustomCreature_userId_gameSystem_idx" ON "CustomCreature"("userId", "gameSystem");

-- CreateIndex
CREATE INDEX "CustomCreature_name_idx" ON "CustomCreature"("name");

-- CreateIndex
CREATE INDEX "PlayerCharacter_userId_gameSystem_idx" ON "PlayerCharacter"("userId", "gameSystem");

-- CreateIndex
CREATE INDEX "PlayerCharacter_name_idx" ON "PlayerCharacter"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Spell_index_key" ON "Spell"("index");

-- CreateIndex
CREATE INDEX "Spell_gameSystem_level_idx" ON "Spell"("gameSystem", "level");

-- CreateIndex
CREATE INDEX "Spell_name_idx" ON "Spell"("name");
