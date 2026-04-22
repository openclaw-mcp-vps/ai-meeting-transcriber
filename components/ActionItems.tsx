import type { ActionItem } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function priorityTone(priority: ActionItem["priority"]): "default" | "positive" | "negative" {
  if (priority === "high") {
    return "negative";
  }

  if (priority === "low") {
    return "positive";
  }

  return "default";
}

export default function ActionItems({
  summary,
  keyDecisions,
  actionItems,
}: {
  summary: string;
  keyDecisions: string[];
  actionItems: ActionItem[];
}) {
  return (
    <Card className="border-slate-800 bg-slate-900/70">
      <CardHeader>
        <CardTitle>Action Items</CardTitle>
        <CardDescription>{summary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Key Decisions</h4>
          {keyDecisions.length > 0 ? (
            <ul className="space-y-2">
              {keyDecisions.map((decision, index) => (
                <li key={`${decision}-${index}`} className="rounded-md border border-slate-800 px-3 py-2 text-sm">
                  {decision}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No explicit decisions were captured in this discussion.</p>
          )}
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Assigned Tasks</h4>
          {actionItems.length > 0 ? (
            <div className="space-y-3">
              {actionItems.map((item, index) => (
                <article key={`${item.task}-${index}`} className="rounded-lg border border-slate-800 p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-200">{item.assignee}</p>
                    <Badge tone={priorityTone(item.priority)}>{item.priority}</Badge>
                    {item.dueDate ? <Badge tone="neutral">Due {item.dueDate}</Badge> : null}
                  </div>
                  <p className="text-sm text-slate-300">{item.task}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              No direct assignments were found. Confirm owners and deadlines manually before sharing.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
