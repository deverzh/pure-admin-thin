<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { WangEditor } from "@/components/WangEditor";
import { newsApi } from "@/api/news";

defineOptions({
  name: "NewsAdd"
});

const router = useRouter();
const title = ref("");
const content = ref("");
const saving = ref(false);

function buildHtml(t: string, body: string) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${t}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif; max-width: 960px; margin: 0 auto; padding: 24px; line-height: 1.8; color: #333; }
    h1.news-title { text-align: center; margin-bottom: 24px; }
    .news-meta { text-align: center; color: #999; margin-bottom: 24px; font-size: 14px; }
    .news-content img { max-width: 100%; }
  </style>
</head>
<body>
  <h1 class="news-title">${t}</h1>
  <div class="news-meta">发布时间：${new Date().toLocaleString()}</div>
  <div class="news-content">${body}</div>
</body>
</html>`;
}

async function handleSave() {
  if (!title.value.trim()) {
    ElMessage.warning("请输入资讯标题");
    return;
  }
  saving.value = true;
  try {
    const name = `${Date.now()}.html`;
    const html = buildHtml(title.value.trim(), content.value);
    const res = await newsApi.save(name, html);
    if (res.data.success) {
      ElMessage.success("保存成功");
      router.push("/news/list");
    } else {
      ElMessage.error("保存失败");
    }
  } finally {
    saving.value = false;
  }
}

function handleBack() {
  router.push("/news/list");
}
</script>

<template>
  <div class="p-4">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>新增资讯</span>
          <div>
            <el-button @click="handleBack">返回</el-button>
            <el-button type="primary" :loading="saving" @click="handleSave">
              保存
            </el-button>
          </div>
        </div>
      </template>
      <el-form label-width="80px">
        <el-form-item label="标题">
          <el-input
            v-model="title"
            placeholder="请输入资讯标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="内容">
          <WangEditor
            v-model="content"
            :height="420"
            placeholder="请输入资讯内容..."
          />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
