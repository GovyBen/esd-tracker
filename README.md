# ESD Tracker

芯片 ESD 仿真追踪桌面工具

## 技术栈

Tauri v2 + React 19 + TypeScript + Vite + Tailwind CSS + Zustand

## 功能

- **树形视图**：IP/端口层级管理，里程碑进度追踪
- **端口详情**：事件链、EMX 防护（二极管/P2P/CLAMP）、Checklist
- **看板视图**：芯片标签分组、进度统计
- **日历视图**：竖排甘特图、轨道合并、延期标记
- **管理后台**：工艺/激励标准/人员/角色/芯片标签/Checklist模板/工作流
- **导入导出**：JSON 分享、自动备份

## 开发

```bash
npm install
npm run dev          # 开发服务器 (http://localhost:1420)
npx tauri build      # 构建 EXE
```

## 下载

[Releases](https://github.com/GovyBen/esd-tracker/releases)
