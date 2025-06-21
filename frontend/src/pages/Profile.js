import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/auth";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 프로필 수정 폼
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    monthly_budget: "",
    currency: "KRW",
  });

  // 비밀번호 변경 폼
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        monthly_budget: user.profile?.monthly_budget || "",
        currency: user.profile?.currency || "KRW",
      });
    }
  }, [user]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const updatedUser = await authService.updateProfile({
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        monthly_budget: profileForm.monthly_budget
          ? parseInt(profileForm.monthly_budget.replace(/[^\d]/g, ""), 10)
          : null,
        currency: profileForm.currency,
      });

      updateUser(updatedUser);
      showMessage("success", "프로필이 성공적으로 업데이트되었습니다.");
    } catch (error) {
      console.error("프로필 업데이트 오류:", error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        showMessage("error", "프로필 업데이트 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // 클라이언트 측 유효성 검사
    const newErrors = {};
    if (!passwordForm.current_password) {
      newErrors.current_password = "현재 비밀번호를 입력해주세요.";
    }
    if (!passwordForm.new_password) {
      newErrors.new_password = "새 비밀번호를 입력해주세요.";
    } else if (passwordForm.new_password.length < 8) {
      newErrors.new_password = "새 비밀번호는 최소 8자 이상이어야 합니다.";
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      newErrors.confirm_password = "새 비밀번호가 일치하지 않습니다.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await authService.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });

      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      showMessage("success", "비밀번호가 성공적으로 변경되었습니다.");
    } catch (error) {
      console.error("비밀번호 변경 오류:", error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        showMessage("error", "비밀번호 변경 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    if (name === "monthly_budget") {
      // 숫자만 허용하고 천단위 구분자 추가
      const numericValue = value.replace(/[^\d]/g, "");
      const formattedValue = numericValue
        ? new Intl.NumberFormat("ko-KR").format(parseInt(numericValue, 10))
        : "";
      setProfileForm((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else {
      setProfileForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatCurrency = (amount) => {
    if (!amount) return "";
    const numericAmount = parseInt(amount.replace(/[^\d]/g, ""), 10);
    if (isNaN(numericAmount)) return "";
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      minimumFractionDigits: 0,
    }).format(numericAmount);
  };

  const tabs = [
    { id: "profile", name: "프로필 정보", icon: "user" },
    { id: "password", name: "비밀번호 변경", icon: "lock" },
    { id: "settings", name: "계정 설정", icon: "cog" },
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">프로필 설정</h1>
        <p className="text-gray-600">계정 정보를 관리하고 설정을 변경하세요</p>
      </div>

      {/* 메시지 */}
      {message.text && (
        <div
          className={`rounded-lg p-4 ${
            message.type === "success"
              ? "bg-success-50 border border-success-200"
              : "bg-danger-50 border border-danger-200"
          }`}
        >
          <div className="flex">
            <svg
              className={`h-5 w-5 ${
                message.type === "success"
                  ? "text-success-400"
                  : "text-danger-400"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {message.type === "success" ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              )}
            </svg>
            <div className="ml-3">
              <p
                className={`text-sm ${
                  message.type === "success"
                    ? "text-success-700"
                    : "text-danger-700"
                }`}
              >
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* 프로필 정보 탭 */}
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 이름 */}
                <div>
                  <label
                    htmlFor="first_name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    이름
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={profileForm.first_name}
                    onChange={handleProfileChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      errors.first_name
                        ? "border-danger-300"
                        : "border-gray-300"
                    }`}
                    placeholder="이름을 입력하세요"
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-danger-600">
                      {errors.first_name}
                    </p>
                  )}
                </div>

                {/* 성 */}
                <div>
                  <label
                    htmlFor="last_name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    성
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={profileForm.last_name}
                    onChange={handleProfileChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      errors.last_name ? "border-danger-300" : "border-gray-300"
                    }`}
                    placeholder="성을 입력하세요"
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-danger-600">
                      {errors.last_name}
                    </p>
                  )}
                </div>
              </div>

              {/* 이메일 */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  이메일
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileForm.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-sm text-gray-500">
                  이메일은 변경할 수 없습니다.
                </p>
              </div>

              {/* 월 예산 */}
              <div>
                <label
                  htmlFor="monthly_budget"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  월 예산 (선택사항)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="monthly_budget"
                    name="monthly_budget"
                    value={profileForm.monthly_budget}
                    onChange={handleProfileChange}
                    className={`w-full px-3 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      errors.monthly_budget
                        ? "border-danger-300"
                        : "border-gray-300"
                    }`}
                    placeholder="예: 2,000,000"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">원</span>
                  </div>
                </div>
                {errors.monthly_budget && (
                  <p className="mt-1 text-sm text-danger-600">
                    {errors.monthly_budget}
                  </p>
                )}
                {profileForm.monthly_budget && !errors.monthly_budget && (
                  <p className="mt-1 text-sm text-gray-500">
                    {formatCurrency(profileForm.monthly_budget)}
                  </p>
                )}
              </div>

              {/* 통화 */}
              <div>
                <label
                  htmlFor="currency"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  통화
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={profileForm.currency}
                  onChange={handleProfileChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.currency ? "border-danger-300" : "border-gray-300"
                  }`}
                >
                  <option value="KRW">한국 원 (₩)</option>
                  <option value="USD">미국 달러 ($)</option>
                  <option value="EUR">유로 (€)</option>
                  <option value="JPY">일본 엔 (¥)</option>
                </select>
                {errors.currency && (
                  <p className="mt-1 text-sm text-danger-600">
                    {errors.currency}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading && (
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  프로필 업데이트
                </button>
              </div>
            </form>
          )}

          {/* 비밀번호 변경 탭 */}
          {activeTab === "password" && (
            <form
              onSubmit={handlePasswordSubmit}
              className="space-y-6 max-w-md"
            >
              <div>
                <label
                  htmlFor="current_password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  id="current_password"
                  name="current_password"
                  value={passwordForm.current_password}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.current_password
                      ? "border-danger-300"
                      : "border-gray-300"
                  }`}
                  placeholder="현재 비밀번호를 입력하세요"
                />
                {errors.current_password && (
                  <p className="mt-1 text-sm text-danger-600">
                    {errors.current_password}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="new_password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  새 비밀번호
                </label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  value={passwordForm.new_password}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.new_password
                      ? "border-danger-300"
                      : "border-gray-300"
                  }`}
                  placeholder="새 비밀번호를 입력하세요 (최소 8자)"
                />
                {errors.new_password && (
                  <p className="mt-1 text-sm text-danger-600">
                    {errors.new_password}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirm_password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={passwordForm.confirm_password}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.confirm_password
                      ? "border-danger-300"
                      : "border-gray-300"
                  }`}
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
                {errors.confirm_password && (
                  <p className="mt-1 text-sm text-danger-600">
                    {errors.confirm_password}
                  </p>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      비밀번호 보안 안내
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>8자 이상의 비밀번호를 사용하세요</li>
                        <li>영문, 숫자, 특수문자를 조합하세요</li>
                        <li>개인정보와 관련된 단어는 피하세요</li>
                        <li>다른 서비스와 다른 비밀번호를 사용하세요</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading && (
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  비밀번호 변경
                </button>
              </div>
            </form>
          )}

          {/* 계정 설정 탭 */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  계정 정보
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">이메일:</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">가입일:</span>
                    <span className="font-medium">
                      {user?.date_joined
                        ? new Date(user.date_joined).toLocaleDateString("ko-KR")
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">최근 로그인:</span>
                    <span className="font-medium">
                      {user?.last_login
                        ? new Date(user.last_login).toLocaleDateString("ko-KR")
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-danger-50 border border-danger-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-danger-900 mb-2">
                  위험 구역
                </h3>
                <p className="text-sm text-danger-700 mb-4">
                  아래 작업들은 되돌릴 수 없습니다. 신중하게 진행해주세요.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() =>
                      alert("데이터 내보내기 기능은 곧 추가될 예정입니다.")
                    }
                    className="w-full text-left bg-white border border-danger-300 rounded-lg p-3 hover:bg-danger-50 transition-colors"
                  >
                    <div className="font-medium text-danger-900">
                      모든 데이터 내보내기
                    </div>
                    <div className="text-sm text-danger-700">
                      계정의 모든 데이터를 CSV 파일로 다운로드
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      alert("계정 삭제 기능은 곧 추가될 예정입니다.")
                    }
                    className="w-full text-left bg-white border border-danger-300 rounded-lg p-3 hover:bg-danger-50 transition-colors"
                  >
                    <div className="font-medium text-danger-900">계정 삭제</div>
                    <div className="text-sm text-danger-700">
                      계정과 모든 데이터를 영구적으로 삭제
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
