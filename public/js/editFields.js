$(document).ready(function() {
    $(".edit").click(function(){

        if (this.id == 'plan_edit'){

            var plan = $("#planForm").attr('value')

            $("#editablePlan").appendTo("#attachModalBody")
            $("#attachModalBody").append('<input name="old_plan_id" id="old_plan_id" form="editPlanForm" type="hidden" value=' + plan + '>')
            $("#attachModalBody").append('<input name="fieldType" id="fieldType" form="editPlanForm" type="hidden" value=plan >')

        }

        else if (this.id == "location_edit"){

            var location = $("#location_edit").attr('value')

            $("#editableLocation").appendTo("#attachModalBody")
            $("#attachModalBody").append('<input name="old_location" id="old_location" form="editLocationForm" type="hidden" value="' + location +'">')
            $("#attachModalBody").append('<input name="fieldType" id="fieldType" form="editLocationForm" type="hidden" value=location >')

        }
        else if (this.id == "host_edit"){
            
            var host = $("#host_edit").attr('value')

            $("#editableHost").appendTo("#attachModalBody")
            $("#attachModalBody").append('<input name="old_host" id="old_host" form="editHostForm" type="hidden" value="' + host +'">')
            $("#attachModalBody").append('<input name="fieldType" id="fieldType" form="editHostForm" type="hidden" value=host >')


        }

        else if (this.id == "metadata_edit"){

            var metadata = $("#metadata_edit").attr('value')
            $("#editableMetadata").appendTo("#attachModalBody")
            $("#attachModalBody").append('<input name="old_metadata" id="old_metadata" form="editMetadataForm" type="hidden" value="' + metadata+'">')
            $("#attachModalBody").append('<input name="fieldType" id="fieldType" form="editMetadataForm" type="hidden" value=metadata >')

        }

        $("#attachmentModal").on("hidden.bs.modal", function () {

            $("#editablePlan").appendTo("#allForms")

            $("#editableLocation").appendTo("#allForms")

            $("#editableHost").appendTo("#allForms")

            $("#editableMetadata").appendTo("#allForms")
            
            $("#attachModalBody").empty()

            });

    })
})
