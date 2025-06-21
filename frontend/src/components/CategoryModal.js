import React, { useState, useEffect } from "react";

const PREDEFINED_COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#F97316", // orange
  "#EC4899", // pink
  "#6B7280", // gray
  "#14B8A6", // teal
  "#A855F7", // purple
];

const CategoryModal = ({ isOpen, onClose, onSubmit, category }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "expense",
    color: PREDEFINED_COLORS[0],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        type: category.type || "expense",
        color: category.color || PREDEFINED_COLORS[0],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        type: "expense",
        color: PREDEFINED_COLORS[0],
      });
    }
    setErrors({});
  }, [category, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "카테고리 이름을 입력해주세요.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "카테고리 이름은 2자 이상이어야 합니다.";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "카테고리 이름은 50자 이하여야 합니다.";
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = "설명은 200자 이하여야 합니다.";
    }

    if (!formData.type) {
      newErrors.type = "카테고리 타입을 선택해주세요.";
    }

    if (!formData.color) {
      newErrors.color = "색상을 선택해주세요.";
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
      await onSubmit({
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
    } catch (error) {
      console.error("카테고리 저장 오류:", error);
      if (error.response?.data) {
        const serverErrors = {};
        if (error.response.data.name) {
          serverErrors.name = Array.isArray(error.response.data.name)
            ? error.response.data.name[0]
            : error.response.data.name;
        }
        if (error.response.data.description) {
          serverErrors.description = Array.isArray(
            error.response.data.description
          )
            ? error.response.data.description[0]
            : error.response.data.description;
        }
        if (error.response.data.type) {
          serverErrors.type = Array.isArray(error.response.data.type)
            ? error.response.data.type[0]
            : error.response.data.type;
        }
        if (error.response.data.color) {
          serverErrors.color = Array.isArray(error.response.data.color)
            ? error.response.data.color[0]
            : error.response.data.color;
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
        setErrors({ general: "카테고리 저장 중 오류가 발생했습니다." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 실시간 유효성 검사
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleColorSelect = (color) => {
    setFormData((prev) => ({
      ...prev,
      color,
    }));

    if (errors.color) {
      setErrors((prev) => ({
        ...prev,
        color: "",
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {category ? "카테고리 수정" : "카테고리 추가"}
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

            {/* 카테고리 이름 */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                카테고리 이름 <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="예: 식료품, 교통비, 월급 등"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.name ? "border-danger-300" : "border-gray-300"
                }`}
                maxLength={50}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-danger-600">{errors.name}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.name.length}/50
              </p>
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
                placeholder="카테고리에 대한 간단한 설명을 입력하세요"
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none ${
                  errors.description ? "border-danger-300" : "border-gray-300"
                }`}
                maxLength={200}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-danger-600">
                  {errors.description}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/200
              </p>
            </div>

            {/* 카테고리 타입 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 타입 <span className="text-danger-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleChange({ target: { name: "type", value: "income" } })
                  }
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    formData.type === "income"
                      ? "border-success-500 bg-success-50 text-success-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="text-sm font-medium">수입</div>
                  <div className="text-xs text-gray-500">들어오는 돈</div>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleChange({ target: { name: "type", value: "expense" } })
                  }
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    formData.type === "expense"
                      ? "border-danger-500 bg-danger-50 text-danger-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="text-sm font-medium">지출</div>
                  <div className="text-xs text-gray-500">나가는 돈</div>
                </button>
              </div>
              {errors.type && (
                <p className="mt-1 text-sm text-danger-600">{errors.type}</p>
              )}
            </div>

            {/* 색상 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                색상 <span className="text-danger-500">*</span>
              </label>
              <div className="grid grid-cols-6 gap-2">
                {PREDEFINED_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      formData.color === color
                        ? "border-gray-900 scale-110"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {formData.color === color && (
                      <svg
                        className="w-4 h-4 text-white mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              {errors.color && (
                <p className="mt-1 text-sm text-danger-600">{errors.color}</p>
              )}
            </div>

            {/* 미리보기 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                미리보기
              </label>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${formData.color}20` }}
                >
                  <div
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: formData.color }}
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {formData.name || "카테고리 이름"}
                    </span>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        formData.type === "income"
                          ? "text-success-600 bg-success-100"
                          : "text-danger-600 bg-danger-100"
                      }`}
                    >
                      {formData.type === "income" ? "수입" : "지출"}
                    </span>
                  </div>
                  {formData.description && (
                    <p className="text-sm text-gray-500">
                      {formData.description}
                    </p>
                  )}
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
              disabled={loading}
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
              {category ? "수정하기" : "추가하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
