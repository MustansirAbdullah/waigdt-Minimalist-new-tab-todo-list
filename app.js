const input = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const container = document.getElementById('container');
const themeToggle = document.getElementById('themeToggle');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const historyList = document.getElementById('historyList');

const sidebarSVG = `<svg viewBox="-0.5 -0.5 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" height="18" width="18"><path d="M12.7769375 14.284625H2.2230625c-0.8326875 0 -1.5076875 -0.675 -1.5076875 -1.5076875l0 -10.553875c0 -0.8326875 0.675 -1.5076875 1.5076875 -1.5076875h10.553875c0.8326875 0 1.5076875 0.675 1.5076875 1.5076875v10.553875c0 0.8326875 -0.675 1.5076875 -1.5076875 1.5076875Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/><path d="M3.9192500000000003 5.9923125 2.6 7.5l1.3192499999999998 1.5076875" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/><path d="M5.615375 14.284625V0.7153750000000001" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/></svg>`;
const moonSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/></svg>`;
const sunSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
const trashSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 640 640" fill="currentColor"><path d="M232.7 69.9C237.1 56.8 249.3 48 263.1 48L377 48C390.8 48 403 56.8 407.4 69.9L416 96L512 96C529.7 96 544 110.3 544 128C544 145.7 529.7 160 512 160L128 160C110.3 160 96 145.7 96 128C96 110.3 110.3 96 128 96L224 96L232.7 69.9zM128 208L512 208L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 208zM216 272C202.7 272 192 282.7 192 296L192 488C192 501.3 202.7 512 216 512C229.3 512 240 501.3 240 488L240 296C240 282.7 229.3 272 216 272zM320 272C306.7 272 296 282.7 296 296L296 488C296 501.3 306.7 512 320 512C333.3 512 344 501.3 344 488L344 296C344 282.7 333.3 272 320 272zM424 272C410.7 272 400 282.7 400 296L400 488C400 501.3 410.7 512 424 512C437.3 512 448 501.3 448 488L448 296C448 282.7 437.3 272 424 272z"/></svg>`;

function getToday() {
  return new Date().toLocaleDateString('sv');
}

function saveTasks() {
  const tasks = [];
  document.querySelectorAll('.task').forEach(task => {
    tasks.push({
      text: task.querySelector('label').textContent,
      done: task.classList.contains('done')
    });
  });
  chrome.storage.sync.set({ tasks });
}

function saveCompletedTasks(completedTasks) {
  chrome.storage.sync.set({ completedTasks });
}

function archiveTasks(date) {
  chrome.storage.sync.get(['completedTasks', 'tasks', 'history'], (result) => {
    const history = result.history || [];
    const completed = result.completedTasks || [];
    const activeTasks = result.tasks || [];

    const incomplete = activeTasks.filter(t => !t.done);

    const allTasks = [
      ...completed.map(t => ({ text: t, done: true })),
      ...incomplete.map(t => ({ text: t.text, done: false }))
    ];

    const total = allTasks.length;
    const completedCount = completed.length;

    if (total > 0) {
      history.push({
        date,
        total,
        completed: completedCount,
        percentage: Math.round((completedCount / total) * 100),
        tasks: allTasks
      });
    }

    chrome.storage.sync.set({
      history,
      tasks: [],
      todayDate: null,
      completedTasks: []
    });
  });
}

function renderHistory() {
  chrome.storage.sync.get(['history'], (result) => {
    const history = result.history || [];
    historyList.innerHTML = '';

    if (history.length === 0) {
      historyList.innerHTML = '<p class="no-history">No history yet</p>';
      return;
    }

    [...history].reverse().forEach(entry => {
      const item = document.createElement('div');
      item.className = 'history-item';

      const header = document.createElement('div');
      header.className = 'history-header';

      const date = document.createElement('span');
      date.className = 'history-date';
      date.textContent = entry.date;

      const pct = document.createElement('span');
      pct.className = 'history-pct' + (entry.percentage === 100 ? ' perfect' : '');
      pct.textContent = entry.percentage + '%';

      header.appendChild(date);
      header.appendChild(pct);
      item.appendChild(header);

      const taskMenu = document.createElement('div');
      taskMenu.className = 'history-tasks hidden';

      entry.tasks.forEach(t => {
        const row = document.createElement('div');
        row.className = 'history-task-row' + (t.done ? ' done' : '');
        row.textContent = (t.done ? '✓ ' : '✗ ') + t.text;
        taskMenu.appendChild(row);
      });

      item.appendChild(taskMenu);

      header.addEventListener('click', () => {
        taskMenu.classList.toggle('hidden');
        item.classList.toggle('open');
      });

      historyList.appendChild(item);
    });
  });
}

function createTask(text, done = false) {
  const task = document.createElement('div');
  task.className = 'task' + (done ? ' done' : '');

  const id = 'task-' + Date.now() + Math.random();

  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.id = id;
  cb.checked = done;

  const label = document.createElement('label');
  label.htmlFor = id;
  label.textContent = text;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.innerHTML = trashSVG;

  deleteBtn.addEventListener('click', () => {
    const wasCompleted = task.classList.contains('done');

    if (!wasCompleted) {
      chrome.storage.sync.get(['totalAdded'], (result) => {
        const current = result.totalAdded || 0;
        chrome.storage.sync.set({ totalAdded: Math.max(0, current - 1) });
      });
    }

    task.style.opacity = '0';
    task.style.transform = 'translateX(20px)';
    task.style.transition = 'opacity 0.2s, transform 0.2s';
    setTimeout(() => {
      task.remove();
      if (taskList.children.length === 0) {
        container.classList.remove('has-tasks');
      }
      saveTasks();
    }, 200);
  });

  cb.addEventListener('change', () => {
    const isNowDone = cb.checked;
    task.classList.toggle('done', isNowDone);

    if (isNowDone) {
      taskList.appendChild(task);
    }

    chrome.storage.sync.get(['completedTasks'], (result) => {
      const completedTasks = result.completedTasks || [];
      if (isNowDone) {
        completedTasks.push(text);
        saveCompletedTasks(completedTasks);
      } else {
        const idx = completedTasks.lastIndexOf(text);
        if (idx !== -1) completedTasks.splice(idx, 1);
        saveCompletedTasks(completedTasks);
      }
    });

    saveTasks();
  });

  label.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    const renameInput = document.createElement('input');
    renameInput.type = 'text';
    renameInput.value = label.textContent;
    renameInput.className = 'rename-input';
    task.replaceChild(renameInput, label);
    renameInput.focus();
    renameInput.select();

    let confirmed = false;

    function confirm() {
      if (confirmed) return;
      confirmed = true;
      if (renameInput.value.trim() !== '') {
        label.textContent = renameInput.value.trim();
      }
      task.replaceChild(label, renameInput);
      saveTasks();
    }

    renameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirm();
      if (e.key === 'Escape') task.replaceChild(label, renameInput);
    });

    renameInput.addEventListener('blur', confirm);
  });

  task.appendChild(cb);
  task.appendChild(label);
  task.appendChild(deleteBtn);
  taskList.appendChild(task);
}

// Load everything on page open
document.body.classList.add('no-transition');

chrome.storage.sync.get(['tasks', 'todayDate', 'theme'], (result) => {
  const saved = result.tasks || [];
  const savedDate = result.todayDate || null;
  const today = getToday();

  if (savedDate && savedDate !== today) {
    archiveTasks(savedDate);
  } else if (saved.length > 0) {
    container.classList.add('has-tasks');
    saved.forEach(t => createTask(t.text, t.done));
  }

  sidebarToggle.innerHTML = sidebarSVG;

  if (result.theme === 'dark') {
    document.body.classList.add('dark');
    themeToggle.innerHTML = moonSVG;
  } else {
    themeToggle.innerHTML = sunSVG;
  }

  requestAnimationFrame(() => {
    document.body.classList.remove('no-transition');
  });

  input.focus();
});

// Add task on enter
input.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && input.value.trim() !== '') {
    const text = input.value.trim();
    input.value = '';

    if (taskList.children.length === 0) {
      container.classList.add('has-tasks');
      chrome.storage.sync.set({ todayDate: getToday() });
    }

    createTask(text, false);
    chrome.storage.sync.get(['totalAdded'], (result) => {
      chrome.storage.sync.set({ totalAdded: (result.totalAdded || 0) + 1 });
    });
    saveTasks();
    input.focus();
  }
});

// Theme toggle
themeToggle.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  themeToggle.innerHTML = isDark ? moonSVG : sunSVG;
  chrome.storage.sync.set({ theme: isDark ? 'dark' : 'light' });
});

// Sidebar toggle
sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  if (sidebar.classList.contains('open')) {
    renderHistory();
  }
});

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
  if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
    sidebar.classList.remove('open');
  }
});

// Check every minute if day has rolled over
setInterval(() => {
  chrome.storage.sync.get(['todayDate'], (result) => {
    if (result.todayDate && result.todayDate !== getToday()) {
      document.querySelectorAll('.task').forEach(task => {
        task.classList.add('expired');
        task.querySelector('input[type="checkbox"]').disabled = true;
      });
    }
  });
}, 60000);