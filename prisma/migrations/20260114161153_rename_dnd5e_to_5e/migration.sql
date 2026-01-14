-- Migration: Rename game system from DND5E to 5E for OGL compliance
-- Update all existing records that use "DND5E" to "5E"

-- Update Campaign table
UPDATE "Campaign" SET "gameSystem" = '5E' WHERE "gameSystem" = 'DND5E';

-- Update Creature table
UPDATE "Creature" SET "gameSystem" = '5E' WHERE "gameSystem" = 'DND5E';

-- Update CustomCreature table
UPDATE "CustomCreature" SET "gameSystem" = '5E' WHERE "gameSystem" = 'DND5E';

-- Update PlayerCharacter table
UPDATE "PlayerCharacter" SET "gameSystem" = '5E' WHERE "gameSystem" = 'DND5E';

-- Update Spell table
UPDATE "Spell" SET "gameSystem" = '5E' WHERE "gameSystem" = 'DND5E';
