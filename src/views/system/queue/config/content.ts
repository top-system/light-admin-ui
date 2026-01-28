import QueueAPI from "@/api/queue";
import type { TaskQueryParams, TaskItem } from "@/api/queue";
import type { IContentConfig } from "@/components/CURD/types";

const contentConfig: IContentConfig<TaskQueryParams, TaskItem> = {
  permPrefix: "sys:task",
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
    return QueueAPI.getPage(params);
  },
  deleteAction: QueueAPI.deleteByIds,
  pk: "id",
  toolbar: ["delete"],
  defaultToolbar: ["refresh", "filter", "search"],
  cols: [
    { type: "selection", width: 50, align: "center" },
    { label: "ID", align: "center", prop: "id", width: 80 },
    { label: "任务类型", align: "center", prop: "type", width: 150 },
    {
      label: "状态",
      align: "center",
      prop: "status",
      width: 100,
      templet: "custom",
      slotName: "status",
    },
    {
      label: "关联ID",
      align: "left",
      prop: "correlationId",
      width: 320,
      templet: "custom",
      slotName: "correlationId",
    },
    {
      label: "重试次数",
      align: "center",
      prop: "retryCount",
      width: 90,
    },
    {
      label: "执行时长",
      align: "center",
      prop: "executedDuration",
      width: 100,
      templet: "custom",
      slotName: "duration",
    },
    {
      label: "错误信息",
      align: "left",
      prop: "error",
      minWidth: 200,
      templet: "custom",
      slotName: "error",
    },
    {
      label: "创建时间",
      align: "center",
      prop: "createdAt",
      width: 180,
    },
    {
      label: "更新时间",
      align: "center",
      prop: "updatedAt",
      width: 180,
    },
    {
      label: "操作",
      align: "center",
      fixed: "right",
      width: 120,
      templet: "tool",
      operat: [
        {
          name: "detail",
          text: "详情",
          attrs: { icon: "Document", type: "primary" },
        },
        "delete",
      ],
    },
  ],
};

export default contentConfig;
