import { CheckCircle2 } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ActionItem } from "@/lib/types";

interface ActionItemsProps {
  items: ActionItem[];
}

export function ActionItems({ items }: ActionItemsProps) {
  return (
    <Card className="space-y-4">
      <div>
        <CardTitle>Action Items</CardTitle>
        <CardDescription>Assigned tasks extracted by Claude from your meeting transcript.</CardDescription>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-400">No explicit action items were detected in this meeting.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={`${item.owner}-${item.task}-${index}`} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-slate-100">
                <CheckCircle2 className="size-4 text-emerald-400" />
                {item.task}
              </p>
              <p className="mt-2 text-sm text-slate-300">Owner: {item.owner}</p>
              <p className="text-sm text-slate-400">
                Priority: {item.priority.toUpperCase()}
                {item.dueDate ? ` · Due ${item.dueDate}` : " · No due date specified"}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
