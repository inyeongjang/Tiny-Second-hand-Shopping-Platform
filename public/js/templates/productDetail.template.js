/**
 * 상품 상세 페이지 템플릿
 * @param {Object} product - 상품 정보
 * @param {Object} seller - 판매자 정보
 * @param {string} statusBadgeClass - 상품 상태에 따른 배지 클래스
 * @param {string} statusText - 상품 상태 텍스트
 * @param {Array} thumbnailsHtml - 썸네일 이미지 HTML
 * @param {string} mainImage - 메인 이미지 URL
 * @param {Object} currentUser - 현재 로그인한 사용자
 * @returns {string} HTML 템플릿
 */
function productDetailTemplate(product, seller, statusBadgeClass, statusText, thumbnailsHtml, mainImage, currentUser) {
  // 카테고리 이름 매핑
  const categoryNames = {
    'electronics': '전자제품',
    'clothing': '의류/패션',
    'furniture': '가구/인테리어',
    'beauty': '뷰티/미용',
    'sports': '스포츠/레저',
    'books': '도서/음반',
    'others': '기타'
  };
  
  const categoryName = categoryNames[product.category] || product.category || '분류 없음';
  
  return `
    <div class="container my-5">
        <div class="card shadow-sm">
            <div class="card-header bg-white">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="badge bg-primary px-3 py-2 me-2">
                            <i class="bi bi-tag me-1"></i> ${categoryName}
                        </span>
                        <span class="badge ${statusBadgeClass} px-3 py-2">
                            ${statusText}
                        </span>
                    </div>
                    <div>
                        ${currentUser && product.sellerId !== currentUser.id ? `
                            <button class="btn btn-danger btn-sm" 
                                    onclick="reportProduct('${product.id}', '${product.title}')">
                                <i class="bi bi-flag"></i> 신고하기
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
            <div class="card-body p-0">
                <div class="row g-0">
                    <!-- 상품 이미지 섹션 -->
                    <div class="col-md-6 product-image-container">
                        <img id="mainProductImage" src="${mainImage}" 
                             class="product-detail-img" alt="${product.title}"
                             style="width: 100%; height: 400px; object-fit: contain;"
                             onerror="handleImageError(this)">
                             
                        <div class="row px-3 mt-3">
                            ${thumbnailsHtml}
                        </div>
                    </div>
                    
                    <!-- 상품 정보 섹션 -->
                    <div class="col-md-6">
                        <div class="p-4">
                            <h3 class="product-title mb-3">${product.title}</h3>
                            <h4 class="price mb-4">${formatPrice(product.price)}</h4>
                    
                            <div class="product-details mb-4">
                                <p>
                                    <i class="bi bi-geo-alt me-2"></i>
                                    <span class="text-muted">거래 지역:</span> 
                                    <span class="fw-bold">${product.location || '지역 정보 없음'}</span>
                                </p>
                                <p>
                                    <i class="bi bi-clock me-2"></i>
                                    <span class="text-muted">등록일:</span> 
                                    <span class="fw-bold">${formatDate(product.createdAt)}</span>
                                </p>
                            </div>
                    
                            <div class="seller-info mb-4 p-3 bg-light rounded border">
                                <div class="d-flex align-items-center mb-2">
                                    <div class="seller-profile me-3">
                                        <img src="${seller.profileImage || '/images/placeholder.jpg'}" 
                                             class="rounded-circle" alt="판매자 프로필" width="60" height="60"
                                             style="object-fit: cover" onerror="handleImageError(this)">
                                    </div>
                                    <div class="seller-details">
                                        <h5 class="mb-0">${seller.username || seller.nickname || '판매자 정보 없음'}</h5>
                                        <small class="text-muted">${seller.location || '위치 정보 없음'}</small>
                                    </div>
                                    <div class="ms-auto">
                                        <button class="btn btn-outline-primary" 
                                                onclick="viewSellerProfile('${product.sellerId}', '${seller.username || seller.nickname || '판매자'}')">
                                            <i class="bi bi-person"></i> 프로필 보기
                                        </button>
                                    </div>
                                </div>
                                ${seller.description ? `
                                <div class="seller-description mt-2 border-top pt-2">
                                    <small>${seller.description}</small>
                                </div>
                                ` : ''}
                            </div>
                    
                            <div class="product-description mb-4">
                                <h5 class="mb-3">상품 설명</h5>
                                <p class="product-desc">${product.description || '상품 설명이 없습니다.'}</p>
                            </div>
                    
                            <div class="product-actions d-grid gap-2">
                                ${product.status !== 'sold' ? `
                                    <button class="btn btn-primary btn-lg" 
                                            ${!currentUser ? 'disabled' : ''}
                                            onclick="${!currentUser ? 'alert(\'로그인이 필요합니다.\')' : 
                                                      product.sellerId === (currentUser?.id || '') ? 
                                                      'alert(\'자신의 상품에는 메시지를 보낼 수 없습니다.\')' : 
                                                      `startChat('${product.id}', '${product.sellerId}')`}">
                                        <i class="bi bi-chat-dots me-2"></i> 메시지 보내기
                                    </button>
                                ` : `
                                    <button class="btn btn-secondary btn-lg" disabled>
                                        판매 완료된 상품입니다
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  `;
}

/**
 * 상품 상세 로드 실패시 보여줄 오류 템플릿
 * @param {Error} error - 오류 정보
 * @returns {string} HTML 템플릿
 */
function productDetailErrorTemplate(error) {
  return `
    <div class="container my-5">
        <div class="alert alert-danger">
            상품 정보를 불러오는데 실패했습니다: ${error.message}
        </div>
        <div class="text-center mt-4">
            <button class="btn btn-primary" onclick="loadContent('products')">
                상품 목록으로 돌아가기
            </button>
        </div>
    </div>
  `;
} 