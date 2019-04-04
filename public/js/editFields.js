$(document).ready(function() {
    $(".edit").click(function(){

        if (this.id == 'plan_edit'){

            var plan = $("#planForm").attr('value')
            
            $("#editablePlan").appendTo("#attachModalBody")
            $("#attachModalBody").append('<input name="old_plan_id" id="old_plan_id" form="constructForm" type="hidden" value=' + plan + '>')
            $("#attachModalBody").append('<input name="fieldType" id="fieldType" form="constructForm" type="hidden" value=plan >')

        }

        $("#attachmentModal").on("hidden.bs.modal", function () {

            $("#editablePlan").appendTo("#allForms")
            $("#attachModalBody").empty()

            });

    })
})
