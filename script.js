let tasks = [];

//on submission of form call the addTask to add the task
document.getElementById("task-form").addEventListener("submit", addTask);

function addTask(e) {
  e.preventDefault();

  const taskDescription = document.getElementById("description").value.trim();
  const taskDue = document.getElementById("due-date").value;
  const taskPriority = document.getElementById("priority").value;

  if (!taskDescription || !taskDue) {
    alert("Please enter both description and due date.");
    return;
  }
  //push the task object in tasks array
  tasks.push({
    description: taskDescription,
    due_date: taskDue,
    priority: taskPriority,
    isCompleted: false,
    isPinned: false,
  });
  //empty the fields
  document.getElementById("description").value = "";
  document.getElementById("due-date").value = "";
  document.getElementById("priority").value = "Low";

  //display and save tasks to localstorage
  displayTasks();
  saveTasksDebounced();
}

function displayTasks() {
  const pinList = document.getElementById("pinned-list");
  const taskList = document.getElementById("task-list");

  pinList.innerHTML = "";
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    //create necessary elements
    const task_elem = document.createElement("div");
    const tasks_buttons = document.createElement("div");
    const task_info = document.createElement("div");
    const pin_icon = document.createElement("span");
    const pinButton = document.createElement("button");

    //add pin icon
    pinButton.innerHTML = `<i class="fas fa-thumbtack"></i>`;
    pinButton.className = "pin";

    pinButton.addEventListener("click", () => pinTask(index));
    pin_icon.appendChild(pinButton);

    task_elem.className = task.isCompleted ? "task-item completed" : "task-item";
    task_elem.innerHTML = `
            Task: ${task.description}<br>
            Due Date: ${task.due_date}<br>
            Priority: ${task.priority}<br> `;

    tasks_buttons.innerHTML = `
            <button id="delete" class="btn" onclick="deleteTask(${index})">Delete</button><br>
            <button id="edit" class="${task.isCompleted ? 'hide' : 'btn'}" onclick="editTask(${index})">Edit</button><br>
            <button id="mark_cmp" class="${task.isCompleted ? 'hide' : 'hov btn'}" onclick="completeTask(${index})">Mark Complete</button>
            `;

    tasks_buttons.className = "buttons";
    task_info.className = "task_info";

    if (task.isPinned) {
      task_info.appendChild(task_elem);
      task_info.appendChild(tasks_buttons);

      pinList.appendChild(task_info);
    } else {
      task_info.appendChild(pin_icon);
      task_info.appendChild(task_elem);
      task_info.appendChild(tasks_buttons);

      taskList.appendChild(task_info);
    }

  });
}

function deleteTask(index) {
  tasks.splice(index, 1);//remove task from index
  displayTasks();
  saveTasksDebounced();
}

function completeTask(index) {
  tasks[index].isCompleted = !tasks[index].isCompleted;
  displayTasks();
  saveTasksDebounced();
  alert("Congratulations ! you have completed this task");
}

function editTask(index) {
  //provide editing options
  const newDescription = prompt(
    "Enter new task description",
    tasks[index].description
  );
  const newDate = prompt(
    "Enter new task due date",
    tasks[index].due_date
  );
  const newPriority = prompt(
    "Enter new task priority",
    tasks[index].priority
  );

  if (newDescription && newDate && newPriority) {
    tasks[index].description = newDescription;
    tasks[index].due_date = newDate;
    tasks[index].priority = newPriority;
    displayTasks();
    saveTasksDebounced();
  }
}

function pinTask(index) {
  tasks[index].isPinned = !tasks[index].isPinned;

  let msgDiv = document.getElementById("message");
  let msg = document.createElement('p');

  msg.innerHTML = 'Task Pinned Successfully! &checkmark;';
  msgDiv.appendChild(msg);
  msgDiv.className='show';
  setTimeout(() =>  msgDiv.className='hide', 3000);

  displayTasks();
  saveTasksDebounced();
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));//store tasks to localstorage
}

// Debounce saveTasks function
function debounce(func,delay){
  let timer;

  return function(...args){
    clearTimeout(timer);
    timer = setTimeout(()=>func(...args),delay);
  };
}
const saveTasksDebounced = debounce(saveTasks, 1000); 

function loadTasks() {
  try {
    const storedTasks = localStorage.getItem("tasks");//fetch tasks from localstorage
    tasks = JSON.parse(storedTasks);
    displayTasks();

  } catch (error) {
    alert(error.message);
  }

}

window.onload = loadTasks;
