document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadForm');
    const currentImage = document.getElementById('currentImage');
    const API_URL = window.location.origin;

    // Load existing image
    loadImage();

    // Handle form submission
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Form submitted');

        const fileInput = document.getElementById('imageInput');
        const file = fileInput.files[0];

        if (!file) {
            alert('Por favor selecciona una imagen');
            return;
        }

        console.log('File selected:', file);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();
            console.log('Upload response:', data);
            
            if (data.imageUrl) {
                console.log('Setting image URL:', data.imageUrl);
                displayImage(data.imageUrl);
                fileInput.value = '';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al subir la imagen: ' + error.message);
        }
    });

    // Load existing image
    async function loadImage() {
        try {
            const response = await fetch(`${API_URL}/images`);
            const images = await response.json();
            console.log('Loaded images:', images);
            
            if (images.length > 0) {
                displayImage(images[0].url);
            }
        } catch (error) {
            console.error('Error loading image:', error);
        }
    }

    // Display image
    function displayImage(imageUrl) {
        console.log('Displaying image:', imageUrl);
        currentImage.innerHTML = `
            <img src="${imageUrl}" alt="Uploaded image" style="max-width: 100%; height: auto;">
        `;
    }
});
