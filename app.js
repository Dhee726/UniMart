// app.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. INITIALIZE DATABASES ---
    if (!localStorage.getItem('unimart_users')) localStorage.setItem('unimart_users', JSON.stringify([]));
    if (!localStorage.getItem('unimart_pending')) localStorage.setItem('unimart_pending', JSON.stringify([]));
    if (!localStorage.getItem('unimart_transactions')) localStorage.setItem('unimart_transactions', JSON.stringify([]));
    if (!localStorage.getItem('unimart_reports')) localStorage.setItem('unimart_reports', JSON.stringify([]));
    
    if (!localStorage.getItem('unimart_approved')) {
        const seedItems = [
            { id: '1', title: 'iPhone 12 Pro (128GB)', price: '350000', category: 'Phones', location: 'Unilag', condition: 'Used - Excellent', seller: 'David O.', desc: 'Neat device, no scratches.', imgUrl: 'https://placehold.co/600x400/4338ca/ffffff?text=iPhone+12' },
            { id: '2', title: 'HP EliteBook 840 G5', price: '180000', category: 'Laptops', location: 'OAU', condition: 'Used', seller: 'David O.', desc: 'Good battery life.', imgUrl: 'https://placehold.co/600x400/f97316/ffffff?text=HP+Laptop' },
            { id: '3', title: 'Accounting Textbook', price: '5000', category: 'Textbooks', location: 'UNIBEN', condition: 'New', seller: 'David O.', desc: 'Latest edition.', imgUrl: 'https://placehold.co/600x400/10b981/ffffff?text=Textbook' },
            { id: '4', title: 'Bed Space at Yaba (Male)', price: '120000', category: 'Hostels', location: 'YabaTech Off-Campus', rentDuration: '1 Year', seller: 'Samuel T.', desc: 'Quiet environment with water.', imgUrl: 'https://placehold.co/600x400/ef4444/ffffff?text=Hostel' }
        ];
        localStorage.setItem('unimart_approved', JSON.stringify(seedItems));
    }

    // --- 2. GLOBAL UTILITIES (Theme, Toast, Report Modal) ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const themeIcon = themeToggleBtn?.querySelector('i');

    const savedTheme = localStorage.getItem('unimart-theme') || 'light';
    if (savedTheme === 'dark') {
        htmlElement.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            let newTheme = htmlElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('unimart-theme', newTheme);
            if (themeIcon) newTheme === 'dark' ? themeIcon.classList.replace('fa-moon', 'fa-sun') : themeIcon.classList.replace('fa-sun', 'fa-moon');
        });
    }

    window.showToast = function(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast`;
        const borderCol = type === 'success' ? 'var(--success)' : (type === 'danger' ? 'var(--danger)' : 'var(--primary)');
        toast.style.borderLeftColor = borderCol;
        
        toast.innerHTML = `<div><p style="font-weight: 600; font-size: 0.875rem; margin: 0;">System Alert</p><p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">${message}</p></div>`;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 4000);
    };

    // Report Feature (Fires from Footer)
    window.openReportModal = function(e) {
        if(e) e.preventDefault();
        const userToReport = prompt("UniMart Trust & Safety\n\nEnter the Username or Email of the person you are reporting:");
        if(!userToReport) return;
        const reason = prompt("Briefly describe the fraudulent activity or issue:");
        if(!reason) return;
        
        const reports = JSON.parse(localStorage.getItem('unimart_reports'));
        reports.push({ id: Date.now(), user: userToReport, reason: reason, date: new Date().toLocaleDateString() });
        localStorage.setItem('unimart_reports', JSON.stringify(reports));
        showToast("Report submitted successfully. Admins will review it shortly.");
    }

    // --- 3. AUTHENTICATION & NAVBAR ---
    const currentUser = JSON.parse(localStorage.getItem('unimart_current_user'));
    const navAuthContainer = document.getElementById('nav-auth-container');
    
    if (currentUser && navAuthContainer) {
        let postItemButtonHTML = currentUser.role === 'seller' ? `<a href="post-ad.html" class="btn btn-accent"><i class="fa-solid fa-plus"></i> Post Item</a>` : '';
        navAuthContainer.innerHTML = `
            <button class="icon-btn" id="theme-toggle" onclick="location.reload()"><i class="fa-regular ${savedTheme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i></button>
            <span style="font-weight: 600; font-size: 0.875rem;">Hi, ${currentUser.name.split(' ')[0]}</span>
            <button class="btn btn-outline" id="logout-btn">Log Out</button>
            ${postItemButtonHTML}
        `;
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('unimart_current_user');
            window.location.href = 'index.html';
        });
    }

    // --- 4. HOME PAGE FEED ---
    if (document.getElementById('dynamic-product-grid')) {
        const grid = document.getElementById('dynamic-product-grid');
        const noResults = document.getElementById('no-results-msg');
        let allItems = JSON.parse(localStorage.getItem('unimart_approved')) || [];

        const renderGrid = (items) => {
            if (items.length === 0) { grid.innerHTML = ''; noResults.classList.remove('hidden'); return; }
            noResults.classList.add('hidden');
            grid.innerHTML = items.map(item => `
                <article class="product-card" onclick="window.location.href='product.html?id=${item.id}'">
                    <img src="${item.imgUrl}" alt="${item.title}" class="product-image">
                    <div class="product-info">
                        <h3 class="product-title">${item.title}</h3>
                        <p class="product-price">₦${Number(item.price).toLocaleString()}</p>
                        <div class="product-meta">
                            <span><i class="fa-solid fa-location-dot"></i> ${item.location || 'Campus'}</span>
                            <span class="verified-badge">${item.category}</span>
                        </div>
                    </div>
                </article>
            `).join('');
        };

        renderGrid(allItems);

        const categoryPills = document.querySelectorAll('.category-pill');
        categoryPills.forEach(pill => {
            pill.addEventListener('click', () => {
                categoryPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                const filterType = pill.dataset.filter;
                renderGrid(filterType === 'All' ? allItems : allItems.filter(i => i.category === filterType));
            });
        });
        
        const searchInput = document.getElementById('nav-search');
        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                renderGrid(allItems.filter(i => i.title.toLowerCase().includes(term) || i.category.toLowerCase().includes(term)));
            });
        }
    }


    // --- 5. PRODUCT DETAIL & BUYING ENGINE ---
    if (document.getElementById('product-detail-view')) {
        const urlParams = new URLSearchParams(window.location.search);
        const itemId = urlParams.get('id');
        const approvedItems = JSON.parse(localStorage.getItem('unimart_approved')) || [];
        const item = approvedItems.find(i => i.id === itemId);
        const viewContainer = document.getElementById('product-detail-view');

        if (!item) {
            viewContainer.innerHTML = `<h2 style="text-align:center; margin-top: 5rem;">Item not found or already sold.</h2>`;
        } else {
            const sellerItems = approvedItems.filter(i => i.seller === item.seller);
            let storeHTML = sellerItems.length > 2 ? `
                <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(67, 56, 202, 0.05); border-radius: var(--radius-md); border: 1px dashed var(--primary); text-align: center;">
                    <p style="font-size: 0.875rem; font-weight: 600; color: var(--primary); margin-bottom: 0.5rem;">${item.seller} has ${sellerItems.length} active items!</p>
                    <button class="btn btn-outline" style="width: 100%; border-color: var(--primary); color: var(--primary);" onclick="window.location.href='store.html?seller=${encodeURIComponent(item.seller)}'">
                        <i class="fa-solid fa-shop"></i> Visit Seller Store
                    </button>
                </div>` : '';

            let extraTagsHTML = '';
            if (item.condition) extraTagsHTML += `<span class="verified-badge"><i class="fa-solid fa-tag"></i> ${item.condition}</span>`;
            if (item.rentDuration) extraTagsHTML += `<span class="verified-badge"><i class="fa-solid fa-calendar"></i> ${item.rentDuration}</span>`;

            // Setup Action Buttons based on Role
            let actionButtonsHTML = '';
            if (!currentUser) {
                actionButtonsHTML = `<button class="btn btn-primary" style="width:100%; margin-bottom:1rem;" onclick="showToast('Please log in to purchase items.', 'info')">Log in to Buy</button>`;
            } else if (currentUser.role === 'buyer') {
                actionButtonsHTML = `<button class="btn btn-success" style="width:100%; margin-bottom:1rem; font-size:1.1rem; padding:1rem;" onclick="processPurchase('${item.id}')"><i class="fa-solid fa-cart-shopping"></i> Buy Item Now</button>`;
            }

            viewContainer.innerHTML = `
                <div class="detail-container">
                    <div class="detail-image-wrapper"><img src="${item.imgUrl}" alt="${item.title}"></div>
                    <div class="detail-card">
                        <div style="margin-bottom: 1.5rem;">
                            <span style="font-size: 0.875rem; color: var(--text-muted); text-transform: uppercase;">${item.category}</span>
                            <h1 style="font-size: 1.75rem; font-weight: 700; margin: 0.5rem 0;">${item.title}</h1>
                            <h2 class="product-price" style="font-size: 2rem;">₦${Number(item.price).toLocaleString()}</h2>
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
                                <span class="verified-badge"><i class="fa-solid fa-location-dot"></i> ${item.location || 'Campus'}</span>
                                ${extraTagsHTML}
                            </div>
                        </div>

                        <div class="seller-profile">
                            <div class="user-avatar">${item.seller.charAt(0)}</div>
                            <div>
                                <h3 style="font-size: 1rem; font-weight: 600;">${item.seller}</h3>
                                <p style="font-size: 0.875rem; color: var(--success);"><i class="fa-solid fa-circle-check"></i> Verified Seller</p>
                            </div>
                        </div>

                        <div style="margin-bottom: 2rem;">
                            <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">Description</h3>
                            <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.6;">${item.desc || 'No description provided.'}</p>
                        </div>
                        
                        ${actionButtonsHTML}
                        <button class="btn btn-whatsapp" onclick="window.open('https://wa.me/2340000000000', '_blank')"><i class="fa-brands fa-whatsapp"></i> Chat with Seller</button>
                        ${storeHTML}
                    </div>
                </div>
            `;
        }

        // Purchase Function
        window.processPurchase = function(id) {
            if(!confirm("Are you sure you want to purchase this item?")) return;
            
            let approved = JSON.parse(localStorage.getItem('unimart_approved'));
            let transactions = JSON.parse(localStorage.getItem('unimart_transactions'));
            
            const itemIndex = approved.findIndex(i => i.id === id);
            if(itemIndex > -1) {
                const boughtItem = approved.splice(itemIndex, 1)[0];
                
                // Log Transaction
                transactions.push({
                    id: Date.now().toString(),
                    title: boughtItem.title,
                    price: boughtItem.price,
                    seller: boughtItem.seller,
                    buyer: currentUser.name,
                    date: new Date().toLocaleDateString()
                });
                
                localStorage.setItem('unimart_approved', JSON.stringify(approved));
                localStorage.setItem('unimart_transactions', JSON.stringify(transactions));
                
                alert("Purchase successful! The item has been reserved and removed from the public feed.");
                window.location.href = 'index.html';
            }
        };
    }


    // --- 6. STORE PAGE (Mini Store) ---
    if (document.getElementById('store-header-container')) {
        const urlParams = new URLSearchParams(window.location.search);
        const sellerName = urlParams.get('seller');
        const approvedItems = JSON.parse(localStorage.getItem('unimart_approved')) || [];
        const sellerItems = approvedItems.filter(i => i.seller === sellerName);
        
        if (!sellerName || sellerItems.length === 0) {
            document.getElementById('store-header-container').innerHTML = `<h2 style="text-align:center; padding:3rem;">Store not found or empty.</h2>`;
        } else {
            document.getElementById('store-header-container').innerHTML = `
                <div class="store-hero">
                    <div class="user-avatar">${sellerName.charAt(0)}</div>
                    <h1 style="font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem;">${sellerName}'s Store</h1>
                    <p style="color: var(--text-muted);"><i class="fa-solid fa-circle-check" style="color: var(--success);"></i> Verified UniMart Seller • ${sellerItems.length} Active Listings</p>
                </div>
            `;
            
            document.getElementById('store-product-grid').innerHTML = sellerItems.map(item => `
                <article class="product-card" onclick="window.location.href='product.html?id=${item.id}'">
                    <img src="${item.imgUrl}" alt="${item.title}" class="product-image">
                    <div class="product-info">
                        <h3 class="product-title">${item.title}</h3>
                        <p class="product-price">₦${Number(item.price).toLocaleString()}</p>
                    </div>
                </article>
            `).join('');
        }
    }


    // --- 7. ADMIN DASHBOARD (RESTORED & EXPANDED) ---
    if (document.getElementById('admin-pending-list')) {
        const tabs = ['approvals', 'users', 'transactions', 'reports'];
        
        // Tab Switcher
        tabs.forEach(tab => {
            const btn = document.getElementById(`tab-${tab}`);
            if(btn) {
                btn.addEventListener('click', () => {
                    tabs.forEach(t => {
                        document.getElementById(`tab-${t}`).classList.replace('btn-primary', 'btn-outline');
                        document.getElementById(`section-${t}`).classList.add('hidden');
                    });
                    btn.classList.replace('btn-outline', 'btn-primary');
                    document.getElementById(`section-${tab}`).classList.remove('hidden');
                    
                    if(tab === 'approvals') renderApprovals();
                    if(tab === 'users') renderUsers();
                    if(tab === 'transactions') renderTransactions();
                    if(tab === 'reports') renderReports();
                });
            }
        });

        // 1. Render Approvals
        const renderApprovals = () => {
            const pending = JSON.parse(localStorage.getItem('unimart_pending')) || [];
            const container = document.getElementById('admin-pending-list');
            if (pending.length === 0) return container.innerHTML = `<p style="padding:2rem; text-align:center; color:var(--text-muted);">No items pending approval.</p>`;

            container.innerHTML = pending.map(item => `
                <div class="admin-list-item">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <img src="${item.imgUrl}" class="admin-item-img">
                        <div>
                            <h4 style="font-weight: 600;">${item.title}</h4>
                            <p style="color: var(--primary); font-weight: 700; font-size: 0.875rem;">₦${Number(item.price).toLocaleString()} • ${item.category}</p>
                            <p style="font-size: 0.75rem; color: var(--text-muted);">By: ${item.seller}</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-success" onclick="approveItem('${item.id}')"><i class="fa-solid fa-check"></i></button>
                        <button class="btn btn-danger" onclick="rejectItem('${item.id}')"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                </div>
            `).join('');
        };

        // 2. Render Users & Stats
        const renderUsers = () => {
            const users = JSON.parse(localStorage.getItem('unimart_users')) || [];
            const transactions = JSON.parse(localStorage.getItem('unimart_transactions')) || [];
            const activeItems = JSON.parse(localStorage.getItem('unimart_approved')) || [];
            const container = document.getElementById('admin-users-list');
            
            if (users.length === 0) return container.innerHTML = `<p style="padding:2rem; text-align:center; color:var(--text-muted);">No users registered.</p>`;

            container.innerHTML = users.map(user => {
                // Calculate Stats
                let itemsBought = transactions.filter(t => t.buyer === user.name).length;
                let itemsSold = transactions.filter(t => t.seller === user.name).length;
                let activeCount = activeItems.filter(i => i.seller === user.name).length;
                
                return `
                <div class="admin-list-item" style="flex-direction:column; align-items:flex-start;">
                    <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; flex-wrap: wrap; gap:1rem;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div class="user-avatar">${user.name.charAt(0)}</div>
                            <div>
                                <h4 style="font-weight: 600;">${user.name} <span class="verified-badge" style="text-transform: capitalize;">${user.role}</span></h4>
                                <p style="font-size: 0.875rem; color: var(--text-muted);">${user.email} • ${user.phone}</p>
                            </div>
                        </div>
                        <button class="btn btn-danger" onclick="removeUser('${user.email}')"><i class="fa-solid fa-trash"></i> Ban User</button>
                    </div>
                    <div class="admin-stats">
                        <span>🛒 Bought: ${itemsBought}</span>
                        <span>💰 Sold: ${itemsSold}</span>
                        <span>🏪 Active Ads: ${activeCount}</span>
                    </div>
                </div>`;
            }).join('');
        };

        // 3. Render Transactions
        const renderTransactions = () => {
            const txs = JSON.parse(localStorage.getItem('unimart_transactions')) || [];
            const container = document.getElementById('admin-transactions-list');
            if (txs.length === 0) return container.innerHTML = `<p style="padding:2rem; text-align:center; color:var(--text-muted);">No purchases made yet.</p>`;

            container.innerHTML = txs.map(tx => `
                <div class="admin-list-item" style="display:block;">
                    <p style="font-size:0.875rem; color:var(--text-muted); margin-bottom:0.25rem;">${tx.date}</p>
                    <p style="font-weight:600;">${tx.buyer} <span style="color:var(--text-muted); font-weight:normal;">purchased</span> ${tx.title} <span style="color:var(--text-muted); font-weight:normal;">from</span> ${tx.seller}</p>
                    <p style="color:var(--success); font-weight:700;">₦${Number(tx.price).toLocaleString()}</p>
                </div>
            `).reverse().join('');
        };

        // 4. Render Reports
        const renderReports = () => {
            const reports = JSON.parse(localStorage.getItem('unimart_reports')) || [];
            const container = document.getElementById('admin-reports-list');
            if (reports.length === 0) return container.innerHTML = `<p style="padding:2rem; text-align:center; color:var(--text-muted);">No reports submitted.</p>`;

            container.innerHTML = reports.map(r => `
                <div class="admin-list-item" style="display:block; border-left: 4px solid var(--danger);">
                    <p style="font-size:0.875rem; color:var(--text-muted);">${r.date}</p>
                    <h4 style="font-weight:600; color:var(--danger); margin-bottom:0.25rem;">Reported User: ${r.user}</h4>
                    <p style="font-size:0.9rem;">Reason: ${r.reason}</p>
                </div>
            `).reverse().join('');
        };

        // Admin Actions
        window.approveItem = (id) => {
            let pending = JSON.parse(localStorage.getItem('unimart_pending'));
            let approved = JSON.parse(localStorage.getItem('unimart_approved'));
            const itemIndex = pending.findIndex(i => i.id === id);
            if (itemIndex > -1) {
                approved.push(pending.splice(itemIndex, 1)[0]);
                localStorage.setItem('unimart_pending', JSON.stringify(pending));
                localStorage.setItem('unimart_approved', JSON.stringify(approved));
                renderApprovals();
                showToast("Item Approved!");
            }
        };

        window.rejectItem = (id) => {
            let pending = JSON.parse(localStorage.getItem('unimart_pending'));
            localStorage.setItem('unimart_pending', JSON.stringify(pending.filter(i => i.id !== id)));
            renderApprovals();
            showToast("Item Rejected.", "info");
        };

        window.removeUser = (email) => {
            if(!confirm("Are you sure you want to ban this user? ALL their active items will be deleted from the marketplace permanently.")) return;
            
            let users = JSON.parse(localStorage.getItem('unimart_users'));
            let approved = JSON.parse(localStorage.getItem('unimart_approved'));
            const userToRemove = users.find(u => u.email === email);
            
            if(userToRemove) {
                // Delete User
                localStorage.setItem('unimart_users', JSON.stringify(users.filter(u => u.email !== email)));
                // Delete all their active items
                localStorage.setItem('unimart_approved', JSON.stringify(approved.filter(i => i.seller !== userToRemove.name)));
                
                renderUsers();
                showToast(`User ${userToRemove.name} and their items have been removed.`, "danger");
            }
        };

        // Initial Load
        renderApprovals();
    }


    // --- 8. POST AD & AUTH FORMS ---
    // Post Ad Form
    if (document.getElementById('post-ad-form')) {
        if (!currentUser || currentUser.role !== 'seller') {
            alert("Access Denied: Only Sellers can post items.");
            window.location.href = 'index.html';
        }

        const categorySelect = document.getElementById('ad-category');
        const dynamicFieldsContainer = document.getElementById('dynamic-fields-container');

        categorySelect.addEventListener('change', (e) => {
            const cat = e.target.value;
            if (['Phones', 'Laptops', 'Fashion', 'Textbooks'].includes(cat)) {
                dynamicFieldsContainer.innerHTML = `<div><label class="form-label">Condition</label><select id="ad-condition" class="form-control" required><option value="">Select...</option><option value="New">Brand New</option><option value="Used - Like New">Used - Like New</option><option value="Used - Fair">Used - Fair</option></select></div><div><label class="form-label">Location</label><input type="text" id="ad-location" class="form-control" required></div>`;
            } else if (cat === 'Hostels') {
                dynamicFieldsContainer.innerHTML = `<div><label class="form-label">Rent Duration</label><select id="ad-rent-duration" class="form-control" required><option value="">Select...</option><option value="Per Semester">Per Semester</option><option value="Per Session (1 Year)">Per Session (1 Year)</option></select></div><div><label class="form-label">Hostel Location</label><input type="text" id="ad-location" class="form-control" required></div>`;
            } else {
                dynamicFieldsContainer.innerHTML = `<div style="grid-column: span 2;"><label class="form-label">Location</label><input type="text" id="ad-location" class="form-control" required></div>`;
            }
        });

        const uploadBtn = document.getElementById('cloudinary-upload-btn');
        const hiddenUrlInput = document.getElementById('uploaded_image_url');
        if (uploadBtn && typeof cloudinary !== 'undefined') {
            const myWidget = cloudinary.createUploadWidget({ cloudName: 'dlljhpt1u', uploadPreset: 'ml_default', sources: ['local', 'camera'], multiple: false, maxFiles: 1, theme: 'minimal'}, (error, result) => { 
                if (!error && result && result.event === "success") { 
                    hiddenUrlInput.value = result.info.secure_url;
                    document.getElementById('image-preview-container').innerHTML = `<div class="preview-item"><img src="${result.info.secure_url}"></div>`;
                    uploadBtn.style.display = 'none';
                }
            });
            uploadBtn.addEventListener('click', () => myWidget.open(), false);
        }

        document.getElementById('post-ad-form').addEventListener('submit', (e) => {
            e.preventDefault();
            if(!hiddenUrlInput.value) return alert("Please upload an image.");
            const conditionEl = document.getElementById('ad-condition');
            const durationEl = document.getElementById('ad-rent-duration');
            const locationEl = document.getElementById('ad-location');

            const pending = JSON.parse(localStorage.getItem('unimart_pending'));
            pending.push({
                id: Date.now().toString(),
                title: document.getElementById('ad-title').value,
                price: document.getElementById('ad-price').value,
                category: document.getElementById('ad-category').value,
                desc: document.getElementById('ad-desc').value,
                imgUrl: hiddenUrlInput.value,
                seller: currentUser.name,
                status: 'pending',
                location: locationEl ? locationEl.value : 'Campus',
                condition: conditionEl ? conditionEl.value : null,
                rentDuration: durationEl ? durationEl.value : null
            });
            localStorage.setItem('unimart_pending', JSON.stringify(pending));
            window.location.href = 'index.html';
        });
    }

    // Auth Forms
    if (document.getElementById('signup-form')) {
        document.querySelectorAll('.role-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.role-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                document.getElementById('signup-role').value = card.dataset.role;
            });
        });
        document.getElementById('signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const users = JSON.parse(localStorage.getItem('unimart_users'));
            const user = { name: document.getElementById('signup-name').value, email: document.getElementById('signup-email').value, phone: document.getElementById('signup-phone').value, password: document.getElementById('signup-password').value, role: document.getElementById('signup-role').value };
            users.push(user);
            localStorage.setItem('unimart_users', JSON.stringify(users));
            localStorage.setItem('unimart_current_user', JSON.stringify(user));
            window.location.href = 'index.html';
        });
    }

    if (document.getElementById('login-form')) {
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const users = JSON.parse(localStorage.getItem('unimart_users'));
            const user = users.find(u => u.email === document.getElementById('login-email').value && u.password === document.getElementById('login-password').value);
            if (user) { localStorage.setItem('unimart_current_user', JSON.stringify(user)); window.location.href = 'index.html'; }
            else { showToast("Invalid credentials.", "info"); }
        });
    }
});