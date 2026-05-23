import axios from "axios";

const request = axios.create({
  baseURL: "/",
  timeout: 30000
});

export interface NewsFile {
  name: string;
  title: string;
  updatedAt: number;
  size: number;
}

export const newsApi = {
  list: () =>
    request.get<{ success: boolean; data: NewsFile[] }>("/api/news/list"),
  read: (name: string) =>
    request.post<{ success: boolean; data: string | null }>("/api/news/read", {
      name
    }),
  save: (name: string, content: string) =>
    request.post<{ success: boolean; data: { name: string } }>(
      "/api/news/save",
      { name, content }
    ),
  delete: (name: string) =>
    request.post<{ success: boolean }>("/api/news/delete", { name })
};
