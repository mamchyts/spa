'use strict';

$(document).ready(function(){


    // need for show loader if ajax request too long
    window.jQueryAjaxLoaderTimeout = [];
    jQuery.ajaxSetup({
        beforeSend: function(jqXHR, settings){
            // don't check autocomplete
            if(this.url.indexOf('/messages.php?q=') !== -1)
                return 0

            window.jQueryAjaxLoaderTimeout.push(
                setTimeout(function() {
                    $('body').loader('show', { delay: 10});

                    if(window.jQueryAjaxLoaderTimeout.length > 0){
                        for(var i in window.jQueryAjaxLoaderTimeout){
                            if(window.jQueryAjaxLoaderTimeout.hasOwnProperty(i)){
                                if(window.jQueryAjaxLoaderTimeout[i] != false){
                                    return window.jQueryAjaxLoaderTimeout[i] = false;
                                }
                            }
                        }
                    }

                }, 150)
            );
        },
        complete: function(response, status){
            // don't check autocomplete
            if(this.url.indexOf('/messages.php?q=') !== -1)
                return 0

            if(window.jQueryAjaxLoaderTimeout.length > 0){
                for(var i in window.jQueryAjaxLoaderTimeout){
                    if(window.jQueryAjaxLoaderTimeout.hasOwnProperty(i)){
                        if(window.jQueryAjaxLoaderTimeout[i] != false){
                            clearInterval(window.jQueryAjaxLoaderTimeout[i]);
                            return window.jQueryAjaxLoaderTimeout[i] = false;
                        }
                    }
                }
            }

            $('body').loader('hide');
        }
    })


    // undescore themplates
    // change "<%= ... %>" to {{ ... }}
    _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g
    };


    /********** FOLDERS *************/
    var Folder = Backbone.Model.extend({
        initialize: function(){
        },
        defaults: {
            id: 0,
            name: 'Default',
            fa_class: 'fa-folder',
            active: false
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
            this.resetActive();
            this.$el.children(0).addClass('active');
        },

        resetActive: function() {
            _.each(this.container.children(), function(item){
                $(item).children(0).removeClass('active');
            });
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
        className: 'fadeBg',

        // container of all messages
        container: $('#messages'),

        template: _.template($('#message-item-template').html()),

        events: {
            "click .col-row-right" : "openEmail"
        },

        initialize: function() {
            this.model.bind('change', this.render, this);
            this.model.bind('destroy', this.remove, this);
        },

        openEmail: function() {
            window.controller.navigate('!/messages/'+window.controller.folder_id+'/'+this.model.get('id'), {trigger: true})
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





    /********** SINGLE MESSAGES *************/
    var FullMessage = Backbone.Model.extend({
        initialize: function(){
        },
        defaults: {
            id: 0,
            folder_id: 0,
            subject: 'Default subject',
            content: ''
        }
    });

    var FullMessageCoollection = Backbone.Collection.extend({
        model : FullMessage,
        url: '/messages.php'
    });

    window.full_message = new FullMessageCoollection();

    var FullMessageView = Backbone.View.extend({
        tagName: 'div',

        // container of all messages
        container: $('#messages'),

        templateBtns: _.template($('#full-message-btns-template').html()),

        templateMessage: _.template($('#full-message-item-template').html()),

        events: {
            "click .back" : "backToFolder"
        },

        initialize: function() {
            this.model.bind('change', this.render, this);
            this.model.bind('destroy', this.destroy, this);
        },

        change: function() {
            console.log("change");
        },

        destroy: function(){
            console.log("destroy");
            this.container.html('');
            return this.remove();
        },

        backToFolder: function(){
            console.log('backToFolder');
            window.controller.navigate('!/messages/'+window.controller.folder_id, {trigger: true})
        },

        render: function() {
            var j_model = this.model.toJSON();

            // delete old messages from html
            if(!('id' in j_model)){
                return this.destroy();
            }
            var div1 = document.createElement('div');
            var div2 = document.createElement('div');
            div2.className = 'fadeBg'

            $(div1).html(this.templateBtns());
            $(div2).html(this.templateMessage(j_model));

            this.$el.append(div1, div2);

            this.container.append(this.$el);
            return this;
        }
    });
    /********** SINGLE MESSAGES *************/




    var Controller = Backbone.Router.extend({
        routes: {
            "": "init", // Пустой hash-тэг
            "!/": "init", // Начальная страница
            "!/messages": "messages",
            "!/messages/:folder": "messages",
            "!/messages/:folder/:id": "email",
            "*default": "defaultRoute"
        },

        is_started: false,

        // current folder id
        folder_id: 0,

        // current message id
        message_id: 0,

        init: function () {
            // get all folders
            this.getFolders();

            // get all messages
            this.getMessages();

            window.controller.is_started = true;
        },

        getFolders: function (callback) {
            var self = this;

            // get all folders
            window.folders.fetch({success: function(collection, response, options){
                // render folders
                _.each(collection.models, function(item){
                    // set active folder
                    if(item.id == self.folder_id)
                        item.set('active', true);

                    new FolderView({model: item}).render()
                });

                if(callback)
                    callback();
            }});
        },

        getMessages: function (folder) {
            this.folder_id = parseInt(folder) || 0

            // delete old data
            if(window.messages.models.length){
                this.clearCollection(window.messages)
            }
            if(this.message_id != 0){
                this.clearCollection(window.full_message)
            }

            // get messages from folders
            window.messages.fetch({
                data: {
                    'folder_id': this.folder_id
                },
                success: function(collection, response, options){
                    // render folders
                    _.each(collection.models, function(item){
                        new MessageView({model: item}).render();
                    });

                    $('#messages').sortable({
                        axis: 'y',
                        distance: 10,
                        handle: ".col-row-left",
                        opacity: 0.9,
                        containment: $('#main-container'),
                        stop: function(e, ui){
                            console.log(e, ui);
                        }
                    });
                }
            });
        },

        messages: function (folder) {
            if(!this.is_started){
                // get all folders
                this.getFolders();
                window.controller.is_started = true;
            }

            this.getMessages(folder);
        },

        email: function (folder, id) {
            if(!this.is_started){
                // get all folders
                this.getFolders();
                window.controller.is_started = true;
            }

            // delete old data
            if(window.messages.models.length){
                this.clearCollection(window.messages)
            }
            if(this.message_id != 0){
                this.clearCollection(window.full_message)
            }

            this.message_id = id

            // get messages from folders
            window.full_message.fetch({
                data: {
                    'message_id': this.message_id
                },
                success: function(collection, response, options){
                    // render full message view
                    _.each(collection.models, function(item){
                        new FullMessageView({model: item}).render()
                    });
                }
            });
        },

        clearCollection: function (collection) {
            if(collection.models){
                _.each(collection.models, function(item){
                    item.clear();
                });
            }
        },

        defaultRoute: function () {
            window.controller.navigate('!/messages', {trigger: true});
        }
    });

    window.controller = new Controller(); // Создаём контроллер

    Backbone.history.start();  // Запускаем HTML5 History push



    // autocomplete
    $('#search-input').autocomplete({
        type: 'GET',
        width: '400px',
        paramName: 'q',
        serviceUrl: '/messages.php',
        onSelect: function(suggestion){
            window.controller.folder_id = 0;
            window.controller.navigate('!/messages/'+window.controller.folder_id+'/'+suggestion.data, {trigger: true});
            $(this).val('');
        }
    });


});
