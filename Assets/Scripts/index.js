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
    const profileContainer = document.querySelector('.avatar img');
    const profileName = document.querySelector('.ms-3 span.h6');

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

document.querySelectorAll('.form-check-input').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
        const filterCategory = e.target.id.includes('filter-twitter') || e.target.id.includes('filter-reddit') ? 'source' : 'kinks'; // Determine category

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

const populateLinkDetails = (profile) => {
    const linkCanvas = document.querySelector('#link_canvas');
    const linkCanvasLabel = document.querySelector('#link_canvas_label');
    const profileImage = linkCanvas.querySelector('img.avatar');
    const profileName = linkCanvas.querySelector('a.d-block.font-semibold');
    const profileLink = linkCanvas.querySelector('.text-xs.text-muted');
    const openButton = linkCanvas.querySelector('a.btn.btn-sm.btn-neutral');
    const sexuality = linkCanvas.querySelector('.row.justify-content-between .col-4:nth-child(1) .h6');
    const bodyType = linkCanvas.querySelector('.row.justify-content-between .col-4:nth-child(2) .h6');
    const race = linkCanvas.querySelector('.row.justify-content-between .col-4:nth-child(3) .h6');
    const kinksList = linkCanvas.querySelector('.card-body .text-sm.text-muted');
    const previewImages = linkCanvas.querySelector('.mt-2.d-flex.gap-2');

    const profileIcon = profile.info.source === "Twitter" ? `https://pbs.twimg.com/profile_images/${profile.icon}` : `https://preview.redd.it/${profile.icon}`;
    const profileUrl = profile.info.source === "Twitter" ? `https://x.com/${profile.link}` : `https://www.reddit.com/user/${profile.link}`;

    profileImage.src = profileIcon;
    profileName.textContent = profile.name;
    profileLink.textContent = `@${profile.link}`;
    openButton.href = profileUrl;
    sexuality.textContent = profile.info.sexuality;
    bodyType.textContent = profile.info.body;
    race.textContent = profile.info.race;
    kinksList.textContent = profile.info.kinks.join(", ");
    previewImages.innerHTML = '';

    profile.info.preview.forEach(imgUrl => {
        const imgElement = document.createElement('img');
        imgElement.src = imgUrl;
        imgElement.classList.add('rounded', 'w-auto', 'h-20');
        previewImages.appendChild(imgElement);
    });
};

document.querySelectorAll('.btn-neutral[data-bs-target="#link_canvas"]').forEach(viewButton => {
    viewButton.addEventListener('click', (e) => {
        const profileName = e.target.closest('.d-flex').querySelector('.font-semibold').textContent;
        const selectedProfile = data.find(profile => profile.name === profileName);

        if (selectedProfile) {
            populateLinkDetails(selectedProfile);
        }
    });
});

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
                                <button type="button" class="btn btn-sm btn-neutral rounded-pill"
                                    data-bs-toggle="offcanvas" data-bs-target="#link_canvas">
                                    <i class="bi bi-folder2-open me-1"></i> View
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    });

    document.querySelectorAll('.btn-neutral[data-bs-target="#link_canvas"]').forEach(viewButton => {
        viewButton.addEventListener('click', (e) => {
            const profileName = e.target.closest('.d-flex').querySelector('.font-semibold').textContent;
            const selectedProfile = data.find(profile => profile.name === profileName);

            if (selectedProfile) {
                populateLinkDetails(selectedProfile);
            }
        });
    });
};

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