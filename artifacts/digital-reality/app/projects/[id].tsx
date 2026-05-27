import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp, type ProcessingStageName, type FieldWorkStageName, type ModellingDailyEntry } from "@/context/AppContext";
import { StatusBadge } from "@/components/StatusBadge";
import { ProgressBar } from "@/components/ProgressBar";
import { DocumentsTab } from "@/components/DocumentsTab";

const TABS = ["Field Work", "Processing", "Modelling", "Billing", "Documents"];

const FW_STAGES: { key: FieldWorkStageName; label: string; icon: string }[] = [
  { key: "recce", label: "Recce", icon: "search" },
  { key: "dgps", label: "DGPS", icon: "radio" },
  { key: "totalStation", label: "Total Station", icon: "target" },
  { key: "scanning", label: "Scanning", icon: "aperture" },
  { key: "instrumentation", label: "Instrumentation", icon: "bar-chart" },
  { key: "uav", label: "UAV", icon: "send" },
  { key: "gpr", label: "GPR", icon: "activity" },
];

const PROC_STAGES: { key: ProcessingStageName; label: string }[] = [
  { key: "production", label: "Production" },
  { key: "qc", label: "QC" },
  { key: "qa", label: "QA" },
  { key: "delivery", label: "Delivery" },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmtDate(d: string) {
  if (!d) return "";
  const parts = d.split(" ");
  if (parts.length === 3) return d;
  const p = d.split("-");
  if (p.length === 3) return `${parseInt(p[2])} ${MONTHS[parseInt(p[1])-1]} ${p[0]}`;
  return d;
}

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { projects, activities, invoices, expenses, advances, user, pipelines, modellingDailyEntries,
    addInvoice, addAdvance, updateAdvance, deleteAdvance, addExpense, updateProject,
    togglePipelineStage, setPipelineStageDetails,
    toggleFieldWorkStage, setFieldWorkStageDetails,
    addModellingDailyEntry, updateModellingDailyEntry, deleteModellingDailyEntry } = useApp();
  const [activeTab, setActiveTab] = useState("Field Work");
  const [editModal, setEditModal] = useState(false);
  const [advModal, setAdvModal] = useState(false);
  const [invModal, setInvModal] = useState(false);
  const [expModal, setExpModal] = useState(false);
  const [billingSubTab, setBillingSubTab] = useState("Advances");

  // Daily tracking state
  const [dailyModal, setDailyModal] = useState(false);
  const [editingDailyId, setEditingDailyId] = useState<string | null>(null);
  const [dailyPerson, setDailyPerson] = useState("");
  const [dailySDate, setDailySDate] = useState("");
  const [dailyEDate, setDailyEDate] = useState("");
  const [dailySTime, setDailySTime] = useState("");
  const [dailyETime, setDailyETime] = useState("");
  const [dailyProcess, setDailyProcess] = useState<ProcessingStageName>("production");
  const [dailyStatus, setDailyStatus] = useState("In Progress");
  const projectModellingDaily = modellingDailyEntries[id ?? ""] ?? [];

  const calcHours = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return Math.round(((eh * 60 + em) - (sh * 60 + sm)) / 60 * 10) / 10;
  };

  const resetDailyForm = () => {
    setDailyPerson(""); setDailySDate(""); setDailyEDate("");
    setDailySTime(""); setDailyETime(""); setDailyProcess("production");
    setDailyStatus("In Progress");
  };

  const handleSaveDaily = () => {
    if (!dailyPerson || !dailySDate || !dailyEDate || !dailySTime || !dailyETime) {
      Alert.alert("Required", "Fill all fields");
      return;
    }
    const totalHours = calcHours(dailySTime, dailyETime);
    if (editingDailyId) {
      updateModellingDailyEntry(editingDailyId, { personName: dailyPerson, startDate: dailySDate, endDate: dailyEDate, startTime: dailySTime, endTime: dailyETime, totalHours, process: dailyProcess, status: dailyStatus });
    } else {
      addModellingDailyEntry({ id: `md${Date.now()}`, projectId: project.id, personName: dailyPerson, startDate: dailySDate, endDate: dailyEDate, startTime: dailySTime, endTime: dailyETime, totalHours, process: dailyProcess, status: dailyStatus });
    }
    resetDailyForm();
    setEditingDailyId(null);
    setDailyModal(false);
  };

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const project = projects.find((p) => p.id === id);
  if (!project) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground }}>Project not found</Text>
      </View>
    );
  }

  const pipeline = pipelines[project.id];
  const projectInvoices = invoices.filter((i) => i.projectId === id);
  const projectExpenses = expenses.filter((e) => e.projectId === id);
  const projectAdvances = advances.filter((a) => a.projectId === id);
  const projectActivities = activities.filter((a) => a.projectId === id);

  const totalAdvances = projectAdvances.reduce((s, a) => s + a.amount, 0);
  const totalExpensesAmt = projectExpenses.reduce((s, e) => s + e.amount, 0);
  const balance = totalAdvances - totalExpensesAmt;

  // Edit project state
  const [editName, setEditName] = useState(project.name);
  const [editLoc, setEditLoc] = useState(project.location);
  const [editState, setEditState] = useState(project.state);
  const [editClient, setEditClient] = useState(project.client);
  const [editPm, setEditPm] = useState(project.projectManager);
  const [editPo, setEditPo] = useState(String(project.poValue));
  const [editProgress, setEditProgress] = useState(String(project.progress));

  // Advance form
  const [advPerson, setAdvPerson] = useState("");
  const [advAmount, setAdvAmount] = useState("");
  const [advPurpose, setAdvPurpose] = useState("");

  // Invoice form
  const [invNumber, setInvNumber] = useState("");
  const [invDesc, setInvDesc] = useState("");
  const [invAmount, setInvAmount] = useState("");

  // Expense form
  const [expType, setExpType] = useState("Fuel");
  const [expAmount, setExpAmount] = useState("");
  const [expPaidBy, setExpPaidBy] = useState("");

  const handleSaveEdit = () => {
    updateProject(project.id, {
      name: editName,
      location: editLoc,
      state: editState,
      client: editClient,
      projectManager: editPm,
      poValue: parseFloat(editPo) || 0,
      progress: Math.min(100, Math.max(0, parseInt(editProgress) || 0)),
    });
    setEditModal(false);
  };

  const handleAddAdvance = () => {
    if (!advPerson || !advAmount) { Alert.alert("Required", "Fill person and amount"); return; }
    addAdvance({
      id: `adv${Date.now()}`,
      projectId: project.id,
      personName: advPerson,
      amount: parseFloat(advAmount),
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      purpose: advPurpose,
      settled: false,
      remarks: "",
    });
    setAdvPerson(""); setAdvAmount(""); setAdvPurpose("");
    setAdvModal(false);
  };

  const handleAddInvoice = () => {
    if (!invNumber || !invAmount) { Alert.alert("Required", "Fill number and amount"); return; }
    addInvoice({
      id: `inv${Date.now()}`,
      projectId: project.id,
      number: invNumber,
      description: invDesc,
      amount: parseFloat(invAmount),
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      status: "Pending",
    });
    setInvNumber(""); setInvDesc(""); setInvAmount("");
    setInvModal(false);
  };

  const handleAddExpense = () => {
    if (!expAmount || !expPaidBy) { Alert.alert("Required", "Fill amount and paid by"); return; }
    addExpense({
      id: `exp${Date.now()}`,
      projectId: project.id,
      expenseType: expType,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      amount: parseFloat(expAmount),
      paidBy: expPaidBy,
      location: "",
      remarks: "",
    });
    setExpAmount(""); setExpPaidBy("");
    setExpModal(false);
  };

  const renderFieldWork = () => (
    <View style={{ gap: 10 }}>
      {pipeline ? FW_STAGES.map((st, idx) => {
        const stage = pipeline.fieldWork[st.key];
        const prevDone = idx === 0 || pipeline.fieldWork[FW_STAGES[idx-1].key]?.completed;
        const locked = !prevDone && !stage?.completed;
        return (
          <View key={st.key} style={[styles.stageCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: locked ? 0.5 : 1 }]}>
            <View style={styles.stageHeader}>
              <TouchableOpacity
                disabled={locked}
                onPress={() => toggleFieldWorkStage(project.id, st.key, !stage?.completed)}
                style={[styles.checkbox, stage?.completed ? { backgroundColor: colors.success } : { borderColor: colors.border }]}
              >
                {stage?.completed ? <Feather name="check" size={14} color="#fff" /> : locked ? <Feather name="lock" size={14} color={colors.mutedForeground} /> : null}
              </TouchableOpacity>
              <Feather name={st.icon as any} size={16} color={colors.primary} />
              <Text style={[styles.stageLabel, { color: colors.text }]}>{st.label}</Text>
              {locked && <Text style={[styles.lockedBadge, { color: colors.mutedForeground }]}>Locked</Text>}
            </View>
            {stage?.completed && stage?.date && (
              <View style={styles.stageMeta}>
                <Text style={[styles.stageMetaText, { color: colors.mutedForeground }]}>
                  {stage.date}{stage.time ? ` ${stage.time}` : ""}{stage.location ? ` · ${stage.location}` : ""}
                  {stage.areaSqKm ? ` · ${stage.areaSqKm} km²` : ""}
                  {stage.linearKm ? ` · ${stage.linearKm} km` : ""}
                </Text>
              </View>
            )}
          </View>
        );
      }) : (
        <View style={styles.empty}><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No field work pipeline</Text></View>
      )}
    </View>
  );

  const renderPipeline = (type: "processing" | "modelling") => (
    <View style={{ gap: 10 }}>
      {type === "processing" && pipeline ? PROC_STAGES.map((st, idx) => {
        const stage = pipeline[type][st.key];
        const prevDone = idx === 0 || pipeline[type][PROC_STAGES[idx-1].key]?.completed;
        const locked = !prevDone && !stage?.completed;
        return (
          <View key={st.key} style={[styles.stageCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: locked ? 0.5 : 1 }]}>
            <View style={styles.stageHeader}>
              <TouchableOpacity
                disabled={locked}
                onPress={() => togglePipelineStage(project.id, type, st.key, !stage?.completed)}
                style={[styles.checkbox, stage?.completed ? { backgroundColor: colors.success } : { borderColor: colors.border }]}
              >
                {stage?.completed ? <Feather name="check" size={14} color="#fff" /> : locked ? <Feather name="lock" size={14} color={colors.mutedForeground} /> : null}
              </TouchableOpacity>
              <Text style={[styles.stageLabel, { color: colors.text }]}>{st.label}</Text>
              {locked && <Text style={[styles.lockedBadge, { color: colors.mutedForeground }]}>Locked</Text>}
            </View>
            {stage?.completed && stage?.date && (
              <View style={styles.stageMeta}>
                <Text style={[styles.stageMetaText, { color: colors.mutedForeground }]}>
                  {stage.date}{stage.time ? ` ${stage.time}` : ""}{stage.location ? ` · ${stage.location}` : ""}
                  {stage.areaSqKm ? ` · ${stage.areaSqKm} km²` : ""}
                </Text>
              </View>
            )}
          </View>
        );
      }) : type === "processing" && (
        <View style={styles.empty}><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No pipeline data</Text></View>
      )}

      {type === "modelling" && (
        <>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Tracking</Text>
            <TouchableOpacity
              onPress={() => { resetDailyForm(); setEditingDailyId(null); setDailyModal(true); }}
              style={[styles.addBtnSm, { borderColor: colors.primary }]}
            >
              <Feather name="plus" size={14} color={colors.primary} />
              <Text style={[styles.addBtnSmText, { color: colors.primary }]}>Add</Text>
            </TouchableOpacity>
          </View>

          {projectModellingDaily.length === 0 ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No daily entries</Text>
            </View>
          ) : (
            <>
              {/* ── SUMMARY REPORT ── */}
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border, flex: 1 }]}>
                  <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>By Person</Text>
                  {Object.entries(
                    projectModellingDaily.reduce<Record<string, number>>((acc, e) => {
                      acc[e.personName] = (acc[e.personName] ?? 0) + e.totalHours;
                      return acc;
                    }, {})
                  ).map(([name, hrs]) => (
                    <View key={name} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 }}>
                      <Text style={{ fontSize: 11, color: colors.text }}>{name}</Text>
                      <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.text }}>{hrs}h</Text>
                    </View>
                  ))}
                </View>
                <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border, flex: 1 }]}>
                  <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>By Process</Text>
                  {(["production", "qc", "qa", "delivery"] as const).map((proc) => {
                    const hrs = projectModellingDaily.filter((e) => e.process === proc).reduce((s, e) => s + e.totalHours, 0);
                    return (
                      <View key={proc} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 }}>
                        <Text style={{ fontSize: 11, color: hrs === 0 ? colors.mutedForeground : colors.text }}>{proc.charAt(0).toUpperCase() + proc.slice(1)}</Text>
                        <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: hrs === 0 ? colors.mutedForeground : colors.text }}>{hrs}h</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: colors.primary + "15", borderColor: colors.primary }]}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View>
                    <Text style={[styles.summaryLabel, { color: colors.primary }]}>Grand Total</Text>
                    <Text style={{ fontSize: 10, color: colors.primary + "aa" }}>{projectModellingDaily.length} entries</Text>
                  </View>
                  <Text style={[styles.summaryValue, { color: colors.primary }]}>{projectModellingDaily.reduce((s, e) => s + e.totalHours, 0)}h</Text>
                </View>
              </View>

              {projectModellingDaily.map((entry) => (
              <View key={entry.id} style={[styles.advCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={[styles.advPerson, { color: colors.text }]}>{entry.personName}</Text>
                    <View style={[styles.processBadge, { backgroundColor: colors.secondary }]}>
                      <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_500Medium" }}>
                        {entry.process === "production" ? "Production" : entry.process === "qc" ? "QC" : entry.process === "qa" ? "QA" : "Delivery"}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
                    <View>
                      <Text style={[styles.advDetail, { color: colors.mutedForeground }]}>Start</Text>
                      <Text style={[styles.advDetail, { color: colors.text }]}>{entry.startDate} {entry.startTime}</Text>
                    </View>
                    <View>
                      <Text style={[styles.advDetail, { color: colors.mutedForeground }]}>End</Text>
                      <Text style={[styles.advDetail, { color: colors.text }]}>{entry.endDate} {entry.endTime}</Text>
                    </View>
                    <View>
                      <Text style={[styles.advDetail, { color: colors.mutedForeground }]}>Hours</Text>
                      <Text style={[styles.advDetail, { color: colors.text, fontFamily: "Inter_700Bold" }]}>{entry.totalHours}h</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                    <View style={[styles.processBadge, { backgroundColor: entry.status === "Completed" ? "#16a34a20" : entry.status === "In Progress" ? "#2563eb20" : "#d9770620" }]}>
                      <Text style={{ fontSize: 10, fontFamily: "Inter_500Medium", color: entry.status === "Completed" ? "#16a34a" : entry.status === "In Progress" ? "#2563eb" : "#d97706" }}>{entry.status}</Text>
                    </View>
                    <View style={[styles.processBadge, { backgroundColor: colors.secondary }]}>
                    </View>
                  </View>
                </View>
                <View style={{ flexDirection: "row", gap: 4 }}>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingDailyId(entry.id);
                      setDailyPerson(entry.personName);
                      setDailySDate(entry.startDate);
                      setDailyEDate(entry.endDate);
                      setDailySTime(entry.startTime);
                      setDailyETime(entry.endTime);
                      setDailyProcess(entry.process);
                      setDailyStatus(entry.status);
                      setDailyModal(true);
                    }}
                    style={[styles.iconBtn, { borderColor: colors.border }]}
                  >
                    <Feather name="edit-2" size={14} color={colors.mutedForeground} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteModellingDailyEntry(project.id, entry.id)}
                    style={[styles.iconBtn, { borderColor: colors.border }]}
                  >
                    <Feather name="trash-2" size={14} color={colors.destructive} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
            </>
          )}
        </>
      )}
    </View>
  );

  const renderBilling = () => (
    <View style={{ gap: 12 }}>
      <View style={styles.billingTabs}>
        {["Advances", "Invoices", "Expenses"].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setBillingSubTab(t)}
            style={[styles.billingTab, billingSubTab === t ? { backgroundColor: colors.primary } : { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.billingTabText, { color: billingSubTab === t ? "#fff" : colors.mutedForeground }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {billingSubTab === "Advances" && (
        <View style={{ gap: 10 }}>
          {projectAdvances.length > 0 && (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Total Advances</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>₹{totalAdvances.toLocaleString("en-IN")}</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Balance</Text>
                <Text style={[styles.summaryValue, { color: balance >= 0 ? colors.success : colors.destructive }]}>₹{balance.toLocaleString("en-IN")}</Text>
              </View>
            </View>
          )}
          {projectAdvances.map((adv) => (
            <View key={adv.id} style={[styles.advCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.advPerson, { color: colors.text }]}>{adv.personName}</Text>
                <Text style={[styles.advDetail, { color: colors.mutedForeground }]}>{adv.purpose} · {adv.date}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                <Text style={[styles.advAmt, { color: colors.text }]}>₹{adv.amount.toLocaleString("en-IN")}</Text>
                {adv.settled ? (
                  <StatusBadge status="Paid" small />
                ) : (
                  <TouchableOpacity
                    onPress={() => updateAdvance(adv.id, { settled: true, settledDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) })}
                    style={[styles.settleBtn, { backgroundColor: colors.success }]}
                  >
                    <Text style={{ color: "#fff", fontSize: 11, fontFamily: "Inter_500Medium" }}>Settle</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          <TouchableOpacity
            onPress={() => setAdvModal(true)}
            style={[styles.addBtn, { borderColor: colors.primary }]}
          >
            <Feather name="plus" size={16} color={colors.primary} />
            <Text style={[styles.addBtnText, { color: colors.primary }]}>New Advance</Text>
          </TouchableOpacity>
        </View>
      )}

      {billingSubTab === "Invoices" && (
        <View style={{ gap: 10 }}>
          {projectInvoices.map((inv) => (
            <View key={inv.id} style={[styles.advCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.advPerson, { color: colors.text }]}>{inv.number} — {inv.description}</Text>
                <Text style={[styles.advDetail, { color: colors.mutedForeground }]}>{inv.date}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <Text style={[styles.advAmt, { color: colors.text }]}>₹{(inv.amount / 100000).toFixed(2)}L</Text>
                <StatusBadge status={inv.status} small />
              </View>
            </View>
          ))}
          <TouchableOpacity
            onPress={() => setInvModal(true)}
            style={[styles.addBtn, { borderColor: colors.primary }]}
          >
            <Feather name="plus" size={16} color={colors.primary} />
            <Text style={[styles.addBtnText, { color: colors.primary }]}>New Invoice</Text>
          </TouchableOpacity>
        </View>
      )}

      {billingSubTab === "Expenses" && (
        <View style={{ gap: 10 }}>
          {projectExpenses.length > 0 && (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Total Expenses</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>₹{totalExpensesAmt.toLocaleString("en-IN")}</Text>
              </View>
            </View>
          )}
          {projectExpenses.map((exp) => (
            <View key={exp.id} style={[styles.advCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.advPerson, { color: colors.text }]}>{exp.expenseType} — {exp.paidBy}</Text>
                <Text style={[styles.advDetail, { color: colors.mutedForeground }]}>{exp.date}{exp.location ? ` · ${exp.location}` : ""}{exp.remarks ? ` · ${exp.remarks}` : ""}</Text>
              </View>
              <Text style={[styles.advAmt, { color: colors.text }]}>₹{exp.amount.toLocaleString("en-IN")}</Text>
            </View>
          ))}
          <TouchableOpacity
            onPress={() => setExpModal(true)}
            style={[styles.addBtn, { borderColor: colors.primary }]}
          >
            <Feather name="plus" size={16} color={colors.primary} />
            <Text style={[styles.addBtnText, { color: colors.primary }]}>New Expense</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Field Work": return renderFieldWork();
      case "Processing": return renderPipeline("processing");
      case "Modelling": return renderPipeline("modelling");
      case "Billing": return renderBilling();
      case "Documents": return <DocumentsTab projectId={id!} userName={user?.name || "User"} />;
      default: return (
        <View style={styles.empty}>
          <Feather name="folder" size={32} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No data for {activeTab}</Text>
        </View>
      );
    }
  };

  const fm = (n: number) => n >= 10000000 ? `₹${(n/10000000).toFixed(2)}Cr` : n >= 100000 ? `₹${(n/100000).toFixed(2)}L` : `₹${n.toLocaleString("en-IN")}`;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { borderColor: colors.border }]}>
          <Feather name="chevron-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.text }]}>Project Detail</Text>
        <TouchableOpacity onPress={() => setEditModal(true)} style={[styles.backBtn, { borderColor: colors.border }]}>
          <Feather name="edit-2" size={16} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 30 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroImg, { backgroundColor: colors.secondary }]}>
          <Feather name="map" size={48} color={colors.primary} />
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.infoHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.projName, { color: colors.text }]}>{project.name}</Text>
              <View style={styles.locRow}>
                <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                <Text style={[styles.locText, { color: colors.mutedForeground }]}>{project.location}, {project.state}</Text>
              </View>
            </View>
            <StatusBadge status={project.status} />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Project ID</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>{project.projectId}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Client</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>{project.client}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>PO Value</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>{fm(project.poValue)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Manager</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>{project.projectManager}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Start</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>{project.startDate || "TBD"}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>End</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>{project.endDate || "TBD"}</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.overallLabel, { color: colors.mutedForeground }]}>Progress</Text>
          <ProgressBar progress={project.progress} showLabel height={10} />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
            <View style={styles.quickTabs}>
              {[
                { icon: "activity", label: "Field Work" },
                { icon: "cpu", label: "Processing" },
                { icon: "package", label: "Modelling" },
                { icon: "credit-card", label: "Billing" },
                { icon: "file", label: "Documents" },
              ].map((t) => (
                <TouchableOpacity
                  key={t.label}
                  style={[styles.quickTab, { backgroundColor: activeTab === t.label ? colors.secondary : colors.muted }]}
                  onPress={() => setActiveTab(t.label)}
                >
                  <Feather name={t.icon as any} size={16} color={activeTab === t.label ? colors.primary : colors.mutedForeground} />
                  <Text style={[styles.quickTabLabel, { color: activeTab === t.label ? colors.primary : colors.mutedForeground }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.tabContent}>
          <Text style={[styles.contentTitle, { color: colors.text }]}>{activeTab}</Text>
          {renderTabContent()}
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Project</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}><Feather name="x" size={20} color={colors.text} /></TouchableOpacity>
            </View>
            <ScrollView style={{ gap: 12 }}>
              {[
                { label: "Name", val: editName, set: setEditName },
                { label: "Location", val: editLoc, set: setEditLoc },
                { label: "State", val: editState, set: setEditState },
                { label: "Client", val: editClient, set: setEditClient },
                { label: "Project Manager", val: editPm, set: setEditPm },
                { label: "PO Value", val: editPo, set: setEditPo, num: true },
                { label: "Progress %", val: editProgress, set: setEditProgress, num: true },
              ].map((f) => (
                <View key={f.label} style={{ gap: 4 }}>
                  <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
                  <TextInput
                    style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
                    value={f.val}
                    onChangeText={f.set}
                    keyboardType={f.num ? "numeric" : "default"}
                  />
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={handleSaveEdit} style={[styles.modalBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.modalBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Advance Modal */}
      <Modal visible={advModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>New Advance</Text>
              <TouchableOpacity onPress={() => setAdvModal(false)}><Feather name="x" size={20} color={colors.text} /></TouchableOpacity>
            </View>
            <View style={{ gap: 10 }}>
              <View style={{ gap: 4 }}>
                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Person Name</Text>
                <TextInput style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]} value={advPerson} onChangeText={setAdvPerson} placeholder="e.g. Ramesh" />
              </View>
              <View style={{ gap: 4 }}>
                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Amount (₹)</Text>
                <TextInput style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]} value={advAmount} onChangeText={setAdvAmount} keyboardType="numeric" placeholder="10000" />
              </View>
              <View style={{ gap: 4 }}>
                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Purpose</Text>
                <TextInput style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]} value={advPurpose} onChangeText={setAdvPurpose} placeholder="Field trip" />
              </View>
            </View>
            <TouchableOpacity onPress={handleAddAdvance} style={[styles.modalBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.modalBtnText}>Add Advance</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Invoice Modal */}
      <Modal visible={invModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>New Invoice</Text>
              <TouchableOpacity onPress={() => setInvModal(false)}><Feather name="x" size={20} color={colors.text} /></TouchableOpacity>
            </View>
            <View style={{ gap: 10 }}>
              <View style={{ gap: 4 }}>
                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Invoice #</Text>
                <TextInput style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]} value={invNumber} onChangeText={setInvNumber} placeholder="INV-001" />
              </View>
              <View style={{ gap: 4 }}>
                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Description</Text>
                <TextInput style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]} value={invDesc} onChangeText={setInvDesc} placeholder="Advance payment" />
              </View>
              <View style={{ gap: 4 }}>
                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Amount (₹)</Text>
                <TextInput style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]} value={invAmount} onChangeText={setInvAmount} keyboardType="numeric" placeholder="100000" />
              </View>
            </View>
            <TouchableOpacity onPress={handleAddInvoice} style={[styles.modalBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.modalBtnText}>Add Invoice</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Expense Modal */}
      <Modal visible={expModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>New Expense</Text>
              <TouchableOpacity onPress={() => setExpModal(false)}><Feather name="x" size={20} color={colors.text} /></TouchableOpacity>
            </View>
            <View style={{ gap: 10 }}>
              <View style={{ gap: 4 }}>
                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Type</Text>
                <TextInput style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]} value={expType} onChangeText={setExpType} placeholder="Fuel" />
              </View>
              <View style={{ gap: 4 }}>
                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Amount (₹)</Text>
                <TextInput style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]} value={expAmount} onChangeText={setExpAmount} keyboardType="numeric" placeholder="2500" />
              </View>
              <View style={{ gap: 4 }}>
                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Paid By</Text>
                <TextInput style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]} value={expPaidBy} onChangeText={setExpPaidBy} placeholder="Ramesh" />
              </View>
            </View>
            <TouchableOpacity onPress={handleAddExpense} style={[styles.modalBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.modalBtnText}>Add Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Daily Tracking Modal */}
      <Modal visible={dailyModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{editingDailyId ? "Edit" : "Add"} Daily Entry</Text>
              <TouchableOpacity onPress={() => { setDailyModal(false); resetDailyForm(); setEditingDailyId(null); }}><Feather name="x" size={20} color={colors.text} /></TouchableOpacity>
            </View>
            <ScrollView style={{ gap: 10 }}>
              <View style={{ gap: 4 }}>
                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Person Name</Text>
                <TextInput style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]} value={dailyPerson} onChangeText={setDailyPerson} placeholder="e.g. Rahul Sharma" />
              </View>
              <View style={{ gap: 4 }}>
                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Process Stage</Text>
                <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
                  {PROC_STAGES.map((s) => (
                    <TouchableOpacity
                      key={s.key}
                      onPress={() => setDailyProcess(s.key)}
                      style={[styles.billingTab, { backgroundColor: dailyProcess === s.key ? colors.primary : colors.card, borderColor: dailyProcess === s.key ? colors.primary : colors.border }]}
                    >
                      <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: dailyProcess === s.key ? "#fff" : colors.mutedForeground }}>{s.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={{ gap: 4 }}>
                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Start Date</Text>
                <TextInput style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]} value={dailySDate} onChangeText={setDailySDate} placeholder="e.g. 19 May 2024" />
              </View>
              <View style={{ gap: 4 }}>
                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>End Date</Text>
                <TextInput style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]} value={dailyEDate} onChangeText={setDailyEDate} placeholder="e.g. 19 May 2024" />
              </View>
              <View style={{ gap: 4 }}>
                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Start Time</Text>
                <TextInput style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]} value={dailySTime} onChangeText={setDailySTime} placeholder="e.g. 09:00" />
              </View>
              <View style={{ gap: 4 }}>
                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>End Time</Text>
                <TextInput style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]} value={dailyETime} onChangeText={setDailyETime} placeholder="e.g. 18:00" />
              </View>
              <View style={{ gap: 4 }}>
                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Status</Text>
                <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
                  {["In Progress", "Completed", "Pending", "On Hold"].map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setDailyStatus(s)}
                      style={[styles.billingTab, { backgroundColor: dailyStatus === s ? colors.primary : colors.card, borderColor: dailyStatus === s ? colors.primary : colors.border }]}
                    >
                      <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: dailyStatus === s ? "#fff" : colors.mutedForeground }}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {dailySTime && dailyETime && (
                <Text style={[styles.advDetail, { color: colors.mutedForeground, textAlign: "center" }]}>
                  Total Hours: <Text style={{ fontFamily: "Inter_700Bold", color: colors.text }}>{calcHours(dailySTime, dailyETime)}h</Text>
                </Text>
              )}
            </ScrollView>
            <TouchableOpacity onPress={handleSaveDaily} style={[styles.modalBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.modalBtnText}>{editingDailyId ? "Update" : "Add Entry"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  topTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  container: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  heroImg: { height: 140, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  infoCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 12 },
  infoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  projName: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 4 },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  divider: { height: 1, marginVertical: 2 },
  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  metaItem: { minWidth: "44%", gap: 2 },
  metaLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  metaValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  overallLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 8 },
  quickTabs: { flexDirection: "row", gap: 8 },
  quickTab: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, gap: 6 },
  quickTabLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  tabContent: { gap: 10, paddingBottom: 8 },
  contentTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  empty: { alignItems: "center", paddingVertical: 32, gap: 10 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  stageCard: { borderRadius: 12, padding: 14, borderWidth: 1, gap: 6 },
  stageHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  stageLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  lockedBadge: { fontSize: 11, fontFamily: "Inter_500Medium" },
  stageMeta: { paddingLeft: 34 },
  stageMetaText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  billingTabs: { flexDirection: "row", gap: 8 },
  billingTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  billingTabText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  summaryCard: { flex: 1, borderRadius: 12, padding: 12, borderWidth: 1, gap: 4 },
  summaryLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  summaryValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  advCard: { flexDirection: "row", borderRadius: 12, padding: 14, borderWidth: 1, gap: 8, alignItems: "center" },
  advPerson: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  advDetail: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  advAmt: { fontSize: 15, fontFamily: "Inter_700Bold" },
  settleBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderStyle: "dashed" },
  addBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  addBtnSm: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  addBtnSmText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  iconBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  processBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 16, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  modalLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  modalInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, fontFamily: "Inter_400Regular" },
  modalBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  modalBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
