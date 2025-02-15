// DOM Elements
const appGrid = document.getElementById('appGrid');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
let apps = [];

// Fetch apps from Supabase
async function fetchApps() {
	try {
		const { data, error } = await supabase
			.from('apps')
			.select('*');
		
		if (error) throw error;
		
		apps = data;
		displayApps(apps);
	} catch (error) {
		console.error('Error fetching apps:', error);
	}
}

// Display apps in the grid
function displayApps(appsToDisplay) {
	appGrid.innerHTML = '';
	
	appsToDisplay.forEach(app => {
		const appCard = document.createElement('div');
		appCard.className = 'app-card';
		
		appCard.innerHTML = `
			<img src="${app.icon_url}" alt="${app.name}" class="app-icon">
			<h3 class="app-name">${app.name}</h3>
			<p class="app-description">${app.description}</p>
			<button class="download-btn" onclick="window.open('${app.download_link}', '_blank')">
				Download
			</button>
		`;
		
		appGrid.appendChild(appCard);
	});
}

// Sort apps
function sortApps(apps, sortBy) {
	switch(sortBy) {
		case 'name':
			return [...apps].sort((a, b) => a.name.localeCompare(b.name));
		case 'newest':
			return [...apps].sort((a, b) => b.id - a.id);
		default:
			return apps;
	}
}

// Handle search and sort
function handleSearchAndSort() {
	const searchTerm = searchInput.value.toLowerCase();
	const sortBy = sortSelect.value;
	
	let filteredApps = apps.filter(app => 
		app.name.toLowerCase().includes(searchTerm) ||
		app.description.toLowerCase().includes(searchTerm)
	);
	
	filteredApps = sortApps(filteredApps, sortBy);
	displayApps(filteredApps);
}

// Event listeners
searchInput.addEventListener('input', handleSearchAndSort);
sortSelect.addEventListener('change', handleSearchAndSort);

// Initialize app
document.addEventListener('DOMContentLoaded', fetchApps);