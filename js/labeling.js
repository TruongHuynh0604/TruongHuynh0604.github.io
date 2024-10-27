const imageInput = document.getElementById('imageInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const boundingBoxList = document.getElementById('bounding-box-list');
const exportLabelsBtn = document.getElementById('exportLabels');
const labelSelect = document.getElementById('labelSelect');

let img = new Image();
let boundingBoxes = [];
let isDrawing = false;
let startX = 0;
let startY = 0;

// Load image and adjust canvas size
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            img.onload = () => {
                const aspectRatio = img.width / img.height;
                canvas.width = 640;
                canvas.height = 640 / aspectRatio;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                drawBoundingBoxes();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Start drawing a bounding box
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    isDrawing = true;
});

// Draw bounding box while dragging
canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    drawBoundingBoxes();

    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, mouseX - startX, mouseY - startY);
});

// Finish drawing bounding box and save it
canvas.addEventListener('mouseup', (e) => {
    if (isDrawing) {
        isDrawing = false;
        const rect = canvas.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;

        const width = endX - startX;
        const height = endY - startY;

        // Only add box if width and height are positive
        if (width > 0 && height > 0) {
            const box = {
                x: startX / canvas.width,
                y: startY / canvas.height,
                width: width / canvas.width,
                height: height / canvas.height,
                classId: labelSelect.value, // Lấy nhãn từ dropdown
                imageName: img.src.split('/').pop() // Lưu tên ảnh
            };

            boundingBoxes.push(box);
            addBoundingBoxToList(box);
            drawBoundingBoxes();
        }
    }
});

// Draw all bounding boxes on the canvas
function drawBoundingBoxes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;

    boundingBoxes.forEach(box => {
        ctx.strokeRect(
            box.x * canvas.width,
            box.y * canvas.height,
            box.width * canvas.width,
            box.height * canvas.height
        );
    });
}

// Add bounding box info to the list
function addBoundingBoxToList(box) {
    const boxElement = document.createElement('div');
    boxElement.textContent = `Class: ${box.classId}, Image: ${box.imageName}, x: ${box.x.toFixed(2)}, y: ${box.y.toFixed(2)}, w: ${box.width.toFixed(2)}, h: ${box.height.toFixed(2)}`;

    boundingBoxList.appendChild(boxElement);
}

// Export bounding box labels to YOLO format
exportLabelsBtn.addEventListener('click', () => {
    const labels = boundingBoxes.map(box => `${box.classId} ${box.x} ${box.y} ${box.width} ${box.height}`).join('\n');
    const blob = new Blob([labels], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'labels.txt';
    link.click();
    URL.revokeObjectURL(link.href);
});
