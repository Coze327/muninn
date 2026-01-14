'use client';

import { Stack, Grid, NumberInput, TextInput, Checkbox, Group, Button, ActionIcon, Box, Text } from '@mantine/core';
import { PiTrash } from 'react-icons/pi';
import { ABILITY_OPTIONS } from '../form-constants';
import { SkillsInput } from '../form-inputs/SkillsInput';

export interface AttributesTabProps {
  // Abilities
  str: number;
  setStr: (value: number) => void;
  dex: number;
  setDex: (value: number) => void;
  con: number;
  setCon: (value: number) => void;
  int: number;
  setInt: (value: number) => void;
  wis: number;
  setWis: (value: number) => void;
  cha: number;
  setCha: (value: number) => void;

  // Saving Throws
  savingThrows: { [key: string]: { enabled: boolean; value: number } };
  setSavingThrows: (value: { [key: string]: { enabled: boolean; value: number } }) => void;
  proficiencyBonus: number;

  // Skills
  skills: { [skillName: string]: number };
  setSkills: (value: { [skillName: string]: number }) => void;

  // AC & HP
  acValue: number;
  setAcValue: (value: number) => void;
  acType: string;
  setAcType: (value: string) => void;
  armorItems: { index: string; name: string }[];
  setArmorItems: (value: { index: string; name: string }[]) => void;
  hitPointsRoll: string;
  setHitPointsRoll: (value: string) => void;

  // Speed
  speedWalk: string;
  setSpeedWalk: (value: string) => void;
  speedFly: string;
  setSpeedFly: (value: string) => void;
  speedSwim: string;
  setSpeedSwim: (value: string) => void;
  speedClimb: string;
  setSpeedClimb: (value: string) => void;
  speedBurrow: string;
  setSpeedBurrow: (value: string) => void;
  speedHover: boolean;
  setSpeedHover: (value: boolean) => void;
}

export function AttributesTab(props: AttributesTabProps) {
  const {
    str,
    setStr,
    dex,
    setDex,
    con,
    setCon,
    int,
    setInt,
    wis,
    setWis,
    cha,
    setCha,
    savingThrows,
    setSavingThrows,
    proficiencyBonus,
    skills,
    setSkills,
    acValue,
    setAcValue,
    acType,
    setAcType,
    armorItems,
    setArmorItems,
    hitPointsRoll,
    setHitPointsRoll,
    speedWalk,
    setSpeedWalk,
    speedFly,
    setSpeedFly,
    speedSwim,
    setSpeedSwim,
    speedClimb,
    setSpeedClimb,
    speedBurrow,
    setSpeedBurrow,
    speedHover,
    setSpeedHover,
  } = props;

  const abilities = { STR: str, DEX: dex, CON: con, INT: int, WIS: wis, CHA: cha };

  return (
    <Stack gap="md">
      <Grid>
        <Grid.Col span={2}>
          <NumberInput
            label="STR"
            min={1}
            max={30}
            value={str}
            onChange={(value) => setStr(typeof value === 'number' ? value : 10)}
            required
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <NumberInput
            label="DEX"
            min={1}
            max={30}
            value={dex}
            onChange={(value) => setDex(typeof value === 'number' ? value : 10)}
            required
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <NumberInput
            label="CON"
            min={1}
            max={30}
            value={con}
            onChange={(value) => setCon(typeof value === 'number' ? value : 10)}
            required
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <NumberInput
            label="INT"
            min={1}
            max={30}
            value={int}
            onChange={(value) => setInt(typeof value === 'number' ? value : 10)}
            required
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <NumberInput
            label="WIS"
            min={1}
            max={30}
            value={wis}
            onChange={(value) => setWis(typeof value === 'number' ? value : 10)}
            required
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <NumberInput
            label="CHA"
            min={1}
            max={30}
            value={cha}
            onChange={(value) => setCha(typeof value === 'number' ? value : 10)}
            required
          />
        </Grid.Col>
      </Grid>

      <div>
        <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Saving Throw Proficiencies</p>
        <Grid>
          {ABILITY_OPTIONS.map((ability) => (
            <Grid.Col key={ability} span={6}>
              <Group>
                <Checkbox
                  label={ability}
                  checked={savingThrows[ability].enabled}
                  onChange={(e) => {
                    const abilityScore = abilities[ability as keyof typeof abilities];
                    const modifier = Math.floor((abilityScore - 10) / 2);
                    const autoValue = modifier + proficiencyBonus;

                    setSavingThrows({
                      ...savingThrows,
                      [ability]: {
                        enabled: e.target.checked,
                        value: e.target.checked ? autoValue : 0,
                      },
                    });
                  }}
                />
                {savingThrows[ability].enabled && (
                  <NumberInput
                    size="xs"
                    style={{ width: 80 }}
                    value={savingThrows[ability].value}
                    onChange={(value) =>
                      setSavingThrows({
                        ...savingThrows,
                        [ability]: {
                          ...savingThrows[ability],
                          value: typeof value === 'number' ? value : 0,
                        },
                      })
                    }
                  />
                )}
              </Group>
            </Grid.Col>
          ))}
        </Grid>
      </div>

      <SkillsInput skills={skills} setSkills={setSkills} />

      <Grid>
        <Grid.Col span={6}>
          <NumberInput
            label="Armor Class"
            min={1}
            max={30}
            value={acValue}
            onChange={(value) => setAcValue(typeof value === 'number' ? value : 10)}
            required
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="AC Type"
            placeholder="e.g., natural, armor"
            value={acType}
            onChange={(e) => setAcType(e.target.value)}
          />
        </Grid.Col>
      </Grid>

      {/* Armor Items (Optional) */}
      {acType === 'armor' && (
        <Box>
          <Text size="sm" fw={500} mb="xs">
            Armor Items (Optional)
          </Text>
          {armorItems.map((item, index) => (
            <Group key={index} mb="xs">
              <TextInput
                placeholder="Armor index (e.g., plate)"
                value={item.index}
                onChange={(e) => {
                  const updated = [...armorItems];
                  updated[index] = { ...item, index: e.target.value };
                  setArmorItems(updated);
                }}
                style={{ flex: 1 }}
              />
              <TextInput
                placeholder="Armor name (e.g., Plate)"
                value={item.name}
                onChange={(e) => {
                  const updated = [...armorItems];
                  updated[index] = { ...item, name: e.target.value };
                  setArmorItems(updated);
                }}
                style={{ flex: 1 }}
              />
              <ActionIcon
                color="red"
                variant="subtle"
                onClick={() => {
                  const updated = armorItems.filter((_, i) => i !== index);
                  setArmorItems(updated);
                }}>
                <PiTrash size={16} />
              </ActionIcon>
            </Group>
          ))}
          <Button
            variant="light"
            size="xs"
            onClick={() => {
              setArmorItems([...armorItems, { index: '', name: '' }]);
            }}>
            Add Armor Item
          </Button>
        </Box>
      )}

      <TextInput
        label="Hit Points Roll"
        placeholder="e.g., 6d8+12"
        value={hitPointsRoll}
        onChange={(e) => setHitPointsRoll(e.target.value)}
        required
      />

      <Grid>
        <Grid.Col span={6}>
          <TextInput
            label="Walk Speed"
            value={speedWalk}
            onChange={(e) => setSpeedWalk(e.target.value)}
            required
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Fly Speed"
            placeholder="Optional"
            value={speedFly}
            onChange={(e) => setSpeedFly(e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Swim Speed"
            placeholder="Optional"
            value={speedSwim}
            onChange={(e) => setSpeedSwim(e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Climb Speed"
            placeholder="Optional"
            value={speedClimb}
            onChange={(e) => setSpeedClimb(e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Burrow Speed"
            placeholder="Optional"
            value={speedBurrow}
            onChange={(e) => setSpeedBurrow(e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Checkbox
            label="Hover"
            checked={speedHover}
            onChange={(e) => setSpeedHover(e.target.checked)}
            mt="xl"
          />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
