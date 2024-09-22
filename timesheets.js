document.getElementById('back-to-form-btn').addEventListener('click', function () {
    window.location.href = 'index.html';
});

const timesheetBody = document.getElementById('timesheet-body');

async function renderTimesheets() {
    try {
        const response = await fetch('https://localhost:7172/api/Timesheet');
        const timesheets = await response.json();

        timesheetBody.innerHTML = '';

        timesheets.forEach((timesheet, index) => {
            const row = document.createElement('tr');

            const activitiesHtml = timesheet.activities.map((act, actIndex) => `
                <div class="activity" data-index="${actIndex}">

                    <strong>Project:</strong> <span class="project">${act.project}</span>
                    <input type="text" class="edit-project hidden" value="${act.project}">

                    <strong>Sub-Project:</strong> <span class="sub-project">${act.subProject}</span>
                    <input type="text" class="edit-sub-project hidden" value="${act.subProject}">

                    <strong>Hours:</strong> <span class="hours">${act.hours}</span>
                    <input type="number" class="edit-hours hidden" value="${act.hours}">

                    <strong>Minutes:</strong> <span class="minutes">${act.minutes}</span>
                    <input type="number" class="edit-minutes hidden" value="${act.minutes}">

                    <strong>Description:</strong> <span class="description">${act.description}</span>
                    <input type="text" class="edit-description hidden" value="${act.description}">

                    <button class="edit-activity-btn">Edit</button>

                    <button class="delete-activity-btn">Delete</button>

                    <button class="save-activity-btn hidden">Save</button>
                </div>
            `).join('');

            row.innerHTML = `
                <td>
                    <span class="date">${new Date(timesheet.date).toLocaleDateString()}</span>
                    <input type="date" class="edit-date hidden" value="${timesheet.date.split('T')[0]}">
                </td>
                <td>
                    <span class="leave-status">${timesheet.leaveStatus}</span>
                    <select class="edit-leave-status hidden">
                        <option value="No" ${timesheet.leaveStatus === 'No' ? 'selected' : ''}>No</option>
                        <option value="Yes" ${timesheet.leaveStatus === 'Yes' ? 'selected' : ''}>Yes</option>
                    </select>
                </td>
                <td>${activitiesHtml}</td>
                <td>
                    <button class="edit-btn" data-index="${index}">Edit</button>
                    <button class="save-btn hidden" data-index="${index}">Save</button>
                    <button class="delete-btn" data-index="${index}">Delete</button>
                </td>
            `;

            timesheetBody.appendChild(row);
        });

        addEventListeners(timesheets);
    } catch (error) {
        console.error('Error fetching timesheets:', error);
    }
}

function addEventListeners(timesheets) {

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const index = this.dataset.index;
            const row = this.closest('tr');

            row.querySelector('.edit-date').classList.remove('hidden');
            row.querySelector('.date').classList.add('hidden');
            row.querySelector('.edit-leave-status').classList.remove('hidden');
            row.querySelector('.leave-status').classList.add('hidden');

            this.classList.add('hidden');
            row.querySelector('.save-btn').classList.remove('hidden');
        });
    });

    document.querySelectorAll('.save-btn').forEach(btn => {
        btn.addEventListener('click', async function () {
            const index = this.dataset.index;
            const row = this.closest('tr');

            const updatedDate = row.querySelector('.edit-date').value;
            const updatedLeaveStatus = row.querySelector('.edit-leave-status').value;

            timesheets[index].date = updatedDate;
            timesheets[index].leaveStatus = updatedLeaveStatus;

            try {
                const response = await fetch(`https://localhost:7172/api/Timesheet/${timesheets[index].id}`,
                    {
                        method: 'PUT',
                        headers:
                        {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(timesheets[index]),
                    });

                if (response.ok) {
                    renderTimesheets();
                } else {
                    console.error('Failed to update timesheet');
                }
            } catch (error) {
                console.error('Error updating timesheet:', error);
            }
        });
    });

    document.querySelectorAll('.edit-activity-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const activityDiv = this.closest('.activity');
            const projectSpan = activityDiv.querySelector('.project');
            const subProjectSpan = activityDiv.querySelector('.sub-project');
            const hoursSpan = activityDiv.querySelector('.hours');
            const minutesSpan = activityDiv.querySelector('.minutes');
            const descriptionSpan = activityDiv.querySelector('.description');

            activityDiv.querySelector('.edit-project').classList.remove('hidden');
            projectSpan.classList.add('hidden');

            activityDiv.querySelector('.edit-sub-project').classList.remove('hidden');
            subProjectSpan.classList.add('hidden');

            activityDiv.querySelector('.edit-hours').classList.remove('hidden');
            hoursSpan.classList.add('hidden');

            activityDiv.querySelector('.edit-minutes').classList.remove('hidden');
            minutesSpan.classList.add('hidden');

            activityDiv.querySelector('.edit-description').classList.remove('hidden');
            descriptionSpan.classList.add('hidden');

            this.classList.add('hidden');
            activityDiv.querySelector('.save-activity-btn').classList.remove('hidden');
        });
    });

    document.querySelectorAll('.save-activity-btn').forEach(btn => {
        btn.addEventListener('click', async function () {
            const activityDiv = this.closest('.activity');
            const actIndex = activityDiv.dataset.index;

            const updatedActivity =
            {
                id: timesheets[actIndex].activities[actIndex].id,
                project: activityDiv.querySelector('.edit-project').value,
                subProject: activityDiv.querySelector('.edit-sub-project').value,
                hours: parseInt(activityDiv.querySelector('.edit-hours').value),
                minutes: parseInt(activityDiv.querySelector('.edit-minutes').value),
                description: activityDiv.querySelector('.edit-description').value,
                timesheetId: timesheets[actIndex].id
            };

            try {
                const response = await fetch(`https://localhost:7172/api/Activity/${updatedActivity.id}`, {
                    method: 'PUT',
                    headers:
                    {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedActivity),
                });

                if (response.ok) {
                    renderTimesheets();
                } else {
                    console.error('Failed to update activity');
                }
            } catch (error) {
                console.error('Error updating activity:', error);
            }
        });
    });

    document.querySelectorAll('.delete-activity-btn').forEach(btn => {
        btn.addEventListener('click', async function () {
            const activityDiv = this.closest('.activity');
            const actIndex = activityDiv.dataset.index;
            const timesheetIndex = this.closest('tr').querySelector('.edit-btn').dataset.index;

            const activityId = timesheets[timesheetIndex].activities[actIndex].id;

            try {
                const response = await fetch(`https://localhost:7172/api/Activity/${activityId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    renderTimesheets();
                } else {
                    console.error('Failed to delete activity');
                }
            } catch (error) {
                console.error('Error deleting activity:', error);
            }
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async function () {
            const index = this.dataset.index;
            const timesheetId = timesheets[index].id;

            try {
                const response = await fetch(`https://localhost:7172/api/Timesheet/${timesheetId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    renderTimesheets();
                } else {
                    console.error('Failed to delete timesheet');
                }
            } catch (error) {
                console.error('Error deleting timesheet:', error);
            }
        });
    });

}
renderTimesheets();
