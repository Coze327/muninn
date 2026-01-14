"use client";

import styles from "./DiceRollNotification.module.css";

interface DiceRollNotificationProps {
  creatureName: string;
  rollName: string;
  rollOutput: string;
  total: number;
  rollType: "ability" | "save" | "skill" | "attack" | "damage";
  isCritical?: "nat20" | "nat1" | null;
}

export function DiceRollNotification({
  creatureName,
  rollName,
  rollOutput,
  total,
  rollType,
  isCritical,
}: DiceRollNotificationProps) {
  // Build CSS classes
  const notificationClasses = [
    styles.notification,
    isCritical === "nat20" ? styles.criticalSuccess : "",
    isCritical === "nat1" ? styles.criticalFail : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={notificationClasses}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.creatureName}>{creatureName}</span>
        <span className={styles.rollName}>· {rollName}</span>
      </div>

      {/* Dice breakdown */}
      <div className={styles.breakdown}>{rollOutput}</div>

      {/* Total display */}
      <div className={styles.total}>
        <span className={styles.totalLabel}>Total</span>
        <span className={styles.totalValue}>{total}</span>
      </div>
    </div>
  );
}
