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
    className: "col m6 s12 l4",
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
        this.collection.each(this.addOffer, this);
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
        console.log(OfferView.el);
        this.presentrow.append(OfferView.el);
        this.offerIndex++;
    },
    initialize: function() {
        this.collection.on('add', this.addOffer, this);
        this.render();
    }
});

$(function() {
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
