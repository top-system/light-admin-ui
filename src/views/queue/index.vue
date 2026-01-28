<template>
  <div class="app-container h-full flex flex-1 flex-col">
    <!-- 统计卡片 -->
    <el-row :gutter="16" class="mb-16">
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-value queued">{{ stats.queuedCount }}</div>
            <div class="stat-label">等待中</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-value processing">{{ stats.processingCount }}</div>
            <div class="stat-label">处理中</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-value completed">{{ stats.completedCount }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-value error">{{ stats.errorCount }}</div>
            <div class="stat-label">错误</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-value canceled">{{ stats.canceledCount }}</div>
            <div class="stat-label">已取消</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-value suspending">{{ stats.suspendingTasks }}</div>
            <div class="stat-label">暂停中</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索 -->
    <page-search
      ref="searchRef"
      :search-config="searchConfig"
      @query-click="handleQueryClick"
      @reset-click="handleResetClick"
    />

    <!-- 列表 -->
    <page-content
      ref="contentRef"
      :content-config="contentConfig"
      @search-click="handleSearchClick"
      @operate-click="handleOperateClick"
      @filter-change="handleFilterChange"
    >
      <!-- 状态列 -->
      <template #status="scope">
        <el-tag :type="getStatusTagType(scope.row[scope.prop])">
          {{ getStatusLabel(scope.row[scope.prop]) }}
        </el-tag>
      </template>

      <!-- 关联ID列 -->
      <template #correlationId="scope">
        <el-text class="correlation-id">{{ scope.row[scope.prop] }}</el-text>
        <copy-button
          v-if="scope.row[scope.prop]"
          :text="scope.row[scope.prop]"
          :style="{ marginLeft: '4px' }"
        />
      </template>

      <!-- 执行时长列 -->
      <template #duration="scope">
        <span>{{ formatDuration(scope.row[scope.prop]) }}</span>
      </template>

      <!-- 错误信息列 -->
      <template #error="scope">
        <el-tooltip
          v-if="scope.row[scope.prop]"
          :content="scope.row[scope.prop]"
          placement="top"
          :show-after="500"
        >
          <el-text type="danger" class="error-text" truncated>
            {{ scope.row[scope.prop] }}
          </el-text>
        </el-tooltip>
        <span v-else>-</span>
      </template>
    </page-content>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="任务详情" width="700px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="任务ID">{{ detailData?.id }}</el-descriptions-item>
        <el-descriptions-item label="任务类型">{{ detailData?.type }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(detailData?.status)">
            {{ getStatusLabel(detailData?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="重试次数">{{ detailData?.retryCount }}</el-descriptions-item>
        <el-descriptions-item label="关联ID" :span="2">
          <span class="correlation-id">{{ detailData?.correlationId }}</span>
          <copy-button
            v-if="detailData?.correlationId"
            :text="detailData?.correlationId"
            :style="{ marginLeft: '4px' }"
          />
        </el-descriptions-item>
        <el-descriptions-item label="执行时长">
          {{ formatDuration(detailData?.executedDuration) }}
        </el-descriptions-item>
        <el-descriptions-item label="恢复时间">
          {{ detailData?.resumeTime ? formatTimestamp(detailData?.resumeTime) : "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData?.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detailData?.updatedAt }}</el-descriptions-item>
        <el-descriptions-item label="错误信息" :span="2">
          <el-text v-if="detailData?.error" type="danger">{{ detailData?.error }}</el-text>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="错误历史" :span="2">
          <div v-if="detailData?.errorHistory" class="error-history">
            {{ detailData?.errorHistory }}
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import QueueAPI from "@/api/queue";
import type { TaskItem, TaskStatsVO } from "@/api/queue";
import type { IObject } from "@/components/CURD/types";
import usePage from "@/components/CURD/usePage";
import contentConfig from "./config/content";
import searchConfig from "./config/search";
import { statusTagType, statusLabel, initOptions } from "./config/options";

const {
  searchRef,
  contentRef,
  handleQueryClick,
  handleResetClick,
  handleSearchClick,
  handleFilterChange,
} = usePage();

// 统计数据
const stats = ref<TaskStatsVO>({
  busyWorkers: 0,
  successTasks: 0,
  failureTasks: 0,
  submittedTasks: 0,
  suspendingTasks: 0,
  queuedCount: 0,
  processingCount: 0,
  completedCount: 0,
  errorCount: 0,
  canceledCount: 0,
});

// 详情弹窗
const detailVisible = ref(false);
const detailData = ref<TaskItem | null>(null);

// 获取状态标签类型
function getStatusTagType(status: string | undefined): string {
  if (!status) return "info";
  return (statusTagType[status] as any) || "info";
}

// 获取状态标签文字
function getStatusLabel(status: string | undefined): string {
  if (!status) return "-";
  return statusLabel[status] || status;
}

// 格式化执行时长 (纳秒转换为可读格式)
function formatDuration(duration: number | undefined): string {
  if (!duration) return "-";

  // duration 是纳秒
  const ms = duration / 1000000;
  if (ms < 1000) {
    return `${ms.toFixed(0)}ms`;
  }

  const seconds = ms / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }

  const minutes = seconds / 60;
  if (minutes < 60) {
    return `${minutes.toFixed(1)}m`;
  }

  const hours = minutes / 60;
  return `${hours.toFixed(1)}h`;
}

// 格式化时间戳
function formatTimestamp(timestamp: number | undefined): string {
  if (!timestamp) return "-";
  const date = new Date(timestamp * 1000);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// 加载统计数据
async function loadStats() {
  try {
    const data = await QueueAPI.getStats();
    stats.value = data;
  } catch (error) {
    console.error("Failed to load stats:", error);
  }
}

// 表格工具操作
const handleOperateClick = async (data: IObject) => {
  if (data.name === "detail") {
    try {
      const task = await QueueAPI.get(data.row.id);
      detailData.value = task;
      detailVisible.value = true;
    } catch (error) {
      ElMessage.error("获取任务详情失败");
    }
  }
};

// 定时刷新统计数据
let statsTimer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  initOptions();
  loadStats();

  // 每30秒刷新一次统计数据
  statsTimer = setInterval(loadStats, 30000);
});

onUnmounted(() => {
  if (statsTimer) {
    clearInterval(statsTimer);
    statsTimer = null;
  }
});
</script>

<style scoped lang="scss">
.stat-card {
  :deep(.el-card__body) {
    padding: 16px;
  }
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  line-height: 1.2;

  &.queued {
    color: #909399;
  }

  &.processing {
    color: #409eff;
  }

  &.completed {
    color: #67c23a;
  }

  &.error {
    color: #f56c6c;
  }

  &.canceled {
    color: #e6a23c;
  }

  &.suspending {
    color: #e6a23c;
  }
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-top: 4px;
}

.correlation-id {
  font-family: monospace;
  font-size: 12px;
}

.error-text {
  max-width: 200px;
  display: inline-block;
}

.error-history {
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: monospace;
  font-size: 12px;
  background-color: #f5f7fa;
  padding: 8px;
  border-radius: 4px;
}

.mb-16 {
  margin-bottom: 16px;
}
</style>
