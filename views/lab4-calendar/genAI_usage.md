The error I introduced: I misspelled a word in the code. 
I predict that it'll throw an undefined error. 
It gave me the message "uncaught reference error: projt is not defined
I went in and fixed it in the code. 

3 test cases that should pass 
1. https://zoom.us/j/1234567890 -- which is a Standard Zoom link, https, path with numbers
2. http://example.com - bare http domain, no path. 
3. https://meet.google.com/abd-defg-hij?authuser=0 -- https, subdomain-style host, path, and a query string. 

3 test cases that should fail:
1. ftp://example.com -- this is a valid URL, but wrong protocol (not http/https)
2. www.example.com -- missing the http:// / https:// scheme entirely. 
https:// -- has a scheme but no actua domain/host after it. 

One line of modal code: <label for="event_name" class="form-label">Event Name</label>

This line has HTML Behavior that connects to Bootstrap styling. the for="event_name", this is native HTML element. 
The class="form-label" is the bootstrap contribution, which adds the visual elements. 

Behavior Table for modality: 
In person --> Location is visible --> remote URL is not visible --> Location is required --> Remote URL is not required

Remote --> Location is not visible --> remote URL is visible --> Location is not required --> remote URL is required

Interaction 1: ## Interaction 1

**Tool/model:**: Claude

**My plan or attempt before prompting:** I was working on the save Event code, but it wasn't working as expected

**Prompt:**: Give me feedback on how to fix this code. 

**Relevant response:**
Give me feedback on how to fix this code: 

```html
function saveEvent() {
    const form = document.getElementById('event_form');
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }
    form.classList.add('was-validated');
    // Event save logic goes here.

    const eventDetails = {
        name: , /* form value */
        weekday: , /* form value */
        time: , /* form value */
        modality: , /* form value */
        location: ,  /* value or null */
        remote_url: , /* value or null */
        attendees: , /* list or string*/
        category: , /* form value */
    };
    
    const modalElement = document.getElementbyID('event_modal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.hide;
  }
```Good structure overall — the validation check and the modal-close approach are both right. But there are several bugs, ranging from syntax errors that will crash the page to logic gaps. Going through them:

**1. This isn't HTML — don't wrap it in a code block labeled `html`**
This is plain JavaScript. If it's sitting in a `<script>` tag or in `script.js`, fine — just flagging that the language label was wrong, since it can cause confusion about where this code belongs.

**2. The `eventDetails` object has a syntax error — every property is empty**
```js
name: , /* form value */
```
This isn't valid JavaScript. A property needs a value between the colon and the comma; `name: ,` will throw `Uncaught SyntaxError: Unexpected token ','` and stop the whole script from running. You need to actually read each value from the DOM:
```js
name: document.getElementById('event_name').value,
weekday: document.getElementById('event_weekday').value,
time: document.getElementById('event_time').value,
modality: document.getElementById('event_modality').value,
```

**3. `location` / `remote_url` need conditional logic, not just a DOM read**
The assignment wants whichever field doesn't apply to be `null`, not just its raw (empty) value:
```js
location: document.getElementById('event_modality').value === 'in-person'
  ? document.getElementById('event_location').value
  : null,
remote_url: document.getElementById('event_modality').value === 'remote'
  ? document.getElementById('event_remote_url').value
  : null,
```

**4. `category` has no matching form field**
Your modal doesn't have an `event_category` input, so there's nothing to read here. Either add a category field to the form, or drop this property from the object until you do — as written it'll always be `undefined`.

**5. `attendees` needs to be split into a list**
The field stores a comma-separated string; reading it raw gives you one long string, not the "list or string" the object comment asks for cleanly:
```js
attendees: document.getElementById('event_attendees').value
  .split(',')
  .map(name => name.trim())
  .filter(Boolean),
```

**6. `document.getElementbyID` — wrong capitalization**
JavaScript is case-sensitive; the real method is `getElementById` (lowercase `b`, capital `I`, capital `D`). As written, this throws `TypeError: document.getElementbyID is not a function`.
```js
const modalElement = document.getElementById('event_modal');
```

**7. `modal.hide;` is missing parentheses — it doesn't call the function**
`hide` is a method; without `()` you're just referencing the function object, not invoking it, so the modal never actually closes.
```js
modal.hide();
```

**8. Nothing is done with `eventDetails` after building it**
Per the spec, after creating the object you still need to:
```js
events.push(eventDetails);
console.log(events);          // verify contents during development
addEventToCalendarUI(eventDetails);
```
Right now the object is built and then discarded — it's never stored or rendered.

**9. The form is never reset**
After a successful save, add:
```js
form.reset();
form.classList.remove('was-validated');
```
Otherwise the modal reopens with the previous event's values still in it (and the visible-field toggle state won't reset either, so you'll want to manually hide both the Location and Remote URL groups afterward, same as I mentioned earlier).

Once those nine points are addressed, `saveEvent()` should match the spec end-to-end: validate → build the object → store it → render it → reset → close.

**What was correct:**: It was able to walk me through step by step on how to fix my code. 

**What needed revision/meaningful change I made:**: I made sure that it included all my variable names. 

**How I tested it:**: Pushed it and tested the code. 

**One line I can explain:**: name: document.getElementById('event_name').value, this line calls the getElementById function and then sets the value to name. 


## Interaction 1

**Tool/model:** Claude

**My plan or attempt before prompting:** worked through a mental map of how to add the event category input. 

**Prompt:** How do I add an event_category input

**Relevant response:**
Add it as a new form group inside `#event_form`, following the same pattern as your other fields. A `<select>` makes sense for a category (keeps it constrained to consistent values you can use for filtering/styling later), but a text input works too if you want open-ended categories — I'll show the select version.

Insert this block wherever you want it in the form (e.g., right after Event Name, or near the end before Attendees):

```html
<!-- Category -->
<div class="mb-3">
  <label for="event_category" class="form-label">Category</label>
  <select class="form-select" id="event_category" required>
    <option value="" selected disabled>Choose a category...</option>
    <option value="class">Class</option>
    <option value="work">Work</option>
    <option value="personal">Personal</option>
    <option value="social">Social</option>
    <option value="other">Other</option>
  </select>
  <div class="invalid-feedback">Please choose a category.</div>
</div>
```

Swap the `<option>` values for whatever categories actually make sense for your calendar — these are just placeholders.

Then in `saveEvent()`, read it like your other fields:

```js
category: document.getElementById('event_category').value,
```

And if you want the category to show up on the event card, add it into `createEventCard()`'s template as well:

```js
<div>${eventDetails.category}</div>
```

One thing to double check: since you marked it `required`, `form.checkValidity()` will now also block Save until a category is chosen — that's probably what you want, but worth confirming it matches your assignment's intent (if category should be optional, drop `required` and the `invalid-feedback` div).

**What was correct:**: most of it was correct

**What needed revision/meaningful change I made:** I appreciated how it walked me through how this process was similar to the other functions I had already. 

**How I tested it:**: saved and tested it. 

**One line I can explain:**: <option value="" selected disabled>Choose a category...</option> initaties a dropdown with different choices. 


