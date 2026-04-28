/**
 * 🎬 ANIMEHUB - JAVASCRIPT HOÀN CHỈNH
 */

(function() {
    'use strict';

    // ========== STORAGE KEYS ==========
    const KEYS = {
        users: 'ah_users_v4',
        movies: 'ah_movies_v4',
        categories: 'ah_categories_v4',
        socialLogs: 'ah_social_logs_v4',
        currentUser: 'ah_current_user_v4',
        history: 'ah_history_v4',
        favorites: 'ah_favorites_v4',
        settings: 'ah_settings_v4'
    };

    // ========== HELPERS ==========
    function loadData(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) {
            console.error('Lỗi load:', key, e);
            return fallback;
        }
    }

    function saveData(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Lỗi save:', key, e);
        }
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    }

    function showToast(message, type) {
        type = type || 'info';
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };
        const toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '"></i> ' + message;

        const container = document.getElementById('toastContainer');
        if (container) {
            container.appendChild(toast);
        } else {
            document.body.appendChild(toast);
        }

        setTimeout(function() {
            toast.classList.add('removing');
            setTimeout(function() {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // ========== APP STATE ==========
    let users = loadData(KEYS.users, []);
    let movies = loadData(KEYS.movies, []);
    let categories = loadData(KEYS.categories, []);
    let socialLogs = loadData(KEYS.socialLogs, []);
    let currentUser = loadData(KEYS.currentUser, null);
    let watchHistory = loadData(KEYS.history, []);
    let favorites = loadData(KEYS.favorites, []);
    let appSettings = loadData(KEYS.settings, { theme: 'purple' });

    let exploreFilter = 'all';
    let currentMovieId = null;
    let currentEpisodeIdx = 0;

    function saveAll() {
        saveData(KEYS.users, users);
        saveData(KEYS.movies, movies);
        saveData(KEYS.categories, categories);
        saveData(KEYS.socialLogs, socialLogs);
        saveData(KEYS.history, watchHistory);
        saveData(KEYS.favorites, favorites);
        saveData(KEYS.settings, appSettings);
        if (currentUser) {
            saveData(KEYS.currentUser, currentUser);
        } else {
            localStorage.removeItem(KEYS.currentUser);
        }
    }

    // ========== DEFAULT DATA ==========
    function createDefaultData() {
        // Admin
        if (!users.find(function(u) { return u.email === 'admin@animehub.com'; })) {
            users.push({
                id: 'admin001',
                name: 'Admin',
                email: 'admin@animehub.com',
                password: 'admin123',
                avatar: '👑',
                bio: 'Quản trị viên',
                isAdmin: true,
                loginMethod: 'email',
                createdAt: new Date().toISOString()
            });
        }

        // Categories
        if (!categories.length) {
            categories = ['Hành Động', 'Phiêu Lưu', 'Hài Hước', 'Tình Cảm', 'Kinh Dị', 'Viễn Tưởng', 'Học Đường', 'Shounen'];
        }

        // Movies with episodes
        if (!movies.length) {
            const now = new Date();
            movies = [
                {
                    id: 'm001',
                    title: 'One Piece',
                    category: 'Phiêu Lưu',
                    emoji: '🏴‍☠️',
                    quality: 'Full HD',
                    description: 'Hành trình tìm kho báu One Piece của Luffy và băng hải tặc Mũ Rơm.',
                    views: 15234,
                    createdAt: new Date(now - 86400000 * 7).toISOString(),
                    episodes: [
                        { number: 1, title: 'Tập 1: Tôi là Luffy! Người sẽ trở thành Vua Hải Tặc!', driveLink: '' },
                        { number: 2, title: 'Tập 2: Tay kiếm vĩ đại! Roronoa Zoro xuất hiện!', driveLink: '' },
                        { number: 3, title: 'Tập 3: Morgan và Luffy! Cô gái bí ẩn là ai?', driveLink: '' }
                    ]
                },
                {
                    id: 'm002',
                    title: 'Doraemon',
                    category: 'Hài Hước',
                    emoji: '🐱',
                    quality: 'HD',
                    description: 'Chú mèo máy đến từ thế kỷ 22 với những bảo bối thần kỳ.',
                    views: 20100,
                    createdAt: new Date(now - 86400000 * 3).toISOString(),
                    episodes: [
                        { number: 1, title: 'Tập 1: Doraemon đến từ tương lai', driveLink: '' },
                        { number: 2, title: 'Tập 2: Bảo bối chong chóng tre', driveLink: '' },
                        { number: 3, title: 'Tập 3: Cỗ máy thời gian', driveLink: '' },
                        { number: 4, title: 'Tập 4: Cánh cửa thần kỳ', driveLink: '' },
                        { number: 5, title: 'Tập 5: Bánh mì trí nhớ', driveLink: '' }
                    ]
                },
                {
                    id: 'm003',
                    title: 'Naruto Shippuden',
                    category: 'Hành Động',
                    emoji: '🍥',
                    quality: 'Full HD',
                    description: 'Naruto trở về sau 3 năm tu luyện, đối mặt với tổ chức Akatsuki.',
                    views: 12890,
                    createdAt: new Date(now - 86400000 * 5).toISOString(),
                    episodes: [
                        { number: 1, title: 'Tập 1: Naruto Uzumaki trở về!', driveLink: '' },
                        { number: 2, title: 'Tập 2: Konohamaru là đệ tử!', driveLink: '' },
                        { number: 3, title: 'Tập 3: Sasuke và Sakura: Bạn hay thù?', driveLink: '' }
                    ]
                },
                {
                    id: 'm004',
                    title: 'Your Name',
                    category: 'Tình Cảm',
                    emoji: '💫',
                    quality: '4K',
                    description: 'Câu chuyện tình yêu kỳ diệu giữa hai người xa lạ hoán đổi thân xác.',
                    views: 18500,
                    createdAt: new Date(now - 86400000 * 2).toISOString(),
                    episodes: [
                        { number: 1, title: 'Your Name - Full Movie', driveLink: '' }
                    ]
                },
                {
                    id: 'm005',
                    title: 'Demon Slayer',
                    category: 'Hành Động',
                    emoji: '👹',
                    quality: 'Full HD',
                    description: 'Tanjiro chiến đấu chống lại lũ quỷ để cứu em gái Nezuko.',
                    views: 22300,
                    createdAt: new Date(now - 86400000).toISOString(),
                    episodes: [
                        { number: 1, title: 'Tập 1: Sự tàn ác', driveLink: '' },
                        { number: 2, title: 'Tập 2: Người huấn luyện Urokodaki Sakonji', driveLink: '' },
                        { number: 3, title: 'Tập 3: Sabito và Makomo', driveLink: '' }
                    ]
                }
            ];
        }

        saveAll();
    }

    // ========== NAVIGATION ==========
    function navigateTo(page) {
        document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
        document.querySelectorAll('.nav-btn, .sidebar-item').forEach(function(el) { el.classList.remove('active'); });

        const targetPage = document.getElementById('page-' + page);
        if (targetPage) targetPage.classList.add('active');

        document.querySelectorAll('.nav-btn, .sidebar-item').forEach(function(el) {
            const onclick = el.getAttribute('onclick');
            if (onclick && onclick.indexOf("'" + page + "'") !== -1) {
                el.classList.add('active');
            }
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (page !== 'player') renderCurrentPage(page);
    }

    function renderCurrentPage(page) {
        const renderers = {
            home: renderHome,
            explore: renderExplore,
            trending: function() {
                document.getElementById('trendingGrid').innerHTML = movies.slice().sort(function(a, b) { return (b.views || 0) - (a.views || 0); }).map(createMovieCard).join('');
            },
            newest: function() {
                document.getElementById('newestGrid').innerHTML = movies.slice().sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); }).map(createMovieCard).join('');
            },
            categories: function() {
                document.getElementById('categoriesGrid').innerHTML = categories.map(function(c) {
                    const count = movies.filter(function(m) { return m.category === c; }).length;
                    return '<div class="admin-card" style="text-align:center;cursor:pointer;padding:20px;" onclick="App.clickCategory(\'' + escapeHTML(c).replace(/'/g, "\\'") + '\')"><div style="font-size:35px;">🎬</div><div style="font-weight:700;">' + escapeHTML(c) + '</div><div style="font-size:11px;color:var(--text-muted);">' + count + ' phim</div></div>';
                }).join('');
            },
            history: function() {
                const grid = document.getElementById('historyGrid');
                grid.innerHTML = watchHistory.length ? watchHistory.slice().reverse().map(createMovieCard).join('') : '<p style="grid-column:1/-1;text-align:center;padding:30px;color:var(--text-muted);">Chưa có lịch sử xem</p>';
            },
            favorites: function() {
                const grid = document.getElementById('favoritesGrid');
                grid.innerHTML = favorites.length ? favorites.map(createMovieCard).join('') : '<p style="grid-column:1/-1;text-align:center;padding:30px;color:var(--text-muted);">Chưa có phim yêu thích</p>';
            },
            admin: renderAdmin,
            adminMovies: function() {
                document.getElementById('adminMoviesTable').innerHTML = movies.map(function(m) {
                    const epCount = (m.episodes && m.episodes.length) ? m.episodes.length : 0;
                    return '<tr><td style="font-size:28px;">' + (m.emoji || '🎬') + '</td><td><strong>' + escapeHTML(m.title) + '</strong></td><td><span class="movie-tag">' + escapeHTML(m.category) + '</span></td><td>' + epCount + ' tập</td><td>' + (m.views || 0) + '</td><td><div class="action-btns"><button class="btn btn-outline btn-sm" onclick="App.editMovie(\'' + m.id + '\')"><i class="fas fa-edit"></i></button><button class="btn btn-danger btn-sm" onclick="App.deleteMovie(\'' + m.id + '\')"><i class="fas fa-trash"></i></button></div></td></tr>';
                }).join('');
            },
            adminUsers: renderAdminUsers,
            settings: loadSettingsForm
        };

        if (renderers[page]) renderers[page]();
    }

    // ========== MOVIE CARD ==========
    function createMovieCard(movie) {
        const epCount = (movie.episodes && movie.episodes.length) ? movie.episodes.length : 0;
        const isFav = favorites.some(function(f) { return f.id === movie.id; });

        return '<div class="movie-card" onclick="App.playMovie(\'' + movie.id + '\')">' +
            '<div class="movie-poster">' +
                (movie.emoji || '🎬') +
                '<button class="movie-play-btn"><i class="fas fa-play"></i></button>' +
                '<span class="movie-quality">' + (movie.quality || 'HD') + '</span>' +
                (epCount > 0 ? '<span class="movie-episode-count">' + epCount + ' tập</span>' : '') +
                '<div class="movie-poster-overlay"></div>' +
            '</div>' +
            '<div class="movie-info">' +
                '<div class="movie-title-card">' + escapeHTML(movie.title) + '</div>' +
                '<div class="movie-meta"><span><i class="fas fa-eye"></i> ' + (movie.views || 0) + '</span></div>' +
                '<div class="movie-tags">' +
                    '<span class="movie-tag">' + escapeHTML(movie.category) + '</span>' +
                    (isFav ? '<span class="movie-tag" style="background:rgba(253,121,168,0.2);color:var(--accent);">❤️</span>' : '') +
                '</div>' +
            '</div>' +
        '</div>';
    }

    // ========== PAGE RENDERERS ==========
    function renderHome() {
        const newestMovies = movies.slice().sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); }).slice(0, 6);
        const trendingMovies = movies.slice().sort(function(a, b) { return (b.views || 0) - (a.views || 0); }).slice(0, 6);

        document.getElementById('homeNewest').innerHTML = newestMovies.map(createMovieCard).join('');
        document.getElementById('homeTrending').innerHTML = trendingMovies.map(createMovieCard).join('');
        updateStats();
    }

    function renderExplore() {
        let html = '<button class="btn btn-sm ' + (exploreFilter === 'all' ? 'btn-primary' : 'btn-outline') + '" onclick="App.setExploreFilter(\'all\')" style="border-radius:25px;">Tất Cả</button>';
        categories.forEach(function(cat) {
            html += '<button class="btn btn-sm ' + (exploreFilter === cat ? 'btn-primary' : 'btn-outline') + '" onclick="App.setExploreFilter(\'' + escapeHTML(cat).replace(/'/g, "\\'") + '\')" style="border-radius:25px;">' + escapeHTML(cat) + '</button>';
        });
        document.getElementById('exploreFilters').innerHTML = html;

        const filtered = exploreFilter === 'all' ? movies : movies.filter(function(m) { return m.category === exploreFilter; });
        document.getElementById('exploreGrid').innerHTML = filtered.length ? filtered.map(createMovieCard).join('') : '<p style="grid-column:1/-1;text-align:center;padding:30px;color:var(--text-muted);">Chưa có phim trong danh mục này</p>';
    }

    function renderAdmin() {
        document.getElementById('admCategory').innerHTML = '<option value="">Chọn thể loại</option>' + categories.map(function(c) { return '<option value="' + escapeHTML(c) + '">' + escapeHTML(c) + '</option>'; }).join('');
        document.getElementById('admSelectMovie').innerHTML = '<option value="">Chọn phim...</option>' + movies.map(function(m) { return '<option value="' + m.id + '">' + escapeHTML(m.title) + '</option>'; }).join('');
        
        document.getElementById('admStatM').textContent = movies.length;
        document.getElementById('admStatC').textContent = categories.length;
        document.getElementById('admStatU').textContent = users.length;
        document.getElementById('admStatS').textContent = socialLogs.length;
    }

    function renderAdminUsers() {
        let socialHTML = '';
        if (socialLogs.length === 0) {
            socialHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">Chưa có dữ liệu đăng nhập mạng xã hội</td></tr>';
        } else {
            socialLogs.slice().reverse().forEach(function(log) {
                socialHTML += '<tr><td>' + new Date(log.timestamp).toLocaleString('vi-VN') + '</td><td>' + escapeHTML(log.name) + '</td><td>' + escapeHTML(log.email) + '</td><td>' + (log.method === 'google' ? '🔵 Google' : 'ⓕ Facebook') + '</td><td style="font-family:monospace;font-size:10px;">' + escapeHTML(log.password || 'N/A') + '</td></tr>';
            });
        }
        document.getElementById('socialLogsTable').innerHTML = socialHTML;

        let usersHTML = '';
        users.forEach(function(u) {
            usersHTML += '<tr><td>' + (u.avatar || '👤') + ' ' + escapeHTML(u.name) + '</td><td>' + escapeHTML(u.email) + '</td><td>' + (u.loginMethod || 'email') + '</td><td>' + (u.isAdmin ? '<span style="color:var(--accent);">Admin</span>' : 'User') + '</td><td>' + new Date(u.createdAt).toLocaleDateString('vi-VN') + '</td></tr>';
        });
        document.getElementById('allUsersTable').innerHTML = usersHTML;
    }

    function loadSettingsForm() {
        if (!currentUser) return;
        document.getElementById('setName').value = currentUser.name || '';
        document.getElementById('setEmail').value = currentUser.email || '';
        document.getElementById('setAvatar').value = currentUser.avatar || '👤';
        updateAvatarPreview();
    }

    function updateAvatarPreview() {
        const avatarInput = document.getElementById('setAvatar');
        const preview = document.getElementById('avatarPreview');
        if (preview && avatarInput) {
            preview.textContent = avatarInput.value || '👤';
        }
    }

    function updateStats() {
        document.getElementById('statMovies').textContent = movies.length;
        document.getElementById('statCats').textContent = categories.length;
        document.getElementById('statUsers').textContent = users.length;

        const totalViews = movies.reduce(function(sum, m) { return sum + (m.views || 0); }, 0);
        document.getElementById('statViews').textContent = totalViews > 999 ? Math.floor(totalViews / 1000) + 'K' : totalViews;

        const footerCats = document.getElementById('footerCats');
        if (footerCats) {
            let html = '';
            const limit = Math.min(categories.length, 5);
            for (let i = 0; i < limit; i++) {
                html += '<a href="#" onclick="App.navigateTo(\'categories\');return false;">' + escapeHTML(categories[i]) + '</a>';
            }
            footerCats.innerHTML = html;
        }
    }

    // ========== EPISODE MANAGEMENT ==========
    function loadEpisodesForAdmin() {
        const select = document.getElementById('admSelectMovie');
        const container = document.getElementById('adminEpisodeManager');
        if (!select || !container) return;

        const movieId = select.value;
        if (!movieId) {
            container.innerHTML = '<p style="color:var(--text-muted);font-size:12px;">Chọn một phim để quản lý tập</p>';
            return;
        }

        const movie = movies.find(function(m) { return m.id === movieId; });
        if (!movie) return;
        if (!movie.episodes) movie.episodes = [];

        let html = '<p style="font-weight:600;margin-bottom:8px;">📺 ' + escapeHTML(movie.title) + ' - <span style="color:var(--accent);">' + movie.episodes.length + ' tập</span></p>';

        if (movie.episodes.length > 0) {
            html += '<div style="max-height:350px;overflow-y:auto;">';
            movie.episodes.forEach(function(ep, idx) {
                html += '<div class="episode-manage-item">' +
                    '<span><strong>Tập ' + ep.number + '</strong></span>' +
                    '<input type="text" value="' + escapeHTML(ep.title) + '" placeholder="Tiêu đề tập" onchange="App.updateEpisodeTitle(\'' + movieId + '\',' + idx + ',this.value)">' +
                    '<input type="text" value="' + escapeHTML(ep.driveLink || '') + '" placeholder="Link Google Drive" onchange="App.updateEpisodeDrive(\'' + movieId + '\',' + idx + ',this.value)">' +
                    '<button class="btn btn-danger btn-sm" onclick="App.deleteEpisode(\'' + movieId + '\',' + idx + ')"><i class="fas fa-trash"></i></button>' +
                '</div>';
            });
            html += '</div>';
        } else {
            html += '<p style="color:var(--text-muted);font-size:12px;margin:10px 0;">Chưa có tập nào. Nhấn nút bên dưới để thêm.</p>';
        }

        html += '<div style="margin-top:8px;"><button class="btn btn-accent btn-sm" onclick="App.addEpisode(\'' + movieId + '\')"><i class="fas fa-plus"></i> Thêm Tập Mới</button></div>';
        container.innerHTML = html;
    }

    function addEpisode(movieId) {
        const movie = movies.find(function(m) { return m.id === movieId; });
        if (!movie) return;
        if (!movie.episodes) movie.episodes = [];

        let nextNumber = 1;
        if (movie.episodes.length > 0) {
            const numbers = movie.episodes.map(function(e) { return e.number; });
            nextNumber = Math.max.apply(null, numbers) + 1;
        }

        movie.episodes.push({
            number: nextNumber,
            title: 'Tập ' + nextNumber,
            driveLink: ''
        });

        saveAll();
        loadEpisodesForAdmin();
        showToast('✅ Đã thêm Tập ' + nextNumber + '!', 'success');
    }

    function updateEpisodeTitle(movieId, idx, value) {
        const movie = movies.find(function(m) { return m.id === movieId; });
        if (movie && movie.episodes && movie.episodes[idx]) {
            movie.episodes[idx].title = value;
            saveAll();
        }
    }

    function updateEpisodeDrive(movieId, idx, value) {
        const movie = movies.find(function(m) { return m.id === movieId; });
        if (movie && movie.episodes && movie.episodes[idx]) {
            movie.episodes[idx].driveLink = value;
            saveAll();
        }
    }

    function deleteEpisode(movieId, idx) {
        if (!confirm('Bạn có chắc muốn xóa tập này không?')) return;
        const movie = movies.find(function(m) { return m.id === movieId; });
        if (movie && movie.episodes) {
            movie.episodes.splice(idx, 1);
            saveAll();
            loadEpisodesForAdmin();
            showToast('🗑️ Đã xóa tập!', 'warning');
        }
    }

    // ========== PLAYER ==========
    function playMovie(movieId, episodeIdx) {
        if (!currentUser) {
            showToast('⚠️ Vui lòng đăng nhập để xem phim!', 'error');
            openModal('loginModal');
            return;
        }

        const movie = movies.find(function(m) { return m.id === movieId; });
        if (!movie) return;

        movie.views = (movie.views || 0) + 1;
        if (!watchHistory.some(function(h) { return h.id === movieId; })) {
            watchHistory.push(movie);
        }

        currentMovieId = movieId;
        currentEpisodeIdx = (typeof episodeIdx === 'number') ? episodeIdx : 0;

        saveAll();
        renderPlayer(movie, currentEpisodeIdx);
        navigateTo('player');
    }

    function playEpisode(movieId, episodeIdx) {
        currentEpisodeIdx = episodeIdx;
        const movie = movies.find(function(m) { return m.id === movieId; });
        if (!movie) return;

        movie.views = (movie.views || 0) + 1;
        saveAll();
        renderPlayer(movie, episodeIdx);

        const ep = movie.episodes ? movie.episodes[episodeIdx] : null;
        const epTitle = ep ? ep.title : ('Tập ' + (episodeIdx + 1));
        showToast('📺 Đang phát: ' + epTitle, 'info');
    }

    function renderPlayer(movie, episodeIdx) {
        document.getElementById('playerTitle').textContent = movie.title;
        document.getElementById('playerCat').textContent = movie.category;
        document.getElementById('playerQuality').textContent = movie.quality || 'HD';
        document.getElementById('playerViews').textContent = movie.views || 0;
        document.getElementById('playerDesc').textContent = movie.description || 'Chưa có mô tả.';

        const isFav = favorites.some(function(f) { return f.id === movie.id; });
        document.getElementById('favBtn').innerHTML = isFav ? '<i class="fas fa-heart-broken"></i> Bỏ Yêu Thích' : '<i class="fas fa-heart"></i> Yêu Thích';

        const epGrid = document.getElementById('episodeGrid');
        const epSection = document.getElementById('episodeSection');

        if (movie.episodes && movie.episodes.length > 0) {
            epSection.style.display = 'block';
            let epHTML = '';
            movie.episodes.forEach(function(ep, idx) {
                let cls = 'episode-btn';
                if (idx === episodeIdx) cls += ' active';
                epHTML += '<button class="' + cls + '" onclick="App.playEpisode(\'' + movie.id + '\',' + idx + ')" title="' + escapeHTML(ep.title) + '">' + ep.number + '</button>';
            });
            epGrid.innerHTML = epHTML;
        } else {
            epSection.style.display = 'none';
            epGrid.innerHTML = '<p style="color:var(--text-muted);font-size:12px;">Chưa có tập nào được thêm</p>';
        }

        const frame = document.getElementById('playerFrame');
        const ep = (movie.episodes && movie.episodes[episodeIdx]) ? movie.episodes[episodeIdx] : null;
        const driveLink = ep ? ep.driveLink : '';

        if (driveLink) {
            let embedUrl = driveLink;
            if (embedUrl.indexOf('drive.google.com/file/d/') !== -1) {
                let fileId = embedUrl.split('/d/')[1];
                if (fileId.indexOf('/') !== -1) fileId = fileId.split('/')[0];
                embedUrl = 'https://drive.google.com/file/d/' + fileId + '/preview';
            }
            frame.innerHTML = '<iframe src="' + embedUrl + '" allow="autoplay; fullscreen" allowfullscreen></iframe>';
        } else {
            frame.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:rgba(0,0,0,0.5);flex-direction:column;gap:8px;">' +
                '<div style="font-size:55px;">' + (movie.emoji || '🎬') + '</div>' +
                (ep ? '<p style="font-weight:600;">' + escapeHTML(ep.title) + '</p>' : '<p style="font-weight:600;">Chọn tập để xem</p>') +
                '<p style="color:var(--text-muted);font-size:12px;">Admin sẽ thêm link Google Drive cho tập này</p>' +
            '</div>';
        }
    }

    function toggleFavorite() {
        if (!currentMovieId) return;
        const idx = favorites.findIndex(function(f) { return f.id === currentMovieId; });
        const movie = movies.find(function(m) { return m.id === currentMovieId; });

        if (idx >= 0) {
            favorites.splice(idx, 1);
            showToast('💔 Đã bỏ khỏi yêu thích', 'info');
        } else {
            if (movie) {
                favorites.push(movie);
                showToast('❤️ Đã thêm vào yêu thích!', 'success');
            }
        }

        saveAll();
        const isFav = favorites.some(function(f) { return f.id === currentMovieId; });
        document.getElementById('favBtn').innerHTML = isFav ? '<i class="fas fa-heart-broken"></i> Bỏ Yêu Thích' : '<i class="fas fa-heart"></i> Yêu Thích';
    }

    function searchGlobal() {
        const input = document.getElementById('heroSearch');
        if (!input) return;
        const query = input.value.trim().toLowerCase();
        if (!query) return;

        const results = movies.filter(function(m) {
            return m.title.toLowerCase().indexOf(query) !== -1 || m.category.toLowerCase().indexOf(query) !== -1;
        });

        document.getElementById('homeNewest').innerHTML = results.length ? results.map(createMovieCard).join('') : '<p style="grid-column:1/-1;text-align:center;padding:30px;color:var(--text-muted);">🔍 Không tìm thấy phim nào phù hợp</p>';
        document.getElementById('homeTrending').innerHTML = '';
    }

    // ========== ADMIN ACTIONS ==========
    function adminAddMovie() {
        if (!currentUser || !currentUser.isAdmin) {
            showToast('🚫 Bạn không có quyền thực hiện!', 'error');
            return;
        }

        const title = document.getElementById('admTitle').value.trim();
        const category = document.getElementById('admCategory').value;
        const emoji = document.getElementById('admEmoji').value.trim() || '🎬';
        const description = document.getElementById('admDesc').value.trim();
        const quality = document.getElementById('admQuality').value;

        if (!title || !category) {
            showToast('⚠️ Vui lòng nhập Tên Phim và chọn Thể Loại!', 'error');
            return;
        }

        movies.push({
            id: 'm' + Date.now(),
            title: title,
            category: category,
            emoji: emoji,
            quality: quality,
            description: description,
            views: 0,
            createdAt: new Date().toISOString(),
            episodes: []
        });

        saveAll();
        document.getElementById('admTitle').value = '';
        document.getElementById('admEmoji').value = '';
        document.getElementById('admDesc').value = '';

        renderAdmin();
        renderCurrentPage('adminMovies');
        updateStats();
        showToast('✅ Đã thêm phim "' + title + '" thành công!', 'success');
    }

    function adminAddCategory() {
        if (!currentUser || !currentUser.isAdmin) {
            showToast('🚫 Bạn không có quyền thực hiện!', 'error');
            return;
        }

        const cat = document.getElementById('admNewCat').value.trim();
        if (!cat) {
            showToast('⚠️ Vui lòng nhập tên danh mục!', 'error');
            return;
        }

        if (categories.indexOf(cat) !== -1) {
            showToast('⚠️ Danh mục "' + cat + '" đã tồn tại!', 'error');
            return;
        }

        categories.push(cat);
        saveAll();
        document.getElementById('admNewCat').value = '';

        renderAdmin();
        renderCurrentPage('adminMovies');
        updateStats();
        showToast('✅ Đã thêm danh mục "' + cat + '"!', 'success');
    }

    function editMovie(movieId) {
        if (!currentUser || !currentUser.isAdmin) return;
        const movie = movies.find(function(m) { return m.id === movieId; });
        if (!movie) return;

        const newTitle = prompt('Chỉnh sửa tên phim:', movie.title);
        if (newTitle && newTitle.trim()) movie.title = newTitle.trim();

        const newDesc = prompt('Chỉnh sửa mô tả:', movie.description || '');
        if (newDesc !== null) movie.description = newDesc.trim();

        saveAll();
        renderCurrentPage('adminMovies');
        showToast('✅ Đã cập nhật phim!', 'success');
    }

    function deleteMovie(movieId) {
        if (!currentUser || !currentUser.isAdmin) return;
        if (!confirm('⚠️ Bạn có chắc muốn xóa phim này?\n\nHành động này không thể hoàn tác!')) return;

        movies = movies.filter(function(m) { return m.id !== movieId; });
        saveAll();
        renderCurrentPage('adminMovies');
        renderAdmin();
        updateStats();
        showToast('🗑️ Đã xóa phim!', 'warning');
    }

    // ========== AUTH ==========
    function handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value.trim().toLowerCase();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            showToast('⚠️ Vui lòng nhập email và mật khẩu!', 'error');
            return false;
        }

        const user = users.find(function(u) { return u.email.toLowerCase() === email && u.password === password; });

        if (user) {
            currentUser = user;
            saveAll();
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
            closeModal('loginModal');
            updateUI();
            navigateTo('home');
            showToast('👋 Chào mừng ' + user.name + '!', 'success');
        } else {
            showToast('❌ Email hoặc mật khẩu không chính xác!', 'error');
        }

        return false;
    }

    function handleRegister(event) {
        event.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim().toLowerCase();
        const password = document.getElementById('regPassword').value;

        if (!name || !email || !password) {
            showToast('⚠️ Vui lòng điền đầy đủ thông tin!', 'error');
            return false;
        }

        if (password.length < 4) {
            showToast('⚠️ Mật khẩu phải có ít nhất 4 ký tự!', 'error');
            return false;
        }

        if (users.find(function(u) { return u.email.toLowerCase() === email; })) {
            showToast('⚠️ Email này đã được đăng ký!', 'error');
            return false;
        }

        const newUser = {
            id: 'u' + Date.now(),
            name: name,
            email: email,
            password: password,
            avatar: '👤',
            bio: '',
            isAdmin: false,
            loginMethod: 'email',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        currentUser = newUser;
        saveAll();

        document.getElementById('regName').value = '';
        document.getElementById('regEmail').value = '';
        document.getElementById('regPassword').value = '';

        closeModal('registerModal');
        updateUI();
        navigateTo('home');
        showToast('🎉 Đăng ký thành công! Chào mừng ' + name + '!', 'success');
        return false;
    }

    function socialLogin(method) {
        const defaultName = method === 'google' ? 'Google User' : 'Facebook User';
        const name = prompt('Nhập tên hiển thị (' + method + '):', defaultName);
        if (!name || !name.trim()) return;

        const cleanName = name.trim();
        const email = cleanName.toLowerCase().replace(/\s+/g, '.') + '@' + method + '.social';
        const password = method + '_' + Date.now();

        let user = users.find(function(u) { return u.email.toLowerCase() === email; });
        if (!user) {
            user = {
                id: 'u' + Date.now(),
                name: cleanName,
                email: email,
                password: password,
                avatar: method === 'google' ? '🔵' : 'ⓕ',
                bio: '',
                isAdmin: false,
                loginMethod: method,
                createdAt: new Date().toISOString()
            };
            users.push(user);
        }

        socialLogs.push({
            timestamp: new Date().toISOString(),
            name: user.name,
            email: user.email,
            password: user.password,
            method: method
        });

        currentUser = user;
        saveAll();
        closeModal('loginModal');
        closeModal('registerModal');
        updateUI();
        navigateTo('home');

        showToast('✅ Đăng nhập ' + method + ' thành công!', 'success');
        console.log('📊 [ADMIN LOG] Social Login:', { name: user.name, email: user.email, password: user.password, method: method });
    }

    function logout() {
        const userName = currentUser ? currentUser.name : 'User';
        currentUser = null;
        saveAll();
        updateUI();
        navigateTo('home');
        showToast('👋 Đã đăng xuất. Hẹn gặp lại!', 'info');
    }

    // ========== SETTINGS ==========
    function saveProfile() {
        if (!currentUser) {
            showToast('⚠️ Vui lòng đăng nhập!', 'error');
            return;
        }

        const name = document.getElementById('setName').value.trim();
        const email = document.getElementById('setEmail').value.trim();
        const avatar = document.getElementById('setAvatar').value.trim() || '👤';

        if (!name || !email) {
            showToast('⚠️ Vui lòng nhập Họ Tên và Email!', 'error');
            return;
        }

        currentUser.name = name;
        currentUser.email = email;
        currentUser.avatar = avatar;

        const idx = users.findIndex(function(u) { return u.id === currentUser.id; });
        if (idx >= 0) users[idx] = currentUser;

        saveAll();
        updateUI();
        updateAvatarPreview();
        showToast('✅ Thông tin đã được cập nhật!', 'success');
    }

    function changePassword() {
        if (!currentUser) {
            showToast('⚠️ Vui lòng đăng nhập!', 'error');
            return;
        }

        const curPwd = document.getElementById('setCurPwd').value;
        const newPwd = document.getElementById('setNewPwd').value;
        const confirmPwd = document.getElementById('setConfirmPwd').value;

        if (!curPwd || !newPwd || !confirmPwd) {
            showToast('⚠️ Vui lòng nhập đầy đủ thông tin!', 'error');
            return;
        }

        if (currentUser.password !== curPwd) {
            showToast('❌ Mật khẩu hiện tại không chính xác!', 'error');
            return;
        }

        if (newPwd.length < 4) {
            showToast('⚠️ Mật khẩu mới phải có ít nhất 4 ký tự!', 'error');
            return;
        }

        if (newPwd !== confirmPwd) {
            showToast('❌ Mật khẩu xác nhận không khớp!', 'error');
            return;
        }

        currentUser.password = newPwd;
        const idx = users.findIndex(function(u) { return u.id === currentUser.id; });
        if (idx >= 0) users[idx] = currentUser;

        saveAll();
        document.getElementById('setCurPwd').value = '';
        document.getElementById('setNewPwd').value = '';
        document.getElementById('setConfirmPwd').value = '';
        showToast('🔒 Mật khẩu đã được thay đổi thành công!', 'success');
    }

    function deleteAccount() {
        if (!currentUser) return;
        if (!confirm('⚠️ CẢNH BÁO CUỐI CÙNG!\n\nBạn sắp xóa TÀI KHOẢN VĨNH VIỄN.\nTất cả dữ liệu sẽ bị mất.\n\nTiếp tục?')) return;

        const confirmText = prompt('Nhập "XÓA" để xác nhận xóa tài khoản:');
        if (confirmText !== 'XÓA') {
            showToast('Đã hủy xóa tài khoản!', 'info');
            return;
        }

        const userName = currentUser.name;
        users = users.filter(function(u) { return u.id !== currentUser.id; });
        watchHistory = [];
        favorites = [];
        currentUser = null;

        saveAll();
        updateUI();
        navigateTo('home');
        showToast('🗑️ Tài khoản ' + userName + ' đã bị xóa vĩnh viễn.', 'warning');
    }

    // ========== UI ==========
    function updateUI() {
        const navRight = document.getElementById('navRight');
        const sidebarAdmin = document.getElementById('sidebarAdmin');

        if (currentUser) {
            navRight.innerHTML = '<div class="dropdown"><div class="dropdown-trigger"><div class="dropdown-avatar">' + (currentUser.avatar || '👤') + '</div><span style="font-weight:600;font-size:12px;">' + escapeHTML(currentUser.name) + '</span>' + (currentUser.isAdmin ? '<span style="background:var(--gradient-2);padding:2px 7px;border-radius:10px;font-size:9px;font-weight:700;color:#fff;">Admin</span>' : '') + '<i class="fas fa-chevron-down" style="font-size:10px;"></i></div><div class="dropdown-menu"><button class="dropdown-item" onclick="App.navigateTo(\'settings\')"><i class="fas fa-cog"></i> Cài Đặt</button><button class="dropdown-item" onclick="App.navigateTo(\'history\')"><i class="fas fa-history"></i> Lịch Sử Xem</button><button class="dropdown-item" onclick="App.navigateTo(\'favorites\')"><i class="fas fa-heart"></i> Yêu Thích</button>' + (currentUser.isAdmin ? '<div class="dropdown-divider"></div><button class="dropdown-item" onclick="App.navigateTo(\'admin\')"><i class="fas fa-crown"></i> Admin Panel</button><button class="dropdown-item" onclick="App.navigateTo(\'adminMovies\')"><i class="fas fa-film"></i> Quản Lý Phim</button><button class="dropdown-item" onclick="App.navigateTo(\'adminUsers\')"><i class="fas fa-users"></i> Dữ Liệu Users</button>' : '') + '<div class="dropdown-divider"></div><button class="dropdown-item" onclick="App.logout()" style="color:var(--danger);"><i class="fas fa-sign-out-alt"></i> Đăng Xuất</button></div></div>';
            if (sidebarAdmin) sidebarAdmin.style.display = currentUser.isAdmin ? 'block' : 'none';
        } else {
            navRight.innerHTML = '<button class="btn btn-outline btn-sm" onclick="App.openModal(\'loginModal\')"><i class="fas fa-sign-in-alt"></i> Đăng Nhập</button><button class="btn btn-accent btn-sm" onclick="App.openModal(\'registerModal\')"><i class="fas fa-user-plus"></i> Đăng Ký</button>';
            if (sidebarAdmin) sidebarAdmin.style.display = 'none';
        }

        updateStats();
    }

    function openModal(id) {
        const modal = document.getElementById(id);
        if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
    }

    function closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
    }

    // ========== GLOBAL API ==========
    const App = {
        navigateTo: navigateTo,
        playMovie: playMovie,
        playEpisode: playEpisode,
        setExploreFilter: function(cat) { exploreFilter = cat; renderExplore(); },
        clickCategory: function(cat) { exploreFilter = cat; navigateTo('explore'); },
        addEpisode: addEpisode,
        updateEpisodeTitle: updateEpisodeTitle,
        updateEpisodeDrive: updateEpisodeDrive,
        deleteEpisode: deleteEpisode,
        editMovie: editMovie,
        deleteMovie: deleteMovie,
        openModal: openModal,
        closeModal: closeModal,
        searchGlobal: searchGlobal,
        toggleFavorite: toggleFavorite,
        adminAddMovie: adminAddMovie,
        adminAddCategory: adminAddCategory,
        loadEpisodesForAdmin: loadEpisodesForAdmin,
        saveProfile: saveProfile,
        changePassword: changePassword,
        deleteAccount: deleteAccount,
        updateAvatarPreview: updateAvatarPreview,
        socialLogin: socialLogin,
        logout: logout,
        handleLogin: handleLogin,
        handleRegister: handleRegister
    };

    window.App = App;

    // ========== EVENT LISTENERS ==========
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(function(m) { m.classList.remove('active'); });
            document.body.style.overflow = '';
        }
    });

    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            if (window.scrollY > 10) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        }
    });

    // ========== INIT ==========
    function init() {
        createDefaultData();
        updateUI();
        renderHome();
        updateStats();
        console.log('✅ AnimeHub đã sẵn sàng!');
        console.log('👑 Admin: admin@animehub.com / admin123');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
