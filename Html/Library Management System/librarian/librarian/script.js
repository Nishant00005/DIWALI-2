
"use strict";

const STORAGE_KEY = "libraryDemoData";

const initialData = {
  books: [
    { id: 1, title: "Atomic Habits", author: "James Clear", category: "Self-help", total: 5, available: 3 },
    { id: 2, title: "Clean Code", author: "Robert C. Martin", category: "Technology", total: 3, available: 2 },
    { id: 3, title: "Wings of Fire", author: "A. P. J. Abdul Kalam", category: "Biography", total: 4, available: 4 },
    { id: 4, title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", total: 4, available: 4 }
  ],
  students: [
    { id: 101, name: "Priya Sharma", email: "priya.demo@example.com" },
    { id: 102, name: "Rahul Kumar", email: "rahul.demo@example.com" },
    { id: 103, name: "Ananya Singh", email: "ananya.demo@example.com" }
  ],
  loans: [],
  reservations: [],
  history: ["Library demo initialized"]
};

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : structuredClone(initialData);
  } catch {
    return structuredClone(initialData);
  }
}

let data = loadData();
let nextId = Date.now();

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  render();
}

function log(message) {
  data.history.unshift(new Date().toLocaleString() + " — " + message);
}

function byId(list, id) {
  return list.find(item => String(item.id) === String(id));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[ch]);
}

function fineFor(loan) {
  if (loan.returned) return 0;
  const due = new Date(loan.dueDate + "T00:00:00");
  const today = new Date(new Date().toDateString());
  const days = Math.max(0, Math.floor((today - due) / 86400000));
  return days * 10;
}

function render() {
  const activeLoans = data.loans.filter(loan => !loan.returned);
  const available = data.books.reduce((sum, book) => sum + book.available, 0);
  const fines = activeLoans.reduce((sum, loan) => sum + fineFor(loan), 0);

  document.querySelector("#totalBooks").textContent =
    data.books.reduce((sum, book) => sum + book.total, 0);
  document.querySelector("#availableBooks").textContent = available;
  document.querySelector("#activeLoans").textContent = activeLoans.length;
  document.querySelector("#totalFines").textContent = "₹" + fines;

  const query = document.querySelector("#search").value.toLowerCase();
  const books = data.books.filter(book =>
    `${book.title} ${book.author} ${book.category}`.toLowerCase().includes(query)
  );

  document.querySelector("#bookRows").innerHTML = books.map(book => `
    <tr>
      <td>${escapeHTML(book.title)}</td>
      <td>${escapeHTML(book.author)}</td>
      <td>${escapeHTML(book.category)}</td>
      <td>${book.available} / ${book.total}</td>
      <td>
        <button data-edit="${book.id}">Edit</button>
        <button data-delete="${book.id}">Delete</button>
      </td>
    </tr>
  `).join("");

  document.querySelector("#studentRows").innerHTML = data.students.map(s => `
    <tr>
      <td>${escapeHTML(s.name)}</td>
      <td>${escapeHTML(s.email)}</td>
      <td>${escapeHTML(s.id)}</td>
    </tr>
  `).join("");

  document.querySelector("#issueStudent").innerHTML = data.students.map(s =>
    `<option value="${s.id}">${escapeHTML(s.name)}</option>`
  ).join("");

  document.querySelector("#issueBook").innerHTML = data.books
    .filter(b => b.available > 0)
    .map(b => `<option value="${b.id}">${escapeHTML(b.title)} (${b.available} available)</option>`)
    .join("");

  document.querySelector("#loanRows").innerHTML = activeLoans.map(loan => {
    const b = byId(data.books, loan.bookId);
    const s = byId(data.students, loan.studentId);
    return `<tr>
      <td>${escapeHTML(b?.title || "Deleted book")}</td>
      <td>${escapeHTML(s?.name || "Unknown")}</td>
      <td>${escapeHTML(loan.dueDate)}</td>
      <td>₹${fineFor(loan)}</td>
      <td><button data-return="${loan.id}">Return</button></td>
    </tr>`;
  }).join("");

  document.querySelector("#reservationRows").innerHTML = data.reservations.map(r => `
    <tr>
      <td>${escapeHTML(byId(data.books, r.bookId)?.title || "Unknown")}</td>
      <td>${escapeHTML(byId(data.students, r.studentId)?.name || "Unknown")}</td>
      <td>${escapeHTML(r.date)}</td>
      <td>${escapeHTML(r.status)}</td>
      <td>${r.status === "Pending" ? `<button data-approve="${r.id}">Approve</button> <button data-cancel="${r.id}">Cancel</button>` : "—"}</td>
    </tr>
  `).join("");

  document.querySelector("#historyRows").innerHTML = data.history
    .map(item => `<li>${escapeHTML(item)}</li>`).join("");

  document.querySelector("#reportSummary").textContent =
    `${data.books.length} titles, ${available} available copies, ` +
    `${activeLoans.length} active loans, ${data.students.length} students, ` +
    `${data.reservations.filter(r => r.status === "Pending").length} pending reservations.`;
}

function showView(id) {
  document.querySelectorAll(".view").forEach(section =>
    section.classList.toggle("hidden", section.id !== id)
  );
  document.querySelectorAll(".sidebar button[data-view]").forEach(button =>
    button.classList.toggle("active", button.dataset.view === id)
  );
  const button = document.querySelector(`[data-view="${id}"]`);
  document.querySelector("#pageTitle").textContent = button?.textContent || "Dashboard";
}

document.querySelectorAll("[data-view]").forEach(button => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

function addBook(existing = null) {
  const title = prompt("Book title:", existing?.title || "");
  if (title === null || !title.trim()) return;
  const author = prompt("Author:", existing?.author || "");
  if (author === null || !author.trim()) return;
  const category = prompt("Category:", existing?.category || "Fiction");
  if (category === null || !category.trim()) return;

  if (existing) {
    existing.title = title.trim();
    existing.author = author.trim();
    existing.category = category.trim();
  } else {
    const total = Number(prompt("Total copies:", "1"));
    if (!Number.isInteger(total) || total < 1) {
      alert("Enter a valid number of copies.");
      return;
    }
    data.books.push({
      id: ++nextId,
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      total,
      available: total
    });
  }
  log((existing ? "Updated " : "Added ") + title.trim());
  save();
}

document.querySelector("#addBook").addEventListener("click", () => addBook());
document.querySelector("#quickAdd").addEventListener("click", () => {
  showView("books");
  addBook();
});

document.querySelector("#bookRows").addEventListener("click", event => {
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;

  if (editId) {
    const book = byId(data.books, editId);
    if (book) addBook(book);
  }

  if (deleteId) {
    const book = byId(data.books, deleteId);
    if (!book) return;
    if (data.loans.some(l => String(l.bookId) === String(book.id) && !l.returned)) {
      alert("Return this book's active loans before deleting it.");
      return;
    }
    if (confirm(`Delete "${book.title}"?`)) {
      data.books = data.books.filter(b => String(b.id) !== String(deleteId));
      log("Deleted " + book.title);
      save();
    }
  }
});

document.querySelector("#addStudent").addEventListener("click", () => {
  const name = prompt("Student full name:");
  if (!name?.trim()) return;
  const email = prompt("Student email:");
  if (!email?.trim()) return;
  data.students.push({ id: ++nextId, name: name.trim(), email: email.trim() });
  log("Added student " + name.trim());
  save();
});

document.querySelector("#issueForm").addEventListener("submit", event => {
  event.preventDefault();
  const studentId = Number(document.querySelector("#issueStudent").value);
  const bookId = Number(document.querySelector("#issueBook").value);
  const dueDate = document.querySelector("#dueDate").value;
  const book = byId(data.books, bookId);

  if (!book || book.available < 1) {
    alert("No available copy of this book.");
    return;
  }
  if (!dueDate || dueDate < new Date().toISOString().slice(0, 10)) {
    alert("Choose a valid due date.");
    return;
  }

  book.available--;
  data.loans.push({
    id: ++nextId, bookId, studentId,
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate, returned: false
  });
  log(`Issued ${book.title} to ${byId(data.students, studentId)?.name}`);
  save();
  event.target.reset();
});

document.querySelector("#loanRows").addEventListener("click", event => {
  const id = event.target.dataset.return;
  if (!id) return;
  const loan = byId(data.loans, id);
  if (!loan || loan.returned) return;

  loan.returned = true;
  const book = byId(data.books, loan.bookId);
  if (book) book.available = Math.min(book.total, book.available + 1);
  log(`Returned ${book?.title || "a book"}; estimated fine ₹${fineFor({ ...loan, returned: false })}`);
  save();
});

document.querySelector("#addReservation").addEventListener("click", () => {
  if (!data.books.length || !data.students.length) {
    alert("Add at least one book and student first.");
    return;
  }
  const bookId = Number(prompt("Enter book ID:\n" + data.books.map(b => `${b.id}: ${b.title}`).join("\n")));
  const studentId = Number(prompt("Enter student ID:\n" + data.students.map(s => `${s.id}: ${s.name}`).join("\n")));
  if (!byId(data.books, bookId) || !byId(data.students, studentId)) {
    alert("Invalid book or student ID.");
    return;
  }
  data.reservations.push({
    id: ++nextId, bookId, studentId,
    date: new Date().toISOString().slice(0, 10), status: "Pending"
  });
  log("Created a reservation");
  save();
});

document.querySelector("#reservationRows").addEventListener("click", event => {
  const id = event.target.dataset.approve || event.target.dataset.cancel;
  if (!id) return;
  const reservation = byId(data.reservations, id);
  if (!reservation) return;
  reservation.status = event.target.dataset.approve ? "Approved" : "Cancelled";
  log("Reservation " + reservation.status.toLowerCase());
  save();
});

document.querySelector("#search").addEventListener("input", () => {
  showView("books");
  render();
});

document.querySelector("#exportReport").addEventListener("click", () => {
  const rows = [
    ["Metric", "Value"],
    ["Book titles", data.books.length],
    ["Available copies", data.books.reduce((s, b) => s + b.available, 0)],
    ["Students", data.students.length],
    ["Active loans", data.loans.filter(l => !l.returned).length],
    ["Pending reservations", data.reservations.filter(r => r.status === "Pending").length]
  ];
  download("library-report.csv", rows.map(row => row.join(",")).join("\r\n"), "text/csv");
});

document.querySelector("#exportBackup").addEventListener("click", () => {
  download("library-demo-backup.json", JSON.stringify(data, null, 2), "application/json");
});

function download(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
render();