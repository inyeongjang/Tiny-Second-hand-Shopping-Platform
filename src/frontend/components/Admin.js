import React, { useState, useEffect } from 'react';

function Admin({ token }) {
    const [activeTab, setActiveTab] = useState('users');
    const [data, setData] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/admin/${activeTab}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            setData(result);
        } catch (err) {
            setError('Failed to fetch data');
        }
    };

    const handleStatusUpdate = async (type, id, status) => {
        try {
            const response = await fetch(`http://localhost:3000/api/admin/${type}/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(status)
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const renderUsers = () => (
        <div className="table-responsive">
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Nickname</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.email}</td>
                            <td>{user.nickname}</td>
                            <td>
                                {user.isActive ? 'Active' : 'Inactive'}
                                {user.isBlacklisted && ' (Blacklisted)'}
                            </td>
                            <td>
                                <button
                                    className="btn btn-sm btn-warning me-2"
                                    onClick={() => handleStatusUpdate('users', user.id, {
                                        isActive: !user.isActive
                                    })}
                                >
                                    {user.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleStatusUpdate('users', user.id, {
                                        isBlacklisted: !user.isBlacklisted
                                    })}
                                >
                                    {user.isBlacklisted ? 'Unblacklist' : 'Blacklist'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderProducts = () => (
        <div className="table-responsive">
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(product => (
                        <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>{product.title}</td>
                            <td>${product.price}</td>
                            <td>{product.status}</td>
                            <td>
                                <select
                                    className="form-select"
                                    value={product.status}
                                    onChange={(e) => handleStatusUpdate('products', product.id, {
                                        status: e.target.value
                                    })}
                                >
                                    <option value="active">Active</option>
                                    <option value="sold">Sold</option>
                                    <option value="deleted">Deleted</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderReports = () => (
        <div className="table-responsive">
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(report => (
                        <tr key={report.id}>
                            <td>{report.id}</td>
                            <td>{report.type}</td>
                            <td>{report.status}</td>
                            <td>
                                <select
                                    className="form-select"
                                    value={report.status}
                                    onChange={(e) => handleStatusUpdate('reports', report.id, {
                                        status: e.target.value,
                                        adminNote: 'Processed by admin'
                                    })}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderTransactions = () => (
        <div className="table-responsive">
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Buyer</th>
                        <th>Seller</th>
                        <th>Amount</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(transaction => (
                        <tr key={transaction.id}>
                            <td>{transaction.id}</td>
                            <td>{transaction.buyer.nickname}</td>
                            <td>{transaction.seller.nickname}</td>
                            <td>${transaction.amount}</td>
                            <td>{transaction.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="admin-container">
            <h2>Admin Dashboard</h2>
            {error && <div className="alert alert-danger">{error}</div>}

            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Users
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        Products
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reports')}
                    >
                        Reports
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'transactions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('transactions')}
                    >
                        Transactions
                    </button>
                </li>
            </ul>

            {activeTab === 'users' && renderUsers()}
            {activeTab === 'products' && renderProducts()}
            {activeTab === 'reports' && renderReports()}
            {activeTab === 'transactions' && renderTransactions()}
        </div>
    );
}

export default Admin; 