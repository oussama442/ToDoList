document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('AddButton').addEventListener('click', addTask);
    document.getElementById('taskInput').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Event listeners for search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', searchTasks);

    // Event listeners for filter buttons
    const filterButtons = document.querySelectorAll('.Filters button');
    filterButtons.forEach(button => {
        button.addEventListener('click', filterTasks);
    });

    // Event listeners for clear tasks buttons
    const clearCompletedButton = document.querySelector('#Clear button:first-of-type');
    const clearAllButton = document.querySelector('#Clear button:last-of-type');

    clearCompletedButton.addEventListener('click', clearCompletedTasks);
    clearAllButton.addEventListener('click', clearAllTasks);

    // Load tasks from local storage
    loadTasks();
});

// Function to add a task
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    const taskList = document.getElementById('taskList');

    const categorySelect = document.getElementById('Category');
    const prioritySelect = document.getElementById('priority');

    const selectedCategory = categorySelect.value !== "null" ? categorySelect.value : "None";
    const selectedPriority = prioritySelect.value !== "null" ? prioritySelect.value : "None";

    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }

    // Get the current date
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
    });

    // Create task elements
    const li = document.createElement('li');
    li.classList.add('task-item');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.addEventListener('change', updateStats);

    const taskDetails = document.createElement('div');
    taskDetails.classList.add('task-details');
    taskDetails.innerHTML = `
        <strong>${taskText}</strong>
        <br>
        <span class="category">Category: <b>${selectedCategory}</b></span> |
        <span class="priority">Priority: <b>${selectedPriority}</b></span> |
        <span class="created-date">Created: <b>${formattedDate}</b></span>
    `;

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-btn');
    deleteButton.textContent = '🗑️';
    deleteButton.onclick = function () {
        li.remove();
        updateStats();
        adjustContainerSize();
        saveTasks(); // Save tasks after deletion
    };

    // Append elements
    li.appendChild(checkbox);
    li.appendChild(taskDetails);
    li.appendChild(deleteButton);
    taskList.appendChild(li);

    // Save tasks to local storage
    saveTasks();

    // Clear input fields
    taskInput.value = '';
    categorySelect.value = 'null';
    prioritySelect.value = 'null';

    updateStats();
    adjustContainerSize();
}

// Function to adjust container size dynamically
function adjustContainerSize() {
    const tasksContainer = document.querySelector('.Tasks');
    const taskList = document.getElementById('taskList');

    if (taskList.children.length === 0) {
        tasksContainer.style.minHeight = "10vh";
    } else {
        tasksContainer.style.minHeight = (taskList.children.length * 60) + "px";
    }
}

// Function to update stats
function updateStats() {
    const totalTasks = document.querySelectorAll('.task-item').length;
    const completedTasks = document.querySelectorAll('.task-item input:checked').length;
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    document.getElementById('TotalTasks').querySelector('h2').innerText = totalTasks;
    document.getElementById('Completed').querySelector('h2').innerText = completedTasks;
    document.getElementById('CompletionRate').querySelector('h2').innerText = completionRate + '%';
}

// Function to search tasks
function searchTasks() {
    const searchText = document.getElementById('searchInput').value.trim().toLowerCase();
    const taskItems = document.querySelectorAll('.task-item');

    if (searchText === '') {
        taskItems.forEach(task => task.style.display = 'flex');
    } else {
        taskItems.forEach(task => {
            const taskName = task.querySelector('strong').textContent.trim().toLowerCase();
            if (taskName.startsWith(searchText)) {
                task.style.display = 'flex';
            } else {
                task.style.display = 'none';
            }
        });
    }
}

// Function to filter tasks by category
function filterTasks() {
    const category = this.id;
    const taskItems = document.querySelectorAll('.task-item');

    taskItems.forEach(task => {
        const taskCategory = task.querySelector('.category b').textContent;
        if (category === 'All' || taskCategory === category) {
            task.style.display = 'flex';
        } else {
            task.style.display = 'none';
        }
    });
}

// Function to clear completed tasks with confirmation
function clearCompletedTasks() {
    const confirmed = window.confirm("Are you sure you want to delete all completed tasks?");
    if (confirmed) {
        const completedTasks = document.querySelectorAll('.task-item input:checked');
        completedTasks.forEach(task => {
            task.closest('.task-item').remove();
        });
        updateStats();
        adjustContainerSize();
        saveTasks();
    }
}

// Function to clear all tasks with confirmation
function clearAllTasks() {
    const confirmed = window.confirm("Are you sure you want to delete all tasks?");
    if (confirmed) {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = ''; // Remove all tasks
        updateStats();
        adjustContainerSize();
        saveTasks();
    }
}

// Function to save tasks to Local Storage
function saveTasks() {
    const taskItems = document.querySelectorAll('.task-item');
    const tasks = [];

    taskItems.forEach(task => {
        const taskName = task.querySelector('strong').textContent;
        const taskCategory = task.querySelector('.category').textContent.replace('Category: ', '').trim();
        const taskPriority = task.querySelector('.priority').textContent.replace('Priority: ', '').trim();
        const taskDate = task.querySelector('.created-date').textContent.replace('Created: ', '').trim();
        const isChecked = task.querySelector('input[type="checkbox"]').checked;

        tasks.push({
            name: taskName,
            category: taskCategory,
            priority: taskPriority,
            date: taskDate,
            isChecked: isChecked
        });
    });

    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to load tasks from Local Storage
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    if (tasks) {
        tasks.sort((a, b) => {
            const priorityOrder = { "High": 3, "Medium": 2, "Low": 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority]; // Sort by priority (High -> Low)
        });

        tasks.forEach(task => {
            const taskList = document.getElementById('taskList');

            const li = document.createElement('li');
            li.classList.add('task-item');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.isChecked;
            checkbox.addEventListener('change', updateStats);

            const taskDetails = document.createElement('div');
            taskDetails.classList.add('task-details');
            taskDetails.innerHTML = `
                <strong>${task.name}</strong>
                <br>
                <span class="category">Category: <b>${task.category}</b></span> |
                <span class="priority">Priority: <b>${task.priority}</b></span> |
                <span class="created-date">Created: <b>${task.date}</b></span>
            `;

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-btn');
            deleteButton.textContent = '🗑️';
            deleteButton.onclick = function () {
                li.remove();
                updateStats();
                adjustContainerSize();
                saveTasks(); // Save tasks after deletion
            };

            li.appendChild(checkbox);
            li.appendChild(taskDetails);
            li.appendChild(deleteButton);
            taskList.appendChild(li);
        });

        updateStats();
        adjustContainerSize();
    }
}
