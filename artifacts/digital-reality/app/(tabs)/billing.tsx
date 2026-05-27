import React, { useState } from "react";
import {
  Alert,
  FlatList,
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
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { StatusBadge } from "@/components/StatusBadge";
import type { Advance, Expense, Invoice } from "@/context/AppContext";

function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  const colors = useColors();
  return (
    <View style={[bStyles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[bStyles.statIcon, { backgroundColor: `${color}15` }]}>
        <Feather name={icon as any} size={14} color={color} />
      </View>
      <Text style={[bStyles.statValue, { color }]}>{value}</Text>
      <Text style={[bStyles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  const colors = useColors();
  return (
    <View style={[bStyles.miniStat, { backgroundColor: `${color}10`, borderColor: `${color}30` }]}>
      <Text style={[bStyles.miniLabel, { color: `${color}CC` }]}>{label}</Text>
      <Text style={[bStyles.miniValue, { color }]}>{value}</Text>
    </View>
  );
}

type BillTab = "overview" | "advance" | "invoice" | "expense";

export default function BillingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { projects, invoices, expenses, advances, user, addInvoice, addAdvance, addExpense, updateAdvance, deleteAdvance } = useApp();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const isAdmin = user?.isAdmin ?? false;

  const [tab, setTab] = useState<BillTab>("overview");
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("all");

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const isPerProject = selectedProjectId !== "all";
  const project = isPerProject ? projects.find((p) => p.id === selectedProjectId) : null;

  const filteredInvoices = isPerProject ? invoices.filter((i) => i.projectId === selectedProjectId) : invoices;
  const filteredExpenses = isPerProject ? expenses.filter((e) => e.projectId === selectedProjectId) : expenses;
  const filteredAdvances = isPerProject ? advances.filter((a) => a.projectId === selectedProjectId) : advances;

  const totalPoValue = projects.reduce((s, p) => s + p.poValue, 0);
  const totalInvoiced = invoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = totalInvoiced - totalPaid;
  const totalExpensesAll = expenses.reduce((s, e) => s + e.amount, 0);

  const totalFilteredExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const totalFilteredAdvances = filteredAdvances.reduce((s, a) => s + a.amount, 0);
  const totalFilteredInvoiced = filteredInvoices.reduce((s, i) => s + i.amount, 0);
  const totalFilteredPaid = filteredInvoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const totalFilteredPending = totalFilteredInvoiced - totalFilteredPaid;

  const tabs: { key: BillTab; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "file-text" },
    { key: "advance", label: "Advance", icon: "dollar-sign" },
    ...(isAdmin ? [{ key: "invoice", label: "Invoices", icon: "credit-card" }] : []),
    { key: "expense", label: "Expenses", icon: "shopping-bag" },
  ];
  const effectiveTab = !isAdmin && tab === "invoice" ? "overview" : tab;

  const selectedProjectName = isPerProject && project ? project.name : "All Projects";

  return (
    <View style={[bStyles.root, { backgroundColor: colors.background }]}>
      <View style={[bStyles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[bStyles.title, { color: colors.text }]}>Billing & Finance</Text>
          <Text style={[bStyles.subtitle, { color: colors.mutedForeground }]}>Financial overview across all projects</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        stickyHeaderIndices={[2]}
      >
        {/* Project selector + action buttons */}
        <View style={bStyles.actionsRow}>
          <TouchableOpacity
            style={[bStyles.projectPicker, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowProjectPicker(true)}
          >
            <Feather name="folder" size={14} color={colors.mutedForeground} />
            <Text style={[bStyles.projectPickerText, { color: colors.text }]} numberOfLines={1}>{selectedProjectName}</Text>
            <Feather name="chevron-down" size={14} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity style={[bStyles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => setShowExpenseModal(true)}>
            <Feather name="plus" size={14} color="#fff" />
            <Text style={bStyles.actionBtnText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[bStyles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => setShowInvoiceModal(true)}>
            <Feather name="plus" size={14} color="#fff" />
            <Text style={bStyles.actionBtnText}>Invoice</Text>
          </TouchableOpacity>
        </View>

        {/* Stats cards */}
        <View style={bStyles.statsGrid}>
          <StatCard
            label={isPerProject ? "PO Value" : "Total PO Value"}
            value={isPerProject && project ? fmt(project.poValue) : fmt(totalPoValue)}
            color={colors.text}
            icon="file-text"
          />
          <StatCard
            label="Total Invoiced"
            value={isPerProject ? fmt(totalFilteredInvoiced) : fmt(totalInvoiced)}
            color={colors.info}
            icon="credit-card"
          />
          <StatCard
            label="Received"
            value={isPerProject ? fmt(totalFilteredPaid) : fmt(totalPaid)}
            color={colors.success}
            icon="arrow-down"
          />
          <StatCard
            label="Pending (AR)"
            value={isPerProject ? fmt(totalFilteredPending) : fmt(totalPending)}
            color={colors.orange}
            icon="arrow-up"
          />
        </View>

        {/* Invoiced vs PO bar */}
        <View style={[bStyles.barSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={bStyles.barRow}>
            <Text style={[bStyles.barLabel, { color: colors.mutedForeground }]}>Invoiced vs PO</Text>
            <Text style={[bStyles.barPct, { color: colors.info }]}>
              {Math.round(((isPerProject ? totalFilteredInvoiced : totalInvoiced) / ((isPerProject && project ? project.poValue : totalPoValue) || 1)) * 100)}%
            </Text>
          </View>
          <View style={[bStyles.barTrack, { backgroundColor: colors.muted }]}>
            <View style={[bStyles.barFill, { width: `${Math.min(100, ((isPerProject ? totalFilteredInvoiced : totalInvoiced) / ((isPerProject && project ? project.poValue : totalPoValue) || 1)) * 100)}%` as any, backgroundColor: colors.info }]} />
          </View>
        </View>

        {/* Received vs Invoiced bar */}
        <View style={[bStyles.barSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={bStyles.barRow}>
            <Text style={[bStyles.barLabel, { color: colors.mutedForeground }]}>Received vs Invoiced</Text>
            <Text style={[bStyles.barPct, { color: colors.success }]}>
              {Math.round(((isPerProject ? totalFilteredPaid : totalPaid) / ((isPerProject ? totalFilteredInvoiced : totalInvoiced) || 1)) * 100)}%
            </Text>
          </View>
          <View style={[bStyles.barTrack, { backgroundColor: colors.muted }]}>
            <View style={[bStyles.barFill, { width: `${Math.min(100, ((isPerProject ? totalFilteredPaid : totalPaid) / ((isPerProject ? totalFilteredInvoiced : totalInvoiced) || 1)) * 100)}%` as any, backgroundColor: colors.success }]} />
          </View>
        </View>

        {/* Expenses to date */}
        <View style={[bStyles.expenseBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="shopping-bag" size={16} color={colors.mutedForeground} />
          <Text style={[bStyles.expenseBannerText, { color: colors.mutedForeground }]}>
            Expenses to date: <Text style={{ fontWeight: "700", color: colors.text }}>{fmt(isPerProject ? totalFilteredExpenses : totalExpensesAll)}</Text>
          </Text>
        </View>

        {/* Tabs */}
        <View style={[bStyles.tabRow, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          {tabs.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[bStyles.tab, tab === t.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
              onPress={() => setTab(t.key)}
            >
              <Feather name={t.icon as any} size={14} color={tab === t.key ? colors.primary : colors.mutedForeground} />
              <Text style={[bStyles.tabLabel, { color: tab === t.key ? colors.primary : colors.mutedForeground }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        {effectiveTab === "overview" && (
          <View style={bStyles.tabContent}>
            <Text style={[bStyles.sectionTitle, { color: colors.text }]}>Recent Invoices</Text>
            {filteredInvoices.length === 0 ? (
              <View style={bStyles.emptyState}>
                <Feather name="file-text" size={32} color={colors.mutedForeground} />
                <Text style={[bStyles.emptyText, { color: colors.mutedForeground }]}>No invoices raised yet</Text>
              </View>
            ) : (
              filteredInvoices.map((inv) => {
                const invProject = projects.find((p) => p.id === inv.projectId);
                return (
                  <View key={inv.id} style={[bStyles.invoiceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[bStyles.invoiceIcon, { backgroundColor: colors.secondary }]}>
                      <Feather name="file-text" size={16} color={colors.primary} />
                    </View>
                    <View style={bStyles.invoiceInfo}>
                      <View style={bStyles.invoiceTop}>
                        <Text style={[bStyles.invNum, { color: colors.text }]}>{inv.number}</Text>
                        <StatusBadge status={inv.status} small />
                      </View>
                      <Text style={[bStyles.invProject, { color: colors.primary }]}>{invProject?.name ?? "Unknown"}</Text>
                      <Text style={[bStyles.invDesc, { color: colors.mutedForeground }]}>{inv.description} · {inv.date}</Text>
                    </View>
                    <Text style={[bStyles.invAmount, { color: colors.text }]}>{fmt(inv.amount)}</Text>
                  </View>
                );
              })
            )}
          </View>
        )}

        {effectiveTab === "advance" && (
          <View style={bStyles.tabContent}>
            <View style={bStyles.tabHeader}>
              <Text style={[bStyles.sectionTitle, { color: colors.text }]}>Advance by Company</Text>
              <TouchableOpacity style={[bStyles.smallBtn, { backgroundColor: colors.primary }]} onPress={() => setShowAdvanceModal(true)}>
                <Feather name="plus" size={12} color="#fff" />
                <Text style={bStyles.smallBtnText}>New</Text>
              </TouchableOpacity>
            </View>

            {totalFilteredAdvances > 0 && (
              <View style={[bStyles.miniStatRow, { backgroundColor: `${colors.orange}10`, borderColor: `${colors.orange}30` }]}>
                <Text style={[bStyles.miniStatLabel, { color: colors.orange }]}>Total Advances</Text>
                <Text style={[bStyles.miniStatValue, { color: colors.orange }]}>{fmt(totalFilteredAdvances)}</Text>
              </View>
            )}

            {filteredAdvances.length === 0 ? (
              <View style={bStyles.emptyState}>
                <Feather name="dollar-sign" size={32} color={colors.mutedForeground} />
                <Text style={[bStyles.emptyText, { color: colors.mutedForeground }]}>No advances given yet</Text>
              </View>
            ) : (
              filteredAdvances.map((adv) => (
                <View key={adv.id} style={[bStyles.advanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={bStyles.advanceLeft}>
                    <View style={[bStyles.advancIcon, { backgroundColor: `${colors.orange}15` }]}>
                      <Feather name="user" size={16} color={colors.orange} />
                    </View>
                    <View style={bStyles.advanceInfo}>
                      <Text style={[bStyles.advancePerson, { color: colors.text }]}>{adv.personName}</Text>
                      <Text style={[bStyles.advancePurpose, { color: colors.mutedForeground }]}>{adv.purpose || "—"}</Text>
                      <Text style={[bStyles.advanceDate, { color: colors.mutedForeground }]}>{adv.date}</Text>
                    </View>
                  </View>
                  <View style={bStyles.advanceRight}>
                    <Text style={[bStyles.advanceAmount, { color: colors.text }]}>{fmt(adv.amount)}</Text>
                    <View style={bStyles.advanceActions}>
                      {!adv.settled && (
                        <TouchableOpacity
                          style={[bStyles.tinyBtn, { backgroundColor: `${colors.success}15` }]}
                          onPress={() => updateAdvance(adv.id, { settled: true, settledDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) })}
                        >
                          <Text style={[bStyles.tinyBtnText, { color: colors.success }]}>Settle</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[bStyles.tinyBtn, { backgroundColor: `${colors.destructive}15` }]}
                        onPress={() => deleteAdvance(adv.id)}
                      >
                        <Feather name="trash-2" size={12} color={colors.destructive} />
                      </TouchableOpacity>
                    </View>
                    <StatusBadge status={adv.settled ? "Paid" : "Pending"} small />
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {tab === "invoice" && isAdmin && (
          <View style={bStyles.tabContent}>
            <View style={bStyles.tabHeader}>
              <Text style={[bStyles.sectionTitle, { color: colors.text }]}>Invoices</Text>
              <TouchableOpacity style={[bStyles.smallBtn, { backgroundColor: colors.primary }]} onPress={() => setShowInvoiceModal(true)}>
                <Feather name="plus" size={12} color="#fff" />
                <Text style={bStyles.smallBtnText}>New</Text>
              </TouchableOpacity>
            </View>

            {filteredInvoices.length > 0 && (
              <View style={bStyles.miniStatsRow}>
                <MiniStat label="Invoiced" value={fmt(totalFilteredInvoiced)} color={colors.info} />
                <MiniStat label="Received" value={fmt(totalFilteredPaid)} color={colors.success} />
                <MiniStat label="Pending" value={fmt(totalFilteredPending)} color={colors.orange} />
                <MiniStat label="Not Raised" value={fmt(filteredInvoices.filter((i) => i.status === "Not Raised").reduce((s, i) => s + i.amount, 0))} color={colors.mutedForeground} />
              </View>
            )}

            {filteredInvoices.length === 0 ? (
              <View style={bStyles.emptyState}>
                <Feather name="credit-card" size={32} color={colors.mutedForeground} />
                <Text style={[bStyles.emptyText, { color: colors.mutedForeground }]}>No invoices raised yet</Text>
              </View>
            ) : (
              filteredInvoices.map((inv) => {
                const invProject = projects.find((p) => p.id === inv.projectId);
                return (
                  <View key={inv.id} style={[bStyles.invoiceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[bStyles.invoiceIcon, { backgroundColor: colors.secondary }]}>
                      <Feather name="file-text" size={16} color={colors.primary} />
                    </View>
                    <View style={bStyles.invoiceInfo}>
                      <View style={bStyles.invoiceTop}>
                        <Text style={[bStyles.invNum, { color: colors.text }]}>{inv.number}</Text>
                        <StatusBadge status={inv.status} small />
                      </View>
                      {!isPerProject && (
                        <Text style={[bStyles.invProject, { color: colors.primary }]}>{invProject?.name ?? "Unknown"}</Text>
                      )}
                      <Text style={[bStyles.invDesc, { color: colors.mutedForeground }]}>{inv.description} · {inv.date}</Text>
                    </View>
                    <Text style={[bStyles.invAmount, { color: colors.text }]}>{fmt(inv.amount)}</Text>
                  </View>
                );
              })
            )}
          </View>
        )}

        {effectiveTab === "expense" && (
          <View style={bStyles.tabContent}>
            <View style={bStyles.tabHeader}>
              <Text style={[bStyles.sectionTitle, { color: colors.text }]}>Field Expenses</Text>
              <TouchableOpacity style={[bStyles.smallBtn, { backgroundColor: colors.primary }]} onPress={() => setShowExpenseModal(true)}>
                <Feather name="plus" size={12} color="#fff" />
                <Text style={bStyles.smallBtnText}>New</Text>
              </TouchableOpacity>
            </View>

            {(filteredExpenses.length > 0 || filteredAdvances.length > 0) && (
              <View style={bStyles.miniStatsRow}>
                <MiniStat label="Expenses" value={fmt(totalFilteredExpenses)} color={colors.orange} />
                <MiniStat label="Advances" value={fmt(totalFilteredAdvances)} color={colors.warning} />
                <MiniStat
                  label="Balance"
                  value={fmt(totalFilteredAdvances - totalFilteredExpenses)}
                  color={totalFilteredAdvances - totalFilteredExpenses >= 0 ? colors.success : colors.destructive}
                />
              </View>
            )}

            {filteredExpenses.length > 0 && (
              <View style={[bStyles.typeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[bStyles.typeTitle, { color: colors.mutedForeground }]}>BY TYPE</Text>
                {Object.entries(
                  filteredExpenses.reduce<Record<string, number>>((acc, e) => {
                    acc[e.expenseType] = (acc[e.expenseType] ?? 0) + e.amount;
                    return acc;
                  }, {})
                ).map(([type, amt]) => (
                  <View key={type} style={bStyles.typeRow}>
                    <Text style={[bStyles.typeLabel, { color: colors.text }]}>{type}</Text>
                    <Text style={[bStyles.typeAmt, { color: colors.text }]}>{fmt(amt)}</Text>
                  </View>
                ))}
              </View>
            )}

            {filteredExpenses.length === 0 ? (
              <View style={bStyles.emptyState}>
                <Feather name="shopping-bag" size={32} color={colors.mutedForeground} />
                <Text style={[bStyles.emptyText, { color: colors.mutedForeground }]}>No expenses logged</Text>
              </View>
            ) : (
              filteredExpenses.map((exp) => (
                <View key={exp.id} style={[bStyles.expenseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[bStyles.expenseIcon, { backgroundColor: `${colors.orange}15` }]}>
                    <Feather name="shopping-bag" size={16} color={colors.orange} />
                  </View>
                  <View style={bStyles.expenseInfo}>
                    <View style={bStyles.expenseTop}>
                      <Text style={[bStyles.expensePaidBy, { color: colors.text }]}>{exp.paidBy}</Text>
                      <View style={[bStyles.expenseTypeBadge, { backgroundColor: colors.secondary }]}>
                        <Text style={[bStyles.expenseTypeLabel, { color: colors.mutedForeground }]}>{exp.expenseType}</Text>
                      </View>
                    </View>
                    <Text style={[bStyles.expenseRemarks, { color: colors.mutedForeground }]}>{exp.remarks || "—"}</Text>
                    <Text style={[bStyles.expenseDate, { color: colors.mutedForeground }]}>{exp.date}{exp.location ? ` · ${exp.location}` : ""}</Text>
                  </View>
                  <Text style={[bStyles.expenseAmount, { color: colors.text }]}>{fmt(exp.amount)}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Project Picker Modal */}
      <Modal visible={showProjectPicker} transparent animationType="fade" onRequestClose={() => setShowProjectPicker(false)}>
        <TouchableOpacity style={bStyles.modalOverlay} activeOpacity={1} onPress={() => setShowProjectPicker(false)}>
          <View style={[bStyles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[bStyles.modalTitle, { color: colors.text }]}>Select Project</Text>
            <TouchableOpacity
              style={[bStyles.modalItem, selectedProjectId === "all" && { backgroundColor: colors.primary }]}
              onPress={() => { setSelectedProjectId("all"); setShowProjectPicker(false); }}
            >
              <Text style={[bStyles.modalItemText, { color: selectedProjectId === "all" ? "#fff" : colors.text }]}>All Projects</Text>
              {selectedProjectId === "all" && <Feather name="check" size={16} color="#fff" />}
            </TouchableOpacity>
            {projects.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[bStyles.modalItem, selectedProjectId === p.id && { backgroundColor: colors.primary }]}
                onPress={() => { setSelectedProjectId(p.id); setShowProjectPicker(false); }}
              >
                <Text style={[bStyles.modalItemText, { color: selectedProjectId === p.id ? "#fff" : colors.text }]}>{p.name}</Text>
                {selectedProjectId === p.id && <Feather name="check" size={16} color="#fff" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Invoice Modal */}
      <Modal visible={showInvoiceModal} transparent animationType="slide" onRequestClose={() => setShowInvoiceModal(false)}>
        <InvoiceFormModal
          colors={colors}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onClose={() => setShowInvoiceModal(false)}
          onSave={(inv) => { addInvoice(inv); setShowInvoiceModal(false); }}
        />
      </Modal>

      {/* Advance Modal */}
      <Modal visible={showAdvanceModal} transparent animationType="slide" onRequestClose={() => setShowAdvanceModal(false)}>
        <AdvanceFormModal
          colors={colors}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onClose={() => setShowAdvanceModal(false)}
          onSave={(adv) => { addAdvance(adv); setShowAdvanceModal(false); }}
        />
      </Modal>

      {/* Expense Modal */}
      <Modal visible={showExpenseModal} transparent animationType="slide" onRequestClose={() => setShowExpenseModal(false)}>
        <ExpenseFormModal
          colors={colors}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onClose={() => setShowExpenseModal(false)}
          onSave={(exp) => { addExpense(exp); setShowExpenseModal(false); }}
        />
      </Modal>
    </View>
  );
}

/* ─── Invoice Form Modal ─── */
function InvoiceFormModal({
  colors, projects, selectedProjectId, onClose, onSave,
}: {
  colors: any; projects: any[]; selectedProjectId: string; onClose: () => void; onSave: (i: Invoice) => void;
}) {
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Pending");
  const [pid, setPid] = useState(selectedProjectId !== "all" ? selectedProjectId : projects[0]?.id ?? "");
  const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const handleSave = () => {
    if (!number || !amount || !pid) return;
    onSave({
      id: crypto.randomUUID(),
      projectId: pid,
      number,
      description,
      amount: Number(amount),
      date: dateStr,
      status: status as any,
    });
  };

  return (
    <TouchableOpacity style={bStyles.modalOverlay} activeOpacity={1} onPress={onClose}>
      <View style={[bStyles.formModal, { backgroundColor: colors.card }]} onStartShouldSetResponder={() => true}>
        <View style={bStyles.formHeader}>
          <Text style={[bStyles.formTitle, { color: colors.text }]}>New Invoice</Text>
          <TouchableOpacity onPress={onClose}><Feather name="x" size={20} color={colors.text} /></TouchableOpacity>
        </View>

        {selectedProjectId === "all" && (
          <>
            <Text style={[bStyles.fieldLabel, { color: colors.mutedForeground }]}>Project</Text>
            <View style={bStyles.projectChips}>
              {projects.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[bStyles.chip, pid === p.id && { backgroundColor: colors.primary }]}
                  onPress={() => setPid(p.id)}
                >
                  <Text style={[bStyles.chipText, { color: pid === p.id ? "#fff" : colors.text }]}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={[bStyles.fieldLabel, { color: colors.mutedForeground }]}>Invoice # *</Text>
        <TextInput style={[bStyles.fieldInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="INV-001" placeholderTextColor={colors.mutedForeground} value={number} onChangeText={setNumber} />

        <Text style={[bStyles.fieldLabel, { color: colors.mutedForeground }]}>Amount (₹) *</Text>
        <TextInput style={[bStyles.fieldInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="100000" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" value={amount} onChangeText={setAmount} />

        <Text style={[bStyles.fieldLabel, { color: colors.mutedForeground }]}>Description</Text>
        <TextInput style={[bStyles.fieldInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="Field Work Completion" placeholderTextColor={colors.mutedForeground} value={description} onChangeText={setDescription} />

        <Text style={[bStyles.fieldLabel, { color: colors.mutedForeground }]}>Status</Text>
        <View style={bStyles.statusChips}>
          {["Pending", "Partial", "Paid", "Not Raised"].map((s) => (
            <TouchableOpacity
              key={s}
              style={[bStyles.chip, status === s && { backgroundColor: colors.primary }]}
              onPress={() => setStatus(s)}
            >
              <Text style={[bStyles.chipText, { color: status === s ? "#fff" : colors.text }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[bStyles.formSaveBtn, { backgroundColor: colors.primary }]} onPress={handleSave} disabled={!number || !amount || !pid}>
          <Text style={bStyles.formSaveText}>Save Invoice</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

/* ─── Advance Form Modal ─── */
function AdvanceFormModal({
  colors, projects, selectedProjectId, onClose, onSave,
}: {
  colors: any; projects: any[]; selectedProjectId: string; onClose: () => void; onSave: (a: Advance) => void;
}) {
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [pid, setPid] = useState(selectedProjectId !== "all" ? selectedProjectId : projects[0]?.id ?? "");
  const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const handleSave = () => {
    if (!personName || !amount || !pid) return;
    onSave({
      id: crypto.randomUUID(),
      projectId: pid,
      personName,
      amount: Number(amount),
      date: dateStr,
      purpose,
      settled: false,
      remarks: "",
    });
  };

  return (
    <TouchableOpacity style={bStyles.modalOverlay} activeOpacity={1} onPress={onClose}>
      <View style={[bStyles.formModal, { backgroundColor: colors.card }]} onStartShouldSetResponder={() => true}>
        <View style={bStyles.formHeader}>
          <Text style={[bStyles.formTitle, { color: colors.text }]}>New Advance</Text>
          <TouchableOpacity onPress={onClose}><Feather name="x" size={20} color={colors.text} /></TouchableOpacity>
        </View>

        {selectedProjectId === "all" && (
          <>
            <Text style={[bStyles.fieldLabel, { color: colors.mutedForeground }]}>Project</Text>
            <View style={bStyles.projectChips}>
              {projects.slice(0, 4).map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[bStyles.chip, pid === p.id && { backgroundColor: colors.primary }]}
                  onPress={() => setPid(p.id)}
                >
                  <Text style={[bStyles.chipText, { color: pid === p.id ? "#fff" : colors.text }]}>{p.name.slice(0, 14)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={[bStyles.fieldLabel, { color: colors.mutedForeground }]}>Person Name *</Text>
        <TextInput style={[bStyles.fieldInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="e.g. Ramesh" placeholderTextColor={colors.mutedForeground} value={personName} onChangeText={setPersonName} />

        <Text style={[bStyles.fieldLabel, { color: colors.mutedForeground }]}>Amount (₹) *</Text>
        <TextInput style={[bStyles.fieldInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="10000" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" value={amount} onChangeText={setAmount} />

        <Text style={[bStyles.fieldLabel, { color: colors.mutedForeground }]}>Purpose</Text>
        <TextInput style={[bStyles.fieldInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="Field trip advance" placeholderTextColor={colors.mutedForeground} value={purpose} onChangeText={setPurpose} />

        <TouchableOpacity style={[bStyles.formSaveBtn, { backgroundColor: colors.orange }]} onPress={handleSave} disabled={!personName || !amount || !pid}>
          <Text style={bStyles.formSaveText}>Save Advance</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

/* ─── Expense Form Modal ─── */
function ExpenseFormModal({
  colors, projects, selectedProjectId, onClose, onSave,
}: {
  colors: any; projects: any[]; selectedProjectId: string; onClose: () => void; onSave: (e: Expense) => void;
}) {
  const [expenseType, setExpenseType] = useState("Fuel");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [location, setLocation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [pid, setPid] = useState(selectedProjectId !== "all" ? selectedProjectId : projects[0]?.id ?? "");
  const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const types = ["Fuel", "Accommodation", "Vehicle Rental", "Food & Meals", "Equipment Repair", "Other"];

  const handleSave = () => {
    if (!amount || !paidBy || !pid) return;
    onSave({
      id: crypto.randomUUID(),
      projectId: pid,
      expenseType,
      date: dateStr,
      amount: Number(amount),
      paidBy,
      location,
      remarks,
    });
  };

  return (
    <TouchableOpacity style={bStyles.modalOverlay} activeOpacity={1} onPress={onClose}>
      <View style={[bStyles.formModal, { backgroundColor: colors.card }]} onStartShouldSetResponder={() => true}>
        <View style={bStyles.formHeader}>
          <Text style={[bStyles.formTitle, { color: colors.text }]}>New Field Expense</Text>
          <TouchableOpacity onPress={onClose}><Feather name="x" size={20} color={colors.text} /></TouchableOpacity>
        </View>

        {selectedProjectId === "all" && (
          <>
            <Text style={[bStyles.fieldLabel, { color: colors.mutedForeground }]}>Project</Text>
            <View style={bStyles.projectChips}>
              {projects.slice(0, 4).map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[bStyles.chip, pid === p.id && { backgroundColor: colors.primary }]}
                  onPress={() => setPid(p.id)}
                >
                  <Text style={[bStyles.chipText, { color: pid === p.id ? "#fff" : colors.text }]}>{p.name.slice(0, 14)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={[bStyles.fieldLabel, { color: colors.mutedForeground }]}>Type</Text>
        <View style={bStyles.projectChips}>
          {types.map((t) => (
            <TouchableOpacity
              key={t}
              style={[bStyles.chip, expenseType === t && { backgroundColor: colors.orange }]}
              onPress={() => setExpenseType(t)}
            >
              <Text style={[bStyles.chipText, { color: expenseType === t ? "#fff" : colors.text }]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[bStyles.fieldLabel, { color: colors.mutedForeground }]}>Amount (₹) *</Text>
        <TextInput style={[bStyles.fieldInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="2500" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" value={amount} onChangeText={setAmount} />

        <Text style={[bStyles.fieldLabel, { color: colors.mutedForeground }]}>Paid By *</Text>
        <TextInput style={[bStyles.fieldInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="e.g. Ramesh" placeholderTextColor={colors.mutedForeground} value={paidBy} onChangeText={setPaidBy} />

        <Text style={[bStyles.fieldLabel, { color: colors.mutedForeground }]}>Location</Text>
        <TextInput style={[bStyles.fieldInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="City or site" placeholderTextColor={colors.mutedForeground} value={location} onChangeText={setLocation} />

        <Text style={[bStyles.fieldLabel, { color: colors.mutedForeground }]}>Remarks</Text>
        <TextInput style={[bStyles.fieldInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="Optional notes" placeholderTextColor={colors.mutedForeground} value={remarks} onChangeText={setRemarks} />

        <TouchableOpacity style={[bStyles.formSaveBtn, { backgroundColor: colors.orange }]} onPress={handleSave} disabled={!amount || !paidBy || !pid}>
          <Text style={bStyles.formSaveText}>Save Expense</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const bStyles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  actionsRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  projectPicker: {
    flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, gap: 6,
  },
  projectPickerText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  actionBtn: { flexDirection: "row", alignItems: "center", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, gap: 4 },
  actionBtnText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  statCard: {
    width: "48%", borderRadius: 12, padding: 12, borderWidth: 1, gap: 6,
  },
  statIcon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  barSection: { marginHorizontal: 16, borderRadius: 10, padding: 12, borderWidth: 1, marginBottom: 8, gap: 6 },
  barRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  barLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  barPct: { fontSize: 12, fontFamily: "Inter_700Bold" },
  barTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  barFill: { height: 6, borderRadius: 3 },
  expenseBanner: {
    marginHorizontal: 16, borderRadius: 10, padding: 12, borderWidth: 1, marginBottom: 8,
    flexDirection: "row", alignItems: "center", gap: 8,
  },
  expenseBannerText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  tabRow: {
    flexDirection: "row", paddingHorizontal: 16, borderBottomWidth: 1, paddingTop: 4,
  },
  tab: {
    flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 10, paddingHorizontal: 12, marginRight: 4,
  },
  tabLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  tabContent: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  tabHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  smallBtn: { flexDirection: "row", alignItems: "center", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, gap: 4 },
  smallBtnText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  emptyState: { alignItems: "center", paddingVertical: 32, gap: 10 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  invoiceCard: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 12, borderWidth: 1, gap: 10 },
  invoiceIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  invoiceInfo: { flex: 1, gap: 2 },
  invoiceTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  invNum: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  invProject: { fontSize: 11, fontFamily: "Inter_500Medium" },
  invDesc: { fontSize: 11, fontFamily: "Inter_400Regular" },
  invAmount: { fontSize: 14, fontFamily: "Inter_700Bold" },
  miniStat: { flex: 1, borderRadius: 8, padding: 8, borderWidth: 1, gap: 2 },
  miniLabel: { fontSize: 8, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
  miniValue: { fontSize: 13, fontFamily: "Inter_700Bold" },
  miniStatsRow: { flexDirection: "row", gap: 6 },
  advanceCard: { flexDirection: "row", borderRadius: 12, padding: 12, borderWidth: 1, gap: 10 },
  advanceLeft: { flex: 1, flexDirection: "row", gap: 10 },
  advancIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  advanceInfo: { gap: 1 },
  advancePerson: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  advancePurpose: { fontSize: 11, fontFamily: "Inter_400Regular" },
  advanceDate: { fontSize: 10, fontFamily: "Inter_400Regular" },
  advanceRight: { alignItems: "flex-end", gap: 4 },
  advanceAmount: { fontSize: 14, fontFamily: "Inter_700Bold" },
  advanceActions: { flexDirection: "row", gap: 4 },
  tinyBtn: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  tinyBtnText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  expenseCard: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 12, borderWidth: 1, gap: 10 },
  expenseIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  expenseInfo: { flex: 1, gap: 1 },
  expenseTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  expensePaidBy: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  expenseTypeBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 },
  expenseTypeLabel: { fontSize: 9, fontFamily: "Inter_500Medium" },
  expenseRemarks: { fontSize: 11, fontFamily: "Inter_400Regular" },
  expenseDate: { fontSize: 10, fontFamily: "Inter_400Regular" },
  expenseAmount: { fontSize: 14, fontFamily: "Inter_700Bold" },
  miniStatRow: { borderRadius: 10, padding: 12, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  miniStatLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  miniStatValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  typeCard: { borderRadius: 10, padding: 12, borderWidth: 1, gap: 8 },
  typeTitle: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  typeRow: { flexDirection: "row", justifyContent: "space-between" },
  typeLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  typeAmt: { fontSize: 12, fontFamily: "Inter_700Bold" },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: "70%", gap: 6 },
  modalTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 8 },
  modalItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  modalItemText: { fontSize: 14, fontFamily: "Inter_500Medium" },

  /* Form */
  formModal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "90%", gap: 12 },
  formHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  formTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  fieldInput: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily: "Inter_400Regular" },
  projectChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  statusChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  formSaveBtn: { borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 4 },
  formSaveText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
});
