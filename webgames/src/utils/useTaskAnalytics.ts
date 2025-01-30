import { useEffect, useState } from "react";
import { recordTaskCompletion, recordTaskView } from "./analytics";

export function useTaskAnalytics(taskId: string): {
  recordSuccess: () => Promise<void>;
} {
  const [startTime] = useState(Date.now());

  useEffect(() => {
    recordTaskView(taskId, Date.now());
  }, [taskId]);

  const recordSuccess = async () => {
    await recordTaskCompletion(taskId, Date.now(), startTime);
  };

  return { recordSuccess };
}
