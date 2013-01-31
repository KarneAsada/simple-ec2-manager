;(function($){

var App = Em.Application.create({

  ApplicationController: Ember.ObjectController.extend({
    errorMessage: '',
    successMessage: '',
  }),
  ApplicationView: Ember.View.extend({
    templateName: 'application'
  }),

  InstancesController: Ember.ArrayController.extend({
  }),
  InstancesView: Ember.View.extend({
    templateName: 'instances'
  }),

  InstanceView: Ember.View.extend({
  }),

  Router: Ember.Router.extend({
    location: 'hash', 

    update: function(app, event) {

      // Send update
      var instance = Ember.get( event.context, 'name'   );
      var status   = Ember.get( event.context, 'status' );
      App.Instance.all(instance, status);

      // Set to Pending
      App.Instance.setStatus( event.context, 'pending');
    },

    root: Ember.Route.extend({
      index: Ember.Route.extend({
        route: '/',
        connectOutlets: function(router) {
          router.get('applicationController').connectOutlet('instances', App.Instance.all());
        }
      }),

      end: 'root'
    }),

    end: 'Router'
  }),

  end: 'EC2'
});

/**
 * Instance Model
 */
App.Instance = Ember.Object.extend();
App.Instance.reopenClass({
  _listOfInstances: Em.A(),
  all:  function(instance, status){

    var params = {};
    if( status && status.match(/running|stopped/) ) {
      params.action   = status == 'running' ? 'stop' : 'start';
      params.instance = instance;

      console.log(params.action+'ing '+params.instance);
    }

    var self = this;
    var allInstances = this._listOfInstances;

    $.getJSON('ajax.php', params, function(resp){
      if (resp.success) {
        allInstances.clear();

        // Set additional properties
        var pendingCount = 0;
        $.each(resp.data, function(idx, elm){
          self.setStatus( elm );
          if (elm.status.match('pending|stopping|starting')) {
            pendingCount++;
          }
        });

        if (pendingCount > 0) {
          setTimeout(function(){self.all()}, 10000);
        }

        allInstances.pushObjects( resp.data );

        // Success message
        console.log(resp.message);
        Ember.set(Ember.get(App.router, 'applicationController'), 'successMessage', resp.message);

      } else {
        // Output error message
        console.log(resp.message);
        Ember.set(Ember.get(App.router, 'applicationController'), 'errorMessage', resp.message);
      }
    });

    return allInstances;
  },

  setStatus: function(elm, status) {

    if( status !== undefined ) {
      Ember.set(elm, 'status', status);
    }

    Ember.set(elm, 'btnLabel', this.btnLabel(elm.status));
    Ember.set(elm, 'btnClass', this.btnClass(elm.status));
    Ember.set(elm, 'statusClass', this.statusClass(elm.status));
    Ember.set(elm, 'iconClass', this.iconClass(elm.status));
  },

  btnClass: function(status) {
    return status == 'running' 
            ? 'btn-success' 
            : status == 'stopped' 
              ? 'btn-danger' 
              : 'disabled'
              ;
  },//.property('status'),

  btnLabel: function(status) {
    return status == 'running' 
            ? 'Stop' 
            : status == 'stopped' 
              ? 'Start' 
              : 'Pending'
              ;
  },//.property('status'),

  statusClass: function(status) {
    //var status = this.get('status');

    var css = status.match(/running|stopped/)
            ? status
            : 'pending'
            ;
    return 'status-' + css;
  },//.property('status'),

  iconClass: function(status) {
    //var status = this.get('status');
    return status == 'running' 
            ? 'icon-off' 
            : status == 'stopped' 
              ? 'icon-play' 
              : false
              ;
  },//.property('status'),

  end: 'Instance'
});
  

App.initialize();


})(window.jQuery);


// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,clear,count,debug,dir,dirxml,error,exception,firebug,group,groupCollapsed,groupEnd,info,log,memoryProfile,memoryProfileEnd,profile,profileEnd,table,time,timeEnd,timeStamp,trace,warn".split(","),a;a=d.pop();){b[a]=b[a]||c}})((function(){try
{console.log();return window.console;}catch(err){return window.console={};}})());