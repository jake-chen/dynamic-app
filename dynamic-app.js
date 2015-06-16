var tasks = new Mongo.Collection("tasks");
var buttonList = ["cleardbs"];
if (Meteor.isClient) {
  Template.body.helpers({
    tasks: function() {
      if (Session.get("hideCompleted")) {
        return tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      }
      else {
        return tasks.find({},{sort:{createdAt: -1}});
      }
    },
    buttonList: buttonList,
    isAdmin: function() {
      return (Meteor.user().username === "admin");
    }
  });
  
  Template.cleardbs.events({
    "click .clearAll": function(event) {
      Meteor.call("clearAll");
    }
  });
  
  Template.body.events({
    "change .hide-completed input": function(event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });
  
  Template.addForm.events({
    "submit .new-task": function(event, ti) {
      
      var toInsert = event.target.text.value;
      Meteor.call("addTask", toInsert);
      
      event.target.text.value = "";
      
      return false;
    }
  });
    
  Template.task.events({
    "click .toggle-checked": function(event){
      Meteor.call("setChecked", this._id, !this.checked);
    },
    
    "click .delete": function(event) {
      Meteor.call("deleteTask", this._id);
    }
  });
  
  Accounts.ui.config({
    passwordSignupFields:"USERNAME_ONLY"
  });
}

Meteor.methods({
  addTask: function(text) {
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    
    tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function(taskId) {
    tasks.remove(taskId);
  },
  setChecked: function(taskId, setChecked) {
    tasks.update(taskId, {$set: {checked: setChecked}});
  },
  clearAll: function() {
    if (Meteor.user().username === "admin") {
      tasks.remove({});
    }
    else{
      throw new Meteor.Error("not-authorized");
    }
  }
});

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
