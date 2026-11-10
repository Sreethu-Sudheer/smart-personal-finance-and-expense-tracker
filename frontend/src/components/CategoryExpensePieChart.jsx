
import React, { useEffect, useState } from "react";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

import api from "../services/api";
import "./CategoryExpensePieChart.css";

const COLORS = [
    "#6366f1",
    "#22c55e",
    "#f97316",
    "#ec4899",
    "#14b8a6",
    "#eab308",
    "#8b5cf6",
    "#ef4444"
];

function CategoryExpensePieChart() {

    const [categoryExpenses, setCategoryExpenses] = useState([]);
    const [dailyData, setDailyData] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();

        return `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, "0")}`;
    });
    const fetchChartData = async () => {

        try {
            setLoading(true);
            setError("");

            const [year, month] = selectedMonth.split("-");

            const [categoryResponse, dailyResponse] = await Promise.all([
                api.get("/monthly-category-expense/", {
                    params: {
                        month,
                        year
                    }
                }),
                api.get("/dailybudget/")

            ]);

            // Pie chart data
            const formattedCategoryData = categoryResponse.data
                .map(item => ({
                    ...item,
                    total_expense: Number(item.total_expense)
                }))
                .filter(item => item.total_expense > 0);

            setCategoryExpenses(formattedCategoryData);

            // Bar chart data for selected month
            const formattedDailyData = dailyResponse.data
                .filter(item =>
                    item.date &&
                    item.date.startsWith(selectedMonth)
                )
                .map(item => ({
                    ...item,
                    total_income: Number(item.total_income || 0),
                    total_expense: Number(item.total_expense || 0)
                }))
                .sort((a, b) => a.date.localeCompare(b.date));

            setDailyData(formattedDailyData);

        } catch (error) {

            console.error(
                "Chart data error:",
                error.response?.data || error
            );

            setError("Unable to load chart data.");

            setCategoryExpenses([]);
            setDailyData([]);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChartData();
    }, [selectedMonth]);
    const totalExpense = categoryExpenses.reduce(
        (total, item) => total + item.total_expense,
        0
    );

    return (
        <div className="charts-container">
            <div className="chart-card">
                <div className="category-chart-header">
                    <div>
                        <h2>Category Expenses</h2>
                        <p>Monthly expense breakdown</p>
                    </div>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) =>
                            setSelectedMonth(e.target.value)
                        }
                    />
                </div>
                <div className="category-total">
                    <span>Total Expenses</span>
                    <h3>
                        ₹{totalExpense.toLocaleString("en-IN", {
                            maximumFractionDigits: 2
                        })}
                    </h3>
                </div>
                {loading ? (
                    <p className="chart-message">
                        Loading expenses...
                    </p>
                ) : error ? (
                    <p className="chart-error">
                        {error}
                    </p>
                ) : categoryExpenses.length > 0 ? (
                   <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie
                                data={categoryExpenses}
                                dataKey="total_expense"
                                nameKey="category"
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={115}
                                paddingAngle={3}
                                label={({ category, percent }) =>
                                    `${category} ${(percent * 100).toFixed(1)}%`
                                }
                            >
                                {categoryExpenses.map((item, index) => (

                                    <Cell
                                        key={`${item.category}-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => [
                                    `₹${Number(value).toLocaleString("en-IN")}`,
                                    "Expense"
                                ]}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="chart-message">
                        No expense transactions found for this month.
                    </p>
                )}
            </div>
            <div className="chart-card">
                <h2>Daily Income vs Expense</h2>
                <p className="chart-subtitle">
                    Daily transaction summary for the selected month
                </p>
                {loading ? (
                    <p className="chart-message">
                        Loading transactions...
                    </p>
                ) : error ? (
                    <p className="chart-error">
                        {error}
                    </p>
                ) : dailyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                            data={dailyData}
                            margin={{
                                top: 20,
                                right: 20,
                                left: 10,
                                bottom: 20
                            }}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                            />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(date) =>
                                    date.slice(8, 10)
                                }
                            />
                            <YAxis />
                            <Tooltip
                                formatter={(value) =>
                                    `₹${Number(value).toLocaleString("en-IN")}`
                                }
                            />
                            <Legend />

                            <Bar
                                dataKey="total_income"
                                name="Income"
                                fill="#22c55e"
                                barSize={20}
                                radius={[5, 5, 0, 0]}
                            />
                            <Bar
                                dataKey="total_expense"
                                name="Expense"
                                fill="#ef4444"
                                barSize={20}
                                radius={[5, 5, 0, 0]}
                            />
                        </BarChart>

                    </ResponsiveContainer>
                ) : (

                    <p className="chart-message">
                        No daily transaction data found for this month.
                    </p>
                )}
            </div>
        </div>
    );
}
export default CategoryExpensePieChart;
