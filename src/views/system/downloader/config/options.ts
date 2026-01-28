import DownloaderAPI from "@/api/downloader";
import type { Ref } from "vue";

// 状态选项
export const statusOptions = [
  { label: "下载中", value: "downloading" },
  { label: "做种中", value: "seeding" },
  { label: "已完成", value: "completed" },
  { label: "错误", value: "error" },
  { label: "已取消", value: "canceled" },
  { label: "未知", value: "unknown" },
];

// 状态标签类型映射
export const statusTagType: Record<string, string> = {
  downloading: "primary",
  seeding: "success",
  completed: "success",
  error: "danger",
  canceled: "warning",
  unknown: "info",
};

// 状态标签文字映射
export const statusLabel: Record<string, string> = {
  downloading: "下载中",
  seeding: "做种中",
  completed: "已完成",
  error: "错误",
  canceled: "已取消",
  unknown: "未知",
};

// 下载器选项 (动态加载)
export const downloaderOptions: Ref<{ label: string; value: string }[]> = ref([]);

// 初始化选项数据
export async function initOptions() {
  try {
    const options = await DownloaderAPI.getDownloaders();
    downloaderOptions.value = options || [];
  } catch (error) {
    console.error("Failed to load downloader options:", error);
    downloaderOptions.value = [];
  }
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// 格式化速度
export function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond === 0) return "0 B/s";
  return formatFileSize(bytesPerSecond) + "/s";
}
