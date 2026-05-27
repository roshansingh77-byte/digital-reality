import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  progress: number;
  showLabel?: boolean;
  height?: number;
  color?: string;
}

export function ProgressBar({ progress, showLabel, height = 6, color }: Props) {
  const colors = useColors();
  const pct = Math.min(100, Math.max(0, progress));

  const barColor = color ?? (pct >= 75 ? colors.success : pct >= 40 ? colors.primary : colors.warning);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.track, { height, backgroundColor: colors.border }]}>
        <View style={[styles.fill, { width: `${pct}%` as any, height, backgroundColor: barColor, borderRadius: height }]} />
      </View>
      {showLabel && <Text style={[styles.label, { color: barColor }]}>{pct}%</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  track: {
    flex: 1,
    backgroundColor: "#E2E8F0",
    borderRadius: 99,
    overflow: "hidden",
  },
  fill: {
    borderRadius: 99,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    minWidth: 36,
    textAlign: "right",
  },
});
