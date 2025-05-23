let tasks = [];
let folders = [];
const pinList = document.getElementById("pinned-list");
const taskList = document.getElementById("task-list");

window.onload = () => {
  loadTasks();
  loadFolders();
  document.getElementById("task-form").addEventListener("submit", addTask);
  document.getElementById("filter").addEventListener("click", filterTask);
  document.getElementById("refresh").addEventListener("click", refreshList);
  document.getElementById("folder").addEventListener("click", addFolder);
};

let performedFilter = false;

function filterTask() {
  document.getElementById("filter").addEventListener("click", () => {
    const criteria = prompt("Enter sorting criteria", "High or Low or Completed");

    if (criteria.trim().toLowerCase() == "high" || criteria.trim().toLowerCase() == "low") {
      if (tasks.length > 0) {
        const filteredTasks = tasks.map((task, i) => ({ ...task, _index: i }))
          .filter(task => task.priority.trim().toLowerCase() == criteria.trim().toLowerCase());
        performedFilter = true;
        displayTasks(filteredTasks);
      }
    } else if(criteria.trim().toLowerCase() == "completed") {
      if (tasks.length > 0) {
        const filteredTasks = tasks.map((task, i) => ({ ...task, _index: i }))
          .filter(task => task.isCompleted);
        performedFilter = true;
        displayTasks(filteredTasks);
      }
    }
  });
}

function refreshList() {
  if(performedFilter) {
    displayTasks();
  }
}


function updateTasksSectionDisplayVisibility() {
  const displayElem = document.getElementById("tasks-section");
  displayElem.style.display = tasks.length > 0 ? "block" : "none";
}

function updateFoldersSectionDisplayVisibility() {
  const displayElem = document.getElementById("folders-section");
  displayElem.style.display = folders.length > 0 ? "block" : "none";
}

function addTask(e) {
  e.preventDefault();

  const taskName = document.getElementById("name").value.trim();
  const taskDue = document.getElementById("due-date").value;
  const taskPriority = document.getElementById("priority").value;

  if (!taskName || !taskDue) {
    alert("Please enter both name and due date.");
    return;
  }

  tasks.push({
    name: taskName,
    due_date: taskDue,
    priority: taskPriority,
    isCompleted: false,
    isPinned: false,
    refereceId: Math.floor(Math.random() * 100000) + 1
  });

  document.getElementById("name").value = "";
  document.getElementById("due-date").value = "";
  document.getElementById("priority").value = "Low";

  displayTasks();
  saveTasksDebounced();
  updateTasksSectionDisplayVisibility();
}

function displayTasks(arr = null) {
  pinList.style.display = "none";
  document.getElementById("pinned-text").style.display = "none";
  pinListNotShown = true;

  pinList.innerHTML = "";
  taskList.innerHTML = "";

  const source = arr === null
    ? tasks.map((task, index) => ({ ...task, _index: index }))
    : arr;

  source.forEach(renderTask);
}

function renderTask(task) {
  const index = task._index;

  const task_elem = document.createElement("div");
  const tasks_buttons = document.createElement("div");
  const task_info = document.createElement("div");
  const pinButton = document.createElement("button");
  const addToFolderButton = document.createElement("button");

  pinButton.innerHTML = `<i class="fas fa-thumbtack"></i>`;
  addToFolderButton.innerHTML = `<i class="fa-solid fa-folder"></i>`;
  pinButton.className = "pin";
  addToFolderButton.className = "add-to-folder";
  pinButton.addEventListener("click", () => pinTask(index));
  addToFolderButton.addEventListener("click", () => addTaskToFolder(index));
  // folder_icon.appendChild(addToFolderButton);

  task_elem.className = task.isCompleted ? "task-item completed" : "task-item";
  task_elem.innerHTML = `
    Task: ${task.name}<br>
    Due Date: ${task.due_date}<br>
    Priority: ${task.priority}<br>`;

  tasks_buttons.innerHTML = `
    <button id="mark_cmp" class="${task.isCompleted ? 'hide' : 'hov btn'}" onclick="completeTask(${index})">Mark Complete</button>
    <button id="delete" class="btn" onclick="deleteTask(${index})">Delete</button><br>
    <button id="edit" class="${task.isCompleted ? 'hide' : 'btn'}" onclick="editTask(${index})">Edit</button><br>`;

  tasks_buttons.className = "buttons";
  task_info.className = "task_info";

  if (task.isPinned) {
    if (pinListNotShown) {
      pinList.style.display = "block";
      document.getElementById("pinned-text").style.display = "block";
      pinListNotShown = false;
      task_info.appendChild(task_elem);
      task_info.appendChild(tasks_buttons);
      pinList.appendChild(task_info);
    }
  } else {
    if (!task.isCompleted) {
      task_info.appendChild(pinButton); 
      task_info.appendChild(addToFolderButton);
    }

    task_info.appendChild(task_elem);
    task_info.appendChild(tasks_buttons);
    taskList.appendChild(task_info);
  }
}

function deleteTask(index) {
  tasks.splice(index, 1);
  displayTasks();
  saveTasksDebounced();
  updateTasksSectionDisplayVisibility();
}

function completeTask(index) {
  tasks[index].isCompleted = !tasks[index].isCompleted;
  displayTasks();
  saveTasksDebounced();
  alert("Congratulations ! you have completed this task");
}

function editTask(index) {
  const newName = prompt("Enter new task name", tasks[index].name);
  const newDate = prompt("Enter new task due date", tasks[index].due_date);
  const newPriority = prompt("Enter new task priority", tasks[index].priority);

  if (newName && newDate && newPriority) {
    tasks[index].name = newName;
    tasks[index].due_date = newDate;
    tasks[index].priority = newPriority;
    displayTasks();
    saveTasksDebounced();
  }
}

function pinTask(index) {
  tasks[index].isPinned = !tasks[index].isPinned;

  const msgDiv = document.getElementById("message");
  const msg = document.createElement("p");

  msg.innerHTML = "Task Pinned Successfully! &checkmark;";
  msgDiv.appendChild(msg);
  msgDiv.className = "show";

  setTimeout(() => {
    msgDiv.className = "hide";
    msg.remove();
  }, 2000);

  displayTasks();
  saveTasksDebounced();
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

const saveTasksDebounced = debounce(saveTasks, 1000);


function loadTasks() {
  try {
    const storedTasks = localStorage.getItem("tasks");
    const parsedTasks = JSON.parse(storedTasks);
    if (Array.isArray(parsedTasks)) {
      tasks = parsedTasks;
    } else {
      tasks = [];
    }
    displayTasks();
    updateTasksSectionDisplayVisibility();
  } catch (error) {
    alert(error.message);
    tasks = [];
  }
}

function loadFolders() {
  try {
    const storedFolders = localStorage.getItem("folders");
    const parsedFolders = JSON.parse(storedFolders);
    if (Array.isArray(parsedFolders)) {
      folders = parsedFolders;
    } else {
      folders = [];
    }

    displayFolders();
    updateFoldersSectionDisplayVisibility();
  } catch (error) {
    alert(error.message);
    folders = [];
  }
}

function addFolder() {
  const foldersList = document.getElementById("folders-list");

  const folderName = prompt("Enter folder name", "My tasks");
  
  const folderElem = document.createElement("div");
  folderElem.className = "folder_info";

  folderElem.innerHTML = `
          <img width="100" height="100" class="folder-icon" src="https://img.icons8.com/clouds/100/folder-invoices.png" alt="folder-invoices"/>  
          <p class="folder-name">${folderName}</p>
        `;

  foldersList.appendChild(folderElem);
  folders.push({
    folderName,
    folderTasks: []
  })

  localStorage.setItem("folders", JSON.stringify(folders));
  updateFoldersSectionDisplayVisibility();
}

function addTaskToFolder(index) {
  let folderName;
  if(folders.length > 0 ) {
    folderName = prompt("Enter folder name to add this task to it", folders[0].folderName);

    const objIndex = folders.findIndex(folder => folder.folderName === folderName);
    
    if(objIndex != -1) {
    folders.map((folder, folderIndex) => {
      if(folderIndex == objIndex) {
        folder.folderTasks.push(tasks[index].refereceId);
      }
      return folder;
    });

    // folders = [...folders, (folder, index) => index == objIndex ? folder.folderTasks.push(tasks[index].refereceId) : folder];

    if(localStorage.getItem("folders")) {
      localStorage.setItem("folders", JSON.stringify(folders));
    }

  } else {
    alert("No such folder exists, please create one to add tasks to it");
  }


  } else {
    alert("Please create a folder first to add tasks");
    return;
  }
}

function displayFolders() {
  const foldersList = document.getElementById("folders-list");
  
  if(folders.length > 0) {
    folders.forEach(folder => {
      const folderElem = document.createElement("div");
      folderElem.className = "folder_info";
    
      folderElem.innerHTML = `
              <img width="100" height="100" class="folder-icon" src="https://img.icons8.com/clouds/100/folder-invoices.png" alt="folder-invoices"/>  
              <p class="folder-name">${folder.folderName}</p>
              `;

      foldersList.appendChild(folderElem);
    });
  }
}