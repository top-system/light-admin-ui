import request from "@/utils/request";

const DOWNLOAD_BASE_URL = "/api/v1/downloads";

export interface DownloadTaskItem {
  id: number;
  taskId: string;
  hash: string;
  name: string;
  url: string;
  downloader: string;
  status: string;
  total: number;
  downloaded: number;
  downloadSpeed: number;
  uploaded: number;
  uploadSpeed: number;
  savePath: string;
  errorMessage: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface DownloadTaskQueryParams {
  pageNum?: number;
  pageSize?: number;
  keywords?: string;
  status?: string;
  downloader?: string;
  "createdAt[0]"?: string;
  "createdAt[1]"?: string;
}

export interface DownloadTaskStatsVO {
  downloadingCount: number;
  seedingCount: number;
  completedCount: number;
  errorCount: number;
  totalCount: number;
}

export interface DownloadTaskFileVO {
  index: number;
  name: string;
  size: number;
  progress: number;
  selected: boolean;
}

export interface DownloadTaskDetailVO extends DownloadTaskItem {
  files: DownloadTaskFileVO[];
}

export interface DownloadTaskCreateForm {
  url: string;
  downloader: string;
  options?: Record<string, any>;
}

export interface DownloaderOption {
  label: string;
  value: string;
}

const DownloaderAPI = {
  /**
   * 获取下载任务分页列表
   *
   * @param queryParams 查询参数
   */
  getPage(queryParams: DownloadTaskQueryParams) {
    return request<any, PageResult<DownloadTaskItem>>({
      url: `${DOWNLOAD_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 获取下载任务详情
   *
   * @param id 任务ID
   */
  get(id: number) {
    return request<any, DownloadTaskDetailVO>({
      url: `${DOWNLOAD_BASE_URL}/${id}`,
      method: "get",
    });
  },

  /**
   * 创建下载任务
   *
   * @param data 任务表单数据
   */
  create(data: DownloadTaskCreateForm) {
    return request<any, DownloadTaskItem>({
      url: `${DOWNLOAD_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 取消下载任务
   *
   * @param id 任务ID
   */
  cancel(id: number) {
    return request({
      url: `${DOWNLOAD_BASE_URL}/${id}/cancel`,
      method: "post",
    });
  },

  /**
   * 设置要下载的文件
   *
   * @param id 任务ID
   * @param files 文件设置
   */
  setFiles(id: number, files: { index: number; download: boolean }[]) {
    return request({
      url: `${DOWNLOAD_BASE_URL}/${id}/files`,
      method: "put",
      data: { files },
    });
  },

  /**
   * 同步任务状态
   *
   * @param id 任务ID
   */
  sync(id: number) {
    return request({
      url: `${DOWNLOAD_BASE_URL}/${id}/sync`,
      method: "post",
    });
  },

  /**
   * 批量删除下载任务
   *
   * @param ids 任务ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${DOWNLOAD_BASE_URL}/${ids}`,
      method: "delete",
    });
  },

  /**
   * 获取下载统计信息
   */
  getStats() {
    return request<any, DownloadTaskStatsVO>({
      url: `${DOWNLOAD_BASE_URL}/stats`,
      method: "get",
    });
  },

  /**
   * 获取可用下载器列表
   */
  getDownloaders() {
    return request<any, DownloaderOption[]>({
      url: `${DOWNLOAD_BASE_URL}/downloaders`,
      method: "get",
    });
  },

  /**
   * 测试下载器连接
   *
   * @param name 下载器名称
   */
  testDownloader(name: string) {
    return request<any, { version: string }>({
      url: `${DOWNLOAD_BASE_URL}/test/${name}`,
      method: "get",
    });
  },
};

export default DownloaderAPI;
