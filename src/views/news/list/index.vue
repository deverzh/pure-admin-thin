<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import { newsApi, type NewsFile } from "@/api/news";

defineOptions({
  name: "NewsList"
});

const router = useRouter();
const loading = ref(false);
const list = ref<NewsFile[]>([]);

async function loadList() {
  loading.value = true;
  try {
    const res = await newsApi.list();
    if (res.data.success) {
      list.value = res.data.data || [];
    }
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  router.push("/news/add");
}

async function handleDelete(item: NewsFile) {
  try {
    await ElMessageBox.confirm(`确定要删除资讯「${item.title}」吗？`, "提示", {
      type: "warning"
    });
  } catch {
    return;
  }
  const res = await newsApi.delete(item.name);
  if (res.data.success) {
    ElMessage.success("删除成功");
    loadList();
  } else {
    ElMessage.error("删除失败");
  }
}

function handlePreview(item: NewsFile) {
  const url = `/news/${encodeURIComponent(item.name)}`;
  window.open(url, "_blank");
}

function formatTime(ts: number) {
  return dayjs(ts).format("YYYY-MM-DD HH:mm:ss");
}

function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

onMounted(loadList);
</script>

<template>
  <div class="p-4">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>资讯列表</span>
          <el-button type="primary" @click="handleAdd">新增资讯</el-button>
        </div>
      </template>
      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="name" label="文件" min-width="200" />
        <el-table-column label="大小" width="120">
          <template #default="{ row }">
            {{ formatSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="200">
          <template #default="{ row }">
            {{ formatTime(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handlePreview(row)">
              预览
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
