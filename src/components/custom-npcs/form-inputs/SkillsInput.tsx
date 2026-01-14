'use client';

import { Stack, Group, Button, Select, NumberInput, ActionIcon } from '@mantine/core';
import { PiPlus, PiTrash } from 'react-icons/pi';
import { useState } from 'react';
import { SKILL_OPTIONS } from '../form-constants';

export interface SkillsInputProps {
  skills: { [skillName: string]: number };
  setSkills: (skills: { [skillName: string]: number }) => void;
}

export function SkillsInput({ skills, setSkills }: SkillsInputProps) {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [skillValue, setSkillValue] = useState<number>(0);

  const skillEntries = Object.entries(skills);
  const usedSkills = Object.keys(skills);
  const availableSkills = SKILL_OPTIONS.filter((skill) => !usedSkills.includes(skill));

  const handleAddSkill = () => {
    if (selectedSkill) {
      setSkills({ ...skills, [selectedSkill]: skillValue });
      setSelectedSkill(null);
      setSkillValue(0);
    }
  };

  const handleRemoveSkill = (skillName: string) => {
    const { [skillName]: _, ...rest } = skills;
    setSkills(rest);
  };

  const handleUpdateSkill = (skillName: string, value: number) => {
    setSkills({ ...skills, [skillName]: value });
  };

  return (
    <Stack gap="md">
      <div>
        <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
          Skill Proficiencies ({skillEntries.length})
        </p>

        {skillEntries.length > 0 && (
          <Stack gap="xs" mb="md">
            {skillEntries.map(([skillName, value]) => (
              <Group key={skillName} gap="xs">
                <div style={{ flex: 1, fontSize: 14 }}>{skillName}</div>
                <NumberInput
                  value={value}
                  onChange={(val) => handleUpdateSkill(skillName, typeof val === 'number' ? val : 0)}
                  style={{ width: 80 }}
                  size="xs"
                />
                <ActionIcon color="red" variant="subtle" onClick={() => handleRemoveSkill(skillName)} size="sm">
                  <PiTrash size={16} />
                </ActionIcon>
              </Group>
            ))}
          </Stack>
        )}

        {availableSkills.length > 0 && (
          <Group gap="xs">
            <Select
              placeholder="Select skill"
              data={availableSkills}
              value={selectedSkill}
              onChange={setSelectedSkill}
              style={{ flex: 1 }}
              size="xs"
              searchable
            />
            <NumberInput
              placeholder="Modifier"
              value={skillValue}
              onChange={(val) => setSkillValue(typeof val === 'number' ? val : 0)}
              style={{ width: 80 }}
              size="xs"
            />
            <Button
              size="xs"
              variant="light"
              leftSection={<PiPlus size={14} />}
              onClick={handleAddSkill}
              disabled={!selectedSkill}>
              Add
            </Button>
          </Group>
        )}
      </div>
    </Stack>
  );
}
