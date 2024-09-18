document.addEventListener('DOMContentLoaded', function () {
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

    auth.onAuthStateChanged(user => {
        const profilePic = document.getElementById('profile-pic');
        const username = document.getElementById('username');
        const authStatus = document.getElementById('auth-status');

        if (user) {
            profilePic.src = user.photoURL;
            username.textContent = user.displayName;
            authStatus.innerHTML = '<i class="bi bi-person"></i> Logout';
        } else {
            profilePic.src = "Assets/Images/logo_1.png";
            username.textContent = "Anonymous";
            authStatus.innerHTML = '<i class="bi bi-person"></i> Login';
        }
    });

    document.getElementById('auth-status').addEventListener('click', function () {
        if (auth.currentUser) {
            auth.signOut();
        } else {
            const provider = new firebase.auth.GoogleAuthProvider();
            auth.signInWithPopup(provider);
        }
    });

    const fuseOptions = {
        keys: ['name', 'info.kinks', 'info.source'],
        threshold: 0.3
    };
    const fuse = new Fuse(data, fuseOptions);

    displayResults(data);

    document.getElementById('search-bar').addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        const results = fuse.search(searchTerm);
        displayResults(results.map(result => result.item));
    });

    document.getElementById('sort-by').addEventListener('change', function (e) {
        const sortBy = e.target.value;
        sortResults(sortBy);
    });

    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });

    document.getElementById('clear-filters').addEventListener('click', function () {
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
        document.getElementById('sort-by').value = 'relevance';
        displayResults(data);
    });

    function displayResults(results) {
        const container = document.getElementById('results-container');
        container.innerHTML = '';

        results.forEach((item) => {
            const card = document.createElement('div');
            card.className = 'card shadow-4-hover col-lg-4 col-sm-6';

            const linkDisplay = item.info.source === 'twitter' ? `@${item.link}` : `u/${item.link}`;

            card.innerHTML = `
                <div class="card-body">
                  <img src="${item.icon}" class="avatar rounded-1" />
                  <h5>${item.name}</h5>
                  <p>${linkDisplay}</p>
                  <button type="button" class="btn btn-sm btn-neutral rounded-pill" data-bs-toggle="offcanvas" data-bs-target="#link_canvas" onclick="openLinkCanvas('${item.name}', '${linkDisplay}', '${item.link}', '${item.icon}', '${item.info.kinks}', '${item.info.preview}')">View</button>
                </div>
            `;

            container.appendChild(card);
        });
    }

    window.openLinkCanvas = function (name, linkDisplay, linkId, icon, kinks, preview) {
        document.getElementById('link_canvas_label').textContent = `${name}'s Details`;

        const linkCanvasContent = `
            <img src="${icon}" class="avatar rounded-1">
            <a href="#" class="d-block font-semibold text-sm text-heading">${linkDisplay}</a>
            <p>${kinks}</p>
            <div class="d-flex gap-2">
              ${preview.map(img => `<img src="${img}" class="rounded w-auto h-20">`).join('')}
            </div>
        `;

        document.getElementById('link_canvas_body').innerHTML = linkCanvasContent;
    }

    function applyFilters() {
        const selectedSources = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
        let filteredResults = data;

        if (selectedSources.length) {
            filteredResults = data.filter(item => selectedSources.includes(item.info.source));
        }

        displayResults(filteredResults);
    }

    function sortResults(criteria) {
        let sortedData = [...data];

        if (criteria === 'name-asc') {
            sortedData.sort((a, b) => a.name.localeCompare(b.name));
        } else if (criteria === 'name-desc') {
            sortedData.sort((a, b) => b.name.localeCompare(a.name));
        }

        displayResults(sortedData);
    }

    document.getElementById('rate').addEventListener('input', function () {
        const rating = parseInt(this.value);
        const user = firebase.auth().currentUser;

        if (!user) {
            alert("Please login to rate!");
            return;
        }

        const userId = user.uid;
        const linkId = getLinkId();

        const userRatingRef = db.collection('Users').doc(userId).collection(linkId).doc('rating');

        userRatingRef.set({
            rating: rating
        }).then(() => {
            console.log('Rating successfully submitted');
        }).catch(error => {
            console.error('Error submitting rating: ', error);
        });
    });

    function deleteUserRating(linkId) {
        const user = firebase.auth().currentUser;
        if (!user) {
            return;
        }

        const userId = user.uid;
        const userRatingRef = db.collection('Users').doc(userId).collection(linkId).doc('rating');

        userRatingRef.delete().then(() => {
            console.log('Rating successfully deleted');
        }).catch((error) => {
            console.error('Error deleting rating: ', error);
        });
    }
});