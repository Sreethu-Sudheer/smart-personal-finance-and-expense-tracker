
import { useEffect, useState } from "react";
import api from "../services/api";
import "../App.css";
import Sidebar from "../components/Sidebar";
import { toast } from "react-toastify";

function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const emptyForm = {
        title: "",
        amount: "",
        date: new Date().toISOString().slice(0, 10),
        transaction_type: "expense",
        category: ""
    };

    const [formData, setFormData] = useState(emptyForm);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [transactionResponse, categoryResponse] =
                await Promise.all([
                    api.get("/transactions/"),
                    api.get("/categories/")
                ]);

            const transactionData = Array.isArray(transactionResponse.data)
                ? transactionResponse.data
                : transactionResponse.data.results || [];

            const categoryData = Array.isArray(categoryResponse.data)
                ? categoryResponse.data
                : categoryResponse.data.results || [];

            setTransactions(transactionData);
            setCategories(categoryData);
            setError("");

        } catch (err) {
            console.error("Fetch error:", err);
            setError("Unable to load transactions or categories.");
            toast.error("Unable to load transactions or categories.");

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };
    const showApiError = (err, fallback) => {
        const data = err.response?.data;

        if (typeof data === "string") {
            toast.error(data);

        } else if (data && typeof data === "object") {
            const messages = Object.values(data)
                .flat()
                .filter(Boolean)
                .map((message) =>
                    typeof message === "string"
                        ? message
                        : JSON.stringify(message)
                );

            toast.error(messages.join(" ") || fallback);

        } else {
            toast.error(fallback);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.category) {
            toast.warning("Please select a category.");
            return;
        }

        if (!formData.amount || Number(formData.amount) <= 0) {
            toast.warning("Amount must be greater than zero.");
            return;
        }

        const transactionData = {
            ...formData,
            amount: Number(formData.amount),
            category: Number(formData.category)
        };

        try {
            if (editingId !== null) {
                await api.put(
                    `/transactions/${editingId}/`,
                    transactionData
                );

                toast.success("Transaction updated successfully!");

            } else {
                await api.post("/transactions/", transactionData);

                toast.success("Transaction added successfully!");
            }

            setFormData({
                ...emptyForm,
                date: getLocalToday()
            });

            setEditingId(null);

            await fetchData();

        } catch (err) {
            console.error("Save error:", err);
            showApiError(err, "Unable to save transaction.");
        }
    };
    const getLocalToday = () => {
        const today = new Date();

        return [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0")
        ].join("-");
    };
    const handleEdit = (transaction) => {
        setEditingId(transaction.id);

        const categoryId =
            transaction.category?.id ??
            transaction.category ??
            transaction.category_id ??
            "";

        setFormData({
            title: transaction.title || "",
            amount: transaction.amount || "",
            date: transaction.date || "",
            transaction_type: transaction.transaction_type || "expense",
            category: String(categoryId)
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };
    const handleDelete = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const handleCancelDelete = () => {
        if (deleting) return;

        setShowDeleteModal(false);
        setDeleteId(null);
    };


    const handleConfirmDelete = async () => {
        if (deleteId === null || deleting) return;

        setDeleting(true);

        try {
            await api.delete(`/transactions/${deleteId}/`);

            setTransactions((previous) =>
                previous.filter((item) => item.id !== deleteId)
            );

            if (editingId === deleteId) {
                handleCancel();
            }

            toast.success("Transaction deleted successfully!");

            setShowDeleteModal(false);
            setDeleteId(null);

        } catch (err) {
            console.error("Delete error:", err);
            showApiError(err, "Unable to delete transaction.");

        } finally {
            setDeleting(false);
        }
    };

    const handleCancel = () => {
        setEditingId(null);

        setFormData({
            ...emptyForm,
            date: getLocalToday()
        });

        toast.info("Editing cancelled.");
    };

  
    const formatAmount = (amount) => {
        return Number(amount || 0).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        });
    };

   
    const getCategoryName = (transaction) => {
        if (
            transaction.category &&
            typeof transaction.category === "object"
        ) {
            return transaction.category.name || "Uncategorized";
        }

        const categoryId =
            transaction.category ?? transaction.category_id;

        const category = categories.find(
            (item) => String(item.id) === String(categoryId)
        );

        return category?.name || "Uncategorized";
    };

    const downloadHistory = () => {
        if (transactions.length === 0) {
            toast.warning("There are no transactions to download.");
            return;
        }

        const headers = [
            "Title",
            "Amount",
            "Date",
            "Category",
            "Transaction Type"
        ];

        const rows = transactions.map((item) => [
            item.title,
            item.amount,
            item.date,
            getCategoryName(item),
            item.transaction_type
        ]);

        const escapeCSV = (value) =>
            `"${String(value ?? "").replace(/"/g, '""')}"`;

        const csvContent = [
            headers.map(escapeCSV).join(","),
            ...rows.map((row) => row.map(escapeCSV).join(","))
        ].join("\r\n");

        const blob = new Blob(
            ["\uFEFF" + csvContent],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "transaction-history.csv";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(url), 1000);

        toast.success("Transaction history downloaded!");
    };

    return (
        <div className="transactions-page">
            <Sidebar />
            <main className="transactions-content">
                <div className="transactions-header">
                    <div>
                        <h1>Transactions</h1>
                        <p>Manage all your income and expenses</p>
                    </div>
                    <button
                        className="download-btn"
                        onClick={downloadHistory}
                    >
                        Download History
                    </button>
                </div>

                <div className="transaction-form-card">
                    <h2>
                        {editingId !== null
                            ? "Edit Transaction"
                            : "Add Transaction"}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter transaction title"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Amount</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="Enter amount"
                                min="0.01"
                                step="0.01"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Category</label>

                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Select Category
                                </option>

                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Transaction Type</label>
                            <select
                                name="transaction_type"
                                value={formData.transaction_type}
                                onChange={handleChange}
                            >
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>
                        <div className="form-buttons">
                            <button
                                type="submit"
                                className="save-btn"
                                disabled={loading || categories.length === 0}
                            >
                                {editingId !== null
                                    ? "Update Transaction"
                                    : "Add Transaction"}
                            </button>
                            {editingId !== null && (
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                        {categories.length === 0 && !loading && (
                            <p>
                                Please add a category before creating a transaction.
                            </p>
                        )}
                    </form>
                </div>
                <div className="transaction-table-card">
                    <h2>All Transactions</h2>
                    {loading ? (
                        <p>Loading transactions...</p>
                    ) : error ? (
                        <p className="transaction-error">{error}</p>
                    ) : transactions.length === 0 ? (
                        <p>No transactions available.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="transactions-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Amount</th>
                                        <th>Date</th>
                                        <th>Category</th>
                                        <th>Type</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td>{transaction.title}</td>
                                            <td>
                                                {formatAmount(transaction.amount)}
                                            </td>
                                            <td>{transaction.date}</td>
                                            <td>
                                                {getCategoryName(transaction)}
                                            </td>
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
                                            <td className="action-buttons">
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => handleEdit(transaction)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(transaction.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {showDeleteModal && (
                <div
                    className="delete-modal-overlay"
                    onClick={handleCancelDelete}
                >
                    <div
                        className="delete-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="delete-modal-icon">
                            <i className="bi bi-trash"></i>
                        </div>
                        <h2>Confirm Delete</h2>
                        <p>
                            Are you sure you want to delete this transaction?            
                        </p>
                        <div className="delete-modal-actions">
                            <button
                                className="delete-cancel-btn"
                                onClick={handleCancelDelete}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                className="delete-confirm-btn"
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Transactions;