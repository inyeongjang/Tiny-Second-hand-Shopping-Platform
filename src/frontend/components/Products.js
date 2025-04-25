import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            let url = 'http://localhost:3000/api/products';
            
            // 카테고리나 검색어로 필터링
            const params = new URLSearchParams();
            if (selectedCategory) params.append('categoryId', selectedCategory);
            if (searchTerm) params.append('search', searchTerm);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            const response = await fetch(url);
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            setError('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/categories');
            const data = await response.json();
            setCategories(data);
        } catch (err) {
            setError('Failed to fetch categories');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProducts();
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setTimeout(() => fetchProducts(), 100);
    };

    const handleSearchTermChange = (e) => {
        setSearchTerm(e.target.value);
    };

    if (loading) {
        return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
    }

    return (
        <div className="container py-5">
            <h2 className="mb-4">Browse Products</h2>
            
            {error && <div className="alert alert-danger mb-4">{error}</div>}
            
            <div className="row mb-4">
                <div className="col-md-8">
                    <form onSubmit={handleSearch} className="d-flex">
                        <input
                            type="text"
                            className="form-control me-2"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={handleSearchTermChange}
                        />
                        <button type="submit" className="btn btn-primary">Search</button>
                    </form>
                </div>
                <div className="col-md-4">
                    <select
                        className="form-select"
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-5 bg-light rounded">
                    <p className="mb-0">No products found</p>
                </div>
            ) : (
                <div className="row">
                    {products.map(product => (
                        <div key={product.id} className="col-md-4 col-sm-6 mb-4">
                            <div className="card h-100 shadow-sm">
                                <Link to={`/products/${product.id}`} className="text-decoration-none">
                                    <div style={{ height: '180px', overflow: 'hidden' }}>
                                        {product.images && product.images[0] ? (
                                            <img
                                                src={`http://localhost:3000/${product.images[0]}`}
                                                className="card-img-top"
                                                alt={product.title}
                                                style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                                            />
                                        ) : (
                                            <div className="bg-light d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
                                                <i className="bi bi-image fs-1 text-muted"></i>
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-body">
                                        <h5 className="card-title">{product.title}</h5>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="fs-5 fw-bold text-success">₩{product.price.toLocaleString()}</span>
                                            <span className="badge bg-secondary">{product.status}</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Products; 