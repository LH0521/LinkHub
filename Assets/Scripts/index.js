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
const db = firebase.firestore();

const loginButton = document.querySelector('.btn-neutral.w-full');
const profileContainer = document.querySelector('.avatar img');
const profileName = document.querySelector('.ms-3 span.h6');

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
        profileContainer.src = user.photoURL;
        profileName.textContent = user.displayName;
    } else {
        loginButton.innerHTML = '<span><i class="bi bi-person"></i> Login</span>';
        profileContainer.src = "Assets/Images/logo_1.png";
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

const updateResults = () => {
    const resultContainer = document.querySelector('.row.g-3.g-xl-5.mt-1');
    resultContainer.innerHTML = '';

    const filteredData = data.filter(item => {
        const matchesSource = filters.source.length === 0 || filters.source.includes(item.info.source.toLowerCase());
        const matchesKinks = filters.kinks.length === 0 || filters.kinks.some(kink => item.info.kinks.includes(kink));
        return matchesSource && matchesKinks;
    });

    filteredData.forEach(item => {
        const profileIcon = item.info.source === "Twitter" ? `https://pbs.twimg.com/profile_images/${item.icon}` : `https://preview.redd.it/${item.icon}`;
        const profileLink = item.info.source === "Twitter" ? `https://x.com/${item.link}` : `https://www.reddit.com/user/${item.link}`;

        resultContainer.innerHTML += `
                <div class="col-lg-4 col-sm-6">
                    <div class="card shadow-4-hover">
                        <div class="card-body pb-5">
                            <div class="d-flex align-items-center">
                                <div class="me-3">
                                    <img alt="Profile Picture" class="avatar rounded-1" src="${profileIcon}">
                                </div>
                                <div class="flex-1">
                                    <span class="d-block font-semibold text-sm text-heading">${item.name}</span>
                                    <div class="text-xs text-muted line-clamp-1">@${item.link}</div>
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
};

document.querySelectorAll('.form-check-input').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
        const filterCategory = e.target.id.startsWith('filter-') ? e.target.value : '';
        if (e.target.checked) {
            filters[filterCategory].push(e.target.value);
        } else {
            filters[filterCategory] = filters[filterCategory].filter(f => f !== e.target.value);
        }
        updateResults();
    });
});

document.querySelector('.btn-clear-filters').addEventListener('click', () => {
    filters.source = [];
    filters.kinks = [];
    document.querySelectorAll('.form-check-input').forEach(checkbox => checkbox.checked = false);
    updateResults();
});

updateResults();





const fuse = new Fuse(data, {
    keys: ['name', 'info.kinks', 'info.source', 'info.sexuality', 'info.body']
});

const searchInput = document.querySelector('.form-control[placeholder="Search"]');
searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    const results = fuse.search(query);
    if (query) {
        const searchResults = results.map(result => result.item);
        updateResults(searchResults);
    } else {
        updateResults(data);
    }
});