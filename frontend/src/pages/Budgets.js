import React, { useState, useEffect } from "react";
import { budgetService, categoryService } from "../services/transactions";
import BudgetModal from "../components/BudgetModal";

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  ); // YYYY-MM

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [budgetsData, categoriesData] = await Promise.all([
        budgetService.getBudgets(),
        categoryService.getCategories(),
      ]);

      setBudgets(budgetsData.results || budgetsData);
      setCategories(categoriesData.results || categoriesData);
    } catch (err) {
      console.error("데이터 로드 오류:", err);
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudget = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm("정말로 이 예산을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await budgetService.deleteBudget(id);
      await loadData();
    } catch (err) {
      console.error("예산 삭제 오류:", err);
      alert("예산 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleModalSubmit = async (data) => {
    try {
      if (editingBudget) {
        await budgetService.updateBudget(editingBudget.id, data);
      } else {
        await budgetService.createBudget(data);
      }

      setIsModalOpen(false);
      setEditingBudget(null);
      await loadData();
    } catch (err) {
      console.error("예산 저장 오류:", err);
      throw err;
    }
  };

  const getCurrentMonthBudgets = () => {
    const currentMonth = selectedMonth;
    return budgets.filter((budget) => budget.month === currentMonth);
  };

  const getProgressColor = (usagePercentage) => {
    if (usagePercentage >= 100) return "bg-danger-500";
    if (usagePercentage >= 80) return "bg-warning-500";
    if (usagePercentage >= 60) return "bg-warning-400";
    return "bg-success-500";
  };

  const getProgressTextColor = (usagePercentage) => {
    if (usagePercentage >= 100) return "text-danger-600";
    if (usagePercentage >= 80) return "text-warning-600";
    return "text-gray-600";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotalBudget = () => {
    const currentBudgets = getCurrentMonthBudgets();
    return currentBudgets.reduce((total, budget) => total + budget.amount, 0);
  };

  const calculateTotalSpent = () => {
    const currentBudgets = getCurrentMonthBudgets();
    return currentBudgets.reduce((total, budget) => total + budget.spent, 0);
  };

  const calculateOverallProgress = () => {
    const totalBudget = calculateTotalBudget();
    const totalSpent = calculateTotalSpent();
    return totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  };

  const getMonthName = (monthString) => {
    const date = new Date(monthString + "-01");
    return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
              onClick={loadData}
              className="mt-2 text-sm text-danger-700 underline hover:text-danger-800"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentBudgets = getCurrentMonthBudgets();
  const totalBudget = calculateTotalBudget();
  const totalSpent = calculateTotalSpent();
  const overallProgress = calculateOverallProgress();

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">예산 관리</h1>
          <p className="text-gray-600">
            월별 예산을 설정하고 지출을 모니터링하세요
          </p>
        </div>
        <button
          onClick={handleAddBudget}
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
          예산 추가
        </button>
      </div>

      {/* 월 선택 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label
              htmlFor="month"
              className="text-sm font-medium text-gray-700"
            >
              조회할 월:
            </label>
            <input
              id="month"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="text-sm text-gray-500">
            {getMonthName(selectedMonth)} 예산
          </div>
        </div>
      </div>

      {/* 전체 예산 요약 */}
      {currentBudgets.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            전체 예산 현황
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {formatCurrency(totalBudget)}
              </div>
              <div className="text-sm text-gray-500">총 예산</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalSpent)}
              </div>
              <div className="text-sm text-gray-500">총 지출</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600">
                {formatCurrency(totalBudget - totalSpent)}
              </div>
              <div className="text-sm text-gray-500">남은 예산</div>
            </div>
          </div>

          {/* 전체 진행률 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                전체 진행률
              </span>
              <span
                className={`text-sm font-medium ${getProgressTextColor(
                  overallProgress
                )}`}
              >
                {overallProgress.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(
                  overallProgress
                )}`}
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              />
            </div>
            {overallProgress > 100 && (
              <div className="mt-2 text-sm text-danger-600 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
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
                예산을 {formatCurrency(totalSpent - totalBudget)} 초과했습니다
              </div>
            )}
          </div>
        </div>
      )}

      {/* 예산 목록 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {currentBudgets.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {currentBudgets.map((budget) => {
              const usagePercentage =
                budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
              const category = categories.find((c) => c.id === budget.category);

              return (
                <div key={budget.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {/* 카테고리 색상 */}
                      {category && (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <div
                            className="w-5 h-5 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                        </div>
                      )}

                      {/* 예산 정보 */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {category
                            ? category.name
                            : `카테고리 ${budget.category}`}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {getMonthName(budget.month)} 예산
                        </p>
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditBudget(budget)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-primary-50 transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="text-danger-600 hover:text-danger-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-danger-50 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  {/* 예산 사용 현황 */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-4">
                        <div>
                          <div className="text-sm text-gray-500">예산</div>
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(budget.amount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">사용</div>
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(budget.spent)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">남은 예산</div>
                          <div
                            className={`font-semibold ${
                              budget.amount - budget.spent >= 0
                                ? "text-success-600"
                                : "text-danger-600"
                            }`}
                          >
                            {formatCurrency(budget.amount - budget.spent)}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-sm font-medium ${getProgressTextColor(
                          usagePercentage
                        )}`}
                      >
                        {usagePercentage.toFixed(1)}%
                      </div>
                    </div>

                    {/* 진행률 바 */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                          usagePercentage
                        )}`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>

                    {/* 경고 메시지 */}
                    {usagePercentage >= 100 && (
                      <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <svg
                            className="h-4 w-4 text-danger-400 mr-2"
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
                          <span className="text-sm text-danger-700">
                            예산을{" "}
                            {formatCurrency(budget.spent - budget.amount)}{" "}
                            초과했습니다
                          </span>
                        </div>
                      </div>
                    )}
                    {usagePercentage >= 80 && usagePercentage < 100 && (
                      <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <svg
                            className="h-4 w-4 text-warning-400 mr-2"
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
                          <span className="text-sm text-warning-700">
                            예산의 80% 이상 사용했습니다
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {getMonthName(selectedMonth)} 예산이 없습니다
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              이번 달 예산을 설정해보세요.
            </p>
            <div className="mt-6">
              <button
                onClick={handleAddBudget}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                예산 추가
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 예산 추가/수정 모달 */}
      {isModalOpen && (
        <BudgetModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingBudget(null);
          }}
          onSubmit={handleModalSubmit}
          budget={editingBudget}
          categories={categories}
          defaultMonth={selectedMonth}
        />
      )}
    </div>
  );
};

export default Budgets;
