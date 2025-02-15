// Cache management
const APP_CACHE_KEY = 'skf_store_apps_cache';
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

// DOM Elements
const appGrid = document.getElementById('appGrid');
const searchInput = document.getElementById('searchInput');
let apps = [];

// Loading state management
function showLoading() {
	appGrid.innerHTML = '<div class="loading-spinner">Loading apps...</div>';
}

function hideLoading() {
	const spinner = document.querySelector('.loading-spinner');
	if (spinner) spinner.remove();
}

// Cache management
function setCacheData(data) {
	const cacheData = {
		timestamp: Date.now(),
		data: data
	};
	localStorage.setItem(APP_CACHE_KEY, JSON.stringify(cacheData));
}

function getCachedData() {
	const cached = localStorage.getItem(APP_CACHE_KEY);
	if (!cached) return null;

	const { timestamp, data } = JSON.parse(cached);
	if (Date.now() - timestamp > CACHE_DURATION) {
		localStorage.removeItem(APP_CACHE_KEY);
		return null;
	}
	return data;
}

// Fetch apps from Supabase with error handling and caching
async function fetchApps() {
	showLoading();
	
	try {
		// Check cache first
		const cachedApps = getCachedData();
		if (cachedApps) {
			apps = cachedApps;
			displayApps(apps);
			return;
		}

		const { data, error } = await supabase
			.from('apps')
			.select('*')
			.order('created_at', { ascending: false });
		
		if (error) throw error;
		
		apps = data;
		setCacheData(apps);
		displayApps(apps);
	} catch (error) {
		console.error('Error fetching apps:', error);
		appGrid.innerHTML = `
			<div class="error-message">
				<p>Failed to load apps. Please try again later.</p>
				<button onclick="fetchApps()">Retry</button>
			</div>
		`;
	} finally {
		hideLoading();
	}
}

// Display apps with enhanced UI
function displayApps(appsToDisplay) {
	appGrid.innerHTML = '';
	
	if (!appsToDisplay.length) {
		appGrid.innerHTML = '<div class="no-results">No apps found</div>';
		return;
	}
	
	appsToDisplay.forEach(app => {
		const appCard = document.createElement('div');
		appCard.className = 'app-card';
		
		appCard.innerHTML = `
			<div class="app-header">
				<img src="${app.icon_url}" alt="${app.name}" class="app-icon" 
					onerror="this.src='assets/default-app-icon.png'">
				<div class="app-rating">
					${generateRatingStars(app.rating || 0)}
				</div>
			</div>
			<div class="app-info">
				<h3 class="app-name">${app.name}</h3>
				<p class="app-description">${app.description}</p>
				<div class="app-meta">
					<span class="app-size">${formatFileSize(app.size || 0)}</span>
					<span class="app-downloads">${formatDownloads(app.downloads || 0)} downloads</span>
				</div>
			</div>
			<button class="download-btn" onclick="handleDownload('${app.id}', '${app.download_link}')">
				Download
			</button>
		`;
		
		appGrid.appendChild(appCard);
	});
}

// Utility functions
function generateRatingStars(rating) {
	const fullStars = Math.floor(rating);
	const hasHalfStar = rating % 1 >= 0.5;
	const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
	
	return `
		${'★'.repeat(fullStars)}
		${hasHalfStar ? '½' : ''}
		${'☆'.repeat(emptyStars)}
		<span class="rating-number">${rating.toFixed(1)}</span>
	`;
}

function formatFileSize(bytes) {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDownloads(num) {
	if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
	if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
	return num.toString();
}

// Download handling with analytics
async function handleDownload(appId, downloadLink) {
	try {
		// Update download count
		await supabase
			.from('apps')
			.update({ downloads: increment('downloads') })
			.eq('id', appId);
			
		// Track download analytics
		await supabase
			.from('downloads')
			.insert([{
				app_id: appId,
				timestamp: new Date().toISOString(),
				user_agent: navigator.userAgent
			}]);
			
		window.open(downloadLink, '_blank');
	} catch (error) {
		console.error('Error handling download:', error);
	}
}

// Debounced search function
const debounce = (fn, delay) => {
	let timeoutId;
	return (...args) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	};
};

const handleSearch = debounce((event) => {
	const searchTerm = event.target.value.toLowerCase();
	const filteredApps = apps.filter(app => 
		app.name.toLowerCase().includes(searchTerm) ||
		app.description.toLowerCase().includes(searchTerm)
	);
	displayApps(filteredApps);
}, 300);

// Event listeners
searchInput.addEventListener('input', handleSearch);
document.addEventListener('DOMContentLoaded', fetchApps);

// Refresh cache when tab becomes visible
document.addEventListener('visibilitychange', () => {
	if (document.visibilityState === 'visible') {
		fetchApps();
	}
});