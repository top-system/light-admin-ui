import QueueAPI from "@/api/queue";
import type { Ref } from "vue";

// 状态选项
export const statusOptions = [
  { label: "等待中", value: "queued" },
  { label: "处理中", value: "processing" },
  { label: "已完成", value: "completed" },
  { label: "错误", value: "error" },
  { label: "已取消", value: "canceled" },
  { label: "暂停中", value: "suspending" },
];

// 状态标签类型映射
export const statusTagType: Record<string, string> = {
  queued: "info",
  processing: "primary",
  completed: "success",
  error: "danger",
  canceled: "warning",
  suspending: "warning",
};

// 状态标签文字映射
export const statusLabel: Record<string, string> = {
  queued: "等待中",
  processing: "处理中",
  completed: "已完成",
  error: "错误",
  canceled: "已取消",
  suspending: "暂停中",
};

// 任务类型选项 (动态加载)
export const taskTypeOptions: Ref<{ label: string; value: string }[]> = ref([]);

// 初始化选项数据
export async function initOptions() {
  try {
    const types = await QueueAPI.getTypes();
    taskTypeOptions.value = types || [];
  } catch (error) {
    console.error("Failed to load task types:", error);
    taskTypeOptions.value = [];
  }
}
