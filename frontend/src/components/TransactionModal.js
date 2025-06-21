import React, { useState, useEffect } from "react";

const TransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  transaction,
  categories,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // 수정 모드일 때 폼 데이터 설정
  useEffect(() => {
    if (transaction) {
      setFormData({
        title: transaction.title || "",
        amount: transaction.amount || "",
        type: transaction.type || "expense",
        category: transaction.category || "",
        description: transaction.description || "",
        date: transaction.date || new Date().toISOString().split("T")[0],
      });
    } else {
      // 새 거래 추가 모드일 때 초기화
      setFormData({
        title: "",
        amount: "",
        type: "expense",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
    }
    setErrors({});
  }, [transaction, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 카테고리 초기화 (타입이 변경되면)
    if (name === "type") {
      setFormData((prev) => ({
        ...prev,
        category: "",
      }));
    }

    // 입력 시 해당 필드의 에러 제거
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "제목을 입력해주세요.";
    }

    if (!formData.amount) {
      newErrors.amount = "금액을 입력해주세요.";
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "올바른 금액을 입력해주세요.";
    }

    if (!formData.category) {
      newErrors.category = "카테고리를 선택해주세요.";
    }

    if (!formData.date) {
      newErrors.date = "날짜를 선택해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        category: parseInt(formData.category),
      };

      await onSubmit(submitData);
    } catch (error) {
      const errorData = error.response?.data || {};
      const newErrors = {};

      // 서버에서 온 에러 메시지 매핑
      Object.keys(errorData).forEach((key) => {
        if (errorData[key]) {
          newErrors[key] = Array.isArray(errorData[key])
            ? errorData[key][0]
            : errorData[key];
        }
      });

      if (Object.keys(newErrors).length === 0) {
        newErrors.general = "저장 중 오류가 발생했습니다.";
      }

      setErrors(newErrors);
    } finally {
      setIsLoading(false);
    }
  };

  // 모달이 열려있지 않으면 렌더링하지 않음
  if (!isOpen) return null;

  // 타입에 따른 카테고리 필터링
  const filteredCategories = categories.filter(
    (category) => category.type === formData.type
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* 오버레이 */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* 모달 콘텐츠 */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            {/* 헤더 */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {transaction ? "거래 수정" : "거래 추가"}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <svg
                    className="h-6 w-6"
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

              {/* 일반 오류 메시지 */}
              {errors.general && (
                <div className="mb-4 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
                  {errors.general}
                </div>
              )}

              <div className="space-y-4">
                {/* 거래 타입 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    거래 타입
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleChange({
                          target: { name: "type", value: "income" },
                        })
                      }
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                        formData.type === "income"
                          ? "border-success-500 bg-success-50 text-success-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 11l5-5m0 0l5 5m-5-5v12"
                          />
                        </svg>
                        수입
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleChange({
                          target: { name: "type", value: "expense" },
                        })
                      }
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                        formData.type === "expense"
                          ? "border-danger-500 bg-danger-50 text-danger-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 13l-5 5m0 0l-5-5m5 5V6"
                          />
                        </svg>
                        지출
                      </div>
                    </button>
                  </div>
                </div>

                {/* 제목 */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    제목
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.title ? "border-danger-300" : "border-gray-300"
                    }`}
                    placeholder="거래 제목을 입력하세요"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-danger-600">
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* 금액 */}
                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    금액
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.amount ? "border-danger-300" : "border-gray-300"
                    }`}
                    placeholder="0"
                    min="0"
                    step="1"
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-danger-600">
                      {errors.amount}
                    </p>
                  )}
                </div>

                {/* 카테고리 */}
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    카테고리
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.category ? "border-danger-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">카테고리를 선택하세요</option>
                    {filteredCategories.map((category) => (
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
                  {filteredCategories.length === 0 && (
                    <p className="mt-1 text-sm text-gray-500">
                      {formData.type === "income" ? "수입" : "지출"} 카테고리가
                      없습니다.
                    </p>
                  )}
                </div>

                {/* 날짜 */}
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    날짜
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.date ? "border-danger-300" : "border-gray-300"
                    }`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-danger-600">
                      {errors.date}
                    </p>
                  )}
                </div>

                {/* 설명 */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    설명 (선택사항)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="추가 설명을 입력하세요"
                  />
                </div>
              </div>
            </div>

            {/* 버튼 영역 */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    저장 중...
                  </div>
                ) : transaction ? (
                  "수정"
                ) : (
                  "추가"
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
