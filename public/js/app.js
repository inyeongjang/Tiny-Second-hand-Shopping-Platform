// Global variables
let currentUser = null;
const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to apply consistent button styling
function applyButtonStyle(buttonElement) {
    if (buttonElement) {
        buttonElement.style.backgroundColor = '#343a40';
        buttonElement.style.color = 'white';
        buttonElement.classList.add('btn-primary-custom');
    }
}

// Apply consistent spacing to containers
function applyConsistentSpacing(container) {
    if (container) {
        // Add consistent margin and padding classes
        container.classList.add('my-spacing-consistent');
    }
}

// Initialize the application
async function init() {
    // Add custom CSS for consistent styling
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .btn-primary-custom {
            background-color: #343a40 !important;
            color: white !important;
            border-color: #212529 !important;
        }
        .btn-primary-custom:hover {
            background-color: #23272b !important;
            border-color: #1d2124 !important;
        }
        .btn-outline-primary {
            color: #343a40 !important;
            border-color: #343a40 !important;
        }
        .btn-outline-primary:hover {
            background-color: #343a40 !important;
            color: white !important;
        }
        .my-spacing-consistent {
            margin-bottom: 1.5rem !important;
        }
        .card {
            margin-bottom: 1.5rem !important;
        }
        .form-group, .mb-3 {
            margin-bottom: 1rem !important;
        }
        .section-heading {
            margin-bottom: 1.5rem !important;
            padding-bottom: 0.5rem !important;
            border-bottom: 1px solid #dee2e6;
        }
    `;
    document.head.appendChild(styleElement);

    // 사용자 로그인 상태 확인
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch('http://localhost:3000/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                currentUser = await response.json();
                updateNavigation();
            } else {
                // 토큰이 유효하지 않은 경우 로그아웃 처리
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('사용자 상태 확인 오류:', error);
            // API 서버 연결 실패 시 로컬 스토리지에 저장된 사용자 정보를 시도
            const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
            const userEmail = localStorage.getItem('lastLoggedInEmail');
            
            if (userEmail && registeredUsers[userEmail]) {
                const userData = registeredUsers[userEmail];
                currentUser = {
                    id: userData.id,
                    email: userEmail,
                    username: userData.name,
                    nickname: userData.nickname,
                    role: userEmail === 'admin@example.com' ? 'admin' : 'user',
                    createdAt: userData.createdAt
                };
                updateNavigation();
        }
    }
    }
    
    loadContent('home');

    // Apply styles to existing buttons
    document.querySelectorAll('button.btn:not(.btn-link):not(.btn-outline-danger):not(.btn-close):not(.btn-secondary)').forEach(btn => {
        applyButtonStyle(btn);
    });
}

// Update navigation based on user status
function updateNavigation() {
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const profileLink = document.getElementById('profileLink');
    const adminLink = document.getElementById('adminLink');
    const logoutLink = document.getElementById('logoutLink');
    const myProductsNavItem = document.getElementById('myProductsNavItem');
    const chatsNavItem = document.getElementById('chatsNavItem');
    const adminNavItem = document.getElementById('adminNavItem');

    if (currentUser) {
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        profileLink.style.display = 'block';
        logoutLink.style.display = 'block';
        myProductsNavItem.style.display = 'block';
        chatsNavItem.style.display = 'block';
        
        // admin 계정일 때만 관리자 메뉴 보이기
        if (currentUser.role === 'admin' || currentUser.email === 'admin@example.com') {
            adminLink.style.display = 'block';
            if (adminNavItem) adminNavItem.style.display = 'block';
        } else {
            adminLink.style.display = 'none';
            if (adminNavItem) adminNavItem.style.display = 'none';
        }
    } else {
        loginLink.style.display = 'block';
        registerLink.style.display = 'block';
        profileLink.style.display = 'none';
        adminLink.style.display = 'none';
        logoutLink.style.display = 'none';
        myProductsNavItem.style.display = 'none';
        chatsNavItem.style.display = 'none';
        if (adminNavItem) adminNavItem.style.display = 'none';
    }
}

// Load different content sections
async function loadContent(section) {
    const mainContent = document.getElementById('mainContent');
    
    switch (section) {
        case 'home':
            await loadHomeContent();
            break;
        case 'products':
            await loadProductsContent();
            break;
        case 'auth':
            loadAuthContent(false);
            break;
        case 'register':
            loadAuthContent(true);
            break;
        case 'profile':
            if (currentUser) {
                await loadProfileContent();
            } else {
                loadContent('auth');
            }
            break;
        case 'admin':
                await loadAdminContent();
            break;
        case 'myProducts':
            await loadMyProductsContent();
            break;
        case 'addProduct':
            await loadAddProductContent();
            break;
        case 'chats':
            if (currentUser) {
                await loadChatsContent();
            } else {
                showToast('Please log in to view your chats', 'warning');
                loadContent('auth');
            }
            break;
        case 'community':
            await loadCommunityContent();
            break;
        case 'productDetail':
            const productId = document.getElementById('productId').value;
            await loadProductDetail(productId);
            break;
        default:
            await loadHomeContent();
    }
}

// Load home page content
async function loadHomeContent() {
    const mainContent = document.getElementById('mainContent');
    
    try {
        // HTML 템플릿 불러오기
        const templateContent = await loadTemplate('/templates/home.html');
        
        // 템플릿 내용을 mainContent에 삽입
        mainContent.innerHTML = templateContent;
        
        // 이하 기존 코드는 유지
    // 검색 폼 이벤트 리스너 등록
    document.getElementById('searchForm').addEventListener('submit', handleProductSearch);
    document.getElementById('resetFiltersBtn').addEventListener('click', resetSearchFilters);
    
    // 페이지 로드 시 URL 파라미터에서 검색 조건 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const searchParams = {};
    
    // URL 파라미터가 존재하는 경우, 검색 필드에 값 설정
    if (urlParams.toString()) {
        if (urlParams.has('keyword')) {
            document.getElementById('searchKeyword').value = urlParams.get('keyword');
            searchParams.keyword = urlParams.get('keyword');
        }
        
        if (urlParams.has('category')) {
            document.getElementById('searchCategory').value = urlParams.get('category');
            searchParams.category = urlParams.get('category');
        }
        
        if (urlParams.has('minPrice')) {
            document.getElementById('searchMinPrice').value = urlParams.get('minPrice');
            searchParams.minPrice = urlParams.get('minPrice');
        }
        
        if (urlParams.has('maxPrice')) {
            document.getElementById('searchMaxPrice').value = urlParams.get('maxPrice');
            searchParams.maxPrice = urlParams.get('maxPrice');
        }
        
        if (urlParams.has('location')) {
            document.getElementById('searchLocation').value = urlParams.get('location');
            searchParams.location = urlParams.get('location');
        }
        
        if (urlParams.has('sort')) {
            document.getElementById('searchSort').value = urlParams.get('sort');
            searchParams.sort = urlParams.get('sort');
        }
        
        // URL 파라미터에 따라 상품 목록 로드
        loadProductsList(searchParams);
    } else {
        // 기본 상품 목록 로드
        loadProductsList({});
    }
    
    // Apply button styling
    document.querySelectorAll('button.btn:not(.btn-link):not(.btn-outline-danger):not(.btn-close):not(.btn-secondary)').forEach(btn => {
        applyButtonStyle(btn);
    });
    } catch (error) {
        console.error('홈 화면 로드 오류:', error);
        mainContent.innerHTML = `
            <div class="alert alert-danger">
                홈 화면을 불러오는데 실패했습니다: ${error.message}
            </div>
        `;
    }
}

// Load different content sections
async function loadProductsContent() {
    const mainContent = document.getElementById('mainContent');
    
    try {
        // HTML 템플릿 불러오기
        const templateContent = await loadTemplate('/templates/products.html');
        
        // 템플릿 내용을 mainContent에 삽입
        mainContent.innerHTML = templateContent;
    
    // URL에서 검색 파라미터 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const searchParams = {
        keyword: urlParams.get('keyword') || '',
        category: urlParams.get('category') || '',
        minPrice: urlParams.get('minPrice') || '',
        maxPrice: urlParams.get('maxPrice') || '',
        location: urlParams.get('location') || '',
        sort: urlParams.get('sort') || 'newest'
    };
    
    // 검색 필드에 현재 파라미터 적용
        document.getElementById('searchKeyword').value = searchParams.keyword;
    document.getElementById('categorySelect').value = searchParams.category;
    document.getElementById('minPriceInput').value = searchParams.minPrice;
    document.getElementById('maxPriceInput').value = searchParams.maxPrice;
        document.getElementById('locationSelect').value = searchParams.location;
    document.getElementById('sortSelect').value = searchParams.sort;
    
    // 검색 폼 제출 이벤트 리스너 추가
    document.getElementById('searchForm').addEventListener('submit', handleProductSearch);
    
    // 검색 초기화 버튼 이벤트 리스너 추가
    document.getElementById('resetSearchBtn').addEventListener('click', resetSearchFilters);
    
    // 상품 목록 로드
    loadProductsList(searchParams);
    } catch (error) {
        console.error('상품 목록 화면 로드 오류:', error);
        mainContent.innerHTML = `
            <div class="alert alert-danger">
                상품 목록 화면을 불러오는데 실패했습니다: ${error.message}
            </div>
        `;
    }
}

// 채팅 페이지 로드
async function loadChatsContent() {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        loadContent('auth');
        return;
    }
    
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="container my-4">
            <h2 class="section-heading mb-4">메시지</h2>
            
            <div class="row">
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">채팅 목록</h5>
                        </div>
                        <div id="chatsList" class="list-group list-group-flush">
                            <div class="text-center py-4">
                                <div class="spinner-border spinner-border-sm" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <p class="text-muted small mt-2">채팅 목록 불러오는 중...</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">메시지</h5>
                        </div>
                        <div class="card-body chat-container">
                            <div id="selectedChatInfo">
                                <!-- 채팅 상세 정보가 여기에 표시됩니다 -->
                            </div>
                            <div id="chatMessages" class="chat-messages">
                                <div class="text-center py-5">
                                    <p class="text-muted">채팅방을 선택하세요</p>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer">
                            <form id="messageForm" class="d-flex">
                                <input type="text" id="messageInput" class="form-control me-2" placeholder="메시지를 입력하세요..." disabled>
                                <button type="submit" class="btn btn-primary-custom" disabled>
                                    <i class="bi bi-send"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 채팅 목록 가져오기
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('로그인이 필요합니다');
        }

        const response = await fetch(`${API_BASE_URL}/chats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('채팅 목록을 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        console.log('채팅 목록 응답:', data);
        
        // API 응답 구조가 배열이거나 {chats: [...]} 형태인 경우 모두 처리
        let chats = [];
        if (Array.isArray(data)) {
            chats = data;
        } else if (data.chats && Array.isArray(data.chats)) {
            chats = data.chats;
        } else if (typeof data === 'object') {
            // 다른 형태의 응답 처리
            chats = Array.isArray(data) ? data : [data];
        }
        
        displayChatList(chats);
    } catch (error) {
        console.error('채팅 목록 불러오기 오류:', error);
        const chatsListElement = document.getElementById('chatsList');
        if (chatsListElement) {
            chatsListElement.innerHTML = `
            <div class="alert alert-danger">
                채팅 목록을 불러오는데 실패했습니다: ${error.message}
            </div>
        `;
        }
    }
}

// 채팅 목록 표시
function displayChatList(chats) {
    const chatListElement = document.getElementById('chatsList');
    
    if (!chatListElement) {
        console.error('채팅 목록 요소를 찾을 수 없습니다 (ID: chatsList)');
        return;
    }
    
    if (!chats || chats.length === 0) {
        chatListElement.innerHTML = `
            <div class="text-center py-4">
                <p class="mb-3">아직 채팅이 없습니다.</p>
                <button class="btn" style="background-color: #343a40; color: white;" onclick="loadContent('home')">상품 둘러보기</button>
            </div>
        `;
        return;
    }
    
    const chatListHTML = chats.map(chat => {
        // 대화 상대 찾기
        const otherParticipant = chat.participants?.find(
            participant => participant.userId !== currentUser.id
        );
        
        // 상품 정보
        const product = chat.Product || { title: '상품 정보 없음' };
        
        // 사용자 정보 추출
        let username = '상대방';
        if (otherParticipant?.user) {
            username = otherParticipant.user.nickname || otherParticipant.user.email || username;
        }
        
        // 마지막 메시지 및 날짜 정보
        const lastMessage = chat.lastMessage || '아직 메시지가 없습니다.';
        const updatedDate = new Date(chat.updatedAt || Date.now()).toLocaleDateString();
        
        return `
            <a href="#" class="list-group-item list-group-item-action mb-2" 
               onclick="loadChatMessages('${chat.id}')">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-2">${username}</h5>
                    <small>${updatedDate}</small>
                </div>
                <p class="mb-2">상품: ${product.title}</p>
                <small>${lastMessage}</small>
            </a>
        `;
    }).join('');
    
    chatListElement.innerHTML = chatListHTML;
}

// 채팅 메시지 불러오기
async function loadChatMessages(chatId) {
    console.log(`채팅 메시지 불러오기 시작: chatId=${chatId}`);
    const chatMessagesElement = document.getElementById('chatMessages');
    const selectedChatInfoElement = document.getElementById('selectedChatInfo');
    const messageFormElement = document.getElementById('messageForm');
    
    if (!chatMessagesElement || !selectedChatInfoElement || !messageFormElement) {
        console.error('채팅 메시지 요소를 찾을 수 없습니다.');
        return;
    }
    
    selectedChatInfoElement.innerHTML = `
        <div class="text-center my-3">
            <div class="spinner-border" style="color: #343a40;" role="status"></div>
        </div>
    `;
    
    // 메시지 폼 입력란 활성화
    const messageInput = document.getElementById('messageInput');
    const sendButton = messageFormElement.querySelector('button[type="submit"]');
    if (messageInput) messageInput.disabled = false;
    if (sendButton) sendButton.disabled = false;
    
    try {
        // 로컬 스토리지에서 토큰 가져오기
        const token = localStorage.getItem('token');
        console.log(`인증 토큰 확인: ${token ? '토큰 있음' : '토큰 없음'}`);
        
        if (!token) {
            throw new Error('인증 정보가 없습니다. 다시 로그인해주세요.');
        }
        
        // 채팅 정보 가져오기
        console.log(`채팅 정보 요청: ${API_BASE_URL}/chats/${chatId}`);
        const chatResponse = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log(`채팅 정보 응답 상태: ${chatResponse.status}`);
        
        if (!chatResponse.ok) {
            const errorData = await chatResponse.json().catch(() => ({}));
            console.error('채팅 정보 응답 오류:', errorData);
            throw new Error(errorData.error || '채팅 정보를 불러오는데 실패했습니다.');
        }
        
        const chat = await chatResponse.json();
        console.log('채팅 정보:', chat);
        
        // 메시지 목록 가져오기
        console.log(`메시지 목록 요청: ${API_BASE_URL}/chats/${chatId}/messages`);
        const messagesResponse = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log(`메시지 목록 응답 상태: ${messagesResponse.status}`);

        if (!messagesResponse.ok) {
            const errorData = await messagesResponse.json().catch(() => ({}));
            console.error('메시지 목록 응답 오류:', errorData);
            throw new Error(errorData.error || '메시지를 불러오는데 실패했습니다.');
        }

        const messagesData = await messagesResponse.json();
        const messages = messagesData.messages || messagesData;
        console.log('메시지 데이터:', messages);
        
        // 상품 정보 가져오기
        let productTitle = '상품 정보 없음';
        let productPrice = 0;
        let productId = null;
        let sellerName = '판매자 정보 없음';
        let sellerId = null;
        
        if (chat.Product) {
            productTitle = chat.Product.title;
            productPrice = chat.Product.price;
            productId = chat.Product.id || chat.productId;
        }
            
            // 판매자 정보 가져오기
            try {
                sellerId = chat.senderId === currentUser.id ? chat.receiverId : chat.senderId;
            
            // otherUser 객체를 사용하거나 API 호출
            if (chat.otherUser) {
                sellerName = chat.otherUser.nickname || chat.otherUser.email;
            } else {
                const sellerResponse = await fetch(`${API_BASE_URL}/users/${sellerId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (sellerResponse.ok) {
                    const sellerData = await sellerResponse.json();
                    sellerName = sellerData.nickname || sellerData.email;
                }
                }
            } catch (error) {
                console.error('판매자 정보 로드 오류:', error);
        }
        
        // 채팅 정보 표시
        selectedChatInfoElement.innerHTML = `
            <div class="chat-header">
                <h4>${productTitle}</h4>
                <div class="d-flex justify-content-between">
                    <span>
                        <strong>판매자:</strong> ${sellerName}
                    </span>
                    <span>
                        <strong>가격:</strong> ₩${(productPrice || 0).toLocaleString()}
                    </span>
                </div>
                <div class="d-flex mt-2">
                    ${productId ? `
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="viewProduct('${productId}')">
                        <i class="bi bi-eye"></i> 상품 보기
                    </button>
                    ` : ''}
                    ${sellerId && sellerId !== currentUser.id && productId ? `
                    <button class="btn btn-sm btn-outline-success" onclick="showPaymentDialog('${productId}', '${sellerId}', ${productPrice}, '${productTitle}')">
                        <i class="bi bi-cash"></i> 송금하기
                    </button>` : ''}
                </div>
                <hr>
            </div>
        `;
        
        // 메시지 표시
        displayMessages(messages, chatId);
        
        // 메시지 전송 폼 설정
        setupMessageForm(chatId);
        
    } catch (error) {
        console.error('메시지 불러오기 오류:', error);
        if (selectedChatInfoElement) {
        selectedChatInfoElement.innerHTML = `
            <div class="alert alert-danger">
                메시지를 불러오는데 실패했습니다: ${error.message}
            </div>
        `;
        }
    }
}

// 메시지 표시
function displayMessages(messages, chatId) {
    const chatMessagesElement = document.getElementById('chatMessages');
    
    if (!chatMessagesElement) {
        console.error('채팅 메시지 요소를 찾을 수 없습니다 (ID: chatMessages)');
        return;
    }
    
    if (!messages || messages.length === 0) {
        chatMessagesElement.innerHTML = `
            <div class="text-center py-4">
                <p>대화를 시작해보세요.</p>
            </div>
        `;
        return;
    }
    
    // 메시지 정렬 (최신 순에서 오래된 순으로 변경)
    const sortedMessages = [...messages].sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
    );
    
    // 메시지 HTML 생성
    const messagesHTML = sortedMessages.map(message => {
        // API 응답 구조에 따라 정보 추출
        const senderId = message.senderId || message.userId;
        const isCurrentUserMessage = senderId === currentUser.id;
        const messageClass = isCurrentUserMessage ? 'current-user-message' : 'other-user-message';
        const alignClass = isCurrentUserMessage ? 'align-self-end' : 'align-self-start';
        const content = message.content || message.text || message.message || '내용 없음';
        const createdAt = message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : '알 수 없는 시간';
        
        // 발신자 이름 표시
        let senderName = isCurrentUserMessage ? '나' : '상대방';
        if (message.sender) {
            senderName = message.sender.nickname || message.sender.email || senderName;
        }
        
        return `
            <div class="message-item ${alignClass}">
                <div class="message-bubble ${messageClass}">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <small class="sender-name">${senderName}</small>
                        <small class="message-time">${createdAt}</small>
                    </div>
                    <p>${content}</p>
                    ${!isCurrentUserMessage ? `
                    <div class="message-actions text-end">
                        <button class="btn btn-sm btn-link p-0 text-muted" 
                                onclick="reportUser('${senderId}', '${senderName}')">
                            <small><i class="bi bi-flag"></i> 신고</small>
                        </button>
                    </div>` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    chatMessagesElement.innerHTML = messagesHTML;
    
    // 메시지 목록을 맨 아래로 스크롤
    chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
}

// 메시지 전송 폼 설정
function setupMessageForm(chatId) {
    const messageForm = document.getElementById('messageForm');
    
    if (!messageForm) {
        console.error('메시지 폼을 찾을 수 없습니다 (ID: messageForm)');
        return;
    }
    
    // 이전 이벤트 리스너 제거
    const newForm = messageForm.cloneNode(true);
    messageForm.parentNode.replaceChild(newForm, messageForm);
    
    newForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const messageInput = document.getElementById('messageInput');
        const content = messageInput.value.trim();
        
        if (!content) return;
        
        // 전송 버튼 비활성화
        const sendButton = newForm.querySelector('button[type="submit"]');
        if (sendButton) {
            sendButton.disabled = true;
            sendButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
        }
        
        try {
            console.log(`메시지 전송 요청: ${API_BASE_URL}/chats/${chatId}/messages`);
            const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ content })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || errorData.error || '메시지 전송에 실패했습니다.');
            }
            
            messageInput.value = '';
            
            // 메시지 전송 후 다시 메시지 목록 불러오기
            await loadChatMessages(chatId);
            
        } catch (error) {
            console.error('메시지 전송 오류:', error);
            showToast(`메시지 전송 실패: ${error.message}`, 'danger');
        } finally {
            // 전송 버튼 상태 복원
            if (sendButton) {
                sendButton.disabled = false;
                sendButton.innerHTML = '<i class="bi bi-send"></i>';
            }
        }
    });
}

// 내 상품 페이지 로드
async function loadMyProductsContent() {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        loadContent('auth');
        return;
    }
    
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="container my-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="section-heading">내 상품 관리</h2>
                <button class="btn btn-primary-custom" onclick="loadContent('addProduct')">
                    <i class="bi bi-plus-circle"></i> 상품 등록
                </button>
            </div>
            
            <div id="myProductsContainer" class="row">
                <div class="col-12 text-center py-5">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3">상품 목록을 불러오는 중...</p>
                </div>
            </div>
        </div>
    `;
    
    try {
        // 토큰에서 사용자 ID 추출
        const token = localStorage.getItem('token');
        
        // 사용자의 상품만 조회하도록 API 호출
        const response = await fetch(`${API_BASE_URL}/products?sellerId=${currentUser.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('상품을 불러오는데 실패했습니다.');
        }
        
        const result = await response.json();
        let myProducts = [];
        
        if (Array.isArray(result)) {
            // 결과가 직접 배열인 경우
            myProducts = result.filter(product => product.sellerId === currentUser.id);
        } else if (result.products && Array.isArray(result.products)) {
            // {products: [...]} 형태인 경우
            myProducts = result.products.filter(product => product.sellerId === currentUser.id);
        } else if (result.data && Array.isArray(result.data)) {
            // {data: [...]} 형태인 경우 
            myProducts = result.data.filter(product => product.sellerId === currentUser.id);
        } else {
            console.error('예상치 못한 API 응답 형식:', result);
            throw new Error('API 응답 형식이 예상과 다릅니다.');
        }
        
        displayMyProducts(myProducts);
    } catch (error) {
        console.error('내 상품 불러오기 오류:', error);
        document.getElementById('myProductsContainer').innerHTML = `
            <div class="alert alert-danger">
                상품을 불러오는데 실패했습니다: ${error.message}
            </div>
        `;
    }
}

// 내 상품 표시
function displayMyProducts(products) {
    const myProductsContainer = document.getElementById('myProductsContainer');
    
    if (products.length === 0) {
        myProductsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="mb-3">등록된 상품이 없습니다.</p>
                <button class="btn" style="background-color: #343a40; color: white;" onclick="loadContent('addProduct')">
                    첫 상품 등록하기
                </button>
            </div>
        `;
        return;
    }
    
    const productsHTML = `
            ${products.map(product => `
                <div class="col-md-4 mb-4">
                <div class="card product-card h-100">
                        <div class="card-img-top product-img-container">
                            <img src="${product.images && product.images.length > 0 
                                ? product.images[0] 
                            : '/images/placeholder.jpg'}" 
                            alt="${product.title}" class="img-fluid product-img">
                        </div>
                        <div class="card-body">
                            <h5 class="card-title mb-3">${product.title}</h5>
                        <p class="card-text price mb-3">₩${(product.price || 0).toLocaleString()}</p>
                            <p class="card-text status mb-3">상태: ${getStatusText(product.status)}</p>
                        <div class="product-actions mt-auto">
                                <button class="btn btn-sm" style="background-color: #343a40; color: white;" 
                                    onclick="editProduct('${product.id}')">
                                    수정
                                </button>
                                <button class="btn btn-sm btn-outline-danger ms-2" 
                                    onclick="deleteProduct('${product.id}')">
                                    삭제
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
    `;
    
    myProductsContainer.innerHTML = productsHTML;
    
    // 버튼 스타일 적용
    document.querySelectorAll('button.btn:not(.btn-link):not(.btn-outline-danger):not(.btn-close):not(.btn-secondary)').forEach(btn => {
        applyButtonStyle(btn);
    });
}

// 상품 상태 텍스트 가져오기
function getStatusText(status) {
    const statusMap = {
        'available': '판매중',
        'sold': '판매완료',
        'reserved': '예약중',
        'hidden': '숨김',
        'reported': '신고됨'
    };
    
    return statusMap[status] || status;
}

// 상품 수정 페이지 이동
async function editProduct(productId) {
    // 상품 ID를 히든 필드에 저장
    let hiddenField = document.getElementById('editProductId');
    if (hiddenField) hiddenField.remove();
    hiddenField = document.createElement('input');
    hiddenField.type = 'hidden';
    hiddenField.id = 'editProductId';
    hiddenField.value = productId;
    document.body.appendChild(hiddenField);

    const mainContent = document.getElementById('mainContent');
    // 로딩 상태 표시
    mainContent.innerHTML = `
        <div class="container my-4">
            <h2 class="mb-4 section-heading">상품 정보 수정</h2>
            <div class="text-center py-5">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">상품 정보를 불러오는 중...</p>
            </div>
        </div>
    `;

    try {
        // 상품 정보 불러오기
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('상품 정보를 불러오는데 실패했습니다.');
        const product = await response.json();

        // 템플릿 불러오기
        let templateContent = await loadTemplate('/templates/edit-product.html');

        // 이미지 HTML 생성
        let imagesHTML = '';
        if (product.images && product.images.length > 0) {
            imagesHTML = product.images.map(img => `
                <div class="col-md-3 mb-3">
                    <img src="${img}" class="img-thumbnail" style="height: 150px; object-fit: cover;">
                </div>
            `).join('');
        } else {
            imagesHTML = '<div class="col-12"><p class="text-muted">등록된 이미지가 없습니다.</p></div>';
        }

        // 상태 옵션 선택 처리
        const status = product.status || 'available';
        const statusSelected = {
            availableSelected: status === 'available' ? 'selected' : '',
            reservedSelected: status === 'reserved' ? 'selected' : '',
            soldSelected: status === 'sold' ? 'selected' : '',
            hiddenSelected: status === 'hidden' ? 'selected' : ''
        };

        // 플레이스홀더 치환
        templateContent = templateContent
            .replace('{title}', product.title || '')
            .replace('{description}', product.description || '')
            .replace('{price}', product.price || 0)
            .replace('{location}', product.location || '')
            .replace('{availableSelected}', statusSelected.availableSelected)
            .replace('{reservedSelected}', statusSelected.reservedSelected)
            .replace('{soldSelected}', statusSelected.soldSelected)
            .replace('{hiddenSelected}', statusSelected.hiddenSelected)
            .replace('{imagesHTML}', imagesHTML);

        mainContent.innerHTML = templateContent;

        // 카테고리 불러오기 및 선택
        await loadEditCategories(product.categoryId);

        // 폼 제출 이벤트
        document.getElementById('editProductForm').addEventListener('submit', (e) => handleEditProduct(e, productId));
        // 취소 버튼
        document.getElementById('cancelEditBtn').addEventListener('click', () => loadContent('myProducts'));
        // 삭제 버튼
        document.getElementById('deleteProductBtn').addEventListener('click', () => deleteProduct(productId));

        // 버튼 스타일 적용
        document.querySelectorAll('button.btn:not(.btn-link):not(.btn-outline-danger):not(.btn-close):not(.btn-secondary)').forEach(btn => {
            applyButtonStyle(btn);
        });
    } catch (error) {
        console.error('상품 정보 로드 오류:', error);
        mainContent.innerHTML = `
            <div class="container my-4">
                <div class="alert alert-danger">
                    상품 정보를 불러오는데 실패했습니다: ${error.message}
                </div>
                <button class="btn btn-primary-custom" onclick="loadContent('myProducts')">내 상품 목록으로 돌아가기</button>
            </div>
        `;
    }
}


// 상품 삭제
async function deleteProduct(productId) {
    if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('상품 삭제에 실패했습니다.');
        }
        
        showToast('상품이 성공적으로 삭제되었습니다.', 'success');
        loadMyProductsContent(); // 목록 새로고침
    } catch (error) {
        console.error('상품 삭제 오류:', error);
        showToast(`상품 삭제 실패: ${error.message}`, 'danger');
    }
}

// 상품 등록 페이지 로드
async function loadAddProductContent() {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        loadContent('auth');
        return;
    }
    
    const mainContent = document.getElementById('mainContent');
    // 템플릿 파일을 비동기로 불러와 삽입
    const templateContent = await loadTemplate('/templates/add-product.html');
    mainContent.innerHTML = templateContent;

    
    // 카테고리 불러오기
    loadCategories();
    
    // 이미지 미리보기 설정
    setupImagePreview();
    
    // 폼 제출 이벤트 설정
    document.getElementById('addProductForm').addEventListener('submit', handleAddProduct);
    
    // Apply button styling
    document.querySelectorAll('button.btn:not(.btn-link):not(.btn-outline-danger):not(.btn-close):not(.btn-secondary)').forEach(btn => {
        applyButtonStyle(btn);
    });
}

// 카테고리 옵션 불러오기
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        
        if (!response.ok) {
            throw new Error('카테고리를 불러오는데 실패했습니다.');
        }
        
        const categories = await response.json();
        const categorySelect = document.getElementById('category');
        
        // 기본 옵션 유지
        const defaultOption = categorySelect.querySelector('option');
        categorySelect.innerHTML = '';
        categorySelect.appendChild(defaultOption);
        
        // 카테고리 옵션 추가
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('카테고리 불러오기 오류:', error);
        alert(`카테고리 불러오기 실패: ${error.message}`);
    }
}

// 이미지 미리보기
function setupImagePreview() {
    const imagesInput = document.getElementById('images');
    const imagePreview = document.getElementById('imagePreview');
    
    imagesInput.addEventListener('change', () => {
        imagePreview.innerHTML = '';
        
        if (imagesInput.files.length > 5) {
            alert('최대 5개의 이미지만 업로드할 수 있습니다.');
            imagesInput.value = '';
            return;
        }
        
        for (const file of imagesInput.files) {
            if (!file.type.startsWith('image/')) {
                continue;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'img-thumbnail col-md-3 mb-2';
                img.style.height = '150px';
                img.style.objectFit = 'cover';
                imagePreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });
}

// 프로필 페이지 로드
async function loadProfileContent() {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        loadContent('auth');
        return;
    }
    
    const mainContent = document.getElementById('mainContent');

    try {
        // API 요청으로 최신 사용자 정보 가져오기
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('프로필 정보를 불러오는데 실패했습니다.');
        }

        const userData = await response.json();
        
        // 현재 사용자 정보 업데이트
        Object.assign(currentUser, userData);
        
        mainContent.innerHTML = `
            <div class="profile-container py-5">
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-md-10">
                            <h2 class="text-center mb-4">마이페이지</h2>
                
                <div class="row">
                                <!-- 내 활동 카드 -->
                    <div class="col-md-4 mb-4">
                        <div class="card shadow h-100">
                            <div class="card-body">
                                            <h3 class="card-title mb-4">내 활동</h3>
                                            <div class="text-center mb-3">
                                    <img src="${currentUser.profileImage || '/images/placeholder.jpg'}" 
                                                    class="rounded-circle profile-image mb-2" alt="Profile" width="100" height="100">
                                                <h4 class="mb-1">${currentUser.username || currentUser.nickname || '이름 없음'}</h4>
                                                <p class="text-muted">${currentUser.email}</p>
                                                <p class="intro-text">${currentUser.bio || currentUser.intro || ''}</p>
                                </div>
                                            <div class="d-grid gap-2 mt-3">
                                                <button class="btn btn-secondary" onclick="loadContent('myProducts')">내 상품 관리</button>
                                                <button class="btn btn-secondary" onclick="loadContent('chats')">내 메시지</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                                <!-- 프로필 수정 및 비밀번호 변경 -->
                    <div class="col-md-8">
                                    <div class="card shadow mb-4">
                            <div class="card-body">
                                            <h3 class="card-title mb-4">프로필 수정</h3>
                                            <form id="profileForm" onsubmit="updateProfile(event); return false;">
                                                <div class="mb-3">
                                                    <label for="nickname" class="form-label">닉네임</label>
                                                    <input type="text" class="form-control" id="nickname" name="nickname" 
                                                        value="${currentUser.nickname || currentUser.username || ''}" placeholder="닉네임 입력">
                                    </div>
                                                <div class="mb-3">
                                                    <label for="intro" class="form-label">소개글</label>
                                                    <textarea class="form-control" id="intro" name="intro" rows="4" 
                                                        placeholder="안녕하세요!">${currentUser.bio || currentUser.intro || ''}</textarea>
                                    </div>
                                                <div class="d-grid">
                                                    <button type="submit" class="btn btn-dark" id="saveProfileBtn">프로필 수정</button>
                            </div>
                                            </form>
                        </div>
                                    </div>
                                    
                                    <div class="card shadow">
                                        <div class="card-body">
                                            <h3 class="card-title mb-4">비밀번호 변경</h3>
                                            <form id="passwordForm" onsubmit="changePassword(event); return false;">
                                                <div class="mb-3">
                                                    <label for="currentPassword" class="form-label">현재 비밀번호</label>
                                                    <input type="password" class="form-control" id="currentPassword" name="currentPassword" placeholder="••••••••">
                                    </div>
                                                <div class="mb-3">
                                                    <label for="newPassword" class="form-label">새 비밀번호</label>
                                                    <input type="password" class="form-control" id="newPassword" name="newPassword" placeholder="••••••••">
                                    </div>
                                                <div class="mb-3">
                                                    <label for="confirmPassword" class="form-label">새 비밀번호 확인</label>
                                                    <input type="password" class="form-control" id="confirmPassword" name="confirmPassword" placeholder="••••••••">
                                    </div>
                                                <div class="d-grid">
                                                    <button type="submit" class="btn btn-dark" id="changePasswordBtn">비밀번호 변경</button>
                                                </div>
                                            </form>
                                            <div id="passwordMessage" class="alert mt-3" style="display: none;"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 버튼 스타일 적용
        document.querySelectorAll('button.btn:not(.btn-link):not(.btn-outline-danger):not(.btn-close):not(.btn-secondary)').forEach(btn => {
            applyButtonStyle(btn);
        });
    } catch (error) {
        console.error('프로필 로드 오류:', error);
        showToast('프로필 정보를 불러오는데 실패했습니다.', 'danger');
        
        // API 오류 시 기본 마이페이지 표시 (폴백)
        mainContent.innerHTML = `
        <div class="profile-container py-5">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-md-8">
                        <div class="card shadow">
                            <div class="card-body">
                                <h2 class="card-title text-center mb-4">사용자 프로필</h2>
                                <div class="profile-info">
                                    <div class="row mb-3">
                                        <div class="col-md-4 fw-bold">이름:</div>
                                        <div class="col-md-8">${currentUser.username || currentUser.nickname || '이름 없음'}</div>
                                    </div>
                                    <div class="row mb-3">
                                        <div class="col-md-4 fw-bold">이메일:</div>
                                        <div class="col-md-8">${currentUser.email}</div>
                                    </div>
                                    <div class="row mb-3">
                                        <div class="col-md-4 fw-bold">가입일:</div>
                                        <div class="col-md-8">${new Date(currentUser.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div class="profile-actions text-center mt-4">
                                        <button class="btn btn-primary me-2" onclick="loadContent('myProducts')">내 상품 관리</button>
                                        <button class="btn btn-primary" onclick="loadContent('chats')">내 메시지</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    }
}

// 프로필 정보 업데이트
async function updateProfile(event) {
    if (event) event.preventDefault();
    
    const nickname = document.getElementById('nickname').value;
    const intro = document.getElementById('intro').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                nickname,
                bio: intro
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '프로필 업데이트에 실패했습니다.');
        }
        
        // 현재 사용자 정보 업데이트
        currentUser.nickname = nickname;
        currentUser.bio = intro;
        
        showToast('프로필이 성공적으로 업데이트되었습니다.', 'success');
        
        // 프로필 페이지 컨텐츠 새로고침 없이 화면 업데이트
        document.querySelector('.profile-image + h4').innerText = nickname || currentUser.username || '이름 없음';
        document.querySelector('.intro-text').innerText = intro || '';
    } catch (error) {
        console.error('프로필 업데이트 오류:', error);
        showToast(`프로필 업데이트 실패: ${error.message}`, 'danger');
    }
}

// 비밀번호 변경
async function changePassword(event) {
    if (event) event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const passwordMessage = document.getElementById('passwordMessage');
    
    // 메시지 컨테이너 초기화
    passwordMessage.style.display = 'none';
    passwordMessage.className = 'alert mt-3';
    
    // 비밀번호 확인
    if (newPassword !== confirmPassword) {
        passwordMessage.innerText = '새 비밀번호가 일치하지 않습니다.';
        passwordMessage.className = 'alert alert-danger mt-3';
        passwordMessage.style.display = 'block';
        return;
    }
    
    // 비밀번호 유효성 검사
    if (newPassword.length < 6) {
        passwordMessage.innerText = '비밀번호는 최소 6자 이상이어야 합니다.';
        passwordMessage.className = 'alert alert-danger mt-3';
        passwordMessage.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '비밀번호 변경에 실패했습니다.');
        }
        
        // 비밀번호 입력 필드 초기화
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        // 성공 메시지 표시
        passwordMessage.innerText = '비밀번호가 성공적으로 변경되었습니다.';
        passwordMessage.className = 'alert alert-success mt-3';
        passwordMessage.style.display = 'block';
        
        setTimeout(() => {
            passwordMessage.style.display = 'none';
        }, 3000);
    } catch (error) {
        console.error('비밀번호 변경 오류:', error);
        passwordMessage.innerText = `비밀번호 변경 실패: ${error.message}`;
        passwordMessage.className = 'alert alert-danger mt-3';
        passwordMessage.style.display = 'block';
    }
}

// 상품 등록 처리
async function handleAddProduct(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    const category = document.getElementById('category').value;
    const location = document.getElementById('location').value;
    const imagesInput = document.getElementById('images');
    
    // 로딩 상태 표시
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 처리 중...';
    submitBtn.disabled = true;
    
    // FormData 생성
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('categoryId', category); // 'category'에서 'categoryId'로 변경
    formData.append('location', location);
    
    if (currentUser) {
        formData.append('sellerId', currentUser.id); // 판매자 ID 추가
    }
    
    // 이미지 추가
    if (imagesInput.files.length > 0) {
        for (const file of imagesInput.files) {
            formData.append('images', file);
        }
    } else {
        // 이미지가 없는 경우 기본 이미지 URL 설정
        formData.append('images', '/images/placeholder.jpg');
    }
    
    try {
        // 개발 환경에서 API가 없는 경우 대비
        let response;
        
        try {
            // FormData 사용 시 Content-Type 헤더를 지정하지 않음 (브라우저가 자동으로 multipart/form-data로 설정)
            response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                    // Content-Type을 지정하지 않아 브라우저가 자동으로 설정하도록 함
                },
                body: formData
            });
            
            console.log('상품 등록 요청 완료:', response.status);
        } catch (error) {
            console.warn('API 서버 연결 실패, 가상 응답 생성:', error);
            // API가 없는 경우 가상 응답 생성
            throw new Error('API 서버가 연결되지 않아 상품을 등록할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('서버 응답 오류:', errorData);
            throw new Error(errorData.message || '상품 등록에 실패했습니다.');
        }
        
        showToast('상품이 성공적으로 등록되었습니다.', 'success');
        loadContent('myProducts');
    } catch (error) {
        console.error('상품 등록 오류:', error);
        showToast(`상품 등록 실패: ${error.message}`, 'danger');
        
        // 버튼 상태 복원
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
}

// 커뮤니티 채팅 페이지 로드
async function loadCommunityContent() {
    if (!currentUser) {
        showToast('커뮤니티 채팅은 로그인이 필요합니다.', 'warning');
        loadContent('auth');
        return;
    }
    
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="container py-4">
            <div class="row">
                <div class="col-12 mb-4">
                    <div class="d-flex justify-content-between align-items-center">
                        <h2>커뮤니티 채팅</h2>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-3">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="mb-0">채팅방 목록</h5>
                        </div>
                        <div class="card-body">
                            <ul class="list-group chat-room-list" id="chatRoomList">
                                <li class="list-group-item active" onclick="switchChatRoom('general')">
                                    <i class="bi bi-hash"></i> 일반
                                </li>
                                <li class="list-group-item" onclick="switchChatRoom('buy-sell')">
                                    <i class="bi bi-hash"></i> 거래 정보
                                </li>
                                <li class="list-group-item" onclick="switchChatRoom('help')">
                                    <i class="bi bi-hash"></i> 도움말
                                </li>
                            </ul>
                            
                            <hr>
                            
                            <div class="online-users">
                                <h6>접속 중인 사용자</h6>
                                <ul class="list-unstyled" id="onlineUsersList">
                                    <li class="text-muted">
                                        <i class="bi bi-circle-fill text-success me-1" style="font-size: 0.5rem;"></i> 
                                        ${currentUser.username || currentUser.nickname || currentUser.email} (나)
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-9">
                    <div class="card">
                        <div class="card-header">
                            <div class="d-flex justify-content-between align-items-center">
                                <h5 class="mb-0"><i class="bi bi-hash"></i> <span id="currentRoomName">일반</span></h5>
                            </div>
                        </div>
                        <div class="card-body">
                            <div id="chatMessages" class="chat-messages">
                                <div class="text-center my-4">
                                    <div class="spinner-border" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer">
                            <form id="communityMessageForm" class="d-flex">
                                <input 
                                    type="text" 
                                    id="communityMessageInput" 
                                    class="form-control me-2" 
                                    placeholder="메시지를 입력하세요..." 
                                    autocomplete="off" 
                                    required
                                >
                                <button type="submit" class="btn" style="background-color: #343a40; color: white;">
                                    <i class="bi bi-send"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 스타일 추가
    const style = document.createElement('style');
    style.textContent = `
        .chat-messages {
            height: 500px;
            overflow-y: auto;
            padding: 1rem;
            background-color: #f8f9fa;
            border-radius: 0.25rem;
        }
        .chat-message {
            margin-bottom: 1rem;
            padding: 0.75rem;
            border-radius: 0.5rem;
            max-width: 80%;
        }
        .chat-message.own {
            background-color: #e9f5ff;
            align-self: flex-end;
            margin-left: auto;
        }
        .chat-message.other {
            background-color: #f0f0f0;
            align-self: flex-start;
        }
        .message-meta {
            font-size: 0.75rem;
            color: #6c757d;
            margin-bottom: 0.25rem;
        }
        .message-content {
            word-break: break-word;
        }
        .chat-room-list .list-group-item {
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .chat-room-list .list-group-item:hover {
            background-color: #f8f9fa;
        }
        .chat-room-list .list-group-item.active {
            background-color: #343a40;
            border-color: #343a40;
        }
    `;
    document.head.appendChild(style);
    
    // 현재 활성화된 채팅방
    let currentRoom = 'general';
    
    
    // 커뮤니티 메시지 폼 이벤트 리스너 설정
    document.getElementById('communityMessageForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const messageInput = document.getElementById('communityMessageInput');
        const message = messageInput.value.trim();
        
        if (message) {
            sendCommunityMessage(message, currentRoom);
            messageInput.value = '';
        }
    });
    
    // 초기 메시지 로드
    loadCommunityMessages(currentRoom);
    
    // 전역 스코프에 채팅방 전환 함수 노출
    window.switchChatRoom = function(roomId) {
        // 이전 활성화 항목 비활성화
        document.querySelectorAll('.chat-room-list .list-group-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 새 항목 활성화
        const selectedRoom = document.querySelector(`.chat-room-list .list-group-item[onclick="switchChatRoom('${roomId}')"]`);
        if (selectedRoom) {
            selectedRoom.classList.add('active');
        }
        
        // 채팅방 이름 업데이트
        const roomNames = {
            'general': '일반',
            'buy-sell': '거래 정보',
            'help': '도움말'
        };
        
        document.getElementById('currentRoomName').textContent = roomNames[roomId] || roomId;
        
        // 현재 채팅방 업데이트 및 메시지 로드
        currentRoom = roomId;
        loadCommunityMessages(currentRoom);
    };

    // After rendering the community content, apply consistent styling to buttons
    document.querySelectorAll('button.btn:not(.btn-link):not(.btn-outline-danger):not(.btn-close):not(.btn-secondary)').forEach(btn => {
        applyButtonStyle(btn);
    });
}

// 커뮤니티 채팅 메시지 전송
function sendCommunityMessage(message, roomId) {
    if (!currentUser) {
        showToast('메시지를 보내려면 로그인이 필요합니다.', 'warning');
        return;
    }
    
    // 현재 시간 포맷
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // 메시지 객체 생성
    const messageObj = {
        id: Date.now().toString(),
        roomId: roomId,
        senderId: currentUser.id,
        senderName: currentUser.username || currentUser.nickname || currentUser.email,
        message: message,
        timestamp: now.toISOString(),
        timeString: timeString
    };
    
    // 메시지 화면에 즉시 표시 (낙관적 UI 업데이트)
    appendCommunityMessage(messageObj, true);
    
    // API 요청
    try {
        fetch(`${API_BASE_URL}/community/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                roomId: roomId,
                message: message
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('메시지 전송에 실패했습니다.');
            }
            return response.json();
        })
        .catch(error => {
            console.error('메시지 전송 오류:', error);
            showToast('메시지 전송에 실패했습니다.', 'danger');
        });
    } catch (error) {
        console.error('메시지 전송 오류:', error);
        showToast('메시지 전송에 실패했습니다.', 'danger');
    }
}

// 커뮤니티 채팅 메시지 로드
async function loadCommunityMessages(roomId) {
    const chatMessagesElement = document.getElementById('chatMessages');
    
    // 로딩 표시
    chatMessagesElement.innerHTML = `
        <div class="text-center my-4">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
    
    try {
        // API 요청 (백엔드가 없는 경우 더미 데이터 사용)
        let messages = [];
        
        try {
            const response = await fetch(`${API_BASE_URL}/community/rooms/${roomId}/messages`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('메시지를 불러오는데 실패했습니다.');
            }
            
            const data = await response.json();
            messages = data.messages || data;
        } catch (error) {
            console.warn('API 연결 실패, 더미 데이터 사용:', error);
            
            // 더미 데이터 생성
            const dummyMessages = [
                {
                    id: '1',
                    roomId: roomId,
                    senderId: 'system',
                    senderName: '시스템',
                    message: `'${roomId === 'general' ? '일반' : roomId === 'buy-sell' ? '거래 정보' : '도움말'}' 채팅방에 오신 것을 환영합니다.`,
                    timestamp: new Date().toISOString(),
                    timeString: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ];
            
            if (roomId === 'general') {
                dummyMessages.push(
                    {
                        id: '2',
                        roomId: roomId,
                        senderId: 'user1',
                        senderName: '홍길동',
                        message: '안녕하세요! 모두들 반갑습니다.',
                        timestamp: new Date(Date.now() - 60000).toISOString(),
                        timeString: new Date(Date.now() - 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    },
                    {
                        id: '3',
                        roomId: roomId,
                        senderId: 'user2',
                        senderName: '김철수',
                        message: '안녕하세요~ 오늘 날씨가 정말 좋네요.',
                        timestamp: new Date(Date.now() - 30000).toISOString(),
                        timeString: new Date(Date.now() - 30000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                );
            } else if (roomId === 'buy-sell') {
                dummyMessages.push(
                    {
                        id: '2',
                        roomId: roomId,
                        senderId: 'user3',
                        senderName: '이영희',
                        message: '삼성 노트북 팝니다. 상태 좋아요. DM 주세요.',
                        timestamp: new Date(Date.now() - 120000).toISOString(),
                        timeString: new Date(Date.now() - 120000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    },
                    {
                        id: '3',
                        roomId: roomId,
                        senderId: 'user4',
                        senderName: '박지민',
                        message: '자전거 중고 구해요. 추천 부탁드립니다.',
                        timestamp: new Date(Date.now() - 60000).toISOString(),
                        timeString: new Date(Date.now() - 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                );
            } else if (roomId === 'help') {
                dummyMessages.push(
                    {
                        id: '2',
                        roomId: roomId,
                        senderId: 'user5',
                        senderName: '최민준',
                        message: '상품 등록은 어떻게 하나요?',
                        timestamp: new Date(Date.now() - 180000).toISOString(),
                        timeString: new Date(Date.now() - 180000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    },
                    {
                        id: '3',
                        roomId: roomId,
                        senderId: 'admin',
                        senderName: '관리자',
                        message: '상단 메뉴에서 "상품 등록" 버튼을 클릭하시면 됩니다. 추가 질문이 있으시면 언제든 물어보세요!',
                        timestamp: new Date(Date.now() - 150000).toISOString(),
                        timeString: new Date(Date.now() - 150000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                );
            }
            
            messages = dummyMessages;
        }
        
        // 메시지 표시
        displayCommunityMessages(messages);
        
        // 5초마다 새 메시지 확인 (폴링)
        if (window.communityMessagesInterval) {
            clearInterval(window.communityMessagesInterval);
        }
        
        window.communityMessagesInterval = setInterval(() => {
            fetchNewCommunityMessages(roomId);
        }, 5000);
        
    } catch (error) {
        console.error('커뮤니티 메시지 로드 오류:', error);
        chatMessagesElement.innerHTML = `
            <div class="alert alert-danger">
                메시지를 불러오는데 실패했습니다: ${error.message}
            </div>
        `;
    }
}

// 새 커뮤니티 메시지 가져오기 (폴링)
async function fetchNewCommunityMessages(roomId) {
    try {
        const lastMessageElement = document.querySelector('#chatMessages .chat-message:last-child');
        let lastMessageId = null;
        
        if (lastMessageElement) {
            lastMessageId = lastMessageElement.dataset.messageId;
        }
        
        // API 요청
        const response = await fetch(`${API_BASE_URL}/community/rooms/${roomId}/messages?since=${lastMessageId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('새 메시지를 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        const newMessages = data.messages || data;
        
        // 새 메시지가 있으면 추가
        if (newMessages && newMessages.length > 0) {
            newMessages.forEach(message => {
                appendCommunityMessage(message, false);
            });
        }
    } catch (error) {
        console.error('새 메시지 로드 오류:', error);
        // 폴링이므로 실패해도 사용자에게 알리지 않음
    }
}

// 커뮤니티 메시지 표시
function displayCommunityMessages(messages) {
    const chatMessagesElement = document.getElementById('chatMessages');
    
    if (!messages || messages.length === 0) {
        chatMessagesElement.innerHTML = `
            <div class="text-center py-4">
                <p class="text-muted">아직 메시지가 없습니다. 첫 메시지를 보내보세요!</p>
            </div>
        `;
        return;
    }
    
    // 메시지 정렬 (오래된 순)
    const sortedMessages = [...messages].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    // 메시지 컨테이너 초기화
    chatMessagesElement.innerHTML = '';
    
    // 메시지 추가
    sortedMessages.forEach(message => {
        appendCommunityMessage(message, false);
    });
    
    // 스크롤을 맨 아래로
    chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
}

// 커뮤니티 메시지 추가
function appendCommunityMessage(message, isOwn) {
    const chatMessagesElement = document.getElementById('chatMessages');
    
    // 메시지가 현재 사용자의 것인지 확인
    const isCurrentUserMessage = isOwn || (currentUser && message.senderId === currentUser.id);
    
    // 시간 문자열 포맷팅
    const timeString = message.timeString || new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // 시스템 메시지인지 확인
    const isSystemMessage = message.senderId === 'system';
    
    // 메시지 요소 생성
    const messageElement = document.createElement('div');
    messageElement.className = `d-flex ${isCurrentUserMessage ? 'justify-content-end' : 'justify-content-start'} mb-3`;
    messageElement.dataset.messageId = message.id;
    
    // 시스템 메시지는 다르게 표시
    if (isSystemMessage) {
        messageElement.innerHTML = `
            <div class="text-center w-100 my-2">
                <div class="system-message py-1 px-3 d-inline-block bg-light rounded">
                    <small>${message.message}</small>
                </div>
            </div>
        `;
    } else {
        messageElement.innerHTML = `
            <div class="chat-message ${isCurrentUserMessage ? 'own' : 'other'}">
                <div class="message-meta d-flex justify-content-between align-items-center">
                    <span class="sender-name">${message.senderName}</span>
                    <span class="message-time">${timeString}</span>
                </div>
                <div class="message-content">${message.message}</div>
                ${!isCurrentUserMessage ? `
                <div class="message-actions mt-1 text-end">
                    <button class="btn btn-sm btn-link p-0 text-muted report-user-btn" 
                            onclick="reportUser('${message.senderId}', '${message.senderName}')">
                        <small><i class="bi bi-flag"></i> 신고</small>
                    </button>
                </div>` : ''}
            </div>
        `;
    }
    
    // 메시지를 채팅 영역에 추가
    chatMessagesElement.appendChild(messageElement);
    
    // 스크롤을 맨 아래로
    chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
}

// 앱 초기화
window.onload = function() {
    console.log('App initialized');
    init();
    
    // 클릭 이벤트 디버깅
    document.addEventListener('click', function(e) {
        const target = e.target;
        if (target.matches('button')) {
            console.log('버튼 클릭:', target.textContent, target.onclick);
        }
    });
    
    // 관리자 계정 접근 힌트
    console.log('✨ 관리자 계정 접근 방법:');
    console.log('- 이메일: admin@example.com');
    console.log('- 비밀번호: 일반 비밀번호 입력 (API 연동 전이므로 아무 비밀번호나 가능)');
};

// 사용자 신고 함수
async function reportUser(userId, username) {
    if (!currentUser) {
        alert('사용자를 신고하려면 로그인이 필요합니다.');
        loadContent('auth');
        return;
    }

    // 신고 사유 입력 받기
    const reasonElement = document.createElement('div');
    reasonElement.innerHTML = `
        <div class="form-group mb-3">
            <label for="reportReason" class="form-label">신고 사유:</label>
            <select class="form-control" id="reportReason" required>
                <option value="">신고 사유 선택</option>
                <option value="spam">스팸/광고</option>
                <option value="abuse">욕설/비방</option>
                <option value="inappropriate">부적절한 콘텐츠</option>
                <option value="scam">사기/기만</option>
                <option value="other">기타</option>
            </select>
        </div>
        <div class="form-group" id="otherReasonContainer" style="display: none;">
            <label for="otherReason" class="form-label">상세 사유:</label>
            <textarea class="form-control" id="otherReason" rows="3" placeholder="신고 사유를 자세히 설명해주세요"></textarea>
        </div>
    `;

    // 모달 생성
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal fade';
    modalContainer.id = 'reportUserModal';
    modalContainer.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">사용자 신고: ${username}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="reportUserModalBody">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                    <button type="button" class="btn btn-danger" id="submitUserReport">신고하기</button>
                </div>
            </div>
        </div>
    `;

    // 모달을 문서에 추가
    document.body.appendChild(modalContainer);
    document.getElementById('reportUserModalBody').appendChild(reasonElement);

    // 기타 사유 선택 시 추가 필드 표시
    document.getElementById('reportReason').addEventListener('change', function() {
        const otherReasonContainer = document.getElementById('otherReasonContainer');
        if (this.value === 'other') {
            otherReasonContainer.style.display = 'block';
        } else {
            otherReasonContainer.style.display = 'none';
        }
    });

    // Bootstrap 모달 초기화
    const reportUserModal = new bootstrap.Modal(document.getElementById('reportUserModal'));
    reportUserModal.show();

    // 신고 제출 처리
    document.getElementById('submitUserReport').addEventListener('click', async function() {
        const reportReason = document.getElementById('reportReason').value;
        if (!reportReason) {
            alert('신고 사유를 선택해주세요.');
            return;
        }

        let reason = reportReason;
        if (reportReason === 'other') {
            const otherReason = document.getElementById('otherReason').value.trim();
            if (!otherReason) {
                alert('상세 신고 사유를 입력해주세요.');
                return;
            }
            reason = `기타: ${otherReason}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/reports/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    reportedUserId: userId,
                    reason: reason
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '사용자 신고 실패');
            }

            const result = await response.json();
            console.log('User report submitted:', result);
            
            reportUserModal.hide();
            setTimeout(() => {
                document.getElementById('reportUserModal').remove();
                showToast('사용자 신고가 성공적으로 접수되었습니다. 검토 후 조치하겠습니다.', 'success');
            }, 500);
        } catch (error) {
            console.error('사용자 신고 오류:', error);
            alert(`신고 접수 실패: ${error.message}`);
        }
    });
}

/**
 * 관리자 대시보드 콘텐츠를 로드합니다.
 */
async function loadAdminContent() {
    // 권한 체크 부분 제거
    
    const templatePath = 'templates/admin.html';
    const adminContent = await loadTemplate(templatePath);
    
    // 'content' 요소가 존재하는지 확인
    const contentElement = document.getElementById('content');
    if (contentElement) {
        contentElement.innerHTML = adminContent;
    } else {
        // 'content' 요소가 없으면 'mainContent' 요소에 시도
        const mainContentElement = document.getElementById('mainContent');
        if (mainContentElement) {
            mainContentElement.innerHTML = adminContent;
        } else {
            console.error('Error: Neither "content" nor "mainContent" elements found.');
            return;
        }
    }
    
    // 선택된 탭에 따라 데이터 로드
    document.querySelectorAll('#adminTabs button').forEach(button => {
        button.addEventListener('click', (event) => {
            const tabId = event.target.getAttribute('data-bs-target').substring(1);
            loadAdminTabData(tabId);
        });
    });
    
    // 초기 탭(사용자) 데이터 로드
    loadAdminTabData('users');
}

// 관리자 탭 데이터 로드
async function loadAdminTabData(tabName) {
    try {
        // API 요청
        let data = [];
        
        // 실제 API 요청 시도
        try {
            const response = await fetch(`${API_BASE_URL}/admin/${tabName}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`${tabName} 데이터를 불러오는데 실패했습니다.`);
            }
            
            data = await response.json();
        } catch (error) {
            console.warn(`실제 API 요청 실패, 더미 데이터 사용: ${error.message}`);
            // API가 없거나 실패한 경우 더미 데이터 사용
            data = getDummyAdminData(tabName);
        }
        
        // 탭에 따라 다른 처리
        switch (tabName) {
            case 'users':
                renderAdminUsers(data);
                break;
            case 'products':
                renderAdminProducts(data);
                break;
            case 'reports':
                renderAdminReports(data);
                break;
            case 'transactions':
                renderAdminTransactions(data);
                break;
        }
    } catch (error) {
        console.error(`Admin ${tabName} data 로드 오류:`, error);
        document.getElementById(`${tabName}TableBody`).innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger">
                    <i class="bi bi-exclamation-triangle"></i> 데이터를 불러오는데 실패했습니다: ${error.message}
                </td>
            </tr>
        `;
    }
}

// 관리자 페이지 - 사용자 목록 렌더링
function renderAdminUsers(data) {
    const usersTableBody = document.getElementById('usersTableBody');
    
    if (!data || !data.length) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">사용자 데이터가 없습니다.</td>
            </tr>
        `;
        return;
    }
    
    const usersHTML = data.map(user => {
        // 사용자 상태에 따른 배지 스타일 지정
        const statusBadge = getStatusBadgeClass(user.status);
        
        // 자동 차단 대상 확인 (신고 10회 이상)
        const isAutoBanTarget = (user.reportCount || 0) >= 10;
        
        return `
            <tr${isAutoBanTarget ? ' class="table-danger"' : ''}>
                <td>${user.id}</td>
                <td>${user.username || user.nickname || '이름 없음'}</td>
                <td>${user.email}</td>
                <td><span class="badge ${statusBadge}">${user.status || 'active'}</span></td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                    ${(user.reportCount || 0) > 0 ? 
                        `<span class="badge ${isAutoBanTarget ? 'bg-danger' : 'bg-warning'}">${user.reportCount}</span>` : 
                        '0'}
                </td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewUserDetails('${user.id}')">
                            <i class="bi bi-eye"></i>
                        </button>
                        ${user.status === 'inactive' ? 
                            `<button class="btn btn-sm btn-outline-success" onclick="updateUserStatus('${user.id}', 'active')">
                                <i class="bi bi-check-circle"></i> 활성화
                            </button>` : 
                            `<button class="btn btn-sm btn-outline-danger" onclick="updateUserStatus('${user.id}', 'inactive')">
                                <i class="bi bi-x-circle"></i> 비활성화
                            </button>`
                        }
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    usersTableBody.innerHTML = usersHTML;
    
    // 자동 차단 처리 (신고 10회 이상인 사용자)
    data.forEach(user => {
        if ((user.reportCount || 0) >= 10 && user.status !== 'inactive') {
            // 비동기로 사용자 상태 업데이트 실행
            updateUserStatus(user.id, 'inactive', true);
        }
    });
}

// 관리자 페이지 - 상품 목록 렌더링
function renderAdminProducts(data) {
    const productsTableBody = document.getElementById('productsTableBody');
    
    if (!data || !data.length) {
        productsTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">상품 데이터가 없습니다.</td>
            </tr>
        `;
        return;
    }
    
    const productsHTML = data.map(product => {
        // 상품 상태에 따른 배지 스타일 지정
        const statusBadge = getProductStatusBadgeClass(product.status);
        
        // 자동 차단 대상 확인 (신고 10회 이상)
        const isAutoBanTarget = (product.reportCount || 0) >= 10;
        
        return `
            <tr${isAutoBanTarget ? ' class="table-danger"' : ''}>
                <td>${product.id}</td>
                <td>${product.title}</td>
                <td>${product.sellerName || '판매자 정보 없음'}</td>
                <td>₩${product.price ? product.price.toLocaleString() : '0'}</td>
                <td><span class="badge ${statusBadge}">${product.status || 'available'}</span></td>
                <td>${new Date(product.createdAt).toLocaleDateString()}</td>
                <td>
                    ${(product.reportCount || 0) > 0 ? 
                        `<span class="badge ${isAutoBanTarget ? 'bg-danger' : 'bg-warning'}">${product.reportCount}</span>` : 
                        '0'}
                </td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewProduct('${product.id}')">
                            <i class="bi bi-eye"></i>
                        </button>
                        ${product.status === 'blocked' ? 
                            `<button class="btn btn-sm btn-outline-success" onclick="updateProductStatus('${product.id}', 'available')">
                                <i class="bi bi-check-circle"></i> 차단 해제
                            </button>` : 
                            `<button class="btn btn-sm btn-outline-danger" onclick="updateProductStatus('${product.id}', 'blocked')">
                                <i class="bi bi-x-circle"></i> 차단
                            </button>`
                        }
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    productsTableBody.innerHTML = productsHTML;
    
    // 자동 차단 처리 (신고 10회 이상인 상품)
    data.forEach(product => {
        if ((product.reportCount || 0) >= 10 && product.status !== 'blocked') {
            // 비동기로 상품 상태 업데이트 실행
            updateProductStatus(product.id, 'blocked', true);
        }
    });
}

// 관리자 페이지 - 신고 목록 렌더링
function renderAdminReports(data) {
    const reportsTableBody = document.getElementById('reportsTableBody');
    
    if (!data || !data.length) {
        reportsTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">신고 데이터가 없습니다.</td>
            </tr>
        `;
        return;
    }
    
    const reportsHTML = data.map(report => {
        // 신고 상태에 따른 배지 스타일 지정
        const statusBadge = getReportStatusBadgeClass(report.status);
        
        return `
            <tr>
                <td>${report.id}</td>
                <td>${report.type || '기타'}</td>
                <td>
                    ${report.productId ? 
                        `<a href="#" onclick="viewProduct('${report.productId}')">상품 #${report.productId}</a>` : 
                        report.reportedUserId ? 
                        `<a href="#" onclick="viewUserDetails('${report.reportedUserId}')">사용자 #${report.reportedUserId}</a>` : 
                        '알 수 없음'
                    }
                </td>
                <td>${report.reporterName || '신고자 정보 없음'}</td>
                <td>${report.reason || '사유 없음'}</td>
                <td><span class="badge ${statusBadge}">${report.status || 'pending'}</span></td>
                <td>${new Date(report.createdAt).toLocaleDateString()}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewReportDetails('${report.id}')">
                            <i class="bi bi-eye"></i>
                        </button>
                        ${report.status === 'pending' ? `
                            <button class="btn btn-sm btn-outline-success" onclick="updateReportStatus('${report.id}', 'approved')">
                                <i class="bi bi-check-circle"></i> 승인
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="updateReportStatus('${report.id}', 'rejected')">
                                <i class="bi bi-x-circle"></i> 거절
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    reportsTableBody.innerHTML = reportsHTML;
}

// 관리자 페이지 - 거래 내역 렌더링
function renderAdminTransactions(data) {
    const transactionsTableBody = document.getElementById('transactionsTableBody');
    
    if (!data || !data.length) {
        transactionsTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">거래 데이터가 없습니다.</td>
            </tr>
        `;
        return;
    }
    
    const transactionsHTML = data.map(transaction => {
        // 거래 상태에 따른 배지 스타일 지정
        const statusBadge = getTransactionStatusBadgeClass(transaction.status);
        
        return `
            <tr>
                <td>${transaction.id}</td>
                <td>
                    <a href="#" onclick="viewProduct('${transaction.productId}')">${transaction.productTitle || `상품 #${transaction.productId}`}</a>
                </td>
                <td>${transaction.sellerName || '판매자 정보 없음'}</td>
                <td>${transaction.buyerName || '구매자 정보 없음'}</td>
                <td>₩${transaction.amount ? transaction.amount.toLocaleString() : '0'}</td>
                <td><span class="badge ${statusBadge}">${transaction.status || 'pending'}</span></td>
                <td>${new Date(transaction.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewTransactionDetails('${transaction.id}')">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    transactionsTableBody.innerHTML = transactionsHTML;
}

// 사용자 상태 업데이트
async function updateUserStatus(userId, newStatus, isAutomatic = false) {
    try {
        // 실제 API 요청 시도
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    status: newStatus,
                    reason: isAutomatic ? '신고 횟수 10회 이상으로 자동 비활성화' : '관리자 조치'
                })
            });
            
            if (!response.ok) {
                throw new Error('사용자 상태 업데이트에 실패했습니다.');
            }
        } catch (error) {
            console.warn('API 요청 실패, 프론트엔드에서만 상태 업데이트:', error.message);
            // API 연동 없이도 UI에서는 업데이트된 것처럼 처리
        }
        
        // 자동 처리가 아닌 경우에만 메시지 표시 및 데이터 다시 로드
        if (!isAutomatic) {
            showToast(`사용자 #${userId}의 상태가 ${newStatus}로 변경되었습니다.`, 'success');
            loadAdminTabData('users');
        }
    } catch (error) {
        console.error('사용자 상태 업데이트 오류:', error);
        showToast(`사용자 상태 업데이트 실패: ${error.message}`, 'danger');
    }
}

// 상품 상태 업데이트
async function updateProductStatus(productId, newStatus, isAutomatic = false) {
    try {
        // 실제 API 요청 시도
        try {
            const response = await fetch(`${API_BASE_URL}/admin/products/${productId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    status: newStatus,
                    reason: isAutomatic ? '신고 횟수 10회 이상으로 자동 차단' : '관리자 조치'
                })
            });
            
            if (!response.ok) {
                throw new Error('상품 상태 업데이트에 실패했습니다.');
            }
        } catch (error) {
            console.warn('API 요청 실패, 프론트엔드에서만 상태 업데이트:', error.message);
            // API 연동 없이도 UI에서는 업데이트된 것처럼 처리
        }
        
        // 자동 처리가 아닌 경우에만 메시지 표시 및 데이터 다시 로드
        if (!isAutomatic) {
            showToast(`상품 #${productId}의 상태가 ${newStatus}로 변경되었습니다.`, 'success');
            loadAdminTabData('products');
        }
    } catch (error) {
        console.error('상품 상태 업데이트 오류:', error);
        showToast(`상품 상태 업데이트 실패: ${error.message}`, 'danger');
    }
}

// 신고 상태 업데이트
async function updateReportStatus(reportId, newStatus) {
    try {
        // 실제 API 요청 시도
        try {
            const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    status: newStatus,
                    adminNote: `관리자에 의해 ${newStatus}됨`
                })
            });
            
            if (!response.ok) {
                throw new Error('신고 상태 업데이트에 실패했습니다.');
            }
        } catch (error) {
            console.warn('API 요청 실패, 프론트엔드에서만 상태 업데이트:', error.message);
            // API 연동 없이도 UI에서는 업데이트된 것처럼 처리
        }
        
        showToast(`신고 #${reportId}의 상태가 ${newStatus}로 변경되었습니다.`, 'success');
        loadAdminTabData('reports');
    } catch (error) {
        console.error('신고 상태 업데이트 오류:', error);
        showToast(`신고 상태 업데이트 실패: ${error.message}`, 'danger');
    }
}

// 사용자 상태에 따른 배지 클래스
function getStatusBadgeClass(status) {
    switch (status) {
        case 'active':
            return 'bg-success';
        case 'inactive':
            return 'bg-danger';
        case 'suspended':
            return 'bg-warning';
        case 'pending':
            return 'bg-info';
        default:
            return 'bg-secondary';
    }
}

// 상품 상태에 따른 배지 클래스
function getProductStatusBadgeClass(status) {
    switch (status) {
        case 'available':
            return 'bg-success';
        case 'sold':
            return 'bg-secondary';
        case 'blocked':
            return 'bg-danger';
        case 'reported':
            return 'bg-warning';
        case 'reserved':
            return 'bg-info';
        default:
            return 'bg-secondary';
    }
}

// 신고 상태에 따른 배지 클래스
function getReportStatusBadgeClass(status) {
    switch (status) {
        case 'pending':
            return 'bg-warning';
        case 'approved':
            return 'bg-success';
        case 'rejected':
            return 'bg-danger';
        case 'resolved':
            return 'bg-info';
        default:
            return 'bg-secondary';
    }
}

// 거래 상태에 따른 배지 클래스
function getTransactionStatusBadgeClass(status) {
    switch (status) {
        case 'completed':
            return 'bg-success';
        case 'pending':
            return 'bg-warning';
        case 'cancelled':
            return 'bg-danger';
        case 'processing':
            return 'bg-info';
        default:
            return 'bg-secondary';
    }
}

// 관리자 - 사용자 상세 정보 보기
async function viewUserDetails(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('사용자 상세 정보를 불러오는데 실패했습니다.');
        }
        
        const user = await response.json();
        
        // 모달 생성 및 표시
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal fade';
        modalContainer.id = 'userDetailsModal';
        modalContainer.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">사용자 상세 정보</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>ID:</strong> ${user.id}</p>
                                <p><strong>이름:</strong> ${user.username || user.nickname || '이름 없음'}</p>
                                <p><strong>이메일:</strong> ${user.email}</p>
                                <p><strong>상태:</strong> <span class="badge ${getStatusBadgeClass(user.status)}">${user.status || 'active'}</span></p>
                                <p><strong>역할:</strong> ${user.role || 'user'}</p>
                                <p><strong>가입일:</strong> ${new Date(user.createdAt).toLocaleString()}</p>
                                <p><strong>신고 횟수:</strong> <span class="badge ${user.reportCount >= 10 ? 'bg-danger' : user.reportCount > 0 ? 'bg-warning' : 'bg-secondary'}">${user.reportCount || 0}</span></p>
                            </div>
                            <div class="col-md-6">
                                <h6>활동 내역</h6>
                                <p><strong>판매 상품:</strong> ${user.productCount || 0}개</p>
                                <p><strong>구매 내역:</strong> ${user.purchaseCount || 0}개</p>
                                <p><strong>마지막 로그인:</strong> ${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '정보 없음'}</p>
                            </div>
                        </div>
                        
                        <hr>
                        
                        <h6>신고 내역</h6>
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>신고 사유</th>
                                        <th>신고자</th>
                                        <th>날짜</th>
                                        <th>상태</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${user.reports && user.reports.length > 0 ? 
                                        user.reports.map(report => `
                                            <tr>
                                                <td>${report.id}</td>
                                                <td>${report.reason || '사유 없음'}</td>
                                                <td>${report.reporterName || '신고자 정보 없음'}</td>
                                                <td>${new Date(report.createdAt).toLocaleString()}</td>
                                                <td><span class="badge ${getReportStatusBadgeClass(report.status)}">${report.status || 'pending'}</span></td>
                                            </tr>
                                        `).join('') : 
                                        '<tr><td colspan="5" class="text-center">신고 내역이 없습니다.</td></tr>'
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        ${user.status === 'inactive' ? 
                            `<button type="button" class="btn btn-success" onclick="updateUserStatus('${user.id}', 'active')">사용자 활성화</button>` : 
                            `<button type="button" class="btn btn-danger" onclick="updateUserStatus('${user.id}', 'inactive')">사용자 비활성화</button>`
                        }
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalContainer);
        const userDetailsModal = new bootstrap.Modal(document.getElementById('userDetailsModal'));
        userDetailsModal.show();
        
        // 모달이 닫힐 때 제거
        document.getElementById('userDetailsModal').addEventListener('hidden.bs.modal', function() {
            document.getElementById('userDetailsModal').remove();
        });
    } catch (error) {
        console.error('사용자 상세 정보 로드 오류:', error);
        showToast(`사용자 상세 정보 로드 실패: ${error.message}`, 'danger');
    }
}

// 관리자 - 신고 상세 정보 보기
async function viewReportDetails(reportId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('신고 상세 정보를 불러오는데 실패했습니다.');
        }
        
        const report = await response.json();
        
        // 모달 생성 및 표시
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal fade';
        modalContainer.id = 'reportDetailsModal';
        modalContainer.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">신고 상세 정보</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>ID:</strong> ${report.id}</p>
                        <p><strong>유형:</strong> ${report.type || '기타'}</p>
                        <p><strong>신고 대상:</strong> 
                            ${report.productId ? 
                                `<a href="#" onclick="viewProduct('${report.productId}')">상품 #${report.productId}</a>` : 
                                report.reportedUserId ? 
                                `<a href="#" onclick="viewUserDetails('${report.reportedUserId}')">사용자 #${report.reportedUserId}</a>` : 
                                '알 수 없음'
                            }
                        </p>
                        <p><strong>신고자:</strong> ${report.reporterName || '신고자 정보 없음'}</p>
                        <p><strong>상태:</strong> <span class="badge ${getReportStatusBadgeClass(report.status)}">${report.status || 'pending'}</span></p>
                        <p><strong>신고일:</strong> ${new Date(report.createdAt).toLocaleString()}</p>
                        
                        <div class="alert alert-light">
                            <strong>신고 사유:</strong><br>
                            ${report.reason || '사유 없음'}
                        </div>
                        
                        ${report.adminNote ? `
                            <div class="alert alert-info">
                                <strong>관리자 메모:</strong><br>
                                ${report.adminNote}
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        ${report.status === 'pending' ? `
                            <button type="button" class="btn btn-success" onclick="updateReportStatus('${report.id}', 'approved')">승인</button>
                            <button type="button" class="btn btn-danger" onclick="updateReportStatus('${report.id}', 'rejected')">거절</button>
                        ` : ''}
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalContainer);
        const reportDetailsModal = new bootstrap.Modal(document.getElementById('reportDetailsModal'));
        reportDetailsModal.show();
        
        // 모달이 닫힐 때 제거
        document.getElementById('reportDetailsModal').addEventListener('hidden.bs.modal', function() {
            document.getElementById('reportDetailsModal').remove();
        });
    } catch (error) {
        console.error('신고 상세 정보 로드 오류:', error);
        showToast(`신고 상세 정보 로드 실패: ${error.message}`, 'danger');
    }
}

// 관리자 - 거래 상세 정보 보기
async function viewTransactionDetails(transactionId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/transactions/${transactionId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('거래 상세 정보를 불러오는데 실패했습니다.');
        }
        
        const transaction = await response.json();
        
        // 모달 생성 및 표시
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal fade';
        modalContainer.id = 'transactionDetailsModal';
        modalContainer.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">거래 상세 정보</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>거래 ID:</strong> ${transaction.id}</p>
                        <p><strong>상품:</strong> 
                            <a href="#" onclick="viewProduct('${transaction.productId}')">${transaction.productTitle || `상품 #${transaction.productId}`}</a>
                        </p>
                        <p><strong>판매자:</strong> ${transaction.sellerName || '판매자 정보 없음'}</p>
                        <p><strong>구매자:</strong> ${transaction.buyerName || '구매자 정보 없음'}</p>
                        <p><strong>금액:</strong> ₩${transaction.amount ? transaction.amount.toLocaleString() : '0'}</p>
                        <p><strong>상태:</strong> <span class="badge ${getTransactionStatusBadgeClass(transaction.status)}">${transaction.status || 'pending'}</span></p>
                        <p><strong>거래일:</strong> ${new Date(transaction.createdAt).toLocaleString()}</p>
                        <p><strong>결제 방법:</strong> ${transaction.paymentMethod || '정보 없음'}</p>
                        
                        ${transaction.notes ? `
                            <div class="alert alert-info">
                                <strong>추가 정보:</strong><br>
                                ${transaction.notes}
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalContainer);
        const transactionDetailsModal = new bootstrap.Modal(document.getElementById('transactionDetailsModal'));
        transactionDetailsModal.show();
        
        // 모달이 닫힐 때 제거
        document.getElementById('transactionDetailsModal').addEventListener('hidden.bs.modal', function() {
            document.getElementById('transactionDetailsModal').remove();
        });
    } catch (error) {
        console.error('거래 상세 정보 로드 오류:', error);
        showToast(`거래 상세 정보 로드 실패: ${error.message}`, 'danger');
    }
}

// 로그아웃 처리
async function handleLogout() {
    try {
        // API 요청
        await fetch('http://localhost:3000/api/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
    } catch (error) {
        console.error('로그아웃 오류:', error);
    } finally {
        // 로컬 로그아웃 처리
    localStorage.removeItem('token');
    currentUser = null;
    updateNavigation();
        showToast('로그아웃되었습니다.', 'success');
    loadContent('home');
    }
}

// 송금 다이얼로그 표시
async function showPaymentDialog(productId, sellerId, price, productTitle) {
    // 템플릿 로드
    let templateContent = await loadTemplate('/templates/payment-dialog.html');

    // 플레이스홀더 치환
    templateContent = templateContent
        .replace('{productTitle}', productTitle)
        .replace('{price}', price.toLocaleString());

    // 기존 모달이 있으면 제거
    const existingModal = document.getElementById('paymentModal');
    if (existingModal) existingModal.remove();

    // 모달 삽입
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = templateContent;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // 지불 방법 변경 시 폼 업데이트
    const updatePaymentMethodForm = function() {
        const method = document.getElementById('paymentMethod').value;
        document.querySelectorAll('.payment-method-info').forEach(el => {
            el.style.display = 'none';
        });
        
        if (method === 'card') {
            document.getElementById('cardPaymentInfo').style.display = 'block';
        } else if (method === 'bank') {
            document.getElementById('bankPaymentInfo').style.display = 'block';
        }
    };
    
    // Bootstrap 모달 초기화
    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    paymentModal.show();
    
    // 결제 방법 변경 이벤트 리스너
    document.getElementById('paymentMethod').addEventListener('change', updatePaymentMethodForm);
    
    // 결제 확인 버튼 이벤트 리스너
    document.getElementById('confirmPayment').addEventListener('click', function() {
        if (!document.getElementById('agreeTerms').checked) {
            showToast('개인정보 수집 및 이용에 동의해주세요.', 'warning');
            return;
        }
        
        // 로딩 상태 표시
        const confirmBtn = document.getElementById('confirmPayment');
        const originalBtnText = confirmBtn.innerHTML;
        confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 처리 중...';
        confirmBtn.disabled = true;
        
        // 결제 처리 (백엔드 연동 시 실제 구현)
        setTimeout(() => {
            processPayment(productId, sellerId, price, productTitle);
            paymentModal.hide();
            
            // 모달 닫힌 후 제거
            setTimeout(() => {
                document.getElementById('paymentModal').remove();
            }, 500);
        }, 1500);
    });
    
    // 모달이 닫힐 때 정리
    document.getElementById('paymentModal').addEventListener('hidden.bs.modal', function() {
        document.getElementById('paymentModal').remove();
    });

    // Apply consistent styling to payment dialog buttons
    document.querySelectorAll('#paymentModal button.btn:not(.btn-link):not(.btn-outline-danger):not(.btn-close):not(.btn-secondary)').forEach(btn => {
        applyButtonStyle(btn);
    });
}

// 결제 처리
async function processPayment(productId, sellerId, price, productTitle) {
    try {
        // 실제 API 호출 (백엔드 연동 시 구현)
        /*
        const response = await fetch(`${API_BASE_URL}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                productId,
                sellerId,
                amount: price,
                method: document.getElementById('paymentMethod').value
            })
        });
        
        if (!response.ok) {
            throw new Error('결제 처리에 실패했습니다.');
        }
        
        const result = await response.json();
        */
        
        // 백엔드 없는 경우 가상의 성공 응답
        showToast('결제가 성공적으로 완료되었습니다!', 'success');
        
        // 상품 상태 업데이트 (백엔드에서 처리될 것이지만, 여기서는 시뮬레이션)
        const message = `💰 ${productTitle} 상품에 대한 결제가 완료되었습니다. 결제금액: ₩${price.toLocaleString()}`;
        
        // 현재 열려 있는 채팅방에 메시지 전송
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.value = message;
            document.getElementById('sendMessageForm').dispatchEvent(new Event('submit'));
        }
    } catch (error) {
        console.error('결제 처리 오류:', error);
        showToast(`결제 실패: ${error.message}`, 'danger');
    }
}

// 상품 검색 처리
function handleProductSearch(event) {
    event.preventDefault();
    
    // 디버깅을 위한 요소 확인
    console.log('searchKeyword 요소:', document.getElementById('searchKeyword'));
    console.log('categorySelect 요소:', document.getElementById('categorySelect'));
    console.log('minPriceInput 요소:', document.getElementById('minPriceInput'));
    console.log('maxPriceInput 요소:', document.getElementById('maxPriceInput'));
    console.log('locationSelect 요소:', document.getElementById('locationSelect'));
    console.log('sortSelect 요소:', document.getElementById('sortSelect'));
    
    // 검색 폼에서 입력값 가져오기
    const keyword = document.getElementById('searchKeyword')?.value.trim() || '';
    const category = document.getElementById('categorySelect')?.value || '';
    const minPrice = document.getElementById('minPriceInput')?.value || '';
    const maxPrice = document.getElementById('maxPriceInput')?.value || '';
    const location = document.getElementById('locationSelect')?.value || '';
    const sort = document.getElementById('sortSelect')?.value || 'newest';
    
    console.log('버튼 클릭: 검색', keyword, category, minPrice, maxPrice, location, sort); // 디버깅 로그
    
    // 검색 파라미터 객체 생성
    const searchParams = {};
    
    if (keyword) searchParams.keyword = keyword;
    if (category && category !== '') searchParams.category = category;
    if (minPrice) searchParams.minPrice = minPrice;
    if (maxPrice) searchParams.maxPrice = maxPrice;
    if (location) searchParams.location = location;
    if (sort) searchParams.sort = sort;
    
    // URL 파라미터 업데이트 (히스토리용)
    const queryParams = new URLSearchParams();
    Object.keys(searchParams).forEach(key => {
        queryParams.append(key, searchParams[key]);
    });
    
    // 현재 URL 경로 유지하고 파라미터만 업데이트
    const path = window.location.pathname;
    const newUrl = path + (queryParams.toString() ? '?' + queryParams.toString() : '');
    window.history.pushState({ path: newUrl }, '', newUrl);
    
    // 상품 목록 로드
    loadProductsList(searchParams);
}

function resetSearchFilters() {
    // 폼 필드 초기화
    document.getElementById('searchKeyword').value = '';
    document.getElementById('categorySelect').value = '';
    document.getElementById('minPriceInput').value = '';
    document.getElementById('maxPriceInput').value = '';
    document.getElementById('locationSelect').value = '';
    document.getElementById('sortSelect').value = 'newest';
    
    // URL 파라미터 제거
    const path = window.location.pathname;
    window.history.pushState({ path }, '', path);
    
    // 모든 상품 다시 로드
    loadProductsList({});
}

// 가격 포맷팅 함수
function formatPrice(price) {
    return new Intl.NumberFormat('ko-KR', { 
        style: 'currency', 
        currency: 'KRW',
        maximumFractionDigits: 0
    }).format(price);
}

// 날짜 포맷팅 함수
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return '오늘';
    } else if (diffDays === 1) {
        return '어제';
    } else if (diffDays < 7) {
        return `${diffDays}일 전`;
    } else {
        return date.toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
}

// 상품 목록 로드 함수
async function loadProductsList(searchParams = {}) {
    const productsContainer = document.getElementById('productsContainer');
    
    try {
    // 로딩 상태 표시
    productsContainer.innerHTML = `
            <div class="col-12 d-flex justify-content-center align-items-center my-5">
                <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
                    <p class="mt-3">상품 목록을 불러오는 중...</p>
                </div>
        </div>
    `;
    
        // URL 검색 파라미터 생성
            const queryParams = new URLSearchParams();
        
        // 키워드 검색
        if (searchParams.keyword) {
            queryParams.append('keyword', searchParams.keyword);
        }
        
        // 카테고리 필터
        if (searchParams.category) {
            queryParams.append('category', searchParams.category);
        }
        
        // 가격 범위 필터
        if (searchParams.minPrice) {
            queryParams.append('minPrice', searchParams.minPrice);
        }
        if (searchParams.maxPrice) {
            queryParams.append('maxPrice', searchParams.maxPrice);
        }
        
        // 지역 필터
        if (searchParams.location) {
            queryParams.append('location', searchParams.location);
        }
        
        // 정렬 방식
        if (searchParams.sort) {
            queryParams.append('sort', searchParams.sort);
        }
        
        try {
            console.log('API 요청 URL:', `${API_BASE_URL}/products?${queryParams.toString()}`);
            const response = await fetch(`${API_BASE_URL}/products?${queryParams.toString()}`);
        if (!response.ok) {
                throw new Error('상품 목록을 불러오는데 실패했습니다.');
        }
            const data = await response.json();
        
        let products = [];
        // API 응답 구조에 따라 데이터 추출
            if (Array.isArray(data)) {
                products = data;
            } else if (data.products && Array.isArray(data.products)) {
                products = data.products;
            } else if (data.data && Array.isArray(data.data)) {
                products = data.data;
        }
        
        // 상품이 없는 경우
        if (products.length === 0) {
            productsContainer.innerHTML = `
                    <div class="col-12 d-flex justify-content-center align-items-center my-5">
                        <div class="text-center">
                            <p class="text-muted">검색 결과가 없습니다.</p>
                            <button class="btn btn-primary mt-3" onclick="resetSearchFilters()">
                                필터 초기화
                            </button>
                        </div>
                </div>
            `;
            return;
        }
        
            // 상품 목록 표시
        const productsHTML = products.map(product => {
            // 상품 이미지 설정 (배열 또는 문자열 처리)
                let imageUrl = '/images/placeholder.jpg';
            if (product.images) {
                if (Array.isArray(product.images) && product.images.length > 0) {
                    imageUrl = product.images[0];
                } else if (typeof product.images === 'string') {
                    imageUrl = product.images;
                }
            } else if (product.image) {
                imageUrl = product.image;
            }
                
                // 상태 배지 결정
                let statusBadge = '';
                if (product.status === 'sold') {
                    statusBadge = '<span class="badge bg-danger position-absolute top-0 end-0 m-2">판매완료</span>';
                } else if (product.status === 'reserved') {
                    statusBadge = '<span class="badge bg-warning text-dark position-absolute top-0 end-0 m-2">예약중</span>';
                }
            
            // 날짜 포맷팅
                const formatDate = (dateString) => {
                    const date = new Date(dateString);
                    const now = new Date();
                    const diffTime = Math.abs(now - date);
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays === 0) {
                        return '오늘';
                    } else if (diffDays === 1) {
                        return '어제';
                    } else if (diffDays < 7) {
                        return `${diffDays}일 전`;
                    } else {
                        return date.toLocaleDateString('ko-KR', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        });
                    }
                };
                
            return `
                    <div class="col">
                        <div class="card product-card h-100 shadow-sm">
                            <div class="position-relative product-img-container" style="height: 200px; overflow: hidden;">
                                <img src="${imageUrl}" class="card-img-top" alt="${product.title}" 
                                    style="width: 100%; height: 100%; object-fit: cover;" onerror="handleImageError(this)">
                                ${statusBadge}
                        </div>
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title mb-1 text-truncate">${product.title}</h5>
                                <p class="card-text text-primary fw-bold product-price">${formatPrice(product.price)}</p>
                                <div class="mt-auto">
                                    <p class="card-text small text-muted mb-1">
                                <i class="bi bi-geo-alt"></i> ${product.location || '위치 정보 없음'}
                            </p>
                                    <p class="card-text small text-muted">
                                        <i class="bi bi-clock"></i> ${formatDate(product.createdAt || new Date())}
                                    </p>
                                </div>
                            </div>
                            <div class="card-footer bg-transparent border-top-0">
                                <button class="btn btn-primary w-100" onclick="viewProduct('${product.id}')">
                                    상세보기
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            productsContainer.innerHTML = productsHTML;
        } catch (error) {
            console.error('API 오류:', error);
            // API 오류 시 임시 데이터 사용
            const mockProducts = getMockProducts();
            console.log('검색 파라미터:', searchParams);
            // 카테고리 필터링
            let filteredProducts = [...mockProducts];
            
            if (searchParams.category) {
                console.log('카테고리 필터링:', searchParams.category);
                filteredProducts = filteredProducts.filter(product => 
                    product.category === searchParams.category
                );
            }
            
            // 키워드 검색
            if (searchParams.keyword) {
                const keyword = searchParams.keyword.toLowerCase();
                console.log('키워드 필터링:', keyword);
                filteredProducts = filteredProducts.filter(product => 
                    product.title.toLowerCase().includes(keyword) || 
                    product.description.toLowerCase().includes(keyword)
                );
            }
            
            // 가격 범위 필터링
            if (searchParams.minPrice) {
                filteredProducts = filteredProducts.filter(product => 
                    parseInt(product.price) >= parseInt(searchParams.minPrice)
                );
            }
            if (searchParams.maxPrice) {
                filteredProducts = filteredProducts.filter(product => 
                    parseInt(product.price) <= parseInt(searchParams.maxPrice)
                );
            }
            
            // 지역 필터링
            if (searchParams.location) {
                console.log('지역 필터링:', searchParams.location);
                filteredProducts = filteredProducts.filter(product => {
                    const productLocation = product.location?.toLowerCase() || '';
                    const searchLocation = searchParams.location.toLowerCase();
                    return productLocation.includes(searchLocation);
                });
            }
            
            // 정렬
            if (searchParams.sort) {
                switch(searchParams.sort) {
                    case 'newest':
                        filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        break;
                    case 'oldest':
                        filteredProducts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                        break;
                    case 'priceLow':
                        filteredProducts.sort((a, b) => parseInt(a.price) - parseInt(b.price));
                        break;
                    case 'priceHigh':
                        filteredProducts.sort((a, b) => parseInt(b.price) - parseInt(a.price));
                        break;
                }
            }
            
            // 상품이 없는 경우
            if (filteredProducts.length === 0) {
                productsContainer.innerHTML = `
                    <div class="col-12 d-flex justify-content-center align-items-center my-5">
                        <div class="text-center">
                            <p class="text-muted">검색 결과가 없습니다.</p>
                            <button class="btn btn-primary mt-3" onclick="resetSearchFilters()">
                                필터 초기화
                            </button>
                        </div>
                    </div>
                `;
                return;
            }
            
            // 상품 목록 표시 (Mock 데이터)
            const productsHTML = filteredProducts.map(product => {
                // 상태 배지 결정
                let statusBadge = '';
                if (product.status === 'sold') {
                    statusBadge = '<span class="badge bg-danger position-absolute top-0 end-0 m-2">판매완료</span>';
                } else if (product.status === 'reserved') {
                    statusBadge = '<span class="badge bg-warning text-dark position-absolute top-0 end-0 m-2">예약중</span>';
                }
                
                return `
                    <div class="col">
                        <div class="card product-card h-100 shadow-sm">
                            <div class="position-relative product-img-container" style="height: 200px; overflow: hidden;">
                                <img src="${product.image}" class="card-img-top" alt="${product.title}" 
                                    style="width: 100%; height: 100%; object-fit: cover;" onerror="handleImageError(this)">
                                ${statusBadge}
                            </div>
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title mb-1 text-truncate">${product.title}</h5>
                                <p class="card-text text-primary fw-bold product-price">${formatPrice(product.price)}</p>
                                <div class="mt-auto">
                                    <p class="card-text small text-muted mb-1">
                                        <i class="bi bi-geo-alt"></i> ${product.location}
                                    </p>
                                    <p class="card-text small text-muted">
                                        <i class="bi bi-clock"></i> ${formatDate(product.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <div class="card-footer bg-transparent border-top-0">
                                <button class="btn btn-primary w-100" onclick="viewProduct('${product.id}')">
                                    상세보기
                                </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        productsContainer.innerHTML = productsHTML;
        }
    } catch (error) {
        console.error('상품 목록 로드 오류:', error);
        productsContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger" role="alert">
                    상품 목록을 불러오는데 실패했습니다: ${error.message}
                </div>
            </div>
        `;
    }
}

// 상품 상세 페이지 이동
function viewProduct(productId) {
    // productId를 히든 필드에 저장
    const hiddenField = document.createElement('input');
    hiddenField.type = 'hidden';
    hiddenField.id = 'productId';
    hiddenField.value = productId;
    
    // 기존 필드가 있으면 제거하고 새로 추가
    const existingField = document.getElementById('productId');
    if (existingField) {
        existingField.remove();
    }
    document.body.appendChild(hiddenField);
    
    // 상품 상세 페이지로 이동
    loadContent('productDetail');
}

// 상품 상세 정보 로드
async function loadProductDetail(productId) {
    const mainContent = document.getElementById('mainContent');
    
    // 로딩 상태 표시
    mainContent.innerHTML = `
        <div class="container my-5 text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">상품 정보를 불러오는 중...</p>
        </div>
    `;
    
    try {
        // 상품 상세 정보 가져오기
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        
        if (!response.ok) {
            throw new Error('상품 정보를 불러오는데 실패했습니다.');
        }
        
        const product = await response.json();
        
        // 이미지 갤러리 생성
        let imageGallery = '';
        const defaultImage = '/images/placeholder.jpg';
        
        // 상품 이미지 처리
        let productImages = [];
        
        if (product.images) {
            if (Array.isArray(product.images) && product.images.length > 0) {
                productImages = product.images;
            } else if (typeof product.images === 'string') {
                productImages = [product.images];
            }
        } else if (product.image) {
            productImages = [product.image];
        }
        
        // 이미지가 없으면 기본 이미지 사용
        if (productImages.length === 0) {
            productImages = [defaultImage];
        }
        
        // 메인 이미지
        const mainImage = productImages[0];
        
        // 썸네일 갤러리
        const thumbnailsHtml = productImages.map((img, index) => `
            <div class="col-3 mb-3">
                <img src="${img}" class="img-thumbnail product-thumbnail" 
                    alt="상품 이미지 ${index + 1}" style="height: 80px; object-fit: cover; cursor: pointer;"
                    onclick="document.getElementById('mainProductImage').src='${img}'"
                    onerror="handleImageError(this)">
            </div>
        `).join('');
        
        // 판매자 정보 가져오기
        let seller = { username: '알 수 없음', profileImage: null, location: '위치 정보 없음' };
        
        try {
            const sellerResponse = await fetch(`${API_BASE_URL}/users/${product.sellerId}`);
            if (sellerResponse.ok) {
                seller = await sellerResponse.json();
            }
        } catch (error) {
            console.error('판매자 정보 불러오기 오류:', error);
        }
        
        // 상품 상태에 따른 배지 색상
        let statusBadgeClass = 'bg-success';
        let statusText = '판매중';
        
        switch(product.status) {
            case 'reserved':
                statusBadgeClass = 'bg-warning text-dark';
                statusText = '예약중';
                break;
            case 'sold':
                statusBadgeClass = 'bg-danger';
                statusText = '판매완료';
                break;
        }
        
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
        
        // 상세 페이지 구성
        mainContent.innerHTML = `
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
                                            id="reportProductBtn"
                                            onclick="reportProductSimple('${product.id}', '${product.title}', '${product.sellerId}')">
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
        
    } catch (error) {
        console.error('상품 상세 정보 로드 오류:', error);
        
        // 대체 상품 정보 표시
        mainContent.innerHTML = `
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
}

// 채팅 시작 함수
async function startChat(productId, sellerId) {
    if (!currentUser) {
        showToast('채팅을 시작하려면 로그인이 필요합니다.', 'warning');
        loadContent('auth');
        return;
    }
    
    if (currentUser.id === sellerId) {
        showToast('자신의 상품에는 채팅을 시작할 수 없습니다.', 'warning');
        return;
    }
    
    try {
        // 새 채팅 생성 요청
        const response = await fetch(`${API_BASE_URL}/chats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                productId: productId || null,
                receiverId: sellerId
            })
        });
        
        if (!response.ok) {
            throw new Error('채팅 생성에 실패했습니다.');
        }
        
        const chat = await response.json();
        console.log('새 채팅 생성 성공:', chat);
        
        // 채팅 화면으로 이동
        loadContent('chats');
        
        // 채팅방 선택 (일정 시간 후 실행)
        setTimeout(() => {
            if (chat && chat.id) {
            loadChatMessages(chat.id);
            } else {
                console.error('채팅 ID가 유효하지 않습니다.', chat);
                showToast('채팅방을 찾을 수 없습니다.', 'danger');
            }
        }, 500);
        
    } catch (error) {
        console.error('채팅 생성 오류:', error);
        showToast(`채팅 시작 실패: ${error.message}`, 'danger');
    }
}

// 상품 신고 함수
async function reportProduct(productId, productTitle) {
    console.log('reportProduct 함수 호출됨:', productId, productTitle);
    console.log('Bootstrap 존재 여부:', typeof bootstrap !== 'undefined' ? 'Bootstrap 사용 가능' : 'Bootstrap 없음');
    
    if (!currentUser) {
        showToast('상품을 신고하려면 로그인이 필요합니다.', 'warning');
        loadContent('auth');
        return;
    }

    // 신고 사유 입력 받기
    const reasonElement = document.createElement('div');
    reasonElement.innerHTML = `
        <div class="form-group mb-3">
            <label for="reportReason" class="form-label">신고 사유:</label>
            <select class="form-control" id="reportReason" required>
                <option value="">신고 사유 선택</option>
                <option value="counterfeit">위조품/가품</option>
                <option value="prohibited">판매금지 물품</option>
                <option value="inappropriate">부적절한 콘텐츠</option>
                <option value="scam">사기/기만</option>
                <option value="other">기타</option>
            </select>
        </div>
        <div class="form-group" id="otherReasonContainer" style="display: none;">
            <label for="otherReason" class="form-label">상세 사유:</label>
            <textarea class="form-control" id="otherReason" rows="3" placeholder="신고 사유를 자세히 설명해주세요"></textarea>
        </div>
    `;

    // 모달 생성
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal fade';
    modalContainer.id = 'reportProductModal';
    modalContainer.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">상품 신고: ${productTitle}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="reportProductModalBody">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                    <button type="button" class="btn btn-danger" id="submitProductReport">신고하기</button>
                </div>
            </div>
        </div>
    `;

    // 모달을 문서에 추가
    document.body.appendChild(modalContainer);
    document.getElementById('reportProductModalBody').appendChild(reasonElement);

    // 기타 사유 선택 시 추가 필드 표시
    document.getElementById('reportReason').addEventListener('change', function() {
        const otherReasonContainer = document.getElementById('otherReasonContainer');
        if (this.value === 'other') {
            otherReasonContainer.style.display = 'block';
        } else {
            otherReasonContainer.style.display = 'none';
        }
    });

    // Bootstrap 모달 초기화
    try {
        console.log('모달 요소 찾기 시도:', document.getElementById('reportProductModal'));
        
        if (typeof bootstrap === 'undefined') {
            console.error('Bootstrap이 정의되지 않았습니다');
            
            // Bootstrap이 없으면 대체 모달 표시
            alert(`상품 신고: ${productTitle}\n\n신고 사유를 선택해주세요.`);
            return;
        }
        
        if (!document.getElementById('reportProductModal')) {
            console.error('reportProductModal 요소를 찾을 수 없습니다');
            return;
        }
        
    const reportProductModal = new bootstrap.Modal(document.getElementById('reportProductModal'));
        console.log('모달 초기화 성공:', reportProductModal);
        
        // 모달 표시 전에 상태 확인
        document.getElementById('reportProductModal').addEventListener('shown.bs.modal', function() {
            console.log('모달이 표시되었습니다');
        });
        
        // 모달 표시
    reportProductModal.show();
        
    } catch (error) {
        console.error('모달 초기화 실패:', error);
        alert(`신고 모달을 표시하는데 문제가 발생했습니다: ${error.message}`);
    }

    // 신고 제출 처리
    document.getElementById('submitProductReport').addEventListener('click', async function() {
        console.log('신고 제출 버튼 클릭됨');
        const reportReason = document.getElementById('reportReason').value;
        if (!reportReason) {
            alert('신고 사유를 선택해주세요.');
            return;
        }

        let reason = reportReason;
        if (reportReason === 'other') {
            const otherReason = document.getElementById('otherReason').value.trim();
            if (!otherReason) {
                alert('상세 신고 사유를 입력해주세요.');
                return;
            }
            reason = `기타: ${otherReason}`;
        }

        try {
            console.log('신고 요청 데이터:', {
                productId: productId,
                reason: reason
            });
            
            const response = await fetch(`${API_BASE_URL}/reports/product`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    productId: productId,
                    reason: reason
                })
            });

            console.log('신고 API 응답:', response);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '상품 신고 실패');
            }

            reportProductModal.hide();
            setTimeout(() => {
                document.getElementById('reportProductModal').remove();
                showToast('상품 신고가 성공적으로 접수되었습니다.', 'success');
            }, 500);
        } catch (error) {
            console.error('상품 신고 오류:', error);
            alert(`신고 접수 실패: ${error.message}`);
        }
    });
}

// 비슷한 상품 로드
async function loadRelatedProducts(productId, category) {
    const relatedProductsContainer = document.getElementById('relatedProductsContainer');
    
    try {
        // 카테고리가 같은 상품 요청
        const response = await fetch(`${API_BASE_URL}/products?category=${category}`);
        
        if (!response.ok) {
            throw new Error('비슷한 상품을 불러오는데 실패했습니다.');
        }
        
        let products = [];
        const result = await response.json();
        
        // API 응답 구조에 따라 데이터 추출
        if (Array.isArray(result)) {
            products = result;
        } else if (result.products && Array.isArray(result.products)) {
            products = result.products;
        } else if (result.data && Array.isArray(result.data)) {
            products = result.data;
        } else {
            console.warn('예상치 못한 API 응답 형식, 목업 데이터 사용:', result);
            products = getMockProducts();
        }
        
        // 현재 상품 제외하고 최대 4개까지 표시
        const relatedProducts = products
            .filter(product => product.id !== productId)
            .slice(0, 4);
        
        if (relatedProducts.length === 0) {
            relatedProductsContainer.innerHTML = `
                <div class="col-12">
                    <p class="text-center">비슷한 상품이 없습니다.</p>
                </div>
            `;
            return;
        }
        
        // 상품 카드 생성
        const productsHTML = relatedProducts.map(product => {
            // 상품 이미지 설정 (배열 또는 문자열 처리)
            let imageUrl = '/images/placeholder.jpg';
            if (product.images) {
                if (Array.isArray(product.images) && product.images.length > 0) {
                    imageUrl = product.images[0];
                } else if (typeof product.images === 'string') {
                    imageUrl = product.images;
                }
            } else if (product.image) {
                imageUrl = product.image;
            }
            
            return `
                <div class="col-md-3 mb-3">
                    <div class="card h-100">
                        <div style="height: 150px; overflow: hidden;">
                            <img src="${imageUrl}" class="card-img-top" alt="${product.title}" 
                                style="width: 100%; height: 100%; object-fit: cover;" onerror="handleImageError(this)">
                        </div>
                        <div class="card-body">
                            <h5 class="card-title text-truncate" style="font-size: 0.9rem;">${product.title}</h5>
                            <p class="card-text fw-bold text-nowrap">${formatPrice(product.price)}</p>
                            <button class="btn btn-sm btn-primary w-100" onclick="viewProduct('${product.id}')">상세 보기</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        relatedProductsContainer.innerHTML = productsHTML;
        
        // 버튼 스타일 적용
        document.querySelectorAll('button.btn:not(.btn-link):not(.btn-outline-danger):not(.btn-close):not(.btn-secondary)').forEach(btn => {
            applyButtonStyle(btn);
        });
        
    } catch (error) {
        console.error('비슷한 상품 로드 오류:', error);
        relatedProductsContainer.innerHTML = `
            <div class="col-12">
                <p class="text-center text-muted">비슷한 상품을 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}

// 알림 토스트 표시
function showToast(message, type = 'info') {
    // Toast 컨테이너 생성 또는 가져오기
    let toastContainer = document.getElementById('toastContainer');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Toast ID 생성
    const toastId = 'toast-' + Date.now();
    
    // 타입에 따른 클래스 결정
    let typeClass = 'bg-info';
    let iconClass = 'bi-info-circle';
    
    switch (type) {
        case 'success':
            typeClass = 'bg-success';
            iconClass = 'bi-check-circle';
            break;
        case 'warning':
            typeClass = 'bg-warning text-dark';
            iconClass = 'bi-exclamation-triangle';
            break;
        case 'danger':
            typeClass = 'bg-danger';
            iconClass = 'bi-x-circle';
            break;
    }
    
    // Toast HTML 생성
    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="5000">
            <div class="toast-header">
                <i class="bi ${iconClass} me-2"></i>
                <strong class="me-auto">알림</strong>
                <small>지금</small>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    // Toast 추가
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    // Toast 초기화 및 표시
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    // 5초 후 DOM에서 제거
    setTimeout(() => {
        toastElement.remove();
    }, 5500);
}


// 인증 페이지 로드 (로그인/회원가입)
function loadAuthContent(isRegister = false) {
    const mainContent = document.getElementById('mainContent');
    
    // 헤더 및 타이틀 생성
    const headerText = isRegister ? '회원가입' : '로그인';
    
    // 폼 내용 생성
    let formContent = '';
    
    if (isRegister) {
        formContent = `
            <div class="mb-3">
                <label for="registerEmail" class="form-label">이메일</label>
                <div class="input-group">
                    <input type="email" class="form-control" id="registerEmail" required>
                    <button class="btn btn-outline-secondary" type="button" id="checkEmailBtn">중복확인</button>
                </div>
                <div id="emailFeedback" class="form-text"></div>
            </div>
            <div class="mb-3">
                <label for="registerNickname" class="form-label">닉네임</label>
                <div class="input-group">
                    <input type="text" class="form-control" id="registerNickname" required>
                    <button class="btn btn-outline-secondary" type="button" id="checkNicknameBtn">중복확인</button>
                </div>
                <div id="nicknameFeedback" class="form-text"></div>
            </div>
            <div class="mb-3">
                <label for="registerPassword" class="form-label">비밀번호</label>
                <input type="password" class="form-control" id="registerPassword" 
                       required minlength="8" placeholder="8자 이상 입력하세요">
            </div>
            <div class="mb-3">
                <label for="confirmPassword" class="form-label">비밀번호 확인</label>
                <input type="password" class="form-control" id="confirmPassword" required>
                <div id="passwordFeedback" class="form-text"></div>
            </div>
            <button type="submit" class="btn btn-primary w-100" id="registerBtn">회원가입</button>
            <div class="mt-3 text-center">
                <p>이미 계정이 있으신가요? <a href="#" id="goToLoginLink">로그인하기</a></p>
            </div>
        `;
    } else {
        formContent = `
            <div class="mb-3">
                <label for="loginEmail" class="form-label">이메일</label>
                <input type="email" class="form-control" id="loginEmail" required>
            </div>
            <div class="mb-3">
                <label for="loginPassword" class="form-label">비밀번호</label>
                <input type="password" class="form-control" id="loginPassword" required>
            </div>
            <button type="submit" class="btn btn-primary w-100">로그인</button>
            <div class="mt-3 text-center">
                <p>계정이 없으신가요? <a href="#" id="goToRegisterLink">회원가입하기</a></p>
            </div>
        `;
    }
    
    // 전체 HTML 생성
    mainContent.innerHTML = `
        <div class="container my-5">
            <div class="row justify-content-center">
                <div class="col-md-6 col-lg-5">
                    <div class="card shadow">
                        <div class="card-body p-5">
                            <h2 class="text-center mb-4">${headerText}</h2>
                            <form id="${isRegister ? 'registerForm' : 'loginForm'}">
                                ${formContent}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 폼 전환 링크 이벤트 리스너 설정
    if (isRegister) {
        document.getElementById('goToLoginLink').addEventListener('click', function(e) {
            e.preventDefault();
            loadAuthContent(false);
        });
    } else {
        document.getElementById('goToRegisterLink').addEventListener('click', function(e) {
            e.preventDefault();
            loadAuthContent(true);
        });
    }
    
    // 폼 이벤트 리스너 설정
    if (isRegister) {
        const registerForm = document.getElementById('registerForm');
        const emailInput = document.getElementById('registerEmail');
        const nicknameInput = document.getElementById('registerNickname');
        const passwordInput = document.getElementById('registerPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const emailFeedback = document.getElementById('emailFeedback');
        const nicknameFeedback = document.getElementById('nicknameFeedback');
        const passwordFeedback = document.getElementById('passwordFeedback');
        const checkEmailBtn = document.getElementById('checkEmailBtn');
        const checkNicknameBtn = document.getElementById('checkNicknameBtn');
        const registerBtn = document.getElementById('registerBtn');
        
        // 이메일 중복 체크
        let emailChecked = false;
        checkEmailBtn.addEventListener('click', async () => {
            const email = emailInput.value.trim();
            if (!email) {
                emailFeedback.textContent = '이메일을 입력해주세요.';
                emailFeedback.className = 'form-text text-danger';
                return;
            }
            
            // 이메일 형식 검증
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                emailFeedback.textContent = '유효한 이메일 형식이 아닙니다.';
                emailFeedback.className = 'form-text text-danger';
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/auth/check-email?email=${encodeURIComponent(email)}`);
                const data = await response.json();
                
                if (data.available) {
                    emailFeedback.textContent = '사용 가능한 이메일입니다.';
                    emailFeedback.className = 'form-text text-success';
                    emailChecked = true;
                } else {
                    emailFeedback.textContent = '이미 사용 중인 이메일입니다.';
                    emailFeedback.className = 'form-text text-danger';
                    emailChecked = false;
                }
            } catch (error) {
                console.error('이메일 중복 확인 오류:', error);
                emailFeedback.textContent = '이메일 확인 중 오류가 발생했습니다.';
                emailFeedback.className = 'form-text text-danger';
                emailChecked = false;
            }
        });
        
        // 이메일 변경 시 중복 체크 상태 초기화
        emailInput.addEventListener('input', () => {
            emailChecked = false;
            emailFeedback.textContent = '';
        });
        
        // 닉네임 중복 체크
        let nicknameChecked = false;
        checkNicknameBtn.addEventListener('click', async () => {
            const nickname = nicknameInput.value.trim();
            if (!nickname) {
                nicknameFeedback.textContent = '닉네임을 입력해주세요.';
                nicknameFeedback.className = 'form-text text-danger';
                return;
            }
            
            try {
                // 디버깅 로그 추가
                console.log('닉네임 중복 확인 요청:', nickname);
                console.log('요청 URL:', `${API_BASE_URL}/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`);
                
                const response = await fetch(`${API_BASE_URL}/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`);
                console.log('닉네임 확인 응답 상태:', response.status, response.statusText);
                
                const data = await response.json();
                console.log('닉네임 확인 응답 데이터:', data);
                
                if (data.available) {
                    nicknameFeedback.textContent = '사용 가능한 닉네임입니다.';
                    nicknameFeedback.className = 'form-text text-success';
                    nicknameChecked = true;
                } else {
                    nicknameFeedback.textContent = '이미 사용 중인 닉네임입니다.';
                    nicknameFeedback.className = 'form-text text-danger';
                    nicknameChecked = false;
                }
            } catch (error) {
                console.error('닉네임 중복 확인 오류:', error);
                nicknameFeedback.textContent = '닉네임 확인 중 오류가 발생했습니다.';
                nicknameFeedback.className = 'form-text text-danger';
                nicknameChecked = false;
            }
        });
        
        // 닉네임 변경 시 중복 체크 상태 초기화
        nicknameInput.addEventListener('input', () => {
            nicknameChecked = false;
            nicknameFeedback.textContent = '';
        });
        
        // 비밀번호 일치 확인
        confirmPasswordInput.addEventListener('input', () => {
            if (passwordInput.value !== confirmPasswordInput.value) {
                passwordFeedback.textContent = '비밀번호가 일치하지 않습니다.';
                passwordFeedback.className = 'form-text text-danger';
            } else {
                passwordFeedback.textContent = '비밀번호가 일치합니다.';
                passwordFeedback.className = 'form-text text-success';
            }
        });
        
        // 회원가입 폼 제출
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 필수 필드 검증
            if (!emailInput.value || !nicknameInput.value || !passwordInput.value || !confirmPasswordInput.value) {
                showToast('모든 필드를 입력해주세요.', 'danger');
                return;
            }
            
            // 비밀번호 강도 검증
            if (passwordInput.value.length < 8) {
        showToast('비밀번호는 최소 8자 이상이어야 합니다.', 'danger');
        return;
    }
    
            // 비밀번호 일치 검증
            if (passwordInput.value !== confirmPasswordInput.value) {
                showToast('비밀번호가 일치하지 않습니다.', 'danger');
                return;
            }
            
            // 이메일 중복 검증
            if (!emailChecked) {
                showToast('이메일 중복 확인을 해주세요.', 'danger');
                return;
            }
            
            // 닉네임 중복 검증
            if (!nicknameChecked) {
                showToast('닉네임 중복 확인을 해주세요.', 'danger');
                return;
            }
            
            // 회원가입 요청
            try {
                registerBtn.disabled = true;
                registerBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 처리 중...';
                
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: emailInput.value,
                        nickname: nicknameInput.value,
                        password: passwordInput.value
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || '회원가입에 실패했습니다.');
                }
                
                const data = await response.json();
                localStorage.setItem('token', data.token);
                currentUser = {
                    id: data.id,
                    email: data.email,
                    nickname: data.nickname
                };
                
                showToast('회원가입이 완료되었습니다!', 'success');
                updateNavigation();
                loadContent('home');
            } catch (error) {
                console.error('회원가입 오류:', error);
                showToast(error.message, 'danger');
            } finally {
                registerBtn.disabled = false;
                registerBtn.textContent = '회원가입';
            }
        });
    } else {
        // 로그인 폼 이벤트 리스너
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || '로그인에 실패했습니다.');
                }
                
                const data = await response.json();
                localStorage.setItem('token', data.token);
                currentUser = {
                    id: data.id,
                    email: data.email,
                    nickname: data.nickname
                };
                
                showToast('로그인이 완료되었습니다!', 'success');
                updateNavigation();
                loadContent('home');
            } catch (error) {
                console.error('로그인 오류:', error);
                showToast(error.message, 'danger');
            }
        });
    }
}

// 폼 제출 이벤트 리스너 설정 (document에 직접 위임)
document.addEventListener('submit', async function(e) {
    if (e.target.id === 'authForm') {
        e.preventDefault();
        
        const emailInput = document.getElementById('emailInput');
        const passwordInput = document.getElementById('passwordInput');
        
        // 현재 페이지가 회원가입인지 로그인인지 확인
        const isRegister = document.getElementById('confirmPasswordInput') !== null;
        
        if (isRegister) {
            // 회원가입 처리
            const nameInput = document.getElementById('nameInput');
            const nicknameInput = document.getElementById('nicknameInput');
            const confirmPasswordInput = document.getElementById('confirmPasswordInput');
            
            if (passwordInput.value !== confirmPasswordInput.value) {
                showToast('비밀번호가 일치하지 않습니다.', 'danger');
                return;
            }
            
            try {
                // API 요청
                const response = await fetch(`http://localhost:3000/api/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: nameInput.value,
                        nickname: nicknameInput.value,
                        email: emailInput.value,
                        password: passwordInput.value
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || '회원가입에 실패했습니다.');
                }
                
                const data = await response.json();
                
                // 백업용으로 로컬스토리지에도 저장
                const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
                registeredUsers[emailInput.value] = {
                    id: data.user.id || 'user-' + Date.now(),
                    name: nameInput.value,
                    nickname: nicknameInput.value,
                    email: emailInput.value,
                    password: passwordInput.value, // 실제로는 해시된 비밀번호가 저장되지 않아야 함
                    createdAt: new Date().toISOString()
                };
                localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
                
                showToast('회원가입이 완료되었습니다.', 'success');
                setTimeout(() => loadContent('auth'), 1000);
            } catch (error) {
                console.error('회원가입 오류:', error);
                showToast('회원가입에 실패했습니다.', 'danger');
            }
        } else {
            // 로그인 처리
            try {
                // API 요청
                const response = await fetch(`http://localhost:3000/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: emailInput.value,
                        password: passwordInput.value
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || '로그인에 실패했습니다.');
                }
                
                const data = await response.json();
                
                // 임시 토큰 생성
                localStorage.setItem('token', data.token);
                
                // 사용자 정보 저장
                currentUser = data.user;
                
                // 마지막 로그인 이메일 저장 (폴백용)
                localStorage.setItem('lastLoggedInEmail', emailInput.value);
                
                updateNavigation();
                showToast('로그인되었습니다.', 'success');
                loadContent('home');
            } catch (error) {
                console.error('로그인 오류:', error);
                showToast('로그인에 실패했습니다.', 'danger');
            }
        }
    }
});

// Event listener to apply styling after page content updates
document.addEventListener('DOMContentLoaded', function() {
    // Apply the button styling to any existing buttons when the page loads
    applyButtonStylingToPage();
    
    // Use MutationObserver to detect when new elements are added to the DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                applyButtonStylingToPage();
            }
        });
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
});

// Function to apply button styling to all buttons on the page
function applyButtonStylingToPage() {
    // Target all buttons with inline styling
    document.querySelectorAll('button.btn[style*="background-color: #343a40"], button.btn[style*="background-color:#343a40"]').forEach(btn => {
        btn.removeAttribute('style');
        applyButtonStyle(btn);
    });
    
    // Target all standard primary buttons
    document.querySelectorAll('button.btn-primary:not(.btn-primary-custom)').forEach(btn => {
        btn.classList.remove('btn-primary');
        applyButtonStyle(btn);
    });
}

// Update showPaymentDialog to use consistent button styling
function showPaymentDialog(productId, sellerId, price, productTitle) {
    // Check if user is logged in
    if (!currentUser) {
        showToast('결제하려면 로그인이 필요합니다.', 'warning');
        loadContent('auth');
        return;
    }
    
    // Create payment modal element
    const modalEl = document.createElement('div');
    modalEl.className = 'modal fade';
    modalEl.id = 'paymentModal';
    modalEl.tabIndex = '-1';
    modalEl.setAttribute('aria-labelledby', 'paymentModalLabel');
    modalEl.setAttribute('aria-hidden', 'true');
    
    // Modal content HTML
    modalEl.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="paymentModalLabel">상품 결제</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="payment-details mb-4">
                        <h6>상품 정보</h6>
                        <p class="mb-1"><strong>상품명:</strong> ${productTitle}</p>
                        <p class="mb-1"><strong>가격:</strong> ₩${Number(price).toLocaleString()}</p>
                    </div>
                    
                    <form id="paymentForm">
                        <div class="mb-3">
                            <label for="paymentMethod" class="form-label">결제 방법</label>
                            <select class="form-select" id="paymentMethod" required>
                                <option value="">결제 방법 선택</option>
                                <option value="card">신용/체크카드</option>
                                <option value="bank">계좌이체</option>
                                <option value="phone">휴대폰 결제</option>
                                <option value="virtual">가상계좌</option>
                            </select>
                        </div>
                        
                        <div id="cardPaymentFields" style="display: none;">
                            <div class="mb-3">
                                <label for="cardNumber" class="form-label">카드 번호</label>
                                <input type="text" class="form-control" id="cardNumber" placeholder="0000-0000-0000-0000">
                            </div>
                            <div class="row mb-3">
                                <div class="col">
                                    <label for="cardExpiry" class="form-label">유효기간</label>
                                    <input type="text" class="form-control" id="cardExpiry" placeholder="MM/YY">
                                </div>
                                <div class="col">
                                    <label for="cardCVC" class="form-label">CVC</label>
                                    <input type="text" class="form-control" id="cardCVC" placeholder="000">
                                </div>
                            </div>
                        </div>
                        
                        <div id="bankPaymentFields" style="display: none;">
                            <div class="mb-3">
                                <label for="bankName" class="form-label">은행 선택</label>
                                <select class="form-select" id="bankName">
                                    <option value="">은행 선택</option>
                                    <option value="kb">국민은행</option>
                                    <option value="shinhan">신한은행</option>
                                    <option value="woori">우리은행</option>
                                    <option value="hana">하나은행</option>
                                    <option value="nh">농협은행</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="accountNumber" class="form-label">계좌번호</label>
                                <input type="text" class="form-control" id="accountNumber" placeholder="계좌번호 입력 (- 없이)">
                            </div>
                        </div>
                        
                        <div id="phonePaymentFields" style="display: none;">
                            <div class="mb-3">
                                <label for="phoneNumber" class="form-label">휴대폰 번호</label>
                                <input type="text" class="form-control" id="phoneNumber" placeholder="010-0000-0000">
                            </div>
                            <div class="mb-3">
                                <label for="carrier" class="form-label">통신사</label>
                                <select class="form-select" id="carrier">
                                    <option value="skt">SKT</option>
                                    <option value="kt">KT</option>
                                    <option value="lgu">LG U+</option>
                                    <option value="mvno">알뜰폰</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                    <button type="button" class="btn btn-primary-custom" id="processPaymentBtn">결제하기</button>
                </div>
            </div>
        </div>
    `;
    
    // Append modal to body
    document.body.appendChild(modalEl);
    
    // Initialize Bootstrap modal
    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    paymentModal.show();
    
    // ... rest of the function remains the same ...
}

// Update reportProduct function to use consistent styling
async function reportProduct(productId, productTitle) {
    if (!currentUser) {
        showToast('상품을 신고하려면 로그인이 필요합니다.', 'warning');
        loadContent('auth');
        return;
    }

    // 신고 사유 입력 받기
    const reasonElement = document.createElement('div');
    reasonElement.innerHTML = `
        <div class="form-group mb-3">
            <label for="reportReason" class="form-label">신고 사유:</label>
            <select class="form-control" id="reportReason" required>
                <option value="">신고 사유 선택</option>
                <option value="counterfeit">위조품/가품</option>
                <option value="prohibited">판매금지 물품</option>
                <option value="inappropriate">부적절한 콘텐츠</option>
                <option value="scam">사기/기만</option>
                <option value="other">기타</option>
            </select>
        </div>
        <div class="form-group" id="otherReasonContainer" style="display: none;">
            <label for="otherReason" class="form-label">상세 사유:</label>
            <textarea class="form-control" id="otherReason" rows="3" placeholder="신고 사유를 자세히 설명해주세요"></textarea>
        </div>
    `;

    // 모달 생성
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal fade';
    modalContainer.id = 'reportProductModal';
    modalContainer.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">상품 신고: ${productTitle}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="reportProductModalBody">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                    <button type="button" class="btn btn-primary-custom" id="submitProductReport">신고하기</button>
                </div>
            </div>
        </div>
    `;

    // 모달을 문서에 추가
    document.body.appendChild(modalContainer);
    document.getElementById('reportProductModalBody').appendChild(reasonElement);

    // ... rest of the function remains the same ...
}

// Update reportUser function to use consistent styling
async function reportUser(userId, username) {
    if (!currentUser) {
        alert('사용자를 신고하려면 로그인이 필요합니다.');
        loadContent('auth');
        return;
    }
    
    // 신고 이유 입력 받기
    const reasonElement = document.createElement('div');
    reasonElement.innerHTML = `
        <div class="form-group mb-3">
            <label for="reportReason" class="form-label">신고 사유:</label>
            <select class="form-control" id="reportReason" required>
                <option value="">신고 사유 선택</option>
                <option value="inappropriate">부적절한 콘텐츠</option>
                <option value="harassment">괴롭힘/비방</option>
                <option value="fraud">사기/기만</option>
                <option value="spam">스팸</option>
                <option value="other">기타</option>
            </select>
        </div>
        <div class="form-group mb-3" id="otherReasonContainer" style="display: none;">
            <label for="otherReason" class="form-label">상세 사유:</label>
            <textarea class="form-control" id="otherReason" rows="3" placeholder="신고 사유를 자세히 설명해주세요"></textarea>
        </div>
    `;
    
    // 모달 생성
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal fade';
    modalContainer.id = 'reportUserModal';
    modalContainer.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">사용자 신고: ${username}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="reportUserModalBody">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                    <button type="button" class="btn btn-primary-custom" id="submitUserReport">신고하기</button>
                </div>
            </div>
        </div>
    `;
    
    // 모달을 문서에 추가
    document.body.appendChild(modalContainer);
    document.getElementById('reportUserModalBody').appendChild(reasonElement);
    
    // ... rest of the function remains the same ...
}

// 판매자 프로필 조회 함수
async function viewSellerProfile(sellerId, sellerName) {
    if (!sellerId) {
        showToast('판매자 정보를 조회할 수 없습니다.', 'warning');
        return;
    }
    
    const mainContent = document.getElementById('mainContent');
    
    // 로딩 상태 표시
    mainContent.innerHTML = `
        <div class="container my-5">
            <div class="text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">판매자 정보를 불러오는 중...</p>
            </div>
        </div>
    `;
    
    try {
        console.log(`판매자 프로필 조회 - ID: ${sellerId}, 이름: ${sellerName}`);
        
        // 토큰 가져오기
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        // API에서 판매자 정보 가져오기
        let seller = null;
        const sellerResponse = await fetch(`${API_BASE_URL}/users/${sellerId}`, { headers });
        
        if (sellerResponse.ok) {
            seller = await sellerResponse.json();
            console.log('판매자 정보 로드 성공:', seller);
        } else {
            console.log('판매자 정보 로드 실패, 기본 정보 사용');
            seller = {
                id: sellerId,
                username: sellerName || '판매자',
                nickname: sellerName || '판매자',
                email: `${sellerName || 'seller'}@example.com`,
                createdAt: new Date().toISOString(),
                rating: '0.0',
                lastActive: new Date().toISOString()
            };
        }
        
        // 판매자의 상품 목록 가져오기
        let sellerProducts = [];
        const productsResponse = await fetch(`${API_BASE_URL}/products?sellerId=${sellerId}`, { headers });
        
        if (productsResponse.ok) {
            const result = await productsResponse.json();
            console.log('판매자 상품 목록 응답:', result);
            
            // API 응답 구조에 따라 데이터 추출
            if (Array.isArray(result)) {
                sellerProducts = result;
            } else if (result.products && Array.isArray(result.products)) {
                sellerProducts = result.products;
            } else if (result.data && Array.isArray(result.data)) {
                sellerProducts = result.data;
            }
            
            console.log(`${sellerProducts.length}개의 판매자 상품을 찾았습니다`);
        }
        
        // 판매자 표시 이름 결정
        const sellerDisplayName = seller.username || seller.nickname || seller.email || sellerName || '판매자';
        
        // 판매자 프로필 렌더링
        mainContent.innerHTML = `
            <div class="container my-5">
                <div class="row justify-content-center">
                    <div class="col-md-10">
                        <div class="card shadow">
                            <div class="card-body p-4">
                                <div class="d-flex justify-content-between align-items-center mb-4">
                                    <h2 class="mb-0">판매자 프로필</h2>
                                    <button class="btn btn-outline-secondary" onclick="history.back()">
                                        <i class="bi bi-arrow-left"></i> 돌아가기
                                    </button>
                                </div>
                                
                                <div class="seller-profile p-3 border-bottom">
                                    <div class="row">
                                        <div class="col-md-8">
                                            <h4>${sellerDisplayName}</h4>
                                            <p class="text-muted mb-2"><i class="bi bi-calendar"></i> 가입일: ${formatDate(seller.createdAt)}</p>
                                            <p class="text-muted mb-2"><i class="bi bi-clock"></i> 최근 활동: ${formatDate(seller.lastActive || seller.createdAt)}</p>
                                            <p class="mb-2">
                                                <i class="bi bi-star-fill text-warning"></i> 평점: ${seller.rating || '0'}/5.0
                                            </p>
                                            <p class="mb-0">
                                                <i class="bi bi-box-seam"></i> 등록 상품: ${sellerProducts.length}개
                                            </p>
                                        </div>
                                        <div class="col-md-4 text-center">
                                            <img src="${seller.profileImage || '/images/placeholder.jpg'}" 
                                                class="rounded-circle" alt="판매자 프로필" width="100" height="100"
                                                style="object-fit: cover;" onerror="handleImageError(this)">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="seller-products mt-4">
                                    <h5 class="mb-3">판매 중인 상품</h5>
                                    ${sellerProducts.length > 0 ? `
                                        <div class="row row-cols-1 row-cols-md-3 g-4">
                                            ${sellerProducts.map(product => {
                                                // 상품 이미지 설정
                                                let imageUrl = '/images/placeholder.jpg';
                                                if (product.images) {
                                                    if (Array.isArray(product.images) && product.images.length > 0) {
                                                        imageUrl = product.images[0];
                                                    } else if (typeof product.images === 'string') {
                                                        imageUrl = product.images;
                                                    }
                                                } else if (product.image) {
                                                    imageUrl = product.image;
                                                }
                                                
                                                return `
                                                    <div class="col">
                                                        <div class="card h-100">
                                                            <div style="height: 150px; overflow: hidden;">
                                                                <img src="${imageUrl}" class="card-img-top" alt="${product.title}" 
                                                                    style="width: 100%; height: 100%; object-fit: cover;" onerror="handleImageError(this)">
                                                            </div>
                                                            <div class="card-body">
                                                                <h6 class="card-title text-truncate">${product.title}</h6>
                                                                <p class="card-text fw-bold text-nowrap">${formatPrice(product.price)}</p>
                                                                <button class="btn btn-sm btn-primary w-100" onclick="viewProduct('${product.id}')">
                                                                    상세 보기
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                `;
                                            }).join('')}
                                        </div>
                                    ` : `
                                        <p class="text-muted">판매 중인 상품이 없습니다.</p>
                                    `}
                                </div>
                                
                                ${currentUser && currentUser.id !== sellerId ? `
                                    <div class="seller-actions mt-4 text-center">
                                        <button class="btn btn-primary me-2" onclick="startChat('', '${sellerId}')">
                                            <i class="bi bi-chat"></i> 채팅하기
                                        </button>
                                        <button class="btn btn-outline-danger" onclick="reportUser('${sellerId}', '${sellerDisplayName}')">
                                            <i class="bi bi-flag"></i> 신고하기
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 버튼 스타일 적용
        document.querySelectorAll('button.btn:not(.btn-link):not(.btn-outline-danger):not(.btn-close):not(.btn-secondary)').forEach(btn => {
            applyButtonStyle(btn);
        });
    } catch (error) {
        console.error('판매자 프로필 로드 오류:', error);
        mainContent.innerHTML = `
            <div class="container my-5">
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">판매자 정보를 불러오는데 실패했습니다.</h4>
                    <p>${error.message}</p>
                </div>
                <button class="btn btn-primary" onclick="history.back()">돌아가기</button>
            </div>
        `;
    }
}

// 수정 폼용 카테고리 불러오기
async function loadEditCategories(selectedCategoryId) {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        
        if (!response.ok) {
            throw new Error('카테고리를 불러오는데 실패했습니다.');
        }
        
        const categories = await response.json();
        const categorySelect = document.getElementById('editCategory');
        
        // 기본 옵션 유지
        const defaultOption = categorySelect.querySelector('option');
        categorySelect.innerHTML = '';
        categorySelect.appendChild(defaultOption);
        
        // 카테고리 옵션 추가
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            
            // 선택된 카테고리 설정
            if (selectedCategoryId && category.id === selectedCategoryId) {
                option.selected = true;
            }
            
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('카테고리 불러오기 오류:', error);
        showToast('카테고리를 불러오는데 실패했습니다.', 'danger');
    }
}

// 상품 수정 처리
async function handleEditProduct(e, productId) {
    e.preventDefault();
    
    const title = document.getElementById('editTitle').value;
    const description = document.getElementById('editDescription').value;
    const price = document.getElementById('editPrice').value;
    const categoryId = document.getElementById('editCategory').value;
    const location = document.getElementById('editLocation').value;
    const status = document.getElementById('editStatus').value;
    
    // 로딩 상태 표시
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 처리 중...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                title,
                description,
                price,
                categoryId,
                location,
                status
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || '상품 수정에 실패했습니다.');
        }
        
        showToast('상품이 성공적으로 수정되었습니다.', 'success');
        loadContent('myProducts');
    } catch (error) {
        console.error('상품 수정 오류:', error);
        showToast(`상품 수정 실패: ${error.message}`, 'danger');
        
        // 버튼 상태 복원
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
}

// 이미지 로드 실패 시 처리하는 전역 함수
function handleImageError(img) {
    img.onerror = null; // 무한 루프 방지
    
    // 안전한 인라인 SVG 문자열 생성 (Base64 인코딩 없이)
    img.src = "data:image/svg+xml," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 300 200">
        <rect width="100%" height="100%" fill="#f8f9fa"/>
        <rect x="10%" y="10%" width="80%" height="80%" fill="#e9ecef" rx="5" ry="5"/>
        <path d="M120,80 L180,80 L180,120 L120,120 Z" fill="#ced4da"/>
        <circle cx="150" cy="70" r="15" fill="#adb5bd"/>
        <path d="M120,140 L180,140 L150,110 Z" fill="#adb5bd"/>
        <text x="50%" y="170" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="#6c757d">이미지를 불러올 수 없습니다</text>
    </svg>
    `);
    
    // 품질 향상을 위한 추가 스타일
    img.style.objectFit = "contain";
    img.style.padding = "10px";
    img.style.backgroundColor = "#f8f9fa";
    
    return true;
}

// 상품 신고 함수
async function reportProduct(productId, productTitle) {
    console.log('reportProduct 함수 호출됨:', productId, productTitle);
    console.log('Bootstrap 존재 여부:', typeof bootstrap !== 'undefined' ? 'Bootstrap 사용 가능' : 'Bootstrap 없음');
    
    if (!currentUser) {
        showToast('상품을 신고하려면 로그인이 필요합니다.', 'warning');
        loadContent('auth');
        return;
    }

    // 신고 사유 입력 받기
    const reasonElement = document.createElement('div');
    reasonElement.innerHTML = `
        <div class="form-group mb-3">
            <label for="reportReason" class="form-label">신고 사유:</label>
            <select class="form-control" id="reportReason" required>
                <option value="">신고 사유 선택</option>
                <option value="counterfeit">위조품/가품</option>
                <option value="prohibited">판매금지 물품</option>
                <option value="inappropriate">부적절한 콘텐츠</option>
                <option value="scam">사기/기만</option>
                <option value="other">기타</option>
            </select>
        </div>
        <div class="form-group" id="otherReasonContainer" style="display: none;">
            <label for="otherReason" class="form-label">상세 사유:</label>
            <textarea class="form-control" id="otherReason" rows="3" placeholder="신고 사유를 자세히 설명해주세요"></textarea>
        </div>
    `;

    // 모달 생성
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal fade';
    modalContainer.id = 'reportProductModal';
    modalContainer.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">상품 신고: ${productTitle}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="reportProductModalBody">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                    <button type="button" class="btn btn-danger" id="submitProductReport">신고하기</button>
                </div>
            </div>
        </div>
    `;

    // 모달을 문서에 추가
    document.body.appendChild(modalContainer);
    document.getElementById('reportProductModalBody').appendChild(reasonElement);

    // 기타 사유 선택 시 추가 필드 표시
    document.getElementById('reportReason').addEventListener('change', function() {
        const otherReasonContainer = document.getElementById('otherReasonContainer');
        if (this.value === 'other') {
            otherReasonContainer.style.display = 'block';
        } else {
            otherReasonContainer.style.display = 'none';
        }
    });

    // Bootstrap 모달 초기화
    try {
        console.log('모달 요소 찾기 시도:', document.getElementById('reportProductModal'));
        
        if (typeof bootstrap === 'undefined') {
            console.error('Bootstrap이 정의되지 않았습니다');
            
            // Bootstrap이 없으면 대체 모달 표시
            alert(`상품 신고: ${productTitle}\n\n신고 사유를 선택해주세요.`);
            return;
        }
        
        if (!document.getElementById('reportProductModal')) {
            console.error('reportProductModal 요소를 찾을 수 없습니다');
            return;
        }
        
        const reportProductModal = new bootstrap.Modal(document.getElementById('reportProductModal'));
        console.log('모달 초기화 성공:', reportProductModal);
        
        // 모달 표시 전에 상태 확인
        document.getElementById('reportProductModal').addEventListener('shown.bs.modal', function() {
            console.log('모달이 표시되었습니다');
        });
        
        // 모달 표시
        reportProductModal.show();
        
    } catch (error) {
        console.error('모달 초기화 실패:', error);
        alert(`신고 모달을 표시하는데 문제가 발생했습니다: ${error.message}`);
    }

    // 신고 제출 처리
    document.getElementById('submitProductReport').addEventListener('click', async function() {
        console.log('신고 제출 버튼 클릭됨');
        const reportReason = document.getElementById('reportReason').value;
        if (!reportReason) {
            alert('신고 사유를 선택해주세요.');
            return;
        }

        let reason = reportReason;
        if (reportReason === 'other') {
            const otherReason = document.getElementById('otherReason').value.trim();
            if (!otherReason) {
                alert('상세 신고 사유를 입력해주세요.');
                return;
            }
            reason = `기타: ${otherReason}`;
        }

        try {
            console.log('신고 요청 데이터:', {
                productId: productId,
                reason: reason
            });
            
            const response = await fetch(`${API_BASE_URL}/reports/product`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    productId: productId,
                    reason: reason
                })
            });

            console.log('신고 API 응답:', response);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '상품 신고 실패');
            }

            reportProductModal.hide();
            setTimeout(() => {
                document.getElementById('reportProductModal').remove();
                showToast('상품 신고가 성공적으로 접수되었습니다.', 'success');
            }, 500);
        } catch (error) {
            console.error('상품 신고 오류:', error);
            alert(`신고 접수 실패: ${error.message}`);
        }
    });
}

// 기본 대화상자를 사용하는 간단한 상품 신고 함수
async function reportProductSimple(productId, productTitle, sellerId) {
    console.log('간단한 신고 함수 호출됨:', productId, productTitle, sellerId);
    
    if (!currentUser) {
        alert('상품을 신고하려면 로그인이 필요합니다.');
        loadContent('auth');
        return;
    }

    // 신고 사유 선택
    const reportReasonOptions = [
        "1: 위조품/가품",
        "2: 판매금지 물품", 
        "3: 부적절한 콘텐츠",
        "4: 사기/기만",
        "5: 기타 사유"
    ];

    const message = `상품 신고: ${productTitle}\n\n신고 사유를 선택해주세요:\n${reportReasonOptions.join('\n')}\n\n번호를 입력하세요 (1-5):`;
    const reasonChoice = prompt(message);
    
    if (!reasonChoice) return; // 취소됨
    
    let reason = '';
    
    switch(reasonChoice.trim()) {
        case '1': reason = 'counterfeit'; break;
        case '2': reason = 'prohibited'; break;
        case '3': reason = 'inappropriate'; break;
        case '4': reason = 'scam'; break;
        case '5': 
            const otherReason = prompt('기타 신고 사유를 자세히 입력해주세요:');
            if (!otherReason) return; // 취소됨
            reason = `기타: ${otherReason}`;
            break;
        default:
            alert('올바른 번호를 입력해주세요 (1-5)');
            return;
    }
    
    // 최종 확인
    const confirmed = confirm(`'${productTitle}' 상품을 신고하시겠습니까?\n\n신고 사유: ${reason}`);
    if (!confirmed) return;
    
    try {
        const requestData = {
            productId,
            reason
        };
        
        // 판매자 ID가 있으면 추가
        if (sellerId) {
            requestData.reportedUserId = sellerId;
        }
        
        console.log('신고 요청 데이터:', requestData);
        
        const response = await fetch(`${API_BASE_URL}/reports/product`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(requestData)
        });

        console.log('신고 API 응답:', response);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '상품 신고 실패');
        }

        alert('상품 신고가 성공적으로 접수되었습니다.');
    } catch (error) {
        console.error('상품 신고 오류:', error);
        alert(`신고 접수 실패: ${error.message}`);
    }
}
        