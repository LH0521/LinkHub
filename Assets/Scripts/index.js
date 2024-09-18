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

loginButton.addEventListener('click', async () => {
    if (auth.currentUser) {
        await auth.signOut();
        updateUserUI(null);
    } else {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).then(result => {
            const user = result.user;
            updateUserUI(user);
        }).catch(console.error);
    }
});

const updateUserUI = (user) => {
    if (user) {
        loginButton.innerHTML = '<span><i class="bi bi-person"></i> Logout</span>';
        profilePic.src = user.photoURL;
        profileName.textContent = user.displayName;
    } else {
        loginButton.innerHTML = '<span><i class="bi bi-person"></i> Login</span>';
        profilePic.src = "Assets/Images/logo_1.png";
        profileName.textContent = "Anonymous";
    }
};

auth.onAuthStateChanged((user) => {
    updateUserUI(user);
});

const filters = {
    source: [],
    kinks: []
};

document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
        const filterCategory = e.target.id.includes('twitter') || e.target.id.includes('reddit') ? 'source' : 'kinks';

        if (e.target.checked) {
            if (!filters[filterCategory].includes(e.target.value)) {
                filters[filterCategory].push(e.target.value);
            }
        } else {
            filters[filterCategory] = filters[filterCategory].filter(value => value !== e.target.value);
        }
        updateResults();
    });
});

const clearFiltersButton = document.getElementById('clearFiltersButton');
clearFiltersButton.addEventListener('click', () => {
    filters.source = [];
    filters.kinks = [];

    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);

    updateResults();
});

const searchBar = document.getElementById('searchBar');
searchBar.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    searchProfiles(query);
});

function searchProfiles(query) {
    const filteredData = data.filter(profile => {
        return profile.name.toLowerCase().includes(query) || profile.info.kinks.some(kink => kink.toLowerCase().includes(query));
    });

    displayResults(filteredData);
}

function updateResults() {
    let filteredData = data;

    if (filters.source.length > 0) {
        filteredData = filteredData.filter(profile => filters.source.includes(profile.info.source.toLowerCase()));
    }

    if (filters.kinks.length > 0) {
        filteredData = filteredData.filter(profile => filters.kinks.some(kink => profile.info.kinks.includes(kink)));
    }

    displayResults(filteredData);
}

function displayResults(profiles) {
    const resultsContainer = document.querySelector('.row.g-3.g-xl-5.mt-1');
    resultsContainer.innerHTML = '';

    profiles.forEach(profile => {
        const profileIcon = profile.info.source === "Twitter" ? `https://pbs.twimg.com/profile_images/${profile.icon}` : `https://preview.redd.it/${profile.icon}`;
        const profileLink = profile.info.source === "Twitter" ? `https://x.com/${profile.link}` : `https://www.reddit.com/user/${profile.link}`;

        resultsContainer.innerHTML += `
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
                                <a href="${profileLink}" target="_blank" class="btn btn-sm btn-neutral rounded-pill">
                                    <i class="bi bi-folder2-open me-1"></i> View
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    });
}

displayResults(data);