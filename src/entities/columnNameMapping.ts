const columnNameMapping = {
    MachineID: '機號',
    MachineName: '機名',
    MachineType: '機種',
    isOnline: '連線狀態',
    lastConnectionTime: '最後連線時間',
    Temperature: '溫度',
    MachineStatus: '狀態',
    Message: '訊息',
    Detail: '詳情',
    Loc: '場地名稱',
    TotalQty: '總數量',
    TotalAmt: '總金額',
    ProductID: '產品編號',
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
    isActive: '使用中',
    disable: '暫停',
    clearError: '清除錯誤',
    refreshChannel: '更新貨道',
    hideInterface: '隱藏 (介面)',
    hideSoldOut: '隱藏 (售罄)',
    UnitPrice: '單價',
    Price: '售價',
    LastUpdate: '最後更新',
    skuCode: 'SKU',
    Name: '名稱',
    NameEng: '名稱 (英)',
    Unit: '單位',
    Brand: '品牌',
    chID: '貨道',
    chCap: '容量',
    chRemain: '現存',
    chStatus: '狀態',
    chExpireDate: '有效期',
    chRemindDate: '提示日期',
    chCode: 'Code',
    MergedChannelID: '已合併',
    MachineDelivery: '售賣機出貨',
    voucherCode: 'QR Code',
    voucherType: '類型',
    createDate: '建立日期',
    vhValid: '有效',
    vhBalance: '可用次數',
    vhUsed: '已使用',
    vhSync: '已同步',
    vhDateFrom: '有效日期 (由)',
    vhDateTo: '有效日期 (至)',
    campaignName: '活動名稱',
    vhValue: '餘額/SKU',
    vhUsedTime: '使用時間'
}


export const getColumnOptions = (tableName: string) => {
    switch (tableName) {
        case 'owners':
            return [
                { data: 'id', title: '帳號名稱'},
                { data: 'loginName', title: '登入名稱'},
                { data: 'name', title: '客戶名稱 (中)'},
                { data: 'nameEng', title: '客戶名稱 (英)'},
                { data: 'userRole', title: '類別'},
                { data: 'isActive', title: '使用中'},
                { data: 'expireDate', title: '有效至'},
                { data: 'lastUpdate', title: '最後更新'},
            ]
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
        case 'machine_list': 
            return [
                { data: 'MachineID', title: columnNameMapping['MachineID'] },
                { data: 'MachineName', title: columnNameMapping['MachineName'] },
                { data: 'MachineType', title: columnNameMapping['MachineType'] },
                { data: 'isOnline', title: columnNameMapping['isOnline'] },
                { data: 'lastConnectionTime', title: columnNameMapping['lastConnectionTime'] },
                { data: 'Temperature', title: columnNameMapping['Temperature'] },
                { data: 'MachineStatus', title: columnNameMapping['MachineStatus'] },
                { data: 'Message', title: columnNameMapping['Message'] }, 
                { data: 'Detail', title: '' }
            ]
        case 'machine_product': 
            return [
                { data: 'MP_ProductID', title: columnNameMapping['ProductID'] },
                { data: 'MP_Active', title: columnNameMapping['isActive'] },
                { data: 'MP_ProductName', title: columnNameMapping['ProductName'] },
                { data: 'MP_UnitPrice', title: columnNameMapping['UnitPrice'] },
                { data: 'MP_Price', title: columnNameMapping['Price'] },
                { data: 'MP_HideSoldout', title: columnNameMapping['hideSoldOut'] },
                { data: 'MP_Lastupdate', title: columnNameMapping['LastUpdate'] },
                { data: 'btn', title: '' }
            ]
        case 'machine_stock':
            return [
                { data: 'MS_StockCode', title: columnNameMapping['skuCode'] },
                { data: 'MS_Name', title: columnNameMapping['Name'] },
                { data: 'MS_Unit', title: columnNameMapping['Unit'] },
                { data: 'MS_UnitPrice', title: columnNameMapping['UnitPrice'] },
                { data: 'MS_Price', title: columnNameMapping['Price'] },
                { data: 'btn', title: '' }
            ]    
        case 'machine_channel': 
            return [
                { data: 'MC_ChannelID', title: columnNameMapping['chID'] },
                { data: 'MC_Active', title: columnNameMapping['isActive'] },
                { data: 'StockName', title: columnNameMapping['Name'] },
                { data: 'MC_Capacity', title: columnNameMapping['chCap'] },
                { data: 'MC_Balance', title: columnNameMapping['chRemain'] },
                { data: 'statusText', title: columnNameMapping['chStatus'] },
                { data: 'MC_ExpiryDate', title: columnNameMapping['chExpireDate'] },
                { data: 'MC_Status', title: columnNameMapping['chCode'] },
                { data: 'btn', title: '' }
            ]
        case 'machine_channel_drink': 
            return [
                { data: 'MCD_ChannelID', title: columnNameMapping['chID'] },
                { data: 'MCD_Active', title: columnNameMapping['isActive'] },
                { data: 'StockName', title: columnNameMapping['Name'] },
                { data: 'MCD_Capacity', title: columnNameMapping['chCap'] },
                { data: 'MCD_Remain', title: columnNameMapping['chRemain'] },
                { data: 'MCD_Unit', title: columnNameMapping['Unit'] },
                { data: 'MCD_StockCode', title: columnNameMapping['skuCode'] },
                { data: 'MCD_Status', title: columnNameMapping['chStatus'] },
                { data: 'MCD_ChannelMode', title: 'Mode' },
                { data: 'MCD_ExpiryDate', title: columnNameMapping['chExpireDate'] },
                { data: 'MCD_StatusCode', title: columnNameMapping['chCode'] },
                { data: 'btn', title: '' }
            ]
        case 'voucher':
        case 'voucher/list':
            return [
                { data: 'chkbox', title: ''},
                { data: 'MV_MachineID', title: columnNameMapping['MachineID'] },
                { data: 'MV_VoucherCode', title: columnNameMapping['voucherCode'] },
                { data: 'MV_CreateDate', title: columnNameMapping['createDate'] },
                { data: 'MV_VoucherType', title: columnNameMapping['voucherType'] },
                { data: 'voucherValue', title: columnNameMapping['vhValue'] },
                { data: 'MV_Valid', title: columnNameMapping['vhValid'] },
                { data: 'MV_Balance', title: columnNameMapping['vhBalance'] },
                { data: 'MV_Used', title: columnNameMapping['vhUsed'] },
                { data: 'MV_DateFrom', title: columnNameMapping['vhDateFrom'] },
                { data: 'MV_DateTo', title: columnNameMapping['vhDateTo'] },
                { data: 'MV_Sync', title: columnNameMapping['vhSync'] },
                { data: 'btn', title: '' },
            ]
        case 'campaign':
            return [
                { data: 'RC_Name', title: columnNameMapping['Name'] },
                { data: 'RC_NameEng', title: columnNameMapping['NameEng'] },
                { data: 'RC_DateFrom', title: columnNameMapping['vhDateFrom'] },
                { data: 'RC_DateTo', title: columnNameMapping['vhDateTo'] },
                { data: 'RC_CreateDate', title: columnNameMapping['createDate'] },
                { data: 'RC_LastUpdate', title: columnNameMapping['LastUpdate'] },
                { data: 'btn', title: '' }
            ]
        case 'campaign/voucher':
            return [
                { data: 'chkbox', title: ''},
                { data: 'campaignName', title: columnNameMapping['campaignName'] },
                { data: 'CV_VoucherCode', title: columnNameMapping['voucherCode'] },
                { data: 'CV_CreateDate', title: columnNameMapping['createDate'] },
                { data: 'CV_VoucherType', title: columnNameMapping['voucherType'] },
                { data: 'voucherValue', title: columnNameMapping['vhValue'] },
                { data: 'CV_Valid', title: columnNameMapping['vhValid'] },
                { data: 'CV_Balance', title: columnNameMapping['vhBalance'] },
                { data: 'CV_Used', title: columnNameMapping['vhUsed'] },
                { data: 'CV_DateFrom', title: columnNameMapping['vhDateFrom'] },
                { data: 'CV_DateTo', title: columnNameMapping['vhDateTo'] },
                { data: 'CV_UsedTime', title: columnNameMapping['vhUsedTime'] },
                { data: 'btn', title: '' }
            ]    
        default:
            return []
    }
}