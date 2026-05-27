import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { StatusBadge } from "@/components/StatusBadge";
import type { EquipmentStatus } from "@/context/AppContext";

const FILTERS: Array<{ label: string; value: EquipmentStatus | "All" }> = [
  { label: "All", value: "All" },
  { label: "In Use", value: "In Use" },
  { label: "Available", value: "Available" },
  { label: "Maintenance", value: "Maintenance" },
];

const EQUIPMENT_ICONS: Record<string, string> = {
  "Mobile LiDAR Scanner": "cpu",
  "Fixed Wing UAV": "send",
  "GNSS Receiver": "radio",
  "Total Station": "target",
  "3D Laser Scanner": "aperture",
  "Drone UAV": "send",
};

export default function EquipmentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { equipment } = useApp();
  const [filter, setFilter] = useState<EquipmentStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  let filtered = filter === "All" ? equipment : equipment.filter((e) => e.status === filter);
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter((e) =>
      e.name.toLowerCase().includes(q) || e.type.toLowerCase().includes(q) || e.assignedTo.toLowerCase().includes(q)
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { borderColor: colors.border }]}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Equipment</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.iconBtn, { borderColor: colors.border }]} onPress={() => setShowSearch(!showSearch)}>
            <Feather name="search" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by name, type, or assigned to..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      <View style={[styles.filterRow, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            onPress={() => setFilter(f.value)}
            style={[styles.filterBtn, filter === f.value && { backgroundColor: colors.primary }, filter !== f.value && { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, { color: filter === f.value ? "#fff" : colors.mutedForeground }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.equipIcon, { backgroundColor: colors.secondary }]}>
              <Feather name={(EQUIPMENT_ICONS[item.type] ?? "tool") as any} size={22} color={colors.primary} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.equipName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.equipType, { color: colors.mutedForeground }]}>{item.type}</Text>
              {item.assignedTo ? <Text style={[styles.assignedTo, { color: colors.mutedForeground }]}>Assigned to: {item.assignedTo}</Text> : null}
            </View>
            <StatusBadge status={item.status} small />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="tool" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No equipment found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, gap: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, fontSize: 20, fontFamily: "Inter_700Bold" },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  searchBar: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginTop: 10, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, gap: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, fontFamily: "Inter_400Regular" },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, gap: 8, borderBottomWidth: 1 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  list: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  card: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 14, borderWidth: 1, gap: 12 },
  equipIcon: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardInfo: { flex: 1, gap: 3 },
  equipName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  equipType: { fontSize: 12, fontFamily: "Inter_400Regular" },
  assignedTo: { fontSize: 12, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
