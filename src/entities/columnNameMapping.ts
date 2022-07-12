const columnNameMapping = {
    MachineID: '機號',
    MachineName: '機名',
    MachineType: '機種',
    online: 'Online',
    lastConnectionTime: 'Last Connection Time',
    temperature: '溫度',
    MachineStatus: '狀態',
    message: 'Message',
    Loc: '場地名稱',
    TotalQty: '總數量',
    TotalAmt: '總金額',
    ProductID: '產品ID',
    ProductName: '產品名稱',
    Amount: '金額',
    Time: '交易時間',
    Payment: '支付方式',
    StockCode: '產品編號',
    StockName: '產品名稱',
    Ratio: '總存貨比例',
    Ratio2: '存貨比例',
    Remain: '剩餘存貨數量',
    Capacity: '最大總存貨數量',
    skuRatio: 'SKU 產品項目剩餘比例',
}


export const getColumnOptions = (tableName: string) => {
    switch (tableName) {
        case 'ms_summary':
            return [
                { data: 'MachineID', title: columnNameMapping['MachineID'] },
                { data: 'Loc', title: columnNameMapping['Loc'] },
                { data: 'TotalQty', title: columnNameMapping['TotalQty'] },
                { data: 'TotalAmt', title: columnNameMapping['TotalAmt'] },
            ]
        case 'ms_detail':
            return [
                { data: 'MachineID', title: columnNameMapping['MachineID'] },
                { data: 'Loc', title: columnNameMapping['Loc'] },
                { data: 'ProductID', title: columnNameMapping['ProductID'] },
                { data: 'ProductName', title: columnNameMapping['ProductName'] },
                { data: 'Amount', title: columnNameMapping['Amount'] },
                { data: 'Time', title: columnNameMapping['Time'] },
                { data: 'Payment', title: columnNameMapping['Payment'] },
            ]
        case 'iv_summary':
            return [
                { data: 'MachineID', title: columnNameMapping['MachineID'] },
                { data: 'Loc', title: columnNameMapping['Loc'] },
                { data: 'Ratio', title: columnNameMapping['Ratio'] },
                { data: 'Remain', title: columnNameMapping['Remain'] },
                { data: 'Capacity', title: columnNameMapping['Capacity'] },
                { data: 'skuRatio', title: columnNameMapping['skuRatio'] },
            ]
        case 'iv_detail': 
            return [
                { data: 'MachineID', title: columnNameMapping['MachineID'] },
                { data: 'Loc', title: columnNameMapping['Loc'] },
                { data: 'StockCode', title: columnNameMapping['StockCode'] },
                { data: 'StockName', title: columnNameMapping['StockName'] },
                { data: 'Ratio', title: columnNameMapping['Ratio2'] },
                { data: 'Remain', title: columnNameMapping['Remain'] },
                { data: 'Capacity', title: columnNameMapping['Capacity'] },
            ]
        default:
            return []
    }
}