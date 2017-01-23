$(function() {
    getprest();
    $('select').material_select();
    $("#reductions").append($("#templatereduction>div").clone().show());
    $("#reductions").on("click", ".add", function(e) {
        e.preventDefault();
        $("#reductions").append($("#templatereduction>div").clone().show());
        $(e.target).closest("button").hide();
        $(e.target).closest("button").siblings(".remove").show();
        $(e.target).closest(".row").find("[name=\"quantity\"]").prop("disabled", true);
        $(e.target).closest(".row").find("[name=\"pourcentage\"]").prop("disabled", true);
    });
    $("#reductions").on("click", ".remove", function(e) {
        e.preventDefault();
        $(e.target).closest(".row").css("background-color", "#00897b").slideUp("slow", function() {
            $(this).remove();
        });
    })
    $("form").submit(function(e) {
        e.preventDefault();
        $.ajax({
            url: "/createoffer",
            type: "POST",
            data: collect(),
            cache: false,
            contentType: false,
            processData: false,
            dataType: "JSON",
            success: function(data) {
                console.log(data);
            }
        })
    })
});
collect = function() {
    var data = {};
    var reductions = [];
    var prestations = [];
    var quantity, pourcentage;
    $("#reductions .row").each(function(index, elem) {
        quantity = $(elem).find("[name=\"quantity\"]").val();
        pourcentage = $(elem).find("[name=\"pourcentage\"]").val();
        if (quantity != "" && pourcentage != "") {
            reductions.push({
                "quantity": quantity,
                "rate": pourcentage
            });
        }
    });

    $("#prestations tr").each(function(index, elem) {
        if ($(elem).find("input").prop("checked")) {
            prestations.push($(elem).find("input").data("id"));
        }
    })
    var fd=new FormData();

    data.quantity = $("#Quantity").val();
    data.unitPrice = $("#unitPrice").val();
    data.chickenKind = $("#kind option[value=" + $("#kind").val() + "]").text();
    data.size = $("#size option[value=" + $("#size").val() + "]").text();
    data.description = $("#description").val();
    data.photo = $("[type=\"file\"]").prop("files")[0];
    data.reductions = reductions;
    data.prestations = prestations;

    fd.append('quantity',data.quantity);
    fd.append('unitPrice',data.unitPrice);
    fd.append('chickenKind',data.chickenKind);
    fd.append('size',data.size);
    fd.append('description',data.description);
    fd.append('photo',data.photo);
    fd.append('reductions',JSON.stringify(data.reductions));
    fd.append('prestations',data.prestations);
    console.log(data);
    return fd;
}

validate = function() {

}

getprest = function() {
    $.ajax({
        url: "/allprestation",
        type: "GET",
        dataType: "JSON",
        success: function(data) {
            for (var i = 0; i < data.length; i++) {
                var dataitem = data[i];
                var item = $("<tr></tr>");
                item.append("<td>" + dataitem.name + "</td>");
                item.append("<td>" + dataitem.Unitprice + "</td>");
                item.append("<td>" + dataitem.time + "</td>");
                item.append($("<td></td>").html($("#check").clone()));
                item.show();
                item.find("input").attr("id", "check" + dataitem.id)
                    .attr("data-id", dataitem.id);
                item.find("label").attr("for", "check" + dataitem.id);
                $("#prestations").find("tbody").append(item);
            }
        }
    })
}
