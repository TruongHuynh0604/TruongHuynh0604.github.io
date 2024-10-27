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
    let selectedNameElement = null;

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

        uploadedImages.innerHTML = ''; 

        images.sort((a, b) => a.name.localeCompare(b.name));

        images.forEach((imageFile, index) => {
            const imageUrl = URL.createObjectURL(imageFile);
            const nameElement = document.createElement('div');
            nameElement.className = 'thumbnail-name';
            nameElement.textContent = `${index + 1}. ${imageFile.name}`; 

            nameElement.addEventListener('click', function () {
                selectedImageFile = imageFile;
                selectedNameElement = nameElement;
                mainImage.src = imageUrl;
                imageNameDisplay.textContent = `Image name: ${imageFile.name}`;
                consoleLog.innerHTML = `<li>Đã chọn ảnh: ${imageFile.name}</li>`;

                confirmBtn.disabled = !errorName;

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
            resizeAndDownloadImage(selectedImageFile, 640, 640);

            const date = new Date();
            const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
    
            const homeID = sessionStorage.getItem("homeID") || "No ID";
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
        } else {
            alert("Vui lòng chọn cả ảnh và lỗi để xác nhận!");
        }
    });

    function resizeAndDownloadImage(file, width, height) {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(blob => {
                const resizedImg = new Image();
                resizedImg.src = URL.createObjectURL(blob);

                resizedImg.onload = function () {
                    const link = document.createElement('a');
                    link.href = resizedImg.src;
                    link.download = `resized_${file.name}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    console.log("Image resized and downloaded:", link.download);
                };
            }, file.type, 0.9);
        };
    }
});
