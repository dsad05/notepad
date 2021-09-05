const electron = require("electron");
const { ipcRenderer } = require("electron");
const path = require("path");

window.addEventListener("DOMContentLoaded", () => {
    const el = {
      documentName: document.getElementById("documentName"),
      // newFileBtn: document.getElementById("newFileBtn"),
      openDocumentBtn: document.getElementById("openDocumentBtn"),
      saveDocumentBtn: document.getElementById("saveDocumentBtn"),
      createDocumentBtn: document.getElementById("createDocumentBtn"),
      fileTextarea: document.getElementById("fileTextarea"),
    };
  
    const handleDocumentChange = (filePath) => {
      el.documentName.innerHTML = path.parse(filePath).base;
      el.fileTextarea.focus();
    };

    el.createDocumentBtn.addEventListener("click", () => {
      ipcRenderer.send("create-document-triggered", el.fileTextarea.value);
    });
  
    el.openDocumentBtn.addEventListener("click", () => {
      ipcRenderer.send("open-document-triggered");
    });
    
    el.saveDocumentBtn.addEventListener("click", () => {
      ipcRenderer.send("save-document-triggered", el.fileTextarea.value);
    });
    // el.fileTextarea.addEventListener("input", (e) => {
    //   ipcRenderer.send("file-content-updated", e.target.value);
    // });

    fun = function(e) {
      ipcRenderer.send("file-content-updated", e.target.value);
    }

    el.fileTextarea.addEventListener("input", fun)


    ipcRenderer.on("document-opened", (_, { filePath, content }) => {
      el.fileTextarea.value = content;
      handleDocumentChange(filePath, content);
    });
  
    ipcRenderer.on("document-created", (_, filePath) => {
      handleDocumentChange(filePath);
    });

    ipcRenderer.on("document-saved", (_, content ) => {
    })
  });