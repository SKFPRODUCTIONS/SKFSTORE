// DOM Elements
const contactForm = document.getElementById('contactForm');

// Handle form submission
contactForm.addEventListener('submit', async (e) => {
	e.preventDefault();
	
	const formData = {
		name: document.getElementById('name').value,
		email: document.getElementById('email').value,
		message: document.getElementById('message').value
	};
	
	// Here you would typically send the data to a server
	// For now, we'll just show a success message
	alert('Thank you for your message! We will get back to you soon.');
	contactForm.reset();
});