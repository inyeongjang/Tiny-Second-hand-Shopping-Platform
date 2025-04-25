import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ProductDetail({ token }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [seller, setSeller] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProductDetails();
    }, [id]);

    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3000/api/products/${id}`);
            
            if (!response.ok) {
                throw new Error('Product not found');
            }
            
            const data = await response.json();
            setProduct(data);
            
            // 판매자 정보 가져오기
            if (data.sellerId) {
                const sellerResponse = await fetch(`http://localhost:3000/api/users/${data.sellerId}`);
                if (sellerResponse.ok) {
                    const sellerData = await sellerResponse.json();
                    setSeller(sellerData);
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    if (loading) {
        return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">{error}</div>
                <button className="btn btn-primary" onClick={handleBackClick}>Back to Products</button>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning">Product not found</div>
                <button className="btn btn-primary" onClick={handleBackClick}>Back to Products</button>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row">
                <div className="col-md-6">
                    {product.images && product.images.length > 0 ? (
                        <div id="productCarousel" className="carousel slide" data-bs-ride="carousel">
                            <div className="carousel-inner">
                                {product.images.map((image, index) => (
                                    <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                                        <img 
                                            src={`http://localhost:3000/${image}`} 
                                            className="d-block w-100 img-fluid rounded" 
                                            alt={`${product.title} - ${index + 1}`} 
                                        />
                                    </div>
                                ))}
                            </div>
                            {product.images.length > 1 && (
                                <>
                                    <button className="carousel-control-prev" type="button" data-bs-target="#productCarousel" data-bs-slide="prev">
                                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                        <span className="visually-hidden">Previous</span>
                                    </button>
                                    <button className="carousel-control-next" type="button" data-bs-target="#productCarousel" data-bs-slide="next">
                                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                        <span className="visually-hidden">Next</span>
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="text-center p-5 bg-light rounded">
                            <p className="mb-0">No images available</p>
                        </div>
                    )}
                </div>
                <div className="col-md-6">
                    <div className="mb-4">
                        <button className="btn btn-outline-secondary mb-3" onClick={handleBackClick}>
                            <i className="bi bi-arrow-left"></i> Back
                        </button>
                        <h2 className="fw-bold">{product.title}</h2>
                        <div className="d-flex align-items-center mb-3">
                            <span className="badge bg-success fs-6 me-2">₩{product.price.toLocaleString()}</span>
                            <span className="badge bg-secondary">{product.status}</span>
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <h5 className="fw-bold">Description</h5>
                        <p>{product.description}</p>
                    </div>
                    
                    {product.category && (
                        <div className="mb-4">
                            <h5 className="fw-bold">Category</h5>
                            <p>{product.category.name}</p>
                        </div>
                    )}
                    
                    {seller && (
                        <div className="mb-4">
                            <h5 className="fw-bold">Seller</h5>
                            <p>{seller.nickname || seller.email}</p>
                        </div>
                    )}
                    
                    <div className="mb-4">
                        <h5 className="fw-bold">Listed on</h5>
                        <p>{new Date(product.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail; 