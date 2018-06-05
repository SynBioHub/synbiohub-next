
$('.sbh-autocomplete').typeahead({
    hint: false,
    highlight: true,
    minLength: 1

}, {
    name: 'my-dataset',
    source: function(query, syncResults, asyncResults) {

        $.getJSON('/autocomplete/' + query, function(res) {

            asyncResults(res.map((r) => r.name))

        })


    }

})

$('.organism-autocomplete').typeahead({
    hint: false,
    highlight: true,
    minLength: 1,
    limit: 2,
  },
  {
    name: 'organisms',
    source: function findMatches(query, syncResults, asyncResults) {

        $.getJSON('/organisms/' + query, function(data) {
            
            console.log(data)
            
            syncResults(data);

        })

        .success(function(data) {
            
            asyncResults(data); 
            
       
        })



        }
      
  });


$('.twitter-typeahead').css('display', 'inline')

