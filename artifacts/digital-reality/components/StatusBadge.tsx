import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { ProjectStatus, EquipmentStatus, InvoiceStatus } from "@/context/AppContext";

type BadgeStatus = ProjectStatus | EquipmentStatus | InvoiceStatus;

interface Props {
  status: BadgeStatus;
  small?: boolean;
}

export function StatusBadge({ status, small }: Props) {
  const colors = useColors();

  const getStyle = (): { bg: string; text: string } => {
    switch (status) {
      case "Active":
      case "In Use":
      case "Paid":
        return { bg: colors.successBg, text: colors.success };
      case "Completed":
        return { bg: colors.infoBg, text: colors.info };
      case "Planning":
      case "Available":
        return { bg: colors.secondary, text: colors.primary };
      case "On Hold":
      case "Maintenance":
        return { bg: colors.warningBg, text: colors.warning };
      case "Quotation Sent":
        return { bg: colors.purpleBg, text: colors.purple };
      case "Partial":
        return { bg: colors.warningBg, text: colors.warning };
      case "Pending":
        return { bg: colors.orangeBg, text: colors.orange };
      case "Not Raised":
        return { bg: colors.muted, text: colors.mutedForeground };
      default:
        return { bg: colors.muted, text: colors.mutedForeground };
    }
  };

  const { bg, text } = getStyle();

  return (
    <View style={[styles.badge, { backgroundColor: bg }, small && styles.small]}>
      <Text style={[styles.text, { color: text }, small && styles.smallText]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  smallText: {
    fontSize: 10,
  },
});
