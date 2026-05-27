import { useState } from "react";
import { useLocation } from "wouter";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const ACTIVITY_TYPES = [
  "Drone LiDAR Survey",
  "GNSS Control Survey",
  "Ground Truth Verification",
  "Topographic Survey",
  "Mobile Mapping",
  "UAV Photogrammetry",
  "Data Processing",
];

export default function AddActivity() {
  const { projects, equipment, addActivity } = useApp();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [projectId, setProjectId] = useState("");
  const [activityType, setActivityType] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [locationStr, setLocationStr] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [selectedEq, setSelectedEq] = useState<string[]>([]);
  const [area, setArea] = useState("");
  const [remarks, setRemarks] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectId || !activityType || !date || !locationStr) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const eqNames = equipment.filter(eq => selectedEq.includes(eq.id)).map(eq => eq.name);
    const activityId = `a${Date.now()}`;

    addActivity({
      id: activityId,
      projectId,
      activityType,
      date,
      location: locationStr,
      lat: parseFloat(lat) || 0,
      lng: parseFloat(lng) || 0,
      fieldWork: {
        id: `fw-${activityId}`,
        date,
        time: "",
        location: locationStr,
        lat: parseFloat(lat) || 0,
        lng: parseFloat(lng) || 0,
        areaSqKm: parseFloat(area) || 0,
        linearKm: 0,
        equipmentUsed: eqNames,
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

    toast({
      title: "Activity logged",
      description: "Field activity has been successfully recorded with workflow sections."
    });

    setLocation("/activities");
  };

  const toggleEquipment = (id: string) => {
    if (selectedEq.includes(id)) {
      setSelectedEq(selectedEq.filter(e => e !== id));
    } else {
      setSelectedEq([...selectedEq, id]);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" className="shrink-0" asChild>
          <Link href="/activities">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Log Field Activity</h1>
          <p className="text-sm text-muted-foreground mt-1">Record a new activity with workflow sections</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Activity Details</CardTitle>
              <CardDescription>Basic information about the field work.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="project">Project *</Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger id="project">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Activity Type *</Label>
                  <Select value={activityType} onValueChange={setActivityType}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_TYPES.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location Name *</Label>
                  <Input id="location" placeholder="e.g., Kagaznagar" value={locationStr} onChange={e => setLocationStr(e.target.value)} required />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coordinates & Area</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input id="lat" type="number" step="any" placeholder="16.7563" value={lat} onChange={e => setLat(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input id="lng" type="number" step="any" placeholder="80.4356" value={lng} onChange={e => setLng(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area Covered (sqkm)</Label>
                <Input id="area" type="number" step="any" placeholder="12.5" value={area} onChange={e => setArea(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Equipment & Remarks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Equipment Used</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border rounded-md p-4 bg-muted/20">
                  {equipment.map(eq => (
                    <div key={eq.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`eq-${eq.id}`}
                        checked={selectedEq.includes(eq.id)}
                        onCheckedChange={() => toggleEquipment(eq.id)}
                      />
                      <label
                        htmlFor={`eq-${eq.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate"
                        title={`${eq.name} (${eq.type})`}
                      >
                        {eq.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Field Remarks</Label>
                <Textarea
                  id="remarks"
                  placeholder="Weather conditions, issues faced, next steps..."
                  className="min-h-[100px]"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/activities">Cancel</Link>
          </Button>
          <Button type="submit" className="w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" />
            Save Activity
          </Button>
        </div>
      </form>
    </div>
  );
}
