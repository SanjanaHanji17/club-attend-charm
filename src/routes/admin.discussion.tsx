import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/DashShell";
import { AuthGate } from "@/components/AuthGate";
import { DiscussionBoard } from "@/components/DiscussionBoard";

export const Route = createFileRoute("/admin/discussion")({
  component: () => <AuthGate role="admin"><DashShell><DiscussionBoard /></DashShell></AuthGate>,
});
