import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status, className }: { status: string, className?: string }) {
  let colorClass = "";
  
  switch (status) {
    case "Active":
    case "In Use":
    case "Paid":
      colorClass = "bg-green-500/10 text-green-700 hover:bg-green-500/20";
      break;
    case "Completed":
      colorClass = "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20";
      break;
    case "Planning":
    case "Available":
      colorClass = "bg-blue-300/10 text-blue-600 hover:bg-blue-300/20";
      break;
    case "On Hold":
    case "Maintenance":
      colorClass = "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20";
      break;
    case "Quotation Sent":
      colorClass = "bg-purple-500/10 text-purple-700 hover:bg-purple-500/20";
      break;
    case "Partial":
      colorClass = "bg-orange-500/10 text-orange-700 hover:bg-orange-500/20";
      break;
    case "Pending":
      colorClass = "bg-red-500/10 text-red-700 hover:bg-red-500/20";
      break;
    case "Not Raised":
      colorClass = "bg-gray-500/10 text-gray-700 hover:bg-gray-500/20";
      break;
    default:
      colorClass = "bg-gray-500/10 text-gray-700 hover:bg-gray-500/20";
  }

  return (
    <Badge variant="outline" className={`border-none font-medium ${colorClass} ${className}`}>
      {status}
    </Badge>
  );
}
