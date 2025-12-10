// 试剂研发工作结构化日志系统 JavaScript

// 全局变量
let currentEditId = null;
const STORAGE_KEY = 'research_log_data';
const TEMP_FORM_KEY = 'temp_form_data';
const WORK_TYPES_KEY = 'work_types_data';
const REMINDER_KEY = 'hide_reminder';

// DOM元素 - 悬浮提醒
let floatingReminder = null;
let closeReminderBtn = null;

// DOM元素 - 初始化为null，在DOM加载后赋值
let form = null;
let dateInput = null;
let timePeriodInput = null;
let workHoursInput = null;
let saveBtn = null;
let exportBtn = null;
let importBtn = null;
let importBtnText = null;
let dataTableBody = null;
let manageWorkTypeBtn = null;
let exportWorkTypesBtn = null;
let importWorkTypesBtn = null;
let importWorkTypesBtnText = null;
let employeeIdInput = null;

// 撤销提示相关DOM元素
let undoNotificationContainer = null;

// 撤销功能相关常量
const COUNTDOWN_SECONDS = 3;

// 时间段选择相关DOM元素
let timePeriodDisplay = null;
let selectedTimePeriodText = null;
let startTimeHidden = null;
let endTimeHidden = null;
let timeRangeModal = null;
let startHourSelect = null;
let startMinuteSelect = null;
let endHourSelect = null;
let endMinuteSelect = null;
let timeRangeError = null;

// 工作类型相关DOM元素 - 初始化为null，在DOM加载后赋值
let workTypeDisplay = null;
let selectedWorkTypeText = null;
let workTypeHidden = null;
let workTypeModal = null;
let workTypeList = null;
let workTypeSearchInput = null;
let workTypeManagerModal = null;
let workTypeManagerList = null;
let newWorkTypeInput = null;

// 默认工作类型
const DEFAULT_WORK_TYPES = [
    '文献查阅',
    '专利查阅',
    '竞品分析',
    '实验方案设计',
    '实验操作',
    '数据处理',
    '数据分析',
    '数据回顾',
    '运输稳定性验证',
    '稳定性观察',
    '撰写实验记录',
    '技术评审准备',
    '技术评审',
    '工艺验证',
    '国内注册资料编写',
    'CE注册资料编写',
    '临床评价',
    '临床实验',
    '上市后产品风险评估、上报监管',
    '实验动物使用许可申报、年审及换证',
    '产品检验',
    '现场巡检',
    '记录审核',
    '放行审核',
    '产品放行',
    '变更控制',
    '返工审批',
    '质量问题反馈及解决',
    '反馈处理',
    '检验技术控制',
    '体系审核 (内审/外审)',
    '体系整改',
    '日常体系运行检查',
    '标准输出',
    '风险管理',
    '评审后闭环',
    '设备验证',
    '环境验证',
    '计量管理',
    '供应商现场审计',
    '供应商准入/考评',
    '质量协议签订',
    '供应商质量控制及提升',
    '标准及物料承认',
    '撰写项目文档（DMR、DHF）',
    '文件编制',
    '文档控制 (文控事项)',
    '记录整理',
    '文件审批',
    '公文查阅',
    '回复公文',
    '处理PLM流程',
    '原料采购',
    '原料转库',
    '原料领用',
    '成品领用',
    '系统维护',
    '参加会议',
    '内部讨论',
    '撰写会议纪要',
    '医院出差',
    '上市后技术支持',
    '参加培训',
    '组织培训',
    '制定工作计划',
    '复盘总结',
    '消防安全',
    '制度查询',
];

// 工作类型相关函数

// 初始化工作类型
function initWorkTypes() {
    // 加载工作类型
    const workTypes = loadWorkTypes();
    
    // 渲染工作类型列表
    renderWorkTypeList(workTypes);
    renderWorkTypeManagerList(workTypes);
}

// 加载工作类型
function loadWorkTypes() {
    const workTypes = localStorage.getItem(WORK_TYPES_KEY);
    if (workTypes) {
        return JSON.parse(workTypes);
    } else {
        // 保存默认工作类型
        saveWorkTypes(DEFAULT_WORK_TYPES);
        return DEFAULT_WORK_TYPES;
    }
}

// 保存工作类型
function saveWorkTypes(workTypes) {
    localStorage.setItem(WORK_TYPES_KEY, JSON.stringify(workTypes));
}

// 渲染工作类型列表
function renderWorkTypeList(workTypes, searchTerm = '') {
    // 清空列表
    workTypeList.innerHTML = '';
    
    // 按字母顺序排序
    const sortedWorkTypes = [...workTypes].sort();
    
    // 过滤工作类型
    const filteredWorkTypes = sortedWorkTypes.filter(workType => 
        workType.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // 渲染每个工作类型
    filteredWorkTypes.forEach(workType => {
        const workTypeItem = document.createElement('div');
        workTypeItem.className = 'work-type-item';
        workTypeItem.textContent = workType;
        workTypeItem.addEventListener('click', () => {
            selectWorkType(workType);
        });
        workTypeList.appendChild(workTypeItem);
    });
}

// 渲染工作类型管理列表
function renderWorkTypeManagerList(workTypes) {
    // 清空列表
    workTypeManagerList.innerHTML = '';
    
    // 按字母顺序排序
    const sortedWorkTypes = [...workTypes].sort();
    
    // 渲染每个工作类型
    sortedWorkTypes.forEach(workType => {
        const workTypeManagerItem = document.createElement('div');
        workTypeManagerItem.className = 'work-type-manager-item';
        workTypeManagerItem.innerHTML = `
            <span class="work-type-name">${workType}</span>
            <div class="manager-actions">
                <button type="button" class="manager-action-btn delete-manager-btn" onclick="deleteWorkType('${workType}')">删除</button>
            </div>
        `;
        workTypeManagerList.appendChild(workTypeManagerItem);
    });
}

// 选择工作类型
function selectWorkType(workType) {
    selectedWorkTypeText.textContent = workType;
    workTypeHidden.value = workType;
    closeWorkTypeModal();
    // 保存临时表单数据
    saveTempFormData();
}

// 打开工作类型选择弹窗
function openWorkTypeModal() {
    // 清空搜索框
    workTypeSearchInput.value = '';
    // 重新渲染所有工作类型
    renderWorkTypeList(loadWorkTypes());
    // 打开弹窗
    workTypeModal.classList.add('show');
}

// 处理工作类型搜索
function handleWorkTypeSearch() {
    const searchTerm = workTypeSearchInput.value;
    const workTypes = loadWorkTypes();
    renderWorkTypeList(workTypes, searchTerm);
}

// 关闭工作类型选择弹窗
function closeWorkTypeModal() {
    workTypeModal.classList.remove('show');
}

// 打开工作类型管理弹窗
function openWorkTypeManager() {
    // 清空输入框
    newWorkTypeInput.value = '';
    workTypeManagerModal.classList.add('show');
}

// 关闭工作类型管理弹窗
function closeWorkTypeManager() {
    workTypeManagerModal.classList.remove('show');
    // 取消所有编辑状态
    cancelAllEdits();
}

// 添加工作类型
function addWorkType() {
    const newWorkType = newWorkTypeInput.value.trim();
    if (!newWorkType) {
        showMessage('请输入工作类型名称！', 'error');
        return;
    }
    
    // 加载现有工作类型
    const workTypes = loadWorkTypes();
    
    // 检查是否已存在
    if (workTypes.includes(newWorkType)) {
        showMessage('该工作类型已存在！', 'error');
        return;
    }
    
    // 添加新工作类型
    workTypes.push(newWorkType);
    
    // 保存并重新渲染
    saveWorkTypes(workTypes);
    renderWorkTypeList(workTypes);
    renderWorkTypeManagerList(workTypes);
    
    // 清空输入框
    newWorkTypeInput.value = '';
    
    showMessage('工作类型添加成功！', 'success');
}

// 开始编辑工作类型
function startEditWorkType(button, workType) {
    // 取消其他编辑
    cancelAllEdits();
    
    const workTypeManagerItem = button.closest('.work-type-manager-item');
    const workTypeNameSpan = workTypeManagerItem.querySelector('.work-type-name');
    const editInput = workTypeManagerItem.querySelector('.edit-input');
    const managerActions = workTypeManagerItem.querySelector('.manager-actions');
    
    // 切换显示状态
    workTypeNameSpan.classList.add('hide');
    editInput.classList.add('show');
    
    // 聚焦到输入框
    editInput.focus();
    editInput.select();
    
    // 替换操作按钮
    managerActions.innerHTML = `
        <button type="button" class="manager-action-btn save-btn" onclick="saveEditWorkType(this, '${workType}')">保存</button>
        <button type="button" class="manager-action-btn cancel-btn" onclick="cancelEditWorkType(this, '${workType}')">取消</button>
    `;
}

// 保存编辑的工作类型
function saveEditWorkType(button, oldWorkType) {
    const workTypeManagerItem = button.closest('.work-type-manager-item');
    const editInput = workTypeManagerItem.querySelector('.edit-input');
    const newWorkType = editInput.value.trim();
    
    if (!newWorkType) {
        showMessage('请输入工作类型名称！', 'error');
        return;
    }
    
    // 加载现有工作类型
    const workTypes = loadWorkTypes();
    
    // 检查是否已存在（排除当前编辑的）
    if (workTypes.includes(newWorkType) && newWorkType !== oldWorkType) {
        showMessage('该工作类型已存在！', 'error');
        return;
    }
    
    // 更新工作类型
    const index = workTypes.indexOf(oldWorkType);
    if (index !== -1) {
        workTypes[index] = newWorkType;
        
        // 保存并重新渲染
        saveWorkTypes(workTypes);
        renderWorkTypeList(workTypes);
        renderWorkTypeManagerList(workTypes);
        
        // 如果当前选中的是被修改的工作类型，更新显示
        if (workTypeHidden.value === oldWorkType) {
            selectedWorkTypeText.textContent = newWorkType;
            workTypeHidden.value = newWorkType;
            saveTempFormData();
        }
        
        showMessage('工作类型更新成功！', 'success');
    }
}

// 取消编辑工作类型
function cancelEditWorkType(button, oldWorkType) {
    const workTypeManagerItem = button.closest('.work-type-manager-item');
    const workTypeNameSpan = workTypeManagerItem.querySelector('.work-type-name');
    const editInput = workTypeManagerItem.querySelector('.edit-input');
    const managerActions = workTypeManagerItem.querySelector('.manager-actions');
    
    // 恢复显示状态
    workTypeNameSpan.classList.remove('hide');
    editInput.classList.remove('show');
    
    // 恢复操作按钮
    managerActions.innerHTML = `
        <button type="button" class="manager-action-btn edit-manager-btn" onclick="startEditWorkType(this, '${oldWorkType}')">编辑</button>
        <button type="button" class="manager-action-btn delete-manager-btn" onclick="deleteWorkType('${oldWorkType}')">删除</button>
    `;
}

// 取消所有编辑
function cancelAllEdits() {
    const allEditInputs = document.querySelectorAll('.work-type-manager-item .edit-input');
    allEditInputs.forEach(editInput => {
        const workTypeManagerItem = editInput.closest('.work-type-manager-item');
        const workTypeNameSpan = workTypeManagerItem.querySelector('.work-type-name');
        const managerActions = workTypeManagerItem.querySelector('.manager-actions');
        const oldWorkType = workTypeNameSpan.textContent;
        
        // 恢复显示状态
        workTypeNameSpan.classList.remove('hide');
        editInput.classList.remove('show');
        
        // 恢复操作按钮
        managerActions.innerHTML = `
            <button type="button" class="manager-action-btn edit-manager-btn" onclick="startEditWorkType(this, '${oldWorkType}')">编辑</button>
            <button type="button" class="manager-action-btn delete-manager-btn" onclick="deleteWorkType('${oldWorkType}')">删除</button>
        `;
    });
}

// 删除工作类型
function deleteWorkType(workType) {
    // 创建撤销提示
    createUndoNotification(
        `工作类型 "${workType}" 将在5秒后删除`,
        () => {
            // 执行删除操作时获取最新数据
            const latestWorkTypes = loadWorkTypes();
            // 执行删除操作
            const newWorkTypes = latestWorkTypes.filter(type => type !== workType);
            
            // 如果删除后没有工作类型，添加默认类型
            if (newWorkTypes.length === 0) {
                newWorkTypes.push('其他');
            }
            
            // 保存并重新渲染
            saveWorkTypes(newWorkTypes);
            renderWorkTypeList(newWorkTypes);
            renderWorkTypeManagerList(newWorkTypes);
            
            // 如果当前选中的是被删除的工作类型，清空选择
            if (workTypeHidden.value === workType) {
                selectedWorkTypeText.textContent = '请选择工作类型';
                workTypeHidden.value = '';
                saveTempFormData();
            }
            
            showMessage('工作类型删除成功！', 'success');
        },
        () => {
            // 撤销操作：什么都不做，因为删除还没有执行
            showMessage('删除已撤销！', 'info');
        }
    );
}

// 初始化应用
function init() {
    // 获取DOM元素
    form = document.getElementById('researchLogForm');
    dateInput = document.getElementById('date');
    timePeriodInput = document.getElementById('timePeriod');
    workHoursInput = document.getElementById('workHours');
    saveBtn = document.getElementById('saveBtn');
    exportBtn = document.getElementById('exportBtn');
    importBtn = document.getElementById('importBtn');
    importBtnText = document.getElementById('importBtnText');
    dataTableBody = document.getElementById('dataTableBody');
    employeeIdInput = document.getElementById('employeeId');
    
    // 获取悬浮提醒DOM元素
    floatingReminder = document.getElementById('floatingReminder');
    closeReminderBtn = document.getElementById('closeReminder');
    
    // 获取工作类型相关DOM元素
    workTypeDisplay = document.getElementById('workTypeDisplay');
    selectedWorkTypeText = document.getElementById('selectedWorkTypeText');
    workTypeHidden = document.getElementById('workType');
    workTypeModal = document.getElementById('workTypeModal');
    workTypeList = document.getElementById('workTypeList');
    workTypeSearchInput = document.getElementById('workTypeSearch');
    workTypeManagerModal = document.getElementById('workTypeManagerModal');
    workTypeManagerList = document.getElementById('workTypeManagerList');
    newWorkTypeInput = document.getElementById('newWorkType');
    manageWorkTypeBtn = document.getElementById('manageWorkTypeBtn');
    exportWorkTypesBtn = document.getElementById('exportWorkTypesBtn');
    importWorkTypesBtn = document.getElementById('importWorkTypesBtn');
    importWorkTypesBtnText = document.getElementById('importWorkTypesBtnText');
    
    // 添加工作类型相关事件监听器
    workTypeDisplay.addEventListener('click', openWorkTypeModal);
    manageWorkTypeBtn.addEventListener('click', openWorkTypeManager);
    exportWorkTypesBtn.addEventListener('click', exportWorkTypes);
    importWorkTypesBtn.addEventListener('change', handleImportWorkTypes);
    importWorkTypesBtnText.addEventListener('click', () => importWorkTypesBtn.click());
    
    // 添加搜索事件监听器
    workTypeSearchInput.addEventListener('input', handleWorkTypeSearch);
    
    // 获取时间段选择相关DOM元素
    timePeriodDisplay = document.getElementById('timePeriodDisplay');
    selectedTimePeriodText = document.getElementById('selectedTimePeriodText');
    timePeriodInput = document.getElementById('timePeriod');
    startTimeHidden = document.getElementById('startTime');
    endTimeHidden = document.getElementById('endTime');
    timeRangeModal = document.getElementById('timeRangeModal');
    startHourSelect = document.getElementById('startHour');
    startMinuteSelect = document.getElementById('startMinute');
    endHourSelect = document.getElementById('endHour');
    endMinuteSelect = document.getElementById('endMinute');
    timeRangeError = document.getElementById('timeRangeError');
    
    // 添加时间段选择相关事件监听器
    timePeriodDisplay.addEventListener('click', openTimeRangeModal);
    
    // 初始化时间选择器选项
    initTimeSelectOptions();
    
    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    // 添加事件监听器
    timePeriodInput.addEventListener('input', calculateWorkHours);
    form.addEventListener('input', saveTempFormData);
    saveBtn.addEventListener('click', saveData);
    exportBtn.addEventListener('click', exportToExcel);
    importBtn.addEventListener('change', handleExcelImport);
    importBtnText.addEventListener('click', () => importBtn.click());
    closeReminderBtn.addEventListener('click', closeFloatingReminder);
    
    // 获取撤销提示容器
    undoNotificationContainer = document.getElementById('undoNotificationContainer');
    
    // 初始化工作类型
    initWorkTypes();
    
    // 加载保存的数据
    loadData();
    
    // 加载临时表单数据
    loadTempFormData();
    
    // 自动计算初始工时
    calculateWorkHours();
    
    // 初始化悬浮提醒
    initFloatingReminder();
    
    // 添加弹窗外部点击关闭事件
    window.addEventListener('click', function(event) {
        if (event.target === workTypeModal) {
            closeWorkTypeModal();
        }
        if (event.target === workTypeManagerModal) {
            closeWorkTypeManager();
        }
    });
}

// 计算工时
function calculateWorkHours() {
    const timePeriod = timePeriodInput.value;
    const match = timePeriod.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
    
    if (match) {
        const [, startHour, startMinute, endHour, endMinute] = match;
        const startTime = new Date();
        startTime.setHours(parseInt(startHour), parseInt(startMinute), 0);
        
        const endTime = new Date();
        endTime.setHours(parseInt(endHour), parseInt(endMinute), 0);
        
        // 处理跨天情况
        if (endTime < startTime) {
            endTime.setDate(endTime.getDate() + 1);
        }
        
        const hours = (endTime - startTime) / (1000 * 60 * 60);
        workHoursInput.value = hours.toFixed(2);
    } else {
        workHoursInput.value = '';
    }
}

// 保存临时表单数据到localStorage
function saveTempFormData() {
    const formData = {
        date: dateInput.value,
        engineer: form.elements.engineer.value,
        timePeriod: form.elements.timePeriod.value,
        projectId: form.elements.projectId.value,
        workType: workTypeHidden.value,
        feedback: form.elements.feedback.value
    };
    localStorage.setItem(TEMP_FORM_KEY, JSON.stringify(formData));
}

// 加载临时表单数据
function loadTempFormData() {
    const tempData = localStorage.getItem(TEMP_FORM_KEY);
    if (tempData) {
        const formData = JSON.parse(tempData);
        dateInput.value = formData.date || new Date().toISOString().split('T')[0];
        form.elements.engineer.value = formData.engineer || '';
        form.elements.employeeId.value = formData.employeeId || '';
        form.elements.timePeriod.value = formData.timePeriod || '';
        form.elements.projectId.value = formData.projectId || '';
        
        // 更新工作类型显示
        if (formData.workType) {
            selectedWorkTypeText.textContent = formData.workType;
            workTypeHidden.value = formData.workType;
        } else {
            selectedWorkTypeText.textContent = '请选择工作类型';
            workTypeHidden.value = '';
        }
        
        form.elements.feedback.value = formData.feedback || '';
        
        // 重新计算工时
        calculateWorkHours();
    }
}

// 从localStorage加载数据
function loadData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// 保存数据到localStorage
function saveDataToStorage(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 保存表单数据
function saveData() {
    // 验证表单
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // 获取表单数据
    const formData = {
        id: currentEditId || generateId(),
        date: form.elements.date.value,
        engineer: form.elements.engineer.value,
        employeeId: form.elements.employeeId.value,
        timePeriod: form.elements.timePeriod.value,
        projectId: form.elements.projectId.value,
        workType: workTypeHidden.value,
        feedback: form.elements.feedback.value,
        workHours: parseFloat(form.elements.workHours.value) || 0
    };
    
    // 获取现有数据
    const data = loadData();
    
    if (currentEditId) {
        // 更新现有记录
        const index = data.findIndex(item => item.id === currentEditId);
        if (index !== -1) {
            data[index] = formData;
            showMessage('记录更新成功！', 'success');
        }
        currentEditId = null;
        saveBtn.textContent = '保存数据';
    } else {
        // 添加新记录
        data.push(formData);
        showMessage('记录保存成功！', 'success');
    }
    
    // 保存到localStorage
    saveDataToStorage(data);
    
    // 更新表格
    renderTable(data);
    
    // 重置表单
    resetForm();
    
    // 清除临时表单数据
    localStorage.removeItem(TEMP_FORM_KEY);
}

// 生成唯一ID
function generateId() {
    return 'log_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

// 重置表单
function resetForm() {
    form.reset();
    // 重置日期为今天
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    // 重置工作类型
    selectedWorkTypeText.textContent = '请选择工作类型';
    workTypeHidden.value = '';
    currentEditId = null;
    saveBtn.textContent = '保存数据';
    calculateWorkHours();
}

// 添加新记录（保持当前表单数据）
function addNewRecord() {
    // 验证当前表单
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // 保存当前记录
    saveData();
    
    // 不清空表单，允许继续添加
    // 只重置部分字段
    form.elements.timePeriod.value = '';
    form.elements.projectId.value = '';
    // 重置工作类型
    selectedWorkTypeText.textContent = '请选择工作类型';
    workTypeHidden.value = '';
    form.elements.feedback.value = '';
    workHoursInput.value = '';
    
    showMessage('可以继续添加新记录！', 'info');
}

// 渲染数据表格
function renderTable(data) {
    // 清空表格
    dataTableBody.innerHTML = '';
    
    // 如果没有数据
    if (data.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="9" style="text-align: center; padding: 20px; color: #777;">暂无数据</td>';
        dataTableBody.appendChild(row);
        return;
    }
    
    // 按日期降序排序
    const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 渲染每行数据
    sortedData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.date}</td>
            <td>${item.engineer}</td>
            <td>${item.employeeId || '-'}</td>
            <td>${item.timePeriod}</td>
            <td>${item.projectId || '-'}</td>
            <td>${item.workType}</td>
            <td>${item.feedback || '-'}</td>
            <td>${item.workHours.toFixed(2)}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editRecord('${item.id}')">编辑</button>
                <button class="action-btn delete-btn" onclick="deleteRecord('${item.id}')">删除</button>
            </td>
        `;
        dataTableBody.appendChild(row);
    });
}

// 编辑记录
function editRecord(id) {
    const data = loadData();
    const record = data.find(item => item.id === id);
    
    if (record) {
        // 填充表单
        form.elements.date.value = record.date;
        form.elements.engineer.value = record.engineer;
        form.elements.employeeId.value = record.employeeId || '';
        form.elements.timePeriod.value = record.timePeriod;
        form.elements.projectId.value = record.projectId;
        
        // 更新工作类型显示
        selectedWorkTypeText.textContent = record.workType;
        workTypeHidden.value = record.workType;
        
        form.elements.feedback.value = record.feedback;
        workHoursInput.value = record.workHours.toFixed(2);
        
        // 设置当前编辑ID
        currentEditId = id;
        saveBtn.textContent = '更新数据';
        
        // 滚动到表单顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        showMessage('正在编辑记录，点击更新数据保存更改', 'info');
    }
}

// 删除记录
function deleteRecord(id) {
    const data = loadData();
    const recordToDelete = data.find(item => item.id === id);
    
    if (!recordToDelete) return;
    
    // 保存要删除的记录信息，用于显示消息
    const recordInfo = {
        date: recordToDelete.date,
        engineer: recordToDelete.engineer
    };
    
    // 创建撤销提示
    createUndoNotification(
        `记录 "${recordInfo.date} - ${recordInfo.engineer}" 将在5秒后删除`,
        () => {
            // 执行删除操作时获取最新数据
            const latestData = loadData();
            const newData = latestData.filter(item => item.id !== id);
            saveDataToStorage(newData);
            renderTable(newData);
            showMessage('记录删除成功！', 'success');
        },
        () => {
            // 撤销操作：什么都不做，因为删除还没有执行
            showMessage('删除已撤销！', 'info');
        }
    );
}

// 导出到Excel
function exportToExcel() {
    const data = loadData();
    
    if (data.length === 0) {
        showMessage('没有数据可以导出！', 'error');
        return;
    }
    
    // 准备导出数据
    const exportData = data.map(item => ({
        '日期': item.date,
        '工程师/技术员': item.engineer,
        '工号': item.employeeId || '',
        '时间段': item.timePeriod,
        '项目/任务编号': item.projectId || '',
        '工作类型': item.workType,
        '问题反馈（记录异常情况、出现的问题等）': item.feedback || '',
        '工时统计': item.workHours
    }));
    
    try {
        // 创建工作簿
        const wb = XLSX.utils.book_new();
        
        // 创建工作表
        const ws = XLSX.utils.json_to_sheet(exportData, {
            header: ['日期', '工程师/技术员', '工号', '时间段', '项目/任务编号', '工作类型', '问题反馈（记录异常情况、出现的问题等）', '工时统计']
        });
        
        // 设置列宽
        const colWidths = [
            { wch: 12 }, // 日期
            { wch: 15 }, // 工程师/技术员
            { wch: 10 }, // 工号
            { wch: 15 }, // 时间段
            { wch: 15 }, // 项目/任务编号
            { wch: 12 }, // 工作类型
            { wch: 40 }, // 问题反馈
            { wch: 10 }  // 工时统计
        ];
        ws['!cols'] = colWidths;
        
        // 将工作表添加到工作簿
        XLSX.utils.book_append_sheet(wb, ws, '研发日志');
        
        // 导出文件
        const fileName = `试剂研发工作日志_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        showMessage('Excel导出成功！', 'success');
    } catch (error) {
        console.error('导出失败:', error);
        showMessage('Excel导出失败，请检查浏览器兼容性！', 'error');
    }
}

// 显示消息
function showMessage(text, type = 'info') {
    // 移除现有消息
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 创建消息元素
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    // 添加到表单上方
    form.parentElement.insertBefore(message, form);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (message.parentElement) {
            message.remove();
        }
    }, 3000);
}

// 初始渲染表格
function initialRender() {
    const data = loadData();
    renderTable(data);
}

// 处理Excel导入
function handleExcelImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查文件类型
    if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        showMessage('请选择有效的Excel文件（.xlsx格式）！', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            // 解析Excel文件
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // 获取第一个工作表
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // 将工作表转换为JSON格式
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            // 处理导入的数据
            processImportedData(jsonData);
            
            showMessage(`成功导入${jsonData.length}条记录！`, 'success');
        } catch (error) {
            console.error('Excel导入失败:', error);
            showMessage('Excel导入失败，请检查文件格式是否正确！', 'error');
        }
    };
    
    reader.onerror = function() {
        showMessage('文件读取失败！', 'error');
    };
    
    reader.readAsArrayBuffer(file);
    
    // 清空文件输入，以便可以重新选择同一文件
    event.target.value = '';
}

// 处理导入的数据
function processImportedData(importedData) {
    // 转换导入的数据格式
    const formattedData = importedData.map(item => ({
        id: generateId(), // 生成新的唯一ID
        date: item['日期'],
        engineer: item['工程师/技术员'],
        employeeId: item['工号'] || '',
        timePeriod: item['时间段'],
        projectId: item['项目/任务编号'] || '',
        workType: item['工作类型'],
        feedback: item['问题反馈（记录异常情况、出现的问题等）'] || '',
        workHours: parseFloat(item['工时统计']) || 0
    }));
    
    // 替换现有数据（不清空现有数据，直接使用导入的数据）
    // 保存到localStorage
    saveDataToStorage(formattedData);
    
    // 更新表格显示
    renderTable(formattedData);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    init();
    initialRender();
});

// 时间段选择相关函数

// 初始化时间选择器选项
function initTimeSelectOptions() {
    // 生成小时选项（00-23）
    generateTimeOptions(startHourSelect, 0, 23);
    generateTimeOptions(endHourSelect, 0, 23);
    
    // 生成分钟选项（00, 15, 30, 45）
    // 为了简化选择，使用15分钟间隔
    generateTimeOptions(startMinuteSelect, 0, 59, 15);
    generateTimeOptions(endMinuteSelect, 0, 59, 15);
    
    // 设置默认值（当前时间前后1小时）
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = Math.ceil(now.getMinutes() / 15) * 15;
    
    // 开始时间默认为当前时间，结束时间默认为当前时间+1小时
    startHourSelect.value = currentHour.toString().padStart(2, '0');
    startMinuteSelect.value = currentMinute.toString().padStart(2, '0');
    
    const endHour = (currentHour + 1) % 24;
    endHourSelect.value = endHour.toString().padStart(2, '0');
    endMinuteSelect.value = currentMinute.toString().padStart(2, '0');
}

// 生成时间选项
function generateTimeOptions(selectElement, start, end, step = 1) {
    // 清空现有选项
    selectElement.innerHTML = '';
    
    for (let i = start; i <= end; i += step) {
        const value = i.toString().padStart(2, '0');
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        selectElement.appendChild(option);
    }
}

// 打开时间范围选择弹窗
function openTimeRangeModal() {
    // 清空错误信息
    timeRangeError.textContent = '';
    
    // 打开弹窗
    timeRangeModal.classList.add('show');
}

// 关闭时间范围选择弹窗
function closeTimeRangeModal() {
    timeRangeModal.classList.remove('show');
}

// 确认时间范围选择
function confirmTimeRange() {
    // 验证时间范围
    if (validateTimeRange()) {
        // 获取选择的时间
        const startHour = startHourSelect.value;
        const startMinute = startMinuteSelect.value;
        const endHour = endHourSelect.value;
        const endMinute = endMinuteSelect.value;
        
        // 格式化时间
        const startTime = `${startHour}:${startMinute}`;
        const endTime = `${endHour}:${endMinute}`;
        const timePeriod = `${startTime}-${endTime}`;
        
        // 更新显示和隐藏字段
        updateTimePeriodDisplay(startTime, endTime);
        
        // 设置隐藏字段值
        timePeriodInput.value = timePeriod;
        startTimeHidden.value = startTime;
        endTimeHidden.value = endTime;
        
        // 计算工时
        calculateWorkHours();
        
        // 保存临时表单数据
        saveTempFormData();
        
        // 关闭弹窗
        closeTimeRangeModal();
    }
}

// 验证时间范围
function validateTimeRange() {
    const startHour = parseInt(startHourSelect.value);
    const startMinute = parseInt(startMinuteSelect.value);
    const endHour = parseInt(endHourSelect.value);
    const endMinute = parseInt(endMinuteSelect.value);
    
    // 计算总分钟数
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    if (endTotalMinutes <= startTotalMinutes) {
        timeRangeError.textContent = '结束时间必须晚于开始时间！';
        return false;
    }
    
    // 清除错误信息
    timeRangeError.textContent = '';
    return true;
}

// 格式化时间
function formatTime(hour, minute) {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

// 更新时间段显示
function updateTimePeriodDisplay(startTime, endTime) {
    selectedTimePeriodText.textContent = `${startTime}-${endTime}`;
}

// 重写calculateWorkHours函数，适配新的时间段选择器
function calculateWorkHours() {
    const startTime = startTimeHidden.value;
    const endTime = endTimeHidden.value;
    
    if (startTime && endTime) {
        // 从隐藏字段获取时间
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        
        const startTimeObj = new Date();
        startTimeObj.setHours(startHour, startMinute, 0);
        
        const endTimeObj = new Date();
        endTimeObj.setHours(endHour, endMinute, 0);
        
        // 处理跨天情况
        if (endTimeObj < startTimeObj) {
            endTimeObj.setDate(endTimeObj.getDate() + 1);
        }
        
        const hours = (endTimeObj - startTimeObj) / (1000 * 60 * 60);
        workHoursInput.value = hours.toFixed(2);
    } else {
        // 兼容旧的时间格式
        const timePeriod = timePeriodInput.value;
        const match = timePeriod.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
        
        if (match) {
            const [, startHour, startMinute, endHour, endMinute] = match.map(Number);
            const startTimeObj = new Date();
            startTimeObj.setHours(startHour, startMinute, 0);
            
            const endTimeObj = new Date();
            endTimeObj.setHours(endHour, endMinute, 0);
            
            // 处理跨天情况
            if (endTimeObj < startTimeObj) {
                endTimeObj.setDate(endTimeObj.getDate() + 1);
            }
            
            const hours = (endTimeObj - startTimeObj) / (1000 * 60 * 60);
            workHoursInput.value = hours.toFixed(2);
        } else {
            workHoursInput.value = '';
        }
    }
}

// 重写saveTempFormData函数，适配新的时间段选择器
function saveTempFormData() {
    const formData = {
        date: dateInput.value,
        engineer: form.elements.engineer.value,
        employeeId: form.elements.employeeId.value,
        timePeriod: timePeriodInput.value,
        startTime: startTimeHidden.value,
        endTime: endTimeHidden.value,
        projectId: form.elements.projectId.value,
        workType: workTypeHidden.value,
        feedback: form.elements.feedback.value
    };
    localStorage.setItem(TEMP_FORM_KEY, JSON.stringify(formData));
}

// 重写loadTempFormData函数，适配新的时间段选择器
function loadTempFormData() {
    const tempData = localStorage.getItem(TEMP_FORM_KEY);
    if (tempData) {
        const formData = JSON.parse(tempData);
        dateInput.value = formData.date || new Date().toISOString().split('T')[0];
        form.elements.engineer.value = formData.engineer || '';
        form.elements.employeeId.value = formData.employeeId || '';
        form.elements.timePeriod.value = formData.timePeriod || '';
        form.elements.projectId.value = formData.projectId || '';
        
        // 更新工作类型显示
        if (formData.workType) {
            selectedWorkTypeText.textContent = formData.workType;
            workTypeHidden.value = formData.workType;
        } else {
            selectedWorkTypeText.textContent = '请选择工作类型';
            workTypeHidden.value = '';
        }
        
        // 更新时间段显示
        if (formData.startTime && formData.endTime) {
            updateTimePeriodDisplay(formData.startTime, formData.endTime);
            startTimeHidden.value = formData.startTime;
            endTimeHidden.value = formData.endTime;
        } else if (formData.timePeriod) {
            // 兼容旧格式
            const match = formData.timePeriod.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
            if (match) {
                const startTime = `${match[1]}:${match[2]}`;
                const endTime = `${match[3]}:${match[4]}`;
                updateTimePeriodDisplay(startTime, endTime);
                startTimeHidden.value = startTime;
                endTimeHidden.value = endTime;
            } else {
                selectedTimePeriodText.textContent = '请选择时间段';
                startTimeHidden.value = '';
                endTimeHidden.value = '';
            }
        } else {
            selectedTimePeriodText.textContent = '请选择时间段';
            startTimeHidden.value = '';
            endTimeHidden.value = '';
        }
        
        form.elements.feedback.value = formData.feedback || '';
        
        // 重新计算工时
        calculateWorkHours();
    }
}

// 重写resetForm函数，适配新的时间段选择器
function resetForm() {
    // 保存工程师和工号的值
    const engineerValue = form.elements.engineer.value;
    const employeeIdValue = form.elements.employeeId.value;
    
    // 重置表单
    form.reset();
    
    // 恢复工程师和工号的值
    form.elements.engineer.value = engineerValue;
    form.elements.employeeId.value = employeeIdValue;
    
    // 重置日期为今天
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    // 重置工作类型
    selectedWorkTypeText.textContent = '请选择工作类型';
    workTypeHidden.value = '';
    // 重置时间段
    selectedTimePeriodText.textContent = '请选择时间段';
    timePeriodInput.value = '';
    startTimeHidden.value = '';
    endTimeHidden.value = '';
    // 重置工时
    workHoursInput.value = '';
    // 重置其他状态
    currentEditId = null;
    saveBtn.textContent = '保存数据';
}

// 重写addNewRecord函数，适配新的时间段选择器
function addNewRecord() {
    // 验证当前表单
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // 保存当前记录
    saveData();
    
    // 不清空表单，允许继续添加
    // 只重置部分字段
    // 重置时间段
    selectedTimePeriodText.textContent = '请选择时间段';
    timePeriodInput.value = '';
    startTimeHidden.value = '';
    endTimeHidden.value = '';
    // 重置项目ID
    form.elements.projectId.value = '';
    // 重置工作类型
    selectedWorkTypeText.textContent = '请选择工作类型';
    workTypeHidden.value = '';
    // 重置反馈
    form.elements.feedback.value = '';
    // 重置工时
    workHoursInput.value = '';
    
    showMessage('可以继续添加新记录！', 'info');
}

// 重写editRecord函数，适配新的时间段选择器
function editRecord(id) {
    const data = loadData();
    const record = data.find(item => item.id === id);
    
    if (record) {
        // 填充表单
        form.elements.date.value = record.date;
        form.elements.engineer.value = record.engineer;
        form.elements.employeeId.value = record.employeeId || '';
        
        // 更新时间段显示
        const timePeriod = record.timePeriod;
        const match = timePeriod.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
        if (match) {
            const startTime = `${match[1]}:${match[2]}`;
            const endTime = `${match[3]}:${match[4]}`;
            updateTimePeriodDisplay(startTime, endTime);
            timePeriodInput.value = timePeriod;
            startTimeHidden.value = startTime;
            endTimeHidden.value = endTime;
        }
        
        form.elements.projectId.value = record.projectId;
        
        // 更新工作类型显示
        selectedWorkTypeText.textContent = record.workType;
        workTypeHidden.value = record.workType;
        
        form.elements.feedback.value = record.feedback;
        workHoursInput.value = record.workHours.toFixed(2);
        
        // 设置当前编辑ID
        currentEditId = id;
        saveBtn.textContent = '更新数据';
        
        // 滚动到表单顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        showMessage('正在编辑记录，点击更新数据保存更改', 'info');
    }
}

// 导出工作类型
function exportWorkTypes() {
    const workTypes = loadWorkTypes();
    const workTypesData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        workTypes: workTypes
    };
    
    // 创建JSON字符串
    const jsonString = JSON.stringify(workTypesData, null, 2);
    
    // 创建Blob对象
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `work_types_${new Date().toISOString().split('T')[0]}.json`;
    
    // 触发下载
    document.body.appendChild(a);
    a.click();
    
    // 清理
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage('工作类型导出成功！', 'success');
}

// 处理导入工作类型
function handleImportWorkTypes(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const workTypesData = JSON.parse(e.target.result);
            
            // 验证文件格式
            if (!workTypesData.workTypes || !Array.isArray(workTypesData.workTypes)) {
                throw new Error('无效的工作类型文件格式');
            }
            
            // 确认替换
            if (confirm('确定要导入工作类型吗？这将替换所有现有工作类型。')) {
                // 保存并重新渲染
                saveWorkTypes(workTypesData.workTypes);
                renderWorkTypeList(workTypesData.workTypes);
                renderWorkTypeManagerList(workTypesData.workTypes);
                
                showMessage('工作类型导入成功！', 'success');
            }
        } catch (error) {
            showMessage(`导入失败：${error.message}`, 'error');
        }
        
        // 清空文件输入
        event.target.value = '';
    };
    
    reader.readAsText(file);
}

// 创建撤销提示
function createUndoNotification(message, action, undoActionCallback) {
    // 创建撤销提示元素
    const undoNotification = document.createElement('div');
    undoNotification.className = 'undo-notification';
    
    // 创建消息元素
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    
    // 创建撤销按钮
    const undoBtn = document.createElement('button');
    undoBtn.className = 'undo-btn';
    undoBtn.textContent = '撤销';
    
    // 创建倒计时元素
    const countdownSpan = document.createElement('span');
    countdownSpan.className = 'undo-countdown';
    countdownSpan.textContent = COUNTDOWN_SECONDS;
    
    // 组装撤销提示
    undoNotification.appendChild(messageSpan);
    undoNotification.appendChild(undoBtn);
    undoNotification.appendChild(countdownSpan);
    
    // 添加到容器
    undoNotificationContainer.appendChild(undoNotification);
    
    let countdown = COUNTDOWN_SECONDS;
    let timer = null;
    let executed = false;
    
    // 开始倒计时
    timer = setInterval(() => {
        countdown--;
        countdownSpan.textContent = countdown;
        
        if (countdown <= 0) {
            // 执行删除操作
            clearInterval(timer);
            executed = true;
            
            // 执行操作
            action();
            
            // 淡出并移除
            fadeOutAndRemove(undoNotification);
        }
    }, 1000);
    
    // 撤销按钮点击事件
    undoBtn.addEventListener('click', () => {
        if (!executed) {
            clearInterval(timer);
            executed = true;
            
            // 执行撤销操作
            undoActionCallback();
            
            // 淡出并移除
            fadeOutAndRemove(undoNotification);
        }
    });
    
    // 淡出并移除元素
    function fadeOutAndRemove(element) {
        element.style.opacity = '0';
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 300);
    }
}

// 监听窗口关闭事件，保存临时表单数据
window.addEventListener('beforeunload', saveTempFormData);

// 初始化悬浮提醒
function initFloatingReminder() {
    // 检查是否需要显示提醒
    const hideReminder = localStorage.getItem(REMINDER_KEY);
    if (!hideReminder) {
        // 显示悬浮提醒
        floatingReminder.style.display = 'block';
    }
}

// 关闭悬浮提醒
function closeFloatingReminder() {
    // 隐藏悬浮提醒
    floatingReminder.style.display = 'none';
    
    // 记录用户选择，本次不再提醒
    localStorage.setItem(REMINDER_KEY, 'true');
}