import type { ISearchConfig } from "@/components/CURD/types";
import { statusOptions, taskTypeOptions } from "./options";

const searchConfig: ISearchConfig = {
  permPrefix: "sys:task",
  formItems: [
    {
      tips: "支持模糊搜索",
      type: "input",
      label: "关键字",
      prop: "keywords",
      attrs: {
        placeholder: "类型/关联ID/错误信息",
        clearable: true,
        style: { width: "200px" },
      },
    },
    {
      type: "select",
      label: "任务类型",
      prop: "type",
      attrs: {
        placeholder: "全部",
        clearable: true,
        style: { width: "150px" },
      },
      options: taskTypeOptions,
    },
    {
      type: "select",
      label: "状态",
      prop: "status",
      attrs: {
        placeholder: "全部",
        clearable: true,
        style: { width: "120px" },
      },
      options: statusOptions,
    },
    {
      type: "input",
      label: "关联ID",
      prop: "correlationId",
      attrs: {
        placeholder: "UUID",
        clearable: true,
        style: { width: "200px" },
      },
    },
    {
      type: "date-picker",
      label: "创建时间",
      prop: "createdAt",
      attrs: {
        type: "daterange",
        "range-separator": "~",
        "start-placeholder": "开始时间",
        "end-placeholder": "截止时间",
        "value-format": "YYYY-MM-DD",
        style: { width: "240px" },
      },
    },
  ],
};

export default searchConfig;
