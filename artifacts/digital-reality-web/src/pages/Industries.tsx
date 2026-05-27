import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { Building2, Train, Route, TramFront, Clock, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface IndustryConfig {
  id: string;
  name: string;
  icon: typeof Building2;
  color: string;
  gradient: string;
  lightBg: string;
  badgeColor: string;
  animationDelay: string;
  clients: string[];
}

const industries: IndustryConfig[] = [
  {
    id: "railways",
    name: "Railways",
    icon: Train,
    color: "text-blue-600",
    gradient: "from-blue-900 to-blue-700",
    lightBg: "bg-blue-50",
    badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
    animationDelay: "0s",
    clients: ["South Central Railway", "Indian Railways", "SCR", "Indian Railway", "Railway"],
  },
  {
    id: "highways",
    name: "Highways",
    icon: Route,
    color: "text-orange-600",
    gradient: "from-orange-700 to-orange-500",
    lightBg: "bg-orange-50",
    badgeColor: "bg-orange-100 text-orange-700 border-orange-200",
    animationDelay: "0.15s",
    clients: ["NHAI", "Highway"],
  },
  {
    id: "metro",
    name: "Metro",
    icon: TramFront,
    color: "text-teal-600",
    gradient: "from-teal-700 to-teal-500",
    lightBg: "bg-teal-50",
    badgeColor: "bg-teal-100 text-teal-700 border-teal-200",
    animationDelay: "0.3s",
    clients: ["CMRL", "Metro"],
  },
];

function matchesClient(client: string, clients: string[]): boolean {
  if (!client) return false;
  const c = client.toLowerCase();
  return clients.some(cl => c.includes(cl.toLowerCase()));
}

function getIndustryStats(projects: any[], industry: IndustryConfig) {
  const filtered = projects.filter(p => matchesClient(p.client, industry.clients));
  const totalValue = filtered.reduce((sum, p) => sum + p.poValue, 0);
  const active = filtered.filter(p => p.status === "Active");
  const completed = filtered.filter(p => p.status === "Completed");
  const planning = filtered.filter(p => p.status === "Planning");
  const onHold = filtered.filter(p => p.status === "On Hold");
  const avgProgress = filtered.length
    ? Math.round(filtered.reduce((sum, p) => sum + p.progress, 0) / filtered.length)
    : 0;
  return { projects: filtered, totalValue, active, completed, planning, onHold, avgProgress };
}

export default function Industries() {
  const { projects } = useApp();
  const pipelineProjects = projects.filter(p => {
    if (p.status !== "Planning" && p.status !== "On Hold") return false;
    return !industries.some(ind => matchesClient(p.client, ind.clients));
  });
  const pipelineValue = pipelineProjects.reduce((sum, p) => sum + p.poValue, 0);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Industries</h1>
        <p className="text-sm text-muted-foreground mt-1">Big industry segments we serve</p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {industries.map((industry) => {
          const stats = getIndustryStats(projects, industry);
          const Icon = industry.icon;
          return (
            <div
              key={industry.id}
              className="animate-slide-up group"
              style={{ animationDelay: industry.animationDelay }}
            >
              <Card className="overflow-hidden border-0 shadow-md h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className={`h-2 bg-gradient-to-r ${industry.gradient}`} />
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${industry.lightBg} transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className={`w-5 h-5 ${industry.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{industry.name}</h3>
                      <p className="text-xs text-muted-foreground">{stats.projects.length} projects</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold">{stats.active.length}</p>
                      <p className="text-[10px] text-muted-foreground">Active</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold">{stats.planning.length}</p>
                      <p className="text-[10px] text-muted-foreground">Planning</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold">{stats.onHold.length}</p>
                      <p className="text-[10px] text-muted-foreground">On Hold</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold">{stats.completed.length}</p>
                      <p className="text-[10px] text-muted-foreground">Done</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Overall Progress</span>
                      <span className="font-semibold">{stats.avgProgress}%</span>
                    </div>
                    <Progress value={stats.avgProgress} className={`h-2.5 transition-all duration-700 [&>div]:bg-gradient-to-r ${industry.gradient}`} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Total Value</p>
                      <p className="font-bold text-base">{formatCurrency(stats.totalValue)}</p>
                    </div>
                    <Badge variant="outline" className={industry.badgeColor}>
                      {industry.clients.length} client{industry.clients.length > 1 ? "s" : ""}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {industry.clients.map((client) => (
                      <span key={client} className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                        {client}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}

        {/* In Pipeline card */}
        <div className="animate-slide-up group" style={{ animationDelay: "0.45s" }}>
          <Card className="overflow-hidden border-0 shadow-md h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="h-2 bg-gradient-to-r from-amber-600 to-amber-400" />
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 transition-transform duration-300 group-hover:scale-110">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">In Pipeline</h3>
                  <p className="text-xs text-muted-foreground">{pipelineProjects.length} projects</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold">{pipelineProjects.filter(p => p.status === "Active").length}</p>
                  <p className="text-[10px] text-muted-foreground">Active</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold">{pipelineProjects.filter(p => p.status === "Planning").length}</p>
                  <p className="text-[10px] text-muted-foreground">Planning</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold">{pipelineProjects.filter(p => p.status === "On Hold").length}</p>
                  <p className="text-[10px] text-muted-foreground">On Hold</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold">{pipelineProjects.filter(p => p.status === "Completed").length}</p>
                  <p className="text-[10px] text-muted-foreground">Done</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Value</span>
                  <span className="font-semibold">{formatCurrency(pipelineValue)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted" />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-[11px] text-muted-foreground">Total Area</p>
                  <p className="font-bold text-base">{pipelineProjects.reduce((s, p) => s + (p.areaSqKm || 0), 0).toFixed(1)} km²</p>
                </div>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {pipelineProjects.length} project{pipelineProjects.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="animate-slide-up" style={{ animationDelay: "0.45s" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Industry Projects</h2>
        </div>

        <div className="space-y-3">
          {projects.map((project, idx) => {
            const industry = industries.find(ind => matchesClient(project.client, ind.clients));
            const isPipeline = project.status === "Planning" || project.status === "On Hold";
            if (!industry && !isPipeline) return null;
            const Icon = industry?.icon || Clock;
            const indColor = industry?.color || "text-amber-600";
            const indLightBg = industry?.lightBg || "bg-amber-50";
            const indBadgeColor = industry?.badgeColor || "bg-amber-100 text-amber-700 border-amber-200";
            const indName = industry?.name || "Pipeline";
            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card
                  className="hover:border-primary/50 transition-all duration-300 cursor-pointer animate-slide-up group"
                  style={{ animationDelay: `${0.5 + idx * 0.05}s` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${indLightBg} transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className={`w-4 h-4 ${indColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-sm truncate">{project.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${indBadgeColor}`}>
                            {indName}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{project.client}</span>
                          <span>&bull;</span>
                          <span>{project.location}, {project.state}</span>
                          <span>&bull;</span>
                          <span>{formatCurrency(project.poValue)}</span>
                        </div>
                      </div>
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-1.5" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-slide-up {
          opacity: 0;
          animation: slide-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
