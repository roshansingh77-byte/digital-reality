import React, { useEffect, useRef } from "react";
import {
  Animated,
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
import { ProgressBar } from "@/components/ProgressBar";

interface IndustryConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  lightBg: string;
  animationDelay: number;
  clients: string[];
}

const industries: IndustryConfig[] = [
  {
    id: "railways",
    name: "Railways",
    icon: "truck",
    color: "#2563eb",
    lightBg: "#dbeafe",
    animationDelay: 0,
    clients: ["South Central Railway", "Indian Railways", "SCR", "Indian Railway", "Railway"],
  },
  {
    id: "highways",
    name: "Highways",
    icon: "map",
    color: "#ea580c",
    lightBg: "#ffedd5",
    animationDelay: 150,
    clients: ["NHAI", "Highway"],
  },
  {
    id: "metro",
    name: "Metro",
    icon: "map-pin",
    color: "#0d9488",
    lightBg: "#ccfbf1",
    animationDelay: 300,
    clients: ["CMRL", "Metro"],
  },
];

function matchesClient(client: string, clients: string[]): boolean {
  if (!client) return false;
  const c = client.toLowerCase();
  return clients.some(cl => c.includes(cl.toLowerCase()));
}

function getIndustryStats(projects: any[], industry: IndustryConfig) {
  const filtered = projects.filter((p: any) => matchesClient(p.client, industry.clients));
  const totalValue = filtered.reduce((sum: number, p: any) => sum + p.poValue, 0);
  const active = filtered.filter((p: any) => p.status === "Active");
  const completed = filtered.filter((p: any) => p.status === "Completed");
  const planning = filtered.filter((p: any) => p.status === "Planning");
  const onHold = filtered.filter((p: any) => p.status === "On Hold");
  const avgProgress = filtered.length
    ? Math.round(filtered.reduce((sum: number, p: any) => sum + p.progress, 0) / filtered.length)
    : 0;
  return { projects: filtered, totalValue, active, completed, planning, onHold, avgProgress };
}

function fm(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function PipelineCard() {
  const colors = useColors();
  const { projects } = useApp();
  const pipeline = projects.filter((p: any) => {
    if (p.status !== "Planning" && p.status !== "On Hold") return false;
    return !industries.some((ind: IndustryConfig) => matchesClient(p.client, ind.clients));
  });
  const totalValue = pipeline.reduce((s: number, p: any) => s + p.poValue, 0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay: 450, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, delay: 450, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={[iStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[iStyles.gradientBar, { backgroundColor: "#d97706" }]} />
        <View style={iStyles.cardBody}>
          <View style={iStyles.header}>
            <View style={[iStyles.iconWrap, { backgroundColor: "#fef3c7" }]}>
              <Feather name="clock" size={18} color="#d97706" />
            </View>
            <View>
              <Text style={[iStyles.industryName, { color: colors.text }]}>In Pipeline</Text>
              <Text style={[iStyles.projectCount, { color: colors.mutedForeground }]}>
                {pipeline.length} project{pipeline.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>

          <View style={iStyles.statsRow}>
            <View style={[iStyles.statBox, { backgroundColor: colors.muted }]}>
              <Text style={[iStyles.statValue, { color: colors.text }]}>{pipeline.filter((p: any) => p.status === "Active").length}</Text>
              <Text style={[iStyles.statLabel, { color: colors.mutedForeground }]}>Active</Text>
            </View>
            <View style={[iStyles.statBox, { backgroundColor: colors.muted }]}>
              <Text style={[iStyles.statValue, { color: colors.text }]}>{pipeline.filter((p: any) => p.status === "Planning").length}</Text>
              <Text style={[iStyles.statLabel, { color: colors.mutedForeground }]}>Planning</Text>
            </View>
            <View style={[iStyles.statBox, { backgroundColor: colors.muted }]}>
              <Text style={[iStyles.statValue, { color: colors.text }]}>{pipeline.filter((p: any) => p.status === "On Hold").length}</Text>
              <Text style={[iStyles.statLabel, { color: colors.mutedForeground }]}>On Hold</Text>
            </View>
            <View style={[iStyles.statBox, { backgroundColor: colors.muted }]}>
              <Text style={[iStyles.statValue, { color: colors.text }]}>{pipeline.filter((p: any) => p.status === "Completed").length}</Text>
              <Text style={[iStyles.statLabel, { color: colors.mutedForeground }]}>Done</Text>
            </View>
          </View>

          <View style={iStyles.footer}>
            <View>
              <Text style={[iStyles.valueLabel, { color: colors.mutedForeground }]}>Total Value</Text>
              <Text style={[iStyles.valueAmt, { color: colors.text }]}>{fm(totalValue)}</Text>
            </View>
            <View style={[iStyles.clientBadge, { backgroundColor: "#fef3c7" }]}>
              <Text style={[iStyles.clientBadgeText, { color: "#d97706" }]}>
                {pipeline.length} project{pipeline.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function IndustryCard({ industry }: { industry: IndustryConfig }) {
  const colors = useColors();
  const stats = getIndustryStats(useApp().projects, industry);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: industry.animationDelay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: industry.animationDelay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={[iStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[iStyles.gradientBar, { backgroundColor: industry.color }]} />
        <View style={iStyles.cardBody}>
          <View style={iStyles.header}>
            <View style={[iStyles.iconWrap, { backgroundColor: industry.lightBg }]}>
              <Feather name={industry.icon as any} size={18} color={industry.color} />
            </View>
            <View>
              <Text style={[iStyles.industryName, { color: colors.text }]}>{industry.name}</Text>
              <Text style={[iStyles.projectCount, { color: colors.mutedForeground }]}>
                {stats.projects.length} project{stats.projects.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>

          <View style={iStyles.statsRow}>
            <View style={[iStyles.statBox, { backgroundColor: colors.muted }]}>
              <Text style={[iStyles.statValue, { color: industry.color }]}>{stats.active.length}</Text>
              <Text style={[iStyles.statLabel, { color: colors.mutedForeground }]}>Active</Text>
            </View>
            <View style={[iStyles.statBox, { backgroundColor: colors.muted }]}>
              <Text style={[iStyles.statValue, { color: industry.color }]}>{stats.planning.length}</Text>
              <Text style={[iStyles.statLabel, { color: colors.mutedForeground }]}>Planning</Text>
            </View>
            <View style={[iStyles.statBox, { backgroundColor: colors.muted }]}>
              <Text style={[iStyles.statValue, { color: industry.color }]}>{stats.onHold.length}</Text>
              <Text style={[iStyles.statLabel, { color: colors.mutedForeground }]}>On Hold</Text>
            </View>
            <View style={[iStyles.statBox, { backgroundColor: colors.muted }]}>
              <Text style={[iStyles.statValue, { color: industry.color }]}>{stats.completed.length}</Text>
              <Text style={[iStyles.statLabel, { color: colors.mutedForeground }]}>Done</Text>
            </View>
          </View>

          <View style={iStyles.progressRow}>
            <Text style={[iStyles.progressLabel, { color: colors.mutedForeground }]}>Overall Progress</Text>
            <Text style={[iStyles.progressPct, { color: industry.color }]}>{stats.avgProgress}%</Text>
          </View>
          <ProgressBar progress={stats.avgProgress} height={8} color={industry.color} />

          <View style={iStyles.footer}>
            <View>
              <Text style={[iStyles.valueLabel, { color: colors.mutedForeground }]}>Total Value</Text>
              <Text style={[iStyles.valueAmt, { color: colors.text }]}>{fm(stats.totalValue)}</Text>
            </View>
            <View style={[iStyles.clientBadge, { backgroundColor: industry.lightBg }]}>
              <Text style={[iStyles.clientBadgeText, { color: industry.color }]}>
                {industry.clients.length} client{industry.clients.length > 1 ? "s" : ""}
              </Text>
            </View>
          </View>

          <View style={iStyles.clientTags}>
            {industry.clients.map((client) => (
              <View key={client} style={[iStyles.clientTag, { backgroundColor: colors.secondary }]}>
                <Text style={[iStyles.clientTagText, { color: colors.mutedForeground }]}>{client}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function IndustriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { projects } = useApp();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 100, gap: 16, paddingTop: Platform.OS === "web" ? 12 : 0 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[s.title, { color: colors.text }]}>Industries</Text>
          <Text style={[s.subtitle, { color: colors.mutedForeground }]}>
            Big industry segments we serve
          </Text>
        </Animated.View>

        <View style={s.cardsGrid}>
          {industries.map((ind) => (
            <IndustryCard key={ind.id} industry={ind} />
          ))}
          <PipelineCard />
        </View>

        <Text style={[s.sectionTitle, { color: colors.text }]}>Industry Projects</Text>

        {projects
          .filter((p: any) => {
            const matched = industries.find((ind: IndustryConfig) => matchesClient(p.client, ind.clients));
            const isPipeline = p.status === "Planning" || p.status === "On Hold";
            return matched || isPipeline;
          })
          .map((item: any, idx: number) => {
          const ind = industries.find((i: IndustryConfig) => matchesClient(item.client, i.clients));
          const isPipeline = !ind && (item.status === "Planning" || item.status === "On Hold");
          const iconName = ind ? ind.icon : "clock";
          const iconColor = ind ? ind.color : "#d97706";
          const iconBg = ind ? ind.lightBg : "#fef3c7";
          const badgeName = ind ? ind.name : "Pipeline";
          const badgeBg = ind ? ind.lightBg : "#fef3c7";
          const badgeColor = ind ? ind.color : "#d97706";
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(`/projects/${item.id}`)}
              activeOpacity={0.7}
            >
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  })}],
                }}
              >
                <View style={[s.projectRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[s.projectIcon, { backgroundColor: iconBg }]}>
                    <Feather name={iconName as any} size={16} color={iconColor} />
                  </View>
                  <View style={s.projectInfo}>
                    <View style={s.projectNameRow}>
                      <Text style={[s.projectName, { color: colors.text }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={[s.projectBadge, { backgroundColor: badgeBg }]}>
                        <Text style={[s.projectBadgeText, { color: badgeColor }]}>{badgeName}</Text>
                      </View>
                    </View>
                    <Text style={[s.projectMeta, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {item.client} &bull; {item.location}
                    </Text>
                  </View>
                  <View style={s.projectProgress}>
                    <Text style={[s.projectPctLabel, { color: colors.mutedForeground }]}>Progress</Text>
                    <View style={s.projectPctRow}>
                      <View style={[s.projectPctTrack, { backgroundColor: colors.muted }]}>
                        <View style={[s.projectPctFill, { width: `${item.progress}%` as any, backgroundColor: iconColor }]} />
                      </View>
                      <Text style={[s.projectPctNum, { color: colors.text }]}>{item.progress}%</Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4 },
  cardsGrid: { gap: 14 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginTop: 4 },
  projectRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    gap: 10,
  },
  projectIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  projectInfo: { flex: 1, minWidth: 0 },
  projectNameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  projectName: { fontSize: 14, fontFamily: "Inter_600SemiBold", flexShrink: 1 },
  projectBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 },
  projectBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  projectMeta: { fontSize: 11, fontFamily: "Inter_400Regular" },
  projectProgress: { width: 100, gap: 2 },
  projectPctLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "right" },
  projectPctRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  projectPctTrack: { flex: 1, height: 4, borderRadius: 2, overflow: "hidden" },
  projectPctFill: { height: 4, borderRadius: 2 },
  projectPctNum: { fontSize: 11, fontFamily: "Inter_700Bold", minWidth: 30, textAlign: "right" },
});

const iStyles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  gradientBar: { height: 3 },
  cardBody: { padding: 16, gap: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  industryName: { fontSize: 17, fontFamily: "Inter_700Bold" },
  projectCount: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statsRow: { flexDirection: "row", gap: 8 },
  statBox: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    gap: 2,
  },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  progressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  progressPct: { fontSize: 13, fontFamily: "Inter_700Bold" },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  valueLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  valueAmt: { fontSize: 16, fontFamily: "Inter_700Bold" },
  clientBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  clientBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  clientTags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  clientTag: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  clientTagText: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
