// Stores every saved event in memory
const events = [];
let editingIndex = null; // null = creating a new event; a number = editing events[editingIndex]

// 3. Toggle Location vs Remote URL fields based on modality
function updateLocationOptions(modalityValue) {
  const locationGroup = document.getElementById('event_location_group');
  const remoteUrlGroup = document.getElementById('event_remote_url_group');
  const locationInput = document.getElementById('event_location');
  const remoteUrlInput = document.getElementById('event_remote_url');

  const isInPerson = modalityValue === 'in-person';
  const isRemote = modalityValue === 'remote';

  locationGroup.classList.toggle('d-none', !isInPerson);
  remoteUrlGroup.classList.toggle('d-none', !isRemote);

  locationInput.required = isInPerson;
  remoteUrlInput.required = isRemote;

  if (!isInPerson) locationInput.value = '';
  if (!isRemote) remoteUrlInput.value = '';
}

// Resets the modal to "create" mode. Call this from the Create Event button.
function startNewEvent() {
  editingIndex = null;
  document.querySelector('#event_modal .modal-title').textContent = 'Add Event';
  document.querySelector('#event_modal .btn-primary').textContent = 'Save Event';
}

// 4. Save event data (also handles updating an existing event)
function saveEvent() {
  const form = document.getElementById('event_form');

  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  const modality = document.getElementById('event_modality').value;

  const eventDetails = {
    name: document.getElementById('event_name').value,
    weekday: document.getElementById('event_weekday').value,
    time: document.getElementById('event_time').value,
    modality: modality,
    location: modality === 'in-person' ? document.getElementById('event_location').value : null,
    remote_url: modality === 'remote' ? document.getElementById('event_remote_url').value : null,
    attendees: document.getElementById('event_attendees').value
      .split(',')
      .map(name => name.trim())
      .filter(Boolean),
    category: document.getElementById('event_category').value,
  };

  if (editingIndex === null) {
    events.push(eventDetails);
  } else {
    events[editingIndex] = eventDetails;
  }
  console.log(events); // verify contents during development

  redrawCalendar();

  form.reset();
  form.classList.remove('was-validated');
  document.getElementById('event_location_group').classList.add('d-none');
  document.getElementById('event_remote_url_group').classList.add('d-none');
  document.getElementById('event_location').required = false;
  document.getElementById('event_remote_url').required = false;
  editingIndex = null;

  const modalElement = document.getElementById('event_modal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  modal.hide();
}

// 5i. Build the DOM element for one event
function createEventCard(eventDetails, index) {
  const eventElement = document.createElement('div');
  eventElement.className = `event row border rounded m-1 py-1 event-${eventDetails.category}`;
  eventElement.addEventListener('click', () => openEventModalForEdit(index));

  const locationLine = eventDetails.modality === 'in-person'
    ? eventDetails.location
    : eventDetails.remote_url;

  const detailsElement = document.createElement('div');
  detailsElement.className = 'col';
  detailsElement.innerHTML = `
    <div class="fw-bold">${eventDetails.name}</div>
    <div>${eventDetails.time}</div>
    <div>${eventDetails.modality === 'in-person' ? 'In-Person' : 'Remote'}</div>
    <div>${locationLine}</div>
    <div>${eventDetails.attendees.join(', ')}</div>
    <div>${eventDetails.category}</div>
  `;

  eventElement.appendChild(detailsElement);
  return eventElement;
}

// 5ii. Place the card in the correct weekday column
function addEventToCalendarUI(eventInfo, index) {
  const card = createEventCard(eventInfo, index);
  const columnId = eventInfo.weekday.toLowerCase(); // "Monday" -> "monday"
  const column = document.getElementById(columnId);
  column.appendChild(card);
}

// Opens the modal pre-filled with an existing event's data, for editing
function openEventModalForEdit(index) {
  editingIndex = index;
  const eventDetails = events[index];

  document.getElementById('event_name').value = eventDetails.name;
  document.getElementById('event_weekday').value = eventDetails.weekday;
  document.getElementById('event_time').value = eventDetails.time;
  document.getElementById('event_modality').value = eventDetails.modality;
  document.getElementById('event_category').value = eventDetails.category;
  document.getElementById('event_attendees').value = eventDetails.attendees.join(', ');

  updateLocationOptions(eventDetails.modality);

  if (eventDetails.modality === 'in-person') {
    document.getElementById('event_location').value = eventDetails.location;
  } else {
    document.getElementById('event_remote_url').value = eventDetails.remote_url;
  }

  document.querySelector('#event_modal .modal-title').textContent = 'Edit Event';
  document.querySelector('#event_modal .btn-primary').textContent = 'Update Event';

  const modalElement = document.getElementById('event_modal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  modal.show();
}

// Removes all rendered event cards (used before a full redraw)
function clearCalendarUI() {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  days.forEach(day => {
    const column = document.getElementById(day);
    column.querySelectorAll('.event').forEach(card => card.remove());
  });
}

// Clears and re-renders every event from the events array
function redrawCalendar() {
  clearCalendarUI();
  events.forEach((eventDetails, index) => addEventToCalendarUI(eventDetails, index));
}