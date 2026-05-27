import React from "react";
import {
  Platform,
  ScrollView,
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
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectsMapView } from "@/components/ProjectsMapView";

function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, projects, activities, equipment, invoices } = useApp();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const todayActivities = activities.filter((a) => a.date.includes("16 May")).length;
  const equipmentInUse = equipment.filter((e) => e.status === "In Use").length;
  const totalPending = invoices.filter((i) => i.status === "Pending" || i.status === "Partial").reduce((s, i) => s + i.amount, 0);
  const totalPoValue = projects.reduce((s, p) => s + p.poValue, 0);

  const recentProjects = [...projects].filter((p) => p.status === "Active").slice(0, 3);

  const fm = (n: number) => n >= 10000000 ? `₹${(n/10000000).toFixed(2)}Cr` : n >= 100000 ? `₹${(n/100000).toFixed(2)}L` : `₹${n.toLocaleString("en-IN")}`;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.container, { paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.welcome, { color: colors.mutedForeground }]}>Welcome back,</Text>
          <View style={styles.nameRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={{ color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" }}>AK</Text>
            </View>
            <View>
              <Text style={[styles.userName, { color: colors.text }]}>{user?.name ?? "User"}</Text>
              <Text style={[styles.userRole, { color: colors.mutedForeground }]}>{user?.role}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={[styles.notifBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="bell" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {recentProjects[0] && (
        <TouchableOpacity
          style={[styles.activeBanner, { backgroundColor: colors.primary }]}
          onPress={() => router.push(`/projects/${recentProjects[0].id}`)}
          activeOpacity={0.85}
        >
          <View>
            <Text style={styles.bannerLabel}>Active Project</Text>
            <Text style={styles.bannerName}>{recentProjects[0].name}</Text>
            <View style={styles.bannerLocRow}>
              <Feather name="map-pin" size={12} color="rgba(255,255,255,0.7)" />
              <Text style={styles.bannerLoc}>{recentProjects[0].location}, {recentProjects[0].state}</Text>
            </View>
          </View>
          <View style={styles.bannerPctWrap}>
            <Text style={styles.bannerPct}>{recentProjects[0].progress}%</Text>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.statsGrid}>
        <StatCard label="Active Projects" value={String(activeProjects)} color={colors.primary} icon="briefcase" />
        <StatCard label="Today's Activities" value={String(todayActivities)} color={colors.success} icon="activity" />
        <StatCard label="Equipment in Use" value={String(equipmentInUse)} color={colors.info} icon="tool" />
        <StatCard label="Pending Billing" value={fm(totalPending)} color={colors.orange} icon="credit-card" />
      </View>

      {totalPoValue > 0 && (
        <View style={[styles.poRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.poLabel, { color: colors.mutedForeground }]}>Total PO Value</Text>
          <Text style={[styles.poValue, { color: colors.text }]}>{fm(totalPoValue)}</Text>
        </View>
      )}

      <ProjectsMapView
        projects={recentProjects}
        onProjectPress={(project) => router.push(`/projects/${project.id}`)}
      />

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Projects</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/projects")}>
          <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>

      {recentProjects.map((p) => (
        <ProjectCard key={p.id} project={p} compact onPress={() => router.push(`/projects/${p.id}`)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { paddingHorizontal: 16, gap: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  welcome: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 6 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  userName: { fontSize: 16, fontFamily: "Inter_700Bold" },
  userRole: { fontSize: 12, fontFamily: "Inter_400Regular" },
  notifBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  activeBanner: { borderRadius: 14, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bannerLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_500Medium", marginBottom: 4 },
  bannerName: { fontSize: 16, color: "#fff", fontFamily: "Inter_700Bold", marginBottom: 4 },
  bannerLocRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  bannerLoc: { fontSize: 12, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular" },
  bannerPctWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  bannerPct: { fontSize: 18, color: "#fff", fontFamily: "Inter_700Bold" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: { flex: 1, minWidth: "44%", borderRadius: 12, padding: 14, borderWidth: 1, gap: 4 },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  poRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 12, padding: 14, borderWidth: 1 },
  poLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  poValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  viewAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
});
