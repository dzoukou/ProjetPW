$().ready(function(){
  $(".info,.address").hide();
  var step1=$(".compte")[0];
  var step2=$(".info")[0];
  var step3=$(".address")[0];
  var i=1;
  // $("form").on("submit",function(event){
  //   event.preventDefault();
  // })
  $("#tostep2").on("click",function(event){
    $(step1).hide();
    $(step2).show();
    $("#s1").toggleClass("passed");
  })
  $("#tostep3").on("click",function(event){
    $(step2).hide();
    $(step3).show();
    $("#s2").toggleClass("passed");
  })
  $("#step2back").on("click",function(event){
    $(step2).hide();
    $(step1).show();
    $("#s1").toggleClass("passed");
  })
  $("#step3back").on("click",function(event){
    $(step3).hide();
    $(step2).show();
    $("#s2").toggleClass("passed");
  })
  $("#send").on("click",function(event){

  })
});

animateNext=function(current,next){
  next.show();
  current.animate({opacity: 0}, {
		step: function(now, mx) {
			//as the opacity of current_fs reduces to 0 - stored in "now"
			//1. scale current_fs down to 80%
			scale = 1 - (1 - now) * 0.2;
			//2. bring next_fs from the right(50%)
			left = (now * 50)+"%";
			//3. increase opacity of next_fs to 1 as it moves in
			opacity = 1 - now;
			current_fs.css({
        'transform': 'scale('+scale+')',
        'position': 'absolute'
      });
			next_fs.css({'left': left, 'opacity': opacity});
		},
		duration: 800,
		complete: function(){
			current_fs.hide();
			animating = false;
		},
		//this comes from the custom easing plugin
		easing: 'easeInOutBack'
	});
}

animePrevious=function(previous,current){
  previous.show();
	//hide the current fieldset with style
	current.animate({opacity: 0}, {
		step: function(now, mx) {
			//as the opacity of current_fs reduces to 0 - stored in "now"
			//1. scale previous_fs from 80% to 100%
			scale = 0.8 + (1 - now) * 0.2;
			//2. take current_fs to the right(50%) - from 0%
			left = ((1-now) * 50)+"%";
			//3. increase opacity of previous_fs to 1 as it moves in
			opacity = 1 - now;
			current_fs.css({'left': left});
			previous_fs.css({'transform': 'scale('+scale+')', 'opacity': opacity});
		},
		duration: 800,
		complete: function(){
			current_fs.hide();
			animating = false;
		},
		//this comes from the custom easing plugin
		easing: 'easeInOutBack'
	});
}
