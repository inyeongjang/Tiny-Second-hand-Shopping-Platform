const { User, Product, Report, Transaction } = require('../../models');

class AdminController {
    // 사용자 목록 조회
    async getUsers(req, res) {
        try {
            const users = await User.findAll({
                attributes: [
                    'id', 'username', 'email', 'status', 'createdAt', 'updatedAt'
                ],
                order: [['createdAt', 'DESC']]
            });

            // 각 사용자의 신고 수 조회
            const usersWithReportCount = await Promise.all(users.map(async (user) => {
                const reportCount = await Report.count({
                    where: { reportedUserId: user.id }
                });

                return {
                    ...user.toJSON(),
                    reportCount
                };
            }));

            res.json(usersWithReportCount);
        } catch (error) {
            console.error('사용자 목록 조회 오류:', error);
            res.status(500).json({ message: '사용자 목록을 불러오는데 실패했습니다.' });
        }
    }

    // 사용자 상태 업데이트
    async updateUserStatus(req, res) {
        try {
            const { userId } = req.params;
            const { status } = req.body;

            if (!userId || !status) {
                return res.status(400).json({ message: '사용자 ID와 상태가 필요합니다.' });
            }

            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
            }

            await user.update({ status });

            res.json({ message: '사용자 상태가 업데이트되었습니다.', user });
        } catch (error) {
            console.error('사용자 상태 업데이트 오류:', error);
            res.status(500).json({ message: '사용자 상태 업데이트에 실패했습니다.' });
        }
    }

    // 상품 목록 조회
    async getProducts(req, res) {
        try {
            const products = await Product.findAll({
                include: [
                    {
                        model: User,
                        as: 'seller',
                        attributes: ['id', 'username']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            // 각 상품의 신고 수 조회
            const productsWithReportCount = await Promise.all(products.map(async (product) => {
                const reportCount = await Report.count({
                    where: { productId: product.id }
                });

                return {
                    ...product.toJSON(),
                    sellerName: product.seller ? product.seller.username : null,
                    reportCount
                };
            }));

            res.json(productsWithReportCount);
        } catch (error) {
            console.error('상품 목록 조회 오류:', error);
            res.status(500).json({ message: '상품 목록을 불러오는데 실패했습니다.' });
        }
    }

    // 상품 상태 업데이트
    async updateProductStatus(req, res) {
        try {
            const { productId } = req.params;
            const { status } = req.body;

            if (!productId || !status) {
                return res.status(400).json({ message: '상품 ID와 상태가 필요합니다.' });
            }

            const product = await Product.findByPk(productId);
            if (!product) {
                return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
            }

            await product.update({ status });

            res.json({ message: '상품 상태가 업데이트되었습니다.', product });
        } catch (error) {
            console.error('상품 상태 업데이트 오류:', error);
            res.status(500).json({ message: '상품 상태 업데이트에 실패했습니다.' });
        }
    }

    // 신고 목록 조회
    async getReports(req, res) {
        try {
            const reports = await Report.findAll({
                include: [
                    {
                        model: User,
                        as: 'reporter',
                        attributes: ['id', 'username']
                    },
                    {
                        model: User,
                        as: 'reportedUser',
                        attributes: ['id', 'username']
                    },
                    {
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'title']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            res.json(reports);
        } catch (error) {
            console.error('신고 목록 조회 오류:', error);
            res.status(500).json({ message: '신고 목록을 불러오는데 실패했습니다.' });
        }
    }

    // 신고 처리
    async processReport(req, res) {
        try {
            const { reportId } = req.params;
            const { status, adminNote } = req.body;

            if (!reportId || !status) {
                return res.status(400).json({ message: '신고 ID와 상태가 필요합니다.' });
            }

            const report = await Report.findByPk(reportId);
            if (!report) {
                return res.status(404).json({ message: '신고를 찾을 수 없습니다.' });
            }

            await report.update({
                status,
                adminNote: adminNote || ''
            });

            // 신고가 수락된 경우 추가 작업 수행
            if (status === 'resolved') {
                // 신고된 사용자가 있으면 상태 비활성화
                if (report.reportedUserId) {
                    await User.update(
                        { status: 'inactive' },
                        { where: { id: report.reportedUserId } }
                    );
                }

                // 신고된 상품이 있으면 상태 차단
                if (report.productId) {
                    await Product.update(
                        { status: 'blocked' },
                        { where: { id: report.productId } }
                    );
                }
            }

            res.json({ message: '신고가 처리되었습니다.', report });
        } catch (error) {
            console.error('신고 처리 오류:', error);
            res.status(500).json({ message: '신고 처리에 실패했습니다.' });
        }
    }

    // 거래 목록 조회
    async getTransactions(req, res) {
        try {
            const transactions = await Transaction.findAll({
                include: [
                    {
                        model: User,
                        as: 'buyer',
                        attributes: ['id', 'username']
                    },
                    {
                        model: User,
                        as: 'seller',
                        attributes: ['id', 'username']
                    },
                    {
                        model: Product,
                        attributes: ['id', 'title', 'price']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            res.json(transactions);
        } catch (error) {
            console.error('거래 목록 조회 오류:', error);
            res.status(500).json({ message: '거래 목록을 불러오는데 실패했습니다.' });
        }
    }
}

module.exports = new AdminController(); 