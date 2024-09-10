// dialog
const dialog = document.getElementById("newUserDialog");
const wrapper = document.querySelector(".wrapper");
const deletePic = document.getElementById("deletePic");

document.getElementById("newUser").addEventListener("click", () => {
  deletePic.style.display = "none";

  clearFormFields();
  dialog.showModal();
});

function clearFormFields() {
  document.getElementById("firstName").value = "";
  document.getElementById("lastName").value = "";
  document.getElementById("userEmail").value = "";
  document.getElementById("userPassword").value = "";
  document.getElementById("chooseImg").value = "";
  document.getElementById("submitBtn").style.display = "block";
}

dialog.addEventListener("click", (e) => {
  if (!wrapper.contains(e.target)) {
    dialog.close();
  }
});

// Fetch and display users
async function getRequest() {
  const response = await fetch("/users");
  const data = await response.json();

  createTable(data);
}

getRequest();

let currentPage = 1;
const recordsPerPage = 5;
const maxButtons = 10;
let sortColumn = null;
let sortDirection = "asc";

function createTable(users) {
  const result = document.getElementById("result");
  result.innerHTML = "";

  const usersTable = document.createElement("table");
  usersTable.id = "userTable";

  usersTable.innerHTML = `
      <thead>
        <tr>
            <th onclick="sortTable(0)" style="cursor: pointer;">User ID</th>
            <th>Profile Picture</th>
            <th onclick="" style="cursor: pointer;">First Name</th>
            <th onclick="" style="cursor: pointer;">Last Name</th>
            <th onclick="" style="cursor: pointer;">Email</th>
            <th onclick="" style="cursor: pointer;">Created At</th>
            <th onclick="sortTable(5)" style="cursor: pointer;">Updated At</th>    
            <th>Update / Delete</th>    
        </tr>
      </thead>
      <tbody id="resultBody"></tbody>
    `;

  result.appendChild(usersTable);

  function renderTable(users) {
    const tableBody = document.querySelector("tbody");
    tableBody.innerHTML = "";

    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, users.length);

    for (let i = startIndex; i < endIndex; i++) {
      const user = users[i];
      const row = document.createElement("tr");
      row.innerHTML = `
      <td id="${user.userId}">${
        user.userId !== undefined ? user.userId : "N/A"
      }</td>
        <td>
          ${
            user.profilePicture
              ? `<img src="${user.profilePicture}" class="profile-pic" alt="Profile Picture" style="width: 50px; height: 50px; border-radius: 50px;">`
              : " "
          }
        </td>
        <td>${user.firstName !== undefined ? user.firstName : " "}</td>
        <td>${user.lastName !== undefined ? user.lastName : " "}</td>
        <td id="${user.email}">${
        user.email !== undefined ? user.email : " "
      }</td>
        <td>${user.createdAt !== undefined ? user.createdAt : " "}</td>
        <td>${user.updatedAt !== undefined ? user.updatedAt : " "}</td>
        <td>
          <i class="classUpdate fa-solid fa-pen-to-square" id="updateBtn" onclick="updateUser(${
            user.userId
          }, '${user.firstName}', '${user.lastName}', '${user.email}', '${
        user.password
      }', '${user.profilePicture}')"></i>
          <i class="fa-brands fa-bitbucket" id="deleteBtn" onclick="deleteUser(${
            user.userId
          })"></i>
        </td>
      `;
      tableBody.appendChild(row);
    }
  }

  function renderPagination(users) {
    const paginationDiv = document.getElementById("pagination");
    paginationDiv.innerHTML = "";

    const totalRecords = users.length;
    const totalPage = Math.ceil(totalRecords / recordsPerPage);

    let startButton = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endButton = Math.min(totalPage, startButton + maxButtons - 1);

    if (endButton - startButton + 1 < maxButtons) {
      startButton = Math.max(1, endButton - maxButtons + 1);
    }

    if (currentPage > 1) {
      paginationDiv.innerHTML += `<button class="nextPre" onclick="changePage(${
        currentPage - 1
      })" style="cursor: pointer;">&#139;</button>`;
    } else {
      paginationDiv.innerHTML += `<button class="nextPre" disabled>&#139;</button>`;
    }

    for (let i = startButton; i <= endButton; i++) {
      paginationDiv.innerHTML += `<button class="dynamicBtns ${
        i === currentPage ? "active" : ""
      }" onclick="changePage(${i})" style="cursor: pointer;">${i}</button>`;
    }

    if (currentPage < totalPage) {
      paginationDiv.innerHTML += `<button class="nextPre" onclick="changePage(${
        currentPage + 1
      })" style="cursor: pointer;">&#155;</button>`;
    } else {
      paginationDiv.innerHTML += `<button class="nextPre" disabled>&#155;</button>`;
    }
  }

  function sortTable(columnIndex) {
    const columns = [
      "userId",
      "firstName",
      "lastName",
      "email",
      "createdAt",
      "updatedAt",
    ];

    if (sortColumn === columnIndex) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortColumn = columnIndex;
      sortDirection = "asc";
    }

    users.sort((a, b) => {
      let aValue = a[columns[columnIndex]];
      let bValue = b[columns[columnIndex]];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortDirection === "asc" ? -1 : 1;
      } else if (aValue > bValue) {
        return sortDirection === "asc" ? 1 : -1;
      } else {
        return 0;
      }
    });

    renderTable(users);
    renderPagination(users);
  }

  function changePage(page) {
    if (page < 1 || page > Math.ceil(users.length / recordsPerPage)) return;
    currentPage = page;
    renderTable(users);
    renderPagination(users);
  }

  renderTable(users);
  renderPagination(users);

  window.changePage = changePage;
  window.sortTable = sortTable;
}

// create user
const form = document.getElementById("form");
form.onsubmit = async function (event) {
  event.preventDefault();

  const formData = new FormData(form);

  const respone = await fetch("/createusers", {
    method: "POST",
    body: formData,
  });

  if (respone.status === 400) {
    const err = await respone.text();
    alert(err);
  }

  location.reload();
};

// delete user
async function deleteUser(userId) {
  await fetch(`/users/${userId}`, {
    method: "DELETE",
  });

  const response = await fetch("/users");
  const data = await response.json();

  createTable(data);
}

// update users
async function updateUser(userId, firstName, lastName, email, password) {
  deletePic.style.display = "block";
  deletePic.addEventListener("click", async () => {
    await fetch(`/deleteprofilepicture/${userId}`, {
      method: "DELETE",
    });

    location.reload();
  });

  const dialog = document.getElementById("newUserDialog");
  dialog.showModal();

  document.querySelectorAll("#updateBtn").forEach((button) => {
    button.addEventListener("click", () => {
      dialog.showModal();
    });
  });

  const firstNameField = document.getElementById("firstName");
  const lastNameField = document.getElementById("lastName");
  const emailField = document.getElementById("userEmail");
  const passwordField = document.getElementById("userPassword");
  const submitBtn = document.getElementById("submitBtn");
  const chooseImage = document.getElementById("chooseImg");

  firstNameField.value = firstName;
  lastNameField.value = lastName;
  emailField.value = email;
  passwordField.value = password;

  submitBtn.style.display = "none";

  [
    firstNameField,
    lastNameField,
    emailField,
    passwordField,
    chooseImage,
  ].forEach((field) => {
    field.addEventListener("input", () => {
      if (
        firstNameField.value === firstName &&
        lastNameField.value === lastName &&
        emailField.value === email &&
        passwordField.value === password &&
        chooseImage.value === ""
      ) {
        submitBtn.style.display = "none";
      } else {
        submitBtn.style.display = "block";
      }
    });
  });

  const form = document.getElementById("form");

  form.onsubmit = async function (event) {
    event.preventDefault();

    const formData = new FormData(form);

    const respone = await fetch(`/users/${userId}`, {
      method: "PATCH",
      body: formData,
    });

    if (respone.status === 400) {
      const err = await respone.text();
      alert(err);
    }

    location.reload();
  };
}

// filter by search bar
const searchBar = document.getElementById("searchBar");
searchBar.addEventListener("input", async () => {
  const response = await fetch("users/");
  const data = await response.json();

  const input = searchBar.value.trim().toLowerCase();

  console.log(input);

  let users = data.filter((users) => {
    if (
      users.userId.toString() == input ||
      users.firstName.toLowerCase().includes(input) ||
      users.lastName.toLowerCase().includes(input) ||
      users.email.toLowerCase().includes(input)
    ) {
      console.log("inside filter user", users);
      return users;
    }
  });

  console.log("outside filer user", users);

  createTable(users);
});
