let labelMapping = {};

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
    const inputData = document.getElementById('inputData').value;
    const parsedData = parseInputData(inputData);
    const tableBody = document.querySelector('#dataTable tbody');
    tableBody.innerHTML = '';

    const sortedEntries = Object.entries(parsedData).sort((a, b) => a[1] - b[1]);

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
}

function parseInputData(inputData) {
    const dataDict = {};
    const items = inputData.split(',');

    items.forEach(item => {
        const parts = item.split(':');
        if (parts.length === 2) {
            const label = parts[0].trim();
            const quantity = parseInt(parts[1].trim(), 10);
            dataDict[label] = quantity;
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
