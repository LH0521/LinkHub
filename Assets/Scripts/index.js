const firebaseConfig = {
    apiKey: "AIzaSyCSFoTAOu__S29daond4WDDSaDgPFEuJDs",
    authDomain: "linkhub-cae84.firebaseapp.com",
    projectId: "linkhub-cae84",
    storageBucket: "linkhub-cae84.appspot.com",
    messagingSenderId: "564129773350",
    appId: "1:564129773350:web:700bec8d5b41518825f3e7"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const elements = {
    loginButton: document.getElementById('authButton'),
    profilePic: document.getElementById('profilePic'),
    profileName: document.getElementById('profileName'),
    searchBar: document.getElementById('searchBar'),
    clearFiltersButton: document.getElementById('clearFiltersButton'),
    resultsContainer: document.querySelector('.row.g-3.g-xl-5.mt-1'),
    previewContainer: document.getElementById('profileDetailPreview'),
};

const filterConfig = {
    source: ['twitter', 'reddit'],
    race: ['white', 'black', 'hispanic', 'asian'],
    body: ['twink', 'twunk', 'jock'],
    experience: ['professional', 'amateur'],
    sexuality: ['straight', 'gay', 'lesbian'],
    kinks: ['exhibition', 'feet', 'bondage', 'ageplay', 'latex', 'furry', 'pups', 'CBT', 'mxgear', 'trampling', 'femboy', 'character', 'watersports']
};

let filters = {
    source: [],
    race: [],
    body: [],
    experience: [],
    sexuality: [],
    kinks: []
};

elements.loginButton.addEventListener('click', async () => {
    auth.currentUser ? await auth.signOut() : signIn();
});

const signIn = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await auth.signInWithPopup(provider);
        updateUserUI(result.user);
    } catch (error) {
        console.error(error);
    }
};

function updateUserUI(user) {
    elements.loginButton.innerHTML = user ? '<span><i class="bi bi-person"></i> Logout</span>' : '<span><i class="bi bi-person"></i> Login</span>';
    elements.profilePic.src = user?.photoURL || "Assets/Images/logo_1.png";
    elements.profileName.textContent = user?.displayName || "Anonymous";
}

auth.onAuthStateChanged(updateUserUI);

elements.clearFiltersButton.addEventListener('click', () => {
    resetFilters();
    updateResults();
});

document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => handleFilterChange(e.target));
});

const handleFilterChange = (target) => {
    const { value, checked } = target;
    const category = getCategoryById(target.id);
    toggleFilter(category, value, checked);
    updateResults();
};

const getCategoryById = (id) => {
    for (const [category, ids] of Object.entries(filterConfig)) {
        if (ids.some(key => id.includes(key))) {
            return category;
        }
    }
    return null;
};

const toggleFilter = (category, value, isChecked) => {
    filters[category] = isChecked
        ? [...filters[category], value]
        : filters[category].filter(val => val !== value);
};

const resetFilters = () => {
    filters = {
        source: [],
        race: [],
        body: [],
        experience: [],
        sexuality: [],
        kinks: []
    };
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
};

elements.searchBar.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    searchProfiles(query);
});

const searchProfiles = (query) => {
    const filteredData = data.filter(profile => {
        return profile.name.toLowerCase().includes(query) ||
            profile.info.kinks.some(kink => kink.toLowerCase().includes(query)) &&
            Object.entries(filters).every(([category, values]) => {
                if (values.length === 0) return true;
                const profileValue = profile.info[category]?.toLowerCase();
                return category === 'kinks'
                    ? profile.info.kinks.some(k => values.includes(k.toLowerCase()))
                    : values.includes(profileValue);
            });
    });
    displayResults(filteredData);
};

const updateResults = () => {
    const filteredData = data.filter(profile => {
        return Object.entries(filters).every(([category, values]) => {
            if (values.length === 0) return true;
            const profileValue = profile.info[category];
            if (category === 'kinks') {
                return profileValue.some(kink => values.includes(kink.toLowerCase()));
            }
            return typeof profileValue === 'string' && values.includes(profileValue.toLowerCase());
        });
    });
    displayResults(filteredData);
};

const displayResults = (profiles) => {
    elements.resultsContainer.innerHTML = profiles.map(createProfileCard).join('');
    document.getElementById('resultCount').textContent = `Showing ${profiles.length} results`;
    const activeFilters = getActiveFilters();
    document.getElementById('filterInfo').textContent = `Filters applied: ${activeFilters.length} (${activeFilters.join(', ')})`;
    elements.resultsContainer.addEventListener('click', handleProfileClick(profiles));
};

const getActiveFilters = () => {
    const activeFilters = [];
    for (const [category, values] of Object.entries(filters)) {
        if (values.length > 0) {
            activeFilters.push(...values);
        }
    }
    return activeFilters;
};

const handleProfileClick = (profiles) => (e) => {
    const viewButton = e.target.closest('.view-button');
    if (!viewButton) return;
    const selectedProfile = profiles.find(profile => profile.name === viewButton.dataset.profileName);
    if (selectedProfile) populateLinkDetails(selectedProfile);
};

const createProfileCard = (profile) => {
    const { name, link, icon, info: { source } } = profile;
    const profileIcon = getProfileIcon(source, icon);
    const profileLink = formatProfileLink(source, link);

    return `
        <div class="col-lg-4 col-sm-6">
            <div class="card shadow-4-hover">
                <div class="card-body pb-5">
                    <div class="d-flex align-items-center">
                        <img alt="Profile Picture" class="avatar rounded-1 me-3" src="${profileIcon}">
                        <div class="flex-1">
                            <span class="d-block font-semibold text-sm text-heading">${name}</span>
                            <div class="text-xs text-muted">${profileLink}</div>
                        </div>
                        <button type="button" class="btn btn-sm btn-neutral rounded-pill view-button" data-profile-name="${name}">
                            <i class="bi bi-folder2-open me-1"></i> View
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

const populateLinkDetails = ({ name, link, icon, info }) => {
    const { sexuality, body, race, kinks, preview, source } = info;
    const profileIcon = getProfileIcon(source, icon);
    const profileUrl = getProfileUrl(source, link);
    const profileLinkDisplay = formatProfileLink(source, link);

    updateElementContent('profileDetailPic', 'src', profileIcon);
    updateElementContent('profileDetailName', 'textContent', name);
    updateElementContent('profileDetailLink', 'textContent', profileLinkDisplay);
    updateElementContent('profileDetailOpen', 'href', profileUrl);
    updateElementContent('profileDetailSexuality', 'textContent', sexuality);
    updateElementContent('profileDetailBody', 'textContent', body);
    updateElementContent('profileDetailRace', 'textContent', race);
    updateElementContent('profileDetailKinks', 'textContent', kinks.join(", "));

    elements.previewContainer.innerHTML = '';

    preview.forEach(imgUrl => {
        const fullImgUrl = getPreviewUrl(source, imgUrl);
        elements.previewContainer.appendChild(createImageElement(fullImgUrl));
    });

    showOffCanvas('link_canvas');
};

const getProfileIcon = (source, icon) => source === "Twitter" ? `https://pbs.twimg.com/profile_images/${icon}` : `https://preview.redd.it/${icon}`;
const getProfileUrl = (source, link) => source === "Twitter" ? `https://x.com/${link}` : `https://www.reddit.com/user/${link}`;
const formatProfileLink = (source, link) => source === "Twitter" ? `@${link}` : `u/${link}`;
const getPreviewUrl = (source, imgUrl) => source === "Twitter" ? `https://pbs.twimg.com/media/${imgUrl}` : `https://preview.redd.it/${imgUrl}`;

const updateElementContent = (id, property, value) => {
    document.getElementById(id)[property] = value;
};

const createImageElement = (src) => {
    const imgElement = document.createElement('img');
    imgElement.src = src;
    imgElement.classList.add('rounded', 'w-auto', 'h-24');
    imgElement.loading = "lazy";
    return imgElement;
};

const showOffCanvas = (id) => {
    const offcanvasElement = new bootstrap.Offcanvas(document.getElementById(id));
    offcanvasElement.show();
};

displayResults(data);