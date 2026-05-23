const Layout = () => import("@/layout/index.vue");

export default {
  path: "/news",
  name: "News",
  component: Layout,
  redirect: "/news/list",
  meta: {
    icon: "ep/document",
    title: "资讯管理",
    rank: 5
  },
  children: [
    {
      path: "/news/list",
      name: "NewsList",
      component: () => import("@/views/news/list/index.vue"),
      meta: {
        title: "资讯列表"
      }
    },
    {
      path: "/news/add",
      name: "NewsAdd",
      component: () => import("@/views/news/add/index.vue"),
      meta: {
        title: "新增资讯"
      }
    }
  ]
} satisfies RouteConfigsTable;
