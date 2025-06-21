import React, { useState, useEffect } from "react";
import { transactionService, categoryService } from "../services/transactions";
import TransactionModal from "../components/TransactionModal";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    search: "",
    start_date: "",
    end_date: "",
  });
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    current_page: 1,
  });

  useEffect(() => {
    loadTransactions();
    loadCategories();
  }, [filters]);

  const loadTransactions = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== "")
        ),
      };

      const data = await transactionService.getTransactions(params);
      setTransactions(data.results || []);
      setPagination({
        count: data.count,
        next: data.next,
        previous: data.previous,
        current_page: page,
      });
    } catch (err) {
      console.error("거래 내역 로드 오류:", err);
      setError("거래 내역을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data.results || data);
    } catch (err) {
      console.error("카테고리 로드 오류:", err);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("정말로 이 거래를 삭제하시겠습니까?")) {
      return;
    }

    try {
      await transactionService.deleteTransaction(id);
      await loadTransactions(pagination.current_page);
    } catch (err) {
      console.error("거래 삭제 오류:", err);
      alert("거래 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleModalSubmit = async (data) => {
    try {
      if (editingTransaction) {
        await transactionService.updateTransaction(editingTransaction.id, data);
      } else {
        await transactionService.createTransaction(data);
      }

      setIsModalOpen(false);
      setEditingTransaction(null);
      await loadTransactions(pagination.current_page);
    } catch (err) {
      console.error("거래 저장 오류:", err);
      throw err;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      category: "",
      search: "",
      start_date: "",
      end_date: "",
    });
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">거래 내역</h1>
          <p className="text-gray-600">수입과 지출을 관리하세요</p>
        </div>
        <button
          onClick={handleAddTransaction}
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
          거래 추가
        </button>
      </div>

      {/* 필터 영역 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 거래 타입 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              타입
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">전체</option>
              <option value="income">수입</option>
              <option value="expense">지출</option>
            </select>
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              카테고리
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">전체</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* 시작일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              시작일
            </label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange("start_date", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* 종료일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              종료일
            </label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange("end_date", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              검색
            </label>
            <input
              type="text"
              placeholder="제목, 내용 검색"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            필터 초기화
          </button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
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
            </div>
          </div>
        </div>
      )}

      {/* 거래 목록 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {transactions.length > 0 ? (
          <>
            {/* 테이블 헤더 */}
            <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-6 gap-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div>날짜</div>
                <div>제목</div>
                <div>카테고리</div>
                <div>타입</div>
                <div className="text-right">금액</div>
                <div className="text-right">작업</div>
              </div>
            </div>

            {/* 테이블 내용 */}
            <div className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="px-6 py-4">
                  <div className="grid grid-cols-6 gap-4 items-center">
                    <div className="text-sm text-gray-900">
                      {formatDate(transaction.date)}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.title}
                    </div>
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: transaction.category_color }}
                      />
                      <span className="text-sm text-gray-900">
                        {transaction.category_name}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.type === "income"
                            ? "bg-success-100 text-success-800"
                            : "bg-danger-100 text-danger-800"
                        }`}
                      >
                        {transaction.type === "income" ? "수입" : "지출"}
                      </span>
                    </div>
                    <div
                      className={`text-right text-sm font-medium ${
                        transaction.type === "income"
                          ? "text-success-600"
                          : "text-danger-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </div>
                    <div className="text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditTransaction(transaction)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          수정
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteTransaction(transaction.id)
                          }
                          className="text-danger-600 hover:text-danger-700 text-sm font-medium"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            {pagination.count > 20 && (
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    총 {pagination.count}개 중{" "}
                    {(pagination.current_page - 1) * 20 + 1}-
                    {Math.min(pagination.current_page * 20, pagination.count)}개
                    표시
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        loadTransactions(pagination.current_page - 1)
                      }
                      disabled={!pagination.previous}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      이전
                    </button>
                    <button
                      onClick={() =>
                        loadTransactions(pagination.current_page + 1)
                      }
                      disabled={!pagination.next}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      다음
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              거래 내역이 없습니다
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              첫 거래를 추가해보세요.
            </p>
            <div className="mt-6">
              <button
                onClick={handleAddTransaction}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                거래 추가
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 거래 추가/수정 모달 */}
      {isModalOpen && (
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTransaction(null);
          }}
          onSubmit={handleModalSubmit}
          transaction={editingTransaction}
          categories={categories}
        />
      )}
    </div>
  );
};

export default Transactions;
