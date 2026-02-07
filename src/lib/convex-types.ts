import { Doc, Id } from '../../convex/_generated/dataModel';

// Re-export Convex document types for use in components
export type ConvexAgent = Doc<'agents'>;
export type ConvexTask = Doc<'tasks'>;
export type ConvexActivity = Doc<'activities'>;

// Enriched types returned by queries
export type ConvexTaskWithAssignees = ConvexTask & {
  assignees: ConvexAgent[];
};

export type ConvexActivityWithRelations = ConvexActivity & {
  agent: ConvexAgent | null;
  task: ConvexTask | null;
};

// ID types
export type AgentId = Id<'agents'>;
export type TaskId = Id<'tasks'>;
