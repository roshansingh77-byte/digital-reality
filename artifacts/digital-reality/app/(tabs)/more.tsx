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
import * as Haptics from "expo-haptics";

function MenuItem({ icon, label, onPress, color }: { icon: string; label: string; onPress: () => void; color?: string }) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[mStyles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[mStyles.menuIcon, { backgroundColor: color ? `${color}20` : colors.secondary }]}>
        <Feather name={icon as any} size={18} color={color ?? colors.primary} />
      </View>
      <Text style={[mStyles.menuLabel, { color: colors.text }]}>{label}</Text>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useApp();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const handleLogout = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logout();
    router.replace("/");
  };

  return (
    <ScrollView
      style={[mStyles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[mStyles.container, { paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile */}
      <View style={[mStyles.profileCard, { backgroundColor: colors.primary }]}>
        <View style={mStyles.avatarWrap}>
          <Text style={mStyles.avatarText}>AK</Text>
        </View>
        <View>
          <Text style={mStyles.profileName}>{user?.name ?? "User"}</Text>
          <Text style={mStyles.profileRole}>{user?.role}</Text>
          <Text style={mStyles.profileEmail}>{user?.email}</Text>
        </View>
      </View>

      <Text style={[mStyles.sectionLabel, { color: colors.mutedForeground }]}>MANAGEMENT</Text>
      <MenuItem icon="tool" label="Equipment" onPress={() => router.push("/equipment")} />
      <MenuItem icon="users" label="Team" onPress={() => {}} />
      <MenuItem icon="bar-chart-2" label="Reports & Analytics" onPress={() => {}} />

      <Text style={[mStyles.sectionLabel, { color: colors.mutedForeground }]}>ACCOUNT</Text>
      <MenuItem icon="settings" label="Settings" onPress={() => {}} />
      <MenuItem icon="help-circle" label="Help & Support" onPress={() => {}} />
      <MenuItem icon="log-out" label="Logout" onPress={handleLogout} color={colors.destructive} />
    </ScrollView>
  );
}

const mStyles = StyleSheet.create({
  root: { flex: 1 },
  container: { paddingHorizontal: 16, gap: 10 },
  profileCard: {
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 4,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  profileName: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  profileRole: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  profileEmail: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)" },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginTop: 6, marginBottom: 2 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
});
