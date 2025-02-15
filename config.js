// Supabase Configuration
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client with error handling
let supabase;
try {
	supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (error) {
	console.error('Failed to initialize Supabase client:', error);
	// Show error notification to user
	showNotification('Failed to connect to the server. Please try again later.', 'error');
}

// App Configuration
const APP_CONFIG = {
	cacheTimeout: 5 * 60 * 1000, // 5 minutes
	maxRetries: 3,
	retryDelay: 1000,
	analytics: {
		enabled: true,
		trackPageViews: true,
		trackDownloads: true,
		trackSearches: true
	},
	pagination: {
		itemsPerPage: 12,
		maxPages: 10
	}
};

// Utility function for notifications
function showNotification(message, type = 'info') {
	const notification = document.createElement('div');
	notification.className = `notification ${type}`;
	notification.textContent = message;
	
	document.body.appendChild(notification);
	
	setTimeout(() => {
		notification.classList.add('fade-out');
		setTimeout(() => notification.remove(), 300);
	}, 3000);
}

// Export configuration
export { supabase, APP_CONFIG, showNotification };