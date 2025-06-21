import api from "./api";

export const transactionService = {
  // 거래 내역 목록 조회
  getTransactions: async (params = {}) => {
    const response = await api.get("/transactions/", { params });
    return response.data;
  },

  // 거래 내역 생성
  createTransaction: async (data) => {
    const response = await api.post("/transactions/", data);
    return response.data;
  },

  // 거래 내역 상세 조회
  getTransaction: async (id) => {
    const response = await api.get(`/transactions/${id}/`);
    return response.data;
  },

  // 거래 내역 수정
  updateTransaction: async (id, data) => {
    const response = await api.put(`/transactions/${id}/`, data);
    return response.data;
  },

  // 거래 내역 삭제
  deleteTransaction: async (id) => {
    await api.delete(`/transactions/${id}/`);
  },

  // 통계 조회
  getStats: async (params = {}) => {
    const response = await api.get("/stats/", { params });
    return response.data;
  },
};

export const categoryService = {
  // 카테고리 목록 조회
  getCategories: async (params = {}) => {
    const response = await api.get("/categories/", { params });
    return response.data;
  },

  // 카테고리 생성
  createCategory: async (data) => {
    const response = await api.post("/categories/", data);
    return response.data;
  },

  // 카테고리 상세 조회
  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}/`);
    return response.data;
  },

  // 카테고리 수정
  updateCategory: async (id, data) => {
    const response = await api.put(`/categories/${id}/`, data);
    return response.data;
  },

  // 카테고리 삭제
  deleteCategory: async (id) => {
    await api.delete(`/categories/${id}/`);
  },

  // 기본 카테고리 생성
  createDefaultCategories: async () => {
    const response = await api.post("/categories/create-defaults/");
    return response.data;
  },
};

export const budgetService = {
  // 예산 목록 조회
  getBudgets: async (params = {}) => {
    const response = await api.get("/budgets/", { params });
    return response.data;
  },

  // 예산 생성
  createBudget: async (data) => {
    const response = await api.post("/budgets/", data);
    return response.data;
  },

  // 예산 상세 조회
  getBudget: async (id) => {
    const response = await api.get(`/budgets/${id}/`);
    return response.data;
  },

  // 예산 수정
  updateBudget: async (id, data) => {
    const response = await api.put(`/budgets/${id}/`, data);
    return response.data;
  },

  // 예산 삭제
  deleteBudget: async (id) => {
    await api.delete(`/budgets/${id}/`);
  },
};
