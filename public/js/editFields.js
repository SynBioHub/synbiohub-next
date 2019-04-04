$(document).ready(function() {
    $(".edit").click(function(){

        if (this.id == 'plan_edit'){

            var plan = $("#planForm").attr('value')

            $("#editablePlan").appendTo("#attachModalBody")
            $("#attachModalBody").append('<input name="old_plan_id" id="old_plan_id" form="editPlanForm" type="hidden" value=' + plan + '>')
            $("#attachModalBody").append('<input name="fieldType" id="fieldType" form="editPlanForm" type="hidden" value=plan >')

        }

        else if (this.id =="location_edit"){

            var location = $("#location_edit").attr('value')

            $("#editableLocation").appendTo("#attachModalBody")
            $("#attachModalBody").append('<input name="old_location" id="old_location" form="editLocationForm" type="hidden" value="' + location +'">')
            $("#attachModalBody").append('<input name="fieldType" id="fieldType" form="editLocationForm" type="hidden" value=location >')



        }

        $("#attachmentModal").on("hidden.bs.modal", function () {

            $("#editablePlan").appendTo("#allForms")

            $("#editableLocation").appendTo("#allForms")
            
            $("#attachModalBody").empty()

            });

    })
})
