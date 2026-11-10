
import { useEffect, useState } from "react";
import api from "../services/api";
import "../App.css";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import CategoryExpensePieChart from "../components/CategoryExpensePieChart";
import Sidebar from "../components/Sidebar";

function Dashboard() {
    const [dailyData, setDailyData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activePage, setActivePage] = useState("dashboard");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [
                    dailyResponse,
                    monthlyResponse,
                    recentResponse
                ] = await Promise.all([
                    api.get("/dailybudget/"),
                    api.get("/monthlybudget/"),
                    api.get("/recenttransactions/")
                ]);
                setDailyData(
                    Array.isArray(dailyResponse.data)
                        ? dailyResponse.data
                        : dailyResponse.data.results || []
                );

                setMonthlyData(
                    Array.isArray(monthlyResponse.data)
                        ? monthlyResponse.data
                        : monthlyResponse.data.results || []
                );

                setRecentTransactions(
                    Array.isArray(recentResponse.data)
                        ? recentResponse.data
                        : recentResponse.data.results || []
                );

            } catch (error) {
                console.error("Dashboard error:", error);

                toast.error(
                    error.response?.data?.detail ||
                    "Unable to load dashboard data. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const now = new Date();
    const currentMonth = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0")
    ].join("-");

    const today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");

    const currentMonthData = monthlyData.find(
        (item) => item.date === currentMonth
    );

    const monthlyIncome = Number(
        currentMonthData?.total_income || 0
    );

    const monthlyExpense = Number(
        currentMonthData?.total_expense || 0
    );

    const monthlyBalance = monthlyIncome - monthlyExpense;

    
    const todayData = dailyData.find(
        (item) => item.date === today
    );

    const dailyIncome = Number(todayData?.total_income || 0);
    const dailyExpense = Number(todayData?.total_expense || 0);

    const formatAmount = (amount) => {
        return Number(amount || 0).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        });
    };

    if (loading) {
        return <h2 className="loading">Loading dashboard...</h2>;
    }

    return (
        <div className="dashboard">

            {/* Sidebar */}
            <Sidebar setActivePage={setActivePage} />

            {/* Dashboard Content */}
            <div className="dashboard-content">

                <h1 className="dashboard-heading">
                    Personal Finance & Expense Tracker
                </h1>

                <p className="subtitle">
                    Overview of your income and expenses
                </p>

                {/* MONTHLY SUMMARY CARDS */}
                <div className="summary-container">

                    <div className="summary-card monthly-income">
                        <div className="card-top">
                            <div>
                                <p>Monthly Income</p>
                                <h2>{formatAmount(monthlyIncome)}</h2>
                            </div>
                            <div className="card-icon green">
                                <i className="bi bi-wallet2"></i>
                            </div>
                        </div>
                        <span className="card-description">
                            Total income this month
                        </span>
                    </div>

                    <div className="summary-card monthly-expense">
                        <div className="card-top">
                            <div>
                                <p>Monthly Expense</p>
                                <h2>{formatAmount(monthlyExpense)}</h2>
                            </div>
                            <div className="card-icon red">
                                <i className="bi bi-credit-card"></i>
                            </div>
                        </div>
                        <span className="card-description">
                            Total expenses this month
                        </span>
                    </div>

                    <div className="summary-card monthly-balance">
                        <div className="card-top">
                            <div>
                                <p>Monthly Balance</p>
                                <h2>{formatAmount(monthlyBalance)}</h2>
                            </div>
                            <div className="card-icon blue">
                                <i className="bi bi-piggy-bank"></i>
                            </div>
                        </div>
                        <span className="card-description">
                            Your remaining monthly amount
                        </span>
                    </div>

                </div>

                {/* DAILY SUMMARY CARDS */}
                <div className="summary-container">

                    <div className="summary-card daily-income">
                        <div className="card-top">
                            <div>
                                <p>Today's Income</p>
                                <h2>{formatAmount(dailyIncome)}</h2>
                            </div>
                            <div className="card-icon teal">
                                <i className="bi bi-calendar-check"></i>
                            </div>
                        </div>
                        <span className="card-description">
                            Income received today
                        </span>
                    </div>

                    <div className="summary-card daily-expense">
                        <div className="card-top">
                            <div>
                                <p>Today's Expense</p>
                                <h2>{formatAmount(dailyExpense)}</h2>
                            </div>
                            <div className="card-icon orange">
                                <i className="bi bi-cart"></i>
                            </div>
                        </div>
                        <span className="card-description">
                            Expenses spent today
                        </span>
                    </div>

                </div>

                {/* CHARTS */}
                <div>
                    <CategoryExpensePieChart />
                </div>

                {/* RECENT TRANSACTIONS */}
                <div className="dashboard-section">

                    <h2>Recent Transactions</h2>

                    {recentTransactions.length === 0 ? (
                        <p>No transactions available.</p>
                    ) : (
                        <div className="table-responsive">

                            <table>
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Amount</th>
                                        <th>Date</th>
                                        <th>Type</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {recentTransactions.map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td>{transaction.title}</td>

                                            <td>
                                                {formatAmount(transaction.amount)}
                                            </td>

                                            <td>{transaction.date}</td>

                                            <td>
                                                <span
                                                    className={
                                                        transaction.transaction_type === "income"
                                                            ? "income-text"
                                                            : "expense-text"
                                                    }
                                                >
                                                    {transaction.transaction_type}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <Link
                                to="/transactions"
                                className="view-all-link"
                            >
                                View All
                            </Link>

                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}

export default Dashboard;
