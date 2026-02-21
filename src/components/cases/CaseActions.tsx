"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { MoreHorizontal, Scale, FileText, Eye } from "lucide-react";

interface CaseActionsProps {
  caseId: string;
  status: string;
}

export function CaseActions({ caseId, status }: CaseActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestLawyer = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    try {
      const response = await fetch(`/api/cases/${caseId}/request-lawyer`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Your case has been forwarded for lawyer review!");
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to forward case. Please try again.");
      }
    } catch {
      toast.error("Failed to forward case. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const canRequestLawyer = !["lawyer_requested", "lawyer_assigned", "closed", "filed"].includes(status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            router.push(`/cases/${caseId}`);
          }}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            router.push(`/cases/${caseId}?generate=true`);
          }}
        >
          <FileText className="h-4 w-4 mr-2" />
          Generate Documents
        </DropdownMenuItem>
        {canRequestLawyer && (
          <DropdownMenuItem
            onClick={handleRequestLawyer}
            disabled={isLoading}
            className="text-purple-700 focus:text-purple-800 focus:bg-purple-50"
          >
            <Scale className="h-4 w-4 mr-2" />
            {isLoading ? "Forwarding..." : "Forward to Lawyer"}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
