import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authService } from "../services/auth";

// 초기 상태
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

// 액션 타입
const ActionTypes = {
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGOUT: "LOGOUT",
  SET_LOADING: "SET_LOADING",
  UPDATE_USER: "UPDATE_USER",
};

// 리듀서
const authReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case ActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ActionTypes.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// Context 생성
const AuthContext = createContext();

// Provider 컴포넌트
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 초기 로딩 시 인증 상태 확인
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const user = authService.getCurrentUser();
        const isAuthenticated = authService.isAuthenticated();

        if (isAuthenticated && user) {
          dispatch({
            type: ActionTypes.LOGIN_SUCCESS,
            payload: user,
          });
        } else {
          dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error("인증 상태 확인 중 오류:", error);
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    };

    checkAuthStatus();
  }, []);

  // 로그인
  const login = async (email, password) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      const data = await authService.login(email, password);

      dispatch({
        type: ActionTypes.LOGIN_SUCCESS,
        payload: data.user,
      });

      return data;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      throw error;
    }
  };

  // 회원가입
  const register = async (email, username, password, passwordConfirm) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      const data = await authService.register(
        email,
        username,
        password,
        passwordConfirm
      );

      dispatch({
        type: ActionTypes.LOGIN_SUCCESS,
        payload: data.user,
      });

      return data;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      throw error;
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: ActionTypes.LOGOUT });
    } catch (error) {
      console.error("로그아웃 중 오류:", error);
      // 오류가 발생해도 로컬에서는 로그아웃 처리
      dispatch({ type: ActionTypes.LOGOUT });
    }
  };

  // 사용자 정보 업데이트
  const updateUser = (userData) => {
    dispatch({
      type: ActionTypes.UPDATE_USER,
      payload: userData,
    });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 내에서 사용되어야 합니다.");
  }
  return context;
};
