var app = {};
//Model
app.Demand = Backbone.Model.extend({
    defaults: {
        Did: 0,
        "chickenKind": "poulet de chair",
        "size": "gros",
        "quantity": 30,
        "publicationDate": "04-01-2017"
    },
    initialize: function() {
        this.on("delete", this.remove);
    }
});
//Collection
app.DemandCollection = Backbone.Collection.extend({
    model: app.Demand,
    url: "/service/myDemands",
    initialize: function() {}
});



//View

var i = 0;

app.DemandView = Backbone.View.extend({
    tagName: "tr",
    template: _.template($("#demand").html()),

    render: function() {
        this.$el.html("");
        var demandTemplate = this.template(this.model.toJSON());
        this.$el.html(demandTemplate);
        $(this.$el).velocity("fadeIn", {
            duration: 1000 + 700 * (i++),
            easing: "easeInBack"
        });
        return this;
    },

    initialize: function() {
        this.model.bind("sync",this.render1,this);
        // this.model.bind("fetch",this.render,this);
        // this.model.on("change",this.render,this);
        // this.listenTo(this.model,"destroy",this.remove);
    },
    destroyed:false,
    render1:function(){
        if(!this.destroyed) this.render();
    },

    events: {
        "click .delete": "DemandRemove",
        "click .edit": "DemandEdit"
    },

    DemandRemove: function(view) {
        var elem = this.$el;
        var model = this.model;
        var current=this;
        $("#apply1").unbind("click").click(function(e) {
            $(elem)
                .children('td, th')
                .velocity({
                    padding: 0
                })
                .wrapInner('<div />')
                .children()
                .velocity("slideUp", {
                    duration: 1000,
                    easing: "easeInElastic",
                    complete: function() {
                        elem.remove();
                    }
                });
            current.destroyed=true;
            model.destroy();

        });
    },
    del: function() {

    },
    refresh: function() {},

    DemandEdit: function() {
        var elem = this.$el;
        var model = this.model;
        $("#apply").unbind("click").click(function(e) {
            var obj=getData();
            if(!checkData(obj)){
                Materialize.toast($("<h6 class=\"red-text\">les champs ne sont pas Complets</h6>"),5000);
                return;
            }
            console.log(obj);
            model.save(obj,{patch:true,wait:true});
            console.log(model);
        });
    }
});



app.allDemandView = Backbone.View.extend({
    el: "#body",
    render: function() {
        this.$el.html("");
        this.collection.each(this.addDemand, this);
        return this;
    },
    addDemand: function(demand) {
        var demandView = new app.DemandView({
            "model": demand
        });
        this.$el.append(demandView.render().el);
    },
    addDemand1: function(demand) {
        var demandView = new app.DemandView({
            "model": demand
        });
        this.$el.prepend(demandView.el);
    },
    initialize: function() {
        this.collection.on('add', this.addDemand1, this);
        this.render();
    }
});

var div = "<div><div class=\"preloader-wrapper big active\">" +
    "<div class=\"spinner-layer spinner-blue\">" +
    "<div class=\"circle-clipper left\">" +
    "<div class=\"circle\"></div>" +
    "</div><div class=\"gap-patch\">" +
    "<div class=\"circle\"></div>" +
    "</div><div class=\"circle-clipper right\">" +
    "<div class=\"circle\"></div>" +
    "</div>" +
    "</div></div>";

div = $(div);
div.find(".big.active").css({
    width: "300px",
    height: "300px",
});
div.css({
    display: "inline-block",
    width: "300px",
    margin: "auto auto",

});
var divserver=$("<p>Désolé Nous avons des problèmes avec le Serveur</p>");
divserver.css({
    margin: "auto auto",
})
var collection;
var demandGroupView;

var getData=function(){
    var obj={};
    obj.quantity=$("#quantity").val();
    obj.size=$("#size").parent().find("option[value="+$("#size").val()+"]").text();
    obj.chickenKind=$("#kind").parent().find("option[value="+$("#kind").val()+"]").text();
    return obj;
}
var checkData=function(obj){
    return !(obj.quantity==""||obj.quantity==""|obj.chickenKind=="")
}
var init_demand=function(){
    collection = new app.DemandCollection();
    collection.fetch().then(function() {
        demandGroupView = new app.allDemandView({
            "collection": collection
        });
    });
    $(".modal").modal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        opacity: .5, // Opacity of modal background
        in_duration: 600, // Transition in duration
        out_duration: 200, // Transition out duration
        starting_top: '4%', // Starting top style attribute
        ending_top: '10%', // Ending top style attribute
        ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
            $(".navbar-fixed").css({"z-index":0});
            // sleep(500);
        },
        complete: function() {
            $(".navbar-fixed").css({"z-index":999});
        } // Callback for Modal close
    });
    $('select').material_select();
    $("#add").click(function(e){
        $("#apply").unbind().click(function(e){
            var obj=getData();
            if(!checkData(obj)){
                Materialize.toast($("<h6 class=\"red-text\">les champs ne sont pas Complets</h6>"),5000);
                return;
            }
            demandGroupView.collection.create(obj,{wait:true});
            console.log(obj);
        });
    });
     $('.tooltipped').tooltip({delay: 50});
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}


$(function() {
    $("#main").html(div);
    $("#main").load("/content/demand", function(response, status, xhr) {
        if (status == "success") {
            init_demand();
        }
        if (status == "error")
            $("#main").html(divserver);
    });
    $("#tabdemands").click(function(e){
        $("#main").html(div);
        $("#main").load("/content/demand", function(response, status, xhr) {
            if (status == "success") {
                init_demand();
            }
            if (status == "error")
                $("#main").html(divserver);
        });
    })
    $("#taboffers").click(function(){
      $("#main").html(div);
      $("#main").load("/content/pouletmoney",function(response,status,xhr){
          if (status == "success") {
              init_compte();
          }
          if (status == "error")
              $("#main").html(divserver);
      })
  });
    $("#tabcommands").click(function(){
      $("#main").html(div);
      $("#main").load("/content/command",function(response,status,xhr){
          if (status == "success") {
              init_command();
          }
          if (status == "error")
              $("#main").html(divserver);
      })
  });

    $(".button-collapse").sideNav();
    //css
    $(".badge").css({
     height: "40px",
     "line-height": "40px",
 });
    $(".navbar-fixed").css({"z-index":999});

});
var commandGroupview;
init_command=function(){
    commandCollection = new app.commandCollection();
    commandCollection.fetch().then(function() {
        commandGroupView = new app.allcommandView({
            "collection": commandCollection
        });
    });
    $("#modal2").modal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        opacity: .5, // Opacity of modal background
        in_duration: 600, // Transition in duration
        out_duration: 200, // Transition out duration
        starting_top: '4%', // Starting top style attribute
        ending_top: '10%', // Ending top style attribute
        ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
            $(".navbar-fixed").css({"z-index":0});
            // sleep(500);
        },
        complete: function() {
            $(".navbar-fixed").css({"z-index":999});
        } // Callback for Modal close
    });
}
var init_compte=function(){
    $.ajax({
        url:"/solde",
        type:"GET",
        success: function(data){
            $("#solde").text(data.solde+" FCFA");
            console.log(data);
        }
    })
}








//Model
app.command = Backbone.Model.extend({
    defaults: {
    },
    initialize: function() {
        this.on("delete", this.remove);
    }
});
//Collection
app.commandCollection = Backbone.Collection.extend({
    model: app.command,
    url: "/commands",
    initialize: function() {}
});



//View

var i = 0;

app.commandView = Backbone.View.extend({
    tagName: "tr",
    template: _.template($("#command").html()),

    render: function() {
        this.$el.html("");
        console.log(this.model.toJSON());
        var commandTemplate = this.template(this.model.toJSON());
        this.$el.html(commandTemplate);
        $(this.$el).velocity("fadeIn", {
            duration: 1000 + 700 * (i++),
            easing: "easeInBack"
        });
        return this;
    },

    initialize: function() {
        this.model.bind("sync",this.render1,this);
    },
    destroyed:false,
    render1:function(){
        if(!this.destroyed) this.render();
    },

    events: {
        "click .cancel": "commandRemove",
        "click .pay": "commandpay"
    },

    commandRemove: function(view) {
        var elem = this.$el;
        var model = this.model;
        var current=this;
        $("#apply2").unbind("click").click(function(e) {
            $(elem)
                .children('td, th')
                .velocity({
                    padding: 0
                })
                .wrapInner('<div />')
                .children()
                .velocity("slideUp", {
                    duration: 1000,
                    easing: "easeInElastic",
                    complete: function() {
                        elem.remove();
                    }
                });
            current.destroyed=true;
            model.destroy();

        });
    },

    commandpay: function() {
        var elem = this.$el;
        var model = this.model;
        $("#modal2 .center.flow-text").text("Voulez vous vraiment payer cette offre ?")
        $("#apply2").unbind("click").click(function(e) {
            $.ajax({
                url:"/validatecommand/"+model.id,
                type:"POST",
                dataType:"JSON",
                success:function(data){
                    console.log(data);
                    if(data.quantity==false){
                        Materialize.toast("<p>La quantité commandé n'est plus disponible</p>",3000)
                        return;
                    }
                    if(data.solde==false){
                        Materialize.toast("<p>Votre solde est insuffisant</p>",3000);
                        return;
                    }
                    elem.find("td:last-child").text("Livraison dans 10 Jours")
                    Materialize.toast("<p>Payement éffectué avec success</p>",3000);
                    console.log("payement");
                }
            })
        });
    }
});



app.allcommandView = Backbone.View.extend({
    el: "#commands",
    render: function() {
        this.$el.html("");
        this.collection.each(this.addcommand, this);
        return this;
    },
    addcommand: function(command) {
        var commandView = new app.commandView({
            "model": command
        });
        var elem=commandView.render().el
        if(command.attributes.validate=="true"){
            $(elem).find("td:last-child").html("<p>Livraison dans 10 jours</p>");
        }
        this.$el.append(elem);
    },
    addcommand1: function(command) {
        var commandView = new app.commandView({
            "model": command
        });
        this.$el.prepend(commandView.el);
    },
    initialize: function() {
        this.collection.on('add', this.addcommand1, this);
        this.render();
    }
});
