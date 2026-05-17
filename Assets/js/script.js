const toggleBtn = document.getElementById('theme-toggle');
const rootContainer = document.getElementById('menu-root');

// 1. Maintain Light/Dark Toggling
toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  toggleBtn.innerHTML = document.body.classList.contains('dark-mode') ? '⚪' : '⚫';
});

// 2. Main Coordinator to handle Instant Cache + Background Updating
async function initRepository() {
    const cachedData = localStorage.getItem('shan_repo_cache');
    
    if (cachedData) {
        try {
            const parsedTree = JSON.parse(cachedData);
            rootContainer.innerHTML = '';
            buildMenu(parsedTree, rootContainer);
        } catch (e) {
            localStorage.removeItem('shan_repo_cache');
        }
    } else {
        rootContainer.innerHTML = `<p style="color: var(--text-l1); padding: 20px;">Syncing with Google Drive repository...</p>`;
    }

    await fetchLiveDriveUpdates(!!cachedData);
}

// 3. Fetch live data directly from Google API
async function fetchLiveDriveUpdates(hasExistingCache) {
    // PASTE YOUR NEW ANONYMOUS WEB APP URL HERE
    const googleAppScriptUrl = "https://script.google.com/macros/s/AKfycbxCYzVw_8G47e6Ho-v6I0QEyfOnZAdUV2BEq4nue_jF0QUX0NqjGIM-5K9lfyheJSWa/exec";

    try {
        const response = await fetch(googleAppScriptUrl);
        if (!response.ok) throw new Error("Network issues reaching Google Drive API.");
        
        const treeData = await response.json();
        if (treeData.error) throw new Error(treeData.error);
        
        const freshDataString = JSON.stringify(treeData);
        const oldDataString = localStorage.getItem('shan_repo_cache');

        if (freshDataString !== oldDataString) {
            localStorage.setItem('shan_repo_cache', freshDataString);
            rootContainer.innerHTML = '';
            buildMenu(treeData, rootContainer);
        }
    } catch (err) {
        console.error("Failed to map repository from Google Drive:", err);
        if (!hasExistingCache) {
            rootContainer.innerHTML = `<p style="color: var(--text-l2); padding: 20px;">Error mapping files from cloud storage.</p>`;
        }
    }
}

// 4. Render Top-Level Design Containers (Your Original Design)
function buildMenu(data, container) {
    data.forEach(subject => {
        const ul = document.createElement('ul');
        ul.className = 'menu-container';
        const li = document.createElement('li');
        li.appendChild(renderNode(subject, true));
        ul.appendChild(li);
        container.appendChild(ul);
    });
}

// 5. Transform Live JSON Layers into Your Original Design Elements
function renderNode(item, isTopLevel = false) {
    if (item.type === 'file') {
        const link = document.createElement('a');
        link.href = item.url; // Opens standard preview window under the new account
        link.textContent = item.name;
        link.target = '_blank';
        link.rel = 'noopener noreferrer'; 
        return link;
    }

    const details = document.createElement('details');
    if (isTopLevel) details.open = true;

    const summary = document.createElement('summary');
    summary.textContent = item.name;
    details.appendChild(summary);

    const ul = document.createElement('ul');
    
    if (!item.children || item.children.length === 0) {
        const li = document.createElement('li');
        const noData = document.createElement('a');
        noData.href = '#';
        noData.textContent = 'No Data';
        li.appendChild(noData);
        ul.appendChild(li);
    } else {
        item.children.forEach(child => {
            const li = document.createElement('li');
            li.appendChild(renderNode(child, false));
            ul.appendChild(li);
        });
    }

    details.appendChild(ul);
    return details;
}

// Start cache manager loop on load
initRepository();
