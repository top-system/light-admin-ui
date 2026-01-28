import request from "@/utils/request";

const TASK_BASE_URL = "/api/v1/tasks";

export interface TaskItem {
  id: number;
  type: string;
  status: string;
  correlationId: string;
  ownerId: number;
  retryCount: number;
  executedDuration: number;
  error: string;
  errorHistory: string;
  resumeTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskQueryParams {
  pageNum?: number;
  pageSize?: number;
  keywords?: string;
  type?: string;
  status?: string;
  correlationId?: string;
  "createdAt[0]"?: string;
  "createdAt[1]"?: string;
}

export interface TaskStatsVO {
  busyWorkers: number;
  successTasks: number;
  failureTasks: number;
  submittedTasks: number;
  suspendingTasks: number;
  queuedCount: number;
  processingCount: number;
  completedCount: number;
  errorCount: number;
  canceledCount: number;
}

export interface TaskTypeVO {
  label: string;
  value: string;
}

const QueueAPI = {
  /**
   * 获取任务分页列表
   *
   * @param queryParams 查询参数
   */
  getPage(queryParams: TaskQueryParams) {
    return request<any, PageResult<TaskItem>>({
      url: `${TASK_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 获取任务详情
   *
   * @param id 任务ID
   */
  get(id: number) {
    return request<any, TaskItem>({
      url: `${TASK_BASE_URL}/${id}`,
      method: "get",
    });
  },

  /**
   * 批量删除任务
   *
   * @param ids 任务ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${TASK_BASE_URL}/${ids}`,
      method: "delete",
    });
  },

  /**
   * 获取队列统计信息
   */
  getStats() {
    return request<any, TaskStatsVO>({
      url: `${TASK_BASE_URL}/stats`,
      method: "get",
    });
  },

  /**
   * 获取任务类型列表
   */
  getTypes() {
    return request<any, TaskTypeVO[]>({
      url: `${TASK_BASE_URL}/types`,
      method: "get",
    });
  },
};

export default QueueAPI;
