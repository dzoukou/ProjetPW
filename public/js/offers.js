var app = {};
//Model
app.Offer = Backbone.Model.extend({
    defaults: {},
    initialize: function() {
        this.on("delete", this.remove);
    }
});
//Collection
app.OfferCollection = Backbone.Collection.extend({
    model: app.Offer,
    url: "/allOffers",
    initialize: function() {}
});



//View

var i = 0;

app.OfferView = Backbone.View.extend({
    tagName: "div",
    className: "col m12 s12 l4",
    template: _.template($("#offer").html()),

    render: function() {
        this.$el.html("");
        var OfferTemplate = this.template(this.model.toJSON());
        this.$el.html(OfferTemplate);
        $(this.$el).velocity("fadeIn", {
            duration: 500 * (i++),
            easing: "easeInBack"
        });
        console.log("Render reussie")
        return this;
    },

    initialize: function() {
        this.render();
    }
});



app.allOffersView = Backbone.View.extend({
    el: "#offers",
    render: function() {
        this.$el.html("");
        console.log(this.collection);
        if(this.collection.length==0){
            this.$el.html("<p class=\"flow-text center\">Aucun résultat trouvé</p>");
        }
        this.collection.each(this.addOffer, this);
        i=0;
        return this;
    },
    offerIndex: 0,
    presentrow: {},
    addOffer: function(offer) {
        var OfferView = new app.OfferView({
            "model": offer
        });
        if (this.offerIndex % 3 == 0) {
            this.presentrow = $("<div class=\"row\"><div>");
            this.$el.append(this.presentrow);
        }
        this.presentrow.append(OfferView.el);
        this.offerIndex++;
    },
    initialize: function() {
        this.collection.on('add', this.addOffer, this);
        this.collection.on("sort", this.rendersort, this);
        this.render();
    },
    rendersort: function() {
        this.offerIndex = 0;
        this.render();
    }
});

$(function() {
    OfferGroupView = {};
    collection = new app.OfferCollection();
    collection.fetch().then(function() {
        OfferGroupView = new app.allOffersView({
            "collection": collection
        });
    });
    $('a[href="#search"]').on('click', function(event) {
        $('#search').addClass('open');
        $('#search > form > input[type="search"]').focus();
    });
    $('#search .close').on('click', function(event) {
        $("#search").removeClass('open');
    });
    $('select').material_select();
    var sliderp = document.getElementById('sliderp');
    var sliderq = document.getElementById('sliderq');
    $(sliderp).ionRangeSlider({
        type: "double",
        grid: true,
        min: 400,
        max: 10000,
        from: 400,
        to: 10000,
        postfix: "F"
    });
    $(sliderq).ionRangeSlider({
        type: "double",
        grid: true,
        min: 1,
        max: 300,
        from: 1,
        to: 300
    });
    $("#byquantity").click(function(e) {
        OfferGroupView.collection.comparator = "quantity";
        OfferGroupView.collection.sort();
    })
    $("#byprice").click(function(e) {
        OfferGroupView.collection.comparator = "unitPrice";
        OfferGroupView.collection.sort();
    })
    $("#searchform").on("submit", function(e) {
        e.preventDefault();
        console.log("submit");
        var value = $(this).find("input").val();
        OfferGroupView = new app.allOffersView({
            "collection": new app.OfferCollection(
                collection.filter(function(offer) {
                    return _.some(offer.attributes, function(val, attr) {
                        console.log(val);
                        return (val + "").search(value) >= 0
                    })
                })
            )
        });
    });

    $("#finalize").on("submit",function(e){
        e.preventDefault();
        var rangeprice=$("#sliderp").val().split(";")
        var rangequantity=$("#sliderq").val().split(";")
        var kind=[];
        if($("#pouletc").prop("checked")){
            kind.push("poulet de chair");
        }
        if($("#pouletv").prop("checked")){
            kind.push("poulet du village");
        }
        if($("#pondeuse").prop("checked")){
            kind.push("pondeuse");
        }
        var size=[];
        if($("#petit").prop("checked")){
            size.push("petit");
        }
        if($("#moyen").prop("checked")){
            size.push("moyen");
        }
        if($("#gros").prop("checked")){
            size.push("gros");
        }
        if($("#tgros").prop("checked")){
            size.push("très gros");
        }
        isequal=function(e){

        }
        OfferGroupView = new app.allOffersView({
            "collection": new app.OfferCollection(
                collection.filter(function(offer) {
                    return _.every(offer.attributes, function(val, attr) {
                        switch(attr){
                            case "chickenKind" :
                                if(_.contains(kind,val.toLowerCase())) return true;
                                break;
                            case "size":
                                if(_.contains(size,val.toLowerCase())) return true;
                                break;
                            case "quantity":
                                 if((val<=rangequantity[1])&&(val>=rangequantity[0])) return true;
                                 break;
                            case "unitPrice":
                                 if((val<=rangeprice[1])&&(val>=rangeprice[0])) return true;
                                 break;
                            default: return true; break;
                        }
                        return false;
                    })
                })
            )
        });
        $("#search").removeClass("open");

    })
    // noUiSlider.create(sliderp, {
    //     start: [500, 10000],
    //     connect: true,
    //     step: 1,
    //     range: {
    //         'min': 500,
    //         'max': 10000
    //     }
    // });
    // noUiSlider.create(sliderq, {
    //     start: [10, 50],
    //     connect: true,
    //     step: 1,
    //     range: {
    //         'min': 1,
    //         'max': 300
    //     }
    // });

})
