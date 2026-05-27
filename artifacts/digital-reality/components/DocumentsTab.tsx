import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import type { Document, DocumentType } from "@/context/AppContext";
import {
  copyFileToDocumentsDir,
  getFileInfo,
  formatFileSize,
  getFileIcon,
  getDocumentType,
  getMimeType,
  DOCUMENT_TYPES,
  generateId,
} from "@/lib/documentUtils";

interface DocumentsTabProps {
  projectId: string;
  userName: string;
}

export function DocumentsTab({ projectId, userName }: DocumentsTabProps) {
  const colors = useColors();
  const { addDocument, getProjectDocuments } = useApp();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType>("Other");

  const documents = getProjectDocuments(projectId);

  const handleCameraCapture = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Camera access is needed to capture photos");
        return;
      }

      setLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const sourceUri = asset.uri;
        const filename = `photo_${Date.now()}.jpg`;

        const destPath = await copyFileToDocumentsDir(sourceUri, filename);
        const fileInfo = await getFileInfo(destPath);

        const doc: Document = {
          id: generateId(),
          projectId,
          name: filename,
          type: "Photo",
          status: "Uploaded",
          filePath: destPath,
          fileSize: fileInfo.size,
          mimeType: "image/jpeg",
          uploadedBy: userName,
          uploadedAt: new Date().toISOString(),
          description: "Captured from camera",
        };

        addDocument(doc);
        Alert.alert("Success", "Photo uploaded successfully!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to capture photo: " + (error as any).message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "File access is needed to upload documents");
        return;
      }

      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const sourceUri = asset.uri;
        const filename = asset.filename || `document_${Date.now()}`;

        const destPath = await copyFileToDocumentsDir(sourceUri, filename);
        const fileInfo = await getFileInfo(destPath);

        const doc: Document = {
          id: generateId(),
          projectId,
          name: fileInfo.filename,
          type: getDocumentType(filename),
          status: "Uploaded",
          filePath: destPath,
          fileSize: fileInfo.size,
          mimeType: getMimeType(filename),
          uploadedBy: userName,
          uploadedAt: new Date().toISOString(),
        };

        addDocument(doc);
        Alert.alert("Success", "Document uploaded successfully!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload document: " + (error as any).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (docId: string) => {
    Alert.alert("Delete Document", "Are you sure you want to delete this document?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Delete",
        onPress: () => {
          // TODO: Delete file from filesystem
        },
      },
    ]);
  };

  const renderDocumentItem = ({ item }: { item: Document }) => (
    <View style={[styles.docItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.docIcon, { backgroundColor: colors.secondary }]}>
        <Feather
          name={getFileIcon(item.name) as any}
          size={24}
          color={colors.primary}
        />
      </View>

      <View style={styles.docInfo}>
        <Text style={[styles.docName, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.docMeta, { color: colors.mutedForeground }]}>
          {DOCUMENT_TYPES[item.type]?.label || item.type} · {formatFileSize(item.fileSize)}
        </Text>
        <Text style={[styles.docDate, { color: colors.mutedForeground }]}>
          {new Date(item.uploadedAt).toLocaleDateString()} by {item.uploadedBy}
        </Text>
      </View>

      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <Feather name="trash-2" size={18} color={colors.destructive} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* Upload Buttons */}
      <View style={styles.uploadSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Upload Document</Text>
        <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
          Upload and manage POs, site permits, and final deliverable reports.
        </Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.uploadBtn, { backgroundColor: colors.primary }]}
            onPress={handleCameraCapture}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <>
                <Feather name="camera" size={20} color={colors.primaryForeground} />
                <Text style={[styles.uploadBtnText, { color: colors.primaryForeground }]}>
                  Capture Photo
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.uploadBtn, { backgroundColor: colors.secondary }]}
            onPress={handleFileUpload}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <>
                <Feather name="folder" size={20} color={colors.text} />
                <Text style={[styles.uploadBtnText, { color: colors.text }]}>
                  Select File
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Documents List */}
      <View style={styles.docsSection}>
        <View style={styles.docsHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Documents ({documents.length})
          </Text>
        </View>

        {documents.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No documents uploaded yet
            </Text>
            <Text style={[styles.emptySubText, { color: colors.mutedForeground }]}>
              Start by uploading a photo or document
            </Text>
          </View>
        ) : (
          <FlatList
            data={documents}
            renderItem={renderDocumentItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => (
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
            )}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  uploadSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
  },
  uploadBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  docsSection: {
    marginBottom: 32,
  },
  docsHeader: {
    marginBottom: 12,
  },
  docItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  docMeta: {
    fontSize: 12,
    marginBottom: 2,
  },
  docDate: {
    fontSize: 11,
  },
  separator: {
    height: 1,
    marginVertical: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  emptySubText: {
    fontSize: 12,
  },
});
