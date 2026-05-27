import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

export default function ActivitiesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { activities, projects } = useApp();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const getProjectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "Unknown";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Activities</Text>
        <TouchableOpacity style={[styles.iconBtn, { borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
                <Feather name="activity" size={16} color={colors.primary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.actType, { color: colors.text }]}>{item.activityType}</Text>
                <Text style={[styles.projName, { color: colors.primary }]}>{getProjectName(item.projectId)}</Text>
              </View>
              <View style={[styles.pctBadge, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.pctText, { color: colors.primary }]}>
                  {[item.fieldWork, item.processing, item.modelling, item.documentation].filter(s => s.completed).length}/4
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Feather name="calendar" size={12} color={colors.mutedForeground} />
                <Text style={[styles.detailText, { color: colors.mutedForeground }]}>{item.date}</Text>
              </View>
              <View style={styles.detailItem}>
                <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                <Text style={[styles.detailText, { color: colors.mutedForeground }]}>{item.location}</Text>
              </View>
              <View style={styles.detailItem}>
                <Feather name="maximize-2" size={12} color={colors.mutedForeground} />
                <Text style={[styles.detailText, { color: colors.mutedForeground }]}>{item.fieldWork.areaSqKm} sqkm</Text>
              </View>
            </View>

            {item.fieldWork.equipmentUsed.length > 0 && (
              <View style={styles.tagsRow}>
                {item.fieldWork.equipmentUsed.map((eq) => (
                  <View key={eq} style={[styles.tag, { backgroundColor: colors.infoBg }]}>
                    <Text style={[styles.tagText, { color: colors.info }]}>{eq}</Text>
                  </View>
                ))}
              </View>
            )}

            {item.fieldWork.remarks ? (
              <Text style={[styles.remarks, { color: colors.mutedForeground }]} numberOfLines={2}>{item.fieldWork.remarks}</Text>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="clipboard" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No activities yet</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 90 }]}
        onPress={() => router.push("/activities/add")}
        activeOpacity={0.85}
      >
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  card: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1 },
  actType: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  projName: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  pctBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pctText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  detailRow: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  detailText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  remarks: { fontSize: 12, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  fab: {
    position: "absolute",
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
