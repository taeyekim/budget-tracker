import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { transactionService, categoryService } from "../services/transactions";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartType, setChartType] = useState("pie"); // 'pie' 또는 'bar'

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // 병렬로 데이터 로드
      const [statsData, transactionsData] = await Promise.all([
        transactionService.getStats(),
        transactionService.getTransactions({ page_size: 5 }),
      ]);

      setStats(statsData);
      setRecentTransactions(transactionsData.results || []);
    } catch (err) {
      console.error("대시보드 데이터 로드 오류:", err);
      if (err.response?.status === 404) {
        // 첫 방문자인 경우 기본 카테고리 생성 제안
        setError("first_visit");
      } else {
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const createDefaultCategories = async () => {
    try {
      await categoryService.createDefaultCategories();
      await loadDashboardData();
    } catch (err) {
      console.error("기본 카테고리 생성 오류:", err);
      setError("기본 카테고리 생성 중 오류가 발생했습니다.");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  };

  // 차트 데이터 준비
  const prepareChartData = () => {
    if (!stats?.category_stats) return [];

    const expenseCategories = stats.category_stats
      .filter((cat) => cat.category__type === "expense" && cat.total > 0)
      .map((category) => ({
        name: category.category__name,
        value: category.total,
        color: category.category__color,
        percentage:
          stats.total_expense > 0
            ? (category.total / stats.total_expense) * 100
            : 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // 상위 8개만 표시

    return expenseCategories;
  };

  // 커스텀 차트 색상
  const CHART_COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#84CC16",
    "#F97316",
  ];

  // 파이 차트 툴팁
  const renderPieTooltip = (props) => {
    if (props.active && props.payload && props.payload.length) {
      const data = props.payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {formatCurrency(data.value)} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error === "first_visit") {
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            가계부 시작하기
          </h3>
          <p className="text-gray-600 mb-6">
            가계부를 시작하기 위해 기본 카테고리를 생성해보세요. 급여, 식비,
            교통비 등 일반적인 카테고리들이 자동으로 추가됩니다.
          </p>
          <div className="space-y-3">
            <button
              onClick={createDefaultCategories}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              기본 카테고리 생성하기
            </button>
            <Link
              to="/transactions"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              직접 거래 내역 추가하기
            </Link>
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
              onClick={loadDashboardData}
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
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600">이번 달 가계부 현황을 확인하세요</p>
        </div>
        <Link
          to="/transactions"
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
        </Link>
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 총 수입 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <svg
                className="w-6 h-6 text-success-600"
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
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 수입</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.total_income || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* 총 지출 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-danger-100 rounded-lg">
              <svg
                className="w-6 h-6 text-danger-600"
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
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 지출</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.total_expense || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* 잔액 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div
              className={`p-2 rounded-lg ${
                (stats?.balance || 0) >= 0 ? "bg-primary-100" : "bg-warning-100"
              }`}
            >
              <svg
                className={`w-6 h-6 ${
                  (stats?.balance || 0) >= 0
                    ? "text-primary-600"
                    : "text-warning-600"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">잔액</p>
              <p
                className={`text-2xl font-bold ${
                  (stats?.balance || 0) >= 0
                    ? "text-gray-900"
                    : "text-warning-600"
                }`}
              >
                {formatCurrency(stats?.balance || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* 거래 건수 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg
                className="w-6 h-6 text-gray-600"
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
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">거래 건수</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.transaction_count || 0}건
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 거래 내역 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">최근 거래</h3>
              <Link
                to="/transactions"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                전체 보기
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: `${transaction.category_color}20`,
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: transaction.category_color,
                          }}
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.category_name} •{" "}
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-medium ${
                          transaction.type === "income"
                            ? "text-success-600"
                            : "text-danger-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
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
                <p className="mt-2 text-sm text-gray-500">
                  아직 거래 내역이 없습니다
                </p>
                <Link
                  to="/transactions"
                  className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  첫 거래 추가하기
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 카테고리별 지출 차트 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                카테고리별 지출
              </h3>
              <button
                onClick={() =>
                  setChartType(chartType === "pie" ? "bar" : "pie")
                }
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {chartType === "pie" ? "막대 차트" : "원형 차트"}
              </button>
            </div>
          </div>
          <div className="p-6">
            {prepareChartData().length > 0 ? (
              <div>
                <div className="h-64 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "pie" ? (
                      <PieChart>
                        <Pie
                          data={prepareChartData()}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percentage }) =>
                            `${name} (${percentage.toFixed(1)}%)`
                          }
                          labelLine={false}
                        >
                          {prepareChartData().map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.color ||
                                CHART_COLORS[index % CHART_COLORS.length]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip content={renderPieTooltip} />
                      </PieChart>
                    ) : (
                      <LineChart data={prepareChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => formatCurrency(value)}
                        />
                        <Tooltip
                          formatter={(value) => [formatCurrency(value), "지출"]}
                          labelStyle={{ color: "#374151" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* 범례 */}
                <div className="grid grid-cols-2 gap-2">
                  {prepareChartData()
                    .slice(0, 6)
                    .map((category, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor:
                              category.color ||
                              CHART_COLORS[index % CHART_COLORS.length],
                          }}
                        />
                        <span className="text-xs text-gray-600 truncate">
                          {category.name}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
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
                <p className="mt-2 text-sm text-gray-500">
                  아직 지출 내역이 없습니다
                </p>
                <Link
                  to="/transactions"
                  className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  거래 추가하기
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
