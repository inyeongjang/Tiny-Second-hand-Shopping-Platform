import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function MyProducts({ token }) {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyProducts();
    }, []);

    const fetchMyProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/products/my', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch your products');
            }

            const data = await response.json();
            setProducts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (productId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:3000/api/products/${productId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update product status');
            }

            // 상태 변경 후 목록 다시 불러오기
            fetchMyProducts();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete product');
            }

            // 삭제 후 목록 다시 불러오기
            fetchMyProducts();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (productId) => {
        navigate(`/products/edit/${productId}`);
    };

    if (loading) {
        return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
    }

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">My Products</h2>
                <Link to="/products/add" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-1"></i> Add New Product
                </Link>
            </div>
            
            {error && <div className="alert alert-danger mb-4">{error}</div>}

            {products.length === 0 ? (
                <div className="text-center py-5 bg-light rounded">
                    <p className="mb-3">You haven't listed any products yet.</p>
                    <Link to="/products/add" className="btn btn-primary">Add Your First Product</Link>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>Image</th>
                                <th>Title</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td width="80">
                                        {product.images && product.images[0] ? (
                                            <img 
                                                src={`http://localhost:3000/${product.images[0]}`} 
                                                alt={product.title}
                                                className="img-thumbnail"
                                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div 
                                                className="bg-light d-flex align-items-center justify-content-center"
                                                style={{ width: '60px', height: '60px' }}
                                            >
                                                <i className="bi bi-image text-muted"></i>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <Link to={`/products/${product.id}`} className="text-decoration-none">
                                            {product.title}
                                        </Link>
                                    </td>
                                    <td>₩{product.price.toLocaleString()}</td>
                                    <td>
                                        <select 
                                            className={`form-select form-select-sm ${
                                                product.status === 'available' 
                                                    ? 'border-success text-success' 
                                                    : product.status === 'sold' 
                                                        ? 'border-danger text-danger' 
                                                        : 'border-warning text-warning'
                                            }`}
                                            value={product.status}
                                            onChange={(e) => handleStatusChange(product.id, e.target.value)}
                                        >
                                            <option value="available">Available</option>
                                            <option value="reserved">Reserved</option>
                                            <option value="sold">Sold</option>
                                        </select>
                                    </td>
                                    <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="btn-group btn-group-sm">
                                            <button 
                                                className="btn btn-outline-primary" 
                                                onClick={() => handleEdit(product.id)}
                                                title="Edit product"
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button 
                                                className="btn btn-outline-danger" 
                                                onClick={() => handleDelete(product.id)}
                                                title="Delete product"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default MyProducts; 