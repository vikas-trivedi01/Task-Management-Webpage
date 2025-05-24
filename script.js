let tasks = [];
let folders = [];
const pinList = document.getElementById("pinned-list");
let taskList = document.getElementById("task-list");

if (window.location.pathname.endsWith("task.html")) {
  window.onload = () => {
    loadTasks("user");
    loadFolders("user");
    document.getElementById("task-form").addEventListener("submit", addTask);
    document.getElementById("filter").addEventListener("click", filterTask);
    document.getElementById("refresh").addEventListener("click", refreshList);
    document.getElementById("folder").addEventListener("click", addFolder);
  };
}

if (window.location.pathname.endsWith("folder.html")) {
  const params = new URLSearchParams(window.location.search);
  const folderIndex = params.get("folderIndex");

  loadTasks("system");
  loadFolders("system");
  let folderTasks = tasks.filter(task => {
    if (folders[folderIndex].folderTasks.includes(task.referenceId)) {
      return task;
    }
  });
  folderTasks = folderTasks.map((task, i) => ({ ...task, _index: i }))

  document.getElementById("folder-tasks-list").innerHTML += `
                                                      <center><h2><u>Folder ~ ${folders[folderIndex].folderName}</u></h2></center>
                                                      <div id="task-list"></div>
                                                  `;

  displayTasks(folderTasks, true);
}


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
    } else if (criteria.trim().toLowerCase() == "completed") {
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
  if (performedFilter) {
    displayTasks();
  }
  // tasks.forEach(task => console.log(typeof(task.referenceId)))
  // folders.forEach(task => task.folderTasks.forEach((ref)=> console.log(typeof(ref))))

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
    isInFolder: false,
    referenceId: Math.floor(Math.random() * 100000) + 1
  });

  document.getElementById("name").value = "";
  document.getElementById("due-date").value = "";
  document.getElementById("priority").value = "Low";

  displayTasks();
  saveTasksDebounced();
  updateTasksSectionDisplayVisibility();
}

function displayTasks(arr = null, folderAccess = false) {

  if (!folderAccess) {
    taskList = document.getElementById("task-list");
    taskList.innerHTML = "";
    pinList.style.display = "none";
    document.getElementById("pinned-text").style.display = "none";
    pinListNotShown = true;

    pinList.innerHTML = "";
  }


  const source = arr === null
    ? tasks.map((task, index) => ({ ...task, _index: index }))
    : arr;

  source.forEach(task => renderTask(task, folderAccess));
}


function renderTask(task, folderAccess = false) {
  const index = task._index;

  const task_elem = document.createElement("div");
  const tasks_buttons = document.createElement("div");
  const task_info = document.createElement("div");
  const pinButton = document.createElement("button");

  const addToFolderButton = document.createElement("button");
  const removeFromFolderButton = document.createElement("button");

  const list = folderAccess ? document.getElementById("folder-tasks-list") : document.getElementById("task-list");

  if (task.isInFolder) {
    removeFromFolderButton.innerHTML = `<i class="fa-solid fa-folder-minus"></i>`;
    removeFromFolderButton.className = "remove-from-folder";
    removeFromFolderButton.addEventListener("click", () => removeTaskFromFolder(index));
  } else {
    addToFolderButton.innerHTML = `<i class="fa-solid fa-folder"></i>`;
    addToFolderButton.className = "add-to-folder";
    addToFolderButton.addEventListener("click", () => addTaskToFolder(index));
  }

  pinButton.innerHTML = `<i class="fas fa-thumbtack"></i>`;
  pinButton.className = "pin";
  pinButton.addEventListener("click", () => pinTask(index));

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
  }
  else if (task.isInFolder) {
    task_info.appendChild(pinButton);
    task_info.appendChild(removeFromFolderButton);
    task_info.appendChild(task_elem);
    task_info.appendChild(tasks_buttons);
    list.appendChild(task_info);
  }
  else {
    if (!task.isCompleted) {
      task_info.appendChild(pinButton);
      task_info.appendChild(addToFolderButton);
    }

    task_info.appendChild(task_elem);
    task_info.appendChild(tasks_buttons);
    list.appendChild(task_info);
  }
}

function deleteTask(index) {
  folders = folders.map(folder => {
    folder.folderTasks = folder.folderTasks.filter(folderTaskReferenceId => {
      //  folders.splice(folder.folderTasks.findIndex(folderTaskReference => folderTaskReference == folderTaskReferenceId),1)
      folderTaskReferenceId !== tasks[index].referenceId
    });
    return folder;
  });

  tasks.splice(index, 1);
  saveFolders();
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
function saveFolders() {
  localStorage.setItem("folders", JSON.stringify(folders));
}

function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

const saveTasksDebounced = debounce(saveTasks, 1000);


function loadTasks(loadingType) {
  const updateUi = loadingType == "user" ? true : false;
  try {
    const storedTasks = localStorage.getItem("tasks");
    const parsedTasks = JSON.parse(storedTasks);
    if (Array.isArray(parsedTasks)) {
      tasks = parsedTasks;
    } else {
      tasks = [];
    }
    if (updateUi) {
      displayTasks();
      updateTasksSectionDisplayVisibility();
    }
  } catch (error) {
    alert(error.message);
    tasks = [];
  }
}

function loadFolders(loadingType) {
  const updateUi = loadingType == "user" ? true : false;
  try {
    const storedFolders = localStorage.getItem("folders");
    const parsedFolders = JSON.parse(storedFolders);
    if (Array.isArray(parsedFolders)) {
      folders = parsedFolders;
      if (updateUi) {
        displayFolders();
        updateFoldersSectionDisplayVisibility();
      }
    } else {
      folders = [];
    }

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

  folders.push({
    folderName,
    folderTasks: []
  })

  foldersList.appendChild(folderElem);

  saveFolders();
  updateFoldersSectionDisplayVisibility();
}

function addTaskToFolder(index) {
  let folderName;
  if (folders.length > 0) {
    folderName = prompt("Enter folder name to add this task to it", folders[0].folderName);

    const objIndex = folders.findIndex(folder => folder.folderName === folderName);

    if (objIndex != -1) {
      folders.map((folder, folderIndex) => {
        if (folderIndex == objIndex) {
          folder.folderTasks.push(tasks[index].referenceId);
          tasks[index].isInFolder = true;
        }
        return folder;
      });

      // folders = [...folders, (folder, index) => index == objIndex ? folder.folderTasks.push(tasks[index].refereceId) : folder]
      if (localStorage.getItem("folders")) {
        saveFolders();
        displayTasks(null, true);
        saveTasksDebounced();
      }


    } else {
      alert("No such folder exists, please create one to add tasks to it");
    }


  } else {
    alert("Please create a folder first to add tasks");
    return;
  }
}


function removeTaskFromFolder(index) {
  tasks = tasks.map((task, taskIndex) => {
    if (index == taskIndex) {
      return { ...task, isInFolder: false };
    }
    return task;
  });

  folders = folders.map(folder => {
    folder.folderTasks = folder.folderTasks.filter(folderTaskReference => (
      folderTaskReference != tasks[index].referenceId
    ));

    return folder;
  });

  // folders[folderIndex].folderTasks.splice(folders[folderIndex].folderTasks.findIndex((ref)=> ref == tasks[index].referenceId), 1);

  // folders[folderIndex].folderTasks = folders[folderIndex].folderTasks.filter ( referenceId => referenceId != tasks[index].referenceId);
  saveTasksDebounced();
  saveFolders();

  loadTasks("system");
  loadFolders();
  displayTasks(tasks, true);

}

function displayFolders() {
  const foldersList = document.getElementById("folders-list");

  folders.forEach(folder => {
    const folderElem = document.createElement("div");
    folderElem.className = "folder_info";

    folderElem.innerHTML = `
            <img width="100" height="100" class="folder-icon" src="https://img.icons8.com/clouds/100/folder-invoices.png" alt="folder-invoices"/>  
            <p class="folder-name">${folder.folderName}</p>
            `;

    foldersList.appendChild(folderElem);
  });

  document.querySelectorAll(".folder_info").forEach((elem, index) => {
    elem.addEventListener("click", () => {
      window.location.href = `folder.html?folderIndex=${index}`;
    });
  });
}
