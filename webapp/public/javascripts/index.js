function buildSettingsForm() {
  const hairSelect = document.getElementById("hair-select");
  const eyeSelect = document.getElementById("eye-select");
  const typeSelect = document.getElementById("archetype-select");

  hairColors = ["Black", "Blonde", "Brown", "Red", "White"];
  eyeColors = ["Blue", "Brown", "Green", "Gray", "Hazel"];
  charaTypes = ["Dandere", "Deredere", "Kuudere", "Teasedere", "Tsundere"];

  for (var i = 0; i < hairColors.length; i++) {
    const newOption = document.createElement("option");
    newOption.value = hairColors[i];
    newOption.text = hairColors[i];
    hairSelect.append(newOption);
  }

  for (var i = 0; i < eyeColors.length; i++) {
    const newOption = document.createElement("option");
    newOption.value = eyeColors[i];
    newOption.text = eyeColors[i];
    eyeSelect.append(newOption);
  }

  for (var i = 0; i < charaTypes.length; i++) {
    const newOption = document.createElement("option");
    newOption.value = charaTypes[i];
    newOption.text = charaTypes[i];
    typeSelect.append(newOption);
  }
}

function loadTasks(user_id) {
  fetch(window.location.origin + "/tasks/get?user_id=" + user_id)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Task response was not OK");
      }
      return response.json();
    })
    .then((data) => {
      const taskList = document.getElementById("task-list");

      for (row in data.tasks) {
        const newElement = createNewTaskElement(
          data.tasks[row].task_id,
          data.tasks[row].task_desc,
          data.tasks[row].task_done
        );
        taskList.append(newElement);
      }
    })
    .catch((error) => {
      console.error("Task GET error:", error);
    });
}

function displayTypeHelp() {
  const charaTypeDesc = [
    "",
    "An introverted character who becomes more expressive around someone they trust.",
    "A character who is consistently sweet, affectionate, and cheerful.",
    "A character that is outwardly aloof but secretly compassionate.",
    "A character who playfully teases others.",
    "A character that starts off as cold and aloof but later become warm and affectionate.",
  ];
  const typeIndex = document.getElementById("archetype-select").selectedIndex;

  document.getElementById("chara-type-help").innerHTML =
    charaTypeDesc[typeIndex];
}

function loadChara(user_id) {
  const charaName = document.getElementById("chara-name");
  const hairSelect = document.getElementById("hair-select");
  const eyeSelect = document.getElementById("eye-select");
  const typeSelect = document.getElementById("archetype-select");

  // TODO: Think of better way to load default characters.
  charaName.value = "Nicholas";
  hairSelect.value = "Brown";
  eyeSelect.value = "Green";
  typeSelect.value = "Tsundere";
  displayTypeHelp();

  fetch(window.location.origin + "/chara/get?chara_id=1&user_id=" + user_id)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Chara response was not OK");
      }
      return response.json();
    })
    .then((data) => {
      if (data.chara.length > 0) {
        charaName.value = data.chara[0].chara_name;
        hairSelect.value = data.chara[0].chara_hair;
        eyeSelect.value = data.chara[0].chara_eyes;
        typeSelect.value = data.chara[0].chara_type;
        displayTypeHelp();
      }
    })
    .catch((error) => {
      console.error("Task GET error:", error);
    });
}

function showTasksSpace() {
  const tasksSpace = document.getElementById("tasks-space");
  const rewardsSpace = document.getElementById("rewards-space");
  const settingsSpace = document.getElementById("settings-space");

  tasksSpace.style.display = "block";
  rewardsSpace.style.display = "none";
  settingsSpace.style.display = "none";
}

function insertIntoList(item, list) {
  var firstComplete = null;

  for (var i = 0; i < list.children.length; i++) {
    if (list.children[i].getAttribute("data-task-done") == 1) {
      firstComplete = list.children[i];
      break;
    }
  }

  if (firstComplete !== null) {
    item.remove();
    list.insertBefore(item, firstComplete);
  } else {
    list.append(item);
  }
}

function createNewTaskElement(taskID, taskDescription, taskDone) {
  const newTask = document.createElement("li");

  newTask.setAttribute(
    "class",
    "list-group-item d-flex justify-content-between align-items-center"
  );
  newTask.setAttribute("data-task-id", taskID);
  newTask.setAttribute("data-task-done", taskDone);

  if (taskDone == 0) {
    newTask.innerHTML = `
      <input class="form-check-input me-1" type="checkbox" value="" id="taskCheckbox${taskID}">
      <div id="task-desc${taskID}">${taskDescription}</div>
      <span class="badge text-bg-light rounded-pill shadow-sm" style="font-size:12pt;">&times;</span>`;
  } else {
    newTask.innerHTML = `
      <input class="form-check-input me-1" type="checkbox" value="" id="taskCheckbox${taskID}" checked disabled>
      <div id="task-desc${taskID}"><s>${taskDescription}</s></div>
      <span class="badge text-bg-light rounded-pill shadow-sm" style="font-size:12pt;">&times;</span>`;
  }

  return newTask;
}

function addTaskToDB(user_id, taskDescription) {
  fetch(window.location.origin + "/tasks/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ task_desc: taskDescription, user_id: user_id }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const taskList = document.getElementById("task-list");

      const newElement = createNewTaskElement(data.task_id, taskDescription, 0);
      insertIntoList(newElement, taskList);
    })
    .catch((error) => {
      console.error("Task POST error:", error);
    });
}

function markTaskAsClosedInDB(user_id, taskID) {
  const taskDesc = document.getElementById("task-desc" + taskID).innerHTML;

  fetch(window.location.origin + "/tasks/closed", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ task_id: taskID, user_id: user_id }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Task response was not OK");
      }
      return response.json();
    })
    .then((data) => {
      generateRewardContent(user_id, taskDesc);
    })
    .catch((error) => {
      console.error("Task POST error:", error);
    });
}

function deleteTaskFromDB(user_id, taskID) {
  fetch(window.location.origin + "/tasks/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ task_id: taskID, user_id: user_id }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      //console.log(data);
    })
    .catch((error) => {
      console.error("Task POST error:", error);
    });
}

function showRewardToast() {
  const rewardToast = document.getElementById("reward-toast");
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(rewardToast);
  toastBootstrap.show();
}

async function generateRewardContent(user_id, taskDesc) {
  const charaName = document.getElementById("chara-name");
  const hairSelect = document.getElementById("hair-select");
  const eyeSelect = document.getElementById("eye-select");
  const typeSelect = document.getElementById("archetype-select");

  // Save rewards content.
  const formData = new FormData();
  formData.append("user_id", user_id);
  formData.append("chara_name", charaName.value);
  formData.append("chara_hair", hairSelect.value);
  formData.append("chara_eyes", eyeSelect.value);
  formData.append("chara_type", typeSelect.value);
  formData.append("task_desc", taskDesc);
  const json = JSON.stringify(Object.fromEntries(formData));

  fetch(window.location.origin + "/rewards/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: json,
  })
    .then((response) => {
      if (!response.ok) {
        console.log(response);
        throw new Error("Database response was not OK");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);

      showRewardToast();
      document.getElementById("rewards-badge").style.display = "block";
    })
    .catch((error) => {
      console.error("Database GET error:", error);
    });

  /*
    const url = new URL(window.location.origin + '/openai/get');
    url.search = new URLSearchParams({
      "chara_name": charaName.value, 
      "chara_hair": hairSelect.value,
      "chara_eyes": eyeSelect.value,
      "chara_type": typeSelect.value, 
      "task_desc": taskDesc,
    });
    fetch(url.toString(),{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(response => {
      if (!response.ok) {
        throw new Error('OpenAI response was not OK');
      }
      return response.json();
    }).then(data => {
        document.getElementById("chara-modal-img").src = `data:image/jpeg;base64,${data.image}`;
        document.getElementById("chara-modal-text").innerHTML = `<div class="col-10" style="height: 175px; overflow: scroll;"><p>${data.text}</p></div>`;
        var charaModal = document.getElementById("chara-modal");
        var charaModalPopup = new bootstrap.Modal(charaModal, {});
        charaModalPopup.show();
    }).catch(error => {
      console.error('OpenAI GET error:', error);
      document.getElementById("chara-modal-text").innerHTML = "";
      document.getElementById("chara-modal-img").src = "";
    });*/
}

function showRewards(user_id) {
  const tasksSpace = document.getElementById("tasks-space");
  const rewardsSpace = document.getElementById("rewards-space");
  const settingsSpace = document.getElementById("settings-space");
  const rewardCardGrid = document.getElementById("reward-card-grid");

  fetch(window.location.origin + "/rewards/get?user_id=" + user_id)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Task response was not OK");
      }
      return response.json();
    })
    .then((data) => {
      const rewards = data.rewards;
      for (var i = 0; i < rewards.length; i++) {
        const cardCol = document.createElement("div");
        const card = document.createElement("div");
        const cardBody = document.createElement("div");

        cardCol.setAttribute("class", "col");
        card.setAttribute("class", "card shadow");
        cardBody.setAttribute("class", "card-body m-1");

        cardCol.append(card);
        card.append(cardBody);

        if (rewards[i].reward_paragraph.length > 0) {
          cardBody.innerHTML = `<p class="card-text" style="height: 175px; overflow: scroll;">${rewards[i].reward_paragraph}</p>`;
        }

        if (rewards[i].reward_filename.length > 0) {
          fetch(
            window.location.origin +
              "/images/get?user_id=" +
              user_id +
              "&filename=" +
              rewards[i].reward_filename
          )
            .then((response) => {
              if (!response.ok) {
                throw new Error("Task response was not OK");
              }
              return response.blob();
            })
            .then((data) => {
              const imageURL = URL.createObjectURL(data);
              const imgElement = document.createElement("img");
              imgElement.setAttribute("class", "card-img-top");
              imgElement.setAttribute(
                "style",
                "height: 275px; object-fit: cover;"
              );
              imgElement.src = imageURL;

              card.prepend(imgElement);
            })
            .catch((error) => {
              console.error("Task GET error:", error);
            });
        }

        rewardCardGrid.append(cardCol);
      }

      rewardsSpace.style.display = "block";
      tasksSpace.style.display = "none";
      settingsSpace.style.display = "none";

      document.getElementById("rewards-badge").style.display = "none";
    })
    .catch((error) => {
      console.error("Task GET error:", error);
    });
}
