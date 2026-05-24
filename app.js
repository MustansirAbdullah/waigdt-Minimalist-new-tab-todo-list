const input = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const container = document.getElementById('container');

// Get today's date as a string e.g. "2024-05-24"
function getToday() {
  return new Date().toISOString().split('T')[0];
}

// Save all current tasks to storage
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

// Archive expired tasks into history log
function archiveTasks(tasks, date) {
  chrome.storage.sync.get(['history'], (result) => {
    const history = result.history || [];
    const total = tasks.length;
    const completed = tasks.filter(t => t.done).length;

    // Only log if there were actual tasks that day
    if (total > 0) {
      history.push({
        date,
        total,
        completed,
        percentage: Math.round((completed / total) * 100),
        tasks
      });
      chrome.storage.sync.set({ history });
    }
  });
}

// Create a task element and append it
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

  cb.addEventListener('change', () => {
    task.classList.toggle('done', cb.checked);
    saveTasks();
  });

  task.appendChild(cb);
  task.appendChild(label);
  taskList.appendChild(task);
}

// Load tasks on page open, check for expiry
chrome.storage.sync.get(['tasks', 'todayDate'], (result) => {
  const saved = result.tasks || [];
  const savedDate = result.todayDate || null;
  const today = getToday();

  if (savedDate && savedDate !== today) {
    // Day has changed — archive and clear
    archiveTasks(saved, savedDate);
    chrome.storage.sync.set({ tasks: [], todayDate: null });
  } else if (saved.length > 0) {
    // Same day — load tasks normally
    container.classList.add('has-tasks');
    saved.forEach(t => createTask(t.text, t.done));
  }

  input.focus();
});

// Add task on enter
input.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && input.value.trim() !== '') {
    const text = input.value.trim();
    input.value = '';

    // If first task of the day, store today's date
    if (taskList.children.length === 0) {
      container.classList.add('has-tasks');
      chrome.storage.sync.set({ todayDate: getToday() });
    }

    createTask(text, false);
    saveTasks();
    input.focus();
  }
});