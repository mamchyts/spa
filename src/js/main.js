'use strict';

$(document).ready(function(){

    /********** FOLDERS *************/
    var Folder = Backbone.Model.extend({
        initialize: function(){
        },
        defaults: {
            id: 0,
            name: 'Default',
            fa_class: 'fa-folder'
        }
    });

    var FolderCoollection = Backbone.Collection.extend({
        model : Folder,
        url: '/folders.php'
    });

    window.folders = new FolderCoollection();

    var FolderView = Backbone.View.extend({
        tagName: 'div',

        // container of all folders
        container: $('#folders'),

        template: _.template($('#folder-item-template').html()),

        events: {
            "click .col-sm-12" : "toggleClick",
        },

        initialize: function() {
            this.model.bind('change', this.render, this);
            this.model.bind('destroy', this.remove, this);
        },

        toggleClick: function() {
            console.log("toggleClick", this.model.toJSON());
        },

        change: function() {
            console.log("change");
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.container.append(this.$el);
            return this;
        }
    });
    /********** FOLDERS *************/





    /********** MESSAGES *************/
    var Message = Backbone.Model.extend({
        initialize: function(){
        },
        defaults: {
            id: 0,
            folder_id: 0,
            subject: 'Default subject',
            content: ''
        }
    });

    var MessageCoollection = Backbone.Collection.extend({
        model : Message,
        url: '/messages.php'
    });

    window.messages = new MessageCoollection();

    var MessageView = Backbone.View.extend({
        tagName: 'div',

        // container of all messages
        container: $('#messages'),

        template: _.template($('#message-item-template').html()),

        events: {
            "click .col-sm-12" : "toggleClick",
        },

        initialize: function() {
            this.model.bind('change', this.render, this);
            this.model.bind('destroy', this.remove, this);
        },

        toggleClick: function() {
            console.log("toggleClick", this.model.toJSON());
        },

        change: function() {
            console.log("change");
        },

        render: function() {
            var j_model = this.model.toJSON();

            // delete old messages from html
            if(!('id' in j_model)){
                return this.remove();
            }


            this.$el.html(this.template(j_model));
            this.container.append(this.$el);
            return this;
        }
    });
    /********** MESSAGES *************/





    var Controller = Backbone.Router.extend({
        routes: {
            "": "start", // Пустой hash-тэг
            "!/": "start", // Начальная страница
            "!/messages": "messages",
            "!/messages/:folder": "messages",
            "!/messages/:folder/:id": "email"
        },

        isStarted: false,

        start: function (callback) {
            // get all folders
            window.folders.fetch({success: function(collection, response, options){
                // render folders
                _.each(collection.models, function(item){
                    new FolderView({model: item}).render()
                });

                window.controller.isStarted = true;

                if(callback)
                    callback();
            }});
        },

        messages: function (folder) {
            if(!this.isStarted){
                // get folders and run againe
                return this.start(function(){
                    window.controller.messages(folder)
                });
            }

            folder = parseInt(folder) || 0

            // delete old data
            if(window.messages.models.length){
                this.clearMessages(window.messages)
            }

            // get messages from folders
            window.messages.fetch({
                data: {
                    'folder_id': folder
                },
                success: function(collection, response, options){
                    // render folders
                    _.each(collection.models, function(item){
                        new MessageView({model: item}).render()
                    });
                }
            });
        },

        email: function (folder, id) {
            console.log("email", folder, id);
        },

        clearMessages: function (collection) {
            _.each(collection.models, function(item){
                item.clear();
            });
        },

        error: function () {
            console.log("error");
        }
    });

    window.controller = new Controller(); // Создаём контроллер

    Backbone.history.start();  // Запускаем HTML5 History push
});
