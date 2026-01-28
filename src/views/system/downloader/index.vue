<template>
  <div class="app-container h-full flex flex-1 flex-col">
    <!-- 统计卡片 -->
    <el-row :gutter="16" class="mb-16">
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-value downloading">{{ stats.downloadingCount }}</div>
            <div class="stat-label">下载中</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-value seeding">{{ stats.seedingCount }}</div>
            <div class="stat-label">做种中</div>
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
            <div class="stat-value total">{{ stats.totalCount }}</div>
            <div class="stat-label">总计</div>
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
      @add-click="handleAddClick"
      @search-click="handleSearchClick"
      @operate-click="handleOperateClick"
      @filter-change="handleFilterChange"
    >
      <!-- 任务名称列 -->
      <template #name="scope">
        <div class="task-name">
          <el-tooltip :content="scope.row.name || scope.row.url" placement="top" :show-after="500">
            <el-text truncated>{{ scope.row.name || scope.row.url }}</el-text>
          </el-tooltip>
        </div>
      </template>

      <!-- 状态列 -->
      <template #status="scope">
        <el-tag :type="getStatusTagType(scope.row[scope.prop])" size="small">
          {{ getStatusLabel(scope.row[scope.prop]) }}
        </el-tag>
      </template>

      <!-- 进度列 -->
      <template #progress="scope">
        <el-progress
          :percentage="Math.min(scope.row.progress, 100)"
          :status="getProgressStatus(scope.row.status)"
          :stroke-width="12"
          :text-inside="true"
        />
      </template>

      <!-- 大小列 -->
      <template #size="scope">
        <span>{{ formatFileSize(scope.row.total) }}</span>
      </template>

      <!-- 下载速度列 -->
      <template #downloadSpeed="scope">
        <span :class="{ 'speed-active': scope.row.downloadSpeed > 0 }">
          {{ formatSpeed(scope.row.downloadSpeed) }}
        </span>
      </template>

      <!-- 上传速度列 -->
      <template #uploadSpeed="scope">
        <span :class="{ 'speed-active': scope.row.uploadSpeed > 0 }">
          {{ formatSpeed(scope.row.uploadSpeed) }}
        </span>
      </template>
    </page-content>

    <!-- 新增弹窗 -->
    <el-dialog v-model="addVisible" title="新建下载任务" width="600px" destroy-on-close>
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="100px">
        <el-form-item label="下载链接" prop="url">
          <el-input
            v-model="addForm.url"
            type="textarea"
            :rows="3"
            placeholder="请输入下载链接（支持HTTP/HTTPS/FTP/磁力链接/种子文件URL）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" :loading="addLoading" @click="handleCreate">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="任务详情" width="800px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="任务ID">{{ detailData?.id }}</el-descriptions-item>
        <el-descriptions-item label="下载器">{{ detailData?.downloader }}</el-descriptions-item>
        <el-descriptions-item label="任务名称" :span="2">
          {{ detailData?.name }}
        </el-descriptions-item>
        <el-descriptions-item label="下载链接" :span="2">
          <el-text class="url-text" truncated>{{ detailData?.url }}</el-text>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(detailData?.status)">
            {{ getStatusLabel(detailData?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="进度">
          {{ detailData?.progress?.toFixed(2) }}%
        </el-descriptions-item>
        <el-descriptions-item label="总大小">
          {{ formatFileSize(detailData?.total || 0) }}
        </el-descriptions-item>
        <el-descriptions-item label="已下载">
          {{ formatFileSize(detailData?.downloaded || 0) }}
        </el-descriptions-item>
        <el-descriptions-item label="下载速度">
          {{ formatSpeed(detailData?.downloadSpeed || 0) }}
        </el-descriptions-item>
        <el-descriptions-item label="上传速度">
          {{ formatSpeed(detailData?.uploadSpeed || 0) }}
        </el-descriptions-item>
        <el-descriptions-item label="保存路径" :span="2">
          {{ detailData?.savePath || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="哈希值" :span="2">
          <span class="hash-text">{{ detailData?.hash || "-" }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData?.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detailData?.updatedAt }}</el-descriptions-item>
        <el-descriptions-item v-if="detailData?.errorMessage" label="错误信息" :span="2">
          <el-text type="danger">{{ detailData.errorMessage }}</el-text>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 文件列表 -->
      <div v-if="detailData?.files && detailData.files.length > 0" class="files-section">
        <h4>文件列表</h4>
        <el-table :data="detailData.files" border max-height="300">
          <el-table-column prop="name" label="文件名" min-width="200" />
          <el-table-column prop="size" label="大小" width="100" align="center">
            <template #default="{ row }">
              {{ formatFileSize(row.size) }}
            </template>
          </el-table-column>
          <el-table-column prop="progress" label="进度" width="100" align="center">
            <template #default="{ row }">{{ row.progress.toFixed(1) }}%</template>
          </el-table-column>
          <el-table-column prop="selected" label="已选择" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.selected ? 'success' : 'info'" size="small">
                {{ row.selected ? "是" : "否" }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import DownloaderAPI from "@/api/downloader";
import type { DownloadTaskDetailVO, DownloadTaskStatsVO } from "@/api/downloader";
import type { IObject } from "@/components/CURD/types";
import type { FormInstance, FormRules } from "element-plus";
import usePage from "@/components/CURD/usePage";
import contentConfig from "./config/content";
import searchConfig from "./config/search";
import { statusTagType, statusLabel, formatFileSize, formatSpeed } from "./config/options";

const {
  searchRef,
  contentRef,
  handleQueryClick,
  handleResetClick,
  handleSearchClick,
  handleFilterChange,
} = usePage();

// 统计数据
const stats = ref<DownloadTaskStatsVO>({
  downloadingCount: 0,
  seedingCount: 0,
  completedCount: 0,
  errorCount: 0,
  totalCount: 0,
});

// 新增弹窗
const addVisible = ref(false);
const addLoading = ref(false);
const addFormRef = ref<FormInstance>();
const addForm = ref({
  url: "",
});
const addRules: FormRules = {
  url: [{ required: true, message: "请输入下载链接", trigger: "blur" }],
};

// 详情弹窗
const detailVisible = ref(false);
const detailData = ref<DownloadTaskDetailVO | null>(null);

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

// 获取进度条状态
function getProgressStatus(status: string): "" | "success" | "exception" | "warning" {
  if (status === "completed" || status === "seeding") return "success";
  if (status === "error") return "exception";
  if (status === "canceled") return "warning";
  return "";
}

// 加载统计数据
async function loadStats() {
  try {
    const data = await DownloaderAPI.getStats();
    stats.value = data;
  } catch (error) {
    console.error("Failed to load stats:", error);
  }
}

// 打开新增弹窗
function handleAddClick() {
  addForm.value = { url: "" };
  addVisible.value = true;
}

// 创建下载任务
async function handleCreate() {
  if (!addFormRef.value) return;

  await addFormRef.value.validate(async (valid) => {
    if (!valid) return;

    addLoading.value = true;
    try {
      await DownloaderAPI.create(addForm.value);
      ElMessage.success("下载任务创建成功");
      addVisible.value = false;
      // 刷新列表和统计
      contentRef.value?.fetchPageData();
      loadStats();
    } catch (error: any) {
      ElMessage.error(error.message || "创建失败");
    } finally {
      addLoading.value = false;
    }
  });
}

// 表格工具操作
const handleOperateClick = async (data: IObject) => {
  if (data.name === "detail") {
    try {
      const detail = await DownloaderAPI.get(data.row.id);
      detailData.value = detail;
      detailVisible.value = true;
    } catch {
      ElMessage.error("获取任务详情失败");
    }
  } else if (data.name === "sync") {
    try {
      await DownloaderAPI.sync(data.row.id);
      ElMessage.success("同步成功");
      contentRef.value?.fetchPageData();
      loadStats();
    } catch (error: any) {
      ElMessage.error(error.message || "同步失败");
    }
  } else if (data.name === "cancel") {
    ElMessageBox.confirm("确定要取消该下载任务吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(async () => {
        try {
          await DownloaderAPI.cancel(data.row.id);
          ElMessage.success("任务已取消");
          contentRef.value?.fetchPageData();
          loadStats();
        } catch (error: any) {
          ElMessage.error(error.message || "取消失败");
        }
      })
      .catch(() => {});
  }
};

// 定时刷新统计数据和列表
let refreshTimer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  loadStats();

  // 每10秒刷新一次（下载任务需要更频繁的刷新）
  refreshTimer = setInterval(() => {
    loadStats();
    // 只在有活跃任务时刷新列表
    if (stats.value.downloadingCount > 0 || stats.value.seedingCount > 0) {
      contentRef.value?.fetchPageData();
    }
  }, 10000);
});

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
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

  &.downloading {
    color: #409eff;
  }

  &.seeding {
    color: #67c23a;
  }

  &.completed {
    color: #67c23a;
  }

  &.error {
    color: #f56c6c;
  }

  &.total {
    color: #606266;
  }
}

.stat-label {
  margin-top: 4px;
  font-size: 14px;
  color: #606266;
}

.task-name {
  max-width: 100%;
  overflow: hidden;
}

.speed-active {
  font-weight: 500;
  color: #409eff;
}

.url-text {
  max-width: 100%;
  word-break: break-all;
}

.hash-text {
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
}

.files-section {
  margin-top: 20px;

  h4 {
    margin-bottom: 10px;
    font-size: 14px;
    color: #303133;
  }
}

.mb-16 {
  margin-bottom: 16px;
}
</style>
