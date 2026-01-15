-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CombatCreature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "identifier" TEXT,
    "initiative" INTEGER NOT NULL,
    "currentHp" INTEGER NOT NULL,
    "maxHp" INTEGER NOT NULL,
    "tempHp" INTEGER NOT NULL DEFAULT 0,
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
INSERT INTO "new_CombatCreature" ("armorClass", "combatId", "concentrationNote", "currentHp", "id", "identifier", "initiative", "isConcentrating", "maxHp", "name", "sortOrder", "sourceId", "sourceType", "spellSlots", "statsSnapshot", "statusEffects", "tokenColor", "turnNumber") SELECT "armorClass", "combatId", "concentrationNote", "currentHp", "id", "identifier", "initiative", "isConcentrating", "maxHp", "name", "sortOrder", "sourceId", "sourceType", "spellSlots", "statsSnapshot", "statusEffects", "tokenColor", "turnNumber" FROM "CombatCreature";
DROP TABLE "CombatCreature";
ALTER TABLE "new_CombatCreature" RENAME TO "CombatCreature";
CREATE INDEX "CombatCreature_combatId_idx" ON "CombatCreature"("combatId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
