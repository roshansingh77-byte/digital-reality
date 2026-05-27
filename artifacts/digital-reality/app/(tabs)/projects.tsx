import React, { useState } from "react";
import {
  FlatList,
  Modal,
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
import { ProjectCard } from "@/components/ProjectCard";
import type { ProjectStatus } from "@/context/AppContext";

const FILTERS: Array<{ label: string; value: ProjectStatus | "All" }> = [
  { label: "All", value: "All" },
  { label: "Active", value: "Active" },
  { label: "Completed", value: "Completed" },
  { label: "On Hold", value: "On Hold" },
  { label: "Planning", value: "Planning" },
];

export default function ProjectsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { projects, addProject } = useApp();
  const [filter, setFilter] = useState<ProjectStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  // New project form
  const [npName, setNpName] = useState("");
  const [npLoc, setNpLoc] = useState("");
  const [npState, setNpState] = useState("");
  const [npClient, setNpClient] = useState("");
  const [npPo, setNpPo] = useState("");

  let filtered = filter === "All" ? projects : projects.filter((p) => p.status === filter);
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.client.toLowerCase().includes(q) ||
      p.projectId.toLowerCase().includes(q)
    );
  }

  const handleCreate = () => {
    if (!npName) return;
    addProject({
      id: `p${Date.now()}`,
      name: npName,
      location: npLoc || "TBD",
      state: npState || "TS",
      status: "Planning",
      progress: 0,
      client: npClient || "New Client",
      projectId: `PRJ-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      poValue: parseFloat(npPo) || 0,
      startDate: "",
      endDate: "",
      projectManager: "Unassigned",
      lat: 17.385,
      lng: 78.4867,
    });
    setNpName(""); setNpLoc(""); setNpState(""); setNpClient(""); setNpPo("");
    setShowNew(false);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Projects</Text>
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
            placeholder="Search by name, client, or ID..."
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
        renderItem={({ item }) => <ProjectCard project={item} onPress={() => router.push(`/projects/${item.id}`)} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="folder" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No projects found</Text>
          </View>
        }
        scrollEnabled={!!filtered.length}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 90 }]}
        onPress={() => setShowNew(true)}
        activeOpacity={0.85}
      >
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal visible={showNew} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>New Project</Text>
              <TouchableOpacity onPress={() => setShowNew(false)}><Feather name="x" size={20} color={colors.text} /></TouchableOpacity>
            </View>
            {[
              { label: "Project Name", val: npName, set: setNpName },
              { label: "Location", val: npLoc, set: setNpLoc },
              { label: "State", val: npState, set: setNpState },
              { label: "Client", val: npClient, set: setNpClient },
              { label: "PO Value", val: npPo, set: setNpPo, num: true },
            ].map((f) => (
              <View key={f.label} style={{ gap: 4 }}>
                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
                <TextInput
                  style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
                  value={f.val} onChangeText={f.set}
                  keyboardType={f.num ? "numeric" : "default"}
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
            ))}
            <TouchableOpacity onPress={handleCreate} style={[styles.modalBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.modalBtnText}>Create Project</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  searchBar: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginTop: 10, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, gap: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, fontFamily: "Inter_400Regular" },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, gap: 8, borderBottomWidth: 1 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  list: { paddingHorizontal: 16, paddingTop: 12 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  fab: { position: "absolute", right: 20, width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 16 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  modalLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  modalInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, fontFamily: "Inter_400Regular" },
  modalBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  modalBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
