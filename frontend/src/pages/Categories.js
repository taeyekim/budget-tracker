import React, { useState, useEffect } from "react";
import { categoryService } from "../services/transactions";
import CategoryModal from "../components/CategoryModal";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [filter, setFilter] = useState("all"); // all, income, expense

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await categoryService.getCategories();
      setCategories(data.results || data);
    } catch (err) {
      console.error("카테고리 로드 오류:", err);
      if (err.response?.status === 404) {
        setError("no_categories");
      } else {
        setError("카테고리를 불러오는 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const createDefaultCategories = async () => {
    try {
      await categoryService.createDefaultCategories();
      await loadCategories();
    } catch (err) {
      console.error("기본 카테고리 생성 오류:", err);
      setError("기본 카테고리 생성 중 오류가 발생했습니다.");
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (id) => {
    if (
      !window.confirm(
        "정말로 이 카테고리를 삭제하시겠습니까?\n연결된 거래 내역도 함께 삭제됩니다."
      )
    ) {
      return;
    }

    try {
      await categoryService.deleteCategory(id);
      await loadCategories();
    } catch (err) {
      console.error("카테고리 삭제 오류:", err);
      alert("카테고리 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleModalSubmit = async (data) => {
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, data);
      } else {
        await categoryService.createCategory(data);
      }

      setIsModalOpen(false);
      setEditingCategory(null);
      await loadCategories();
    } catch (err) {
      console.error("카테고리 저장 오류:", err);
      throw err;
    }
  };

  const filteredCategories = categories.filter((category) => {
    if (filter === "all") return true;
    return category.type === filter;
  });

  const getTypeLabel = (type) => {
    return type === "income" ? "수입" : "지출";
  };

  const getTypeColor = (type) => {
    return type === "income"
      ? "text-success-600 bg-success-100"
      : "text-danger-600 bg-danger-100";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error === "no_categories") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="h-6 w-6 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            카테고리 설정하기
          </h3>
          <p className="text-gray-600 mb-6">
            수입과 지출을 체계적으로 관리하기 위해 카테고리를 설정해보세요. 기본
            카테고리를 생성하거나 직접 추가할 수 있습니다.
          </p>
          <div className="space-y-3">
            <button
              onClick={createDefaultCategories}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              기본 카테고리 생성하기
            </button>
            <button
              onClick={handleAddCategory}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              직접 카테고리 추가하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
            <p className="text-sm text-danger-700">{error}</p>
            <button
              onClick={loadCategories}
              className="mt-2 text-sm text-danger-700 underline hover:text-danger-800"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">카테고리 관리</h1>
          <p className="text-gray-600">수입과 지출 카테고리를 관리하세요</p>
        </div>
        <button
          onClick={handleAddCategory}
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          카테고리 추가
        </button>
      </div>

      {/* 필터 탭 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            전체 ({categories.length})
          </button>
          <button
            onClick={() => setFilter("income")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === "income"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            수입 ({categories.filter((c) => c.type === "income").length})
          </button>
          <button
            onClick={() => setFilter("expense")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === "expense"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            지출 ({categories.filter((c) => c.type === "expense").length})
          </button>
        </div>
      </div>

      {/* 카테고리 목록 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredCategories.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredCategories.map((category) => (
              <div key={category.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* 카테고리 색상 */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>

                    {/* 카테고리 정보 */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {category.name}
                        </h3>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                            category.type
                          )}`}
                        >
                          {getTypeLabel(category.type)}
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {category.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        생성일:{" "}
                        {new Date(category.created_at).toLocaleDateString(
                          "ko-KR"
                        )}
                      </p>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-primary-50 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-danger-600 hover:text-danger-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-danger-50 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {filter === "all"
                ? "카테고리가 없습니다"
                : `${getTypeLabel(filter)} 카테고리가 없습니다`}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              새 카테고리를 추가해보세요.
            </p>
            <div className="mt-6">
              <button
                onClick={handleAddCategory}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                카테고리 추가
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 카테고리 추가/수정 모달 */}
      {isModalOpen && (
        <CategoryModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCategory(null);
          }}
          onSubmit={handleModalSubmit}
          category={editingCategory}
        />
      )}
    </div>
  );
};

export default Categories;
