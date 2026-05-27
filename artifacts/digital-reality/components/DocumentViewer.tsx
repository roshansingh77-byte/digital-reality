import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as WebBrowser from "expo-web-browser";
import { useColors } from "@/hooks/useColors";
import type { Document } from "@/context/AppContext";
import { getFileIcon, formatFileSize } from "@/lib/documentUtils";

interface DocumentViewerProps {
  document: Document;
  onClose: () => void;
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const colors = useColors();

  const handleOpenDocument = async () => {
    try {
      // Check if file exists
      const fileExists = await FileSystem.getInfoAsync(document.filePath);
      if (!fileExists.exists) {
        Alert.alert("Error", "Document file not found");
        return;
      }

      // For images, use native image viewer
      if (document.mimeType.startsWith("image/")) {
        // Can be opened with native image viewer
        try {
          await WebBrowser.openBrowserAsync(`file://${document.filePath}`);
        } catch {
          Alert.alert("Info", "Document stored at: " + document.filePath);
        }
        return;
      }

      // For other file types, show stored location
      Alert.alert("Document Location", `File stored at:\n${document.filePath}\n\nSize: ${formatFileSize(document.fileSize)}`);
    } catch (error) {
      Alert.alert("Error", "Failed to open document: " + (error as any).message);
    }
  };

  const handleShare = async () => {
    Alert.alert("Share", "Document sharing feature coming soon", [{ text: "OK" }]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onClose}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Document Details</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Document Preview Area */}
      <View style={[styles.previewArea, { backgroundColor: colors.secondary }]}>
        <View style={[styles.iconContainer, { backgroundColor: colors.muted }]}>
          <Feather name={getFileIcon(document.name) as any} size={48} color={colors.primary} />
        </View>
      </View>

      {/* Document Info */}
      <View style={styles.infoSection}>
        <Text style={[styles.docName, { color: colors.text }]}>{document.name}</Text>

        <View style={[styles.infoRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Type</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{document.type}</Text>
          </View>
        </View>

        <View style={[styles.infoRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.infoLeft}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Size</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{formatFileSize(document.fileSize)}</Text>
          </View>
          <View>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Uploaded</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {new Date(document.uploadedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={[styles.infoRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.infoLeft}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Uploaded By</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{document.uploadedBy}</Text>
          </View>
          <View>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Status</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{document.status}</Text>
          </View>
        </View>

        {document.description && (
          <View style={[styles.infoRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Description</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{document.description}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={handleOpenDocument}
        >
          <Feather name="eye" size={18} color={colors.primaryForeground} />
          <Text style={[styles.actionBtnText, { color: colors.primaryForeground }]}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.secondary }]}
          onPress={handleShare}
        >
          <Feather name="share-2" size={18} color={colors.text} />
          <Text style={[styles.actionBtnText, { color: colors.text }]}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  previewArea: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    margin: 16,
    borderRadius: 12,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  infoSection: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 12,
  },
  docName: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },
  infoRow: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  infoLeft: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
