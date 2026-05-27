import { useState } from "react";
import { useApp } from "@/context/AppContext";
import type { Activity, FieldWorkSection, ProcessingSection, ModellingSection, DocumentationSection } from "@/context/AppContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MapPin, CheckCircle2, Circle, FileText, Save, Plus, Box, Cpu } from "lucide-react";
import { Link } from "wouter";

type WorkflowKey = "fieldWork" | "processing" | "modelling" | "documentation";

const WORKFLOW_TABS: { key: WorkflowKey; label: string; icon: React.ElementType; color: string }[] = [
  { key: "fieldWork", label: "Field Work", icon: MapPin, color: "text-emerald-600" },
  { key: "processing", label: "Processing", icon: Cpu, color: "text-blue-600" },
  { key: "modelling", label: "Modelling", icon: Box, color: "text-violet-600" },
  { key: "documentation", label: "Documentation", icon: FileText, color: "text-orange-600" },
];

function ActivityProgressBadge({ activity }: { activity: Activity }) {
  const { getActivityProgress } = useApp();
  const progress = getActivityProgress(activity);
  return (
    <div className="flex items-center gap-2">
      <Progress value={progress} className="w-16 h-1.5" />
      <span className="text-xs font-medium tabular-nums">{progress}%</span>
    </div>
  );
}

function ActivityCard({ activity, selected, onClick }: { activity: Activity; selected: boolean; onClick: () => void }) {
  const completedSections = [activity.fieldWork, activity.processing, activity.modelling, activity.documentation].filter(s => s.completed).length;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border transition-colors ${selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{activity.activityType}</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{activity.location}</p>
        </div>
        <Badge variant={completedSections === 4 ? "default" : "secondary"} className="shrink-0 text-[10px]">
          {completedSections}/4
        </Badge>
      </div>
      <div className="mt-2">
        <ActivityProgressBadge activity={activity} />
      </div>
    </button>
  );
}

function FieldWorkForm({ activity, onSave }: { activity: Activity; onSave: (data: Partial<FieldWorkSection>) => void }) {
  const fw = activity.fieldWork;
  const [form, setForm] = useState({ ...fw });
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    onSave(form);
    setTimeout(() => setSaving(false), 300);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {fw.completed ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
          <span className="text-sm font-semibold">{fw.completed ? "Completed" : "Not Completed"}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Checkbox id="fw-completed" checked={form.completed} onCheckedChange={(v) => setForm({ ...form, completed: !!v })} />
            <Label htmlFor="fw-completed" className="text-xs cursor-pointer">Mark as completed</Label>
          </div>
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
            <Save className="w-3.5 h-3.5" />{saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProcessingForm({ activity, onSave }: { activity: Activity; onSave: (data: Partial<ProcessingSection>) => void }) {
  const p = activity.processing;
  const [form, setForm] = useState({ ...p });
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    onSave(form);
    setTimeout(() => setSaving(false), 300);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {p.completed ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
          <span className="text-sm font-semibold">{p.completed ? "Completed" : "Not Completed"}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Checkbox id="p-completed" checked={form.completed} onCheckedChange={(v) => setForm({ ...form, completed: !!v })} />
            <Label htmlFor="p-completed" className="text-xs cursor-pointer">Mark as completed</Label>
          </div>
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
            <Save className="w-3.5 h-3.5" />{saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ModellingForm({ activity, onSave }: { activity: Activity; onSave: (data: Partial<ModellingSection>) => void }) {
  const m = activity.modelling;
  const [form, setForm] = useState({ ...m });
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    onSave(form);
    setTimeout(() => setSaving(false), 300);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {m.completed ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
          <span className="text-sm font-semibold">{m.completed ? "Completed" : "Not Completed"}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Checkbox id="m-completed" checked={form.completed} onCheckedChange={(v) => setForm({ ...form, completed: !!v })} />
            <Label htmlFor="m-completed" className="text-xs cursor-pointer">Mark as completed</Label>
          </div>
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
            <Save className="w-3.5 h-3.5" />{saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function DocumentationForm({ activity, onSave }: { activity: Activity; onSave: (data: Partial<DocumentationSection>) => void }) {
  const d = activity.documentation;
  const [form, setForm] = useState({ ...d });
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    onSave(form);
    setTimeout(() => setSaving(false), 300);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {d.completed ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
          <span className="text-sm font-semibold">{d.completed ? "Completed" : "Not Completed"}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Checkbox id="d-completed" checked={form.completed} onCheckedChange={(v) => setForm({ ...form, completed: !!v })} />
            <Label htmlFor="d-completed" className="text-xs cursor-pointer">Mark as completed</Label>
          </div>
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
            <Save className="w-3.5 h-3.5" />{saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ActivitiesPage() {
  const { activities, updateActivityWorkflow } = useApp();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [workflowTab, setWorkflowTab] = useState("fieldWork");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredActivities = activities.filter(a =>
    !searchQuery || a.activityType.toLowerCase().includes(searchQuery.toLowerCase()) || a.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSectionSave = (key: WorkflowKey, data: Partial<FieldWorkSection | ProcessingSection | ModellingSection | DocumentationSection>) => {
    if (!selectedActivity) return;
    updateActivityWorkflow(selectedActivity.id, key, data);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Field Activities</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and track all field activities with workflow sections.</p>
        </div>
        <Input
          placeholder="Search activities..."
          className="w-full sm:w-64 h-9 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
        <Card className="h-fit lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto">
          <CardContent className="p-3 space-y-2">
            {filteredActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No activities found.</p>
            ) : (
              filteredActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  selected={selectedActivity?.id === activity.id}
                  onClick={() => setSelectedActivity(activity)}
                />
              ))
            )}
          </CardContent>
        </Card>

        <div>
          {!selectedActivity ? (
            <Card className="border-dashed bg-muted/20 h-full">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-muted-foreground">Select an activity from the list to view and manage its workflow sections.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">{selectedActivity.activityType}</h2>
                  <p className="text-sm text-muted-foreground">{selectedActivity.location} &middot; {selectedActivity.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <ActivityProgressBadge activity={selectedActivity} />
                  <div className="flex gap-1">
                    {[selectedActivity.fieldWork, selectedActivity.processing, selectedActivity.modelling, selectedActivity.documentation].map((s, i) => (
                      <div key={i} className={`w-2.5 h-2.5 rounded-full ${s.completed ? "bg-green-500" : "bg-muted-foreground/30"}`} title={WORKFLOW_TABS[i].label} />
                    ))}
                  </div>
                </div>
              </div>

              <Tabs value={workflowTab} onValueChange={setWorkflowTab}>
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-0 overflow-x-auto flex-nowrap">
                  {WORKFLOW_TABS.map(tab => {
                    const section = selectedActivity[tab.key as WorkflowKey];
                    const completed = section.completed;
                    return (
                      <TabsTrigger
                        key={tab.key}
                        value={tab.key}
                        className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 whitespace-nowrap text-xs gap-1.5"
                      >
                        <tab.icon className={`w-3.5 h-3.5 ${completed ? tab.color : "text-muted-foreground"}`} />
                        {tab.label}
                        {completed && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                <TabsContent value="fieldWork" className="pt-5">
                  <FieldWorkForm activity={selectedActivity} onSave={(data) => handleSectionSave("fieldWork", data)} />
                </TabsContent>
                <TabsContent value="processing" className="pt-5">
                  <ProcessingForm activity={selectedActivity} onSave={(data) => handleSectionSave("processing", data)} />
                </TabsContent>
                <TabsContent value="modelling" className="pt-5">
                  <ModellingForm activity={selectedActivity} onSave={(data) => handleSectionSave("modelling", data)} />
                </TabsContent>
                <TabsContent value="documentation" className="pt-5">
                  <DocumentationForm activity={selectedActivity} onSave={(data) => handleSectionSave("documentation", data)} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
