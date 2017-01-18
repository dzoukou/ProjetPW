$(function(){
  $('.tooltipped').tooltip({delay: 50});
  var list=$("#list");
  for(i=0;i<11;i++){
    var obj=new Object();
    obj.id=i;
    obj.chickenKind=i%2?"Poulets de Chair":"Pondeuses";
    obj.size=i%2?"Gros":"Petit";
    obj.imageLink=i%2?"/images/poulet_de_chair.jpg":"/images/pondeuse.jpg";
    obj.quantity=(i+(i*2))*i;
    obj.unitPrice=i%2?2500:3000;
    obj.publicationDate=new Date().toDateString();
    obj.description="Je suis l'offre N°"+i;
    list.append(construct(obj));
  }
});
var construct = function(obj){
  var div1=$("<div></div>");
  div1.addClass("collapsible-header");
  var span1=$("<span></span>");
  span1.text("Offre N°"+obj.id);
  span1.css("color","green");

  var span2=$("<span></span>");
  span2.text("publié le "+obj.publicationDate+"  Type: "+obj.chickenKind+
  "  Taille : "+obj.size+"  Quantité : "+obj.quantity+"  Prix Unitaire: "+obj.unitPrice);
  div1.append("<i class=\"fa fa-send\"></i>",span1,span2);
  var div2=$("<div></div>");
  div2.addClass("collapsible-body");
  var content=" <div class=\"col s12 m7\">"+
    "<h2 class=\"header\">"+"offre N°"+obj.id+"</h2>"+
    "<div class=\"card horizontal\">"+
      "<div class=\"card-image\">"+
        "<img src=\""+obj.imageLink+"\">"+
      "</div>"+
      "<div class=\"card-stacked\">"+
        "<div class=\"card-content\">"+
          "<p class=\"flow-text\">"+obj.description+"</p>"+
        "</div>"+
        "<div class=\"card-action\">"+
          "<a href=\"/buy/"+obj.id+"\">Acheter</a>"+
        "</div>"+
      "</div>"+
    "</div>"+
  "</div>";
  div2.append(content);
  var item=$("<li></li>");
  item.append(div1,div2);
  return item;
}
