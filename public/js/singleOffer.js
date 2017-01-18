$(function(){
  var offerid =$("#offer").data("id");
  $.ajax({
      type: "GET",
      url:"/offerdata/"+offerid,
      dataType: "JSON",
      success:function(data){
        construct(data);
      }
  });
  $(".button-collapse").sideNav();
  $(".navbar-fixed").css({"z-index":9999});
});
var construct=function(data){
  $(".imgdesc").attr("src",data.offer.imageLink);
  $("#description").text(data.offer.description);
  $("#infos").text("Les Informations supplémentaires sur l'offre N°"+data.offer.id);
  var i=0;
  var content;
  for(i=0;i<data.reductions.length;i++){
    content="<tr><td>"+data.reductions[i].quantity+"</td><td>"+data.reductions[i].rate+"</td></tr>";
    $("#reductions").find("tbody").append($(content));
  }
  $("#unitPrice").text(data.offer.unitPrice);
  $("#kind").text(data.offer.chickenKind);
  $("#size").text(data.offer.size);
  $("#quant").text(data.offer.quantity);
  $("#quantity").attr("max",data.offer.quantity);

  $("#send").on("submit",function(e){
    e.preventDefault();
    var comment=$("#comment").val();
    console.log(comment,comment.length);
    if(comment.length<20){
      Materialize.toast("<span class=\"red-text\">Les commentaires avec moins de 20 caractères ne sont pas autorisés</span>",4000);
      return;
    }
    $.ajax({
      type: "POST",
      url:"/comments",
      data:{"comment":comment},
      dataType: "JSON",
      success:function(data){
        if(data!=false)
        Materialize.toast("<h5>Message envoyé avec success<h5>");
        else
        Materialize.toast("<h5>Connectez vous pour envoyer un message <h5>",4000);
      },
      error:function(){
        Materialize.toast("<span class=\"red-text\">Problème avec le server</span>",4000)
      }
    });
  });
  $("#command").on("submit",function(e){
    e.preventDefault();
    var quantity=$("#quantity").val();
    if(quantity==""){
      Materialize.toast("<span class=\"red-text\">Vous n'avez pas choisi une quantitée<span>",4000);
      return;
    }
    if(quantity>data.offer.quantity||quantity<1){
      Materialize.toast("<span class=\"red-text\">La quantité commandée n'est pas dans la disponible<span>",4000);
      return;
    }
    console.log("ca peut marcher");
    $.ajax({
      type: "POST",
      url:"/service/commands",
      data:{
        "quantity":quantity,
        "offerId": data.offer.id
    },
      dataType: "JSON",
      success:function(data){
        if(data!=false)
        Materialize.toast("<h5>Commande éffectuée avec success\net en attente de validation<h5>",4000);
        else
        Materialize.toast("<h5>Connectez vous pour passer une commande <h5>",4000);
      },
      error:function(){
        Materialize.toast("<span class=\"red-text\">Problème avec le server</span>",4000)
      }
    });
  });
}
