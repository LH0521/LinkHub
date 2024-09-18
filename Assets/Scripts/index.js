// Firebase configuration
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
const loginButton = document.getElementById('authButton');
const profilePic = document.getElementById('profilePic');
const profileName = document.getElementById('profileName');
const searchBar = document.getElementById('searchBar');
const clearFiltersButton = document.getElementById('clearFiltersButton');
const filters = { source: [], kinks: [] };

loginButton.addEventListener('click', async () => {
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

const updateUserUI = (user) => {
    if (user) {
        loginButton.innerHTML = '<span><i class="bi bi-person"></i> Logout</span>';
        profilePic.src = user.photoURL || "Assets/Images/logo_1.png";
        profileName.textContent = user.displayName || "Anonymous";
    } else {
        resetUserUI();
    }
};

const resetUserUI = () => {
    loginButton.innerHTML = '<span><i class="bi bi-person"></i> Login</span>';
    profilePic.src = "Assets/Images/logo_1.png";
    profileName.textContent = "Anonymous";
};

auth.onAuthStateChanged(updateUserUI);

const populateLinkDetails = (profile) => {
    const { name, link, icon, info: { sexuality, body, race, kinks, preview, source } } = profile;
    const profileIcon = source === "Twitter" ? `https://pbs.twimg.com/profile_images/${icon}` : `https://preview.redd.it/${icon}`;
    const profileUrl = source === "Twitter" ? `https://x.com/${link}` : `https://www.reddit.com/user/${link}`;

    updateElementContent('profileDetailPic', 'src', profileIcon);
    updateElementContent('profileDetailName', 'textContent', name);
    updateElementContent('profileDetailLink', 'textContent', `@${link}`);
    updateElementContent('profileDetailOpen', 'href', profileUrl);
    updateElementContent('profileDetailSexuality', 'textContent', sexuality);
    updateElementContent('profileDetailBody', 'textContent', body);
    updateElementContent('profileDetailRace', 'textContent', race);
    updateElementContent('profileDetailKinks', 'textContent', kinks.join(", "));

    const previewContainer = document.getElementById('profileDetailPreview');
    previewContainer.innerHTML = '';
    preview.forEach(imgUrl => previewContainer.appendChild(createImageElement(imgUrl)));
    showOffCanvas('link_canvas');
};

const updateElementContent = (id, property, value) => {
    document.getElementById(id)[property] = value;
};

const createImageElement = (src) => {
    const imgElement = document.createElement('img');
    imgElement.src = src;
    imgElement.classList.add('rounded', 'w-auto', 'h-20');
    return imgElement;
};

const showOffCanvas = (id) => {
    const offcanvasElement = new bootstrap.Offcanvas(document.getElementById(id));
    offcanvasElement.show();
};

clearFiltersButton.addEventListener('click', () => {
    filters.source = [];
    filters.kinks = [];
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
    updateResults();
});

searchBar.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    searchProfiles(query);
});

const searchProfiles = (query) => {
    const filteredData = data.filter(profile =>
        profile.name.toLowerCase().includes(query) || profile.info.kinks.some(kink => kink.toLowerCase().includes(query))
    );
    displayResults(filteredData);
};

const updateResults = () => {
    let filteredData = data;

    if (filters.source.length > 0) {
        filteredData = filteredData.filter(profile => filters.source.includes(profile.info.source.toLowerCase()));
    }

    if (filters.kinks.length > 0) {
        filteredData = filteredData.filter(profile => {
            const profileKinks = profile.info.kinks;
            const isMatching = filters.kinks.every(selectedKink => profileKinks.includes(selectedKink));
            console.log(`Profile: ${profile.name}, Profile Kinks: ${profileKinks}, Matches: ${isMatching}`);
            return isMatching;
        });
    }

    console.log(`Filtered Data: ${filteredData.length} profiles found.`);
    displayResults(filteredData);
};

const displayResults = (profiles) => {
    const resultsContainer = document.querySelector('.row.g-3.g-xl-5.mt-1');
    resultsContainer.innerHTML = profiles.map(profile => createProfileCard(profile)).join('');

    resultsContainer.addEventListener('click', (e) => {
        if (e.target.closest('.view-button')) {
            const profileName = e.target.closest('.view-button').dataset.profileName;
            const selectedProfile = profiles.find(profile => profile.name === profileName);
            if (selectedProfile) populateLinkDetails(selectedProfile);
        }
    });
};

const createProfileCard = (profile) => {
    const profileIcon = profile.info.source === "Twitter" ? `https://pbs.twimg.com/profile_images/${profile.icon}` : `https://preview.redd.it/${profile.icon}`;
    return `
        <div class="col-lg-4 col-sm-6">
            <div class="card shadow-4-hover">
                <div class="card-body pb-5">
                    <div class="d-flex align-items-center">
                        <div class="me-3">
                            <img alt="Profile Picture" class="avatar rounded-1" src="${profileIcon}">
                        </div>
                        <div class="flex-1">
                            <span class="d-block font-semibold text-sm text-heading">${profile.name}</span>
                            <div class="text-xs text-muted line-clamp-1">@${profile.link}</div>
                        </div>
                        <div class="text-end">
                            <button type="button" class="btn btn-sm btn-neutral rounded-pill view-button" data-profile-name="${profile.name}">
                                <i class="bi bi-folder2-open me-1"></i> View
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
};

document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
        const filterCategory = e.target.id.includes('twitter') || e.target.id.includes('reddit') ? 'source' : 'kinks';
        toggleFilter(e.target.value, filterCategory, e.target.checked);
        console.log(`Checkbox ${e.target.value} is ${e.target.checked ? 'checked' : 'unchecked'}`);
        console.log('Filters applied:', filters);
        updateResults();
    });
});

const toggleFilter = (value, category, isChecked) => {
    if (isChecked) {
        if (!filters[category].includes(value)) {
            filters[category].push(value);
        }
    } else {
        filters[category] = filters[category].filter(val => val !== value);
    }
};

displayResults(data);
