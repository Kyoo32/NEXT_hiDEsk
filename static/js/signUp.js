$(function() {
    $('#btnSignUp').click(function() {
 
        $.ajax({
            url: '/signUp',
            data: $('form').serialize(),
            type: 'POST',
            success: function(response) {
                console.log(response);
                var success= "Success!"
                $('#result').text(success);
            },
            error: function(error) {
                console.log(error);
                var fail= "Input the required fields!"
                $('#result').text(fail);
            }
        });
    });
});

