
import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";
import "../App.css";

function Category() {
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchCategories = async () => {
        try {
            setLoading(true);

            const response = await api.get("/categories/");

            const data = Array.isArray(response.data)
                ? response.data
                : response.data.results || [];

            setCategories(data);
            setError("");

        } catch (err) {
            console.error("Category loading error:", err);

            setError("Unable to load categories.");
            toast.error("Unable to load categories.");

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const showApiError = (err, defaultMessage) => {
        const errorData = err.response?.data;

        if (typeof errorData === "string") {
            toast.error(errorData);

        } else if (errorData && typeof errorData === "object") {
            const messages = Object.values(errorData)
                .flat()
                .filter(Boolean);

            toast.error(messages.join(" ") || defaultMessage);

        } else {
            toast.error(defaultMessage);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const name = categoryName.trim();

        if (!name) {
            toast.warning("Please enter a category name.");
            return;
        }

        setSaving(true);

        try {
            if (editingId !== null) {
                await api.put(`/categories/${editingId}/`, {
                    name: name
                });

                toast.success("Category updated successfully!");

            } else {
                await api.post("/categories/", {
                    name: name
                });

                toast.success("Category added successfully!");
            }

            setCategoryName("");
            setEditingId(null);

            await fetchCategories();

        } catch (err) {
            console.error("Category save error:", err);

            showApiError(err, "Unable to save category.");

        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (category) => {
        setCategoryName(category.name);
        setEditingId(category.id);

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
            await api.delete(`/categories/${deleteId}/`);

            setCategories((previous) =>
                previous.filter((category) => category.id !== deleteId)
            );

            if (editingId === deleteId) {
                setCategoryName("");
                setEditingId(null);
            }

            toast.success("Category deleted successfully!");

            setShowDeleteModal(false);
            setDeleteId(null);

        } catch (err) {
            console.error("Category delete error:", err);

            showApiError(err, "Unable to delete category.");

        } finally {
            setDeleting(false);
        }
    };
    const handleCancel = () => {
        setCategoryName("");
        setEditingId(null);
    };

    return (
        <div className="category-layout">

            {/* Sidebar */}
            <Sidebar />
            <main className="category-page">

                <div className="category-header">
                    <div>
                        <h1>Categories</h1>
                        <p>Manage your income and expense categories</p>
                    </div>
                </div>
                <div className="category-form-card">

                    <h2>
                        {editingId !== null
                            ? "Edit Category"
                            : "Add New Category"}
                    </h2>

                    <form onSubmit={handleSubmit}>

                        <input
                            type="text"
                            placeholder="Enter category name"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            required
                        />

                        <button
                            type="submit"
                            className="category-save-btn"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editingId !== null
                                    ? "Update Category"
                                    : "Add Category"}
                        </button>

                        {editingId !== null && (
                            <button
                                type="button"
                                className="category-cancel-btn"
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                        )}

                    </form>
                </div>
                <div className="category-table-card">

                    <h2>All Categories</h2>

                    {loading ? (
                        <p>Loading categories...</p>
                    ) : error ? (
                        <p className="category-error">{error}</p>
                    ) : categories.length === 0 ? (
                        <p>
                            No categories available. Add your first category!
                        </p>
                    ) : (

                        <div className="category-table-responsive">

                            <table className="category-table">

                                <thead>
                                    <tr>
                                        <th>No.</th>
                                        <th>Category Name</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {categories.map((category, index) => (
                                        <tr key={category.id}>

                                            <td>{index + 1}</td>

                                            <td>{category.name}</td>

                                            <td className="category-actions">

                                                <button
                                                    className="category-edit-btn"
                                                    onClick={() => handleEdit(category)}
                                                    disabled={saving || deleting}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="category-delete-btn"
                                                    onClick={() => handleDelete(category.id)}
                                                    disabled={deleting}
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
                            <FaTrash />
                        </div>

                        <h2>Confirm Delete</h2>

                        <p>
                            Are you sure you want to delete this category?
                           
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

export default Category;