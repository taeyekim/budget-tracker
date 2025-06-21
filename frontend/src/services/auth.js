import api from "./api";

export const authService = {
  // 로그인
  login: async (email, password) => {
    const response = await api.post("/auth/login/", {
      email,
      password,
    });

    const { user, access, refresh } = response.data;

    // 토큰과 사용자 정보 저장
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  },

  // 회원가입
  register: async (email, username, password, passwordConfirm) => {
    const response = await api.post("/auth/register/", {
      email,
      username,
      password,
      password_confirm: passwordConfirm,
    });

    const { user, access, refresh } = response.data;

    // 토큰과 사용자 정보 저장
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  },

  // 로그아웃
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await api.post("/auth/logout/", {
          refresh: refreshToken,
        });
      }
    } catch (error) {
      console.error("로그아웃 중 오류:", error);
    } finally {
      // 로컬 스토리지 정리
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
  },

  // 현재 사용자 정보 가져오기
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // 로그인 상태 확인
  isAuthenticated: () => {
    return !!localStorage.getItem("access_token");
  },

  // 사용자 프로필 가져오기
  getProfile: async () => {
    const response = await api.get("/auth/user/");
    return response.data;
  },

  // 사용자 프로필 업데이트
  updateProfile: async (data) => {
    const response = await api.patch("/auth/user/", data);

    // 로컬 스토리지의 사용자 정보 업데이트
    localStorage.setItem("user", JSON.stringify(response.data));

    return response.data;
  },

  // 비밀번호 변경
  changePassword: async (passwordData) => {
    const response = await api.post("/auth/change-password/", passwordData);
    return response.data;
  },
};
