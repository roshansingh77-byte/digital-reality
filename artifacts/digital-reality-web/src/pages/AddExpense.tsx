import { useState } from "react";
import { useLocation } from "wouter";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Save, Camera, Upload } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AddExpense() {
  const { projects, addExpense, addDocument } = useApp();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [projectId, setProjectId] = useState("");
  const [expenseType, setExpenseType] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [locationStr, setLocationStr] = useState("");
  const [remarks, setRemarks] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleCameraCapture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFileUpload(file);
    };
    input.click();
  };

  const handleDriveUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.xlsx,.xls,.jpg,.jpeg,.png";
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFileUpload(file);
    };
    input.click();
  };

  const handleFileUpload = (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      addDocument({
        id: crypto.randomUUID(),
        projectId,
        name: file.name,
        mimeType: file.type,
        size: file.size,
        data: reader.result as string,
        uploadedAt: new Date().toISOString(),
        category: "expense",
      });
      toast({
        title: "File uploaded",
        description: `${file.name} has been attached to this expense.`
      });
      setUploading(false);
    };
    reader.onerror = () => {
      setUploading(false);
      toast({
        title: "Upload failed",
        description: "Failed to upload the file.",
        variant: "destructive"
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectId || !expenseType || !date || !amount || !paidBy) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    addExpense({
      id: `ex${Date.now()}`,
      projectId,
      expenseType,
      date,
      amount: parseFloat(amount) || 0,
      paidBy,
      location: locationStr,
      remarks,
      reviewStatus: "pending",
    });

    toast({
      title: "Expense added",
      description: "Field expense has been successfully recorded."
    });

    setLocation("/billing");
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" className="shrink-0" asChild>
          <Link href="/billing">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Add Expense</h1>
          <p className="text-sm text-muted-foreground mt-1">Record project-related field expenses</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
          <CardDescription>Enter the details of the field expense incurred.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                <Label htmlFor="type">Expense Category *</Label>
                <Select value={expenseType} onValueChange={setExpenseType}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fuel">Fuel</SelectItem>
                    <SelectItem value="Accommodation">Accommodation</SelectItem>
                    <SelectItem value="Vehicle">Vehicle Rental</SelectItem>
                    <SelectItem value="Food">Food & Meals</SelectItem>
                    <SelectItem value="Equipment Repair">Equipment Repair</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input id="amount" type="number" placeholder="2500" value={amount} onChange={e => setAmount(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paidBy">Paid By (Name) *</Label>
                <Input id="paidBy" placeholder="e.g., Ramesh" value={paidBy} onChange={e => setPaidBy(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="City or Site" value={locationStr} onChange={e => setLocationStr(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2 border-t pt-6">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea 
                id="remarks" 
                placeholder="Details about the expense, bill numbers, etc." 
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
              />
            </div>

            <div className="border-t pt-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">Attach Expense Proof</h3>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCameraCapture}
                    disabled={uploading}
                    className="gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    {uploading ? "Uploading..." : "Camera"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDriveUpload}
                    disabled={uploading}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? "Uploading..." : "Upload File"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Upload bill photos or receipts (JPG, PNG, PDF, etc.)</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/billing">Cancel</Link>
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Save Expense
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
