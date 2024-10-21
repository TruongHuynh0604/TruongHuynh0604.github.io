//TruongHuynh
let labelMapping = {};

// URL của Google Apps Script
const googleScriptURL = 'https://script.google.com/macros/s/AKfycbwKu-1r6rgcGVYSY1N0S5eP-m0RJCeZHsE2chlTRMV9AkTpi9_xk3klCa_L9N9tHjCs/exec'; // Thay thế bằng URL của Google Apps Script

fetch('labels.json')
    .then(response => response.json())
    .then(data => {
        labelMapping = data;
    })
    .catch(error => console.error('Error loading JSON:', error));

document.getElementById('processBtn').addEventListener('click', processInput);
document.getElementById('saveBtn').addEventListener('click', saveToExcel);
document.getElementById('printBtn').addEventListener('click', printData);

function processInput() {
    const projectName = document.getElementById('projectName').value.trim(); // Lấy tên dự án
    const inputData = document.getElementById('inputData').value;
    const parsedData = parseInputData(inputData);
    const tableBody = document.querySelector('#dataTable tbody');
    tableBody.innerHTML = '';

    // Sắp xếp dữ liệu
    const sortedEntries = Object.entries(parsedData).sort((a, b) => a[1] - b[1]);

    // Thêm các hàng vào bảng
    for (const [englishLabel, quantity] of sortedEntries) {
        const vietnameseLabel = getVietnameseLabel(englishLabel);
        const note = englishLabel.includes("nok") ? "NOK" : "OK";
        const remainingQuantity = Math.max(0, 200 - quantity);
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${englishLabel}</td>
            <td class="${getQuantityClass(quantity)}">${quantity}</td>
            <td>${vietnameseLabel}</td>
            <td>${note}</td>
            <td>${remainingQuantity}</td>
        `;
        
        tableBody.appendChild(row);
    }

    // Ghi log vào Google Sheets
    logToGoogleSheets(projectName, inputData);
}

function logToGoogleSheets(projectName, inputData) {
    fetch(googleScriptURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'projectName': projectName, // Gửi giá trị projectName
            'inputData': inputData // Gửi giá trị inputData
        })
    })
    .then(response => {
        if (response.ok) {
            console.log('Data logged to Google Sheets:', response);
        } else {
            console.error('Error sending data to Google Sheets:', response);
        }
    })
    .catch(error => {
        console.error('Error sending data to Google Sheets:', error);
    });
}

// Hàm parse chuỗi đầu vào
function parseInputData(inputData) {
    const dataDict = {};
    const items = inputData.split(',');

    items.forEach(item => {
        const parts = item.split(':');
        if (parts.length === 2) {
            const label = parts[0].trim();
            const quantity = parseInt(parts[1].trim(), 10);
            if (!isNaN(quantity)) { // Kiểm tra nếu quantity hợp lệ
                dataDict[label] = quantity;
            } else {
                console.error(`Invalid quantity for label ${label}: ${parts[1].trim()}`);
            }
        }
    });

    return dataDict;
}

function getVietnameseLabel(englishLabel) {
    return labelMapping[englishLabel] || "N/A"; // Sử dụng labelMapping đã tải
}

function getQuantityClass(quantity) {
    if (quantity < 100) return 'red';
    if (quantity < 200) return 'yellow';
    return '';
}

function saveToExcel() {
    const table = document.getElementById('dataTable');
    const workbook = XLSX.utils.table_to_book(table, { sheet: "Data" });
    XLSX.writeFile(workbook, 'data_analysis.xlsx');
}

function printData() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print</title></head><body>');
    printWindow.document.write(document.getElementById('dataTable').outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}
