Posts = new Meteor.Collection("posts");
Meteor.autosubscribe(function () {
  Meteor.subscribe("directory");
  Meteor.subscribe("restrictiveUsers");
  Meteor.subscribe("posts");
});

Template.editor.rendered = function() {
  if (Meteor.user() !== null)
  {
    new Medium({
      element: document.getElementById('editor'),
      modifier: 'auto',
      placeholder: "This is Sagacity, a simple writing platform. To get going, just start typing. It supports all your favorite keyboard shortcuts too! If you're on a modern browser, your content will save automatically and be waiting for you when you come back!",
      autofocus: false,
      autoHR: true,
      mode: 'rich',
      maxLength: -1,
      modifiers: {
          66: 'bold',
          73: 'italicize',
          85: 'underline',
          86: 'paste'
      },
      tags: {
          paragraph: 'p',
          outerLevel: ['pre','blockquote', 'figure', 'hr'],
          innerLevel: ['a', 'b', 'u', 'i', 'img', 'strong']
      },
      cssClasses: {
          editor: 'Medium',
          pasteHook: 'Medium-paste-hook',
          placeholder: 'Medium-placeholder'
      }
    });
    new Medium({
      element: document.getElementById('title'),
      mode: 'inline',
      maxLength: 25,
      placeholder: 'Sagacity. Your Title'
    });
    if(typeof(Storage)!=="undefined")
    {
      if (localStorage.editor !== "" || localStorage.title !== "")
      {
        $('#title').html(localStorage.title);
        $('#editor').html(localStorage.editor);
      }
    }
    else
    {
    // Sorry! No web storage support..
    }
  }
};

Template.editor.isLoggedIn = function() {
  return (Meteor.user() !== null);
};

Template.editor.profileImage = function() {
  if (Meteor.user())
    return Meteor.user().services.twitter.profile_image_url;
};

Template.editor.events({
  'click button.minimal': function () {
    var title = $('#title').text();
    var content = $('#editor').html();
    Meteor.call("publishPost", title, content, function (data, err){
      console.log("waiting for callback");
      console.log(data);
      var author = Meteor.user().services.twitter.screenName;
      //clear localStorage
      //if they don't have it, there's nothing to be cleared because they suck
      if(typeof(Storage)!=="undefined")
      {
        localStorage.title = "";
        localStorage.editor = "";
      }
      Meteor.Router.to('/' + author + '/' + escape(title));
    });
  },

  'keyup' : function () {
    if(typeof(Storage)!=="undefined")
    {
      localStorage.title = $('#title').html();
      localStorage.editor = $('#editor').html();
    }
  }
});

Template.showPost.events({
  'click button.minimal.btnUpdate': function () {
    var id = Session.get("currentPostId");
    var content = $('#content').html();
    Meteor.call("updatePost", id, content, function (data, err){
      var author = Meteor.user().services.twitter.screenName;
      Meteor.Router.to('/' + author + '/' + escape(Session.get('currentPostTitle')));
    });
  },

  'click button.minimal.btnDelete': function () {
    var confirm = window.confirm("Are you sure you want to delete this post? This cannot be undone later.");
    if (confirm === true){
      Meteor.call("deletePost", Session.get('currentPostId'));
      Meteor.Router.to('/' + Meteor.user().services.twitter.screenName);
    }
  }
});

Template.showPost.rendered = function () {
  if (Meteor.user() !== null)
  {
    if (Meteor.user().services.twitter.screenName === Session.get('currentPostAuthor')){
      new Medium({
      element: document.getElementById('content'),
      modifier: 'auto',
      placeholder: "",
      autofocus: false,
      autoHR: true,
      mode: 'rich',
      maxLength: -1,
      modifiers: {
          66: 'bold',
          73: 'italicize',
          85: 'underline',
          86: 'paste'
      },
      tags: {
          paragraph: 'p',
          outerLevel: ['pre','blockquote', 'figure', 'hr'],
          innerLevel: ['a', 'b', 'u', 'i', 'img', 'strong']
      },
      cssClasses: {
          editor: 'Medium',
          pasteHook: 'Medium-paste-hook',
          placeholder: 'Medium-placeholder'
      }
    });
    }
  }
};

Template.showPost.isOwner = function() {
  if (Meteor.user() !== null)
  {
    return (Meteor.user().services.twitter.screenName === Session.get('currentPostAuthor'));
  }
};

Template.showPost.author = function() {
  return Session.get('currentPostAuthor');
};

Template.showPost.title = function() {
  return Session.get('currentPostTitle');
};

Template.showPost.screenName = function() {
  Session.set('currentPostScreenName', "loading...");
  Session.set('currentPostScreenName', Posts.findOne({author: escape(Session.get('currentPostAuthor')), urlsafetitle: escape(Session.get('currentPostTitle'))}).name);
  return Session.get('currentPostScreenName');
};

Template.showPost.content = function() {
  Session.set('currentPostContent', "loading...");
  Session.set('currentPostContent', Posts.findOne({author: escape(Session.get('currentPostAuthor')), urlsafetitle: escape(Session.get('currentPostTitle'))}).content);
  //we sneak the id of the post into the page, since we need it later. really has nothing to do with the author
  Session.set('currentPostId', Posts.findOne({author: escape(Session.get('currentPostAuthor')), urlsafetitle: escape(Session.get('currentPostTitle'))})._id);
  return Session.get('currentPostContent');
};

Template.authorPage.author = function () {
  return Session.get('currentAuthorPage');
};

Template.authorPage.post = function() {
  return Posts.find({author: Session.get('currentAuthorPage')}, {sort: {time: -1}});
};