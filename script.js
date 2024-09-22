const activitiesContainer = document.getElementById('activities-container');
const addActivityBtn = document.getElementById('add-activity-btn');
const submitTimesheetBtn = document.getElementById('submit-timesheet-btn');
const previewBody = document.getElementById('preview-body');
const previewTableContainer = document.getElementById('preview-table-container');
const togglePreviewBtn = document.getElementById('toggle-preview-btn');
const viewAllTimesheets = document.getElementById('view-all-timesheets');

const timesheets = [];

async function fetchDropdownOptions() {
    try {
        const [projectsResponse, subProjectsResponse, batchesResponse] = await Promise.all
            ([
                fetch('https://localhost:7172/api/DropDown/projects'),
                fetch('https://localhost:7172/api/DropDown/subprojects'),
                fetch('https://localhost:7172/api/DropDown/batches')
            ]);

        const projects = await projectsResponse.json();
        const subProjects = await subProjectsResponse.json();
        const batches = await batchesResponse.json();

        return { projects, subProjects, batches };
    }
    catch (error) {
        console.error('Error fetching dropdown options:', error);
        return { projects: [], subProjects: [], batches: [] };
    }
}

function populateDropdowns(projects, subProjects, batches, activityForm) {
    const projectSelect = activityForm.querySelector('.project');
    const subProjectSelect = activityForm.querySelector('.sub-project');
    const batchSelect = activityForm.querySelector('.batch');


    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.name;
        option.textContent = project.name;
        projectSelect.appendChild(option);
    });


    subProjects.forEach(subProject => {
        const option = document.createElement('option');
        option.value = subProject.name;
        option.textContent = subProject.name;
        subProjectSelect.appendChild(option);
    });


    batches.forEach(batch => {
        const option = document.createElement('option');
        option.value = batch.name;
        option.textContent = batch.name;
        batchSelect.appendChild(option);
    });
}


async function createActivityForm() {
    const activityForm = document.createElement('div');
    activityForm.classList.add('activity-form');
    activityForm.innerHTML = `
        <label for="project">Project:</label>
        <select class="project"></select>
        
        <label for="sub-project">Sub-Project:</label>
        <select class="sub-project"></select>

        <label for="batch">Batch:</label>
        <select class="batch"></select>

        <label for="hours">Hours Needed:</label>
        <input class="hours" type="number" min="0" max="23" placeholder="HH"/>
        <input class="minutes" type="number" min="0" max="59" placeholder="MM"/>

        <label for="activity-description">Activity:</label>
        <input class="activity-description" type="text" placeholder="Describe Activity"/>
        <button class="remove-activity-btn">Remove Activity</button>
    `;


    const { projects, subProjects, batches } = await fetchDropdownOptions();
    populateDropdowns(projects, subProjects, batches, activityForm);

    activityForm.querySelector('.remove-activity-btn').addEventListener('click', function () {
        activitiesContainer.removeChild(activityForm);
    });

    activitiesContainer.appendChild(activityForm);
}


async function populateExistingActivityForms() {
    const { projects, subProjects, batches } = await fetchDropdownOptions();
    const existingForms = document.querySelectorAll('.activity-form');

    existingForms.forEach(form => {
        populateDropdowns(projects, subProjects, batches, form);
    });
}


addActivityBtn.addEventListener('click', createActivityForm);

submitTimesheetBtn.addEventListener('click', preview);

function preview() {
    const date = document.getElementById('date').value;
    const leaveStatus = document.getElementById('leave-status').value;
    const activities = [];


    const activityForms = document.querySelectorAll('.activity-form');
    activityForms.forEach(form => {
        const project = form.querySelector('.project').value;
        const subProject = form.querySelector('.sub-project').value;
        const batch = form.querySelector('.batch').value;
        const hours = form.querySelector('.hours').value;
        const minutes = form.querySelector('.minutes').value;
        const description = form.querySelector('.activity-description').value;

        activities.push({
            project,
            subProject,
            batch,
            hours,
            minutes,
            description,
        });
    });


    timesheets.push({
        date,
        leaveStatus,
        activities
    });


    const activitiesHtml = activities.map(act =>
        `
        <div>
            <strong>Project:</strong> ${act.project}<br/>
            <strong>Sub-Project:</strong> ${act.subProject}<br/>
            <strong>Batch:</strong> ${act.batch}<br/>
            <strong>Hours:</strong> ${act.hours} | <strong>Minutes:</strong> ${act.minutes}<br/>
            <strong>Description:</strong> ${act.description}<br/><br/>
        </div>
    `).join('');


    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${date}</td>
        <td>${leaveStatus}</td>
        <td>${activitiesHtml}</td>
    `;
    previewBody.appendChild(row);


    previewTableContainer.classList.remove('hidden');
}


const addTimesheetBtn = document.getElementById('add-timesheet-btn');
addTimesheetBtn.addEventListener('click', async function () {

    const date = document.getElementById('date').value;
    const leaveStatus = document.getElementById('leave-status').value;
    const activities = [];

    const activityForms = document.querySelectorAll('.activity-form');
    activityForms.forEach(form => {
        const project = form.querySelector('.project').value;
        const subProject = form.querySelector('.sub-project').value;
        const hours = form.querySelector('.hours').value;
        const minutes = form.querySelector('.minutes').value;
        const description = form.querySelector('.activity-description').value;

        activities.push({
            id: 0,
            project,
            subProject,
            hours: parseInt(hours, 10),
            minutes: parseInt(minutes, 10),
            description,
            timesheetId: 0
        });
    });

    const timesheetData = {
        id: 0,
        date,
        leaveStatus,
        activities
    };

    console.log('Timesheet Data:', JSON.stringify(timesheetData));

    try {
        const response = await fetch('https://localhost:7172/api/Timesheet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(timesheetData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error('Failed to add timesheet');
        }

        const result = await response.json();
        console.log('Timesheet added successfully:', result);
        window.location.href = 'timesheets.html';

    } catch (error) {
        console.error('Error adding timesheet:', error);
    }
});

viewAllTimesheets.addEventListener('click', () => {
    window.location.href = 'timesheets.html';
});

togglePreviewBtn.addEventListener('click', function () {
    if (previewTableContainer.classList.contains('hidden')) {
        previewTableContainer.classList.remove('hidden');
        togglePreviewBtn.textContent = "Hide Preview";
    } else {
        previewTableContainer.classList.add('hidden');
        togglePreviewBtn.textContent = "Show Preview";
    }
});


(async function initialize() {
    await populateExistingActivityForms();
})();
