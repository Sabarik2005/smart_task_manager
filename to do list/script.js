import { openDB, addTask, getAllTasks, updateTask, deleteTask } from "./taskDB.js";

const taskNameInput = document.getElementById("taskName");
const taskDateInput = document.getElementById("taskDate");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskTable = document.getElementById("taskTable");
const pendingCount = document.getElementById("pendingCount");

let tasks = [];

async function init() {
  await openDB();
  tasks = await getAllTasks();
  renderTasks();
}

addTaskBtn.addEventListener("click", async () => {
  const name = taskNameInput.value.trim();
  const date = taskDateInput.value;

  if (!name || !date) {
    alert("Please fill all fields!");
    return;
  }

  const newTask = { name, date, status: "pending" };
  const taskWithId = await addTask(newTask);
  tasks.push(taskWithId);

  renderTasks();
  taskNameInput.value = "";
  taskDateInput.value = "";
});

function renderTasks() {
  const now = new Date();
  taskTable.innerHTML = "";
  let pending = 0;

  tasks.forEach(async (task) => {
    const taskTime = new Date(task.date);

    if (task.status === "pending" && taskTime < now) {
      task.status = "missed";
      await updateTask(task);
    }

    if (task.status === "pending") pending++;

    const statusColor = task.status === "pending" ? "bg-yellow-200 text-yellow-800" :
                        task.status === "finished" ? "bg-green-200 text-green-800 line-through" :
                        "bg-red-200 text-red-700";

    const card = document.createElement("div");
    card.className = `task-card p-5 rounded-2xl shadow-lg transition-transform hover:scale-105 bg-gradient-to-br from-green-400 to-green-500 text-white relative flex flex-col justify-between`;

    card.innerHTML = `
      <h3 class="text-lg font-bold mb-2">${task.name}</h3>
      <p class="text-sm mb-3">${new Date(task.date).toLocaleString()}</p>
      <span class="status px-3 py-1 rounded-full font-semibold ${statusColor} mb-3 self-start">${task.status}</span>
      <div class="flex justify-end gap-2">
        <button class="edit bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-md text-white text-sm">Edit</button>
        <button class="delete bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-white text-sm">Delete</button>
        <button class="finish bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-white text-sm">Finish</button>
      </div>
    `;

    card.querySelector(".delete").addEventListener("click", async () => {
      await deleteTask(task.id);
      tasks = tasks.filter(t => t.id !== task.id);
      renderTasks();
    });

    card.querySelector(".edit").addEventListener("click", async () => {
      const newName = prompt("Edit task name:", task.name);
      const newDate = prompt("Edit due date (YYYY-MM-DDTHH:MM):", task.date);
      if (newName && newDate) {
        task.name = newName;
        task.date = newDate;
        await updateTask(task);
        renderTasks();
      }
    });

    card.querySelector(".finish").addEventListener("click", async () => {
      task.status = "finished";
      await updateTask(task);
      renderTasks();
    });

    taskTable.appendChild(card);
  });

  pendingCount.textContent = `Pending Tasks: ${pending}`;
}

setInterval(renderTasks, 60000);

init();
