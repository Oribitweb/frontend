// ===== Categories Module =====
(function() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    const showMoreBtn = document.getElementById('showMoreCategories');
    const INITIAL_VISIBLE = 10;

    // --------------------------------------------------------------
    // 🧩 فقط همین آرایه رو ویرایش کن تا دسته‌های جدید اضافه بشن
    // میتونی هرچقدر دوست داری اضافه کنی، بدون دست زدن به lives.js
    // --------------------------------------------------------------
    const STATIC_CATEGORIES = [
        { name: "Counter Strike 2", viewers: 492 },
        { name: "PUBG MOBILE", viewers: 532 },
        { name: "Open Front", viewers: 0 },
        { name: "Dota 2", viewers: 81 },
        { name: "Minecraft", viewers: 6000.9 },
        { name: "Call of Duty Mobile", viewers: 9.5 },
        { name: "Just Chatting", viewers: 58.5 },
        { name: "FiveM", viewers: 1000.5 },
        { name: "Music", viewers: 0.5 },
        { name: "Science", viewers: 0.5 }
    ];

    // 👇 این خط باعث می‌شه آرایه‌ی STATIC_CATEGORIES از بیرون قابل دسترس باشه
    window.ORBIT_CATEGORIES = STATIC_CATEGORIES;

    let allCategories = [];
    let expanded = false;

    /**
     * Convert category name to slug for image path
     * e.g. "Call of Duty Mobile" -> "callofdutymobile"
     */
    function categorySlug(name) {
        return name
            .toLowerCase()
            .replace(/\s+/g, '')          // remove all spaces
            .replace(/[^a-z0-9-]/g, ''); // keep only alphanumeric and hyphen
    }

    /**
     * Merge static categories with data from live streams.
     * Live streams data is provided via the `streams` array.
     */
    function mergeCategories(streams) {
        const map = {};

        // First, load static categories defined above
        STATIC_CATEGORIES.forEach(cat => {
            map[cat.name] = (map[cat.name] || 0) + cat.viewers;
        });

        // Then, add/merge categories from the live stream list
        streams.forEach(s => {
            const name = s.category;
            if (!map[name]) {
                map[name] = 0;
            }
            map[name] += s.viewers;
        });

        // Convert map back to sorted array
        return Object.entries(map)
            .map(([name, viewers]) => ({ name, viewers }))
            .sort((a, b) => b.viewers - a.viewers);
    }

    function render(categories) {
        const toShow = expanded ? categories : categories.slice(0, INITIAL_VISIBLE);
        categoriesGrid.innerHTML = toShow.map(cat => {
            const slug = categorySlug(cat.name);
            const imgUrl = `assets/categories/${slug}.webp`;
            return `
                <div class="category-card" style="background-image:url('${imgUrl}')" onclick="alert('Category: ${cat.name}')">
                    <div class="category-card-content">
                        <div class="category-card-title">${cat.name}</div>
                        <div class="category-card-viewers">${cat.viewers}K viewers</div>
                    </div>
                </div>
            `;
        }).join('');

        if (categories.length > INITIAL_VISIBLE) {
            showMoreBtn.style.display = 'block';
            showMoreBtn.textContent = expanded ? 'Show less' : 'Show more';
        } else {
            showMoreBtn.style.display = 'none';
        }
    }

    // This function is called by lives.js whenever the stream list changes
    window.updateCategories = function(streams) {
        allCategories = mergeCategories(streams || []);
        expanded = false;
        render(allCategories);
    };

    // Show more / less button
    showMoreBtn.addEventListener('click', () => {
        expanded = !expanded;
        render(allCategories);
    });

})();