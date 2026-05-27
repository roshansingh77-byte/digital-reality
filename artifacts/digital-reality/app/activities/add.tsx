import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
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
import * as Haptics from "expo-haptics";

function SelectField({ label, value, placeholder, onPress, colors }: any) {
  return (
    <View style={aStyles.fieldWrap}>
      <Text style={[aStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <TouchableOpacity
        style={[aStyles.selectBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={[aStyles.selectText, { color: value ? colors.text : colors.mutedForeground }]}>
          {value || placeholder}
        </Text>
        <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
      </TouchableOpacity>
    </View>
  );
}

const ACTIVITY_TYPES = ["Drone LiDAR Survey", "GNSS Control Survey", "Ground Truth Verification", "Data Processing", "UAV Photogrammetry", "Total Station Survey"];
const EQUIPMENT_LIST = ["Trinity F90+", "GS18 DGPS", "Leica GS18", "Leica TS16", "NavVis VLX 3", "FARO Focus S350", "DJI Matrice 300"];

export default function AddActivityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { projects, addActivity } = useApp();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const [projectId, setProjectId] = useState("");
  const [actType, setActType] = useState("");
  const [date, setDate] = useState("16 May 2024");
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState("16.7563");
  const [lng, setLng] = useState("80.4356");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [area, setArea] = useState("");
  const [progress, setProgress] = useState(50);
  const [remarks, setRemarks] = useState("");

  const [showProjects, setShowProjects] = useState(false);
  const [showTypes, setShowTypes] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);

  const selectedProject = projects.find((p) => p.id === projectId);

  const toggleEquipment = (eq: string) => {
    setEquipment((prev) =>
      prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]
    );
  };

  const handleSubmit = async () => {
    if (!projectId || !actType) {
      Alert.alert("Required", "Please select a project and activity type");
      return;
    }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const activityId = Date.now().toString();
    addActivity({
      id: activityId,
      projectId,
      activityType: actType,
      date,
      location,
      lat: parseFloat(lat) || 0,
      lng: parseFloat(lng) || 0,
      fieldWork: {
        id: `fw-${activityId}`,
        date,
        time: "",
        location,
        lat: parseFloat(lat) || 0,
        lng: parseFloat(lng) || 0,
        areaSqKm: parseFloat(area) || 0,
        linearKm: 0,
        equipmentUsed: equipment,
        remarks,
        completed: true,
      },
      processing: {
        id: `proc-${activityId}`,
        softwareUsed: "",
        inputFiles: "",
        outputFiles: "",
        processingStatus: "Pending",
        remarks: "",
        completed: false,
      },
      modelling: {
        id: `mod-${activityId}`,
        modelType: "",
        softwareUsed: "",
        modelFile: "",
        remarks: "",
        completed: false,
      },
      documentation: {
        id: `doc-${activityId}`,
        reportUpload: "",
        pdfUpload: [],
        documentVersion: "",
        remarks: "",
        completed: false,
      },
    });
    router.back();
  };

  return (
    <View style={[aStyles.root, { backgroundColor: colors.background }]}>
      <View style={[aStyles.header, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[aStyles.backBtn, { borderColor: colors.border }]}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[aStyles.title, { color: colors.text }]}>Field Activity</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[aStyles.container, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Project Selector */}
        <SelectField
          label="Project"
          value={selectedProject?.name}
          placeholder="Select Project"
          onPress={() => setShowProjects(!showProjects)}
          colors={colors}
        />
        {showProjects && (
          <View style={[aStyles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {projects.filter((p) => p.status === "Active").map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[aStyles.dropItem, { borderBottomColor: colors.border }]}
                onPress={() => { setProjectId(p.id); setShowProjects(false); }}
              >
                <Text style={[aStyles.dropText, { color: colors.text }]}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Activity Type */}
        <SelectField
          label="Activity Type"
          value={actType}
          placeholder="Select Activity Type"
          onPress={() => setShowTypes(!showTypes)}
          colors={colors}
        />
        {showTypes && (
          <View style={[aStyles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {ACTIVITY_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[aStyles.dropItem, { borderBottomColor: colors.border }]}
                onPress={() => { setActType(t); setShowTypes(false); }}
              >
                <Text style={[aStyles.dropText, { color: colors.text }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Date */}
        <View style={aStyles.fieldWrap}>
          <Text style={[aStyles.label, { color: colors.mutedForeground }]}>Date</Text>
          <View style={[aStyles.inputRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <TextInput
              style={[aStyles.input, { color: colors.text }]}
              value={date}
              onChangeText={setDate}
              placeholder="DD MMM YYYY"
              placeholderTextColor={colors.mutedForeground}
            />
            <Feather name="calendar" size={16} color={colors.mutedForeground} />
          </View>
        </View>

        {/* Location */}
        <View style={aStyles.fieldWrap}>
          <Text style={[aStyles.label, { color: colors.mutedForeground }]}>Location</Text>
          <View style={[aStyles.inputRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <TextInput
              style={[aStyles.input, { color: colors.text }]}
              value={location}
              onChangeText={setLocation}
              placeholder="Location name"
              placeholderTextColor={colors.mutedForeground}
            />
            <Feather name="map-pin" size={16} color={colors.mutedForeground} />
          </View>
        </View>

        {/* Coordinates */}
        <View style={aStyles.row}>
          <View style={[aStyles.fieldWrap, { flex: 1 }]}>
            <Text style={[aStyles.label, { color: colors.mutedForeground }]}>Latitude</Text>
            <View style={[aStyles.inputRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <TextInput style={[aStyles.input, { color: colors.text }]} value={lat} onChangeText={setLat} keyboardType="decimal-pad" placeholderTextColor={colors.mutedForeground} />
            </View>
          </View>
          <View style={[aStyles.fieldWrap, { flex: 1 }]}>
            <Text style={[aStyles.label, { color: colors.mutedForeground }]}>Longitude</Text>
            <View style={[aStyles.inputRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <TextInput style={[aStyles.input, { color: colors.text }]} value={lng} onChangeText={setLng} keyboardType="decimal-pad" placeholderTextColor={colors.mutedForeground} />
            </View>
          </View>
        </View>

        {/* Equipment Used */}
        <View style={aStyles.fieldWrap}>
          <Text style={[aStyles.label, { color: colors.mutedForeground }]}>Equipment Used</Text>
          <TouchableOpacity
            style={[aStyles.selectBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => setShowEquipment(!showEquipment)}
            activeOpacity={0.7}
          >
            <Text style={[aStyles.selectText, { color: equipment.length ? colors.text : colors.mutedForeground }]}>
              {equipment.length ? `${equipment.length} selected` : "Select Equipment"}
            </Text>
            <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
          {equipment.length > 0 && (
            <View style={aStyles.tagsRow}>
              {equipment.map((eq) => (
                <View key={eq} style={[aStyles.tag, { backgroundColor: colors.secondary }]}>
                  <Text style={[aStyles.tagText, { color: colors.primary }]}>{eq}</Text>
                  <TouchableOpacity onPress={() => toggleEquipment(eq)}>
                    <Feather name="x" size={12} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          {showEquipment && (
            <View style={[aStyles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {EQUIPMENT_LIST.map((eq) => (
                <TouchableOpacity
                  key={eq}
                  style={[aStyles.dropItem, { borderBottomColor: colors.border }]}
                  onPress={() => toggleEquipment(eq)}
                >
                  <Feather
                    name={equipment.includes(eq) ? "check-square" : "square"}
                    size={16}
                    color={equipment.includes(eq) ? colors.primary : colors.mutedForeground}
                  />
                  <Text style={[aStyles.dropText, { color: colors.text }]}>{eq}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Area Covered */}
        <View style={aStyles.fieldWrap}>
          <Text style={[aStyles.label, { color: colors.mutedForeground }]}>Area Covered (sqkm)</Text>
          <View style={[aStyles.inputRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <TextInput
              style={[aStyles.input, { color: colors.text }]}
              value={area}
              onChangeText={setArea}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
        </View>

        {/* Progress */}
        <View style={aStyles.fieldWrap}>
          <View style={aStyles.progressHeader}>
            <Text style={[aStyles.label, { color: colors.mutedForeground }]}>Progress (%)</Text>
            <Text style={[aStyles.progressVal, { color: colors.primary }]}>{progress}%</Text>
          </View>
          <View style={[aStyles.sliderTrack, { backgroundColor: colors.border }]}>
            <View style={[aStyles.sliderFill, { width: `${progress}%` as any, backgroundColor: colors.primary }]} />
          </View>
          <View style={aStyles.sliderBtns}>
            {[0, 25, 50, 75, 100].map((v) => (
              <TouchableOpacity key={v} onPress={() => setProgress(v)} style={[aStyles.sliderTick, { backgroundColor: progress === v ? colors.primary : colors.border }]}>
                <Text style={{ color: progress === v ? "#fff" : colors.mutedForeground, fontSize: 10, fontFamily: "Inter_600SemiBold" }}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Issues/Remarks */}
        <View style={aStyles.fieldWrap}>
          <Text style={[aStyles.label, { color: colors.mutedForeground }]}>Issues / Remarks</Text>
          <TextInput
            style={[aStyles.textArea, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]}
            value={remarks}
            onChangeText={setRemarks}
            placeholder="Enter any issues or remarks..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Photos Upload (UI only) */}
        <View style={aStyles.fieldWrap}>
          <Text style={[aStyles.label, { color: colors.mutedForeground }]}>Upload Photos</Text>
          <View style={aStyles.photosRow}>
            {[1, 2].map((i) => (
              <View key={i} style={[aStyles.photoThumb, { backgroundColor: colors.secondary }]}>
                <Feather name="image" size={20} color={colors.primary} />
              </View>
            ))}
            <TouchableOpacity style={[aStyles.photoAdd, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Feather name="camera" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[aStyles.submitBtn, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Text style={aStyles.submitText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const aStyles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  container: { paddingHorizontal: 16, paddingTop: 16, gap: 14 },
  fieldWrap: { gap: 6 },
  row: { flexDirection: "row", gap: 10 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  input: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  selectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  dropdown: { borderWidth: 1, borderRadius: 10, overflow: "hidden", marginTop: -6 },
  dropItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  dropText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  tagText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  progressHeader: { flexDirection: "row", justifyContent: "space-between" },
  progressVal: { fontSize: 14, fontFamily: "Inter_700Bold" },
  sliderTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  sliderFill: { height: 8, borderRadius: 4 },
  sliderBtns: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  sliderTick: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 80,
    textAlignVertical: "top",
  },
  photosRow: { flexDirection: "row", gap: 10 },
  photoThumb: { width: 72, height: 72, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  photoAdd: { width: 72, height: 72, borderRadius: 10, borderWidth: 1, borderStyle: "dashed", alignItems: "center", justifyContent: "center" },
  submitBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  submitText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
