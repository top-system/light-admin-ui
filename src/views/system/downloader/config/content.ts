import DownloaderAPI from "@/api/downloader";
import type { DownloadTaskQueryParams, DownloadTaskItem } from "@/api/downloader";
import type { IContentConfig } from "@/components/CURD/types";

const contentConfig: IContentConfig<DownloadTaskQueryParams, DownloadTaskItem> = {
  permPrefix: "sys:download",
  table: {
    border: true,
    highlightCurrentRow: true,
  },
  pagination: {
    background: true,
    layout: "prev,pager,next,jumper,total,sizes",
    pageSize: 20,
    pageSizes: [10, 20, 30, 50],
  },
  indexAction(params) {
    return DownloaderAPI.getPage(params);
  },
  deleteAction: DownloaderAPI.deleteByIds,
  pk: "id",
  toolbar: ["add", "delete"],
  defaultToolbar: ["refresh", "filter", "search"],
  cols: [
    { type: "selection", width: 50, align: "center" },
    { label: "ID", align: "center", prop: "id", width: 70, show: false },
    {
      label: "任务名称",
      align: "left",
      prop: "name",
      minWidth: 200,
      templet: "custom",
      slotName: "name",
    },
    {
      label: "状态",
      align: "center",
      prop: "status",
      width: 90,
      templet: "custom",
      slotName: "status",
    },
    {
      label: "进度",
      align: "center",
      prop: "progress",
      width: 150,
      templet: "custom",
      slotName: "progress",
    },
    {
      label: "大小",
      align: "center",
      prop: "total",
      width: 100,
      templet: "custom",
      slotName: "size",
    },
    {
      label: "下载速度",
      align: "center",
      prop: "downloadSpeed",
      width: 100,
      templet: "custom",
      slotName: "downloadSpeed",
    },
    {
      label: "上传速度",
      align: "center",
      prop: "uploadSpeed",
      width: 100,
      templet: "custom",
      slotName: "uploadSpeed",
    },
    {
      label: "下载器",
      align: "center",
      prop: "downloader",
      width: 100,
    },
    {
      label: "创建时间",
      align: "center",
      prop: "createdAt",
      width: 170,
    },
    {
      label: "操作",
      align: "center",
      fixed: "right",
      width: 200,
      templet: "tool",
      operat: [
        {
          name: "detail",
          text: "详情",
          attrs: { icon: "Document", type: "primary" },
        },
        {
          name: "sync",
          text: "同步",
          attrs: { icon: "Refresh" },
        },
        {
          name: "cancel",
          text: "取消",
          attrs: { icon: "CircleClose", type: "warning" },
        },
        "delete",
      ],
    },
  ],
};

export default contentConfig;
