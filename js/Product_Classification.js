document.addEventListener("DOMContentLoaded", function () {
    const imageFolderInput = document.getElementById('image-folder');
    const mainImage = document.getElementById('main-image');
    const imageNameDisplay = document.getElementById('image-name');
    const errorList = document.getElementById('error-list');
    const confirmBtn = document.getElementById('confirm-btn');
    const uploadedImages = document.getElementById('uploaded-images');
    const consoleLog = document.getElementById('console-log');
    const loadImageBtn = document.getElementById('load-image-btn');

    let selectedImageFile = null;
    let errorName = '';
    let selectedNameElement = null; // Phần tử DOM của ảnh đã chọn

    // Tải ảnh từ thư mục
    loadImageBtn.addEventListener('click', function () {
        const files = imageFolderInput.files;

        if (files.length === 0) {
            alert("Vui lòng chọn thư mục chứa ảnh!");
            return;
        }

        const images = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (images.length === 0) {
            alert("Không tìm thấy ảnh nào trong thư mục đã chọn!");
            return;
        }

        uploadedImages.innerHTML = ''; // Xóa danh sách ảnh cũ

        images.sort((a, b) => a.name.localeCompare(b.name)); // Sắp xếp tên ảnh từ A đến Z

        images.forEach((imageFile, index) => {
            const imageUrl = URL.createObjectURL(imageFile);
            const nameElement = document.createElement('div');
            nameElement.className = 'thumbnail-name';
            nameElement.textContent = `${index + 1}. ${imageFile.name}`; // Thêm số thứ tự

            nameElement.addEventListener('click', function () {
                selectedImageFile = imageFile;
                selectedNameElement = nameElement;
                mainImage.src = imageUrl;
                imageNameDisplay.textContent = `Image name: ${imageFile.name}`;
                consoleLog.innerHTML = `<li>Đã chọn ảnh: ${imageFile.name}</li>`;

                confirmBtn.disabled = !errorName; // Kích hoạt nút xác nhận nếu có lỗi

                const allImageNames = uploadedImages.querySelectorAll('.thumbnail-name');
                allImageNames.forEach(name => name.style.fontWeight = 'normal');
                nameElement.style.fontWeight = 'bold';
            });

            uploadedImages.appendChild(nameElement);
        });
    });

    const mockErrors = ["Lỗi 1: Ảnh bị mờ", "Lỗi 2: Ảnh không rõ nét", "Lỗi 3: Ảnh không hợp lệ"];
    mockErrors.forEach(error => {
        const option = document.createElement("option");
        option.textContent = error;
        errorList.appendChild(option);
    });

    errorList.addEventListener('change', function () {
        const selectedOptions = Array.from(this.selectedOptions);
        if (selectedOptions.length > 0) {
            errorName = selectedOptions[0].text;
            confirmBtn.disabled = !selectedImageFile;
            consoleLog.innerHTML = `<li>Đã chọn lỗi: ${errorName}</li>`;
        } else {
            errorName = '';
            confirmBtn.disabled = true;
        }
    });

    confirmBtn.addEventListener('click', function () {
        if (selectedImageFile && errorName) {
            const date = new Date();
            const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
    
            const homeID = sessionStorage.getItem("homeID") || "No ID"; // Lấy ID từ sessionStorage
            const logEntry = {
                homeID: homeID,
                error: errorName,
                timestamp: formattedDate
            };
    
            fetch('http://localhost:3000/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ log: logEntry })
            }).then(response => {
                if (response.ok) {
                    consoleLog.innerHTML = `<li>ID: ${homeID}, Lỗi: ${errorName}, Ngày giờ: ${formattedDate}</li>`;
                } else {
                    console.error("Lỗi khi ghi log");
                }
            });
    
            // Code xử lý ảnh tiếp theo (như đã thiết lập)
            if (selectedNameElement) {
                const nextSibling = selectedNameElement.nextSibling;
                uploadedImages.removeChild(selectedNameElement);
    
                if (nextSibling) {
                    nextSibling.click(); // Tự động chọn ảnh tiếp theo
                } else {
                    selectedImageFile = null;
                    selectedNameElement = null;
                    mainImage.src = ''; // Xóa ảnh đang hiển thị
                    imageNameDisplay.textContent = 'Image';
                    confirmBtn.disabled = true;
                }
            }
        } else {
            alert("Vui lòng chọn cả ảnh và lỗi để xác nhận!");
        }
    });    
});
