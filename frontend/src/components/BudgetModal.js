import React, { useState, useEffect } from "react";

const BudgetModal = ({
  isOpen,
  onClose,
  onSubmit,
  budget,
  categories,
  defaultMonth,
}) => {
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    month: defaultMonth || new Date().toISOString().slice(0, 7),
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category || "",
        amount: budget.amount || "",
        month:
          budget.month || defaultMonth || new Date().toISOString().slice(0, 7),
      });
    } else {
      setFormData({
        category: "",
        amount: "",
        month: defaultMonth || new Date().toISOString().slice(0, 7),
      });
    }
    setErrors({});
  }, [budget, isOpen, defaultMonth]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category) {
      newErrors.category = "카테고리를 선택해주세요.";
    }

    if (!formData.amount) {
      newErrors.amount = "예산 금액을 입력해주세요.";
    } else {
      const amount = parseInt(formData.amount.replace(/[^\d]/g, ""), 10);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = "올바른 금액을 입력해주세요.";
      } else if (amount > 999999999) {
        newErrors.amount = "예산 금액이 너무 큽니다.";
      }
    }

    if (!formData.month) {
      newErrors.month = "예산 월을 선택해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const amount = parseInt(formData.amount.replace(/[^\d]/g, ""), 10);
      await onSubmit({
        category: parseInt(formData.category, 10),
        amount: amount,
        month: formData.month,
      });
    } catch (error) {
      console.error("예산 저장 오류:", error);
      if (error.response?.data) {
        const serverErrors = {};
        if (error.response.data.category) {
          serverErrors.category = Array.isArray(error.response.data.category)
            ? error.response.data.category[0]
            : error.response.data.category;
        }
        if (error.response.data.amount) {
          serverErrors.amount = Array.isArray(error.response.data.amount)
            ? error.response.data.amount[0]
            : error.response.data.amount;
        }
        if (error.response.data.month) {
          serverErrors.month = Array.isArray(error.response.data.month)
            ? error.response.data.month[0]
            : error.response.data.month;
        }
        if (error.response.data.non_field_errors) {
          serverErrors.general = Array.isArray(
            error.response.data.non_field_errors
          )
            ? error.response.data.non_field_errors[0]
            : error.response.data.non_field_errors;
        }
        setErrors(serverErrors);
      } else {
        setErrors({ general: "예산 저장 중 오류가 발생했습니다." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "amount") {
      // 숫자만 허용하고 천단위 구분자 추가
      const numericValue = value.replace(/[^\d]/g, "");
      const formattedValue = numericValue
        ? new Intl.NumberFormat("ko-KR").format(parseInt(numericValue, 10))
        : "";
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // 실시간 유효성 검사
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const formatCurrency = (amount) => {
    const numericAmount = parseInt(amount.replace(/[^\d]/g, ""), 10);
    if (isNaN(numericAmount)) return "₩0";
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      minimumFractionDigits: 0,
    }).format(numericAmount);
  };

  const getMonthName = (monthString) => {
    const date = new Date(monthString + "-01");
    return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long" });
  };

  const getSelectedCategory = () => {
    return categories.find((c) => c.id === parseInt(formData.category, 10));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {budget ? "예산 수정" : "예산 추가"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 폼 내용 */}
          <div className="px-6 py-4 space-y-4">
            {/* 일반 오류 메시지 */}
            {errors.general && (
              <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                <div className="flex">
                  <svg
                    className="h-5 w-5 text-danger-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-danger-700">{errors.general}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 카테고리 선택 */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                카테고리 <span className="text-danger-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.category ? "border-danger-300" : "border-gray-300"
                }`}
              >
                <option value="">카테고리를 선택하세요</option>
                {categories
                  .filter((category) => category.type === "expense")
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-danger-600">
                  {errors.category}
                </p>
              )}
              {categories.filter((c) => c.type === "expense").length === 0 && (
                <p className="mt-1 text-sm text-warning-600">
                  지출 카테고리가 없습니다. 먼저 카테고리를 생성해주세요.
                </p>
              )}
            </div>

            {/* 예산 금액 */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                예산 금액 <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="예: 500,000"
                  className={`w-full px-3 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.amount ? "border-danger-300" : "border-gray-300"
                  }`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">원</span>
                </div>
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-danger-600">{errors.amount}</p>
              )}
              {formData.amount && !errors.amount && (
                <p className="mt-1 text-sm text-gray-500">
                  {formatCurrency(formData.amount)}
                </p>
              )}
            </div>

            {/* 예산 월 */}
            <div>
              <label
                htmlFor="month"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                예산 월 <span className="text-danger-500">*</span>
              </label>
              <input
                type="month"
                id="month"
                name="month"
                value={formData.month}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.month ? "border-danger-300" : "border-gray-300"
                }`}
              />
              {errors.month && (
                <p className="mt-1 text-sm text-danger-600">{errors.month}</p>
              )}
              {formData.month && (
                <p className="mt-1 text-sm text-gray-500">
                  {getMonthName(formData.month)} 예산
                </p>
              )}
            </div>

            {/* 미리보기 */}
            {formData.category && formData.amount && formData.month && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  미리보기
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getSelectedCategory() && (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: `${getSelectedCategory().color}20`,
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: getSelectedCategory().color }}
                      />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900">
                      {getSelectedCategory()?.name || "카테고리"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {getMonthName(formData.month)} 예산:{" "}
                      {formatCurrency(formData.amount)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 도움말 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <svg
                  className="h-5 w-5 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    예산 설정 안내
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>지출 카테고리에만 예산을 설정할 수 있습니다</li>
                      <li>
                        같은 월에 같은 카테고리는 하나의 예산만 설정 가능합니다
                      </li>
                      <li>예산 사용률이 80% 이상일 때 경고가 표시됩니다</li>
                      <li>설정한 예산은 월별 통계에 반영됩니다</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                categories.filter((c) => c.type === "expense").length === 0
              }
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
              {budget ? "수정하기" : "추가하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
