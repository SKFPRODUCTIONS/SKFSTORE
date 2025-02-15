// DOM Elements
const appUploadForm = document.getElementById('appUploadForm');
const uploadStatus = document.getElementById('uploadStatus');

// Handle form submission
appUploadForm.addEventListener('submit', async (e) => {
	e.preventDefault();
	
	const formData = {
		name: document.getElementById('appName').value,
		icon_url: document.getElementById('iconUrl').value,
		description: document.getElementById('description').value,
		download_link: document.getElementById('downloadLink').value
	};
	
	try {
		const { data, error } = await supabase
			.from('apps')
			.insert([formData]);
			
		if (error) throw error;
		
		// Show success message
		uploadStatus.className = 'upload-status success';
		uploadStatus.textContent = 'App uploaded successfully!';
		
		// Reset form
		appUploadForm.reset();
		
		// Clear success message after 3 seconds
		setTimeout(() => {
			uploadStatus.textContent = '';
			uploadStatus.className = 'upload-status';
		}, 3000);
		
	} catch (error) {
		// Show error message
		uploadStatus.className = 'upload-status error';
		uploadStatus.textContent = `Error: ${error.message}`;
	}
});