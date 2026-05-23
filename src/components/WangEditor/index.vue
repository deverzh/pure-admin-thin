<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import type {
  IDomEditor,
  IEditorConfig,
  IToolbarConfig
} from "@wangeditor/editor";
import "@wangeditor/editor/dist/css/style.css";
import "./style.css";
import { registerCarouselMenu } from "./carouselMenu";

registerCarouselMenu();

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
  height?: number;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: string): void;
}>();

const editorRef = shallowRef<IDomEditor | null>(null);
const toolbarConfig = ref<Partial<IToolbarConfig>>({
  insertKeys: {
    index: 0,
    keys: ["carousel"]
  },
  excludeKeys: []
});

const editorConfig = ref<Partial<IEditorConfig>>({
  placeholder: props.placeholder || "请输入内容...",
  MENU_CONF: {
    uploadImage: {
      customUpload(_file, insertFn) {
        insertFn(
          "https://img.zuihou66.com/zhuiszhu/img/default_cover.png",
          "示例图片",
          ""
        );
      }
    }
  }
});

function handleCreated(editor: IDomEditor) {
  editorRef.value = editor;
}

function handleChange(editor: IDomEditor) {
  emit("update:modelValue", editor.getHtml());
}

watch(
  () => props.modelValue,
  v => {
    if (editorRef.value && v !== editorRef.value.getHtml()) {
      editorRef.value.setHtml(v);
    }
  }
);

onBeforeUnmount(() => {
  if (editorRef.value) {
    editorRef.value.destroy();
    editorRef.value = null;
  }
});
</script>

<template>
  <div class="wang-editor-wrapper">
    <Toolbar
      :editor="editorRef"
      :default-config="toolbarConfig"
      mode="default"
      class="wang-editor-toolbar"
    />
    <Editor
      :model-value="modelValue"
      :default-config="editorConfig"
      mode="default"
      :style="{ height: (height || 400) + 'px', 'overflow-y': 'hidden' }"
      class="wang-editor-content"
      @on-created="handleCreated"
      @on-change="handleChange"
    />
  </div>
</template>
