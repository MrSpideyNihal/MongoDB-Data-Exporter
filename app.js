// State management
const state = {
    mongoUrl: '',
    databases: [],
    selectedDatabase: null,
    collections: [],
    selectedCollections: new Set()
};

// DOM Elements
const elements = {
    mongoUrl: document.getElementById('mongoUrl'),
    connectBtn: document.getElementById('connectBtn'),
    connectBtnText: document.getElementById('connectBtnText'),
    statusMessage: document.getElementById('statusMessage'),
    databaseBrowser: document.getElementById('databaseBrowser'),
    databaseGrid: document.getElementById('databaseGrid'),
    collectionsSection: document.getElementById('collectionsSection'),
    collectionsList: document.getElementById('collectionsList'),
    selectAllBtn: document.getElementById('selectAllBtn'),
    deselectAllBtn: document.getElementById('deselectAllBtn'),
    exportSelectedBtn: document.getElementById('exportSelectedBtn'),
    exportAllBtn: document.getElementById('exportAllBtn')
};

// Utility Functions
function showStatus(message, type = 'info') {
    const icons = {
        success: '✓',
        error: '✗',
        info: 'ℹ'
    };

    elements.statusMessage.innerHTML = `
    <div class="status-message status-${type}">
      <span>${icons[type]}</span>
      <span>${message}</span>
    </div>
  `;

    setTimeout(() => {
        elements.statusMessage.innerHTML = '';
    }, 5000);
}

function setLoading(isLoading, buttonElement, originalText) {
    if (isLoading) {
        buttonElement.disabled = true;
        buttonElement.innerHTML = `<span class="spinner"></span> <span>Loading...</span>`;
    } else {
        buttonElement.disabled = false;
        buttonElement.innerHTML = `<span>${originalText}</span>`;
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// API Functions
async function connectToMongoDB(mongoUrl) {
    const response = await fetch('/.netlify/functions/connect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mongoUrl })
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error || 'Failed to connect');
    }

    return data.databases;
}

async function listCollections(mongoUrl, database) {
    const response = await fetch('/.netlify/functions/list-collections', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mongoUrl, database })
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error || 'Failed to list collections');
    }

    return data.collections;
}

async function exportData(mongoUrl, database, collections = null) {
    const response = await fetch('/.netlify/functions/export-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mongoUrl, database, collections })
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error || 'Failed to export data');
    }

    return data;
}

// UI Functions
function renderDatabases(databases) {
    elements.databaseGrid.innerHTML = '';

    databases.forEach(db => {
        const card = document.createElement('div');
        card.className = 'database-card';
        card.innerHTML = `
      <div class="database-name">${db.name}</div>
      <div class="database-info">
        ${db.sizeOnDisk ? formatBytes(db.sizeOnDisk) : 'Size unknown'}
      </div>
    `;

        card.addEventListener('click', () => selectDatabase(db.name));
        elements.databaseGrid.appendChild(card);
    });

    elements.databaseBrowser.classList.add('active');
}

function renderCollections(collections) {
    elements.collectionsList.innerHTML = '';

    collections.forEach(col => {
        const item = document.createElement('div');
        item.className = 'collection-item';
        item.innerHTML = `
      <input 
        type="checkbox" 
        class="collection-checkbox" 
        data-collection="${col.name}"
        id="col-${col.name}"
      >
      <div class="collection-details">
        <div class="collection-name">${col.name}</div>
        <div class="collection-count">${col.documentCount} documents</div>
      </div>
      <button class="collection-export" data-collection="${col.name}">
        Export
      </button>
    `;

        const checkbox = item.querySelector('.collection-checkbox');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                state.selectedCollections.add(col.name);
            } else {
                state.selectedCollections.delete(col.name);
            }
        });

        const exportBtn = item.querySelector('.collection-export');
        exportBtn.addEventListener('click', () => exportSingleCollection(col.name));

        elements.collectionsList.appendChild(item);
    });

    elements.collectionsSection.classList.add('active');
}

function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Event Handlers
async function handleConnect() {
    const mongoUrl = elements.mongoUrl.value.trim();

    if (!mongoUrl) {
        showStatus('Please enter a MongoDB URL', 'error');
        return;
    }

    setLoading(true, elements.connectBtn, 'Connect');

    try {
        const databases = await connectToMongoDB(mongoUrl);
        state.mongoUrl = mongoUrl;
        state.databases = databases;

        showStatus(`Connected successfully! Found ${databases.length} database(s)`, 'success');
        renderDatabases(databases);
    } catch (error) {
        showStatus(`Connection failed: ${error.message}`, 'error');
    } finally {
        setLoading(false, elements.connectBtn, 'Connect');
    }
}

async function selectDatabase(databaseName) {
    // Update UI
    document.querySelectorAll('.database-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.target.closest('.database-card').classList.add('selected');

    state.selectedDatabase = databaseName;
    state.selectedCollections.clear();

    // Fetch collections
    try {
        showStatus(`Loading collections from ${databaseName}...`, 'info');
        const collections = await listCollections(state.mongoUrl, databaseName);
        state.collections = collections;

        showStatus(`Found ${collections.length} collection(s)`, 'success');
        renderCollections(collections);
    } catch (error) {
        showStatus(`Failed to load collections: ${error.message}`, 'error');
    }
}

async function exportSingleCollection(collectionName) {
    try {
        showStatus(`Exporting ${collectionName}...`, 'info');
        const data = await exportData(state.mongoUrl, state.selectedDatabase, [collectionName]);

        const filename = `${state.selectedDatabase}_${collectionName}_${Date.now()}.json`;
        downloadJSON(data, filename);

        showStatus(`Successfully exported ${collectionName}`, 'success');
    } catch (error) {
        showStatus(`Export failed: ${error.message}`, 'error');
    }
}

async function exportSelectedCollections() {
    if (state.selectedCollections.size === 0) {
        showStatus('Please select at least one collection', 'error');
        return;
    }

    try {
        const collections = Array.from(state.selectedCollections);
        showStatus(`Exporting ${collections.length} collection(s)...`, 'info');

        const data = await exportData(state.mongoUrl, state.selectedDatabase, collections);

        const filename = `${state.selectedDatabase}_selected_${Date.now()}.json`;
        downloadJSON(data, filename);

        showStatus(`Successfully exported ${collections.length} collection(s)`, 'success');
    } catch (error) {
        showStatus(`Export failed: ${error.message}`, 'error');
    }
}

async function exportAllCollections() {
    try {
        showStatus(`Exporting all collections from ${state.selectedDatabase}...`, 'info');

        const data = await exportData(state.mongoUrl, state.selectedDatabase, null);

        const filename = `${state.selectedDatabase}_complete_${Date.now()}.json`;
        downloadJSON(data, filename);

        showStatus(`Successfully exported all collections`, 'success');
    } catch (error) {
        showStatus(`Export failed: ${error.message}`, 'error');
    }
}

function selectAllCollections() {
    document.querySelectorAll('.collection-checkbox').forEach(checkbox => {
        checkbox.checked = true;
        state.selectedCollections.add(checkbox.dataset.collection);
    });
}

function deselectAllCollections() {
    document.querySelectorAll('.collection-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    state.selectedCollections.clear();
}

// Event Listeners
elements.connectBtn.addEventListener('click', handleConnect);
elements.mongoUrl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleConnect();
    }
});

elements.selectAllBtn.addEventListener('click', selectAllCollections);
elements.deselectAllBtn.addEventListener('click', deselectAllCollections);
elements.exportSelectedBtn.addEventListener('click', exportSelectedCollections);
elements.exportAllBtn.addEventListener('click', exportAllCollections);

// Initialize
console.log('MongoDB Data Exporter initialized');
