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

const EXPENSE_TYPES = ["Fuel", "Accommodation", "Vehicle", "Food", "Equipment Hire", "Miscellaneous"];
const PAID_BY_LIST = ["Amit Kumar", "Ramesh", "Sunil", "Mahesh", "Prakash", "Vijay"];

export default function AddExpenseScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { projects, addExpense } = useApp();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const [projectId, setProjectId] = useState("");
  const [expenseType, setExpenseType] = useState("");
  const [date, setDate] = useState("16 May 2024");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [location, setLocation] = useState("16.7563, 80.4356");
  const [remarks, setRemarks] = useState("");

  const [showProjects, setShowProjects] = useState(false);
  const [showTypes, setShowTypes] = useState(false);
  const [showPaidBy, setShowPaidBy] = useState(false);

  const selectedProject = projects.find((p) => p.id === projectId);

  const handleSave = async () => {
    if (!projectId || !expenseType || !amount) {
      Alert.alert("Required", "Please fill in all required fields");
      return;
    }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addExpense({
      id: Date.now().toString(),
      projectId,
      expenseType,
      date,
      amount: parseFloat(amount),
      paidBy,
      location,
      remarks,
    });
    router.back();
  };

  const SelectField = ({ label, value, placeholder, onPress }: any) => (
    <View style={eStyles.fieldWrap}>
      <Text style={[eStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <TouchableOpacity
        style={[eStyles.selectBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={[eStyles.selectText, { color: value ? colors.text : colors.mutedForeground }]}>
          {value || placeholder}
        </Text>
        <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[eStyles.root, { backgroundColor: colors.background }]}>
      <View style={[eStyles.header, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[eStyles.backBtn, { borderColor: colors.border }]}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[eStyles.title, { color: colors.text }]}>Add Expense</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[eStyles.container, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SelectField label="Project" value={selectedProject?.name} placeholder="Select Project" onPress={() => setShowProjects(!showProjects)} />
        {showProjects && (
          <View style={[eStyles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {projects.map((p) => (
              <TouchableOpacity key={p.id} style={[eStyles.dropItem, { borderBottomColor: colors.border }]} onPress={() => { setProjectId(p.id); setShowProjects(false); }}>
                <Text style={[eStyles.dropText, { color: colors.text }]}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <SelectField label="Expense Type" value={expenseType} placeholder="Select Expense Type" onPress={() => setShowTypes(!showTypes)} />
        {showTypes && (
          <View style={[eStyles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {EXPENSE_TYPES.map((t) => (
              <TouchableOpacity key={t} style={[eStyles.dropItem, { borderBottomColor: colors.border }]} onPress={() => { setExpenseType(t); setShowTypes(false); }}>
                <Text style={[eStyles.dropText, { color: colors.text }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Date */}
        <View style={eStyles.fieldWrap}>
          <Text style={[eStyles.label, { color: colors.mutedForeground }]}>Date</Text>
          <View style={[eStyles.inputRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <TextInput style={[eStyles.input, { color: colors.text }]} value={date} onChangeText={setDate} placeholder="DD MMM YYYY" placeholderTextColor={colors.mutedForeground} />
            <Feather name="calendar" size={16} color={colors.mutedForeground} />
          </View>
        </View>

        {/* Amount */}
        <View style={eStyles.fieldWrap}>
          <Text style={[eStyles.label, { color: colors.mutedForeground }]}>Amount (₹)</Text>
          <View style={[eStyles.inputRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={{ fontSize: 16, color: colors.mutedForeground, fontFamily: "Inter_500Medium" }}>₹</Text>
            <TextInput style={[eStyles.input, { color: colors.text }]} value={amount} onChangeText={setAmount} placeholder="0" keyboardType="numeric" placeholderTextColor={colors.mutedForeground} />
          </View>
        </View>

        <SelectField label="Paid By" value={paidBy} placeholder="Select Person" onPress={() => setShowPaidBy(!showPaidBy)} />
        {showPaidBy && (
          <View style={[eStyles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {PAID_BY_LIST.map((p) => (
              <TouchableOpacity key={p} style={[eStyles.dropItem, { borderBottomColor: colors.border }]} onPress={() => { setPaidBy(p); setShowPaidBy(false); }}>
                <Text style={[eStyles.dropText, { color: colors.text }]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Upload Bill Photo */}
        <View style={eStyles.fieldWrap}>
          <Text style={[eStyles.label, { color: colors.mutedForeground }]}>Upload Bill Photo</Text>
          <TouchableOpacity style={[eStyles.uploadBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <View style={[eStyles.uploadPreview, { backgroundColor: colors.secondary }]}>
              <Feather name="file-text" size={24} color={colors.primary} />
            </View>
            <TouchableOpacity style={[eStyles.cameraBtn, { backgroundColor: colors.primary }]}>
              <Feather name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Location */}
        <View style={eStyles.fieldWrap}>
          <Text style={[eStyles.label, { color: colors.mutedForeground }]}>Location</Text>
          <View style={[eStyles.inputRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <TextInput style={[eStyles.input, { color: colors.text }]} value={location} onChangeText={setLocation} placeholder="Lat, Lng" placeholderTextColor={colors.mutedForeground} />
            <Feather name="map-pin" size={16} color={colors.mutedForeground} />
          </View>
        </View>

        {/* Remarks */}
        <View style={eStyles.fieldWrap}>
          <Text style={[eStyles.label, { color: colors.mutedForeground }]}>Remarks</Text>
          <TextInput
            style={[eStyles.textArea, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]}
            value={remarks}
            onChangeText={setRemarks}
            placeholder="Add remarks..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity style={[eStyles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave} activeOpacity={0.85}>
          <Text style={eStyles.saveText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const eStyles = StyleSheet.create({
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
  dropItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  dropText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  uploadBox: {
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
    position: "relative",
  },
  uploadPreview: {
    width: 56,
    height: 56,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 80,
    textAlignVertical: "top",
  },
  saveBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  saveText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
