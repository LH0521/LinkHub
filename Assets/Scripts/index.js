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

let filters = { source: [], kinks: [] };

elements.loginButton.addEventListener('click', async () => {
    auth.currentUser ? await auth.signOut() : signIn();
});

auth.onAuthStateChanged(updateUserUI);

elements.clearFiltersButton.addEventListener('click', () => {
    filters = { source: [], kinks: [] };
    resetFilters();
    updateResults();
});

elements.searchBar.addEventListener('input', (e) => {
    searchProfiles(e.target.value.toLowerCase());
});

document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => toggleFilter(e.target.value, getFilterCategory(e.target), e.target.checked));
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

const updateUserUI = (user) => {
    elements.loginButton.innerHTML = user ? '<span><i class="bi bi-person"></i> Logout</span>' : '<span><i class="bi bi-person"></i> Login</span>';
    elements.profilePic.src = user?.photoURL || "Assets/Images/logo_1.png";
    elements.profileName.textContent = user?.displayName || "Anonymous";
};

const getFilterCategory = (element) => element.id.includes('twitter') || element.id.includes('reddit') ? 'source' : 'kinks';

const resetFilters = () => {
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
};

const searchProfiles = (query) => {
    const filteredData = data.filter(profile =>
        profile.name.toLowerCase().includes(query) || profile.info.kinks.some(kink => kink.toLowerCase().includes(query))
    );
    displayResults(filteredData);
};

const updateResults = () => {
    const filteredData = data.filter(profile =>
        (filters.source.length === 0 || filters.source.includes(profile.info.source.toLowerCase())) &&
        (filters.kinks.length === 0 || profile.info.kinks.some(kink => filters.kinks.includes(kink.toLowerCase())))
    );
    displayResults(filteredData);
};

const toggleFilter = (value, category, isChecked) => {
    filters[category] = isChecked ? [...filters[category], value] : filters[category].filter(val => val !== value);
    updateResults();
};

const displayResults = (profiles) => {
    elements.resultsContainer.innerHTML = profiles.map(createProfileCard).join('');
    elements.resultsContainer.addEventListener('click', handleProfileClick(profiles));
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

    elements.previewContainer.innerHTML = preview.map(imgUrl => createImageElement(getPreviewUrl(source, imgUrl))).join('');
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
