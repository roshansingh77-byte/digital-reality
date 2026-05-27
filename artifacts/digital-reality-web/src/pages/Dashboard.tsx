import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { FolderGit2, Map, Compass, Receipt, Banknote, FileText, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { projects, invoices, expenses } = useApp();
  const activeProjects = projects.filter(p => p.status === "Active");
  const recentProjects = activeProjects.slice(0, 4);
  const totalArea = projects.reduce((sum, p) => sum + (p.areaSqKm || 0), 0);
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.amount, 0);
  const totalPaid = invoices.filter(i => i.status === "Paid").reduce((sum, i) => sum + i.amount, 0);
  const totalPending = totalInvoiced - totalPaid;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const approvedExpenses = expenses.filter(e => e.reviewStatus === "approved").reduce((s, e) => s + e.amount, 0);
  const pendingReviewExpenses = expenses.filter(e => e.reviewStatus === "submitted").reduce((s, e) => s + e.amount, 0);
  const rejectedCount = expenses.filter(e => e.reviewStatus === "rejected").length;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Field operations overview for {new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-4 py-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Projects</CardTitle>
            <FolderGit2 className="w-4 h-4 text-primary shrink-0" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold">{activeProjects.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Across 3 states</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-4 py-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Area</CardTitle>
            <Map className="w-4 h-4 text-blue-500 shrink-0" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold">{totalArea.toFixed(1)} km²</div>
            <p className="text-xs text-muted-foreground mt-1">Across {projects.length} projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-4 py-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Equipment In Use</CardTitle>
            <Compass className="w-4 h-4 text-amber-500 shrink-0" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-1">Total stations, drones, scanners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-4 py-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Pending Billing</CardTitle>
            <Receipt className="w-4 h-4 text-green-500 shrink-0" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold">{formatCurrency(totalPending)}</div>
            <p className="text-xs text-muted-foreground mt-1">{invoices.filter(i => i.status === "Pending" || i.status === "Partial").length} invoices to be cleared</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-4 py-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Field Expenses</CardTitle>
            <Banknote className="w-4 h-4 text-amber-500 shrink-0" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground mt-1">{expenses.length} expense entries</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-4 py-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-green-700">Checked & Sent to Accounts</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold text-green-700">{formatCurrency(approvedExpenses)}</div>
            <p className="text-xs text-green-600 mt-1">{expenses.filter(e => e.reviewStatus === "approved").length} expenses approved by admin</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-4 py-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-red-700">Pending / Rejected</CardTitle>
            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold text-red-700">{formatCurrency(pendingReviewExpenses)}</div>
            <p className="text-xs text-red-600 mt-1">{expenses.filter(e => e.reviewStatus === "submitted").length} pending review, {rejectedCount} rejected</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Recent Projects</h2>
            <Link href="/projects" className="text-xs sm:text-sm text-primary hover:underline font-medium inline-flex items-center">
              View all
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid gap-3 sm:gap-4">
            {recentProjects.map(project => (
              <Card key={project.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/projects/${project.id}`} className="font-semibold text-sm sm:text-lg hover:underline leading-tight">
                          {project.name}
                        </Link>
                        <StatusBadge status={project.status} />
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 sm:gap-3 flex-wrap">
                        <span className="font-medium text-foreground">{project.projectId}</span>
                        <span className="hidden xs:inline">&bull;</span>
                        <span className="truncate">{project.client}</span>
                        <span className="hidden xs:inline">&bull;</span>
                        <span className="truncate">{project.location}, {project.state}</span>
                      </div>
                    </div>
                    
                    <div className="w-full sm:w-48 md:w-64 space-y-1.5 sm:space-y-2 shrink-0">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Active Banner</h2>
          <Card className="bg-primary text-primary-foreground border-none">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="text-primary-foreground/80 text-xs font-medium uppercase tracking-wider">Active Projects ({activeProjects.length})</div>
              {activeProjects.length > 0 ? (
                <ul className="space-y-3">
                  {activeProjects.map((p) => (
                    <li key={p.id} className="border-b border-primary-foreground/10 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <Link href={`/projects/${p.id}`} className="font-semibold text-xs sm:text-sm hover:underline leading-tight">
                          {p.name}
                        </Link>
                        <span className="text-xs font-semibold tabular-nums text-primary-foreground/80 shrink-0">{p.progress}%</span>
                      </div>
                      <Progress value={p.progress} className="h-1.5 bg-primary-foreground/20 [&>div]:bg-primary-foreground mb-1.5" />
                      <div className="flex items-center justify-between text-[11px] text-primary-foreground/70">
                        <span>{p.client}</span>
                        <span>{p.projectManager}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-primary-foreground/70">No active projects</p>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
