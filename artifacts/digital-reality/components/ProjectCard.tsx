import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { Project } from "@/context/AppContext";
import { StatusBadge } from "./StatusBadge";
import { ProgressBar } from "./ProgressBar";

interface Props {
  project: Project;
  onPress?: () => void;
  compact?: boolean;
}

export function ProjectCard({ project, onPress, compact }: Props) {
  const colors = useColors();

  if (compact) {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.compact, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.7}>
        <View style={styles.compactLeft}>
          <Text style={[styles.compactName, { color: colors.text }]} numberOfLines={1}>{project.name}</Text>
          <Text style={[styles.compactLoc, { color: colors.mutedForeground }]}>{project.location}, {project.state}</Text>
        </View>
        <View style={styles.compactRight}>
          <Text style={[styles.compactPct, { color: colors.primary }]}>{project.progress}%</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{project.name}</Text>
          <View style={styles.locRow}>
            <Feather name="map-pin" size={12} color={colors.mutedForeground} />
            <Text style={[styles.loc, { color: colors.mutedForeground }]}>{project.location}, {project.state}</Text>
          </View>
        </View>
        <StatusBadge status={project.status} small />
      </View>

      <View style={styles.dateRow}>
        <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
          {project.startDate ? `Start: ${project.startDate}` : "Start: TBD"}
        </Text>
        <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
          {project.endDate ? `End: ${project.endDate}` : "End: —"}
        </Text>
      </View>

      <ProgressBar progress={project.progress} showLabel height={8} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  loc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  compact: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  compactLeft: {
    flex: 1,
    gap: 3,
  },
  compactName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  compactLoc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  compactRight: {},
  compactPct: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
});
