document.addEventListener("DOMContentLoaded", function () {
    const mainImage = document.getElementById('main-image');
    const imageNameDisplay = document.getElementById('image-name');
    const uploadedImages = document.getElementById('uploaded-images');
    const consoleLog = document.getElementById('console-log');

    // Tải danh sách ảnh từ server
    function loadImages() {
        fetch('http://localhost:3000/images-list')
            .then(response => response.json())
            .then(images => {
                console.log(images); // Kiểm tra danh sách ảnh
                uploadedImages.innerHTML = ''; // Xóa danh sách ảnh hiện tại

                images.forEach((imageFile, index) => {
                    const imageUrl = `http://localhost:3000/images/${imageFile}`;
                    console.log(imageUrl); // Kiểm tra đường dẫn ảnh
                    const nameElement = document.createElement('div');
                    nameElement.className = 'thumbnail-name';
                    nameElement.textContent = `${index + 1}. ${imageFile}`; // Hiển thị tên ảnh

                    nameElement.addEventListener('click', function () {
                        mainImage.src = imageUrl;
                        imageNameDisplay.textContent = `Image name: ${imageFile}`;
                        consoleLog.innerHTML = `<li>Đã chọn ảnh: ${imageFile}</li>`;
                    });

                    uploadedImages.appendChild(nameElement);
                });
            })
            .catch(error => console.error('Lỗi khi tải ảnh:', error));
    }

    // Gọi hàm loadImages khi trang được tải
    loadImages();
});
