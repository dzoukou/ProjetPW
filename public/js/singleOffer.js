$(function(){
  var offerid =$("#offer").data("id");
  $.ajax({
      type: "GET",
      url:"/offerdata/"+offerid,
      dataType: "JSON",
      success:function(data){
        construct(data);
        console.log(data);
      }
  });
  // Initialisation du sideNav
  $(".button-collapse").sideNav();
  $(".navbar-fixed").css({"z-index":9999});
});
var construct=function(data){
  for(var i=0;i<data.comments.length;i++){
    var comment=data.comments[i];
    var commentview=$("#template").clone();
    commentview.find("img").attr("src","/avatar/"+comment.userId);
    commentview.find("h6").html(comment.name+" "+comment.surname);
    commentview.find("span").text(comment.date);
    commentview.find('.comment-content').text(comment.comment);
    commentview.appendTo("#comments-list");
    commentview.show();
    console.log(commentview);
  }
  var row;
  var template=$("#prestationTemplate")
  for(var i=0;i<data.prestations.length;i++){
    if(i%3==0){
      row=$("<div class=\"row\"></div>");
      $("#prestations").append(row);
    }
    var prestation=data.prestations[i];
    var prest=template.clone();
    prest.find(".title").text(prestation.name);
    prest.find(".publicationDate").text(prestation.creationDate);
    prest.find(".infos p:first-child").text(prestation.time);
    prest.find(".infos p:last-child").text(prestation.UnitPrice);
    prest.find(".card-content-bg").css({
      "background":"url("+prestation.imageLink+")"+" no-repeat center center",
      "background-size":"100% 100%"
    }
    );
    prest.show();
    prest=prest.wrap("<div class=\"col m4 s12\"></div>");
    row.append(prest);
  }




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
      data:{
        "comment":comment,
        "offerId": data.offer.id
      },
      dataType: "JSON",
      success:function(data){
        if(data!=false)
        Materialize.toast("<h5>Commentaire envoyé avec success<h5>");
        else
        Materialize.toast("<h5>Connectez vous pour poser un commentaire <h5>",4000);
      },
      error:function(){
        Materialize.toast("<span class=\"red-text\">Problème avec le server</span>",4000)
      }
    });
  });
  $("#ask img").attr("src",data.user.avatar).css({
    "max-width":"70px",
    "margin-top": "20px"
  });
  $("#ask span").text("Uploader : "+data.user.name);
  $("#ask").submit(function(e){
    e.preventDefault();
    var question=$("#question").val();
    console.log(question,question.length);
    if(question.length<20){
      Materialize.toast("<span class=\"red-text\">Les Questions avec moins de 20 caractères ne sont pas autorisés</span>",4000);
      return;
    }
    $.ajax({
      type: "POST",
      url:"/questions",
      data:{
        "question":question,
        "offerId":data.offer.id
      },
      dataType: "JSON",
      success:function(data){
        if(data!=false)
        Materialize.toast("<h5>Question envoyé avec success<h5>");
        else
        Materialize.toast("<h5>Connectez vous pour envoyer une question <h5>",4000);
      },
      error:function(){
        Materialize.toast("<span class=\"red-text\">Problème avec le server</span>",4000)
      }
    });
  })
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
