const { app, BrowserWindow, ipcMain, dialog } = require("electron");

function boot() {
  win = new BrowserWindow({
    width: 1350,
    height: 900,
    resizable: false,
    backgroundColor: "#eeebf0",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });
  win.loadURL(`file://${__dirname}/pages/home.html`);
  win.on("closed", () => {
    win = "null";
  });
}
app.on("ready", boot);

// link database:
const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./database/electronDesktopDb.sqlite",
  },
});

// get members list from database

ipcMain.on("LoadMembersList", (event) => {
  let result = knex.select().from("members");
  result.then((row) => {
    event.sender.send("MembersListLoaded", row);
  });
});

// ajout trainer list to database

ipcMain.on("AjoutTrainerList", (event, args) => {
  var ajout = knex("trainers")
    .insert({
      name: args[0],
      lastname: args[1],
      email: args[2],
      phone: args[3],
    })
    .then(function (new_trainer) {
      event.sender.send("TrainerListAdd");
    });
});

// show error

ipcMain.on("showError", (event, msg) => {
  dialog.showErrorBox("Error", msg);
});

// insert members into DB
ipcMain.on("addToDataB", (event, args) => {
  knex("members")
    .insert({
      name: args[0],
      lastname: args[1],
      email: args[2],
      phone: args[3],
    })
    .then(() => {
      // showMessageBoxSync 5ater lazem yestanna yetna7a l box bech yet3adda lalli ba3dou so ta5ou wa9t

      dialog.showMessageBoxSync({
        ...options,
        detail: "member added succesfully",
      });
      event.sender.send("reload");
    });
});

// message box option

const options = {
  type: "info",
  message: "Message",
  button: "OK",
  detail: "member has been delete",
};

// delete members from database with id

ipcMain.on("deleteMember", (event, id) => {
  knex("members")
    .where("id", id)
    .del()
    .then(() => {
      dialog.showMessageBoxSync(options);
      event.sender.send("reload");
    });
});

//jebt member info mel DB bech 3abbit inputs modal

ipcMain.on("getModelInput", (event, id) => {
  let result = knex.select().from("members").where("id", id);
  result.then((row) => {
    event.sender.send("inputModelLoaded", row);
  });
});

//  update members from modal

ipcMain.on("updateMember", (event, args) => {
  knex("members").where("id", args[0]).update({
    name:args[1],  
    lastname:args[2],
    email:args[3],
    phone:args[4]
  }).then(
    dialog.showMessageBoxSync({
      ...options,
      detail: "member update succesfully",
    }),
    event.sender.send("reload")
  )
});
