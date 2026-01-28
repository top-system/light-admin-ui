import type { ISearchConfig } from "@/components/CURD/types";
import { statusOptions, downloaderOptions } from "./options";

const searchConfig: ISearchConfig = {
  permPrefix: "sys:download",
  formItems: [
    {
      tips: "支持模糊搜索",
      type: "input",
      label: "关键字",
      prop: "keywords",
      attrs: {
        placeholder: "名称/URL/路径/哈希",
        clearable: true,
        style: { width: "200px" },
      },
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
      type: "select",
      label: "下载器",
      prop: "downloader",
      attrs: {
        placeholder: "全部",
        clearable: true,
        style: { width: "140px" },
      },
      options: downloaderOptions,
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
